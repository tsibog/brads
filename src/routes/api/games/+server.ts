import { json, type RequestHandler } from '@sveltejs/kit';
import { and, type AnyColumn, asc, desc, eq, like, or, sql } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		// Get a specific game by ID (unchanged)
		const game = await db.select().from(boardGames).where(eq(boardGames.bggId, id));
		if (game.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		// Parse the categories of the current game
		let gameCategories;
		try {
			gameCategories = JSON.parse(game[0].categories || '[]');
			if (!Array.isArray(gameCategories)) {
				gameCategories = [];
			}
		} catch (error) {
			gameCategories = [];
		}
		// Construct the LIKE conditions for each category
		const categoryConditions = gameCategories.map(
			(category: string) => sql`${boardGames.categories} LIKE ${`%${category}%`}`
		);

		// Fetch similar games
		const similarGames = await db
			.select()
			.from(boardGames)
			.where(and(or(...categoryConditions), sql`${boardGames.bggId} != ${id}`))
			.limit(4);

		return json({ game: game[0], similarGames });
	} else {
		// Get all games with pagination, sorting, and filtering
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const sortOrder = url.searchParams.get('sortOrder') || 'asc';
		const filterName = url.searchParams.get('name');
		const duration = url.searchParams.get('duration');
		const players = url.searchParams.get('players');
		const mechanics = url.searchParams.get('mechanics');

		let query = db.select().from(boardGames);
		const whereConditions = [];

		// Apply filtering
		if (filterName) {
			whereConditions.push(like(boardGames.name, `%${filterName}%`));
		}
		if (duration) {
			whereConditions.push(sql`${boardGames.playingTime} <= ${parseInt(duration)}`);
		}
		if (players) {
			const playersNum = parseInt(players);
			whereConditions.push(
				sql`${boardGames.minPlayers} <= ${playersNum} AND ${boardGames.maxPlayers} >= ${playersNum}`
			);
		}
		if (mechanics) {
			const mechanicList = mechanics.split(',');
			const mechanicConditions = mechanicList.map(
				(mech) => sql`${boardGames.mechanics} LIKE ${'%' + mech + '%'}`
			);
			whereConditions.push(or(...mechanicConditions));
		}

		if (whereConditions.length > 0) {
			// @ts-ignore
			query = query.where(and(...whereConditions));
		}

		// Apply sorting
		const sortableColumns: Record<string, AnyColumn> = {
			id: boardGames.id,
			name: boardGames.name,
			yearPublished: boardGames.yearPublished,
			playingTime: boardGames.playingTime,
			minPlayers: boardGames.minPlayers,
			adminNote: boardGames.adminNote
		};
		if (sortBy && sortableColumns[sortBy]) {
			// @ts-ignore
			query = query.orderBy(
				sortOrder === 'desc' ? desc(sortableColumns[sortBy]) : asc(sortableColumns[sortBy])
			);
		}

		// Apply pagination
		const offset = (page - 1) * limit;
		// @ts-ignore
		query = query.limit(limit).offset(offset);

		try {
			// @ts-ignore
			const games = await query;

			// Get total count for pagination
			const countQuery = db
				.select({ count: sql`count(*)` })
				.from(boardGames)
				.where(and(...whereConditions));

			const totalCountResult = await countQuery;
			const totalCount = Number(totalCountResult[0].count);

			return json({
				data: games,
				meta: {
					totalCount,
					page,
					limit,
					totalPages: Math.ceil(totalCount / limit)
				}
			});
		} catch (error) {
			console.error('Error executing query:', error);
			return json(
				{ error: 'An error occurred while fetching games' },
				{
					status: 500
				}
			);
		}
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
				isStarred: gameData.starred || false,
				adminNote: gameData.adminNote || null
			})
			.returning();

		return json(newGame[0], { status: 201 });
	} catch (error) {
		console.error('Error inserting game:', error);
		return json(
			{ error: 'Failed to insert game', reason: error },
			{
				status: 500
			}
		);
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	if (!gameData.bggId) {
		return json(
			{ error: 'BGG ID is required for updating' },
			{
				status: 400
			}
		);
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
				isStarred: gameData.starred || false,
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

	if (!id) {
		return json(
			{ error: 'ID is required for deleting a game' },
			{
				status: 400
			}
		);
	}

	try {
		const deletedGame = await db.delete(boardGames).where(eq(boardGames.bggId, id)).returning();

		if (deletedGame.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		return json({
			message: 'Game deleted successfully',
			deletedGame: deletedGame[0]
		});
	} catch (error) {
		console.error('Error deleting game:', error);
		return json({ error: 'Failed to delete game' }, { status: 500 });
	}
};
