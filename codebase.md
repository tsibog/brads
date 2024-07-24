# vite.config.ts

```ts
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [sveltekit()]
});

```

# tsconfig.json

```json
{
	"extends": "./.svelte-kit/tsconfig.json",
	"compilerOptions": {
		"allowJs": true,
		"checkJs": true,
		"esModuleInterop": true,
		"forceConsistentCasingInFileNames": true,
		"resolveJsonModule": true,
		"skipLibCheck": true,
		"sourceMap": true,
		"strict": true,
		"moduleResolution": "bundler"
	}
	// Path aliases are handled by https://kit.svelte.dev/docs/configuration#alias
	// except $lib which is handled by https://kit.svelte.dev/docs/configuration#files
	//
	// If you want to overwrite includes/excludes, make sure to copy over the relevant includes/excludes
	// from the referenced tsconfig.json - TypeScript does not merge them in
}

```

# tailwind.config.js

```js
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

```

# svelte.config.js

```js
import adapter from '@sveltejs/adapter-auto';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
	// Consult https://kit.svelte.dev/docs/integrations#preprocessors
	// for more information about preprocessors
	preprocess: vitePreprocess(),

	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported, or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter(),
		csrf: {
			checkOrigin: false
		}
	}
};

export default config;

```

# sqlite.db

This is a binary file of the type: Binary

# postcss.config.js

```js
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}

```

# package.json

```json
{
	"name": "my-svelte5-project",
	"version": "0.0.1",
	"private": true,
	"scripts": {
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write .",
		"studio": "drizzle-kit studio"
	},
	"devDependencies": {
		"@sveltejs/adapter-auto": "^3.0.0",
		"@sveltejs/kit": "^2.0.0",
		"@sveltejs/vite-plugin-svelte": "^3.0.0",
		"@types/better-sqlite3": "^7.6.11",
		"@types/eslint": "^8.56.7",
		"@types/node": "^20.14.10",
		"@types/node-fetch": "^2.6.11",
		"@types/xmldom": "^0.1.34",
		"autoprefixer": "^10.4.19",
		"drizzle-kit": "^0.23.0",
		"eslint": "^9.0.0",
		"eslint-config-prettier": "^9.1.0",
		"eslint-plugin-svelte": "^2.36.0",
		"globals": "^15.0.0",
		"postcss": "^8.4.39",
		"prettier": "^3.1.1",
		"prettier-plugin-svelte": "^3.1.2",
		"svelte": "^5.0.0-next.1",
		"svelte-check": "^3.6.0",
		"tailwindcss": "^3.4.4",
		"ts-node": "^10.9.2",
		"tslib": "^2.4.1",
		"typescript": "^5.5.3",
		"typescript-eslint": "^8.0.0-alpha.20",
		"vite": "^5.0.3"
	},
	"type": "module",
	"dependencies": {
		"better-sqlite3": "^11.1.2",
		"drizzle-orm": "^0.32.0",
		"node-fetch": "^3.3.2",
		"xmldom": "^0.6.0"
	}
}

```

# eslint.config.js

```js
import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte'],
		languageOptions: {
			parserOptions: {
				parser: ts.parser
			}
		}
	},
	{
		ignores: ['build/', '.svelte-kit/', 'dist/']
	}
];

```

# drizzle.config.ts

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	dialect: 'sqlite',
	schema: './src/lib/db/schema.ts',
	out: './drizzle',
	dbCredentials: {
		url: './sqlite.db'
	}
});

```

# README.md

```md
# create-svelte

