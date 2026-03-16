import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import { partyFinder } from '$lib/flags';
import {
	loadPlayerData,
	loadAllPlayerData,
	getPaginatedPlayersWithCompatibility,
	getSharedPlayCounts,
	updateUserAvailability,
	updateUserGamePreferences,
	type PlayerForCompatibility
} from '$lib/server/partyFinderUtils';

export const load: PageServerLoad = async ({ locals, url }) => {
	if (!(await partyFinder())) {
		error(404, 'Not found');
	}
	if (!locals.user) {
		redirect(302, '/login');
	}

	const userId = locals.user.id;
	const currentUserData = await loadPlayerData(userId);

	// Parse filters from URL
	const page = parseInt(url.searchParams.get('page') || '1');
	const sortBy = url.searchParams.get('sortBy') || 'compatibility';
	const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
	const experienceFilter = url.searchParams.get('experience') || 'all';
	const playStyleFilter = url.searchParams.get('playStyle') || 'all';
	const dayFilter = url.searchParams.get('availability_day') || 'all';
	const gameFilter = url.searchParams.get('game_preference') || 'all';

	// Query active players directly (no internal fetch)
	const activeUsers = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.display_name,
			bio: users.bio,
			experienceLevel: users.experience_level,
			playStyle: users.play_style,
			lookingForParty: users.looking_for_party,
			partyStatus: users.party_status,
			openToAnyGame: users.open_to_any_game,
			contactMethod: users.contact_method,
			contactValue: users.contact_value,
			contactVisibleTo: users.contact_visible_to,
			lastLogin: users.last_login
		})
		.from(users)
		.where(and(eq(users.looking_for_party, true), eq(users.party_status, 'active')));

	// Batch-load availability and game preferences
	const allUserIds = activeUsers.map((u) => u.id);
	const allPlayerData = await loadAllPlayerData(allUserIds);

	const allPlayers: PlayerForCompatibility[] = activeUsers.map((u) => {
		const data = allPlayerData.get(u.id) ?? { availability: [], gamePreferences: [] };
		return {
			id: u.id,
			username: u.username,
			displayName: u.displayName,
			bio: u.bio,
			experienceLevel: u.experienceLevel,
			playStyle: u.playStyle,
			lookingForParty: u.lookingForParty ?? false,
			partyStatus: u.partyStatus ?? 'resting',
			openToAnyGame: u.openToAnyGame ?? false,
			contactMethod: u.contactMethod,
			contactValue: u.contactValue,
			contactVisibleTo: u.contactVisibleTo,
			lastLogin: u.lastLogin,
			availability: data.availability,
			gamePreferences: data.gamePreferences
		};
	});

	const currentUser = {
		id: locals.user.id,
		experienceLevel: locals.user.experience_level,
		playStyle: locals.user.play_style,
		openToAnyGame: locals.user.open_to_any_game ?? false,
		lookingForParty: locals.user.looking_for_party ?? false,
		partyStatus: locals.user.party_status ?? 'resting'
	};

	const result = await getPaginatedPlayersWithCompatibility({
		currentUser,
		currentUserAvailability: currentUserData.availability.map((a) => a.dayOfWeek),
		currentUserGamePreferences: currentUserData.gamePreferences.map((g) => g.gameBggId),
		allPlayers,
		page,
		limit: 20,
		sortBy,
		sortOrder,
		filters: {
			experience: experienceFilter !== 'all' ? experienceFilter : undefined,
			playStyle: playStyleFilter !== 'all' ? playStyleFilter : undefined,
			availability_day: dayFilter !== 'all' ? dayFilter : undefined,
			game_preference: gameFilter !== 'all' ? gameFilter : undefined
		}
	});

	// Get shared play counts for the paginated players
	const playerIds = result.data.map((p) => p.id);
	const sharedCounts = await getSharedPlayCounts(locals.user.id, playerIds);

	const paginatedPlayers = {
		data: result.data.map((player) => {
			const sharedPlayCount = sharedCounts.get(player.id) ?? 0;

			// Server-side contact privacy enforcement
			let contactMethod = player.contactMethod;
			let contactValue = player.contactValue;
			if (player.contactVisibleTo === 'none') {
				contactMethod = null;
				contactValue = null;
			} else if (player.contactVisibleTo === 'matches') {
				if ((player.compatibilityScore ?? 0) < 50) {
					contactMethod = null;
					contactValue = null;
				}
			}

			const { contactVisibleTo, ...rest } = player;
			return { ...rest, contactMethod, contactValue, sharedPlayCount };
		}),
		meta: result.meta
	};

	// Load all games selected by active party finder users (for filter dropdown)
	const allActiveGames = await db
		.selectDistinct({
			id: userGamePreferences.gameBggId,
			name: boardGames.name
		})
		.from(userGamePreferences)
		.innerJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
		.innerJoin(users, eq(userGamePreferences.userId, users.id))
		.where(and(eq(users.looking_for_party, true), eq(users.party_status, 'active')));

	return {
		currentUser: {
			...locals.user,
			availability: currentUserData.availability,
			gamePreferences: currentUserData.gamePreferences
		},
		paginatedPlayers,
		availableGames: allActiveGames.map((g) => ({ id: g.id, name: g.name ?? 'Unknown' })),
		currentFilters: {
			experience: experienceFilter,
			playStyle: playStyleFilter,
			day: dayFilter,
			game: gameFilter,
			page,
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

			await updateUserAvailability(userId, selectedDays);
			await updateUserGamePreferences(userId, selectedGames);

			return { success: true, message: 'Party finder settings updated!' };
		} catch (error) {
			console.error('Party finder settings update error:', error);
			return fail(500, { message: 'An error occurred while updating your settings' });
		}
	}
};
