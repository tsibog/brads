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

	const response = await fetch('/api/comments?approvedOnly=false');
	const pendingComments = await response.json();
	const pendingCommentsCount = pendingComments.length;

	return {
		user: locals.user,
		pendingCommentsCount
	};
};
