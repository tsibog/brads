import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from './schema';
import { TURSO_DB_URL, TURSO_AUTH_TOKEN } from '$env/static/private';
import fs from 'fs';

const turso = createClient({
	url: TURSO_DB_URL!,
	authToken: TURSO_AUTH_TOKEN
});
export const db = drizzle(turso, { schema });

async function importData() {
	const tables = ['board_games', 'users'];

	for (const table of tables) {
		const data = JSON.parse(fs.readFileSync(`${table}.json`, 'utf-8'));

		for (const row of data) {
			const columns = Object.keys(row).filter((key) => row[key] !== null);
			const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ');
			const values = columns.map((key) => row[key]);

			const query = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;

			console.log('Query:', query);
			console.log('Values:', values);

			try {
				await turso.execute({
					sql: query,
					args: values
				});
			} catch (error) {
				console.error(`Error inserting into ${table}:`, error);
				console.error('Problematic row:', row);
			}
		}

		console.log(`Imported data for ${table}`);
	}
}

console.log(TURSO_DB_URL, TURSO_AUTH_TOKEN);

// importData()
// 	.then(() => console.log('Import completed'))
// 	.catch(console.error);
