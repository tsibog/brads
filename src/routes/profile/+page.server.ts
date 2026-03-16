import { fail, redirect } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import type { Actions, PageServerLoad } from './$types';
import {
	sanitizeInput,
	isValidContact,
	EXPERIENCE_LEVELS,
	PLAY_STYLES,
	CONTACT_METHODS,
	CONTACT_VISIBILITY_OPTIONS
} from '$lib/partyFinderConstants';
import {
	loadPlayerData,
	updateUserAvailability,
	updateUserGamePreferences
} from '$lib/server/partyFinderUtils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!locals.user) {
		redirect(302, '/login');
	}

	const [user, playerData] = await Promise.all([
		db.query.users.findFirst({
			where: (users, { eq }) => eq(users.id, locals.user!.id)
		}),
		loadPlayerData(locals.user.id)
	]);

	if (!user) {
		redirect(302, '/login');
	}

	return {
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			displayName: user.display_name,
			bio: user.bio,
			experienceLevel: user.experience_level,
			playStyle: user.play_style,
			contactMethod: user.contact_method,
			contactValue: user.contact_value,
			contactVisibleTo: user.contact_visible_to,
			lookingForParty: user.looking_for_party,
			partyStatus: user.party_status,
			openToAnyGame: user.open_to_any_game,
			lastLogin: user.last_login
		},
		availability: playerData.availability.map((a) => a.dayOfWeek),
		gamePreferences: playerData.gamePreferences.map((g) => ({
			bggId: g.gameBggId,
			name: g.name,
			thumbnail: g.thumbnail
		}))
	};
};

export const actions: Actions = {
	updateProfile: async ({ request, locals }) => {
		if (!locals.user) {
			return fail(401, { message: 'Not authenticated' });
		}

		const formData = await request.formData();
		const displayName = formData.get('display_name');
		const bio = formData.get('bio') ?? '';
		const experienceLevel = formData.get('experience_level');
		const playStyle = formData.get('play_style');
		const contactMethod = formData.get('contact_method');
		const contactValue = formData.get('contact_value') ?? '';
		const contactVisibleTo = formData.get('contact_visible_to');
		const lookingForParty = formData.get('looking_for_party') === 'on';
		const openToAnyGame = formData.get('open_to_any_game') === 'on';
		const selectedDaysStr = formData.get('selected_days');
		const selectedGamesStr = formData.get('selected_games');

		if (
			typeof displayName !== 'string' ||
			typeof bio !== 'string' ||
			typeof experienceLevel !== 'string' ||
			typeof playStyle !== 'string' ||
			typeof contactMethod !== 'string' ||
			typeof contactValue !== 'string' ||
			typeof contactVisibleTo !== 'string'
		) {
			return fail(400, { message: `Invalid input types: ${[
				['display_name', displayName],
				['bio', bio],
				['experience_level', experienceLevel],
				['play_style', playStyle],
				['contact_method', contactMethod],
				['contact_value', contactValue],
				['contact_visible_to', contactVisibleTo]
			].filter(([, v]) => typeof v !== 'string').map(([k]) => k).join(', ')} missing` });
		}

		const cleanDisplayName = sanitizeInput(displayName);
		const cleanBio = sanitizeInput(bio);

		if (cleanDisplayName.length < 1 || cleanDisplayName.length > 50) {
			return fail(400, { message: 'Display name must be between 1-50 characters' });
		}
		if (cleanBio.length > 500) {
			return fail(400, { message: 'Bio must be less than 500 characters' });
		}
		if (!(EXPERIENCE_LEVELS as readonly string[]).includes(experienceLevel)) {
			return fail(400, { message: 'Invalid experience level' });
		}
		if (!(PLAY_STYLES as readonly string[]).includes(playStyle)) {
			return fail(400, { message: 'Invalid play style' });
		}
		if (!(CONTACT_VISIBILITY_OPTIONS as readonly string[]).includes(contactVisibleTo)) {
			return fail(400, { message: 'Invalid contact visibility setting' });
		}

		const cleanContactValue = sanitizeInput(contactValue);
		if (cleanContactValue) {
			if (!(CONTACT_METHODS as readonly string[]).includes(contactMethod)) {
				return fail(400, { message: 'Invalid contact method' });
			}
			if (!isValidContact(contactMethod, cleanContactValue)) {
				return fail(400, { message: `Please enter a valid ${contactMethod} contact` });
			}
		}

		// Parse availability days
		let selectedDays: number[] = [];
		try {
			if (selectedDaysStr && typeof selectedDaysStr === 'string') {
				selectedDays = JSON.parse(selectedDaysStr);
			}
		} catch {
			return fail(400, { message: 'Invalid availability data' });
		}

		// Parse game preferences
		let selectedGames: string[] = [];
		try {
			if (selectedGamesStr && typeof selectedGamesStr === 'string') {
				selectedGames = JSON.parse(selectedGamesStr).map((g: { bggId: string }) => g.bggId);
			}
		} catch {
			return fail(400, { message: 'Invalid game selection data' });
		}

		try {
			const partyStatus =
				lookingForParty ? 'active' : locals.user.party_status || 'resting';

			await db
				.update(users)
				.set({
					display_name: cleanDisplayName,
					bio: cleanBio || null,
					experience_level: experienceLevel,
					play_style: playStyle,
					contact_method: contactMethod,
					contact_value: cleanContactValue || null,
					contact_visible_to: contactVisibleTo,
					looking_for_party: lookingForParty,
					party_status: partyStatus,
					open_to_any_game: openToAnyGame,
					email:
						contactMethod === 'email' && cleanContactValue
							? cleanContactValue
							: locals.user.email,
					updated_at: new Date()
				})
				.where(eq(users.id, locals.user.id));

			await updateUserAvailability(locals.user.id, selectedDays);
			await updateUserGamePreferences(locals.user.id, selectedGames);

			return { success: true, message: 'Profile updated successfully' };
		} catch (error) {
			console.error('Profile update error:', error);
			return fail(500, { message: 'An error occurred while updating your profile' });
		}
	}
};
