import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
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
					name: boardGames.name
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
