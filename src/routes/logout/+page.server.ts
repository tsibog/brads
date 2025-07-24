import { lucia } from '$lib/server/auth';
import { redirect } from '@sveltejs/kit';

export const actions = {
	default: async ({ locals, cookies }) => {
		if (!locals.session) {
			redirect(302, '/');
		}

		await lucia.invalidateSession(locals.session.id);
		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/browse');
	}
};
