import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, fetch }) => {
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

	return { game, similarGames, comments };
};
