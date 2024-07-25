import { initializeDatabase, runMigrations } from '$lib/db';

// Initialize the database when the server starts
initializeDatabase();
runMigrations();
// ```
