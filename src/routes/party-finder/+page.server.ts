import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { users, userAvailability, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, and, inArray, gte } from 'drizzle-orm';
import { getCache, setCache, getInactiveDaysThreshold } from '$lib/server/partyFinderUtils.js';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		throw redirect(302, '/login');
	}

	const userId = locals.user.id;

	// Get current user's availability
	const userAvailabilityData = await db
		.select()
		.from(userAvailability)
		.where(eq(userAvailability.userId, userId));

	// Get current user's game preferences with game details
	const userGamePreferencesData = await db
		.select({
			id: userGamePreferences.id,
			gameBggId: userGamePreferences.gameBggId,
			name: boardGames.name,
			thumbnail: boardGames.thumbnail,
			minPlayers: boardGames.minPlayers,
			maxPlayers: boardGames.maxPlayers,
			playingTime: boardGames.playingTime
		})
		.from(userGamePreferences)
		.innerJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
		.where(eq(userGamePreferences.userId, userId));

	// Get system settings for inactive user threshold (cached)
	const inactiveDays = await getInactiveDaysThreshold();
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

	// Get active players (cached for 5 minutes)
	const cacheKey = `party_finder_players_${cutoffDate.getTime()}`;
	let activePlayers = getCache(cacheKey);

	if (!activePlayers) {
		activePlayers = await db
			.select({
				id: users.id,
				displayName: users.display_name,
				username: users.username,
				bio: users.bio,
				experienceLevel: users.experience_level,
				vibePreference: users.vibe_preference,
				lookingForParty: users.looking_for_party,
				partyStatus: users.party_status,
				openToAnyGame: users.open_to_any_game,
				contactVisibleTo: users.contact_visible_to,
				contactEmail: users.contact_email,
				contactPhone: users.contact_phone,
				lastLogin: users.last_login
			})
			.from(users)
			.where(
				and(
					eq(users.looking_for_party, true),
					eq(users.party_status, 'active'),
					gte(users.last_login, cutoffDate)
				)
			);

		setCache(cacheKey, activePlayers, 5); // Cache for 5 minutes
	}

	// Filter out current user
	const filteredPlayers = activePlayers.filter((player: any) => player.id !== userId);

	// Get availability and game preferences for active players (cached)
	const playerIds = filteredPlayers.map((p: any) => p.id);
	let playersAvailability: any[] = [];
	let playersGamePreferences: any[] = [];

	if (playerIds.length > 0) {
		const availabilityCacheKey = `player_availability_${playerIds.sort().join('_')}`;
		const preferencesCacheKey = `player_preferences_${playerIds.sort().join('_')}`;

		playersAvailability = getCache(availabilityCacheKey);
		if (!playersAvailability) {
			playersAvailability = await db
				.select()
				.from(userAvailability)
				.where(inArray(userAvailability.userId, playerIds));
			setCache(availabilityCacheKey, playersAvailability, 10); // Cache for 10 minutes
		}

		playersGamePreferences = getCache(preferencesCacheKey);
		if (!playersGamePreferences) {
			playersGamePreferences = await db
				.select({
					userId: userGamePreferences.userId,
					gameBggId: userGamePreferences.gameBggId,
					name: boardGames.name,
					thumbnail: boardGames.thumbnail,
					image: boardGames.image
				})
				.from(userGamePreferences)
				.innerJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
				.where(inArray(userGamePreferences.userId, playerIds));
			setCache(preferencesCacheKey, playersGamePreferences, 10); // Cache for 10 minutes
		}
	}

	// Combine player data with their availability and game preferences
	const playersWithDetails = filteredPlayers.map((player: any) => ({
		...player,
		availability: playersAvailability.filter((a) => a.userId === player.id),
		gamePreferences: playersGamePreferences.filter((g) => g.userId === player.id)
	}));

	return {
		currentUser: locals.user,
		userAvailability: userAvailabilityData,
		userGamePreferences: userGamePreferencesData,
		activePlayers: playersWithDetails
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

		// Parse selected days
		try {
			if (selectedDaysJson && typeof selectedDaysJson === 'string') {
				selectedDays = JSON.parse(selectedDaysJson);
			}
		} catch (error) {
			return fail(400, { message: 'Invalid availability data' });
		}

		// Parse selected games
		try {
			if (selectedGamesJson && typeof selectedGamesJson === 'string') {
				selectedGames = JSON.parse(selectedGamesJson);
			}
		} catch (error) {
			return fail(400, { message: 'Invalid game preferences data' });
		}

		try {
			// Start transaction-like updates
			const userId = locals.user.id;

			// 1. Update user table with party status
			await db
				.update(users)
				.set({
					looking_for_party: lookingForParty,
					open_to_any_game: openToAnyGame,
					updated_at: new Date()
				})
				.where(eq(users.id, userId));

			// 2. Update availability - delete old and insert new
			await db.delete(userAvailability).where(eq(userAvailability.userId, userId));

			if (selectedDays.length > 0) {
				const availabilityData = selectedDays.map((dayOfWeek) => ({
					userId,
					dayOfWeek,
					timeSlotStart: null,
					timeSlotEnd: null
				}));
				await db.insert(userAvailability).values(availabilityData);
			}

			// 3. Update game preferences - delete old and insert new
			await db.delete(userGamePreferences).where(eq(userGamePreferences.userId, userId));

			if (selectedGames.length > 0) {
				const gamePreferenceData = selectedGames.map((gameBggId) => ({
					userId,
					gameBggId
				}));
				await db.insert(userGamePreferences).values(gamePreferenceData);
			}

			return { success: true, message: 'All party finder settings updated successfully!' };
		} catch (error) {
			console.error('Party finder settings update error:', error);
			return fail(500, {
				message: 'An error occurred while updating your settings'
			});
		}
	}
};
