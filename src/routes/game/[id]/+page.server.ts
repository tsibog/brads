import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch, url }) => {
	const id = params.id;

	if (!id) {
		throw error(400, 'Missing game ID');
	}

	const [gameResponse, commentsResponse] = await Promise.all([
		fetch(`/api/games?id=${id}`),
		fetch(`/api/comments?gameId=${id}&approvedOnly=true`)
	]);

	if (!gameResponse.ok || !commentsResponse.ok) {
		throw error(gameResponse.status || commentsResponse.status, 'Failed to load data');
	}

	const { game, similarGames } = await gameResponse.json();
	const comments = await commentsResponse.json();

	// Record page view (fire-and-forget, don't block page load)
	fetch('/api/analytics', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify({ gameId: id, path: url.pathname })
	}).catch(() => {
		// Silently ignore tracking failures
	});

	return { game, similarGames, comments };
};
