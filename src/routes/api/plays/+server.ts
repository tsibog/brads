import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gamePlays, boardGames, users, playParticipants } from '$lib/server/db/schema';
import { desc, eq, sql, and, gte, lte, inArray } from 'drizzle-orm';
import { logBook } from '$lib/flags';

export const GET: RequestHandler = async ({ url }) => {
	if (!(await logBook())) return json({ error: 'Not found' }, { status: 404 });
	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const gameBggId = url.searchParams.get('gameBggId');
	const userId = url.searchParams.get('userId');
	const offset = (page - 1) * limit;

	const conditions = [];
	if (gameBggId) conditions.push(eq(gamePlays.gameBggId, gameBggId));
	if (userId) conditions.push(eq(gamePlays.userId, userId));

	const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

	try {
		const plays = await db
			.select({
				id: gamePlays.id,
				userId: gamePlays.userId,
				username: users.username,
				gameBggId: gamePlays.gameBggId,
				gameName: boardGames.name,
				gameThumbnail: boardGames.thumbnail,
				playDate: gamePlays.playDate,
				playerCount: gamePlays.playerCount,
				durationMinutes: gamePlays.durationMinutes,
				notes: gamePlays.notes,
				createdAt: gamePlays.createdAt
			})
			.from(gamePlays)
			.innerJoin(boardGames, eq(gamePlays.gameBggId, boardGames.bggId))
			.innerJoin(users, eq(gamePlays.userId, users.id))
			.where(whereClause)
			.orderBy(desc(gamePlays.playDate))
			.limit(limit)
			.offset(offset);

		const countResult = await db
			.select({ count: sql<number>`count(*)` })
			.from(gamePlays)
			.where(whereClause);

		const totalCount = Number(countResult[0].count);

		return json({
			data: plays,
			meta: {
				totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit)
			}
		});
	} catch (error) {
		console.error('Error fetching plays:', error);
		return json({ error: 'Failed to fetch plays' }, { status: 500 });
	}
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!(await logBook())) return json({ error: 'Not found' }, { status: 404 });
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const body = await request.json();
	const { gameBggId, playerCount, durationMinutes, notes, playDate, taggedUsernames } = body;

	if (!gameBggId || !playerCount) {
		return json({ error: 'gameBggId and playerCount are required' }, { status: 400 });
	}

	if (playerCount < 1 || playerCount > 99) {
		return json({ error: 'playerCount must be between 1 and 99' }, { status: 400 });
	}

	// Verify game exists
	const game = await db.select().from(boardGames).where(eq(boardGames.bggId, gameBggId));
	if (game.length === 0) {
		return json({ error: 'Game not found in catalog' }, { status: 404 });
	}

	// Resolve tagged usernames to user IDs
	let taggedUserIds: string[] = [];
	if (taggedUsernames && Array.isArray(taggedUsernames) && taggedUsernames.length > 0) {
		const foundUsers = await db
			.select({ id: users.id, username: users.username })
			.from(users)
			.where(inArray(users.username, taggedUsernames));

		const foundUsernames = foundUsers.map((u) => u.username.toLowerCase());
		const missing = taggedUsernames.filter(
			(name: string) => !foundUsernames.includes(name.toLowerCase())
		);

		if (missing.length > 0) {
			return json(
				{ error: `Users not found: ${missing.join(', ')}`, missingUsernames: missing },
				{ status: 400 }
			);
		}

		taggedUserIds = foundUsers
			.map((u) => u.id)
			.filter((id) => id !== locals.user!.id); // don't duplicate the logging user
	}

	try {
		const playData = {
			gameBggId,
			playerCount,
			durationMinutes: durationMinutes || null,
			notes: notes?.trim() || null,
			playDate: playDate ? new Date(playDate) : new Date()
		};

		// Insert play for the logging user
		const newPlay = await db
			.insert(gamePlays)
			.values({ ...playData, userId: locals.user.id })
			.returning();

		const playId = newPlay[0].id;

		// Track all participants (logging user + tagged users) in play_participants.
		// Participants are linked to the logger's play only — this is intentional.
		// Tagged users get their own gamePlays rows (below) for their personal adventure log,
		// but play_participants on the original play is what drives shared play count
		// in the party finder (via getSharedPlayCounts).
		const allParticipantIds = [locals.user.id, ...taggedUserIds];
		if (allParticipantIds.length > 0) {
			await db.insert(playParticipants).values(
				allParticipantIds.map((uid) => ({ playId, userId: uid }))
			);
		}

		// Insert personal adventure log entries for tagged users
		for (const userId of taggedUserIds) {
			await db.insert(gamePlays).values({ ...playData, userId });
		}

		return json(
			{ ...newPlay[0], taggedCount: taggedUserIds.length },
			{ status: 201 }
		);
	} catch (error) {
		console.error('Error logging play:', error);
		return json({ error: 'Failed to log play' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!(await logBook())) return json({ error: 'Not found' }, { status: 404 });
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const body = await request.json();
	const { id, notes } = body;

	if (!id) {
		return json({ error: 'Play ID is required' }, { status: 400 });
	}

	const playId = parseInt(id);

	const play = await db.select().from(gamePlays).where(eq(gamePlays.id, playId));
	if (play.length === 0) {
		return json({ error: 'Play not found' }, { status: 404 });
	}

	try {
		const updated = await db
			.update(gamePlays)
			.set({ notes: notes?.trim() || null })
			.where(eq(gamePlays.id, playId))
			.returning();
		return json(updated[0]);
	} catch (error) {
		console.error('Error updating play notes:', error);
		return json({ error: 'Failed to update play notes' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!(await logBook())) return json({ error: 'Not found' }, { status: 404 });
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const id = url.searchParams.get('id');
	if (!id) {
		return json({ error: 'Play ID is required' }, { status: 400 });
	}

	const playId = parseInt(id);

	// Only allow deleting own plays (or admin can delete any)
	const play = await db.select().from(gamePlays).where(eq(gamePlays.id, playId));
	if (play.length === 0) {
		return json({ error: 'Play not found' }, { status: 404 });
	}

	if (play[0].userId !== locals.user.id && !locals.user.is_admin) {
		return json({ error: 'Not authorized to delete this play' }, { status: 403 });
	}

	try {
		await db.delete(gamePlays).where(eq(gamePlays.id, playId));
		return json({ message: 'Play deleted successfully' });
	} catch (error) {
		console.error('Error deleting play:', error);
		return json({ error: 'Failed to delete play' }, { status: 500 });
	}
};
