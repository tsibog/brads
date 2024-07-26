<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import debounce from '../../utils/debounce';

	const { allCategories }: { allCategories: string[] } = $props();

	let name = $state($page.url.searchParams.get('name') || '');
	let minDuration = $state($page.url.searchParams.get('minDuration') || '');
	let maxDuration = $state($page.url.searchParams.get('maxDuration') || '');
	let minPlayers = $state($page.url.searchParams.get('minPlayers') || '');
	let maxPlayers = $state($page.url.searchParams.get('maxPlayers') || '');
	let categories = $state(
		$page.url.searchParams.get('categories')?.split(',').filter(Boolean) || []
	);

	const debouncedUpdateFilters = debounce(updateFilters, 300);

	function resetFilters() {
		name = '';
		minDuration = '';
		maxDuration = '';
		minPlayers = '';
		maxPlayers = '';
		categories = [];
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

		if (categories.length) url.searchParams.set('categories', categories.join(','));
		else url.searchParams.delete('categories');

		goto(url.toString(), { keepFocus: true });
	}

	$inspect(categories);

	$effect(() => {
		if (name || minDuration || maxDuration || minPlayers || maxPlayers || categories) {
			debouncedUpdateFilters();
		}
	});
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

		<div>
			<h3 class="text-sm font-medium text-gray-700 mb-2">Categories</h3>
			<div class="space-y-2 max-h-40 overflow-y-auto">
				{#each allCategories as category}
					<label class="flex items-center">
						<input
							type="checkbox"
							value={category}
							bind:group={categories}
							class="form-checkbox h-4 w-4 text-indigo-600"
						/>
						<span class="ml-2 text-sm text-gray-700">{category}</span>
					</label>
				{/each}
			</div>
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
