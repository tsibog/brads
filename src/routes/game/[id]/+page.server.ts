import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/games?id=${params.id}`);

	if (!response.ok) {
		throw error(response.status, 'Failed to load game data');
	}

	const { game, similarGames } = await response.json();

	return { game, similarGames };
};
