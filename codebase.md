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
		"compile": "tsc",
		"dev": "vite dev",
		"build": "vite build",
		"preview": "vite preview",
		"check": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json",
		"check:watch": "svelte-kit sync && svelte-check --tsconfig ./tsconfig.json --watch",
		"lint": "prettier --check . && eslint .",
		"format": "prettier --write .",
		"studio": "drizzle-kit studio",
		"db:generate": "drizzle-kit generate --config drizzle.config.ts",
		"db:push": "drizzle-kit push --config drizzle.config.ts",
		"db:migrate": "tsx ./src/lib/server/db/migrate.ts"
	},
	"devDependencies": {
		"@sveltejs/adapter-auto": "^3.2.2",
		"@sveltejs/kit": "^2.5.18",
		"@sveltejs/vite-plugin-svelte": "^3.1.1",
		"@types/better-sqlite3": "^7.6.11",
		"@types/eslint": "^9.6.0",
		"@types/node": "^20.14.12",
		"@types/node-fetch": "^2.6.11",
		"@types/xmldom": "^0.1.34",
		"autoprefixer": "^10.4.19",
		"drizzle-kit": "^0.23.0",
		"eslint": "^9.7.0",
		"eslint-config-prettier": "^9.1.0",
		"eslint-plugin-svelte": "^2.43.0",
		"globals": "^15.8.0",
		"postcss": "^8.4.40",
		"prettier": "^3.3.3",
		"prettier-plugin-svelte": "^3.2.6",
		"svelte": "^5.0.0-next.1",
		"svelte-check": "^3.8.4",
		"tailwindcss": "^3.4.6",
		"ts-node": "^10.9.2",
		"tslib": "^2.6.3",
		"typescript": "^5.5.4",
		"typescript-eslint": "^8.0.0-alpha.20",
		"vite": "^5.3.4"
	},
	"type": "module",
	"dependencies": {
		"@lucia-auth/adapter-drizzle": "^1.0.7",
		"@xmldom/xmldom": "^0.8.10",
		"better-sqlite3": "^11.1.2",
		"drizzle-orm": "^0.32.1",
		"lucia": "^3.2.0",
		"node-fetch": "^3.3.2",
		"oslo": "^1.2.1"
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
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{ argsIgnorePattern: '^_', varsIgnorePattern: '^_' }
			]
		}
	}
];

```

# drizzle.config.ts

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
	schema: './src/lib/server/db/schema.ts',
	out: './drizzle',
	dialect: 'sqlite',
	dbCredentials: {
		url: './sqlite.db'
	},
	verbose: true
});

```

# README.md

```md
# Brads Spelcafé Game Catalogue

A SvelteKit application for managing and displaying board game information for Brads Spelcafé.

## Features

- Browse a catalogue of board games
- Search functionality
- Admin panel for adding new games from BoardGameGeek
- Responsive design using Tailwind CSS

## Prerequisites

- Node.js (v14 or later)
- npm or yarn

## Getting Started

1. Clone the repository:

   \`\`\`bash
   git clone https://github.com/yourusername/brads-spelcafe-catalogue.git
   cd brads-spelcafe-catalogue
   \`\`\`

2. Install dependencies:

   \`\`\`bash
   npm install
   # or
   yarn install
   \`\`\`

3. Set up the database:

   \`\`\`bash
   npm run db:setup
   # or
   yarn db:setup
   \`\`\`

4. Start the development server:

   \`\`\`bash
   npm run dev
   # or
   yarn dev
   \`\`\`

5. Open your browser and navigate to `http://localhost:5173`

## Building for Production

To create a production version of the app:

\`\`\`bash
npm run build
# or
yarn build
\`\`\`

You can preview the production build with:

\`\`\`bash
npm run preview
# or
yarn preview
\`\`\`

## Project Structure

- `/src`: Source files
  - `/routes`: SvelteKit routes
  - `/lib`: Shared components and utilities
  - `/db`: Database related files
- `/static`: Static assets
- `/tests`: Test files

## Technologies Used

- [SvelteKit](https://kit.svelte.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [DrizzleORM](https://github.com/drizzle-team/drizzle-orm)
- [Better-SQLite3](https://github.com/JoshuaWise/better-sqlite3)

## API Endpoints

- `GET /api/games`: Fetch games with pagination and filtering
- `POST /api/games`: Add a new game to the database
- `GET /api/bgg-search`: Search BoardGameGeek for games

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.

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

# src/hooks.server.ts

```ts
import { lucia } from '$lib/server/auth';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const sessionId = event.cookies.get(lucia.sessionCookieName);
	if (!sessionId) {
		event.locals.user = null;
		event.locals.session = null;
		return resolve(event);
	}

	const { session, user } = await lucia.validateSession(sessionId);
	if (session && session.fresh) {
		const sessionCookie = lucia.createSessionCookie(session.id);
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	if (!session) {
		const sessionCookie = lucia.createBlankSessionCookie();
		event.cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});
	}
	event.locals.user = user;
	event.locals.session = session;
	return resolve(event);
};

```

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
import type { User } from 'lucia';

declare global {
	namespace App {
		interface Locals {
			user: User | null;
			session: import('lucia').Session | null;
		}
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

# drizzle/0002_pink_betty_brant.sql

```sql
DROP TABLE `users`;--> statement-breakpoint
DROP TABLE `new_users`;--> statement-breakpoint
CREATE TABLE `users` (
    `id` text PRIMARY KEY NOT NULL,
    `username` text NOT NULL UNIQUE,
    `email` text UNIQUE,
    `password_hash` text NOT NULL,
    `is_admin` integer DEFAULT 0 NOT NULL,
    `created_at` integer NOT NULL DEFAULT (unixepoch()),
    `updated_at` integer NOT NULL DEFAULT (unixepoch())
);
--> statement-breakpoint
CREATE TABLE `session` (
    `id` text PRIMARY KEY NOT NULL,
    `user_id` text NOT NULL,
    `expires_at` integer NOT NULL,
    FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE NO ACTION ON DELETE NO ACTION
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_username_unique` ON `users` (`username`);
```

# drizzle/0001_easy_riptide.sql

```sql
ALTER TABLE `board_games` DROP COLUMN `test`;
```

# drizzle/0000_bizarre_trauma.sql

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
	`publishers` text,
	`is_starred` integer DEFAULT false,
	`admin_note` text,
	`test` text
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
import { initializeDatabase, runMigrations } from '$lib/server/db';

// Initialize the database when the server starts
initializeDatabase();
runMigrations();
// \`\`\`

```

# src/routes/+page.server.ts

```ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async () => {
	throw redirect(307, '/browse');
}) satisfies PageServerLoad;

```

# src/routes/+layout.svelte

```svelte
<script>
	import '../app.css';
</script>

<div class="bg-brads-yellow-light min-h-screen">
	<slot />
</div>

```

# src/lib/index.ts

```ts
// place files you want to import through the `$lib` alias in this folder.

