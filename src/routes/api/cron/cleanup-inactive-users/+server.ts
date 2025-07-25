import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { cleanupInactiveUsers } from '$lib/server/partyFinderUtils.js';

/**
 * Vercel Cron Job endpoint for cleaning up inactive users
 * This endpoint will be called daily by Vercel's cron system
 *
 * Expected to be configured in vercel.json as:
 * {
 *   "crons": [{
 *     "path": "/api/cron/cleanup-inactive-users",
 *     "schedule": "0 6 * * *"
 *   }]
 * }
 */
export const GET: RequestHandler = async ({ request }) => {
	try {
		// Basic security: check for Vercel cron headers
		const authHeader = request.headers.get('authorization');
		const cronHeader = request.headers.get('vercel-cron');

		// In production, Vercel adds these headers to cron requests
		if (process.env.NODE_ENV === 'production') {
			if (!cronHeader) {
				console.warn('Unauthorized cron attempt - missing vercel-cron header');
				return json({ error: 'Unauthorized' }, { status: 401 });
			}
		}

		console.log('Starting daily party finder cleanup job...');

		const startTime = Date.now();
		const result = await cleanupInactiveUsers();
		const duration = Date.now() - startTime;

		const response = {
			success: true,
			timestamp: new Date().toISOString(),
			duration: `${duration}ms`,
			usersUpdated: result.updated,
			errors: result.errors,
			message: `Cleanup completed: ${result.updated} users set to resting`
		};

		console.log('Cleanup job completed:', response);

		return json(response);
	} catch (error) {
		const errorResponse = {
			success: false,
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Cleanup job failed'
		};

		console.error('Cleanup job failed:', errorResponse);

		return json(errorResponse, { status: 500 });
	}
};

// Also support POST for manual triggers (e.g., from admin interface)
export const POST: RequestHandler = async ({ locals, request }) => {
	try {
		// For manual triggers, require admin authentication
		if (!locals.user?.isAdmin) {
			return json({ error: 'Admin access required' }, { status: 403 });
		}

		console.log(`Manual cleanup triggered by admin: ${locals.user.username}`);

		const startTime = Date.now();
		const result = await cleanupInactiveUsers();
		const duration = Date.now() - startTime;

		const response = {
			success: true,
			timestamp: new Date().toISOString(),
			duration: `${duration}ms`,
			usersUpdated: result.updated,
			errors: result.errors,
			message: `Manual cleanup completed: ${result.updated} users set to resting`,
			triggeredBy: locals.user.username
		};

		console.log('Manual cleanup completed:', response);

		return json(response);
	} catch (error) {
		const errorResponse = {
			success: false,
			timestamp: new Date().toISOString(),
			error: error instanceof Error ? error.message : 'Unknown error',
			message: 'Manual cleanup failed'
		};

		console.error('Manual cleanup failed:', errorResponse);

		return json(errorResponse, { status: 500 });
	}
};
