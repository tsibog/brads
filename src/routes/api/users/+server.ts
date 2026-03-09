import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { hash } from '@node-rs/argon2';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async ({ locals }) => {
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const allUsers = await db
		.select({
			id: users.id,
			username: users.username,
			email: users.email,
			is_admin: users.is_admin,
			must_reset_password: users.must_reset_password,
			created_at: users.created_at
		})
		.from(users);

	return json(allUsers);
};

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const { username, email, password, isAdmin = false } = await request.json();

	if (!username || !password) {
		return json({ error: 'Username and password are required' }, { status: 400 });
	}

	try {
		const password_hash = await hash(password);
		const id = crypto.randomUUID();

		const newUser = await db
			.insert(users)
			.values({
				id,
				username,
				email: email || null,
				password_hash,
				is_admin: isAdmin
			})
			.returning();

		const { password_hash: _, ...userWithoutPassword } = newUser[0];
		return json(userWithoutPassword, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};

// Admin password reset — sets password to "amnesiac" and flags for forced reset
const RESET_PASSWORD = 'amnesiac';

export const PUT: RequestHandler = async ({ request, locals }) => {
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const { userId } = await request.json();

	if (!userId) {
		return json({ error: 'userId is required' }, { status: 400 });
	}

	try {
		const password_hash = await hash(RESET_PASSWORD);
		const updated = await db
			.update(users)
			.set({ password_hash, must_reset_password: true })
			.where(eq(users.id, userId))
			.returning();

		if (updated.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'Password reset to temporary password. User will be prompted to set a new one on next login.' });
	} catch (error) {
		console.error('Error resetting password:', error);
		return json({ error: 'Failed to reset password' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url, locals }) => {
	if (!locals.user?.is_admin) {
		return json({ error: 'Admin access required' }, { status: 403 });
	}

	const id = url.searchParams.get('id');
	if (!id) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	// Prevent deleting yourself
	if (id === locals.user.id) {
		return json({ error: 'Cannot delete your own account' }, { status: 400 });
	}

	try {
		const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();
		if (deletedUser.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}
		return json({ message: 'User deleted successfully' });
	} catch (error) {
		console.error('Error deleting user:', error);
		return json({ error: 'Failed to delete user' }, { status: 500 });
	}
};
