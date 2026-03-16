import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userAvailability } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const { selectedDays } = await request.json();

	if (!Array.isArray(selectedDays) || selectedDays.some((d: any) => typeof d !== 'number' || d < 0 || d > 6)) {
		return json({ error: 'Invalid days' }, { status: 400 });
	}

	// Delete existing + insert new
	await db.delete(userAvailability).where(eq(userAvailability.userId, locals.user.id));

	if (selectedDays.length > 0) {
		await db.insert(userAvailability).values(
			selectedDays.map((day: number) => ({
				userId: locals.user!.id,
				dayOfWeek: day
			}))
		);
	}

	return json({ success: true, message: 'Availability updated' });
};
