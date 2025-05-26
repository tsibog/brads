/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			fontFamily: {
				londrina: ['"Londrina Solid"', 'cursive']
			}
		}
	},

	future: {
		respectDefaultRingColorOpacity: true,
	},

	cssVariables: {
	},
	plugins: []
};
