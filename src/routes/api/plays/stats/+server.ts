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

		// Fetch all plays with user+game info, then compute all stats in JS
		// to properly deduplicate sessions (tagged players create multiple rows)
		const allPlays = await db
			.select({
				id: gamePlays.id,
				userId: gamePlays.userId,
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
			.orderBy(desc(gamePlays.playDate));

		// Group into unique sessions by game + date + duration + notes
		type Session = {
			usernames: string[];
			userIds: string[];
			gameName: string;
			gameThumbnail: string | null;
			gameBggId: string;
			playDate: Date;
			playerCount: number;
			durationMinutes: number | null;
			notes: string | null;
		};
		const sessionMap = new Map<string, Session>();
		for (const play of allPlays) {
			const key = `${play.gameBggId}|${play.playDate.getTime()}|${play.durationMinutes}|${play.notes ?? ''}`;
			const existing = sessionMap.get(key);
			if (existing) {
				if (!existing.usernames.includes(play.username)) {
					existing.usernames.push(play.username);
				}
				if (!existing.userIds.includes(play.userId)) {
					existing.userIds.push(play.userId);
				}
			} else {
				sessionMap.set(key, {
					usernames: [play.username],
					userIds: [play.userId],
					gameName: play.gameName,
					gameThumbnail: play.gameThumbnail,
					gameBggId: play.gameBggId,
					playDate: play.playDate,
					playerCount: play.playerCount,
					durationMinutes: play.durationMinutes,
					notes: play.notes
				});
			}
		}
		const sessions = [...sessionMap.values()];

		// Recent plays (last 5 sessions)
		const recentPlays = sessions.slice(0, 5);

		// Most played games
		const gameMap = new Map<string, { gameName: string; gameThumbnail: string | null; playCount: number; totalPlayers: number }>();
		for (const s of sessions) {
			const existing = gameMap.get(s.gameBggId);
			if (existing) {
				existing.playCount++;
				existing.totalPlayers += s.playerCount;
			} else {
				gameMap.set(s.gameBggId, {
					gameName: s.gameName,
					gameThumbnail: s.gameThumbnail,
					playCount: 1,
					totalPlayers: s.playerCount
				});
			}
		}
		const mostPlayed = [...gameMap.entries()]
			.map(([gameBggId, g]) => ({ gameBggId, ...g }))
			.sort((a, b) => b.playCount - a.playCount)
			.slice(0, 5);

		// Total stats
		const uniqueUserIds = new Set(allPlays.map((p) => p.userId));
		const uniqueGameIds = new Set(sessions.map((s) => s.gameBggId));
		const totals = {
			totalPlays: sessions.length,
			totalPlayerSessions: sessions.reduce((sum, s) => sum + s.playerCount, 0),
			uniqueGames: uniqueGameIds.size,
			uniqueUsers: uniqueUserIds.size
		};

		// Plays by day of week
		const dayCountMap = new Map<number, number>();
		for (const s of sessions) {
			const dow = s.playDate.getUTCDay();
			dayCountMap.set(dow, (dayCountMap.get(dow) ?? 0) + 1);
		}
		const byDayOfWeek = [...dayCountMap.entries()]
			.map(([dayOfWeek, count]) => ({ dayOfWeek, count }))
			.sort((a, b) => a.dayOfWeek - b.dayOfWeek);

		// Top players (per-user stats, counting sessions they participated in)
		const playerMap = new Map<string, { userId: string; username: string; playCount: number; gameIds: Set<string> }>();
		for (const s of sessions) {
			for (let i = 0; i < s.userIds.length; i++) {
				const uid = s.userIds[i];
				const uname = s.usernames[i];
				const existing = playerMap.get(uid);
				if (existing) {
					existing.playCount++;
					existing.gameIds.add(s.gameBggId);
				} else {
					playerMap.set(uid, { userId: uid, username: uname, playCount: 1, gameIds: new Set([s.gameBggId]) });
				}
			}
		}
		const topPlayers = [...playerMap.values()]
			.map((p) => ({ userId: p.userId, username: p.username, playCount: p.playCount, uniqueGames: p.gameIds.size }))
			.sort((a, b) => b.playCount - a.playCount)
			.slice(0, 5);

		return json({
			mostPlayed,
			totals,
			recentPlays,
			byDayOfWeek,
			topPlayers
		});
	} catch (error) {
		console.error('Error fetching play stats:', error);
		return json({ error: 'Failed to fetch play stats' }, { status: 500 });
	}
};
