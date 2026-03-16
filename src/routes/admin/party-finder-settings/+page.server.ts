import { fail } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { db } from '$lib/server/db';
import { systemSettings, users, userAvailability, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, and, sql } from 'drizzle-orm';

export const load: PageServerLoad = async () => {
	// Get current settings
	const settings = await db.select().from(systemSettings);
	const settingsMap: Record<string, string> = {};
	for (const s of settings) {
		settingsMap[s.key] = s.value;
	}

	const inactiveDays = settingsMap['party_finder_inactive_days'] || '14';

	// Party finder analytics
	const [
		totalUsersResult,
		activeUsersResult,
		restingUsersResult,
		lookingUsersResult
	] = await Promise.all([
		db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.is_admin, false)),
		db.select({ count: sql<number>`count(*)` }).from(users).where(
			and(eq(users.party_status, 'active'), eq(users.looking_for_party, true))
		),
		db.select({ count: sql<number>`count(*)` }).from(users).where(
			and(eq(users.party_status, 'resting'), eq(users.looking_for_party, true))
		),
		db.select({ count: sql<number>`count(*)` }).from(users).where(eq(users.looking_for_party, true))
	]);

	// Most popular days
	const popularDays = await db
		.select({
			dayOfWeek: userAvailability.dayOfWeek,
			count: sql<number>`count(*)`
		})
		.from(userAvailability)
		.groupBy(userAvailability.dayOfWeek)
		.orderBy(sql`count(*) DESC`);

	// Most requested games
	const popularGames = await db
		.select({
			gameBggId: userGamePreferences.gameBggId,
			name: boardGames.name,
			count: sql<number>`count(*)`
		})
		.from(userGamePreferences)
		.leftJoin(boardGames, eq(userGamePreferences.gameBggId, boardGames.bggId))
		.groupBy(userGamePreferences.gameBggId)
		.orderBy(sql`count(*) DESC`)
		.limit(10);

	return {
		inactiveDays,
		analytics: {
			totalUsers: Number(totalUsersResult[0]?.count ?? 0),
			activeUsers: Number(activeUsersResult[0]?.count ?? 0),
			restingUsers: Number(restingUsersResult[0]?.count ?? 0),
			lookingForParty: Number(lookingUsersResult[0]?.count ?? 0),
			popularDays: popularDays.map((d) => ({
				dayOfWeek: d.dayOfWeek,
				count: Number(d.count)
			})),
			popularGames: popularGames.map((g) => ({
				gameBggId: g.gameBggId,
				name: g.name,
				count: Number(g.count)
			}))
		}
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, locals }) => {
		if (!locals.user?.is_admin) {
			return fail(403, { message: 'Admin access required' });
		}

		const formData = await request.formData();
		const inactiveDays = formData.get('inactive_days');

		if (typeof inactiveDays !== 'string') {
			return fail(400, { message: 'Invalid input' });
		}

		const days = parseInt(inactiveDays);
		if (isNaN(days) || days < 1 || days > 365) {
			return fail(400, { message: 'Inactive days must be between 1 and 365' });
		}

		try {
			// Upsert the setting
			const existing = await db
				.select()
				.from(systemSettings)
				.where(eq(systemSettings.key, 'party_finder_inactive_days'));

			if (existing.length > 0) {
				await db
					.update(systemSettings)
					.set({ value: days.toString(), updatedAt: new Date() })
					.where(eq(systemSettings.key, 'party_finder_inactive_days'));
			} else {
				await db.insert(systemSettings).values({
					key: 'party_finder_inactive_days',
					value: days.toString(),
					description: 'Number of days of inactivity before a user is set to resting'
				});
			}

			return { success: true, message: `Inactive threshold updated to ${days} days` };
		} catch (error) {
			console.error('Error updating settings:', error);
			return fail(500, { message: 'Failed to update settings' });
		}
	},

	triggerCleanup: async ({ locals, fetch }) => {
		if (!locals.user?.is_admin) {
			return fail(403, { message: 'Admin access required' });
		}

		try {
			const res = await fetch('/api/cron/cleanup-inactive-users', { method: 'POST' });
			const data = await res.json();

			if (data.success) {
				return { success: true, message: data.message };
			} else {
				return fail(500, { message: data.error || 'Cleanup failed' });
			}
		} catch (error) {
			return fail(500, { message: 'Failed to trigger cleanup' });
		}
	}
};
