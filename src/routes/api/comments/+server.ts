import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { gameComments, boardGames } from '$lib/server/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request }) => {
	const { gameId, authorName, content } = await request.json();

	if (!gameId || !authorName || !content) {
		return json({ error: 'Missing required fields' }, { status: 400 });
	}

	try {
		const newComment = await db
			.insert(gameComments)
			.values({
				gameId,
				authorName,
				content
				// createdAt will use the default value (current timestamp) as defined in the schema
			})
			.returning();

		return json(newComment[0], { status: 201 });
	} catch (error) {
		console.error('Error creating comment:', error);
		return json({ error: 'Failed to create comment' }, { status: 500 });
	}
};

export const GET: RequestHandler = async ({ url }) => {
	const gameId = url.searchParams.get('gameId');
	const approvedOnly = url.searchParams.get('approvedOnly') === 'true';

	try {
		let query = db
			.select({
				id: gameComments.id,
				gameId: gameComments.gameId,
				authorName: gameComments.authorName,
				content: gameComments.content,
				createdAt: gameComments.createdAt,
				isApproved: gameComments.isApproved,
				gameName: boardGames.name
			})
			.from(gameComments)
			.leftJoin(boardGames, eq(gameComments.gameId, boardGames.bggId));

		const conditions = [];

		if (gameId) {
			conditions.push(eq(gameComments.gameId, gameId));
		}

		if (approvedOnly !== undefined) {
			conditions.push(eq(gameComments.isApproved, approvedOnly));
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const fetchedComments = await query.orderBy(desc(gameComments.createdAt));

		return json(fetchedComments);
	} catch (error) {
		console.error('Error fetching comments:', error);
		return json({ error: 'Failed to fetch comments' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const { id, isApproved } = await request.json();

	if (id === undefined) {
		return json({ error: 'Missing comment ID' }, { status: 400 });
	}

	try {
		if (isApproved) {
			const updatedComment = await db
				.update(gameComments)
				.set({ isApproved: true })
				.where(eq(gameComments.id, id))
				.returning();

			if (updatedComment.length === 0) {
				return json({ error: 'Comment not found' }, { status: 404 });
			}

			return json(updatedComment[0]);
		} else {
			const deletedComment = await db
				.delete(gameComments)
				.where(eq(gameComments.id, id))
				.returning();

			if (deletedComment.length === 0) {
				return json({ error: 'Comment not found' }, { status: 404 });
			}

			return json({ message: 'Comment deleted successfully' });
		}
	} catch (error) {
		console.error('Error updating/deleting comment:', error);
		return json({ error: 'Failed to update/delete comment' }, { status: 500 });
	}
};
