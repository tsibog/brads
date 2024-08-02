import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

export const POST: RequestHandler = async ({ request }) => {
	const { username, email, password, isAdmin = false } = await request.json();

	// Validate input
	if (!username || !email || !password) {
		return json({ error: 'Username, email, and password are required' }, { status: 400 });
	}

	try {
		// Hash the password
		const hasher = new Argon2id();
		const password_hash = await hasher.hash(password);

		// Generate a unique ID
		const id = generateId(15); // Generates a 15-character ID

		// Insert the new user
		const newUser = await db
			.insert(users)
			.values({
				id,
				username,
				email,
				password_hash,
				is_admin: isAdmin
				// created_at and updated_at will use the default values
			})
			.returning();

		// Remove password_hash from the returned user object
		const { password_hash: _, ...userWithoutPassword } = newUser[0];

		return json(userWithoutPassword, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

		if (deletedUser.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting user:', error);
		return json({ error: 'Failed to delete user' }, { status: 500 });
	}
};
