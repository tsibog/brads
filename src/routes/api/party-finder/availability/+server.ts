import { json, error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { userAvailability } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) {
		throw error(401, 'Unauthorized');
	}

	try {
		const { userId, selectedDays } = await request.json();

		// Verify the user can only update their own availability
		if (userId !== locals.user.id) {
			throw error(403, 'Forbidden');
		}

		// Validate selectedDays is an array of numbers 0-6
		if (!Array.isArray(selectedDays) || !selectedDays.every(day => 
			typeof day === 'number' && day >= 0 && day <= 6
		)) {
			throw error(400, 'Invalid selectedDays format');
		}

		// Delete existing availability for this user
		await db.delete(userAvailability).where(eq(userAvailability.userId, userId));

		// Insert new availability records
		if (selectedDays.length > 0) {
			const availabilityRecords = selectedDays.map(dayOfWeek => ({
				userId,
				dayOfWeek,
				timeSlotStart: null, // Future: time slots
				timeSlotEnd: null    // Future: time slots
			}));

			await db.insert(userAvailability).values(availabilityRecords);
		}

		return json({ success: true, message: 'Availability updated successfully' });

	} catch (err) {
		console.error('Error updating availability:', err);
		
		if (err instanceof Error && 'status' in err) {
			throw err;
		}
		
		throw error(500, 'Failed to update availability');
	}
};