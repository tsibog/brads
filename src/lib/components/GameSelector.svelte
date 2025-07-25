<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	import debounce from '$lib/utils/debounce';

	interface GamePreference {
		id: number;
		gameBggId: string;
		name: string;
		thumbnail: string | null;
		minPlayers: number | null;
		maxPlayers: number | null;
		playingTime: number | null;
	}

	interface Props {
		selectedGames: GamePreference[];
		userId: string;
	}

	let { selectedGames = $bindable(), userId }: Props = $props();

	let searchQuery = $state('');
	let searchResults: any[] = $state([]);
	let isLoading = $state(false);
	let isUpdating = $state(false);
	let updateMessage = $state('');

	const debouncedSearch = debounce(async () => {
		if (searchQuery.length < 2) {
			searchResults = [];
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/party-finder/games-search?query=${encodeURIComponent(searchQuery)}`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const results = await response.json();
			// Filter out games already selected
			const selectedBggIds = selectedGames.map(g => g.gameBggId);
			searchResults = results.filter((game: any) => !selectedBggIds.includes(game.bggId));
		} catch (error) {
			console.error('Search error:', error);
			searchResults = [];
		} finally {
			isLoading = false;
		}
	}, 300);

	const addGame = (game: any) => {
		const gamePreference: GamePreference = {
			id: 0, // Will be set by server
			gameBggId: game.bggId,
			name: game.name,
			thumbnail: game.thumbnail,
			minPlayers: game.minPlayers,
			maxPlayers: game.maxPlayers,
			playingTime: game.playingTime
		};
		
		selectedGames = [...selectedGames, gamePreference];
		searchQuery = '';
		searchResults = [];
	};

	const removeGame = (gameBggId: string) => {
		selectedGames = selectedGames.filter(g => g.gameBggId !== gameBggId);
	};

	async function updateGamePreferences() {
		isUpdating = true;
		updateMessage = '';

		try {
			const response = await fetch('/api/party-finder/game-preferences', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId,
					gamePreferences: selectedGames.map(g => g.gameBggId)
				})
			});

			const result = await response.json();

			if (response.ok) {
				updateMessage = 'Game preferences updated successfully!';
				setTimeout(() => {
					updateMessage = '';
				}, 3000);
			} else {
				updateMessage = result.error || 'Failed to update game preferences';
			}
		} catch (error) {
			updateMessage = 'Network error occurred';
		} finally {
			isUpdating = false;
		}
	}

	$effect(() => {
		if (searchQuery.length < 2) {
			searchResults = [];
			return;
		}
		debouncedSearch();
	});

	function getPlayerCountText(game: GamePreference): string {
		if (!game.minPlayers && !game.maxPlayers) return '';
		if (game.minPlayers === game.maxPlayers) return `${game.minPlayers} players`;
		return `${game.minPlayers || '?'}-${game.maxPlayers || '?'} players`;
	}

	function getPlayTimeText(game: GamePreference): string {
		if (!game.playingTime) return '';
		if (game.playingTime < 60) return `${game.playingTime}min`;
		const hours = Math.floor(game.playingTime / 60);
		const minutes = game.playingTime % 60;
		return minutes > 0 ? `${hours}h ${minutes}min` : `${hours}h`;
	}
</script>

<div class="space-y-4">
	<!-- Search Input -->
	<div class="relative">
		<input
			bind:value={searchQuery}
			placeholder="Search cafe games..."
			class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
		/>
		{#if isLoading}
			<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
				<div class="w-4 h-4 border-t-2 border-indigo-500 border-solid rounded-full animate-spin"></div>
			</div>
		{/if}
	</div>

	<!-- Search Results -->
	{#if searchResults.length > 0}
		<div
			class="bg-white border border-gray-200 rounded-md shadow-sm max-h-60 overflow-y-auto"
			transition:slide|local={{ duration: 200 }}
		>
			{#each searchResults as game}
				<button
					type="button"
					onclick={() => addGame(game)}
					class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
					transition:fade|local={{ duration: 150 }}
				>
					{#if game.thumbnail}
						<img 
							src={game.thumbnail} 
							alt={game.name}
							class="w-12 h-12 object-cover rounded flex-shrink-0"
						/>
					{:else}
						<div class="w-12 h-12 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
							<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
							</svg>
						</div>
					{/if}
					<div class="flex-1 min-w-0">
						<div class="font-medium text-gray-900 truncate">{game.name}</div>
						<div class="text-sm text-gray-500 space-x-2">
							{#if getPlayerCountText(game)}
								<span>{getPlayerCountText(game)}</span>
							{/if}
							{#if getPlayTimeText(game)}
								<span>•</span>
								<span>{getPlayTimeText(game)}</span>
							{/if}
						</div>
					</div>
					<svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
					</svg>
				</button>
			{/each}
		</div>
	{/if}

	<!-- Selected Games -->
	{#if selectedGames.length > 0}
		<div class="space-y-2">
			<h4 class="text-sm font-medium text-gray-700">Your Preferred Games ({selectedGames.length})</h4>
			<div class="space-y-2">
				{#each selectedGames as game}
					<div class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2" transition:slide|local={{ duration: 200 }}>
						<div class="flex items-center space-x-3">
							{#if game.thumbnail}
								<img 
									src={game.thumbnail} 
									alt={game.name}
									class="w-8 h-8 object-cover rounded flex-shrink-0"
								/>
							{:else}
								<div class="w-8 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
									<svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
									</svg>
								</div>
							{/if}
							<div>
								<div class="font-medium text-indigo-900">{game.name}</div>
								<div class="text-xs text-indigo-600">
									{#if getPlayerCountText(game) || getPlayTimeText(game)}
										<span>{getPlayerCountText(game)}</span>
										{#if getPlayerCountText(game) && getPlayTimeText(game)}
											<span> • </span>
										{/if}
										<span>{getPlayTimeText(game)}</span>
									{/if}
								</div>
							</div>
						</div>
						<button
							type="button"
							onclick={() => removeGame(game.gameBggId)}
							class="text-indigo-400 hover:text-indigo-600 transition-colors"
							title="Remove game"
							aria-label="Remove {game.name} from preferences"
						>
							<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
							</svg>
						</button>
					</div>
				{/each}
			</div>
		</div>
	{:else}
		<div class="text-sm text-gray-500 italic">
			No games selected. Search and add games from the cafe's collection above.
		</div>
	{/if}

	<!-- Update Button -->
	<div class="flex items-center justify-between">
		<button
			type="button"
			onclick={updateGamePreferences}
			disabled={isUpdating}
			class="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if isUpdating}
				<svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white inline" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Saving...
			{:else}
				Save
			{/if}
		</button>

		{#if updateMessage}
			<div class="text-xs {updateMessage.includes('success') ? 'text-green-600' : 'text-red-600'}">
				{updateMessage}
			</div>
		{/if}
	</div>
</div>