import { db } from './db';
import { users, systemSettings } from './db/schema.js';
import { eq, and, lt } from 'drizzle-orm';

// Simple in-memory cache for serverless functions
const cache = new Map<string, { data: any; expires: number }>();

/**
 * Simple cache implementation for serverless functions
 */
export function setCache(key: string, data: any, ttlMinutes: number = 10) {
	const expires = Date.now() + ttlMinutes * 60 * 1000;
	cache.set(key, { data, expires });
}

export function getCache(key: string) {
	const item = cache.get(key);
	if (!item) return null;

	if (Date.now() > item.expires) {
		cache.delete(key);
		return null;
	}

	return item.data;
}

export function clearCache(pattern?: string) {
	if (pattern) {
		// Clear cache entries matching pattern
		for (const key of cache.keys()) {
			if (key.includes(pattern)) {
				cache.delete(key);
			}
		}
	} else {
		// Clear all cache
		cache.clear();
	}
}

/**
 * Get the configured number of days before users are considered inactive
 */
export async function getInactiveDaysThreshold(): Promise<number> {
	const cacheKey = 'inactive_days_threshold';
	const cached = getCache(cacheKey);
	if (cached) return cached;

	try {
		const setting = await db
			.select()
			.from(systemSettings)
			.where(eq(systemSettings.key, 'party_finder_inactive_days'))
			.limit(1);

		const days = setting[0]?.value ? parseInt(setting[0].value) : 14;
		setCache(cacheKey, days, 30); // Cache for 30 minutes
		return days;
	} catch (error) {
		console.error('Error fetching inactive days threshold:', error);
		return 14; // Default fallback
	}
}

/**
 * Cleanup inactive users by setting them to resting status
 * Returns the number of users affected
 */
export async function cleanupInactiveUsers(): Promise<{ updated: number; errors: string[] }> {
	const errors: string[] = [];
	let updated = 0;

	try {
		const inactiveDays = await getInactiveDaysThreshold();
		const thresholdDate = new Date();
		thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);

		// Find users who are currently active but haven't logged in within the threshold
		const inactiveUsers = await db
			.select({ id: users.id, username: users.username })
			.from(users)
			.where(
				and(
					eq(users.party_status, 'active'),
					eq(users.looking_for_party, true),
					lt(users.last_login, thresholdDate)
				)
			);

		console.log(`Found ${inactiveUsers.length} inactive users to rest`);

		// Update each user to resting status
		for (const user of inactiveUsers) {
			try {
				await db
					.update(users)
					.set({
						party_status: 'resting'
						// Keep looking_for_party as-is so they can be reactivated when they log back in
					})
					.where(eq(users.id, user.id));

				updated++;
				console.log(`Set user ${user.username} (${user.id}) to resting due to inactivity`);
			} catch (error) {
				const errorMsg = `Failed to update user ${user.username} (${user.id}): ${error}`;
				errors.push(errorMsg);
				console.error(errorMsg);
			}
		}

		// Clear any cached data related to party finder since user statuses changed
		clearCache('party_finder');
		clearCache('player_discovery');

		console.log(`Cleanup complete: ${updated} users set to resting, ${errors.length} errors`);
	} catch (error) {
		const errorMsg = `Error during cleanup process: ${error}`;
		errors.push(errorMsg);
		console.error(errorMsg);
	}

	return { updated, errors };
}

/**
 * Reactivate a user who was automatically set to resting due to inactivity
 * This should be called when a user logs back in
 */
export async function reactivateUserIfAutoRested(userId: string) {
	try {
		// Check if user is currently resting and looking for party
		// (indicating they were auto-rested but still want to participate)
		const user = await db
			.select({
				partyStatus: users.party_status,
				lookingForParty: users.looking_for_party
			})
			.from(users)
			.where(eq(users.id, userId))
			.limit(1);

		if (user[0]?.partyStatus === 'resting' && user[0]?.lookingForParty === true) {
			// User was likely auto-rested, reactivate them
			await db
				.update(users)
				.set({
					party_status: 'active',
					last_login: new Date()
				})
				.where(eq(users.id, userId));

			console.log(`Reactivated user ${userId} on login`);

			// Clear cache since user status changed
			clearCache('party_finder');
			clearCache('player_discovery');
		} else {
			// Just update last login time
			await db.update(users).set({ last_login: new Date() }).where(eq(users.id, userId));
		}
	} catch (error) {
		console.error(`Error reactivating user ${userId}:`, error);
		// Non-critical error, don't throw
	}
}

/**
 * Check if a user should be visible in party finder based on activity and status
 */
export function shouldUserBeVisible(
	user: {
		lookingForParty: boolean;
		partyStatus: string;
		lastLogin: Date | null;
	},
	inactiveDays: number
): boolean {
	if (!user.lookingForParty) return false;
	if (user.partyStatus !== 'active') return false;
	if (!user.lastLogin) return false;

	const thresholdDate = new Date();
	thresholdDate.setDate(thresholdDate.getDate() - inactiveDays);

	return user.lastLogin > thresholdDate;
}

/**
 * Player interface for compatibility calculations
 */
export interface PlayerForCompatibility {
	id: string;
	displayName: string | null;
	username: string;
	bio: string | null;
	experienceLevel: string | null;
	vibePreference: string | null;
	lookingForParty: boolean;
	partyStatus: string;
	openToAnyGame: boolean;
	contactVisibleTo: string | null;
	contactMethod: string | null;
	contactValue: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	lastLogin: Date | null;
	availability: Array<{ dayOfWeek: number }>;
	gamePreferences: Array<{ gameBggId: string; name: string; thumbnail?: string; image?: string }>;
	compatibilityScore?: number;
}

