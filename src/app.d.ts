// See https://kit.svelte.dev/docs/types#app
import type { User } from 'lucia';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: import('lucia').Session | null;
		}
	}
}

export {};
