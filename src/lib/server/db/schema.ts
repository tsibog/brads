import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	email: text('email').unique(),
	is_admin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
	updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow(),
	// Party Finder profile fields
	display_name: text('display_name'),
	bio: text('bio'),
	experience_level: text('experience_level'),
	vibe_preference: text('vibe_preference'),
	// Party finder status
	looking_for_party: integer('looking_for_party', { mode: 'boolean' }).default(false),
	party_status: text('party_status').default('resting'),
	open_to_any_game: integer('open_to_any_game', { mode: 'boolean' }).default(false),
	// Contact & privacy
	contact_email: text('contact_email'),
	contact_phone: text('contact_phone'),
	contact_visible_to: text('contact_visible_to').default('matches'),
	// Activity tracking
	last_login: integer('last_login', { mode: 'timestamp' })
});

export const sessions = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
});

export const boardGames = sqliteTable('board_games', {
	id: integer('id').primaryKey(),
	bggId: text('bgg_id').notNull().unique(),
	name: text('name').notNull(),
	yearPublished: integer('year_published'),
	minPlayers: integer('min_players'),
	maxPlayers: integer('max_players'),
	playingTime: integer('playing_time'),
	minPlayTime: integer('min_play_time'),
	maxPlayTime: integer('max_play_time'),
	age: integer('age'),
	description: text('description'),
	thumbnail: text('thumbnail'),
	image: text('image'),
	categories: text('categories'),
	mechanics: text('mechanics'),
	designers: text('designers'),
	artists: text('artists'),
	publishers: text('publishers'),
	isStarred: integer('is_starred', { mode: 'boolean' }).default(false),
	adminNote: text('admin_note')
});

export const gameComments = sqliteTable('gameComments', {
	id: integer('id').primaryKey(),
	gameId: text('game_id')
		.notNull()
		.references(() => boardGames.bggId),
	authorName: text('author_name').notNull(),
	content: text('content').notNull(),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.default(sql`(unixepoch())`),
	isApproved: integer('is_approved', { mode: 'boolean' }).notNull().default(false)
});

export const userAvailability = sqliteTable('user_availability', {
	id: integer('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	dayOfWeek: integer('day_of_week').notNull(),
	timeSlotStart: text('time_slot_start'),
	timeSlotEnd: text('time_slot_end'),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
});

export const userGamePreferences = sqliteTable('user_game_preferences', {
	id: integer('id').primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id, { onDelete: 'cascade' }),
	gameBggId: text('game_bgg_id')
		.notNull()
		.references(() => boardGames.bggId),
	createdAt: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow()
});

export const systemSettings = sqliteTable('system_settings', {
	key: text('key').primaryKey(),
	value: text('value').notNull(),
	description: text('description'),
	updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
});

// Base database types (snake_case from database)
export type BoardGame = typeof boardGames.$inferSelect;
export type NewBoardGame = typeof boardGames.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
export type Comment = typeof gameComments.$inferSelect;
export type NewComment = typeof gameComments.$inferInsert;
export type UserAvailability = typeof userAvailability.$inferSelect;
export type NewUserAvailability = typeof userAvailability.$inferInsert;
export type UserGamePreference = typeof userGamePreferences.$inferSelect;
export type NewUserGamePreference = typeof userGamePreferences.$inferInsert;
export type SystemSetting = typeof systemSettings.$inferSelect;
export type NewSystemSetting = typeof systemSettings.$inferInsert;

// Transformed types for frontend use (camelCase, matches Lucia getUserAttributes)
export interface AppUser {
	id: string;
	username: string;
	email: string | null;
	isAdmin: boolean;
	displayName: string | null;
	bio: string | null;
	experienceLevel: string | null;
	vibePreference: string | null;
	lookingForParty: boolean | null;
	partyStatus: string | null;
	openToAnyGame: boolean | null;
	contactEmail: string | null;
	contactPhone: string | null;
	contactVisibleTo: string | null;
	lastLogin: number | null;
}

// Game preference type for frontend
export interface GamePreference {
	gameBggId: string;
	name: string;
}

// Player type for party finder (includes joined data)
export interface Player {
	id: string;
	displayName: string | null;
	username: string;
	bio: string | null;
	experienceLevel: string | null;
	vibePreference: string | null;
	lookingForParty: boolean | null;
	partyStatus: string | null;
	openToAnyGame: boolean | null;
	contactVisibleTo: string | null;
	contactEmail: string | null;
	contactPhone: string | null;
	lastLogin: Date | null;
	availability: Array<{ dayOfWeek: number }>;
	gamePreferences: GamePreference[];
}
