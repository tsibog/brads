import { json, type RequestHandler } from '@sveltejs/kit';

import { db } from '$lib/db';
import { users } from '$lib/db/schema';

export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, email } = await request.json();
	const newUser = await db.insert(users).values({ name, email }).returning();
	return json(newUser[0]);
};
