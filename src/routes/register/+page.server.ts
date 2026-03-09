import {
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/plays');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31
		) {
			return fail(400, { message: 'Username must be 3-31 characters' });
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			return fail(400, { message: 'Username can only contain letters, numbers, hyphens, and underscores' });
		}

		if (
			typeof password !== 'string' ||
			password.length < 6 ||
			password.length > 255
		) {
			return fail(400, { message: 'Password must be at least 6 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		// Email is optional
		const emailValue = typeof email === 'string' && email.trim().length > 0 ? email.trim() : null;
		if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
			return fail(400, { message: 'Invalid email address' });
		}

		try {
			// Check if username already exists
			const existing = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});
			if (existing) {
				return fail(400, { message: 'Username is already taken' });
			}

			const password_hash = await hash(password);
			const id = crypto.randomUUID();

			await db.insert(users).values({
				id,
				username,
				email: emailValue,
				password_hash,
				is_admin: false
			});

			const token = generateSessionToken();
			const session = await createSession(token, id);
			setSessionTokenCookie(event, token, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An unexpected error occurred' });
		}

		redirect(302, '/plays');
	}
};
