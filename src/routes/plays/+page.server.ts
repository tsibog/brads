import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url, locals }) => {
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
