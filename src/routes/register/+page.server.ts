import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../$types';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';
import { boardGames, userGamePreferences, users } from '$lib/server/db/schema';
import { generateId } from 'lucia';
import { inArray, sql } from 'drizzle-orm';
import { RateLimiter } from 'sveltekit-rate-limiter/server';

// Registration rate limiting: 3 attempts per hour per IP
const registerLimiter = new RateLimiter({
	IP: [3, 'h'], // 3 attempts per hour per IP
	IPUA: [2, 'h'] // 2 attempts per hour per IP+UserAgent combo
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/browse');
	}
};

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

// Helper function to validate selected games
async function validateSelectedGames(
	selectedGames: string[]
): Promise<{ isValid: boolean; validGames: string[] }> {
	if (!Array.isArray(selectedGames) || selectedGames.length < 1 || selectedGames.length > 4) {
		return { isValid: false, validGames: [] };
	}

	try {
		// Check if all selected games exist in our database
		const existingGames = await db
			.select({ bggId: boardGames.bggId })
			.from(boardGames)
			.where(inArray(boardGames.bggId, selectedGames));

		const validBggIds = existingGames.map((g) => g.bggId);
		const validGames = selectedGames.filter((gameId) => validBggIds.includes(gameId));

		return {
			isValid:
				validGames.length === selectedGames.length &&
				validGames.length >= 1 &&
				validGames.length <= 4,
			validGames
		};
	} catch (error) {
		console.error('Error validating games:', error);
		return { isValid: false, validGames: [] };
	}
}

// Helper function to validate password strength
function isValidPassword(password: string): boolean {
	// Minimum 8 characters, at least one uppercase, one lowercase, one number
	if (password.length < 8) return false;
	if (!/[A-Z]/.test(password)) return false;
	if (!/[a-z]/.test(password)) return false;
	if (!/[0-9]/.test(password)) return false;
	return true;
}

// Helper function to sanitize input
function sanitizeInput(input: string): string {
	return input
		.trim()
		.replace(/[<>]/g, '') // Remove potential XSS characters
		.substring(0, 255); // Limit length
}

