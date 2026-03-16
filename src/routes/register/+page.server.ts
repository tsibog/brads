import {
	generateSessionToken,
	createSession,
	setSessionTokenCookie
} from '$lib/server/auth';
import { error, fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { hash } from '@node-rs/argon2';
import { db } from '$lib/server/db';
import { users, boardGames } from '$lib/server/db/schema';
import { logBook } from '$lib/flags';
import { inArray } from 'drizzle-orm';
import {
	sanitizeInput,
	EXPERIENCE_LEVELS,
	PLAY_STYLES,
	CONTACT_METHODS,
	MAX_GAME_PREFERENCES
} from '$lib/partyFinderConstants';
import { updateUserAvailability, updateUserGamePreferences } from '$lib/server/partyFinderUtils';

export const load: PageServerLoad = async ({ locals }) => {
	if (!(await logBook())) {
		error(404, 'Not found');
	}
	if (locals.user) {
		redirect(302, '/plays');
	}
};

export const actions: Actions = {
	default: async (event) => {
		if (!(await logBook())) {
			error(404, 'Not found');
		}
		const formData = await event.request.formData();
		const username = formData.get('username');
		const email = formData.get('email');
		const password = formData.get('password');
		const confirmPassword = formData.get('confirmPassword');
		const displayName = formData.get('display_name');
		const experienceLevel = formData.get('experience_level');
		const playStyle = formData.get('play_style');
		const contactMethod = formData.get('contact_method');
		const contactValue = formData.get('contact_value');
		const selectedGamesStr = formData.get('selected_games');
		const selectedDaysStr = formData.get('selected_days');
		const lookingForParty = formData.get('looking_for_party') === 'on';

		if (
			typeof username !== 'string' ||
			username.length < 3 ||
			username.length > 31
		) {
			return fail(400, { message: 'Username must be 3-31 characters' });
		}

		if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
			return fail(400, { message: 'Username can only contain letters, numbers, hyphens, and underscores' });
		}

		if (
			typeof password !== 'string' ||
			password.length < 6 ||
			password.length > 255
		) {
			return fail(400, { message: 'Password must be at least 6 characters' });
		}

		if (password !== confirmPassword) {
			return fail(400, { message: 'Passwords do not match' });
		}

		// Display name is required
		if (typeof displayName !== 'string' || displayName.trim().length < 1 || displayName.trim().length > 50) {
			return fail(400, { message: 'Display name must be 1-50 characters' });
		}

		// Email is optional
		const emailValue = typeof email === 'string' && email.trim().length > 0 ? email.trim() : null;
		if (emailValue && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailValue)) {
			return fail(400, { message: 'Invalid email address' });
		}

		// Optional party finder fields
		const cleanDisplayName = sanitizeInput(displayName, 50);
		const expLevel = typeof experienceLevel === 'string' && (EXPERIENCE_LEVELS as readonly string[]).includes(experienceLevel)
			? experienceLevel
			: null;
		const pStyle = typeof playStyle === 'string' && (PLAY_STYLES as readonly string[]).includes(playStyle)
			? playStyle
			: null;
		const cMethod = typeof contactMethod === 'string' && (CONTACT_METHODS as readonly string[]).includes(contactMethod)
			? contactMethod
			: null;
		const cValue = typeof contactValue === 'string' ? sanitizeInput(contactValue) : null;

		// Parse game preferences (optional, 1-4 games)
		let selectedGames: string[] = [];
		try {
			if (selectedGamesStr && typeof selectedGamesStr === 'string' && selectedGamesStr !== '[]') {
				selectedGames = JSON.parse(selectedGamesStr);
			}
		} catch {
			// Ignore invalid JSON — games are optional
		}

		// Parse availability days (optional)
		let selectedDays: number[] = [];
		try {
			if (selectedDaysStr && typeof selectedDaysStr === 'string' && selectedDaysStr !== '[]') {
				selectedDays = JSON.parse(selectedDaysStr);
			}
		} catch {
			// Ignore invalid JSON — days are optional
		}

		try {
			// Check if username already exists
			const existing = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});
			if (existing) {
				return fail(400, { message: 'Username is already taken' });
			}

			const password_hash = await hash(password);
			const id = crypto.randomUUID();

			// Determine email for the user record
			const userEmail = cMethod === 'email' && cValue ? cValue : emailValue;

			await db.insert(users).values({
				id,
				username,
				email: userEmail,
				password_hash,
				is_admin: false,
				display_name: cleanDisplayName,
				experience_level: expLevel,
				play_style: pStyle,
				contact_method: cMethod,
				contact_value: cValue || null,
				looking_for_party: lookingForParty,
				party_status: lookingForParty ? 'active' : 'resting',
				last_login: new Date()
			});

			// Insert game preferences if any (validate games exist first)
			if (selectedGames.length > 0 && selectedGames.length <= MAX_GAME_PREFERENCES) {
				const existingGames = await db
					.select({ bggId: boardGames.bggId })
					.from(boardGames)
					.where(inArray(boardGames.bggId, selectedGames));

				const validBggIds = existingGames.map((g) => g.bggId);
				const validGames = selectedGames.filter((gId) => validBggIds.includes(gId));
				await updateUserGamePreferences(id, validGames);
			}

			// Insert availability days if any
			await updateUserAvailability(id, selectedDays);

			const token = generateSessionToken();
			const session = await createSession(token, id);
			setSessionTokenCookie(event, token, session.expiresAt);
		} catch (e) {
			console.error(e);
			return fail(500, { message: 'An unexpected error occurred' });
		}

		redirect(302, '/plays');
	}
};
