import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, userAvailability, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { partyFinder } from '$lib/flags';
import { loadPlayerData } from '$lib/server/partyFinderUtils';

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!(await partyFinder())) {
		error(404, 'Not found');
	}
	if (!locals.user) {
		redirect(302, '/login');
	}

	const userId = locals.user.id;
	const currentUserData = await loadPlayerData(userId);

	// Build API URL for paginated players with current filters
	const page = url.searchParams.get('page') || '1';
	const sortBy = url.searchParams.get('sortBy') || 'compatibility';
	const sortOrder = url.searchParams.get('sortOrder') || 'desc';
	const experienceFilter = url.searchParams.get('experience') || 'all';
	const playStyleFilter = url.searchParams.get('playStyle') || 'all';
	const dayFilter = url.searchParams.get('availability_day') || 'all';
	const gameFilter = url.searchParams.get('game_preference') || 'all';

	const apiUrl = new URL('/api/party-finder/players', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', '20');
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);
	if (experienceFilter !== 'all') apiUrl.searchParams.set('experience', experienceFilter);
	if (playStyleFilter !== 'all') apiUrl.searchParams.set('playStyle', playStyleFilter);
	if (dayFilter !== 'all') apiUrl.searchParams.set('availability_day', dayFilter);
	if (gameFilter !== 'all') apiUrl.searchParams.set('game_preference', gameFilter);

	let paginatedPlayers;
	try {
		const res = await fetch(apiUrl);
		paginatedPlayers = res.ok
			? await res.json()
			: { data: [], meta: { totalCount: 0, page: 1, limit: 20, totalPages: 0, averageCompatibility: 0 } };
	} catch {
		paginatedPlayers = { data: [], meta: { totalCount: 0, page: 1, limit: 20, totalPages: 0, averageCompatibility: 0 } };
	}

	// Collect unique games from player data for filter dropdown
	const availableGames = new Map<string, string>();
	paginatedPlayers.data?.forEach((player: any) => {
		player.gamePreferences?.forEach((g: any) => {
			availableGames.set(g.gameBggId, g.name);
		});
	});

	return {
		currentUser: {
			...locals.user,
			availability: currentUserData.availability,
			gamePreferences: currentUserData.gamePreferences
		},
		paginatedPlayers,
		availableGames: Array.from(availableGames.entries()).map(([id, name]) => ({ id, name })),
		currentFilters: {
			experience: experienceFilter,
			playStyle: playStyleFilter,
			day: dayFilter,
			game: gameFilter,
			page: parseInt(page),
			sortBy,
			sortOrder
		}
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const lookingForParty = formData.get('looking_for_party') === 'on';
		const openToAnyGame = formData.get('open_to_any_game') === 'on';
		const selectedDaysJson = formData.get('selected_days');
		const selectedGamesJson = formData.get('selected_games');

		let selectedDays: number[] = [];
		let selectedGames: string[] = [];

		try {
			if (selectedDaysJson && typeof selectedDaysJson === 'string') {
				selectedDays = JSON.parse(selectedDaysJson);
			}
		} catch {
			return fail(400, { message: 'Invalid availability data' });
		}

		try {
			if (selectedGamesJson && typeof selectedGamesJson === 'string') {
				selectedGames = JSON.parse(selectedGamesJson);
			}
		} catch {
			return fail(400, { message: 'Invalid game preferences data' });
		}

		try {
			const userId = locals.user.id;
			const partyStatus = lookingForParty ? 'active' : (locals.user.party_status || 'resting');

			await db
				.update(users)
				.set({
					looking_for_party: lookingForParty,
					open_to_any_game: openToAnyGame,
					party_status: partyStatus,
					updated_at: new Date()
				})
				.where(eq(users.id, userId));

			// Update availability
			await db.delete(userAvailability).where(eq(userAvailability.userId, userId));
			if (selectedDays.length > 0) {
				await db.insert(userAvailability).values(
					selectedDays.map((dayOfWeek) => ({ userId, dayOfWeek }))
				);
			}

			// Update game preferences
			await db.delete(userGamePreferences).where(eq(userGamePreferences.userId, userId));
			if (selectedGames.length > 0) {
				await db.insert(userGamePreferences).values(
					selectedGames.map((gameBggId) => ({ userId, gameBggId }))
				);
			}

			return { success: true, message: 'Party finder settings updated!' };
		} catch (error) {
			console.error('Party finder settings update error:', error);
			return fail(500, { message: 'An error occurred while updating your settings' });
		}
	}
};
