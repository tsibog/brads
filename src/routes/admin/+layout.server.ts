import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url, fetch }) => {
	// Allow access to the login page
	if (url.pathname === '/admin/login') {
		return {};
	}

	// Check if the user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/admin/login');
	}

	// Check if the user has admin privileges
	if (!locals.user.isAdmin) {
		// Redirect non-admin users to main site
		throw redirect(302, '/browse');
	}

	const response = await fetch('/api/comments?approvedOnly=false');
	const pendingComments = await response.json();
	const pendingCommentsCount = pendingComments.length;

	return {
		user: locals.user,
		pendingCommentsCount
	};
};