Everything you need to build a Svelte project, powered by [`create-svelte`](https://github.com/sveltejs/kit/tree/main/packages/create-svelte).

## Creating a project

If you're seeing this, you've probably already done this step. Congrats!

\`\`\`bash
# create a new project in the current directory
npm create svelte@latest

# create a new project in my-app
npm create svelte@latest my-app
\`\`\`

## Developing

Once you've created a project and installed dependencies with `npm install` (or `pnpm install` or `yarn`), start a development server:

\`\`\`bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
\`\`\`

## Building

To create a production version of your app:

\`\`\`bash
npm run build
\`\`\`

You can preview the production build with `npm run preview`.

> To deploy your app, you may need to install an [adapter](https://kit.svelte.dev/docs/adapters) for your target environment.

```

# .prettierrc

```
{
	"useTabs": true,
	"singleQuote": true,
	"trailingComma": "none",
	"printWidth": 100,
	"plugins": ["prettier-plugin-svelte"],
	"overrides": [{ "files": "*.svelte", "options": { "parser": "svelte" } }]
}

```

# .prettierignore

```
# Package Managers
package-lock.json
pnpm-lock.yaml
yarn.lock

```

# .npmrc

```
engine-strict=true

```

# .gitignore

```
node_modules

# Output
.output
.vercel
/.svelte-kit
/build

# OS
.DS_Store
Thumbs.db

# Env
.env
.env.*
!.env.example
!.env.test

# Vite
vite.config.js.timestamp-*
vite.config.ts.timestamp-*

```

# static/favicon.png

This is a binary file of the type: Image

# src/app.html

```html
<!doctype html>
<html lang="en">
	<head>
		<meta charset="utf-8" />
		<link rel="icon" href="%sveltekit.assets%/favicon.png" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		%sveltekit.head%
	</head>
	<body data-sveltekit-preload-data="hover">
		<div style="display: contents">%sveltekit.body%</div>
	</body>
</html>

```

# src/app.d.ts

```ts
// See https://kit.svelte.dev/docs/types#app
// for information about these interfaces
declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};

```

# src/app.css

```css
@import url('https://fonts.googleapis.com/css2?family=Londrina+Solid:wght@100;300;400;900&display=swap');

@tailwind base;
@tailwind components;
@tailwind utilities;

```

# drizzle/0000_material_morlun.sql

```sql
CREATE TABLE `board_games` (
	`id` integer PRIMARY KEY NOT NULL,
	`bgg_id` text NOT NULL,
	`name` text NOT NULL,
	`year_published` integer,
	`min_players` integer,
	`max_players` integer,
	`playing_time` integer,
	`min_play_time` integer,
	`max_play_time` integer,
	`age` integer,
	`description` text,
	`thumbnail` text,
	`image` text,
	`categories` text,
	`mechanics` text,
	`designers` text,
	`artists` text,
	`publishers` text
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY NOT NULL,
	`name` text,
	`email` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `board_games_bgg_id_unique` ON `board_games` (`bgg_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);
```

# src/routes/+server.ts

```ts
import { initializeDatabase } from '$lib/db';

// Initialize the database when the server starts
initializeDatabase();
// runMigrations();
// \`\`\`

```

# src/routes/+page.svelte

```svelte
<script lang="ts">
	import type { PageData } from './$types';
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/db/schema';

	const {
		data
	}: {
		data: {
			games: BoardGame[];
			meta: {
				page: number;
				totalPages: number;
				totalCount: number;
				limit: number;
			};
		};
	} = $props();

	let currentPage = $state(parseInt($page.url.searchParams.get('page') || '1'));
	let gamesPerPage = $state(parseInt($page.url.searchParams.get('limit') || '20'));
	let searchQuery = $state('');

	async function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { keepFocus: true });
	}

	async function handleSearch() {
		const url = new URL($page.url);
		url.searchParams.set('name', searchQuery);
		url.searchParams.set('page', '1');
		await goto(url.toString());
	}
</script>

