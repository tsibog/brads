// See https://kit.svelte.dev/docs/types#app
import type { AppUser } from '$lib/server/db/schema';

declare global {
	namespace App {
		interface Locals {
			user: AppUser | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
