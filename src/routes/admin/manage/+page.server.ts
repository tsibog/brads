import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const searchQuery = url.searchParams.get('search') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (searchQuery) {
		apiUrl.searchParams.set('name', searchQuery);
	}

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return {
		games: data.data,
		meta: data.meta,
		searchQuery
	};
};
