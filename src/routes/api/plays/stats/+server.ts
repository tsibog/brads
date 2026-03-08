import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gamePlays, boardGames, users } from '$lib/server/db/schema';
import { desc, eq, sql, gte } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url }) => {
	const period = url.searchParams.get('period') || 'all'; // all, week, month, year
	const userId = url.searchParams.get('userId');

	let dateFilter;
	const now = new Date();
	if (period === 'week') {
		dateFilter = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
	} else if (period === 'month') {
		dateFilter = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
	} else if (period === 'year') {
		dateFilter = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
	}

	try {
		const conditions = [];
		if (dateFilter) conditions.push(gte(gamePlays.playDate, dateFilter));
		if (userId) conditions.push(eq(gamePlays.userId, userId));
		const whereClause = conditions.length > 0 ? sql.join(conditions, sql` AND `) : sql`1=1`;

		// Most played games
		const mostPlayed = await db
			.select({
				gameBggId: gamePlays.gameBggId,
				gameName: boardGames.name,
				gameThumbnail: boardGames.thumbnail,
				playCount: sql<number>`count(*)`.as('play_count'),
				totalPlayers: sql<number>`sum(${gamePlays.playerCount})`.as('total_players')
			})
			.from(gamePlays)
			.innerJoin(boardGames, eq(gamePlays.gameBggId, boardGames.bggId))
			.where(whereClause)
			.groupBy(gamePlays.gameBggId)
			.orderBy(sql`play_count DESC`)
			.limit(10);

		// Total stats
		const totals = await db
			.select({
				totalPlays: sql<number>`count(*)`,
				totalPlayerSessions: sql<number>`sum(${gamePlays.playerCount})`,
				uniqueGames: sql<number>`count(distinct ${gamePlays.gameBggId})`,
				uniqueUsers: sql<number>`count(distinct ${gamePlays.userId})`
			})
			.from(gamePlays)
			.where(whereClause);

		// Recent plays (last 10)
		const recentPlays = await db
			.select({
				id: gamePlays.id,
				username: users.username,
				gameName: boardGames.name,
				gameThumbnail: boardGames.thumbnail,
				gameBggId: gamePlays.gameBggId,
				playDate: gamePlays.playDate,
				playerCount: gamePlays.playerCount,
				durationMinutes: gamePlays.durationMinutes,
				notes: gamePlays.notes
			})
			.from(gamePlays)
			.innerJoin(boardGames, eq(gamePlays.gameBggId, boardGames.bggId))
			.innerJoin(users, eq(gamePlays.userId, users.id))
			.where(whereClause)
			.orderBy(desc(gamePlays.playDate))
			.limit(10);

		// Plays by day of week
		const byDayOfWeek = await db
			.select({
				dayOfWeek: sql<number>`cast(strftime('%w', ${gamePlays.playDate}, 'unixepoch') as integer)`.as(
					'day_of_week'
				),
				count: sql<number>`count(*)`
			})
			.from(gamePlays)
			.where(whereClause)
			.groupBy(sql`day_of_week`)
			.orderBy(sql`day_of_week`);

		// Top players (most plays logged)
		const topPlayers = await db
			.select({
				userId: gamePlays.userId,
				username: users.username,
				playCount: sql<number>`count(*)`.as('play_count'),
				uniqueGames: sql<number>`count(distinct ${gamePlays.gameBggId})`.as('unique_games')
			})
			.from(gamePlays)
			.innerJoin(users, eq(gamePlays.userId, users.id))
			.where(whereClause)
			.groupBy(gamePlays.userId)
			.orderBy(sql`play_count DESC`)
			.limit(10);

		return json({
			mostPlayed,
			totals: totals[0],
			recentPlays,
			byDayOfWeek,
			topPlayers
		});
	} catch (error) {
		console.error('Error fetching play stats:', error);
		return json({ error: 'Failed to fetch play stats' }, { status: 500 });
	}
};
