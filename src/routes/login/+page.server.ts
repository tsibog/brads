import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from '../$types';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';
import { RateLimiter } from 'sveltekit-rate-limiter/server';
import { reactivateUserIfAutoRested } from '$lib/server/partyFinderUtils.js';

// Login rate limiting: 5 attempts per 15 minutes per IP
const loginLimiter = new RateLimiter({
	IP: [5, '15m'], // 5 attempts per 15 minutes per IP
	IPUA: [3, '15m'] // 3 attempts per 15 minutes per IP+UserAgent combo
});

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/browse');
	}
};

export const actions: Actions = {
	default: async (event) => {
		// Rate limiting check
		if (await loginLimiter.isLimited(event)) {
			return fail(429, {
				message: 'Too many login attempts. Please try again later.'
			});
		}

		const { request, cookies } = event;
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// Basic input validation
		if (
			typeof username !== 'string' ||
			username.length < 1 ||
			username.length > 31 ||
			typeof password !== 'string' ||
			password.length < 1 ||
			password.length > 255
		) {
			return fail(400, {
				message: 'Invalid input'
			});
		}

		try {
			// Find user by username (case-insensitive)
			const user = await db.query.users.findFirst({
				where: (users, { sql }) => sql`lower(${users.username}) = lower(${username})`
			});

			if (!user) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			// Verify password
			const validPassword = await new Argon2id().verify(user.password_hash, password);
			if (!validPassword) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			// Update last_login and handle party finder reactivation for non-admin users
			if (!user.is_admin) {
				await reactivateUserIfAutoRested(user.id);
			}

			// Create session
			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});
		} catch (error) {
			console.error('Login error:', error);
			return fail(500, {
				message: 'An error occurred during login. Please try again.'
			});
		}

		// Redirect outside of try/catch so it's not caught
		redirect(302, '/browse');
	}
};
