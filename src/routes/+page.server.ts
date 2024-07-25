import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async () => {
	throw redirect(307, '/browse');
}) satisfies PageServerLoad;
