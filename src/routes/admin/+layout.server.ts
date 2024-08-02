// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Allow access to the login page
	if (url.pathname === '/admin/login') {
		return {};
	}

	// Check if the user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/admin/login');
	}

	// If authenticated and admin, allow access
	return {
		user: locals.user
	};
};
