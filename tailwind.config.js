/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				'brads-green-light': '#538874',
				'brads-green-dark': '#1A6045',
				'brads-yellow-light': '#FEE899',
				'brads-green': '#8BBF7E'
			},
			fontFamily: {
				londrina: ['"Londrina Solid"', 'cursive']
			}
		}
	},
	plugins: []
};
