import { db } from './db';
import {
	users,
	systemSettings,
	userAvailability,
	userGamePreferences,
	playParticipants,
	gamePlays,
	boardGames
} from './db/schema.js';
import { eq, and, lt, sql, inArray } from 'drizzle-orm';
import { VALID_DAYS } from '$lib/partyFinderConstants';

/**
 * Get the configured number of days before users are considered inactive
 */
export async function getInactiveDaysThreshold(): Promise<number> {
	try {
		const setting = await db
			.select()
			.from(systemSettings)
			.where(eq(systemSettings.key, 'party_finder_inactive_days'))
			.limit(1);

		return setting[0]?.value ? parseInt(setting[0].value) : 14;
	} catch (error) {
		console.error('Error fetching inactive days threshold:', error);
		return 14;
	}
}

/**
 * Cleanup inactive users by setting them to resting status.
 * Inactivity is based on MAX(last_login, latest play date).
 */
export async function cleanupInactiveUsers(): Promise<{ updated: number; errors: string[] }> {
	const errors: string[] = [];
	let updated = 0;

	try {
		const inactiveDays = await getInactiveDaysThreshold();
		const thresholdDate = new Date();
		thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);

		// Find active party-finder users
		const activeUsers = await db
			.select({ id: users.id, username: users.username, lastLogin: users.last_login })
			.from(users)
			.where(and(eq(users.party_status, 'active'), eq(users.looking_for_party, true)));

		for (const user of activeUsers) {
			try {
				// Get the user's most recent play date
				const latestPlay = await db
					.select({ playDate: gamePlays.playDate })
					.from(gamePlays)
					.where(eq(gamePlays.userId, user.id))
					.orderBy(sql`${gamePlays.playDate} DESC`)
					.limit(1);

				const lastActivity = [user.lastLogin, latestPlay[0]?.playDate]
					.filter(Boolean)
					.sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0];

				if (!lastActivity || lastActivity < thresholdDate) {
					await db
						.update(users)
						.set({ party_status: 'resting' })
						.where(eq(users.id, user.id));
					updated++;
				}
			} catch (error) {
				errors.push(`Failed to process user ${user.username}: ${error}`);
			}
		}
	} catch (error) {
		errors.push(`Error during cleanup: ${error}`);
	}

	return { updated, errors };
}

/**
 * Reactivate a user who was auto-rested due to inactivity.
 * Called on login.
 */
