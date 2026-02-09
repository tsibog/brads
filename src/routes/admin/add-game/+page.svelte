<script lang="ts">
	import BGGSearch from '$lib/components/BGGSearch.svelte';
	import GamePreview from '$lib/components/GamePreview.svelte';
	import { fade } from 'svelte/transition';
	import { toast } from '$lib/stores/toast';

	let selectedGame: any = $state(null);
	let isAdding = $state(false);
	let isStarred = $state(false);
	let adminNote = $state('');

	function handleGameSelect(game: any) {
		selectedGame = game;
	}

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
					toast('Game added successfully');
					selectedGame = null;
					isStarred = false;
					adminNote = '';
				} else {
					throw new Error('Failed to add game');
				}
			} catch (error) {
				toast((error as Error).message, 'error');
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