<svelte:head>
	<title>Brads Spelcafé</title>
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Brads Spelcafé Game Catalogue</h1>

	<div class="mb-6">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search for a board game..."
			class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button onclick={handleSearch} class="mt-2 px-4 py-2 bg-blue-500 text-white rounded">
			Search
		</button>
	</div>

	<BoardGameGrid games={data.games} />

	<div class="flex justify-center items-center space-x-2 mt-4">
		<button
			onclick={() => changePage(currentPage - 1)}
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
			disabled={currentPage === 1}
		>
			Previous
		</button>
		{#each Array(data.meta.totalPages) as _, i}
			<button
				onclick={() => changePage(i + 1)}
				class="px-4 py-2 rounded {currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
			>
				{i + 1}
			</button>
		{/each}
		<button
			onclick={() => changePage(currentPage + 1)}
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
			disabled={currentPage === data.meta.totalPages}
		>
			Next
		</button>
	</div>
</main>

```

# src/routes/+page.server.ts

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const filterName = url.searchParams.get('name') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (filterName) {
		apiUrl.searchParams.set('name', filterName);
	}

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	// console.log(data);

	return {
		games: data.data,
		meta: data.meta
	};
};

```

# src/routes/+layout.svelte

```svelte
<script>
	import '../app.css';
</script>

<div class="bg-brads-yellow-light">
	<slot />
</div>

```

# src/lib/index.ts

```ts
// place files you want to import through the `$lib` alias in this folder.

```

# src/lib/fetchGames.ts

```ts
import { db } from './db';
import { boardGames, type BoardGame } from './db/schema';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { eq } from 'drizzle-orm';

// const gameList: string[] = [
// 	'10 Minute Heist - the wizard tower',
// 	'3 wishes',
// 	'5 minute dungeon - curses foiled again',
// 	'5 minute dungeon',
// 	'5 minute mystery',
// 	'6nimmt',
// 	'7 wonders',
// 	'7 wonders Architects',
// 	'7 wonders duel',
// 	'A castle for all seasons',
// 	'A game of thrones',
// 	'Alias',
// 	'Antidote',
// 	'Ants for queen and colony',
// 	'Arabian Nights',
// 	'Arboretum',
// 	'Arboria',
// 	'Are you the traitor',
// 	'Arena for the gods',
// 	'Arena Maximus',
// 	'Ascent gif of the elements',
// 	'Avalon',
// 	'Awesome Kingdom',
// 	'Azul',
// 	'Azul - Queens Garden',
// 	'Badaboom',
// 	'Balloon Pop',
// 	'Bamse honungs-jakt',
// 	'Bananorama',
// 	'Bang game',
// 	'Bang the dice game',
// 	'Bang the dice game',
// 	'Battlestations',
// 	'Bazar Bizarre',
// 	'Beehive game',
// 	'Bezzerwizzer declare',
// 	'Bezzerwizzer filmparlor',
// 	'Bezzerwizzer green box',
// 	'Bezzerwizzer Svenska Hits',
// 	'Bezzerwizzer Svenska Språket',
// 	'Biblios',
// 	'Billionaire Banshee',
// 	'Board Game name',
// 	'Boggle',
// 	'Bohnanza',
// 	'Boss Monster crash landing',
// 	'Boss monster expansion the next level',
// 	'Boss Monster tools of the hero kind',
// 	'Boss Monsters the dungeon building card game',
// 	'Boss Monsters the dungeon building card game',
// 	'Bossmonster implements of destruction',
// 	'Box Monster',
// 	'Brainstorms',
// 	'Brawling barons',
// 	'Calico',
// 	'Captain Sonar',
// 	'Captain Sonar',
// 	'Carcassonne',
// 	'Carcassonne big box',
// 	'Carcassonne hunters and gatherers',
// 	'Carcassonne junior',
// 	'Cards against humanity',
// 	'Cartographers',
// 	'Catan',
// 	'Catan Junior',
// 	'Catan Människans Gryning',
// 	'Catan: The cities and knights of catan',
// 	'Cave troll',
// 	'Cerebria the inside world',
// 	'Chaos Marauders',
// 	'Chariots of rome',
// 	'Chess',
// 	'Chess',
// 	'Chess',
// 	'Childarting',
// 	'Chinese Checkers',
// 	'Chinese Checkers',
// 	'Chinese Checkers',
// 	'Choco',
// 	'Chocolate factory',
// 	'Chronicles of crime',
// 	'Cirkus Topito',
// 	'Citadels',
// 	'Civilisation a new dawn',
// 	'Clash of decks',
// 	'Cluedo',
// 	'Coco Crazy',
// 	'Board Game name',
// 	'Codenames',
// 	'Combo Fighters Pack 1',
// 	'Combo Fighters Pack 2',
// 	'Combo Fighters Pack 3',
// 	'Competo',
// 	'Confident?',
// 	'Connect Four- flying tiger shop',
// 	'Control',
// 	'Coup',
// 	'Cranium (swe)',
// 	'Crooked Kingdom',
// 	'Cthulhu deluxe',
// 	'Dawn of Ulos',
// 	'Dead mans draw',
// 	'Deception - murder in hong kong',
// 	'Decrypto',
// 	'Delta V',
// 	'Descent journey in the dark',
// 	'Dictator series',
// 	'Dinner in Paris',
// 	'Dixit',
// 	'Djur',
// 	'Dobble',
// 	'Dominion',
// 	'Domino',
// 	'Dominoes',
// 	"Don't go chasing waterfalls",
// 	"Don't mess with Cthulhu deluxe",
// 	'Dragomino',
// 	'Dragons Board',
// 	'Dragons Gold',
// 	'Drak Borgen',
// 	'Duelosaur Island',
// 	'Dungeon Roll',
// 	'Epic',
// 	'Epic - Card Game',
// 	'Equinox',
// 	'Everdell',
// 	'Exploding kittens',
// 	'Exploding kittens recipes for disaster',
// 	'Fake artist',
// 	'Board Game name',
// 	'Family Business',
// 	'Family Inc',
// 	'Fauna',
// 	'Feud',
// 	'Fidelitas',
// 	'Fire and Stone',
// 	'First light',
// 	'Five points gangs of new york',
// 	'Flag it',
// 	'Flamecraft',
// 	'Flamme Rouge',
// 	'Fruit Bandits',
// 	'Games of thrones',
// 	'Gammelgäddan',
// 	'Geni familj',
// 	'Geni Origin',
// 	'Get on board new york ed',
// 	'Ghost for sale',
// 	'Gloom',
// 	'Gods love Dinosaurs',
// 	'Goetia',
// 	'Gold fever',
// 	'Good look',
// 	'Grimoire',
// 	'Hanabi',
// 	'Hansa Teutonica big box ?',
// 	'Hard to Get',
// 	'Heat',
// 	'Hegemonic',
// 	'Here be dragons',
// 	'Hero Quest game system',
// 	'Herrlof',
// 	'High Concept',
// 	'Hint',
// 	'Hive bag',
// 	'Hive box - charcoal',
// 	'Hobbiten',
// 	'Hues and cues',
// 	'insider',
// 	'Its alive',
// 	'Jägersro',
// 	'Jaipur',
// 	'Jeopardy',
// 	'Jorvik',
// 	'Jungle Speed',
// 	'Board Game name',
// 	'Jungle Speed',
// 	'Junkyard Races',
// 	'Just one',
// 	'Kablamo',
// 	'Kakerlak poker',
// 	'Kalabalik',
// 	'Kashgar',
// 	'Key force',
// 	'Kid blocks',
// 	'King of new york',
// 	'King of the Valley',
// 	'King of Toyko',
// 	'Kingdoms',
// 	'Kivi',
// 	'Klask',
// 	'Kodama',
// 	'Kyoto',
// 	'Lär om Bokstäver',
// 	'Lets summon demons',
// 	'Little town',
// 	'Living forest',
// 	'london after midnight',
// 	'Lost Valley',
// 	'Love letter batman',
// 	'Love Letters',
// 	'Mag.... talkavuori',
// 	'Magdar',
// 	'Magic Labyrinth',
// 	'Magic Maze',
// 	'Magic World Game',
// 	'Maha Raja',
// 	'Malmö',
// 	'Mamma mu',
// 	'Mantis',
// 	'Marrekech',
// 	'Match Madness',
// 	'Mazescape',
// 	'Memonsters',
// 	'Mia London',
// 	'Mimiq',
// 	'Mio',
// 	'Mixmax',
// 	'Monopoly',
// 	'Monthy Python Fluxx',
// 	'Mosh pit',
// 	'Board Game name',
// 	'Munchkin',
// 	'Mutiny',
// 	'Myran',
// 	'Myrstacken',
// 	'Mysterium',
// 	'När och Fjärran',
// 	'Odins Ravens',
// 	'Ohanami',
// 	'Once upon a time',
// 	'One Deck Dungeon',
// 	'One night ultimate werewolf',
// 	'Othello',
// 	'På Riktigt',
// 	'På Spåret',
// 	'På Spåret',
// 	'panda splash',
// 	'Pandemic',
// 	'Pandemic Hot zone',
// 	'Patchwork nordic',
// 	'Pathfinder beginner box',
// 	'Pcture lotto - tiger game',
// 	'Pentaquark',
// 	'Pictures',
// 	'Point Salad',
// 	'Potion Panic',
// 	'Primate fear',
// 	'quacks quedlinburg?',
// 	'Qwixx',
// 	'Rackar Unge',
// 	'Rackare',
// 	'Rackare 2',
// 	'Rackare 3',
// 	'Railroad ink',
// 	'Red November',
// 	'Renature',
// 	'Rise to Nobility',
// 	'Risk',
// 	'Road Rally',
// 	'Rövardotter',
// 	'Runewars',
// 	'Runewars Miniature game',
// 	'Sagrada?',
// 	'Scrabble',
// 	'Board Game name',
// 	'Scrabble',
// 	'Scythe',
// 	'Sea of clouds',
// 	'Secret Hitler',
// 	'Settlers of catan',
// 	'Shadows over Camelot',
// 	'Sheriff of Nottingham',
// 	'Similo - Harry Potter',
// 	'Sing SIng',
// 	'Sing sing 2',
// 	'Sjön',
// 	'Ska vi sla vad',
// 	'SKattön',
// 	'Skogen',
// 	'Skogen tube',
// 	'Skyjo',
// 	'Skyjo',
// 	'Sling Pro Puck',
// 	'Smallworld',
// 	'Smart 10',
// 	'Solsidan',
// 	'Sonar',
// 	'Sonora',
// 	'Space Race',
// 	'Space Race',
// 	'Spank the monkey',
// 	'Speakeasy',
// 	'Spies and lies',
// 	'Spirit Island',
// 	'Splendor',
// 	'Star Traders',
// 	'Story cubes',
// 	'Storyteller dice',
// 	'Suffrage',
// 	'Superfight',
// 	'Sushi Go',
// 	'Svea Rike',
// 	'Take it easy',
// 	'Takenoko',
// 	'Tatsu',
// 	'Terraforming mars',
// 	'The banner saga warbands',
// 	'The Big Book of Madness',
// 	'The Border',
// 	'The Crew',
// 	'Board Game name',
// 	'The flow of history',
// 	'The fox and the forest',
// 	'The guzzled',
// 	'The isle of cats',
// 	'The legend of drizzt',
// 	'The Marcy Case',
// 	'The Resistance',
// 	'The tree lined avenue',
// 	'Three dragon ante',
// 	'Tic Tac Toe',
// 	'Tic Tak Ko',
// 	'Ticket to ride',
// 	'Ticket to ride Europe',
// 	'Ticket to ride Northern Lights',
// 	'Time Stories',
// 	'Timeline',
// 	'Tiny Footprints',
// 	'Tipperary',
// 	'Tobago',
// 	'Tour operator',
// 	'Treasure hunter',
// 	'Tres',
// 	'Trexo',
// 	'Trial by trolley',
// 	'Trivia Pursuit - Master Ed.',
// 	'Trivia Pursuit - Millenium',
// 	'Trivia Pursuit - Swedish Ed.',
// 	'Trodde du',
// 	'Tsuro',
// 	'Tumble',
// 	'Twilight squabble',
// 	'Twilight Struggle',
// 	'Twin?',
// 	'Unlock Kids',
// 	'Unlock Plane',
// 	'Unpub',
// 	'Unstable Unicorns',
// 	'Vampire Dark Influences',
// 	'Varulv',
// 	'Vikings gone wild',
// 	'Village',
// 	'Villainous',
// 	'Vuxenpoäng',
// 	'Board Game name',
// 	'War of the realms',
// 	'Wavelength',
// 	'We can play',
// 	'Welcome to Las Vegas',
// 	'Werewolf house',
// 	'Wingspan',
// 	'Winter',
// 	'Witch of Salem',
// 	'Wizard The ultimate game of trump',
// 	'Wreckage',
// 	'Yatzy Maxi',
// 	'Yucata',
// 	'Zapp Zerepp'
// ];

const gameList: string[] = [
	'Spirit Island',
	'Splendor',
	'Patchwork',
	'Spirit Island: Nature Incarnate',
	'Spirit Island: Jagged Earth',
	'Spirit Island: Branch & Claw',
	'Coup'
];

async function searchGameId(name: string): Promise<string | null> {
	const response = await fetch(
		`https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(name)}&type=boardgame&exact=1`
	);
	const xmlText = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
	const items = xmlDoc.getElementsByTagName('item');

	const gameId = items.length > 0 ? items[0].getAttribute('id') : null;
	if (gameId) {
		console.log(`Found ID for ${name}: ${gameId}`);
		return gameId;
	}

	return null;
}

async function fetchGameData(id: string) {
	const response = await fetch(`https://boardgamegeek.com/xmlapi2/thing?id=${id}`);
	const xmlText = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

	function getTextContent(tagName: string): string {
		const elements = xmlDoc.getElementsByTagName(tagName);
		return elements.length > 0 ? elements[0].textContent || '' : '';
	}

	function getAttribute(tagName: string, attr: string): string {
		const elements = xmlDoc.getElementsByTagName(tagName);
		return elements.length > 0 ? elements[0].getAttribute(attr) || '' : '';
	}

	function getLinkedValues(type: string): string[] {
		const links = xmlDoc.getElementsByTagName('link');
		return Array.from(links)
			.filter((link) => link.getAttribute('type') === type)
			.map((link) => link.getAttribute('value') || '');
	}

	return {
		bggId: id,
		name: getAttribute('name', 'value'),
		yearPublished: parseInt(getAttribute('yearpublished', 'value') || '0'),
		minPlayers: parseInt(getAttribute('minplayers', 'value') || '0'),
		maxPlayers: parseInt(getAttribute('maxplayers', 'value') || '0'),
		playingTime: parseInt(getAttribute('playingtime', 'value') || '0'),
		minPlayTime: parseInt(getAttribute('minplaytime', 'value') || '0'),
		maxPlayTime: parseInt(getAttribute('maxplaytime', 'value') || '0'),
		age: parseInt(getAttribute('minage', 'value') || '0'),
		description: getTextContent('description'),
		thumbnail: getTextContent('thumbnail'),
		image: getTextContent('image'),
		categories: JSON.stringify(getLinkedValues('boardgamecategory')),
		mechanics: JSON.stringify(getLinkedValues('boardgamemechanic')),
		designers: JSON.stringify(getLinkedValues('boardgamedesigner')),
		artists: JSON.stringify(getLinkedValues('boardgameartist')),
		publishers: JSON.stringify(getLinkedValues('boardgamepublisher'))
	};
}

