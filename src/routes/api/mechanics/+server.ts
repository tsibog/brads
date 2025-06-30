import { json, type RequestHandler } from "@sveltejs/kit";
import { db } from "$lib/server/db";
import { boardGames } from "$lib/server/db/schema";
import { sql } from "drizzle-orm";

export const GET: RequestHandler = async () => {
	const mechanics = await db
		.select({ mechanic: sql`json_each.value` })
		.from(boardGames)
		.innerJoin(
			sql`json_each(${boardGames.mechanics})`,
			sql`1=1`, // This is always true, effectively making it a cross join
		);

	const uniqueMechanics = [...new Set(mechanics.map((m) => m.mechanic))];
	return json(uniqueMechanics);
};
