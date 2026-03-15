import { flag } from 'flags/sveltekit';
import { vercelAdapter } from '@flags-sdk/vercel';

export const showPlays = flag<boolean>({
	key: 'log-book',
	description: 'Enable the Adventure Log feature (play logging, login, registration)',
	options: [{ value: true }, { value: false }],
	adapter: vercelAdapter()
});
