import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const filterName = url.searchParams.get('name') || '';
	const minDuration = url.searchParams.get('minDuration') || '';
	const maxDuration = url.searchParams.get('maxDuration') || '';
	const minPlayers = url.searchParams.get('minPlayers') || '';
	const maxPlayers = url.searchParams.get('maxPlayers') || '';
	const categories = url.searchParams.get('categories') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (filterName) apiUrl.searchParams.set('name', filterName);
	if (minDuration) apiUrl.searchParams.set('minDuration', minDuration);
	if (maxDuration) apiUrl.searchParams.set('maxDuration', maxDuration);
	if (minPlayers) apiUrl.searchParams.set('minPlayers', minPlayers);
	if (maxPlayers) apiUrl.searchParams.set('maxPlayers', maxPlayers);
	if (categories) apiUrl.searchParams.set('categories', categories);

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	// Fetch all categories
	const categoriesResponse = await fetch('/api/categories');
	const allCategories = await categoriesResponse.json();

	console.log(allCategories);

	return {
		games: data.data,
		meta: data.meta,
		allCategories
	};
};
