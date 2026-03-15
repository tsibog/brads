import { flag } from 'flags/sveltekit';

export const showPlays = flag<boolean>({
	key: 'plays',
	description: 'Enable the Adventure Log feature (play logging, login, registration)',
	options: [{ value: true }, { value: false }],
	decide() {
		return false;
	}
});
