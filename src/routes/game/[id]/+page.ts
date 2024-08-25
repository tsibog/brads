import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const [gameResponse, commentsResponse] = await Promise.all([
		fetch(`/api/games?id=${params.id}`),
		fetch(`/api/comments?gameId=${params.id}&approvedOnly=true`)
	]);

	if (!gameResponse.ok || !commentsResponse.ok) {
		throw new Error('Failed to load data');
	}

	const { game, similarGames } = await gameResponse.json();
	const comments = await commentsResponse.json();

	return { game, similarGames, comments };
};