export async function reactivateUserIfAutoRested(userId: string) {
	try {
		const user = await db
			.select({
				partyStatus: users.party_status,
				lookingForParty: users.looking_for_party
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (user[0]?.partyStatus === 'resting' && user[0]?.lookingForParty === true) {
			await db
				.update(users)
				.set({ party_status: 'active', last_login: new Date() })
				.where(eq(users.id, userId));
		} else {
			await db.update(users).set({ last_login: new Date() }).where(eq(users.id, userId));
		}
	} catch (error) {
		console.error(`Error reactivating user ${userId}:`, error);
	}
}

// --- Player types ---

export interface PlayerForCompatibility {
	id: string;
	displayName: string | null;
	username: string;
	bio: string | null;
	experienceLevel: string | null;
	playStyle: string | null;
	lookingForParty: boolean;
	partyStatus: string;
	openToAnyGame: boolean;
	contactVisibleTo: string | null;
	contactMethod: string | null;
	contactValue: string | null;
	lastLogin: Date | null;
	availability: Array<{ dayOfWeek: number }>;
	gamePreferences: Array<{ gameBggId: string; name: string; thumbnail?: string | null }>;
	compatibilityScore?: number;
	sharedPlayCount?: number;
}

export interface CurrentUserForCompatibility {
	id: string;
	experienceLevel: string | null;
	playStyle: string | null;
	openToAnyGame: boolean;
	lookingForParty: boolean;
	partyStatus: string;
}

/**
 * 4-factor compatibility scoring algorithm.
 * Weights: availability 40%, games 40%, experience 10%, play style 10%
 */
export function calculatePlayerCompatibility(
	currentUser: CurrentUserForCompatibility,
	currentUserAvailability: number[],
	currentUserGamePreferences: string[],
	player: PlayerForCompatibility
): number {
	let score = 0;

	// Availability overlap (40%)
	const playerDays = player.availability.map((a) => a.dayOfWeek);
	const commonDays = currentUserAvailability.filter((day) => playerDays.includes(day));
	if (currentUserAvailability.length > 0 || playerDays.length > 0) {
		score +=
			(commonDays.length / Math.max(currentUserAvailability.length, playerDays.length, 1)) * 40;
	}

	// Game preferences overlap (40%)
	if (player.openToAnyGame || currentUser.openToAnyGame) {
		score += 40;
	} else {
		const playerGameIds = player.gamePreferences.map((g) => g.gameBggId);
		const commonGames = currentUserGamePreferences.filter((id) => playerGameIds.includes(id));
		if (currentUserGamePreferences.length > 0 && playerGameIds.length > 0) {
			score +=
				(commonGames.length /
					Math.max(currentUserGamePreferences.length, playerGameIds.length, 1)) *
				40;
		}
	}

	// Experience level compatibility (10%)
	if (currentUser.experienceLevel && player.experienceLevel) {
		if (currentUser.experienceLevel === player.experienceLevel) {
			score += 10;
		} else if (
			currentUser.experienceLevel === 'some_experience' ||
			player.experienceLevel === 'some_experience'
		) {
			score += 5;
		}
	}

	// Play style compatibility (10%)
	if (currentUser.playStyle === 'either' || player.playStyle === 'either') {
		score += 10;
	} else if (currentUser.playStyle === player.playStyle) {
		score += 10;
	} else {
		score += 2;
	}

	return Math.round(score);
}

/**
 * Get shared play history count between two users via play_participants.
 */
export async function getSharedPlayCount(userIdA: string, userIdB: string): Promise<number> {
	const result = await db
		.select({ count: sql<number>`count(DISTINCT ${playParticipants.playId})` })
		.from(playParticipants)
		.where(
			sql`${playParticipants.playId} IN (
				SELECT ${playParticipants.playId} FROM ${playParticipants} WHERE ${playParticipants.userId} = ${userIdA}
			) AND ${playParticipants.userId} = ${userIdB}`
		);

	return result[0]?.count ?? 0;
}

/**
 * Get shared play counts for a user against multiple other users (batched).
 */
export async function getSharedPlayCounts(
	userId: string,
	otherUserIds: string[]
): Promise<Map<string, number>> {
	const counts = new Map<string, number>();
	if (otherUserIds.length === 0) return counts;

	// Get all plays the current user participated in
	const userPlays = await db
		.select({ playId: playParticipants.playId })
		.from(playParticipants)
		.where(eq(playParticipants.userId, userId));

	if (userPlays.length === 0) return counts;

	const playIds = userPlays.map((p) => p.playId);

	// Find other users who participated in those same plays
	const sharedPlays = await db
		.select({
			otherUserId: playParticipants.userId,
			count: sql<number>`count(DISTINCT ${playParticipants.playId})`
		})
		.from(playParticipants)
		.where(
			and(
				inArray(playParticipants.playId, playIds),
				inArray(playParticipants.userId, otherUserIds)
			)
		)
		.groupBy(playParticipants.userId);

	for (const row of sharedPlays) {
		counts.set(row.otherUserId, row.count);
	}

	return counts;
}

/**
 * Batch-load availability and game preferences for multiple users.
 * Uses 2 queries total instead of 2 per user (N+1 fix).
 */
export async function loadAllPlayerData(
	userIds: string[]
): Promise<
	Map<string, { availability: { dayOfWeek: number }[]; gamePreferences: { gameBggId: string; name: string; thumbnail: string | null }[] }>
> {
	const result = new Map<
		string,
		{ availability: { dayOfWeek: number }[]; gamePreferences: { gameBggId: string; name: string; thumbnail: string | null }[] }
	>();

	if (userIds.length === 0) return result;

	// Initialize all users with empty arrays
	for (const id of userIds) {
		result.set(id, { availability: [], gamePreferences: [] });
	}

	const [allAvailability, allGamePrefs] = await Promise.all([
		db
			.select({ userId: userAvailability.userId, dayOfWeek: userAvailability.dayOfWeek })
			.from(userAvailability)
			.where(inArray(userAvailability.userId, userIds)),
		db
			.select({
				userId: userGamePreferences.userId,
				gameBggId: userGamePreferences.gameBggId,
				name: boardGames.name,
				thumbnail: boardGames.thumbnail
			})
			.from(userGamePreferences)
			.leftJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
			.where(inArray(userGamePreferences.userId, userIds))
	]);

	for (const row of allAvailability) {
		result.get(row.userId)!.availability.push({ dayOfWeek: row.dayOfWeek });
	}

	for (const row of allGamePrefs) {
		result.get(row.userId)!.gamePreferences.push({
			gameBggId: row.gameBggId,
			name: row.name ?? 'Unknown',
			thumbnail: row.thumbnail
		});
	}

	return result;
}

/**
 * Load a single player's availability and game preferences.
 */
export async function loadPlayerData(userId: string) {
	const [availability, gamePrefs] = await Promise.all([
		db
			.select({ dayOfWeek: userAvailability.dayOfWeek })
			.from(userAvailability)
			.where(eq(userAvailability.userId, userId)),
		db
			.select({
				gameBggId: userGamePreferences.gameBggId,
				name: boardGames.name,
				thumbnail: boardGames.thumbnail
			})
			.from(userGamePreferences)
			.leftJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
			.where(eq(userGamePreferences.userId, userId))
	]);

	return {
		availability,
		gamePreferences: gamePrefs.map((g) => ({
			gameBggId: g.gameBggId,
			name: g.name ?? 'Unknown',
			thumbnail: g.thumbnail
		}))
	};
}

/**
 * Get paginated players with compatibility scores and filtering.
 */
export async function getPaginatedPlayersWithCompatibility({
	currentUser,
	currentUserAvailability,
	currentUserGamePreferences,
	allPlayers,
	page = 1,
	limit = 20,
	sortBy = 'compatibility',
	sortOrder = 'desc',
	filters = {}
}: {
	currentUser: CurrentUserForCompatibility;
	currentUserAvailability: number[];
	currentUserGamePreferences: string[];
	allPlayers: PlayerForCompatibility[];
	page?: number;
	limit?: number;
	sortBy?: string;
	sortOrder?: 'asc' | 'desc';
	filters?: {
		experience?: string;
		playStyle?: string;
		availability_day?: string;
		game_preference?: string;
	};
}) {
	let filteredPlayers = allPlayers.filter((player) => player.id !== currentUser.id);

	if (filters.experience && filters.experience !== 'all') {
		filteredPlayers = filteredPlayers.filter((p) => p.experienceLevel === filters.experience);
	}

	if (filters.playStyle && filters.playStyle !== 'all') {
		filteredPlayers = filteredPlayers.filter(
			(p) => p.playStyle === filters.playStyle || p.playStyle === 'either'
		);
	}

	if (filters.availability_day && filters.availability_day !== 'all') {
		const filterDay = parseInt(filters.availability_day);
		filteredPlayers = filteredPlayers.filter((p) =>
			p.availability.some((a) => a.dayOfWeek === filterDay)
		);
	}

	if (filters.game_preference && filters.game_preference !== 'all') {
		filteredPlayers = filteredPlayers.filter(
			(p) =>
				p.openToAnyGame || p.gamePreferences.some((g) => g.gameBggId === filters.game_preference)
		);
	}

	// Calculate compatibility scores
	const playersWithScores = filteredPlayers.map((player) => ({
		...player,
		compatibilityScore: calculatePlayerCompatibility(
			currentUser,
			currentUserAvailability,
			currentUserGamePreferences,
			player
		)
	}));

	// Sort
	const sortedPlayers = [...playersWithScores];
	if (sortBy === 'compatibility') {
		sortedPlayers.sort((a, b) =>
			sortOrder === 'desc'
				? b.compatibilityScore! - a.compatibilityScore!
				: a.compatibilityScore! - b.compatibilityScore!
		);
	} else if (sortBy === 'displayName') {
		sortedPlayers.sort((a, b) => {
			const nameA = (a.displayName || a.username).toLowerCase();
			const nameB = (b.displayName || b.username).toLowerCase();
			return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
		});
	} else if (sortBy === 'experienceLevel') {
		const order: Record<string, number> = { new: 1, some_experience: 2, experienced: 3 };
		sortedPlayers.sort((a, b) => {
			const levelA = order[a.experienceLevel || ''] || 0;
			const levelB = order[b.experienceLevel || ''] || 0;
			return sortOrder === 'desc' ? levelB - levelA : levelA - levelB;
		});
	} else if (sortBy === 'lastLogin') {
		sortedPlayers.sort((a, b) => {
			const timeA = a.lastLogin?.getTime() || 0;
			const timeB = b.lastLogin?.getTime() || 0;
			return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
		});
	}

	const totalCount = sortedPlayers.length;
	const totalPages = Math.ceil(totalCount / limit);
	const offset = (page - 1) * limit;
	const paginatedPlayers = sortedPlayers.slice(offset, offset + limit);

	const averageCompatibility =
		totalCount > 0
			? Math.round(sortedPlayers.reduce((sum, p) => sum + p.compatibilityScore!, 0) / totalCount)
			: 0;

	// Include current user in the active count (they were filtered out of the discovery list)
	const isCurrentUserActive =
		currentUser.lookingForParty && currentUser.partyStatus === 'active';
	const activeCount = totalCount + (isCurrentUserActive ? 1 : 0);

	return {
		data: paginatedPlayers,
		meta: { totalCount: activeCount, page, limit, totalPages, averageCompatibility }
	};
}

/**
 * Replace a user's availability days (delete + insert).
 */
export async function updateUserAvailability(userId: string, days: number[]) {
	await db.delete(userAvailability).where(eq(userAvailability.userId, userId));
	const validDays = days.filter((d) => (VALID_DAYS as readonly number[]).includes(d));
	if (validDays.length > 0) {
		await db
			.insert(userAvailability)
			.values(validDays.map((dayOfWeek) => ({ userId, dayOfWeek })));
	}
}

/**
 * Replace a user's game preferences (delete + insert).
 */
export async function updateUserGamePreferences(userId: string, gameBggIds: string[]) {
	await db.delete(userGamePreferences).where(eq(userGamePreferences.userId, userId));
	if (gameBggIds.length > 0) {
		await db
			.insert(userGamePreferences)
			.values(gameBggIds.map((gameBggId) => ({ userId, gameBggId })));
	}
}
