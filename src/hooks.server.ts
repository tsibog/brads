import {
	getSessionToken,
	validateSessionToken,
	setSessionTokenCookie,
	deleteSessionTokenCookie
} from '$lib/server/auth';
import { redirect, type Handle } from '@sveltejs/kit';
import { sequence } from '@sveltejs/kit/hooks';
import { createHandle } from 'flags/sveltekit';
import { FLAGS_SECRET } from '$env/static/private';
import * as flags from '$lib/flags';

const flagsHandle = createHandle({ secret: FLAGS_SECRET, flags });

const authHandle: Handle = async ({ event, resolve }) => {
	const token = getSessionToken(event);
	if (!token) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await validateSessionToken(token);
	if (session) {
		setSessionTokenCookie(event, token, session.expiresAt);
	} else {
		deleteSessionTokenCookie(event);
	}
	event.locals.user = user;
	event.locals.session = session;

	// Force password reset redirect
	if (user?.must_reset_password) {
		const path = event.url.pathname;
		if (path !== '/reset-password' && path !== '/logout' && !path.startsWith('/api/')) {
			redirect(302, '/reset-password');
		}
	}

	return resolve(event);
};

export const handle = sequence(flagsHandle, authHandle);
