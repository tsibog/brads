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
