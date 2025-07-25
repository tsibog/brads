import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';
import { like } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	const query = url.searchParams.get('query');
	
	if (!query || query.length < 2) {
		return json([]);
	}

	try {
		// Search games in the cafe's collection
		const games = await db
			.select({
				bggId: boardGames.bggId,
				name: boardGames.name,
				thumbnail: boardGames.thumbnail,
				minPlayers: boardGames.minPlayers,
				maxPlayers: boardGames.maxPlayers,
				playingTime: boardGames.playingTime,
				yearPublished: boardGames.yearPublished
			})
			.from(boardGames)
			.where(like(boardGames.name, `%${query}%`))
			.limit(20)
			.orderBy(boardGames.name);

		return json(games);

	} catch (err) {
		console.error('Error searching games:', err);
		throw error(500, 'Failed to search games');
	}
};