```

# src/lib/fetchGames.ts

```ts
import { db } from './server/db';
import { boardGames, type BoardGame } from './server/db/schema';
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
      "when": 1721897757035,
      "tag": "0000_bizarre_trauma",
      "breakpoints": true
    },
    {
      "idx": 1,
      "version": "6",
      "when": 1721897895475,
      "tag": "0001_easy_riptide",
      "breakpoints": true
    },
    {
      "idx": 2,
      "version": "6",
      "when": 1722592023592,
      "tag": "0002_pink_betty_brant",
      "breakpoints": true
    }
  ]
}
```

# drizzle/meta/0002_snapshot.json

```json
{
  "version": "6",
  "dialect": "sqlite",
  "id": "dc3e9108-95d5-466d-8599-72b6bdbeabc6",
  "prevId": "281f584f-93a2-4b54-956b-d0a14cacb0d3",
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
        },
        "is_starred": {
          "name": "is_starred",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": false
        },
        "admin_note": {
          "name": "admin_note",
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
    "session": {
      "name": "session",
      "columns": {
        "id": {
          "name": "id",
          "type": "text",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        },
        "user_id": {
          "name": "user_id",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "expires_at": {
          "name": "expires_at",
          "type": "integer",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        }
      },
      "indexes": {},
      "foreignKeys": {
        "session_user_id_users_id_fk": {
          "name": "session_user_id_users_id_fk",
          "tableFrom": "session",
          "tableTo": "users",
          "columnsFrom": [
            "user_id"
          ],
          "columnsTo": [
            "id"
          ],
          "onDelete": "no action",
          "onUpdate": "no action"
        }
      },
      "compositePrimaryKeys": {},
      "uniqueConstraints": {}
    },
    "users": {
      "name": "users",
      "columns": {
        "id": {
          "name": "id",
          "type": "text",
          "primaryKey": true,
          "notNull": true,
          "autoincrement": false
        },
        "username": {
          "name": "username",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "password_hash": {
          "name": "password_hash",
          "type": "text",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false
        },
        "email": {
          "name": "email",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "is_admin": {
          "name": "is_admin",
          "type": "integer",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": false
        },
        "created_at": {
          "name": "created_at",
          "type": "integer",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(cast((julianday('now') - 2440587.5)*86400000 as integer))"
        },
        "updated_at": {
          "name": "updated_at",
          "type": "integer",
          "primaryKey": false,
          "notNull": true,
          "autoincrement": false,
          "default": "(cast((julianday('now') - 2440587.5)*86400000 as integer))"
        }
      },
      "indexes": {
        "users_username_unique": {
          "name": "users_username_unique",
          "columns": [
            "username"
          ],
          "isUnique": true
        },
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
    "columns": {
      "\"users\".\"name\"": "\"users\".\"username\""
    }
  },
  "internal": {
    "indexes": {}
  }
}
```

# drizzle/meta/0001_snapshot.json

```json
{
  "version": "6",
  "dialect": "sqlite",
  "id": "281f584f-93a2-4b54-956b-d0a14cacb0d3",
  "prevId": "4c0f762c-1da9-416b-b911-4cef95ea4829",
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
        },
        "is_starred": {
          "name": "is_starred",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": false
        },
        "admin_note": {
          "name": "admin_note",
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

# drizzle/meta/0000_snapshot.json

```json
{
  "version": "6",
  "dialect": "sqlite",
  "id": "4c0f762c-1da9-416b-b911-4cef95ea4829",
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
        },
        "is_starred": {
          "name": "is_starred",
          "type": "integer",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false,
          "default": false
        },
        "admin_note": {
          "name": "admin_note",
          "type": "text",
          "primaryKey": false,
          "notNull": false,
          "autoincrement": false
        },
        "test": {
          "name": "test",
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

# src/routes/browse/+page.svelte

```svelte
<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import GameFilter from '$lib/components/GameFilter.svelte';

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
			allCategories: string[];
		};
	} = $props();

	let currentPage = $state(parseInt($page.url.searchParams.get('page') || '1'));

	async function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { keepFocus: true });
	}
</script>

<svelte:head>
	<title>Brads Spelcafé</title>
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Brads Spelcafé Game Catalogue</h1>

	<div class="flex flex-col md:flex-row gap-8">
		<aside class="w-full md:w-1/4">
			<GameFilter allCategories={data.allCategories} />
		</aside>

		<div class="w-full md:w-3/4">
			<BoardGameGrid games={data.games} />

			<div class="flex justify-center items-center space-x-2 mt-8">
				<button
					onclick={() => changePage(currentPage - 1)}
					class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
					disabled={currentPage === 1}
				>
					Previous
				</button>
				{#each Array(Math.min(5, data.meta.totalPages)) as _, i}
					{#if i + 1 <= 2 || i + 1 > data.meta.totalPages - 2 || i + 1 === currentPage}
						<button
							onclick={() => changePage(i + 1)}
							class="px-4 py-2 rounded {currentPage === i + 1
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
						>
							{i + 1}
						</button>
					{:else if i === 2}
						<span class="px-2">...</span>
					{/if}
				{/each}
				<button
					onclick={() => changePage(currentPage + 1)}
					class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
					disabled={currentPage === data.meta.totalPages}
				>
					Next
				</button>
			</div>
		</div>
	</div>
</main>

```

# src/routes/browse/+page.server.ts

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const filterName = url.searchParams.get('name') || '';
	const minDuration = url.searchParams.get('minDuration') || '';
	const maxDuration = url.searchParams.get('maxDuration') || '';
	const minPlayers = url.searchParams.get('minPlayers') || '';
	const maxPlayers = url.searchParams.get('maxPlayers') || '';
	const categories = url.searchParams.get('categories') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (filterName) apiUrl.searchParams.set('name', filterName);
	if (minDuration) apiUrl.searchParams.set('minDuration', minDuration);
	if (maxDuration) apiUrl.searchParams.set('maxDuration', maxDuration);
	if (minPlayers) apiUrl.searchParams.set('minPlayers', minPlayers);
	if (maxPlayers) apiUrl.searchParams.set('maxPlayers', maxPlayers);
	if (categories) apiUrl.searchParams.set('categories', categories);

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();
	const categoriesResponse = await fetch('/api/categories');
	const allCategories = await categoriesResponse.json();

	return {
		games: data.data,
		meta: data.meta,
		allCategories
	};
};

```

# src/routes/admin/+page.server.ts

```ts
import type { PageServerLoad } from './$types';
import { redirect } from '@sveltejs/kit';

export const load = (async () => {
	throw redirect(307, '/admin/manage');
}) satisfies PageServerLoad;

```

# src/routes/admin/+layout.svelte

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let isLoggingOut = $state(false);

	function handleLogout() {
		isLoggingOut = true;
	}

	$effect(() => {
		isLoggingOut = false;
	});
</script>

{#if $page.url.pathname !== '/admin/login' && $page.data.user}
	<div class="flex h-screen bg-gray-100">
		<!-- Sidebar -->
		<aside class="w-64 bg-brads-yellow-light shadow-md p-4 flex flex-col">
			<nav class="flex-grow pb-4">
				<h2 class="text-xl font-semibold mb-4 text-gray-800">Brads Admin</h2>
				<ul class="space-y-2">
					<li>
						<a
							href="/admin/manage"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/manage'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Manage Games
						</a>
					</li>
					<li>
						<a
							href="/admin/add-game"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/add-game'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Add New Game
						</a>
					</li>
				</ul>
			</nav>

			<!-- Logout form -->
			<form action="/admin/logout" method="POST" use:enhance={handleLogout} class="mt-auto">
				<button
					type="submit"
					class="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
					disabled={isLoggingOut}
				>
					{isLoggingOut ? 'Logging out...' : 'Logout'}
				</button>
			</form>
		</aside>

		<!-- Main content -->
		<main class="flex-1 p-8 overflow-y-auto">
			<slot />
		</main>
	</div>
{:else}
	<slot />
{/if}

```

# src/routes/admin/+layout.server.ts

```ts
// src/routes/admin/+layout.server.ts
import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ locals, url }) => {
	// Allow access to the login page
	if (url.pathname === '/admin/login') {
		return {};
	}

	console.log(locals.user);

	// Check if the user is authenticated
	if (!locals.user) {
		// Redirect to login page if not authenticated
		throw redirect(302, '/admin/login');
	}

	// If authenticated and admin, allow access
	return {
		user: locals.user
	};
};

```

# src/lib/utils/debounce.ts

```ts
function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number = 500
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	};
}
export default debounce;

