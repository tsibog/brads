import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

export const load: PageServerLoad = async ({ locals }) => {
	// Must be logged in
	if (!locals.user) {
		redirect(302, '/login');
	}

	// Only show this page if they need to reset
	if (!locals.user.must_reset_password) {
		redirect(302, '/plays');
	}

	return { username: locals.user.username };
};

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.user) {
			redirect(302, '/login');
		}

		const formData = await event.request.formData();
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');

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

		// Don't allow setting it back to the temp password
		if (password === 'amnesiac') {
			return fail(400, { message: 'Please choose a different password' });
		}

		try {
			const password_hash = await hash(password);
			await db
				.update(users)
				.set({ password_hash, must_reset_password: false })
				.where(eq(users.id, event.locals.user.id));
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An unexpected error occurred' });
		}

		redirect(302, '/plays');
	}
};
