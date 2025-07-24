import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load = async ({ locals }) => {
	// Redirect if not authenticated
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Get fresh user data from database
	const user = await db.query.users.findFirst({
		where: (users, { eq }) => eq(users.id, locals.user!.id)
	});

	if (!user) {
		redirect(302, '/login');
	}

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			displayName: user.display_name,
			bio: user.bio,
			experienceLevel: user.experience_level,
			vibePreference: user.vibe_preference,
			contactEmail: user.contact_email,
			contactPhone: user.contact_phone,
			contactVisibleTo: user.contact_visible_to,
			lookingForParty: user.looking_for_party,
			partyStatus: user.party_status,
			openToAnyGame: user.open_to_any_game,
			lastLogin: user.last_login
		}
	};
};

// Helper function to sanitize input
function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, '') // Remove potential XSS characters
		.substring(0, 255); // Limit length
}

export const actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const displayName = formData.get('display_name');
		const bio = formData.get('bio');
		const experienceLevel = formData.get('experience_level');
		const vibePreference = formData.get('vibe_preference');
		const contactEmail = formData.get('contact_email');
		const contactPhone = formData.get('contact_phone');
		const contactVisibleTo = formData.get('contact_visible_to');

		// Validate input types
		if (
			typeof displayName !== 'string' ||
			typeof bio !== 'string' ||
			typeof experienceLevel !== 'string' ||
			typeof vibePreference !== 'string' ||
			typeof contactEmail !== 'string' ||
			typeof contactPhone !== 'string' ||
			typeof contactVisibleTo !== 'string'
		) {
			return fail(400, { message: 'Invalid input types' });
		}

		// Sanitize inputs
		const cleanDisplayName = sanitizeInput(displayName);
		const cleanBio = sanitizeInput(bio);
		const cleanContactEmail = sanitizeInput(contactEmail);
		const cleanContactPhone = sanitizeInput(contactPhone);

		// Validate display name
		if (cleanDisplayName.length < 1 || cleanDisplayName.length > 50) {
			return fail(400, {
				message: 'Display name must be between 1-50 characters'
			});
		}

		// Validate bio length
		if (cleanBio.length > 500) {
			return fail(400, {
				message: 'Bio must be less than 500 characters'
			});
		}

		// Validate experience level
		if (!['beginner', 'intermediate', 'advanced'].includes(experienceLevel)) {
			return fail(400, { message: 'Invalid experience level' });
		}

		// Validate vibe preference
		if (!['casual', 'competitive', 'both'].includes(vibePreference)) {
			return fail(400, { message: 'Invalid vibe preference' });
		}

		// Validate contact visibility
		if (!['none', 'matches', 'all'].includes(contactVisibleTo)) {
			return fail(400, { message: 'Invalid contact visibility setting' });
		}

		// Validate contact email format if provided
		if (cleanContactEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanContactEmail)) {
			return fail(400, { message: 'Invalid contact email format' });
		}

		try {
			await db
				.update(users)
				.set({
					display_name: cleanDisplayName,
					bio: cleanBio || null,
					experience_level: experienceLevel,
					vibe_preference: vibePreference,
					contact_email: cleanContactEmail || null,
					contact_phone: cleanContactPhone || null,
					contact_visible_to: contactVisibleTo,
					updated_at: new Date()
				})
				.where(eq(users.id, locals.user.id));

			return { success: true, message: 'Profile updated successfully' };
		} catch (error) {
			console.error('Profile update error:', error);
			return fail(500, {
				message: 'An error occurred while updating your profile'
			});
		}
	},

	updatePartyStatus: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const lookingForParty = formData.get('looking_for_party') === 'on';
		const partyStatus = formData.get('party_status');
		const openToAnyGame = formData.get('open_to_any_game') === 'on';

		// Validate party status
		if (typeof partyStatus !== 'string' || !['active', 'resting'].includes(partyStatus)) {
			return fail(400, { message: 'Invalid party status' });
		}

		try {
			await db
				.update(users)
				.set({
					looking_for_party: lookingForParty,
					party_status: partyStatus,
					open_to_any_game: openToAnyGame,
					updated_at: new Date()
				})
				.where(eq(users.id, locals.user.id));

			return { success: true, message: 'Party finder settings updated' };
		} catch (error) {
			console.error('Party status update error:', error);
			return fail(500, {
				message: 'An error occurred while updating your party finder settings'
			});
		}
	}
};
