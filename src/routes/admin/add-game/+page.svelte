<script lang="ts">
	import BGGSearch from '$lib/components/BGGSearch.svelte';
	import GamePreview from '$lib/components/GamePreview.svelte';
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/stores/toast';
	import LanguagePicker from '$lib/components/LanguagePicker.svelte';
	import type { LanguageCode } from '$lib/utils/languages';

	let mode: 'bgg' | 'manual' = $state('bgg');
	let selectedGame: any = $state(null);
	let isAdding = $state(false);
	let isStarred = $state(false);
	let adminNote = $state('');

	// Manual entry fields
	let manualName = $state('');
	let manualYearPublished = $state<number | undefined>(undefined);
	let manualMinPlayers = $state<number | undefined>(undefined);
	let manualMaxPlayers = $state<number | undefined>(undefined);
	let manualPlayingTime = $state<number | undefined>(undefined);
	let manualMinPlayTime = $state<number | undefined>(undefined);
	let manualMaxPlayTime = $state<number | undefined>(undefined);
	let manualAge = $state<number | undefined>(undefined);
	let manualDescription = $state('');
	let manualImage = $state('');
	let manualThumbnail = $state('');
	let manualLanguages: LanguageCode[] = $state([]);

	function handleGameSelect(game: any) {
		selectedGame = game;
	}

	function generateManualId(): string {
		return 'manual-' + crypto.randomUUID().slice(0, 12);
	}

	function resetForm() {
		selectedGame = null;
		isStarred = false;
		adminNote = '';
		manualName = '';
		manualYearPublished = undefined;
		manualMinPlayers = undefined;
		manualMaxPlayers = undefined;
		manualPlayingTime = undefined;
		manualMinPlayTime = undefined;
		manualMaxPlayTime = undefined;
		manualAge = undefined;
		manualDescription = '';
		manualImage = '';
		manualThumbnail = '';
		manualLanguages = [];
	}

	async function addGameToDB() {
		let gameData: any;

		if (mode === 'bgg') {
			if (!selectedGame) return;
			gameData = {
				...selectedGame,
				starred: isStarred,
				adminNote
			};
		} else {
			if (!manualName.trim()) {
				toast('Game name is required', 'error');
				return;
			}
			gameData = {
				id: generateManualId(),
				name: manualName.trim(),
				yearPublished: manualYearPublished,
				minPlayers: manualMinPlayers,
				maxPlayers: manualMaxPlayers,
				playingTime: manualPlayingTime,
				minPlayTime: manualMinPlayTime,
				maxPlayTime: manualMaxPlayTime,
				age: manualAge,
				description: manualDescription || null,
				image: manualImage || null,
				thumbnail: manualThumbnail || manualImage || null,
				categories: [],
				mechanics: [],
				designers: [],
				artists: [],
				publishers: [],
				languages: manualLanguages,
				starred: isStarred,
				adminNote: adminNote || null
			};
		}

		isAdding = true;
		try {
			const response = await fetch('/api/games', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(gameData)
			});
			if (response.ok) {
				toast('Game added successfully');
				resetForm();
			} else {
				const err = await response.json();
				throw new Error(err.error || 'Failed to add game');
			}
		} catch (error) {
			toast((error as Error).message, 'error');
		} finally {
			isAdding = false;
		}
	}
</script>

<head>
	<title>Brads Admin - Add Game</title>
</head>

