<script lang="ts">
	import { fade, slide } from 'svelte/transition';
	// import { debounce } from 'lodash-es';

	let { onselect }: { onselect: (game: any) => void } = $props();

	let searchQuery = $state('');
	let searchResults: any[] = $state([]);
	let isLoading = $state(false);

	const debouncedSearch = async () => {
		if (searchQuery.length < 3) {
			searchResults = [];
			return;
		}

		isLoading = true;
		const response = await fetch(`/api/bgg-search?query=${encodeURIComponent(searchQuery)}`);
		searchResults = await response.json();
		isLoading = false;
	};

	$effect(() => {
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
						onclick={() => onselect(game)}
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
