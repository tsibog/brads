import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { users, userAvailability, userGamePreferences, boardGames } from '$lib/server/db/schema';
import { eq, and } from 'drizzle-orm';
import {
	getPaginatedPlayersWithCompatibility,
	getSharedPlayCounts,
	loadPlayerData,
	type PlayerForCompatibility
} from '$lib/server/partyFinderUtils';

export const GET: RequestHandler = async ({ url, locals }) => {
	if (!locals.user) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const page = parseInt(url.searchParams.get('page') || '1');
	const limit = parseInt(url.searchParams.get('limit') || '20');
	const sortBy = url.searchParams.get('sortBy') || 'compatibility';
	const sortOrder = (url.searchParams.get('sortOrder') || 'desc') as 'asc' | 'desc';
	const experience = url.searchParams.get('experience') || undefined;
	const playStyle = url.searchParams.get('playStyle') || undefined;
	const availability_day = url.searchParams.get('availability_day') || undefined;
	const game_preference = url.searchParams.get('game_preference') || undefined;

	// Get all active party finder users (excluding current user already done in util)
	const activeUsers = await db
		.select({
			id: users.id,
			username: users.username,
			displayName: users.display_name,
			bio: users.bio,
			experienceLevel: users.experience_level,
			playStyle: users.play_style,
			lookingForParty: users.looking_for_party,
			partyStatus: users.party_status,
			openToAnyGame: users.open_to_any_game,
			contactMethod: users.contact_method,
			contactValue: users.contact_value,
			contactVisibleTo: users.contact_visible_to,
			lastLogin: users.last_login
		})
		.from(users)
		.where(and(eq(users.looking_for_party, true), eq(users.party_status, 'active')));

	// Load availability and game preferences for all active users
	const allPlayers: PlayerForCompatibility[] = await Promise.all(
		activeUsers.map(async (u) => {
			const data = await loadPlayerData(u.id);
			return {
				id: u.id,
				username: u.username,
				displayName: u.displayName,
				bio: u.bio,
				experienceLevel: u.experienceLevel,
				playStyle: u.playStyle,
				lookingForParty: u.lookingForParty ?? false,
				partyStatus: u.partyStatus ?? 'resting',
				openToAnyGame: u.openToAnyGame ?? false,
				contactMethod: u.contactMethod,
				contactValue: u.contactValue,
				contactVisibleTo: u.contactVisibleTo,
				lastLogin: u.lastLogin,
				availability: data.availability,
				gamePreferences: data.gamePreferences
			};
		})
	);

	// Load current user's data for compatibility calculations
	const currentUserData = await loadPlayerData(locals.user.id);

	const currentUser = {
		id: locals.user.id,
		experienceLevel: locals.user.experience_level,
		playStyle: locals.user.play_style,
		openToAnyGame: locals.user.open_to_any_game ?? false,
		lookingForParty: locals.user.looking_for_party ?? false,
		partyStatus: locals.user.party_status ?? 'resting'
	};

	const result = await getPaginatedPlayersWithCompatibility({
		currentUser,
		currentUserAvailability: currentUserData.availability.map((a) => a.dayOfWeek),
		currentUserGamePreferences: currentUserData.gamePreferences.map((g) => g.gameBggId),
		allPlayers,
		page,
		limit,
		sortBy,
		sortOrder,
		filters: { experience, playStyle, availability_day, game_preference }
	});

	// Get shared play counts for the paginated players
	const playerIds = result.data.map((p) => p.id);
	const sharedCounts = await getSharedPlayCounts(locals.user.id, playerIds);

	const dataWithPlayHistory = result.data.map((player) => ({
		...player,
		sharedPlayCount: sharedCounts.get(player.id) ?? 0
	}));

	return json({
		data: dataWithPlayHistory,
		meta: result.meta
	});
};
