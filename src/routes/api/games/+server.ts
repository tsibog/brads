import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, asc, desc, sql, and, or, like } from 'drizzle-orm';
import { db } from '$lib/db';
import { boardGames } from '$lib/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		// Get a specific game by ID (unchanged)
		const game = await db.select().from(boardGames).where(eq(boardGames.bggId, id));
		if (game.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		// Parse the categories of the current game
		const gameCategories = JSON.parse(game[0].categories || '[]');
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
		const minDuration = url.searchParams.get('minDuration');
		const maxDuration = url.searchParams.get('maxDuration');
		const minPlayers = url.searchParams.get('minPlayers');
		const maxPlayers = url.searchParams.get('maxPlayers');
		const categories = url.searchParams.get('categories');

		let query = db.select().from(boardGames);
		const whereConditions = [];

		// Apply filtering
		if (filterName) {
			whereConditions.push(like(boardGames.name, `%${filterName}%`));
		}
		if (minDuration) {
			whereConditions.push(sql`${boardGames.playingTime} >= ${parseInt(minDuration)}`);
		}
		if (maxDuration) {
			whereConditions.push(sql`${boardGames.playingTime} <= ${parseInt(maxDuration)}`);
		}
		if (minPlayers) {
			whereConditions.push(sql`${boardGames.minPlayers} >= ${parseInt(minPlayers)}`);
		}
		if (maxPlayers) {
			whereConditions.push(sql`${boardGames.maxPlayers} <= ${parseInt(maxPlayers)}`);
		}
		if (categories) {
			const categoryList = categories.split(',');
			const categoryConditions = categoryList.map(
				(cat) => sql`${boardGames.categories} LIKE ${'%' + cat + '%'}`
			);
			whereConditions.push(or(...categoryConditions));
		}

		if (whereConditions.length > 0) {
			query = query.where(and(...whereConditions));
		}

		// Apply sorting
		if (sortBy in boardGames) {
			query = query.orderBy(
				sortOrder === 'desc'
					? desc(boardGames[sortBy as keyof typeof boardGames])
					: asc(boardGames[sortBy as keyof typeof boardGames])
			);
		}

		// Apply pagination
		const offset = (page - 1) * limit;
		query = query.limit(limit).offset(offset);

		try {
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
			return json({ error: 'An error occurred while fetching games' }, { status: 500 });
		}
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	console.log('gameData:', gameData);

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
		return json({ error: 'ID is required for deleting a game' }, { status: 400 });
	}

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
};
