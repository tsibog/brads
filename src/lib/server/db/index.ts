import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

// Initialize the database with the schema
export function initializeDatabase() {
	sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    )
  `);

	sqlite.exec(`
    CREATE TABLE IF NOT EXISTS board_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bgg_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      year_published INTEGER,
      min_players INTEGER,
      max_players INTEGER,
      playing_time INTEGER,
      min_play_time INTEGER,
      max_play_time INTEGER,
      age INTEGER,
      description TEXT,
      thumbnail TEXT,
      image TEXT,
      categories TEXT,
      mechanics TEXT,
      designers TEXT,
      artists TEXT,
      publishers TEXT
    )
  `);
}

// Run migrations
export async function runMigrations() {
	migrate(db, { migrationsFolder: './drizzle' });
}

await runMigrations();
