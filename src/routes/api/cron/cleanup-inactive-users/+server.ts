import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cleanupInactiveUsers, getInactiveDaysThreshold } from '$lib/server/partyFinderUtils';
import { dev } from '$app/environment';

// GET: Vercel cron trigger (daily at 06:00 UTC)
export const GET: RequestHandler = async ({ request }) => {
	// Verify cron secret in production
	if (!dev) {
		const cronHeader = request.headers.get('vercel-cron');
		if (!cronHeader) {
			return json({ error: 'Unauthorized' }, { status: 401 });
		}
	}

	const startTime = Date.now();

	try {
		const result = await cleanupInactiveUsers();
		const duration = `${Date.now() - startTime}ms`;

		return json({
			success: true,
			timestamp: new Date().toISOString(),
			duration,
			usersUpdated: result.updated,
			errors: result.errors,
			message: `Cleanup complete: ${result.updated} users set to resting`
		});
	} catch (error) {
		return json(
			{ success: false, error: `Cleanup failed: ${error}` },
			{ status: 500 }
		);
	}
};

// POST: Manual admin trigger
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const startTime = Date.now();

	try {
		const result = await cleanupInactiveUsers();
		const duration = `${Date.now() - startTime}ms`;

		return json({
			success: true,
			timestamp: new Date().toISOString(),
			duration,
			usersUpdated: result.updated,
			errors: result.errors,
			triggeredBy: locals.user.username,
			message: `Manual cleanup complete: ${result.updated} users set to resting`
		});
	} catch (error) {
		return json(
			{ success: false, error: `Cleanup failed: ${error}` },
			{ status: 500 }
		);
	}
};
