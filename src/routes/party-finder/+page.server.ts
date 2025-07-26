import { fail, redirect } from "@sveltejs/kit";
import type { Actions, PageServerLoad } from "./$types";
import { db } from "$lib/server/db";
import {
	boardGames,
	userAvailability,
	userGamePreferences,
	users,
	type Player,
} from "$lib/server/db/schema";
import { eq } from "drizzle-orm";

export const load: PageServerLoad = async ({ locals, url, fetch }) => {
	if (!locals.user) {
		throw redirect(302, "/login");
	}

	const userId = locals.user.id;

	// Get current user's availability
	const userAvailabilityData = await db
		.select()
		.from(userAvailability)
		.where(eq(userAvailability.userId, userId));

	// Get current user's game preferences with game details
	const userGamePreferencesData = await db
		.select({
			id: userGamePreferences.id,
			gameBggId: userGamePreferences.gameBggId,
			name: boardGames.name,
			thumbnail: boardGames.thumbnail,
			minPlayers: boardGames.minPlayers,
			maxPlayers: boardGames.maxPlayers,
			playingTime: boardGames.playingTime,
		})
		.from(userGamePreferences)
		.innerJoin(
			boardGames,
			eq(userGamePreferences.gameBggId, boardGames.bggId),
		)
		.where(eq(userGamePreferences.userId, userId));

	// Get pagination and filter parameters from URL
	const page = url.searchParams.get("page") || "1";
	const limit = url.searchParams.get("limit") || "20";
	const sortBy = url.searchParams.get("sortBy") || "compatibility";
	const sortOrder = url.searchParams.get("sortOrder") || "desc";
	const experienceFilter = url.searchParams.get("experience") || "all";
	const vibeFilter = url.searchParams.get("vibe") || "all";
	const dayFilter = url.searchParams.get("availability_day") || "all";
	const gameFilter = url.searchParams.get("game_preference") || "all";

	// Build API URL for paginated players
	const apiUrl = new URL("/api/party-finder/players", url.origin);
	apiUrl.searchParams.set("page", page);
	apiUrl.searchParams.set("limit", limit);
	apiUrl.searchParams.set("sortBy", sortBy);
	apiUrl.searchParams.set("sortOrder", sortOrder);

	if (experienceFilter !== "all") {
		apiUrl.searchParams.set("experience", experienceFilter);
	}
	if (vibeFilter !== "all") apiUrl.searchParams.set("vibe", vibeFilter);
	if (dayFilter !== "all") {
		apiUrl.searchParams.set("availability_day", dayFilter);
	}
	if (gameFilter !== "all") {
		apiUrl.searchParams.set("game_preference", gameFilter);
	}

	// Fetch paginated players from API
	let paginatedPlayersResponse;
	try {
		paginatedPlayersResponse = await fetch(apiUrl);
		if (!paginatedPlayersResponse.ok) {
			throw new Error(
				`HTTP error! status: ${paginatedPlayersResponse.status}`,
			);
		}
	} catch (error) {
		console.error("Error fetching paginated players:", error);
		// Fallback to empty data if API fails
		paginatedPlayersResponse = {
			ok: true,
			json: async () => ({
				data: [],
				meta: {
					totalCount: 0,
					page: 1,
					limit: 20,
					totalPages: 0,
					averageCompatibility: 0,
				},
			}),
		} as Response;
	}

	const paginatedPlayers = await paginatedPlayersResponse.json();

	// Get all unique games from players for filter dropdown (using API data)
	const availableGames = new Map<string, string>();
	if (paginatedPlayers.data) {
		paginatedPlayers.data.forEach((player: any) => {
			player.gamePreferences?.forEach((game: any) => {
				availableGames.set(game.gameBggId, game.name);
			});
		});
	}

	// Transform currentUser from AppUser to Player format
	const currentUserAsPlayer: Player = {
		...locals.user,
		availability: userAvailabilityData,
		gamePreferences: userGamePreferencesData.map(pref => ({
			gameBggId: pref.gameBggId,
			name: pref.name,
			thumbnail: pref.thumbnail,
			image: null
		}))
	};

	return {
		currentUser: currentUserAsPlayer,
		userAvailability: userAvailabilityData,
		userGamePreferences: userGamePreferencesData,
		paginatedPlayers: paginatedPlayers,
		availableGames: Array.from(availableGames.entries()).map((
			[id, name],
		) => ({ id, name })),
		// Preserve current filter values for form state
		currentFilters: {
			experience: experienceFilter,
			vibe: vibeFilter,
			day: dayFilter,
			game: gameFilter,
			page: parseInt(page),
			sortBy,
			sortOrder,
		},
	};
};

export const actions: Actions = {
	updateSettings: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: "Not authenticated" });
		}

		const formData = await request.formData();
		const lookingForParty = formData.get("looking_for_party") === "on";
		const openToAnyGame = formData.get("open_to_any_game") === "on";
		const selectedDaysJson = formData.get("selected_days");
		const selectedGamesJson = formData.get("selected_games");

		let selectedDays: number[] = [];
		let selectedGames: string[] = [];

		// Parse selected days
		try {
			if (selectedDaysJson && typeof selectedDaysJson === "string") {
				selectedDays = JSON.parse(selectedDaysJson);
			}
		} catch (error) {
			return fail(400, { message: "Invalid availability data" });
		}

		// Parse selected games
		try {
			if (selectedGamesJson && typeof selectedGamesJson === "string") {
				selectedGames = JSON.parse(selectedGamesJson);
			}
		} catch (error) {
			return fail(400, { message: "Invalid game preferences data" });
		}

		try {
			// Start transaction-like updates
			const userId = locals.user.id;

			// 1. Update user table with party status
			await db
				.update(users)
				.set({
					looking_for_party: lookingForParty,
					open_to_any_game: openToAnyGame,
					updated_at: new Date(),
				})
				.where(eq(users.id, userId));

			// 2. Update availability - delete old and insert new
			await db.delete(userAvailability).where(
				eq(userAvailability.userId, userId),
			);

			if (selectedDays.length > 0) {
				const availabilityData = selectedDays.map((dayOfWeek) => ({
					userId,
					dayOfWeek,
					timeSlotStart: null,
					timeSlotEnd: null,
				}));
				await db.insert(userAvailability).values(availabilityData);
			}

			// 3. Update game preferences - delete old and insert new
			await db.delete(userGamePreferences).where(
				eq(userGamePreferences.userId, userId),
			);

			if (selectedGames.length > 0) {
				const gamePreferenceData = selectedGames.map((gameBggId) => ({
					userId,
					gameBggId,
				}));
				await db.insert(userGamePreferences).values(gamePreferenceData);
			}

			return {
				success: true,
				message: "All party finder settings updated successfully!",
			};
		} catch (error) {
			console.error("Party finder settings update error:", error);
			return fail(500, {
				message: "An error occurred while updating your settings",
			});
		}
	},
};
