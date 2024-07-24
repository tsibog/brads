import { json } from '@sveltejs/kit';
import fetch from 'node-fetch';
import { DOMParser } from 'xmldom';

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
