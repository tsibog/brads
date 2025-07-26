import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, userAvailability, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, and, inArray, gte } from 'drizzle-orm';
import {
	getCache,
	setCache,
	getInactiveDaysThreshold,
	getPaginatedPlayersWithCompatibility,
	type PlayerForCompatibility,
	type CurrentUserForCompatibility
} from '$lib/server/partyFinderUtils.js';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Not authenticated' }, { status: 401 });
	}

	const currentUser = locals.user;

	// Parse URL parameters
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const sortBy = url.searchParams.get('sortBy') || 'compatibility';
	const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';

	// Filter parameters
	const filters = {
		experience: url.searchParams.get('experience') || undefined,
		vibe: url.searchParams.get('vibe') || undefined,
		availability_day: url.searchParams.get('availability_day') || undefined,
		game_preference: url.searchParams.get('game_preference') || undefined
	};

	try {
		// Get current user's availability
		const userAvailabilityData = await db
			.select()
			.from(userAvailability)
			.where(eq(userAvailability.userId, currentUser.id));

		// Get current user's game preferences
		const userGamePreferencesData = await db
			.select({ gameBggId: userGamePreferences.gameBggId })
			.from(userGamePreferences)
			.where(eq(userGamePreferences.userId, currentUser.id));

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
					contactMethod: users.contact_method,
					contactValue: users.contact_value,
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

		// Get availability and game preferences for active players (cached)
		const playerIds = activePlayers.map((p: any) => p.id);
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
		const playersWithDetails: PlayerForCompatibility[] = activePlayers.map((player: any) => ({
			...player,
			availability: playersAvailability.filter((a) => a.userId === player.id),
			gamePreferences: playersGamePreferences.filter((g) => g.userId === player.id)
		}));

		// Prepare current user data for compatibility calculation
		const currentUserForCompatibility: CurrentUserForCompatibility = {
			id: currentUser.id,
			experienceLevel: currentUser.experienceLevel,
			vibePreference: currentUser.vibePreference,
			openToAnyGame: currentUser.openToAnyGame ?? false,
			lookingForParty: currentUser.lookingForParty ?? false,
			partyStatus: currentUser.partyStatus ?? 'resting'
		};

		const currentUserAvailabilityDays = userAvailabilityData.map((a) => a.dayOfWeek);
		const currentUserGameIds = userGamePreferencesData.map((g) => g.gameBggId);

		// Get paginated players with compatibility scores
		const result = await getPaginatedPlayersWithCompatibility({
			currentUser: currentUserForCompatibility,
			currentUserAvailability: currentUserAvailabilityDays,
			currentUserGamePreferences: currentUserGameIds,
			allPlayers: playersWithDetails,
			page,
			limit,
			sortBy,
			sortOrder,
			filters
		});

		return json(result);
	} catch (error) {
		console.error('Error fetching paginated players:', error);
		return json({ error: 'Internal server error' }, { status: 500 });
	}
};
