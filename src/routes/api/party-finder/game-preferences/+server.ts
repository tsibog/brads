import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { userId, gamePreferences } = await request.json();

		// Verify the user can only update their own preferences
		if (userId !== locals.user.id) {
			throw error(403, 'Forbidden');
		}

		// Validate gamePreferences is an array of strings (BGG IDs)
		if (
			!Array.isArray(gamePreferences) ||
			!gamePreferences.every((id) => typeof id === 'string' && id.length > 0)
		) {
			throw error(400, 'Invalid gamePreferences format');
		}

		// Verify all games exist in our database
		if (gamePreferences.length > 0) {
			const existingGames = await db
				.select({ bggId: boardGames.bggId })
				.from(boardGames)
				.where(inArray(boardGames.bggId, gamePreferences));

			const existingGameIds = existingGames.map((game) => game.bggId);
			const invalidGameIds = gamePreferences.filter((id) => !existingGameIds.includes(id));

			if (invalidGameIds.length > 0) {
				throw error(400, `Invalid games: ${invalidGameIds.join(', ')}`);
			}
		}

		// Delete existing preferences for this user
		await db.delete(userGamePreferences).where(eq(userGamePreferences.userId, userId));

		// Insert new preference records
		if (gamePreferences.length > 0) {
			const preferenceRecords = gamePreferences.map((gameBggId) => ({
				userId,
				gameBggId
			}));

			await db.insert(userGamePreferences).values(preferenceRecords);
		}

		return json({ success: true, message: 'Game preferences updated successfully' });
	} catch (err) {
		console.error('Error updating game preferences:', err);

		if (err instanceof Error && 'status' in err) {
			throw err;
		}

		throw error(500, 'Failed to update game preferences');
	}
};