```

# src/lib/components/SortDropdown.svelte

```svelte
<script lang="ts">
	const {
		currentSort,
		currentOrder,
		onsort
	}: {
		currentSort: string;
		currentOrder: 'asc' | 'desc';
		onsort: (value: string, order: 'asc' | 'desc') => void;
	} = $props();

	let isOpen = $state(false);

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'yearPublished', label: 'Year' },
		{ value: 'playingTime', label: 'Play Time' },
		{ value: 'minPlayers', label: 'Min Players' },
		{ value: 'adminNote', label: 'Admin Note' }
	];

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectOption(value: string) {
		onsort(value, currentOrder);
		isOpen = false;
	}

	function toggleOrder() {
		const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
		onsort(currentSort, newOrder);
	}
</script>

<div class="relative inline-block text-left">
	<div class="flex items-center">
		<button
			type="button"
			onclick={toggleDropdown}
			class="inline-flex justify-center rounded-l-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brads-green-dark"
		>
			Sort by: {sortOptions.find((option) => option.value === currentSort)?.label}
			<svg
				class="-mr-1 ml-2 h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		<button
			type="button"
			onclick={toggleOrder}
			class="inline-flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brads-green-dark"
		>
			{#if currentOrder === 'asc'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</div>

	{#if isOpen}
		<div
			class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="options-menu"
		>
			<div class="py-1" role="none">
				{#each sortOptions as option}
					<button
						onclick={() => selectOption(option.value)}
						class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
						role="menuitem"
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>

```

# src/lib/components/GamePreview.svelte

```svelte
<script lang="ts">
	let { game }: { game: any } = $props();
</script>

<div class="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
	<div class="relative pb-2/3">
		<img src={game.image} alt={game.name} class="h-full w-full object-cover" />
	</div>
	<div class="p-6">
		<h2 class="text-2xl font-bold text-gray-800 mb-2">{game.name}</h2>
		<div class="space-y-2">
			<p class="text-gray-600">
				<span class="font-semibold">Year:</span>
				{game.yearPublished || 'N/A'}
			</p>
			<p class="text-gray-600">
				<span class="font-semibold">Players:</span>
				{game.minPlayers || '?'} - {game.maxPlayers || '?'}
			</p>
			<p class="text-gray-600">
				<span class="font-semibold">Playing Time:</span>
				{game.playingTime ? `${game.playingTime} minutes` : 'N/A'}
			</p>
		</div>
	</div>
</div>

```

# src/lib/components/GameFilter.svelte

```svelte
<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import debounce from '$lib/utils/debounce';

	const { allCategories }: { allCategories: string[] } = $props();

	let categorySearch = $state('');
	let showCategoryDropdown = $state(false);

	let name = $state($page.url.searchParams.get('name') || '');
	let minDuration = $state($page.url.searchParams.get('minDuration') || '');
	let maxDuration = $state($page.url.searchParams.get('maxDuration') || '');
	let minPlayers = $state($page.url.searchParams.get('minPlayers') || '');
	let maxPlayers = $state($page.url.searchParams.get('maxPlayers') || '');
	let selectedCategories = $state(
		$page.url.searchParams.get('categories')?.split(',').filter(Boolean) || []
	);

	const debouncedUpdateFilters = debounce(updateFilters, 300);

	function resetFilters() {
		name = '';
		minDuration = '';
		maxDuration = '';
		minPlayers = '';
		maxPlayers = '';
		selectedCategories = [];
	}

	function updateFilters() {
		const url = new URL($page.url);
		url.searchParams.set('page', '1');

		if (name) url.searchParams.set('name', name);
		else url.searchParams.delete('name');

		if (minDuration) url.searchParams.set('minDuration', minDuration);
		else url.searchParams.delete('minDuration');

		if (maxDuration) url.searchParams.set('maxDuration', maxDuration);
		else url.searchParams.delete('maxDuration');

		if (minPlayers) url.searchParams.set('minPlayers', minPlayers);
		else url.searchParams.delete('minPlayers');

		if (maxPlayers) url.searchParams.set('maxPlayers', maxPlayers);
		else url.searchParams.delete('maxPlayers');

		if (selectedCategories.length) url.searchParams.set('categories', selectedCategories.join(','));
		else url.searchParams.delete('categories');

		goto(url.toString(), { keepFocus: true });
	}

	function toggleCategory(category: string) {
		const index = selectedCategories.indexOf(category);
		if (index === -1) {
			selectedCategories = [...selectedCategories, category];
		} else {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		}
	}

	$effect(() => {
		if (name || minDuration || maxDuration || minPlayers || maxPlayers || selectedCategories) {
			debouncedUpdateFilters();
		}
	});

	let filteredCategories = $derived(
		allCategories.filter((category) =>
			category.toLowerCase().includes(categorySearch.toLowerCase())
		)
	);
</script>

<div class="bg-white shadow-md rounded-lg p-6">
	<h2 class="text-xl font-bold mb-4">Filter</h2>
	<div class="space-y-6">
		<div>
			<label for="name" class="block text-sm font-medium text-gray-700">Search</label>
			<input
				type="text"
				id="name"
				bind:value={name}
				placeholder="Search games..."
				class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
			/>
		</div>

		<div>
			<h3 class="text-sm font-medium text-gray-700 mb-2">Play Time</h3>
			<div class="flex space-x-2">
				<input
					type="number"
					id="minDuration"
					bind:value={minDuration}
					placeholder="Min"
					class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
				<input
					type="number"
					id="maxDuration"
					bind:value={maxDuration}
					placeholder="Max"
					class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
			</div>
		</div>

		<div>
			<h3 class="text-sm font-medium text-gray-700 mb-2">Number of Players</h3>
			<div class="flex space-x-2">
				<input
					type="number"
					id="minPlayers"
					bind:value={minPlayers}
					placeholder="Min"
					class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
				<input
					type="number"
					id="maxPlayers"
					bind:value={maxPlayers}
					placeholder="Max"
					class="w-1/2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
			</div>
		</div>

		<div class="relative">
			<h3 class="text-sm font-medium text-gray-700 mb-2">Categories</h3>
			<div class="flex flex-wrap gap-2 mb-2">
				{#each selectedCategories as category}
					<span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
						{category}
						<button
							class="ml-1 text-indigo-600 hover:text-indigo-800"
							onclick={() => toggleCategory(category)}>×</button
						>
					</span>
				{/each}
			</div>
			<input
				type="text"
				bind:value={categorySearch}
				placeholder="Search categories..."
				class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				onfocus={() => (showCategoryDropdown = true)}
				onblur={() => setTimeout(() => (showCategoryDropdown = false), 200)}
			/>
			{#if showCategoryDropdown && filteredCategories.length > 0}
				<div
					class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
				>
					{#each filteredCategories as category}
						<button
							class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50"
							onclick={() => toggleCategory(category)}
						>
							<span class:font-semibold={selectedCategories.includes(category)}>{category}</span>
							{#if selectedCategories.includes(category)}
								<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
									✓
								</span>
							{/if}
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<div>
			<button
				type="button"
				onclick={resetFilters}
				class="w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-300"
			>
				Reset Filters
			</button>
		</div>
	</div>
</div>

```

# src/lib/components/ConfirmationModal.svelte

```svelte
<script lang="ts">
	import { onMount } from 'svelte';

	const { isOpen, onConfirm, onCancel, title, message } = $props<{
		isOpen: boolean;
		onConfirm: () => void;
		onCancel: () => void;
		title: string;
		message: string;
	}>();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (isOpen && dialog) {
			dialog.showModal();
		} else if (dialog) {
			dialog.close();
		}
	});

	function handleCancel() {
		dialog.close();
		onCancel();
	}

	function handleConfirm() {
		dialog.close();
		onConfirm();
	}
</script>

<dialog bind:this={dialog} class="p-4 max-w-sm rounded-lg shadow-xl">
	<div class="flex flex-col items-center">
		<svg
			class="w-6 h-6 text-red-600 mb-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
		<h3 class="text-lg font-semibold mb-2">{title}</h3>
		<p class="text-sm text-gray-600 text-center mb-4">{message}</p>
		<div class="flex justify-end space-x-2 w-full">
			<button
				class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
				onclick={handleCancel}
			>
				Cancel
			</button>
			<button
				class="px-4 py-2 text-sm rounded hover:bg-red-500 text-red-200 bg-red-700"
				onclick={handleConfirm}
			>
				Delete
			</button>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>

```

# src/lib/components/BoardGameTable.svelte

```svelte
<script lang="ts">
	import type { BoardGame } from '$lib/server/db/schema';

	let {
		games,
		currentSort,
		currentOrder,
		onSort
	}: {
		games: BoardGame[];
		currentSort: string;
		currentOrder: 'asc' | 'desc';
		onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
	} = $props();

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'players', label: 'Players' },
		{ key: 'playingTime', label: 'Play Time' },
		{ key: 'yearPublished', label: 'Year' },
		{ key: 'adminNote', label: 'Admin Note' }
	];

	function handleSort(column: string) {
		if (column === currentSort) {
			onSort(column, currentOrder === 'asc' ? 'desc' : 'asc');
		} else {
			onSort(column, 'asc');
		}
	}

	function getSortIcon(column: string) {
		if (column !== currentSort) return '⋮';
		return currentOrder === 'asc' ? '▲' : '▼';
	}
</script>

<div class="overflow-x-auto shadow-md rounded-lg">
	<table class="w-full text-sm text-left text-gray-700">
		<thead class="text-xs text-gray-800 uppercase bg-brads-yellow-light">
			<tr>
				{#each columns as column}
					<th
						scope="col"
						class="px-6 py-3 cursor-pointer hover:bg-brads-yellow-light/80"
						onclick={() => handleSort(column.key)}
					>
						<div class="flex items-center justify-between">
							<span>{column.label}</span>
							<span class="w-4 inline-block text-center">{getSortIcon(column.key)}</span>
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each games as game, index}
				<tr
					class="border-b {index % 2 === 0
						? 'bg-white'
						: 'bg-gray-50'} hover:bg-brads-yellow-light/30 transition-colors"
				>
					<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
						<a href={`/game/${game.bggId}`} class="hover:text-brads-green-dark">
							{game.name}
						</a>
					</th>
					<td class="px-6 py-4">{game.minPlayers} - {game.maxPlayers}</td>
					<td class="px-6 py-4">{game.playingTime} min</td>
					<td class="px-6 py-4">{game.yearPublished}</td>
					<td class="px-6 py-4">
						{#if game.adminNote}
							<span
								class="bg-yellow-100 text-yellow-800 text-xs font-medium mr-2 px-2.5 py-0.5 rounded"
							>
								{game.adminNote}
							</span>
						{:else}
							-
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600 mt-4">No games found.</p>
{/if}

```

# src/lib/components/BoardGameGrid.svelte

```svelte
<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import type { BoardGame } from '$lib/server/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

{#snippet gameCard(game: BoardGame)}
	<a
		class="relative block overflow-hidden rounded-lg shadow-lg aspect-[3/4] group"
		href={`/game/${game.bggId}`}
	>
		<img
			class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
			src={game.image}
			alt={game.name}
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
		{#if game.adminNote}
			<div
				class="absolute {game.adminNote
					? 'top-2'
					: 'top-10'} right-0 bg-yellow-400 text-brads-green-dark text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg"
			>
				{game.adminNote}
			</div>
		{/if}
		{#if game.isStarred}
			<div
				class="absolute top-2 right-0 bg-brads-green text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg border-l border-t border-b border-black"
			>
				⭐ Staff Pick!
			</div>
		{/if}
		<div class="absolute bottom-0 left-0 p-4 text-white">
			<h5 class="mb-1 text-xl font-bold tracking-tight">
				{game.name}
			</h5>
			<p class="text-sm flex flex-col">
				<span>
					Players: {game.minPlayers} - {game.maxPlayers}
				</span>
				<span>
					Play Time: {game.playingTime} min
				</span>
			</p>
		</div>
	</a>
{/snippet}

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
	{#each games as game (game.bggId)}
		<div animate:flip={{ duration: 300 }} transition:fly={{ y: 20, duration: 300 }}>
			{@render gameCard(game)}
		</div>
	{/each}
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600">No games found.</p>
{/if}

```

# src/lib/components/BGGSearch.svelte

```svelte
<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import debounce from '$lib/utils/debounce';

	let { onselect }: { onselect: (game: any) => void } = $props();

	let searchQuery = $state('');
	let searchResults: any[] = $state([]);
	let isLoading = $state(false);

	const debouncedSearch = debounce(async () => {
		if (searchQuery.length < 3) {
			searchResults = [];
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/bgg-search?query=${encodeURIComponent(searchQuery)}`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			searchResults = await response.json();
		} catch (error) {
			console.error('Search error:', error);
			searchResults = [];
		} finally {
			isLoading = false;
		}
	}, 300);

	const onSelect = (game: any) => {
		searchQuery = '';
		searchResults = [];
		onselect(game);
	};

	$effect(() => {
		if (searchQuery.length < 3) {
			return;
		}
		debouncedSearch();
	});
</script>

<div class="max-w-2xl mx-auto">
	<div class="relative mb-4">
		<input
			bind:value={searchQuery}
			placeholder="Search BoardGameGeek..."
			class="w-full px-4 py-2 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition duration-300"
		/>
		{#if isLoading}
			<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
				<div
					class="w-5 h-5 border-t-2 border-blue-500 border-solid rounded-full animate-spin"
				></div>
			</div>
		{/if}
	</div>

	{#if searchResults.length > 0}
		<ul
			class="bg-white border border-gray-200 rounded-lg shadow-md overflow-hidden"
			transition:slide|local={{ duration: 300 }}
		>
			{#each searchResults as game}
				<li transition:fade|local={{ duration: 200 }}>
					<button
						onclick={() => onSelect(game)}
						class="w-full text-left px-4 py-3 hover:bg-gray-100 transition duration-200 flex justify-between items-center"
					>
						<span class="text-gray-800 font-medium">{game.name}</span>
						{#if game.yearPublished}
							<span class="text-sm text-gray-500">({game.yearPublished})</span>
						{/if}
					</button>
				</li>
			{/each}
		</ul>
	{/if}
</div>

```

# src/lib/components/AdminBoardGameGrid.svelte

```svelte
<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import type { BoardGame } from '$lib/server/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

{#snippet gameCard(game)}
	<div class="relative block overflow-hidden rounded-lg shadow-lg aspect-[3/4] group">
		<img
			class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
			src={game.image}
			alt={game.name}
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
		{#if game.adminNote}
			<div
				class="absolute top-2 right-0 bg-yellow-400 text-brads-green-dark text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg"
			>
				{game.adminNote}
			</div>
		{/if}
		{#if game.isStarred}
			<div class="absolute top-2 left-2 text-yellow-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
		{/if}
		<div class="absolute bottom-0 left-0 p-4 text-white">
			<h5 class="mb-1 text-xl font-bold tracking-tight">
				{game.name}
			</h5>
			<p class="text-sm flex flex-col">
				<span>
					Players: {game.minPlayers} - {game.maxPlayers}
				</span>
				<span>
					Play Time: {game.playingTime} min
				</span>
			</p>
		</div>
		<a
			href={`/admin/edit/${game.bggId}`}
			class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
		>
			Edit
		</a>
	</div>
{/snippet}

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
	{#each games as game (game.bggId)}
		<div animate:flip={{ duration: 300 }} transition:fly={{ y: 20, duration: 300 }}>
			{@render gameCard(game)}
		</div>
	{/each}
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600">No games found.</p>
{/if}

```

# src/lib/server/auth.ts

```ts
// src/lib/server/auth.ts
import { Lucia } from 'lucia';
import { dev } from '$app/environment';
import { DrizzleSQLiteAdapter } from '@lucia-auth/adapter-drizzle';
import { db } from '$lib/server/db';
import { users, sessions } from '$lib/server/db/schema';

const adapter = new DrizzleSQLiteAdapter(db, sessions, users);

export const lucia = new Lucia(adapter, {
	sessionCookie: {
		attributes: {
			secure: !dev
		}
	},
	getUserAttributes: (attributes) => {
		return {
			username: attributes.username
		};
	}
});

declare module 'lucia' {
	interface Register {
		Lucia: typeof lucia;
		DatabaseUserAttributes: {
			username: string;
		};
	}
}

export type Auth = typeof lucia;

```

# src/routes/game/[id]/+page.ts

```ts
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ fetch, params }) => {
	const response = await fetch(`/api/games?id=${params.id}`);

	if (!response.ok) {
		throw new Error('Failed to load game data');
	}

	const { game, similarGames } = await response.json();

	return { game, similarGames };
};

```

# src/routes/game/[id]/+page.svelte

```svelte
<!-- src/routes/game/[id]/+page.svelte -->
<script lang="ts">
	import type { BoardGame } from '$lib/server/db/schema';
	import { slide } from 'svelte/transition';

	type PageProps = {
		data: {
			game: BoardGame;
			similarGames: BoardGame[];
		};
	};

	const { data }: PageProps = $props();

	let game = $derived(data.game);
	let isDescriptionExpanded = $state(false);
	let areCategoriesExpanded = $state(false);
	let areMechanicsExpanded = $state(false);

	const categories = $derived.by(() => {
		return cleanArray(game.categories);
	});
	const mechanics = $derived.by(() => {
		return cleanArray(game.mechanics);
	});
	const designers = $derived.by(() => {
		return cleanArray(game.designers);
	});

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
				{#if categories && categories.length > 0}
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
							{#each categories.slice(0, areCategoriesExpanded ? undefined : 3) as category}
								<span class="bg-teal-700 px-3 py-1 rounded-full text-sm">{category}</span>
							{/each}
							{#if !areCategoriesExpanded && categories.length > 3}
								<button
									class="bg-teal-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleCategories}>+{categories.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if mechanics && mechanics.length > 0}
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
							{#each mechanics.slice(0, areMechanicsExpanded ? undefined : 3) as mechanic}
								<span class="bg-blue-700 px-3 py-1 rounded-full text-sm">{mechanic}</span>
							{/each}
							{#if !areMechanicsExpanded && mechanics.length > 3}
								<button
									class="bg-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleMechanics}>+{mechanics.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if designers && designers.length > 0}
					<div>
						<h2 class="text-xl font-semibold mb-2">Designers</h2>
						<div>{designers}</div>
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
					<div transition:slide={{ duration: 300 }} class="mt-4 text-black/90 leading-relaxed">
						{@html game.description}
					</div>
				{/if}
			</div>
		{/if}

		{#if game.isStarred}
			<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
				<p class="font-bold">Staff Favorite</p>
			</div>
		{/if}

		{#if game.adminNote}
			<div class="bg-gray-100 p-4 mb-4 rounded">
				<h3 class="font-bold text-lg mb-2">Admin Note:</h3>
				<p>{game.adminNote}</p>
			</div>
		{/if}
	</div>

	{#if data.similarGames.length > 0}
		<div class="mt-8">
			<h2 class="text-2xl font-bold mb-4">Similar Games</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each data.similarGames as similarGame}
					<a href={`/game/${similarGame.bggId}`} class="block">
						<div class="bg-white rounded-lg shadow-md overflow-hidden">
							<img
								src={similarGame.thumbnail}
								alt={similarGame.name}
								class="w-full h-48 object-cover"
							/>
							<div class="p-4">
								<h3 class="font-bold text-lg mb-2">{similarGame.name}</h3>
								<p class="text-sm text-gray-600">
									{similarGame.minPlayers}-{similarGame.maxPlayers} players
								</p>
								<p class="text-sm text-gray-600">{similarGame.playingTime} min</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
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

	const { game, similarGames } = await response.json();

	return { game, similarGames };
};

```

# src/routes/api/users/+server.ts

```ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';
import { Argon2id } from 'oslo/password';
import { generateId } from 'lucia';
import { eq } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const allUsers = await db.select().from(users);
	return json(allUsers);
};

export const POST: RequestHandler = async ({ request }) => {
	const { username, email, password, isAdmin = false } = await request.json();

	// Validate input
	if (!username || !email || !password) {
		return json({ error: 'Username, email, and password are required' }, { status: 400 });
	}

	try {
		// Hash the password
		const hasher = new Argon2id();
		const password_hash = await hasher.hash(password);

		// Generate a unique ID
		const id = generateId(15); // Generates a 15-character ID

		// Insert the new user
		const newUser = await db
			.insert(users)
			.values({
				id,
				username,
				email,
				password_hash,
				is_admin: isAdmin
				// created_at and updated_at will use the default values
			})
			.returning();

		// Remove password_hash from the returned user object
		const { password_hash: _, ...userWithoutPassword } = newUser[0];

		return json(userWithoutPassword, { status: 201 });
	} catch (error) {
		console.error('Error creating user:', error);
		return json({ error: 'Failed to create user' }, { status: 500 });
	}
};

export const DELETE: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (!id) {
		return json({ error: 'User ID is required' }, { status: 400 });
	}

	try {
		const deletedUser = await db.delete(users).where(eq(users.id, id)).returning();

		if (deletedUser.length === 0) {
			return json({ error: 'User not found' }, { status: 404 });
		}

		return json({ message: 'User deleted successfully' }, { status: 200 });
	} catch (error) {
		console.error('Error deleting user:', error);
		return json({ error: 'Failed to delete user' }, { status: 500 });
	}
};

```

# src/routes/api/games/+server.ts

```ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { eq, asc, desc, sql, and, or, like } from 'drizzle-orm';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';

export const GET: RequestHandler = async ({ url }) => {
	const id = url.searchParams.get('id');

	if (id) {
		// Get a specific game by ID (unchanged)
		const game = await db.select().from(boardGames).where(eq(boardGames.bggId, id));
		if (game.length === 0) {
			return json({ error: 'Game not found' }, { status: 404 });
		}

		// Parse the categories of the current game
		const gameCategories = JSON.parse(game[0].categories || '[]');
		// Construct the LIKE conditions for each category
		const categoryConditions = gameCategories.map(
			(category: string) => sql`${boardGames.categories} LIKE ${`%${category}%`}`
		);

		// Fetch similar games
		const similarGames = await db
			.select()
			.from(boardGames)
			.where(and(or(...categoryConditions), sql`${boardGames.bggId} != ${id}`))
			.limit(4);

		return json({ game: game[0], similarGames });
	} else {
		// Get all games with pagination, sorting, and filtering
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const sortBy = url.searchParams.get('sortBy') || 'name';
		const sortOrder = url.searchParams.get('sortOrder') || 'asc';
		const filterName = url.searchParams.get('name');
		const minDuration = url.searchParams.get('minDuration');
		const maxDuration = url.searchParams.get('maxDuration');
		const minPlayers = url.searchParams.get('minPlayers');
		const maxPlayers = url.searchParams.get('maxPlayers');
		const categories = url.searchParams.get('categories');

		let query = db.select().from(boardGames);
		const whereConditions = [];

		// Apply filtering
		if (filterName) {
			whereConditions.push(like(boardGames.name, `%${filterName}%`));
		}
		if (minDuration) {
			whereConditions.push(sql`${boardGames.playingTime} >= ${parseInt(minDuration)}`);
		}
		if (maxDuration) {
			whereConditions.push(sql`${boardGames.playingTime} <= ${parseInt(maxDuration)}`);
		}
		if (minPlayers) {
			whereConditions.push(sql`${boardGames.minPlayers} >= ${parseInt(minPlayers)}`);
		}
		if (maxPlayers) {
			whereConditions.push(sql`${boardGames.maxPlayers} <= ${parseInt(maxPlayers)}`);
		}
		if (categories) {
			const categoryList = categories.split(',');
			const categoryConditions = categoryList.map(
				(cat) => sql`${boardGames.categories} LIKE ${'%' + cat + '%'}`
			);
			whereConditions.push(or(...categoryConditions));
		}

		if (whereConditions.length > 0) {
			query = query.where(and(...whereConditions));
		}

		// Apply sorting
		if (sortBy in boardGames) {
			query = query.orderBy(
				sortOrder === 'desc'
					? desc(boardGames[sortBy as keyof typeof boardGames])
					: asc(boardGames[sortBy as keyof typeof boardGames])
			);
		}

		// Apply pagination
		const offset = (page - 1) * limit;
		query = query.limit(limit).offset(offset);

		try {
			const games = await query;

			// Get total count for pagination
			const countQuery = db
				.select({ count: sql`count(*)` })
				.from(boardGames)
				.where(and(...whereConditions));

			const totalCountResult = await countQuery;
			const totalCount = Number(totalCountResult[0].count);

			return json({
				data: games,
				meta: {
					totalCount,
					page,
					limit,
					totalPages: Math.ceil(totalCount / limit)
				}
			});
		} catch (error) {
			console.error('Error executing query:', error);
			return json({ error: 'An error occurred while fetching games' }, { status: 500 });
		}
	}
};

export const POST: RequestHandler = async ({ request }) => {
	const gameData = await request.json();

	console.log('gameData:', gameData);

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
				publishers: JSON.stringify(gameData.publishers),
				isStarred: gameData.starred || false,
				adminNote: gameData.adminNote || null
			})
			.returning();

		return json(newGame[0], { status: 201 });
	} catch (error) {
		console.error('Error inserting game:', error);
		return json({ error: 'Failed to insert game', reason: error }, { status: 500 });
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
				publishers: JSON.stringify(gameData.publishers),
				isStarred: gameData.starred || false,
				adminNote: gameData.adminNote || null
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

	if (!id) {
		return json({ error: 'ID is required for deleting a game' }, { status: 400 });
	}

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
};

```

# src/routes/api/bgg-search/+server.ts

```ts
import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import { DOMParser } from '@xmldom/xmldom';

export async function GET({ url }) {
	const query = url.searchParams.get('query');
	const bggApiUrl = `https://boardgamegeek.com/xmlapi2/search?query=${query}&type=boardgame`;

	const response = await fetch(bggApiUrl);
	const xmlText = await response.text();
	const parser = new DOMParser();
	const xmlDoc = parser.parseFromString(xmlText, 'text/xml');

	const gameIds = Array.from(xmlDoc.getElementsByTagName('item'))
		.map((item) => item.getAttribute('id'))
		.slice(0, 10); // Limit to 10 games to avoid overwhelming the BGG API

	const gameDetailsPromises = gameIds.map(async (id) => {
		const detailsUrl = `https://boardgamegeek.com/xmlapi2/thing?id=${id}&stats=1`;
		const detailsResponse = await fetch(detailsUrl);
		const detailsXml = await detailsResponse.text();
		const detailsDoc = parser.parseFromString(detailsXml, 'text/xml');
		const item = detailsDoc.getElementsByTagName('item')[0];

		return {
			id: id,
			name: item.getElementsByTagName('name')[0].getAttribute('value'),
			yearPublished: item.getElementsByTagName('yearpublished')[0]?.getAttribute('value'),
			minPlayers: item.getElementsByTagName('minplayers')[0]?.getAttribute('value'),
			maxPlayers: item.getElementsByTagName('maxplayers')[0]?.getAttribute('value'),
			playingTime: item.getElementsByTagName('playingtime')[0]?.getAttribute('value'),
			minAge: item.getElementsByTagName('minage')[0]?.getAttribute('value'),
			description: item.getElementsByTagName('description')[0]?.textContent,
			thumbnail: item.getElementsByTagName('thumbnail')[0]?.textContent,
			image: item.getElementsByTagName('image')[0]?.textContent,
			categories: Array.from(item.getElementsByTagName('link'))
				.filter((link) => link.getAttribute('type') === 'boardgamecategory')
				.map((link) => link.getAttribute('value')),
			mechanics: Array.from(item.getElementsByTagName('link'))
				.filter((link) => link.getAttribute('type') === 'boardgamemechanic')
				.map((link) => link.getAttribute('value')),
			designers: Array.from(item.getElementsByTagName('link'))
				.filter((link) => link.getAttribute('type') === 'boardgamedesigner')
				.map((link) => link.getAttribute('value')),
			publishers: Array.from(item.getElementsByTagName('link'))
				.filter((link) => link.getAttribute('type') === 'boardgamepublisher')
				.map((link) => link.getAttribute('value')),
			averageRating: item.getElementsByTagName('average')[0]?.getAttribute('value'),
			numRatings: item.getElementsByTagName('usersrated')[0]?.getAttribute('value')
		};
	});

	const games = await Promise.all(gameDetailsPromises);

	return json(games);
}

```

# src/routes/admin/logout/+page.server.ts

```ts
import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions } from './$types';

export const actions: Actions = {
	default: async ({ locals, cookies }) => {
		if (!locals.session) {
			return fail(401);
		}

		await lucia.invalidateSession(locals.session.id);

		const sessionCookie = lucia.createBlankSessionCookie();
		cookies.set(sessionCookie.name, sessionCookie.value, {
			path: '.',
			...sessionCookie.attributes
		});

		redirect(302, '/admin/login');
	}
};

```

# src/routes/admin/manage/+page.svelte

```svelte
<script lang="ts">
	import BoardGameTable from '$lib/components/BoardGameTable.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import type { BoardGame } from '$lib/server/db/schema';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import debounce from '$lib/utils/debounce';
	import AdminBoardGameGrid from '$lib/components/AdminBoardGameGrid.svelte';

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
			searchQuery: string;
		};
	} = $props();

	let isGridView = $state(true);
	let currentSort = $state($page.url.searchParams.get('sortBy') || 'name');
	let currentOrder: 'asc' | 'desc' = $state(
		($page.url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
	);
	let searchQuery = $state(data.searchQuery);

	function handleSort(sortBy: string, orderBy: 'asc' | 'desc') {
		const url = new URL($page.url);
		currentSort = sortBy;
		currentOrder = orderBy;
		url.searchParams.set('sortBy', sortBy);
		url.searchParams.set('sortOrder', orderBy);
		goto(url.toString());
	}

	const debouncedSearch = debounce(async () => {
		const url = new URL($page.url);
		url.searchParams.set('search', searchQuery);
		url.searchParams.set('page', '1');
		await goto(url.toString(), { keepFocus: true });
	}, 300);

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
		debouncedSearch();
	}

	function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Brads Admin - Manage Games</title>
</svelte:head>

<div class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
	<div class="w-full sm:w-auto">
		<input
			type="text"
			placeholder="Search games..."
			value={searchQuery}
			oninput={handleSearch}
			class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div class="flex items-center gap-4">
		<SortDropdown {currentSort} {currentOrder} onsort={handleSort} />

		<div class="bg-brads-yellow-light p-1 rounded-full inline-flex gap-1">
			<button
				onclick={() => (isGridView = true)}
				class="px-4 py-2 rounded-full transition-all duration-300 relative"
				class:text-brads-yellow-light={isGridView}
				class:font-bold={isGridView}
				class:bg-white={!isGridView}
				class:bg-brads-green-light={isGridView}
			>
				Grid
				{#if isGridView}
					<span class="absolute inset-0 bg-brads-green-dark rounded-full -z-10" />
				{/if}
			</button>
			<button
				onclick={() => (isGridView = false)}
				class="px-4 py-2 rounded-full transition-all duration-300 relative"
				class:text-brads-yellow-light={!isGridView}
				class:font-bold={!isGridView}
				class:bg-white={isGridView}
				class:bg-brads-green-light={!isGridView}
			>
				Table
				{#if !isGridView}
					<span class="absolute inset-0 bg-brads-green-dark rounded-full -z-10" />
				{/if}
			</button>
		</div>
	</div>
</div>

{#if isGridView}
	<AdminBoardGameGrid games={data.games} />
{:else}
	<BoardGameTable games={data.games} {currentSort} {currentOrder} onSort={handleSort} />
{/if}

<div class="mt-8 flex justify-center items-center space-x-2">
	<button
		onclick={() => changePage(data.meta.page - 1)}
		class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
		disabled={data.meta.page === 1}
	>
		Previous
	</button>
	{#each Array(Math.min(5, data.meta.totalPages)) as _, i}
		{#if i + 1 <= 2 || i + 1 > data.meta.totalPages - 2 || i + 1 === data.meta.page}
			<button
				onclick={() => changePage(i + 1)}
				class="px-4 py-2 rounded {data.meta.page === i + 1
					? 'bg-blue-500 text-white'
					: 'bg-gray-200'}"
			>
				{i + 1}
			</button>
		{:else if i === 2}
			<span class="px-2">...</span>
		{/if}
	{/each}
	<button
		onclick={() => changePage(data.meta.page + 1)}
		class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
		disabled={data.meta.page === data.meta.totalPages}
	>
		Next
	</button>
</div>

```

# src/routes/admin/manage/+page.server.ts

```ts
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ fetch, url }) => {
	const page = url.searchParams.get('page') || '1';
	const limit = url.searchParams.get('limit') || '20';
	const sortBy = url.searchParams.get('sortBy') || 'name';
	const sortOrder = url.searchParams.get('sortOrder') || 'asc';
	const searchQuery = url.searchParams.get('search') || '';

	const apiUrl = new URL('/api/games', url.origin);
	apiUrl.searchParams.set('page', page);
	apiUrl.searchParams.set('limit', limit);
	apiUrl.searchParams.set('sortBy', sortBy);
	apiUrl.searchParams.set('sortOrder', sortOrder);

	if (searchQuery) {
		apiUrl.searchParams.set('name', searchQuery);
	}

	const response = await fetch(apiUrl);

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = await response.json();

	return {
		games: data.data,
		meta: data.meta,
		searchQuery
	};
};

```

# src/routes/api/categories/+server.ts

```ts
import { json, type RequestHandler } from '@sveltejs/kit';
import { db } from '$lib/server/db';
import { boardGames } from '$lib/server/db/schema';
import { sql } from 'drizzle-orm';

export const GET: RequestHandler = async () => {
	const categories = await db
		.select({ category: sql`json_each.value` })
		.from(boardGames)
		.innerJoin(
			sql`json_each(${boardGames.categories})`,
			sql`1=1` // This is always true, effectively making it a cross join
		);

	const uniqueCategories = [...new Set(categories.map((c) => c.category))];
	return json(uniqueCategories);
};

```

# src/routes/admin/login/+page.svelte

```svelte
<script lang="ts">
	import { enhance } from '$app/forms';

	let username = $state('');
	let password = $state('');
	let error = $state('');

	async function handleSubmit() {
		error = '';
	}
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Admin Login</h2>
		</div>
		<form method="POST" use:enhance={handleSubmit} class="mt-8 space-y-6">
			<input type="hidden" name="remember" value="true" />
			<div class="rounded-md shadow-sm -space-y-px">
				<div>
					<label for="username" class="sr-only">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Username"
						bind:value={username}
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Password"
						bind:value={password}
					/>
				</div>
			</div>

			{#if error}
				<div class="text-red-500 text-sm">{error}</div>
			{/if}

			<div>
				<button
					type="submit"
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
				>
					Sign in
				</button>
			</div>
		</form>
	</div>
</div>

```

# src/routes/admin/login/+page.server.ts

```ts
// src/routes/admin/login/+page.server.ts
import { lucia } from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import { Argon2id } from 'oslo/password';
import { db } from '$lib/server/db';
import { users } from '$lib/server/db/schema';

export const load: PageServerLoad = async ({ locals }) => {
	if (locals.user) {
		redirect(302, '/admin');
	}
};

export const actions: Actions = {
	default: async ({ request, cookies }) => {
		const formData = await request.formData();
		const username = formData.get('username');
		const password = formData.get('password');

		console.log('username:', username);

		// basic check
		if (
			typeof username !== 'string' ||
			username.length < 1 ||
			username.length > 31 ||
			typeof password !== 'string' ||
			password.length < 1 ||
			password.length > 255
		) {
			return fail(400, {
				message: 'Invalid input'
			});
		}

		try {
			const user = await db.query.users.findFirst({
				where: (users, { eq }) => eq(users.username, username)
			});

			if (!user) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			const validPassword = await new Argon2id().verify(user.password_hash, password);
			if (!validPassword) {
				return fail(400, {
					message: 'Incorrect username or password'
				});
			}

			const session = await lucia.createSession(user.id, {});
			const sessionCookie = lucia.createSessionCookie(session.id);
			cookies.set(sessionCookie.name, sessionCookie.value, {
				path: '.',
				...sessionCookie.attributes
			});

			return { success: true };
		} catch (e) {
			console.error(e);
			return fail(500, {
				message: 'An unknown error occurred'
			});
		}
	}
};

```

# src/routes/admin/add-game/+page.svelte

```svelte
<script lang="ts">
	import BGGSearch from '$lib/components/BGGSearch.svelte';
	import GamePreview from '$lib/components/GamePreview.svelte';
	import { fade } from 'svelte/transition';

	let selectedGame: any = $state(null);
	let isAdding = $state(false);
	let isStarred = $state(false);
	let adminNote = $state('');

	function handleGameSelect(game: any) {
		selectedGame = game;
	}

	$inspect(selectedGame);

	async function addGameToDB() {
		if (selectedGame) {
			isAdding = true;
			const gameData = {
				...selectedGame,
				starred: isStarred,
				adminNote
			};
			try {
				const response = await fetch('/api/games', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify(gameData)
				});
				if (response.ok) {
					alert('Game added successfully');
				} else {
					throw new Error('Failed to add game');
				}
			} catch (error) {
				alert((error as Error).message);
			} finally {
				isAdding = false;
			}
		}
	}
</script>

<head>
	<title>Brads Admin</title>
</head>

<div class="container mx-auto px-4 py-8">
	<BGGSearch onselect={handleGameSelect} />

	{#if selectedGame}
		<div class="mt-8" transition:fade>
			<GamePreview game={selectedGame} />
			<div class="mt-4">
				<label class="flex items-center">
					<input type="checkbox" bind:checked={isStarred} class="form-checkbox" />
					<span class="ml-2">Staff Favorite</span>
				</label>
			</div>
			<div class="mt-4">
				<label for="adminNote" class="block text-sm font-medium text-gray-700">Admin Note</label>
				<textarea
					id="adminNote"
					bind:value={adminNote}
					class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
					rows="3"
				></textarea>
			</div>
			<div class="mt-4 flex justify-center">
				<button
					onclick={addGameToDB}
					disabled={isAdding}
					class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
				>
					{#if isAdding}
						<svg
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Adding to Database...
					{:else}
						Add to Database
					{/if}
				</button>
			</div>
		</div>
	{/if}
</div>

```

# src/lib/server/db/schema.ts

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const users = sqliteTable('users', {
	id: text('id').primaryKey(),
	username: text('username').notNull().unique(),
	password_hash: text('password_hash').notNull(),
	email: text('email').unique(),
	is_admin: integer('is_admin', { mode: 'boolean' }).notNull().default(false),
	created_at: integer('created_at', { mode: 'timestamp' }).notNull().defaultNow(),
	updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().defaultNow()
});

export const sessions = sqliteTable('session', {
	id: text('id').notNull().primaryKey(),
	userId: text('user_id')
		.notNull()
		.references(() => users.id),
	expiresAt: integer('expires_at').notNull()
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
	publishers: text('publishers'),
	isStarred: integer('is_starred', { mode: 'boolean' }).default(false),
	adminNote: text('admin_note')
});

export type BoardGame = typeof boardGames.$inferSelect;
export type NewBoardGame = typeof boardGames.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;

```

# src/lib/server/db/migrate.ts

```ts
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import Database from 'better-sqlite3';

const sqlite = new Database('sqlite.db');
const db = drizzle(sqlite);

await migrate(db, { migrationsFolder: './drizzle' });
await sqlite.close();

```

# src/lib/server/db/index.ts

```ts
import Database from 'better-sqlite3';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';
import * as schema from './schema';

const sqlite = new Database('sqlite.db');
export const db = drizzle(sqlite, { schema });

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
export async function runMigrations() {
	migrate(db, { migrationsFolder: './drizzle' });
}

await runMigrations();

```

# src/routes/admin/edit/[id]/+page.svelte

```svelte
<script lang="ts">
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

	const {
		data
	}: {
		data: {
			game: BoardGame;
		};
	} = $props();

	let game = $state(data.game);
	let isStarred = $state(game.isStarred);
	let adminNote = $state(game.adminNote || '');
	let isDeleteModalOpen = $state(false);

	async function handleSubmit() {
		const response = await fetch(`/api/games`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...game,
				isStarred,
				adminNote
			})
		});

		if (response.ok) {
			alert('Game updated successfully');
			goto('/admin/manage');
		} else {
			alert('Failed to update game');
		}
	}

	function openDeleteModal() {
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
	}

	async function confirmDelete() {
		const response = await fetch(`/api/games?id=${game.bggId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			alert('Game deleted successfully');
			goto('/admin/manage');
		} else {
			alert('Failed to delete game');
		}
		closeDeleteModal();
	}
</script>

<div class="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
	<h1 class="text-2xl font-bold mb-6">Edit Game: {game.name}</h1>

	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div>
			<label class="block mb-2 font-bold" for="isStarred">
				<input type="checkbox" id="isStarred" bind:checked={isStarred} class="mr-2" />
				Mark as Favorite
			</label>
		</div>

		<div>
			<label class="block mb-2 font-bold" for="adminNote"> Admin Note </label>
			<textarea id="adminNote" bind:value={adminNote} class="w-full p-2 border rounded" rows="4"
			></textarea>
		</div>

		<div class="flex justify-between items-center">
			<button
				type="submit"
				class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
			>
				Update Game
			</button>
			<button
				type="button"
				on:click={openDeleteModal}
				class="bg-white text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
			>
				Delete Game
			</button>
		</div>
	</form>
</div>

<ConfirmationModal
	isOpen={isDeleteModalOpen}
	onConfirm={confirmDelete}
	onCancel={closeDeleteModal}
	title="Confirm Deletion"
	message="Are you sure you want to delete this game? This action cannot be undone."
/>

```

# src/routes/admin/edit/[id]/+page.server.ts

```ts
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from '../../$types';

export const load = (async ({ params, fetch }) => {
	const id = params.id;

	if (!id) {
		throw error(400, 'Missing game ID');
	}

	const response = await fetch(`/api/games?id=${id}`);

	if (!response.ok) {
		throw error(response.status, 'Failed to load game data');
	}

	const game = await response.json();

	return { game };
}) satisfies PageServerLoad;

```

