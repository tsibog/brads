/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			// Font families are now configured in CSS using @theme
		}
	},

	future: {
		respectDefaultRingColorOpacity: true
	},

	cssVariables: {},
	plugins: []
};
