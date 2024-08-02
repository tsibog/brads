import { db } from './server/db';
import { boardGames, type BoardGame } from './server/db/schema';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';
import { eq } from 'drizzle-orm';

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
