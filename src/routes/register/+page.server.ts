import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../$types';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { generateId } from 'lucia';
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
		const password = formData.get('password');
		const displayName = formData.get('display_name');

		// Basic input validation
		if (
			typeof username !== 'string' ||
			typeof email !== 'string' ||
			typeof password !== 'string' ||
			typeof displayName !== 'string'
		) {
			return fail(400, {
				message: 'Invalid input types'
			});
		}

		// Sanitize inputs
		const cleanUsername = sanitizeInput(username);
		const cleanEmail = sanitizeInput(email);
		const cleanDisplayName = sanitizeInput(displayName);

		// Validate username
		if (cleanUsername.length < 3 || cleanUsername.length > 31) {
			return fail(400, {
				message: 'Username must be between 3-31 characters'
			});
		}

		// Validate email
		if (!isValidEmail(cleanEmail)) {
			return fail(400, {
				message: 'Please enter a valid email address'
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
			// Check for existing username or email (case-insensitive)
			const existingUser = await db.query.users.findFirst({
				where: (users, { eq, or, sql }) =>
					or(
						sql`lower(${users.username}) = lower(${cleanUsername})`,
						sql`lower(${users.email}) = lower(${cleanEmail})`
					)
			});

			if (existingUser) {
				if (existingUser.username.toLowerCase() === cleanUsername.toLowerCase()) {
					return fail(400, {
						message: 'Username already exists'
					});
				}
				if (existingUser.email?.toLowerCase() === cleanEmail.toLowerCase()) {
					return fail(400, {
						message: 'Email already exists'
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
				email: cleanEmail,
				password_hash: passwordHash,
				display_name: cleanDisplayName,
				is_admin: false,
				party_status: 'resting', // Default to resting
				last_login: new Date()
			});

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
