import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get("page") || "1";
	const limit = url.searchParams.get("limit") || "20";
	const sortBy = url.searchParams.get("sortBy") || "name";
	const sortOrder = url.searchParams.get("sortOrder") || "asc";
	const filterName = url.searchParams.get("name") || "";
	const duration = url.searchParams.get("duration") || "";
	const players = url.searchParams.get("players") || "";
	const mechanics = url.searchParams.get("mechanics") || "";

	const apiUrl = new URL("/api/games", url.origin);
	apiUrl.searchParams.set("page", page);
	apiUrl.searchParams.set("limit", limit);
	apiUrl.searchParams.set("sortBy", sortBy);
	apiUrl.searchParams.set("sortOrder", sortOrder);

	if (filterName) apiUrl.searchParams.set("name", filterName);
	if (duration) apiUrl.searchParams.set("duration", duration);
	if (players) apiUrl.searchParams.set("players", players);
	if (mechanics) apiUrl.searchParams.set("mechanics", mechanics);

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	const mechanicsResponse = await fetch("/api/mechanics");
	const allMechanics = await mechanicsResponse.json();

	return {
		games: data.data,
		meta: {
			...data.meta,
			page: parseInt(page),
		},
		allMechanics,
	};
};
