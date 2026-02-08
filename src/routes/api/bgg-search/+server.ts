import { json } from '@sveltejs/kit';
import { DOMParser } from '@xmldom/xmldom';
import { BGG_API_TOKEN } from '$env/static/private';

const BGG_BASE_URL = 'https://boardgamegeek.com/xmlapi2';

function bggFetch(url: string) {
	const headers: Record<string, string> = {
		Accept: 'application/xml'
	};
	if (BGG_API_TOKEN) {
		headers['Authorization'] = `Bearer ${BGG_API_TOKEN}`;
	}
	return fetch(url, { headers });
}

function parseXml(xmlText: string) {
	const parser = new DOMParser();
	return parser.parseFromString(xmlText, 'text/xml');
}

export async function GET({ url }) {
	const query = url.searchParams.get('query');
	if (!query) {
		return json({ error: 'Missing query parameter' }, { status: 400 });
	}

	const bggApiUrl = `${BGG_BASE_URL}/search?query=${encodeURIComponent(query)}&type=boardgame`;

	const response = await bggFetch(bggApiUrl);
	if (!response.ok) {
		console.error(`BGG search API returned ${response.status}: ${response.statusText}`);
		return json(
			{ error: `BGG API error: ${response.status} ${response.statusText}` },
			{ status: 502 }
		);
	}

	const xmlText = await response.text();
	if (!xmlText || !xmlText.trim()) {
		return json([], { status: 200 });
	}

	const xmlDoc = parseXml(xmlText);
	const gameIds = Array.from(xmlDoc.getElementsByTagName('item'))
		.map((item) => item.getAttribute('id'))
		.slice(0, 10);

	if (gameIds.length === 0) {
		return json([], { status: 200 });
	}

	// Batch game detail requests into a single call using comma-separated IDs
	const detailsUrl = `${BGG_BASE_URL}/thing?id=${gameIds.join(',')}&stats=1`;
	const detailsResponse = await bggFetch(detailsUrl);
	if (!detailsResponse.ok) {
		console.error(`BGG thing API returned ${detailsResponse.status}: ${detailsResponse.statusText}`);
		return json(
			{ error: `BGG API error: ${detailsResponse.status} ${detailsResponse.statusText}` },
			{ status: 502 }
		);
	}

	const detailsXml = await detailsResponse.text();
	if (!detailsXml || !detailsXml.trim()) {
		return json([], { status: 200 });
	}

	const detailsDoc = parseXml(detailsXml);
	const items = Array.from(detailsDoc.getElementsByTagName('item'));

	const games = items.map((item) => ({
		id: item.getAttribute('id'),
		name: item.getElementsByTagName('name')[0]?.getAttribute('value'),
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
	}));

	return json(games);
}
