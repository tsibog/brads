import { flag } from 'flags/sveltekit';
import { vercelAdapter } from '@flags-sdk/vercel';

export const logBook = flag<boolean>({
	key: 'log-book',
	description: 'Enable the Log Book feature (play logging, login, registration)',
	options: [{ value: true }, { value: false }],
	adapter: vercelAdapter()
});

export const partyFinder = flag<boolean>({
	key: 'party-finder',
	description: 'Enable the Party Finder feature (player matching, profiles, availability)',
	options: [{ value: true }, { value: false }],
	adapter: vercelAdapter()
});
