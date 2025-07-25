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