<div class="container mx-auto px-4 py-8 max-w-2xl">
	<!-- Mode toggle -->
	<div class="flex gap-2 mb-6">
		<button
			onclick={() => { mode = 'bgg'; resetForm(); }}
			class="px-4 py-2 rounded-lg font-medium transition-colors {mode === 'bgg' ? 'bg-brads-green-dark text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		>
			Search BGG
		</button>
		<button
			onclick={() => { mode = 'manual'; resetForm(); }}
			class="px-4 py-2 rounded-lg font-medium transition-colors {mode === 'manual' ? 'bg-brads-green-dark text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		>
			Add Manually
		</button>
	</div>

	{#if mode === 'bgg'}
		<!-- BGG Search mode -->
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
					<label for="adminNote" class="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
					<textarea
						id="adminNote"
						bind:value={adminNote}
						placeholder="Add an optional note about this game..."
						class="block w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brads-green-light focus:ring-2 focus:ring-brads-green/30 focus:outline-none transition duration-200"
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
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Adding to Database...
						{:else}
							Add to Database
						{/if}
					</button>
				</div>
			</div>
		{/if}
	{:else}
		<!-- Manual entry mode -->
		<div class="bg-white rounded-lg shadow-md p-6" transition:fade>
			<h2 class="text-lg font-bold text-gray-800 mb-4">Add Game Manually</h2>
			<p class="text-sm text-gray-500 mb-6">For games not found on BoardGameGeek.</p>

			<form onsubmit={(e) => { e.preventDefault(); addGameToDB(); }} class="space-y-5">
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="manualName">Game Name *</label>
					<input
						type="text"
						id="manualName"
						bind:value={manualName}
						required
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>

				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="manualYear">Year Published</label>
					<input
						type="number"
						id="manualYear"
						bind:value={manualYearPublished}
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>

				<div class="grid grid-cols-2 gap-4">
					<div>
						<label class="block mb-1 font-bold text-sm text-gray-700" for="manualMinP">Min Players</label>
						<input type="number" id="manualMinP" bind:value={manualMinPlayers} min="1" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
					</div>
					<div>
						<label class="block mb-1 font-bold text-sm text-gray-700" for="manualMaxP">Max Players</label>
						<input type="number" id="manualMaxP" bind:value={manualMaxPlayers} min="1" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
					</div>
				</div>

				<div class="grid grid-cols-3 gap-4">
					<div>
						<label class="block mb-1 font-bold text-sm text-gray-700" for="manualTime">Play Time (min)</label>
						<input type="number" id="manualTime" bind:value={manualPlayingTime} min="0" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
					</div>
					<div>
						<label class="block mb-1 font-bold text-sm text-gray-700" for="manualMinT">Min Time</label>
						<input type="number" id="manualMinT" bind:value={manualMinPlayTime} min="0" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
					</div>
					<div>
						<label class="block mb-1 font-bold text-sm text-gray-700" for="manualMaxT">Max Time</label>
						<input type="number" id="manualMaxT" bind:value={manualMaxPlayTime} min="0" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
					</div>
				</div>

				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="manualAge">Minimum Age</label>
					<input type="number" id="manualAge" bind:value={manualAge} min="0" class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
				</div>

				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="manualDesc">Description</label>
					<textarea
						id="manualDesc"
						bind:value={manualDescription}
						rows="4"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					></textarea>
				</div>

				<div class="border-t pt-5">
					<h3 class="font-bold text-sm text-gray-700 mb-3">Images</h3>
					<div class="space-y-3">
						<div>
							<label class="block mb-1 text-sm text-gray-600" for="manualImage">Full Image URL</label>
							<input type="url" id="manualImage" bind:value={manualImage} placeholder="https://..." class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
						</div>
						<div>
							<label class="block mb-1 text-sm text-gray-600" for="manualThumb">Thumbnail URL</label>
							<input type="url" id="manualThumb" bind:value={manualThumbnail} placeholder="https://... (defaults to full image)" class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" />
						</div>
					</div>
				</div>

				<div class="border-t pt-5">
					<h3 class="font-bold text-sm text-gray-700 mb-3">Languages</h3>
					<LanguagePicker bind:selected={manualLanguages} />
				</div>

				<div class="border-t pt-5">
					<label class="flex items-center mb-3">
						<input type="checkbox" bind:checked={isStarred} class="form-checkbox" />
						<span class="ml-2">Staff Favorite</span>
					</label>
					<div>
						<label for="manualNote" class="block text-sm font-medium text-gray-700 mb-1">Admin Note</label>
						<textarea
							id="manualNote"
							bind:value={adminNote}
							placeholder="Add an optional note about this game..."
							class="block w-full rounded-lg border-2 border-gray-300 bg-white p-3 text-gray-800 shadow-sm placeholder:text-gray-400 focus:border-brads-green-light focus:ring-2 focus:ring-brads-green/30 focus:outline-none transition duration-200"
							rows="3"
						></textarea>
					</div>
				</div>

				<div class="flex justify-center pt-2">
					<button
						type="submit"
						disabled={isAdding}
						class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-full focus:outline-none focus:shadow-outline transition duration-300 ease-in-out transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
					>
						{#if isAdding}
							<svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
								<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
								<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
							</svg>
							Adding to Database...
						{:else}
							Add to Database
						{/if}
					</button>
				</div>
			</form>
		</div>
	{/if}
</div>
