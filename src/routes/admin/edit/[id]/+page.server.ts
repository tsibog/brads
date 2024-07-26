import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

export const load = (async ({ params, fetch }) => {
	const id = params.id;

	if (!id) {
		throw error(400, 'Missing game ID');
	}

	const response = await fetch(`/api/games?id=${id}`);

	if (!response.ok) {
		throw error(response.status, 'Failed to load game data');
	}

	const game = await response.json();

	return { game };
}) satisfies PageServerLoad;
