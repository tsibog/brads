import { flag } from 'flags/sveltekit';
import { vercelAdapter } from '@flags-sdk/vercel';

export const logBook = flag<boolean>({
	key: 'log-book',
	description: 'Enable the Log Book feature (play logging, login, registration)',
	options: [{ value: true }, { value: false }],
	adapter: vercelAdapter()
});
