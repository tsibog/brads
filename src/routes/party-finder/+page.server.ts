import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { users, userAvailability, userGamePreferences, boardGames, systemSettings } from '$lib/server/db/schema';
import { eq, and, desc, inArray, gte } from 'drizzle-orm';

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

	// Get system settings for inactive user threshold
	const inactiveThresholdSetting = await db
		.select()
		.from(systemSettings)
		.where(eq(systemSettings.key, 'party_finder_inactive_days'));

	const inactiveDays = inactiveThresholdSetting.length > 0 
		? parseInt(inactiveThresholdSetting[0].value) 
		: 14;

	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - inactiveDays);

	// Get active players (excluding current user)
	const activePlayers = await db
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

	// Filter out current user
	const filteredPlayers = activePlayers.filter(player => player.id !== userId);

	// Get availability for active players
	const playerIds = filteredPlayers.map(p => p.id);
	let playersAvailability: any[] = [];
	let playersGamePreferences: any[] = [];

	if (playerIds.length > 0) {
		playersAvailability = await db
			.select()
			.from(userAvailability)
			.where(inArray(userAvailability.userId, playerIds));

		playersGamePreferences = await db
			.select({
				userId: userGamePreferences.userId,
				gameBggId: userGamePreferences.gameBggId,
				name: boardGames.name
			})
			.from(userGamePreferences)
			.innerJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
			.where(inArray(userGamePreferences.userId, playerIds));
	}

	// Combine player data with their availability and game preferences
	const playersWithDetails = filteredPlayers.map(player => ({
		...player,
		availability: playersAvailability.filter(a => a.userId === player.id),
		gamePreferences: playersGamePreferences.filter(g => g.userId === player.id)
	}));

	return {
		currentUser: locals.user,
		userAvailability: userAvailabilityData,
		userGamePreferences: userGamePreferencesData,
		activePlayers: playersWithDetails
	};
};