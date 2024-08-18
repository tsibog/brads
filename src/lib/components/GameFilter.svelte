<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import debounce from '$lib/utils/debounce';
	import { slide } from 'svelte/transition';

	const { allCategories }: { allCategories: string[] } = $props();

	let categorySearch = $state('');
	let showCategoryDropdown = $state(false);
	let isFilterExpanded = $state(false);
	let isMobile = $state(false);

	let name = $state($page.url.searchParams.get('name') || '');
	let duration = $state($page.url.searchParams.get('duration') || '');
	let players = $state($page.url.searchParams.get('players') || '');
	let selectedCategories = $state(
		$page.url.searchParams.get('categories')?.split(',').filter(Boolean) || []
	);

	let filteredCategories = $derived(
		allCategories.filter((category) =>
			category.toLowerCase().includes(categorySearch.toLowerCase())
		)
	);

	const debouncedUpdateFilters = debounce(updateFilters, 300);

	$effect(() => {
		console.log(name, duration, players, selectedCategories);
		debouncedUpdateFilters();
	});

	$effect(() => {
		const checkMobile = () => {
			isMobile = window.innerWidth < 768; // Assuming 768px as the breakpoint
			isFilterExpanded = !isMobile;
		};

		checkMobile();
		window.addEventListener('resize', checkMobile);

		return () => {
			window.removeEventListener('resize', checkMobile);
		};
	});

	function resetFilters() {
		name = '';
		duration = '';
		players = '';
		selectedCategories = [];
	}

	function updateFilters() {
		const url = new URL($page.url);
		url.searchParams.set('page', '1');

		if (name) url.searchParams.set('name', name);
		else url.searchParams.delete('name');

		if (duration) url.searchParams.set('duration', duration);
		else url.searchParams.delete('duration');

		if (players) url.searchParams.set('players', players);
		else url.searchParams.delete('players');

		if (selectedCategories.length) url.searchParams.set('categories', selectedCategories.join(','));
		else url.searchParams.delete('categories');

		goto(url.toString(), { keepFocus: true });
	}

	function toggleCategory(category: string) {
		const index = selectedCategories.indexOf(category);
		if (index === -1) {
			selectedCategories = [...selectedCategories, category];
		} else {
			selectedCategories = selectedCategories.filter((c) => c !== category);
		}
	}

	function toggleFilterExpansion() {
		isFilterExpanded = !isFilterExpanded;
	}
</script>

<div class="bg-white shadow-md rounded-lg p-4 md:p-6">
	<div class="flex justify-between items-center md:hidden´">
		<h2 class="text-xl font-bold">Search & Filter</h2>
		<button
			onclick={toggleFilterExpansion}
			class="text-brads-green-dark focus:outline-none"
			aria-expanded={isFilterExpanded}
			aria-controls="filter-content"
		>
			<svg
				xmlns="http://www.w3.org/2000/svg"
				fill="none"
				viewBox="0 0 24 24"
				stroke="currentColor"
				class="w-6 h-6 transition-transform duration-300 ease-in-out"
				class:rotate-180={isFilterExpanded}
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
			</svg>
		</button>
	</div>

	{#if isFilterExpanded}
		<div id="filter-content" class="space-y-6 mt-4" transition:slide|local={{ duration: 300 }}>
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
						id="duration"
						bind:value={duration}
						step="5"
						placeholder="Minutes"
						class="px-3 py-2 border border-gray-300 rounded-md w-full shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					/>
				</div>
			</div>

			<div>
				<h3 class="text-sm font-medium text-gray-700 mb-2">Number of Players</h3>
				<input
					type="number"
					id="players"
					bind:value={players}
					placeholder="Party size"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
			</div>

			<div class="relative">
				<h3 class="text-sm font-medium text-gray-700 mb-2">Categories</h3>
				<div class="flex flex-wrap gap-2 mb-2">
					{#each selectedCategories as category}
						<span class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded">
							{category}
							<button
								class="ml-1 text-indigo-600 hover:text-indigo-800"
								onclick={() => toggleCategory(category)}>×</button
							>
						</span>
					{/each}
				</div>
				<input
					type="text"
					bind:value={categorySearch}
					placeholder="Search categories..."
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					onfocus={() => (showCategoryDropdown = true)}
					onblur={() => setTimeout(() => (showCategoryDropdown = false), 200)}
				/>
				{#if showCategoryDropdown && filteredCategories.length > 0}
					<div
						class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
					>
						{#each filteredCategories as category}
							<button
								class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 w-full text-left"
								onclick={() => toggleCategory(category)}
							>
								<span class:font-semibold={selectedCategories.includes(category)}>{category}</span>
								{#if selectedCategories.includes(category)}
									<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
										✓
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
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
	{/if}
</div>