async function gameIdExistsInDb(bggId: string): Promise<boolean> {
	const existingGames = await db
		.select({ id: boardGames.id })
		.from(boardGames)
		.where(eq(boardGames.bggId, bggId))
		.limit(1);

	return existingGames.length > 0;
}

async function insertGameData(gameData: BoardGame) {
	try {
		const gameExists = await gameIdExistsInDb(gameData.bggId);

		if (gameExists) {
			console.log(`--Game ${gameData.name} already exists in the database`);
			return;
		}

		await db.insert(boardGames).values(gameData);
		console.log(`++Inserted: ${gameData.name}`);
	} catch (error) {
		console.error(`Error inserting ${gameData.name}:`, error);
	}
}

export async function processGames() {
	// Remove duplicates and "Board Game name" entries
	const uniqueGames = [...new Set(gameList.filter((game) => game !== 'Board Game name'))];

	for (const game of uniqueGames) {
		try {
			const gameId = await searchGameId(game);
			if (gameId) {
				const gameData = await fetchGameData(gameId);
				await insertGameData(gameData);
			} else {
				console.log(`--Could not find ID for: ${game}`);
			}
		} catch (error) {
			console.error(`Error processing ${game}:`, error);
		}

		// Add a delay to avoid overwhelming the BGG API
		await new Promise((resolve) => setTimeout(resolve, 666));
	}
}

