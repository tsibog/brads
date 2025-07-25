import { redirect, fail } from '@sveltejs/kit';
import type { PageServerLoad, Actions } from './$types';
import { db } from '$lib/server/db';
import { systemSettings } from '$lib/server/db/schema.js';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Ensure user is admin
	if (!locals.user?.isAdmin) {
		throw redirect(302, '/admin/login');
	}

	// Load current party finder settings
	const settings = await db
		.select()
		.from(systemSettings)
		.where(eq(systemSettings.key, 'party_finder_inactive_days'));

	const inactiveDays = settings[0]?.value || '14';

	return {
		inactiveDays: parseInt(inactiveDays)
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, locals }) => {
		// Ensure user is admin
		if (!locals.user?.isAdmin) {
			return fail(403, { error: 'Unauthorized' });
		}

		const formData = await request.formData();
		const inactiveDays = formData.get('inactiveDays') as string;

		// Validate input
		const days = parseInt(inactiveDays);
		if (isNaN(days) || days < 1 || days > 365) {
			return fail(400, {
				error: 'Invalid number of days. Must be between 1 and 365.',
				inactiveDays
			});
		}

		try {
			// Update or insert the setting
			await db
				.insert(systemSettings)
				.values({
					key: 'party_finder_inactive_days',
					value: days.toString(),
					description: 'Days before inactive users are automatically set to resting',
					updatedAt: new Date()
				})
				.onConflictDoUpdate({
					target: systemSettings.key,
					set: {
						value: days.toString(),
						updatedAt: new Date()
					}
				});

			return {
				success: true,
				message: `Settings updated successfully. Users inactive for ${days} days will be automatically set to resting.`
			};
		} catch (error) {
			console.error('Error updating party finder settings:', error);
			return fail(500, {
				error: 'Failed to update settings. Please try again.',
				inactiveDays
			});
		}
	}
};
