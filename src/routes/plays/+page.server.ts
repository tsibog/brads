import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { showPlays } from '$lib/flags';

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
	if (!(await showPlays())) {
		error(404, 'Not found');
	}

	const period = url.searchParams.get('period') || 'all';

	let stats = {
		mostPlayed: [],
		totals: { totalPlays: 0, totalPlayerSessions: 0, uniqueGames: 0, uniqueUsers: 0 },
		recentPlays: [],
		byDayOfWeek: [],
		topPlayers: []
	};

	try {
		const statsResponse = await fetch(`/api/plays/stats?period=${period}`);
		if (statsResponse.ok) {
			const data = await statsResponse.json();
			if (!data.error) stats = data;
		}
	} catch {
		// Stats API failed — use defaults
	}

	return {
		stats,
		period,
		user: locals.user
	};
};
