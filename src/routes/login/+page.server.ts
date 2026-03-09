import {
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { verify } from '@node-rs/argon2';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/plays');
	}
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		if (
			typeof username !== 'string' ||
			username.length < 1 ||
			username.length > 31 ||
			typeof password !== 'string' ||
			password.length < 1 ||
			password.length > 255
		) {
			return fail(400, { message: 'Invalid input' });
		}

		try {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});

			if (!user) {
				return fail(400, { message: 'Incorrect username or password' });
			}

			const validPassword = await verify(user.password_hash, password);
			if (!validPassword) {
				return fail(400, { message: 'Incorrect username or password' });
			}

			const token = generateSessionToken();
			const session = await createSession(token, user.id);
			setSessionTokenCookie(event, token, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An unexpected error occurred' });
		}

		redirect(302, '/plays');
	}
};
