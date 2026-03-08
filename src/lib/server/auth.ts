import { sha256 } from '@oslojs/crypto/sha2';
import { encodeBase32LowerCaseNoPadding, encodeHexLowerCase } from '@oslojs/encoding';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';
import { dev } from '$app/environment';
import type { RequestEvent } from '@sveltejs/kit';
import type { User, Session } from '$lib/server/db/schema';

const SESSION_EXPIRY_MS = 1000 * 60 * 60 * 24 * 30; // 30 days
const SESSION_REFRESH_MS = 1000 * 60 * 60 * 24 * 15; // 15 days

export function generateSessionToken(): string {
	const bytes = new Uint8Array(20);
	crypto.getRandomValues(bytes);
	return encodeBase32LowerCaseNoPadding(bytes);
}

export async function createSession(token: string, userId: string): Promise<Session> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const expiresAt = Math.floor((Date.now() + SESSION_EXPIRY_MS) / 1000);
	const session = { id: sessionId, userId, expiresAt };
	await db.insert(sessions).values(session);
	return session;
}

export type SessionValidationResult =
	| { session: Session; user: Omit<User, 'password_hash'> }
	| { session: null; user: null };

export async function validateSessionToken(token: string): Promise<SessionValidationResult> {
	const sessionId = encodeHexLowerCase(sha256(new TextEncoder().encode(token)));
	const result = await db
		.select({ session: sessions, user: users })
		.from(sessions)
		.innerJoin(users, eq(sessions.userId, users.id))
		.where(eq(sessions.id, sessionId));

	if (result.length === 0) {
		return { session: null, user: null };
	}

	const { session, user } = result[0];
	const nowSeconds = Math.floor(Date.now() / 1000);

	// Session has expired
	if (nowSeconds >= session.expiresAt) {
		await db.delete(sessions).where(eq(sessions.id, sessionId));
		return { session: null, user: null };
	}

	// Extend session if it's within the refresh window
	const refreshThresholdSeconds = Math.floor(SESSION_REFRESH_MS / 1000);
	if (session.expiresAt - nowSeconds < refreshThresholdSeconds) {
		const newExpiresAt = Math.floor((Date.now() + SESSION_EXPIRY_MS) / 1000);
		await db.update(sessions).set({ expiresAt: newExpiresAt }).where(eq(sessions.id, sessionId));
		session.expiresAt = newExpiresAt;
	}

	const { password_hash: _, ...safeUser } = user;
	return { session, user: safeUser };
}

export async function invalidateSession(sessionId: string): Promise<void> {
	await db.delete(sessions).where(eq(sessions.id, sessionId));
}

const SESSION_COOKIE_NAME = 'session';

export function setSessionTokenCookie(event: RequestEvent, token: string, expiresAt: number): void {
	event.cookies.set(SESSION_COOKIE_NAME, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		expires: new Date(expiresAt * 1000)
	});
}

export function deleteSessionTokenCookie(event: RequestEvent): void {
	event.cookies.set(SESSION_COOKIE_NAME, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: !dev,
		maxAge: 0
	});
}

export function getSessionToken(event: RequestEvent): string | undefined {
	return event.cookies.get(SESSION_COOKIE_NAME);
}
