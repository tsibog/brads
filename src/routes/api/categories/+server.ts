import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const categories = await db
		.select({ category: sql`json_each.value` })
		.from(boardGames)
		.innerJoin(
			sql`json_each(${boardGames.categories})`,
			sql`1=1` // This is always true, effectively making it a cross join
		);

	const uniqueCategories = [...new Set(categories.map((c) => c.category))];
	return json(uniqueCategories);
};
