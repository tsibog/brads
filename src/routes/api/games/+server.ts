import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, asc, desc, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { boardGames } from '$lib/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		// Get a specific game by ID
		const game = await db.select().from(boardGames).where(eq(boardGames.bggId, id));
		if (game.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}
		return json(game[0]);
	} else {
		// Get all games with pagination, sorting, and filtering
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const sortOrder = url.searchParams.get('sortOrder') || 'asc';
		const filterName = url.searchParams.get('name');

		let query = db.select().from(boardGames);

		// Apply filtering
		if (filterName) {
			query = query.where(sql`${boardGames.name} LIKE ${`%${filterName}%`}`);
		}

		// Apply sorting
		if (sortBy in boardGames) {
			query = query.orderBy(
				sortOrder === 'desc' ? desc(boardGames[sortBy]) : asc(boardGames[sortBy])
			);
		}

		// Get total count for pagination
		const totalCountResult = await db.select({ count: sql`count(*)` }).from(boardGames);
		const totalCount = Number(totalCountResult[0].count);

		// Apply pagination
		const offset = (page - 1) * limit;
		query = query.limit(limit).offset(offset);

		const games = await query;

		return json({
			data: games,
			meta: {
				totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit)
			}
		});
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	try {
		const newGame = await db
			.insert(boardGames)
			.values({
				bggId: gameData.id,
				name: gameData.name,
				yearPublished: gameData.yearPublished,
				minPlayers: gameData.minPlayers,
				maxPlayers: gameData.maxPlayers,
				playingTime: gameData.playingTime,
				minPlayTime: gameData.minPlayTime,
				maxPlayTime: gameData.maxPlayTime,
				age: gameData.age,
				description: gameData.description,
				thumbnail: gameData.thumbnail,
				image: gameData.image,
				categories: JSON.stringify(gameData.categories),
				mechanics: JSON.stringify(gameData.mechanics),
				designers: JSON.stringify(gameData.designers),
				artists: JSON.stringify(gameData.artists),
				publishers: JSON.stringify(gameData.publishers),
				isStarred: gameData.isStarred || false,
				adminNote: gameData.adminNote || null
			})
			.returning();

		return json(newGame[0], { status: 201 });
	} catch (error) {
		console.error('Error inserting game:', error);
		return json({ error: 'Failed to insert game', reason: error }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	if (!gameData.bggId) {
		return json({ error: 'BGG ID is required for updating' }, { status: 400 });
	}

	try {
		const updatedGame = await db
			.update(boardGames)
			.set({
				name: gameData.name,
				yearPublished: gameData.yearPublished,
				minPlayers: gameData.minPlayers,
				maxPlayers: gameData.maxPlayers,
				playingTime: gameData.playingTime,
				minPlayTime: gameData.minPlayTime,
				maxPlayTime: gameData.maxPlayTime,
				age: gameData.age,
				description: gameData.description,
				thumbnail: gameData.thumbnail,
				image: gameData.image,
				categories: JSON.stringify(gameData.categories),
				mechanics: JSON.stringify(gameData.mechanics),
				designers: JSON.stringify(gameData.designers),
				artists: JSON.stringify(gameData.artists),
				publishers: JSON.stringify(gameData.publishers),
				isStarred: gameData.isStarred || false,
				adminNote: gameData.adminNote || null
			})
			.where(eq(boardGames.bggId, gameData.bggId))
			.returning();

		if (updatedGame.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		return json(updatedGame[0]);
	} catch (error) {
		console.error('Error updating game:', error);
		return json({ error: 'Failed to update game' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	const deleteAll = url.searchParams.get('deleteAll');

	if (deleteAll === 'true') {
		// Delete all games
		try {
			await db.delete(boardGames);
			return json({ message: 'All games have been deleted' });
		} catch (error) {
			console.error('Error deleting all games:', error);
			return json({ error: 'Failed to delete all games' }, { status: 500 });
		}
	} else if (id) {
		// Delete a specific game by BGG ID
		try {
			const deletedGame = await db.delete(boardGames).where(eq(boardGames.bggId, id)).returning();

			if (deletedGame.length === 0) {
				return json({ error: 'Game not found' }, { status: 404 });
			}

			return json({ message: 'Game deleted successfully', deletedGame: deletedGame[0] });
		} catch (error) {
			console.error('Error deleting game:', error);
			return json({ error: 'Failed to delete game' }, { status: 500 });
		}
	} else {
		return json(
			{ error: 'Invalid delete request. Provide an id or set deleteAll=true' },
			{ status: 400 }
		);
	}
};
