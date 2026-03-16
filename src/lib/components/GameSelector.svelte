<script lang="ts">
	interface GameOption {
		bggId: string;
		name: string;
		thumbnail: string | null;
		minPlayers?: number | null;
		maxPlayers?: number | null;
	}

	interface Props {
		selectedGames: GameOption[];
		maxGames?: number;
		onchange?: (games: GameOption[]) => void;
		disabled?: boolean;
	}

	let {
		selectedGames = $bindable([]),
		maxGames = 4,
		onchange,
		disabled = false
	}: Props = $props();

	let searchQuery = $state('');
	let searchResults = $state<GameOption[]>([]);
	let isSearching = $state(false);
	let showResults = $state(false);

	async function doSearch(query: string) {
		if (query.length < 2) {
			searchResults = [];
			showResults = false;
			return;
		}

		isSearching = true;
		try {
			const res = await fetch(`/api/party-finder/games-search?query=${encodeURIComponent(query)}`);
			if (res.ok) {
				const data = await res.json();
				searchResults = data.filter(
					(g: GameOption) => !selectedGames.some((s) => s.bggId === g.bggId)
				);
				showResults = true;
			}
		} catch (e) {
			console.error('Game search error:', e);
		} finally {
			isSearching = false;
		}
	}

	let searchTimeout: ReturnType<typeof setTimeout>;
	function searchGames(query: string) {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => doSearch(query), 300);
	}

	function addGame(game: GameOption) {
		if (selectedGames.length >= maxGames) return;
		selectedGames = [...selectedGames, game];
		searchQuery = '';
		searchResults = [];
		showResults = false;
		onchange?.(selectedGames);
	}

	function removeGame(bggId: string) {
		selectedGames = selectedGames.filter((g) => g.bggId !== bggId);
		onchange?.(selectedGames);
	}
</script>

<div class="space-y-3">
	<!-- Selected games -->
	{#if selectedGames.length > 0}
		<div class="flex flex-wrap gap-2">
			{#each selectedGames as game}
				<div
					class="flex items-center gap-2 bg-brads-green-dark/10 rounded-lg px-3 py-1.5 text-sm"
				>
					{#if game.thumbnail}
						<img src={game.thumbnail} alt="" class="w-6 h-6 rounded object-cover" />
					{/if}
					<span class="text-brads-green-dark font-medium">{game.name}</span>
					{#if !disabled}
						<button
							type="button"
							onclick={() => removeGame(game.bggId)}
							class="text-gray-400 hover:text-red-500 ml-1"
						>
							&times;
						</button>
					{/if}
				</div>
			{/each}
		</div>
	{/if}

	<!-- Search input -->
	{#if selectedGames.length < maxGames && !disabled}
		<div class="relative">
			<input
				type="text"
				placeholder="Search for a game..."
				bind:value={searchQuery}
				oninput={() => searchGames(searchQuery)}
				onfocus={() => {
					if (searchResults.length > 0) showResults = true;
				}}
				onblur={() => setTimeout(() => (showResults = false), 200)}
				class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
			/>
			{#if isSearching}
				<div class="absolute right-3 top-2.5 text-sm text-gray-400">Searching...</div>
			{/if}

			{#if showResults && searchResults.length > 0}
				<div
					class="absolute z-50 mt-1 w-full bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
				>
					{#each searchResults as game}
						<button
							type="button"
							class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 text-left"
							onmousedown={() => addGame(game)}
						>
							{#if game.thumbnail}
								<img src={game.thumbnail} alt="" class="w-8 h-8 rounded object-cover flex-shrink-0" />
							{:else}
								<div class="w-8 h-8 rounded bg-gray-200 flex-shrink-0"></div>
							{/if}
							<div>
								<div class="text-sm font-medium text-gray-900">{game.name}</div>
								{#if game.minPlayers && game.maxPlayers}
									<div class="text-xs text-gray-500">
										{game.minPlayers}-{game.maxPlayers} players
									</div>
								{/if}
							</div>
						</button>
					{/each}
				</div>
			{/if}
		</div>
		<p class="text-xs text-gray-400">
			{selectedGames.length}/{maxGames} games selected
		</p>
	{/if}
</div>
