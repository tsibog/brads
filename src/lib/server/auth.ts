// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username,
			email: attributes.email,
			isAdmin: attributes.is_admin,
			displayName: attributes.display_name,
			bio: attributes.bio,
			experienceLevel: attributes.experience_level,
			vibePreference: attributes.vibe_preference,
			lookingForParty: attributes.looking_for_party,
			partyStatus: attributes.party_status,
			openToAnyGame: attributes.open_to_any_game,
			contactMethod: attributes.contact_method,
			contactValue: attributes.contact_value,
			contactVisibleTo: attributes.contact_visible_to,
			// Legacy fields for backward compatibility
			contactEmail: attributes.contact_email,
			contactPhone: attributes.contact_phone,
			lastLogin: attributes.last_login
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
			email: string | null;
			is_admin: boolean;
			display_name: string | null;
			bio: string | null;
			experience_level: string | null;
			vibe_preference: string | null;
			looking_for_party: boolean | null;
			party_status: string | null;
			open_to_any_game: boolean | null;
			contact_method: string | null;
			contact_value: string | null;
			contact_visible_to: string | null;
			// Legacy fields for backward compatibility
			contact_email: string | null;
			contact_phone: string | null;
			last_login: number | null;
		};
	}
}

export type Auth = typeof lucia;
