import { initializeDatabase, runMigrations } from '$lib/server/db';

// Initialize the database when the server starts
initializeDatabase();
runMigrations();
// ```