export const actions: Actions = {
	default: async (event) => {
		// Rate limiting check
		if (await registerLimiter.isLimited(event)) {
			return fail(429, {
				message: 'Too many registration attempts. Please try again later.'
			});
		}

		const { request, cookies } = event;
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');
		const displayName = formData.get('display_name');
		const contactMethod = formData.get('contact_method');
		const contactValue = formData.get('contact_value');
		const selectedGamesData = formData.get('selected_games');

		console.log('init get', selectedGamesData);

		// Basic input validation
		if (
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			typeof displayName !== 'string' ||
			typeof contactMethod !== 'string' ||
			typeof contactValue !== 'string' ||
			(selectedGamesData !== null && typeof selectedGamesData !== 'string')
		) {
			return fail(400, {
				message: 'Invalid input types'
			});
		}

		// Sanitize inputs
		const cleanUsername = sanitizeInput(username);
		const cleanDisplayName = sanitizeInput(displayName);
		const cleanContactMethod = sanitizeInput(contactMethod);
		const cleanContactValue = sanitizeInput(contactValue);

		// Parse selected games
		let selectedGames: string[] = [];
		try {
			if (selectedGamesData) {
				selectedGames = JSON.parse(selectedGamesData);
				console.log('selectedGamesData parsed', selectedGames);
			}
		} catch (error) {
			return fail(400, {
				message: 'Invalid game selection data'
			});
		}

		// Validate username
		if (cleanUsername.length < 3 || cleanUsername.length > 31) {
			return fail(400, {
				message: 'Username must be between 3-31 characters'
			});
		}

		// Validate contact method
		const validMethods = ['email', 'phone', 'whatsapp', 'discord'];
		if (!validMethods.includes(cleanContactMethod)) {
			return fail(400, {
				message: 'Invalid contact method selected'
			});
		}

		// Validate contact value
		if (!cleanContactValue.trim()) {
			return fail(400, {
				message: 'Contact information is required'
			});
		}

		if (!isValidContact(cleanContactMethod, cleanContactValue)) {
			const methodName =
				cleanContactMethod === 'whatsapp'
					? 'WhatsApp number'
					: cleanContactMethod === 'discord'
						? 'Discord username'
						: cleanContactMethod;
			return fail(400, {
				message: `Please enter a valid ${methodName}`
			});
		}

		// Validate game selection
		const gameValidation = await validateSelectedGames(selectedGames);
		console.log(gameValidation);
		if (!gameValidation.isValid) {
			return fail(400, {
				message: 'Please select between 1-4 games from our café collection'
			});
		}

		// Validate password
		if (!isValidPassword(password)) {
			return fail(400, {
				message: 'Password must be at least 8 characters with uppercase, lowercase, and number'
			});
		}

		// Validate display name
		if (cleanDisplayName.length < 1 || cleanDisplayName.length > 50) {
			return fail(400, {
				message: 'Display name must be between 1-50 characters'
			});
		}

		try {
			// Check for existing username and contact info
			const conditions = [sql`lower(${users.username}) = lower(${cleanUsername})`];

			// Check for duplicate contact information based on method
			if (cleanContactMethod === 'email') {
				conditions.push(sql`lower(${users.email}) = lower(${cleanContactValue})`);
				conditions.push(sql`lower(${users.contact_email}) = lower(${cleanContactValue})`);
				conditions.push(
					sql`${users.contact_method} = 'email' AND lower(${users.contact_value}) = lower(${cleanContactValue})`
				);
			} else if (cleanContactMethod === 'phone' || cleanContactMethod === 'whatsapp') {
				conditions.push(sql`${users.contact_phone} = ${cleanContactValue}`);
				conditions.push(
					sql`(${users.contact_method} = 'phone' OR ${users.contact_method} = 'whatsapp') AND ${users.contact_value} = ${cleanContactValue}`
				);
			} else if (cleanContactMethod === 'discord') {
				conditions.push(
					sql`${users.contact_method} = 'discord' AND lower(${users.contact_value}) = lower(${cleanContactValue})`
				);
			}

			const existingUser = await db.query.users.findFirst({
				where: (users, { or }) => or(...conditions)
			});

			if (existingUser) {
				if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
					return fail(400, {
						message: 'Username already exists'
					});
				}
				// Contact information conflict
				const methodName =
					cleanContactMethod === 'whatsapp'
						? 'WhatsApp number'
						: cleanContactMethod === 'discord'
							? 'Discord username'
							: cleanContactMethod;
				return fail(400, {
					message: `This ${methodName} is already registered`
				});
			}

			// Hash password
			const passwordHash = await new Argon2id().hash(password);

			// Create user
			const userId = generateId(15);
			await db.insert(users).values({
				id: userId,
				username: cleanUsername,
				email: cleanContactMethod === 'email' ? cleanContactValue.trim() : null, // For login purposes
				password_hash: passwordHash,
				display_name: cleanDisplayName,
				is_admin: false,
				party_status: 'active', // Default to active
				contact_method: cleanContactMethod,
				contact_value: cleanContactValue.trim(),
				// Keep legacy fields for compatibility during transition
				contact_email: cleanContactMethod === 'email' ? cleanContactValue.trim() : null,
				contact_phone: ['phone', 'whatsapp'].includes(cleanContactMethod)
					? cleanContactValue.trim()
					: null,
				last_login: new Date()
			});

			// Insert game preferences
			if (gameValidation.validGames.length > 0) {
				const gamePreferenceValues = gameValidation.validGames.map((gameBggId) => ({
					userId,
					gameBggId
				}));

				await db.insert(userGamePreferences).values(gamePreferenceValues);
			}

			// Create session
			const session = await lucia.createSession(userId, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (error) {
			console.error('Registration error:', error);
			return fail(500, {
				message: 'An error occurred during registration. Please try again.'
			});
		}

		// Redirect outside of try/catch so it's not caught
		redirect(302, '/browse');
	}
};