export interface CurrentUserForCompatibility {
	id: string;
	experienceLevel: string | null;
	vibePreference: string | null;
	openToAnyGame: boolean;
	lookingForParty: boolean;
	partyStatus: string;
}

/**
 * Calculate compatibility score between current user and another player
 * Uses the same 4-factor algorithm as the client-side version
 */
export function calculatePlayerCompatibility(
	currentUser: CurrentUserForCompatibility,
	currentUserAvailability: number[],
	currentUserGamePreferences: string[],
	player: PlayerForCompatibility
): number {
	let score = 0;
	let maxScore = 0;

	// Availability overlap (40% of score)
	maxScore += 40;
	const playerDays = player.availability.map((a) => a.dayOfWeek);
	const commonDays = currentUserAvailability.filter((day) => playerDays.includes(day));
	if (currentUserAvailability.length > 0 || playerDays.length > 0) {
		score +=
			(commonDays.length / Math.max(currentUserAvailability.length, playerDays.length, 1)) * 40;
	}

	// Game preferences overlap (40% of score)
	maxScore += 40;
	if (player.openToAnyGame || currentUser.openToAnyGame) {
		score += 40; // Perfect match if either is open to any game
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

	// Experience level compatibility (10% of score)
	maxScore += 10;
	if (currentUser.experienceLevel && player.experienceLevel) {
		if (currentUser.experienceLevel === player.experienceLevel) {
			score += 10;
		} else if (
			(currentUser.experienceLevel === 'intermediate' &&
				['beginner', 'advanced'].includes(player.experienceLevel)) ||
			(player.experienceLevel === 'intermediate' &&
				['beginner', 'advanced'].includes(currentUser.experienceLevel))
		) {
			score += 5; // Intermediate players are somewhat compatible with all levels
		}
	}

	// Vibe compatibility (10% of score)
	maxScore += 10;
	if (currentUser.vibePreference === 'both' || player.vibePreference === 'both') {
		score += 10;
	} else if (currentUser.vibePreference === player.vibePreference) {
		score += 10;
	} else {
		score += 2; // Small score for different but not incompatible vibes
	}

	return Math.round((score / maxScore) * 100);
}

/**
 * Get paginated players with compatibility scores and filtering
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
		vibe?: string;
		availability_day?: string;
		game_preference?: string;
	};
}) {
	// Filter players based on provided filters
	let filteredPlayers = allPlayers.filter((player) => player.id !== currentUser.id);

	// Apply experience filter
	if (filters.experience && filters.experience !== 'all') {
		filteredPlayers = filteredPlayers.filter((p) => p.experienceLevel === filters.experience);
	}

	// Apply vibe filter
	if (filters.vibe && filters.vibe !== 'all') {
		filteredPlayers = filteredPlayers.filter(
			(p) => p.vibePreference === filters.vibe || p.vibePreference === 'both'
		);
	}

	// Apply day availability filter
	if (filters.availability_day && filters.availability_day !== 'all') {
		const filterDay = parseInt(filters.availability_day);
		filteredPlayers = filteredPlayers.filter((p) =>
			p.availability.some((a) => a.dayOfWeek === filterDay)
		);
	}

	// Apply game preference filter
	if (filters.game_preference && filters.game_preference !== 'all') {
		filteredPlayers = filteredPlayers.filter(
			(p) =>
				p.openToAnyGame || p.gamePreferences.some((g) => g.gameBggId === filters.game_preference)
		);
	}

	// Calculate compatibility scores for all filtered players
	const playersWithScores = filteredPlayers.map((player) => ({
		...player,
		compatibilityScore: calculatePlayerCompatibility(
			currentUser,
			currentUserAvailability,
			currentUserGamePreferences,
			player
		)
	}));

	// Sort players
	let sortedPlayers = [...playersWithScores];
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
		const experienceOrder = { beginner: 1, intermediate: 2, advanced: 3 };
		sortedPlayers.sort((a, b) => {
			const levelA = experienceOrder[a.experienceLevel as keyof typeof experienceOrder] || 0;
			const levelB = experienceOrder[b.experienceLevel as keyof typeof experienceOrder] || 0;
			return sortOrder === 'desc' ? levelB - levelA : levelA - levelB;
		});
	} else if (sortBy === 'lastLogin') {
		sortedPlayers.sort((a, b) => {
			const timeA = a.lastLogin?.getTime() || 0;
			const timeB = b.lastLogin?.getTime() || 0;
			return sortOrder === 'desc' ? timeB - timeA : timeA - timeB;
		});
	}

	// Calculate pagination
	const totalCount = sortedPlayers.length;
	const totalPages = Math.ceil(totalCount / limit);
	const offset = (page - 1) * limit;
	const paginatedPlayers = sortedPlayers.slice(offset, offset + limit);

	// Calculate average compatibility score
	const averageCompatibility =
		totalCount > 0
			? Math.round(sortedPlayers.reduce((sum, p) => sum + p.compatibilityScore!, 0) / totalCount)
			: 0;

	return {
		data: paginatedPlayers,
		meta: {
			totalCount,
			page,
			limit,
			totalPages,
			averageCompatibility
		}
	};
}
