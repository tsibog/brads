import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { like } from 'drizzle-orm';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Authentication required' }, { status: 401 });
	}

	const q = url.searchParams.get('q')?.trim();
	if (!q || q.length < 1) {
		return json([]);
	}

	const results = await db
		.select({
			id: users.id,
			username: users.username
		})
		.from(users)
		.where(like(users.username, `%${q}%`))
		.limit(10);

	// Exclude the current user from results
	const filtered = results.filter((u) => u.id !== locals.user!.id);

	return json(filtered);
};
