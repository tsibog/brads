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
	// Add Tailwind CSS v4 specific configuration
	future: {
		respectDefaultRingColorOpacity: true,
	},
	// Enable v3-like behavior for styling defaults
	cssVariables: {
		// Make sure CSS variables get properly processed
		extend: {
			// Add any variables you need to extend
		}
	},
	plugins: []
};
