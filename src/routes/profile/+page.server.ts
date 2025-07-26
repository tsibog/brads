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
			contactMethod: user.contact_method,
			contactValue: user.contact_value,
			contactVisibleTo: user.contact_visible_to,
			// Legacy fields for backward compatibility
			contactEmail: user.contact_email,
			contactPhone: user.contact_phone,
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

// Helper function to validate contact information based on method
function isValidContact(method: string, value: string): boolean {
	const trimmedValue = value.trim();

	switch (method) {
		case 'email':
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedValue);
		case 'phone':
		case 'whatsapp':
			return /^[+]?[\d\s\-\(\)]{8,}$/.test(trimmedValue);
		case 'discord':
			return trimmedValue.length >= 2; // Flexible validation for Discord
		default:
			return false;
	}
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
		const contactMethod = formData.get('contact_method');
		const contactValue = formData.get('contact_value');
		const contactVisibleTo = formData.get('contact_visible_to');

		// Validate input types
		if (
			typeof displayName !== 'string' ||
			typeof bio !== 'string' ||
			typeof experienceLevel !== 'string' ||
			typeof vibePreference !== 'string' ||
			typeof contactMethod !== 'string' ||
			typeof contactValue !== 'string' ||
			typeof contactVisibleTo !== 'string'
		) {
			return fail(400, { message: 'Invalid input types' });
		}

		// Sanitize inputs
		const cleanDisplayName = sanitizeInput(displayName);
		const cleanBio = sanitizeInput(bio);
		const cleanContactMethod = sanitizeInput(contactMethod);
		const cleanContactValue = sanitizeInput(contactValue);

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

		// Validate contact method and value
		const validMethods = ['email', 'phone', 'whatsapp', 'discord'];
		if (!validMethods.includes(cleanContactMethod)) {
			return fail(400, { message: 'Invalid contact method selected' });
		}

		if (cleanContactValue.trim() && !isValidContact(cleanContactMethod, cleanContactValue)) {
			const methodName =
				cleanContactMethod === 'whatsapp'
					? 'WhatsApp number'
					: cleanContactMethod === 'discord'
						? 'Discord username'
						: cleanContactMethod;
			return fail(400, { message: `Please enter a valid ${methodName}` });
		}

		try {
			await db
				.update(users)
				.set({
					display_name: cleanDisplayName,
					bio: cleanBio || null,
					experience_level: experienceLevel,
					vibe_preference: vibePreference,
					contact_method: cleanContactMethod,
					contact_value: cleanContactValue.trim() || null,
					contact_visible_to: contactVisibleTo,
					// Update email field for login purposes if contact method is email
					email: cleanContactMethod === 'email' ? cleanContactValue.trim() : locals.user.email,
					// Keep legacy fields for compatibility during transition
					contact_email: cleanContactMethod === 'email' ? cleanContactValue.trim() : null,
					contact_phone: ['phone', 'whatsapp'].includes(cleanContactMethod)
						? cleanContactValue.trim()
						: null,
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
	}
};
