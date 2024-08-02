import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		// basic check
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
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});

			if (!user) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			const validPassword = await new Argon2id().verify(user.password_hash, password);
			if (!validPassword) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, {
				message: 'An unknown error occurred'
			});
		}
	}
};
