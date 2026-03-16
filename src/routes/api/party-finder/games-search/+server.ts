import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';
import { like } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const query = url.searchParams.get('query')?.trim();
	if (!query || query.length < 2) {
		return json([]);
	}

	const results = await db
		.select({
			bggId: boardGames.bggId,
			name: boardGames.name,
			thumbnail: boardGames.thumbnail,
			minPlayers: boardGames.minPlayers,
			maxPlayers: boardGames.maxPlayers,
			playingTime: boardGames.playingTime
		})
		.from(boardGames)
		.where(like(boardGames.name, `%${query}%`))
		.orderBy(boardGames.name)
		.limit(20);

	return json(results);
};
