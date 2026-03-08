// See https://kit.svelte.dev/docs/types#app
import type { User, Session } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			user: Omit<User, 'password_hash'> | null;
			session: Session | null;
		}
	}
}

export {};
