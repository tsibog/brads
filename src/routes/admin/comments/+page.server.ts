import type { PageServerLoad } from '../../$types';

export const load: PageServerLoad = async ({ fetch }) => {
	const response = await fetch('/api/comments?approvedOnly=false');

	if (!response.ok) {
		throw new Error('Failed to load comments');
	}

	const comments = await response.json();

	return { comments };
};
