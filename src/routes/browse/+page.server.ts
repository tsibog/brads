import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const filterName = url.searchParams.get('name') || '';
	const duration = url.searchParams.get('duration') || '';
	const players = url.searchParams.get('players') || '';
	const categories = url.searchParams.get('categories') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (filterName) apiUrl.searchParams.set('name', filterName);
	if (duration) apiUrl.searchParams.set('duration', duration);
	if (players) apiUrl.searchParams.set('players', players);
	if (categories) apiUrl.searchParams.set('categories', categories);

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	const categoriesResponse = await fetch('/api/categories');
	const allCategories = await categoriesResponse.json();

	return {
		games: data.data,
		meta: data.meta,
		allCategories
	};
};
