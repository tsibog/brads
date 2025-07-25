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

// Helper function to validate email format
function isValidEmail(email: string): boolean {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
	return emailRegex.test(email);
}

// Helper function to validate phone format
function isValidPhone(phone: string): boolean {
	// Basic phone validation - at least 8 digits, allows international format
	const phoneRegex = /^[+]?[\d\s\-\(\)]{8,}$/;
	return phoneRegex.test(phone.trim());
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
		const email = formData.get('email');
		const phone = formData.get('phone');
		const password = formData.get('password');
		const displayName = formData.get('display_name');
		const selectedGamesData = formData.get('selected_games');

		console.log('init get', selectedGamesData);

		// Basic input validation
		if (
			typeof username !== 'string' ||
			typeof password !== 'string' ||
			typeof displayName !== 'string' ||
			(email !== null && typeof email !== 'string') ||
			(phone !== null && typeof phone !== 'string') ||
			(selectedGamesData !== null && typeof selectedGamesData !== 'string')
		) {
			return fail(400, {
				message: 'Invalid input types'
			});
		}

		// Sanitize inputs
		const cleanUsername = sanitizeInput(username);
		const cleanEmail = email ? sanitizeInput(email) : '';
		const cleanPhone = phone ? sanitizeInput(phone) : '';
		const cleanDisplayName = sanitizeInput(displayName);

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

		// Contact validation - either email OR phone required
		if (!cleanEmail.trim() && !cleanPhone.trim()) {
			return fail(400, {
				message: 'Either email or phone number is required'
			});
		}

		// Validate email format if provided
		if (cleanEmail.trim() && !isValidEmail(cleanEmail)) {
			return fail(400, {
				message: 'Please enter a valid email address'
			});
		}

		// Validate phone format if provided
		if (cleanPhone.trim() && !isValidPhone(cleanPhone)) {
			return fail(400, {
				message: 'Please enter a valid phone number'
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
			// Check for existing username, email, or phone (case-insensitive)
			const conditions = [sql`lower(${users.username}) = lower(${cleanUsername})`];

			if (cleanEmail.trim()) {
				conditions.push(sql`lower(${users.email}) = lower(${cleanEmail})`);
				conditions.push(sql`lower(${users.contact_email}) = lower(${cleanEmail})`);
			}

			if (cleanPhone.trim()) {
				conditions.push(sql`${users.contact_phone} = ${cleanPhone}`);
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
				if (
					cleanEmail.trim() &&
					(existingUser.email?.toLowerCase() === cleanEmail.toLowerCase() ||
						existingUser.contact_email?.toLowerCase() === cleanEmail.toLowerCase())
				) {
					return fail(400, {
						message: 'Email already exists'
					});
				}
				if (cleanPhone.trim() && existingUser.contact_phone === cleanPhone) {
					return fail(400, {
						message: 'Phone number already exists'
					});
				}
			}

			// Hash password
			const passwordHash = await new Argon2id().hash(password);

			// Create user
			const userId = generateId(15);
			await db.insert(users).values({
				id: userId,
				username: cleanUsername,
				email: cleanEmail.trim() || null, // For login purposes
				password_hash: passwordHash,
				display_name: cleanDisplayName,
				is_admin: false,
				party_status: 'resting', // Default to resting
				contact_email: cleanEmail.trim() || null, // For party finder contact
				contact_phone: cleanPhone.trim() || null, // For party finder contact
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
