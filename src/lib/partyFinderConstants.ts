/**
 * Shared constants for party finder features.
 * Used across server validation, client forms, and display components.
 */

// The cafe is closed on Mondays (day 1)
export const VALID_DAYS = [0, 2, 3, 4, 5, 6] as const;

export const DAY_LABELS_SHORT: Record<number, string> = {
	0: 'Sun',
	2: 'Tue',
	3: 'Wed',
	4: 'Thu',
	5: 'Fri',
	6: 'Sat'
};

export const DAY_LABELS_FULL: Record<number, string> = {
	0: 'Sunday',
	2: 'Tuesday',
	3: 'Wednesday',
	4: 'Thursday',
	5: 'Friday',
	6: 'Saturday'
};

export const EXPERIENCE_LEVELS = ['new', 'some_experience', 'experienced'] as const;
export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[number];

export const EXPERIENCE_LABELS: Record<string, string> = {
	new: 'New to board games',
	some_experience: 'Some experience',
	experienced: 'Experienced'
};

export const EXPERIENCE_LABELS_SHORT: Record<string, string> = {
	new: 'New',
	some_experience: 'Some exp.',
	experienced: 'Experienced'
};

export const PLAY_STYLES = ['casual', 'competitive', 'either'] as const;
export type PlayStyle = (typeof PLAY_STYLES)[number];

export const PLAY_STYLE_LABELS: Record<string, string> = {
	casual: 'Casual',
	competitive: 'Competitive',
	either: 'Either'
};

export const CONTACT_METHODS = ['email', 'phone', 'whatsapp', 'discord'] as const;
export type ContactMethod = (typeof CONTACT_METHODS)[number];

export const CONTACT_VISIBILITY_OPTIONS = ['none', 'matches', 'all'] as const;
export type ContactVisibility = (typeof CONTACT_VISIBILITY_OPTIONS)[number];

export const MAX_GAME_PREFERENCES = 4;

/**
 * Basic input sanitization — strips angle brackets and trims.
 */
export function sanitizeInput(input: string, maxLength = 255): string {
	return input.trim().replace(/[<>]/g, '').substring(0, maxLength);
}

/**
 * Validate a contact value against its method.
 */
export function isValidContact(method: string, value: string): boolean {
	const v = value.trim();
	switch (method) {
		case 'email':
			return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
		case 'phone':
		case 'whatsapp':
			return /^[+]?[\d\s\-\(\)]{8,}$/.test(v);
		case 'discord':
			return v.length >= 2;
		default:
			return false;
	}
}
