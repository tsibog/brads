import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/games?id=${params.id}`);

	if (!response.ok) {
		throw new Error('Failed to load game data');
	}

	const { game, similarGames } = await response.json();

	return { game, similarGames };
};
