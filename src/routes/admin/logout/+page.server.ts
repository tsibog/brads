import { invalidateSession, deleteSessionTokenCookie } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async (event) => {
		if (!event.locals.session) {
			return fail(401);
		}

		await invalidateSession(event.locals.session.id);
		deleteSessionTokenCookie(event);

		redirect(302, '/admin/login');
	}
};
