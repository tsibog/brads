import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gameViews, boardGames } from '$lib/server/db/schema';
import { eq, sql, desc, and, gte } from 'drizzle-orm';

// POST: Record a page view
export const POST: RequestHandler = async ({ request }) => {
	const { gameId, path } = await request.json();

	if (!gameId) {
		return json({ error: 'gameId is required' }, { status: 400 });
	}

	try {
		await db.insert(gameViews).values({
			gameId,
			path: path || null
		});
		return json({ ok: true }, { status: 201 });
	} catch (error) {
		console.error('Error recording view:', error);
		return json({ error: 'Failed to record view' }, { status: 500 });
	}
};

// GET: Retrieve analytics data
export const GET: RequestHandler = async ({ url, locals }) => {
	// Only admins can view analytics
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const period = url.searchParams.get('period') || '30'; // days
	const daysAgo = parseInt(period);
	const sinceTimestamp = Math.floor(Date.now() / 1000) - daysAgo * 86400;

	try {
		// Total views in period
		const totalViewsResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(gameViews)
			.where(gte(gameViews.viewedAt, sql`${sinceTimestamp}`));
		const totalViews = Number(totalViewsResult[0].count);

		// Top viewed games
		const topGames = await db
			.select({
				gameId: gameViews.gameId,
				gameName: boardGames.name,
				views: sql<number>`count(*)`,
				thumbnail: boardGames.thumbnail
			})
			.from(gameViews)
			.innerJoin(boardGames, eq(gameViews.gameId, boardGames.bggId))
			.where(gte(gameViews.viewedAt, sql`${sinceTimestamp}`))
			.groupBy(gameViews.gameId)
			.orderBy(desc(sql`count(*)`))
			.limit(10);

		// Views per day (for chart)
		const viewsPerDay = await db
			.select({
				date: sql<string>`date(${gameViews.viewedAt}, 'unixepoch')`,
				views: sql<number>`count(*)`
			})
			.from(gameViews)
			.where(gte(gameViews.viewedAt, sql`${sinceTimestamp}`))
			.groupBy(sql`date(${gameViews.viewedAt}, 'unixepoch')`)
			.orderBy(sql`date(${gameViews.viewedAt}, 'unixepoch')`);

		// Total unique games viewed
		const uniqueGamesResult = await db
			.select({ count: sql<number>`count(distinct ${gameViews.gameId})` })
			.from(gameViews)
			.where(gte(gameViews.viewedAt, sql`${sinceTimestamp}`));
		const uniqueGames = Number(uniqueGamesResult[0].count);

		// Total games in library
		const totalGamesResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(boardGames);
		const totalGames = Number(totalGamesResult[0].count);

		return json({
			totalViews,
			uniqueGames,
			totalGames,
			topGames,
			viewsPerDay,
			period: daysAgo
		});
	} catch (error) {
		console.error('Error fetching analytics:', error);
		return json({ error: 'Failed to fetch analytics' }, { status: 500 });
	}
};