processGames().then(() => console.log('Finished processing all games'));

```

# drizzle/meta/_journal.json

```json
{
  "version": "7",
  "dialect": "sqlite",
  "entries": [
    {
      "idx": 0,
      "version": "6",
      "when": 1720952092287,
      "tag": "0000_material_morlun",
      "breakpoints": true
    }
  ]
}
```

# drizzle/meta/0000_snapshot.json

```json
{
  "version": "6",
  "dialect": "sqlite",
  "id": "33a82f1e-c0bd-4660-8b3a-0fd7e1dd307f",
  "prevId": "00000000-0000-0000-0000-000000000000",
  "tables": {
    "board_games": {
      "name": "board_games",
      "columns": {
        "id": {
          "name": "id",
          "type": "integer",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        },
        "bgg_id": {
          "name": "bgg_id",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "year_published": {
          "name": "year_published",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "min_players": {
          "name": "min_players",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "max_players": {
          "name": "max_players",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "playing_time": {
          "name": "playing_time",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "min_play_time": {
          "name": "min_play_time",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "max_play_time": {
          "name": "max_play_time",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "age": {
          "name": "age",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "description": {
          "name": "description",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "thumbnail": {
          "name": "thumbnail",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "image": {
          "name": "image",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "categories": {
          "name": "categories",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "mechanics": {
          "name": "mechanics",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "designers": {
          "name": "designers",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "artists": {
          "name": "artists",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "publishers": {
          "name": "publishers",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {
        "board_games_bgg_id_unique": {
          "name": "board_games_bgg_id_unique",
          "columns": [
            "bgg_id"
          ],
          "isUnique": true
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {}
    },
    "users": {
      "name": "users",
      "columns": {
        "id": {
          "name": "id",
          "type": "integer",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        },
        "name": {
          "name": "name",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "email": {
          "name": "email",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        }
      },
      "indexes": {
        "users_email_unique": {
          "name": "users_email_unique",
          "columns": [
            "email"
          ],
          "isUnique": true
        }
      },
      "foreignKeys": {},
      "compositePrimaryKeys": {},
      "uniqueConstraints": {}
    }
  },
  "enums": {},
  "_meta": {
    "schemas": {},
    "tables": {},
    "columns": {}
  },
  "internal": {
    "indexes": {}
  }
}
```

# src/routes/admin/+page.svelte

```svelte
<script lang="ts">
	import type { PageData } from './$types';

	export let data: PageData;
</script>

<input placeholder="Search BGG..." />
<button>Add Game</button>

```

# src/routes/admin/+page.server.ts

```ts
import type { PageServerLoad } from './$types';

export const load = (async () => {
	return {};
}) satisfies PageServerLoad;

```

# src/routes/admin/+layout.svelte

```svelte
<script lang="ts">
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

```

# src/lib/db/schema.ts

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: integer('id').primaryKey(),
	name: text('name'),
	email: text('email').unique()
});

export const boardGames = sqliteTable('board_games', {
	id: integer('id').primaryKey(),
	bggId: text('bgg_id').notNull().unique(),
	name: text('name').notNull(),
	yearPublished: integer('year_published'),
	minPlayers: integer('min_players'),
	maxPlayers: integer('max_players'),
	playingTime: integer('playing_time'),
	minPlayTime: integer('min_play_time'),
	maxPlayTime: integer('max_play_time'),
	age: integer('age'),
	description: text('description'),
	thumbnail: text('thumbnail'),
	image: text('image'),
	categories: text('categories'),
	mechanics: text('mechanics'),
	designers: text('designers'),
	artists: text('artists'),
	publishers: text('publishers')
});

export type BoardGame = typeof boardGames.$inferSelect;

```

# src/lib/db/index.ts

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite);

// Initialize the database with the schema
export function initializeDatabase() {
	sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE
    )
  `);

	sqlite.exec(`
    CREATE TABLE IF NOT EXISTS board_games (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      bgg_id TEXT NOT NULL UNIQUE,
      name TEXT NOT NULL,
      year_published INTEGER,
      min_players INTEGER,
      max_players INTEGER,
      playing_time INTEGER,
      min_play_time INTEGER,
      max_play_time INTEGER,
      age INTEGER,
      description TEXT,
      thumbnail TEXT,
      image TEXT,
      categories TEXT,
      mechanics TEXT,
      designers TEXT,
      artists TEXT,
      publishers TEXT
    )
  `);
}

// Run migrations
export function runMigrations() {
	migrate(db, { migrationsFolder: './drizzle' });
}

```

# src/lib/components/BoardGameGrid.svelte

```svelte
<script lang="ts">
	import type { BoardGame } from '$lib/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
	{#each games as game}
		<a href={`/game/${game.bggId}`} class="hover:shadow-lg">
			<div class="bg-white p-4 rounded shadow">
				<img src={game.image} alt={game.name} class="w-full h-48 object-contain mb-2" />
				<h3 class="font-semibold text-sm mb-2">{game.name}</h3>
				<p class="text-sm text-gray-600">Players: {game.minPlayers} - {game.maxPlayers}</p>
				<p class="text-sm text-gray-600">Play Time: {game.playingTime} min</p>
			</div>
		</a>
	{/each}
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600">No games found.</p>
{/if}

```

# src/routes/game/[id]/+page.svelte

```svelte
<!-- src/routes/game/[id]/+page.svelte -->
<script lang="ts">
	import type { BoardGame } from '$lib/db/schema';
	import { slide } from 'svelte/transition';
	import { onMount } from 'svelte';

	type PageProps = {
		data: {
			game: BoardGame;
		};
	};

	type BoardGameDetails = BoardGame & {
		categories: string[];
		mechanics: string[];
		designers: string[];
	};

	let { data }: PageProps = $props();
	let game = $state(data.game);

	$inspect(game);

	let isDescriptionExpanded = $state(false);
	let areCategoriesExpanded = $state(false);
	let areMechanicsExpanded = $state(false);

	function toggleDescription() {
		isDescriptionExpanded = !isDescriptionExpanded;
	}

	function toggleCategories() {
		areCategoriesExpanded = !areCategoriesExpanded;
	}

	function toggleMechanics() {
		areMechanicsExpanded = !areMechanicsExpanded;
	}

	function cleanArray(str: string | null): string[] {
		if (typeof str !== 'string') return [];
		return str
			.replace(/^\[|\]$/g, '')
			.split(',')
			.map((item) => item.trim().replace(/^"|"$/g, ''));
	}

	$effect(() => {
		game = {
			...game,
			categories: cleanArray(game.categories),
			mechanics: cleanArray(game.mechanics),
			designers: cleanArray(game.designers)
		};
	});
</script>

<svelte:head>
	<title>{game.name} - Board Game Details</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-6xl">
	<a href="/" class="text-teal-500 hover:text-teal-700 mb-4 inline-block font-bold"
		>&larr; Back to Game List</a
	>

	<div
		class="bg-gradient-to-br from-brads-green-dark to-brads-yellow-light shadow-2xl rounded-3xl overflow-hidden text-white"
	>
		<div class="relative h-96">
			{#if game.image}
				<img src={game.image} alt={game.name} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full bg-gray-300 flex items-center justify-center">
					No image available
				</div>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
		</div>

		<div class="p-8">
			<h2 class="text-4xl font-extrabold leading-tight mb-2">{game.name}</h2>
			<p class="text-xl mb-6">{game.yearPublished ?? 'Year unknown'}</p>

			<div class="grid grid-cols-2 sm:grid-cols-3 gap-6 text-lg mb-8">
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">
						{game.minPlayers ?? '?'} - {game.maxPlayers ?? '?'}
					</p>
					<p class="text-sm uppercase tracking-wide">Players</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">{game.playingTime ?? '?'} min</p>
					<p class="text-sm uppercase tracking-wide">Play Time</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">{game.age ? `${game.age}+` : 'Any'}</p>
					<p class="text-sm uppercase tracking-wide">Age</p>
				</div>
			</div>

			<div class="space-y-6">
				{#if game.categories && game.categories.length > 0}
					<div>
						<button onclick={toggleCategories} class="text-xl font-semibold mb-2 flex items-center">
							Categories
							<svg
								class="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areCategoriesExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2">
							{#each game.categories.slice(0, areCategoriesExpanded ? undefined : 3) as category}
								<span class="bg-teal-700 px-3 py-1 rounded-full text-sm">{category}</span>
							{/each}
							{#if !areCategoriesExpanded && game.categories.length > 3}
								<button
									class="bg-teal-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleCategories}>+{game.categories.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if game.mechanics && game.mechanics.length > 0}
					<div>
						<button onclick={toggleMechanics} class="text-xl font-semibold mb-2 flex items-center">
							Mechanics
							<svg
								class="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areMechanicsExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2">
							{#each game.mechanics.slice(0, areMechanicsExpanded ? undefined : 3) as mechanic}
								<span class="bg-blue-700 px-3 py-1 rounded-full text-sm">{mechanic}</span>
							{/each}
							{#if !areMechanicsExpanded && game.mechanics.length > 3}
								<button
									class="bg-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleMechanics}>+{game.mechanics.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if game.designers && game.designers.length > 0}
					<div>
						<h2 class="text-xl font-semibold mb-2">Designers</h2>
						<div>{game.designers}</div>
					</div>
				{/if}
			</div>
		</div>

		{#if game.description}
			<div class="px-8 py-6 bg-white/10">
				<button
					onclick={toggleDescription}
					class="text-white bg-teal-600 hover:bg-teal-700 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
				>
					{isDescriptionExpanded ? 'Hide Description' : 'Show Description'}
				</button>

				{#if isDescriptionExpanded}
					<div transition:slide={{ duration: 300 }} class="mt-4 text-white/90 leading-relaxed">
						{@html game.description}
					</div>
				{/if}
			</div>
		{/if}
	</div>
</main>

<style>
	:global(body) {
		background-color: #f0f4f8;
	}
</style>

```

# src/routes/game/[id]/+page.server.ts

```ts
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params, fetch }) => {
	const response = await fetch(`/api/games?id=${params.id}`);

	if (!response.ok) {
		throw error(response.status, 'Failed to load game data');
	}

	const game = await response.json();

	return { game };
};

```

# src/routes/api/users/+server.ts

```ts
import { json, type RequestHandler } from '@sveltejs/kit';

import { db } from '$lib/db';
import { users } from '$lib/db/schema';

export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, email } = await request.json();
	const newUser = await db.insert(users).values({ name, email }).returning();
	return json(newUser[0]);
};

```

# src/routes/api/games/+server.ts

```ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, asc, desc, sql } from 'drizzle-orm';
import { db } from '$lib/db';
import { boardGames } from '$lib/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		// Get a specific game by ID
		const game = await db.select().from(boardGames).where(eq(boardGames.bggId, id));
		if (game.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}
		return json(game[0]);
	} else {
		// Get all games with pagination, sorting, and filtering
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const sortOrder = url.searchParams.get('sortOrder') || 'asc';
		const filterName = url.searchParams.get('name');

		let query = db.select().from(boardGames);

		// Apply filtering
		if (filterName) {
			query = query.where(sql`${boardGames.name} LIKE ${`%${filterName}%`}`);
		}

		// Apply sorting
		if (sortBy in boardGames) {
			query = query.orderBy(
				sortOrder === 'desc' ? desc(boardGames[sortBy]) : asc(boardGames[sortBy])
			);
		}

		// Get total count for pagination
		const totalCountResult = await db.select({ count: sql`count(*)` }).from(boardGames);
		const totalCount = Number(totalCountResult[0].count);

		// Apply pagination
		const offset = (page - 1) * limit;
		query = query.limit(limit).offset(offset);

		const games = await query;

		return json({
			data: games,
			meta: {
				totalCount,
				page,
				limit,
				totalPages: Math.ceil(totalCount / limit)
			}
		});
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	try {
		const newGame = await db
			.insert(boardGames)
			.values({
				bggId: gameData.id,
				name: gameData.name,
				yearPublished: gameData.yearPublished,
				minPlayers: gameData.minPlayers,
				maxPlayers: gameData.maxPlayers,
				playingTime: gameData.playingTime,
				minPlayTime: gameData.minPlayTime,
				maxPlayTime: gameData.maxPlayTime,
				age: gameData.age,
				description: gameData.description,
				thumbnail: gameData.thumbnail,
				image: gameData.image,
				categories: JSON.stringify(gameData.categories),
				mechanics: JSON.stringify(gameData.mechanics),
				designers: JSON.stringify(gameData.designers),
				artists: JSON.stringify(gameData.artists),
				publishers: JSON.stringify(gameData.publishers)
			})
			.returning();

		return json(newGame[0], { status: 201 });
	} catch (error) {
		console.error('Error inserting game:', error);
		return json({ error: 'Failed to insert game' }, { status: 500 });
	}
};

export const PUT: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	if (!gameData.bggId) {
		return json({ error: 'BGG ID is required for updating' }, { status: 400 });
	}

	try {
		const updatedGame = await db
			.update(boardGames)
			.set({
				name: gameData.name,
				yearPublished: gameData.yearPublished,
				minPlayers: gameData.minPlayers,
				maxPlayers: gameData.maxPlayers,
				playingTime: gameData.playingTime,
				minPlayTime: gameData.minPlayTime,
				maxPlayTime: gameData.maxPlayTime,
				age: gameData.age,
				description: gameData.description,
				thumbnail: gameData.thumbnail,
				image: gameData.image,
				categories: JSON.stringify(gameData.categories),
				mechanics: JSON.stringify(gameData.mechanics),
				designers: JSON.stringify(gameData.designers),
				artists: JSON.stringify(gameData.artists),
				publishers: JSON.stringify(gameData.publishers)
			})
			.where(eq(boardGames.bggId, gameData.bggId))
			.returning();

		if (updatedGame.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		return json(updatedGame[0]);
	} catch (error) {
		console.error('Error updating game:', error);
		return json({ error: 'Failed to update game' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');
	const deleteAll = url.searchParams.get('deleteAll');

	if (deleteAll === 'true') {
		// Delete all games
		try {
			await db.delete(boardGames);
			return json({ message: 'All games have been deleted' });
		} catch (error) {
			console.error('Error deleting all games:', error);
			return json({ error: 'Failed to delete all games' }, { status: 500 });
		}
	} else if (id) {
		// Delete a specific game by BGG ID
		try {
			const deletedGame = await db.delete(boardGames).where(eq(boardGames.bggId, id)).returning();

			if (deletedGame.length === 0) {
				return json({ error: 'Game not found' }, { status: 404 });
			}

			return json({ message: 'Game deleted successfully', deletedGame: deletedGame[0] });
		} catch (error) {
			console.error('Error deleting game:', error);
			return json({ error: 'Failed to delete game' }, { status: 500 });
		}
	} else {
		return json(
			{ error: 'Invalid delete request. Provide an id or set deleteAll=true' },
			{ status: 400 }
		);
	}
};

```

