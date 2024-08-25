import { drizzle } from 'drizzle-orm/libsql';
import { migrate } from 'drizzle-orm/libsql/migrator';
import { createClient } from '@libsql/client';
import { config } from 'dotenv';

config();

async function runMigration() {
	const turso = createClient({
		url: process.env.TURSO_DB_URL!,
		authToken: process.env.TURSO_AUTH_TOKEN
	});

	const db = drizzle(turso);

	console.log('Starting migration...');

	try {
		await migrate(db, { migrationsFolder: './drizzle' });
		console.log('Migration completed successfully');
	} catch (error) {
		console.error('Migration failed:', error);
	} finally {
		await turso.close();
	}
}

runMigration();
