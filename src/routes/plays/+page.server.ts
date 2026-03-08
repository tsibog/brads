import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const period = url.searchParams.get('period') || 'all';

	const statsResponse = await fetch(`/api/plays/stats?period=${period}`);
	const stats = await statsResponse.json();

	return {
		stats,
		period
	};
};
