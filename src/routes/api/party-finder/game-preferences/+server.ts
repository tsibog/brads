import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { gamePreferences } = await request.json();

	if (!Array.isArray(gamePreferences) || gamePreferences.length > 4) {
		return json({ error: 'Select up to 4 games' }, { status: 400 });
	}

	// Validate all games exist
	if (gamePreferences.length > 0) {
		const existing = await db
			.select({ bggId: boardGames.bggId })
			.from(boardGames)
			.where(inArray(boardGames.bggId, gamePreferences));

		if (existing.length !== gamePreferences.length) {
			return json({ error: 'Some selected games are invalid' }, { status: 400 });
		}
	}

	// Delete existing + insert new
	await db.delete(userGamePreferences).where(eq(userGamePreferences.userId, locals.user.id));

	if (gamePreferences.length > 0) {
		await db.insert(userGamePreferences).values(
			gamePreferences.map((bggId: string) => ({
				userId: locals.user!.id,
				gameBggId: bggId
			}))
		);
	}

	return json({ success: true, message: 'Game preferences updated' });
};
