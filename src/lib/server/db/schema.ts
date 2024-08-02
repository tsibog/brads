import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	email: text('email').unique(),
	is_admin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
	updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
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

export type BoardGame = typeof boardGames.$inferSelect;
export type NewBoardGame = typeof boardGames.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
