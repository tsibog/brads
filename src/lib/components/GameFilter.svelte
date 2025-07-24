<script lang="ts">
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import debounce from '$lib/utils/debounce';
	import { slide } from 'svelte/transition';

	const {
		allMechanics,
		currentCount = 0,
		totalCount = 0
	}: {
		allMechanics: string[];
		currentCount?: number;
		totalCount?: number;
	} = $props();

	let mechanicSearch = $state('');
	let showMechanicDropdown = $state(false);
	let isFilterExpanded = $state(false);
	let isMobile = $state(false);

	let name = $state($page.url.searchParams.get('name') || '');
	let duration = $state($page.url.searchParams.get('duration') || '');
	let players = $state($page.url.searchParams.get('players') || '');
	let selectedMechanics = $state(
		$page.url.searchParams.get('mechanics')?.split(',').filter(Boolean) || []
	);

	const filteredMechanics = $derived(
		allMechanics
			.filter((mechanic) => mechanic.toLowerCase().includes(mechanicSearch.toLowerCase()))
			.sort((a, b) => {
				// Always put "Cooperative Game" first
				if (a === 'Cooperative Game') return -1;
				if (b === 'Cooperative Game') return 1;
				// Then sort alphabetically
				return a.localeCompare(b);
			})
	);

	const isLatestFirst = $derived.by(() => {
		const sortBy = $page.url.searchParams.get('sortBy');
		const sortOrder = $page.url.searchParams.get('sortOrder');
		return sortBy === 'id' && sortOrder === 'desc';
	});

	const debouncedUpdateFilters = debounce(updateFilters, 300);

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
		selectedMechanics = [];
		debouncedUpdateFilters();
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

		if (selectedMechanics.length) url.searchParams.set('mechanics', selectedMechanics.join(','));
		else url.searchParams.delete('mechanics');

		goto(url.toString(), { keepFocus: true });
	}

	function toggleMechanic(mechanic: string) {
		const index = selectedMechanics.indexOf(mechanic);
		if (index === -1) {
			selectedMechanics = [...selectedMechanics, mechanic];
		} else {
			selectedMechanics = selectedMechanics.filter((c) => c !== mechanic);
		}
		debouncedUpdateFilters();
	}

	function toggleFilterExpansion() {
		isFilterExpanded = !isFilterExpanded;
	}

	async function toggleSortOrder() {
		const url = new URL($page.url);

		if (isLatestFirst) {
			// Switch to alphabetic (name ASC)
			url.searchParams.delete('sortBy');
			url.searchParams.delete('sortOrder');
		} else {
			// Switch to latest first (id DESC)
			url.searchParams.set('sortBy', 'id');
			url.searchParams.set('sortOrder', 'desc');
		}

		await goto(url.toString(), { replaceState: true, keepFocus: true });
	}
</script>

<div class="bg-white shadow-md rounded-lg p-4 md:p-6">
	<div class="flex justify-between items-center md:hidden">
		<div>
			<h2 class="text-xl font-bold">Search & Filter</h2>
			<p class="text-sm text-gray-600">
				Showing {currentCount} of {totalCount} games
			</p>
		</div>
		<button
			onclick={toggleFilterExpansion}
			class="text-brads-green-dark focus:outline-none"
			aria-expanded={isFilterExpanded}
			aria-controls="filter-content"
			aria-label={isFilterExpanded ? 'Collapse filters' : 'Expand filters'}
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

	<!-- Desktop title and counter -->
	<div class="hidden md:block mb-6">
		<div class="flex justify-between flex-col">
			<h2 class="text-xl font-bold">Search & Filter</h2>
			<p class="text-sm text-gray-600">
				Showing {currentCount} of {totalCount} games
			</p>
		</div>
	</div>

	{#if isFilterExpanded}
		<div id="filter-content" class="space-y-6 mt-4" transition:slide|local={{ duration: 300 }}>
			<div>
				<label for="name" class="block text-sm font-medium text-gray-700">Search</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					oninput={debouncedUpdateFilters}
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
						oninput={debouncedUpdateFilters}
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
					oninput={debouncedUpdateFilters}
					placeholder="Party size"
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
				/>
			</div>

			<div class="relative">
				<h3 class="text-sm font-medium text-gray-700 mb-2">Mechanics</h3>

				<input
					type="text"
					bind:value={mechanicSearch}
					placeholder="Search mechanics..."
					class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
					onfocus={() => (showMechanicDropdown = true)}
					onblur={() => setTimeout(() => (showMechanicDropdown = false), 200)}
				/>
				{#if showMechanicDropdown && filteredMechanics.length > 0}
					<div
						class="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
					>
						{#each filteredMechanics as mechanic}
							<button
								class="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-indigo-50 w-full text-left"
								onclick={() => toggleMechanic(mechanic)}
							>
								<span class:font-semibold={selectedMechanics.includes(mechanic)}>{mechanic}</span>
								{#if selectedMechanics.includes(mechanic)}
									<span class="absolute inset-y-0 right-0 flex items-center pr-4 text-indigo-600">
										✓
									</span>
								{/if}
							</button>
						{/each}
					</div>
				{/if}
				<div class="flex flex-wrap gap-2 mt-2">
					{#each selectedMechanics as mechanic}
						<span
							class="bg-indigo-100 text-indigo-800 text-xs font-medium px-2.5 py-0.5 rounded flex"
						>
							{mechanic}
							<button
								aria-label="remove {mechanic}"
								class="ml-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-200 rounded-full p-0.5 transition-colors"
								onclick={() => toggleMechanic(mechanic)}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									class="h-3 w-3"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										stroke-linecap="round"
										stroke-linejoin="round"
										stroke-width="2"
										d="M6 18L18 6M6 6l12 12"
									/>
								</svg>
							</button>
						</span>
					{/each}
				</div>
				<button
					onclick={toggleSortOrder}
					class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors mt-2 hover:cursor-pointer"
				>
					{#if isLatestFirst}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
							/>
						</svg>
						Latest Additions
					{:else}
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-4 w-4"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
							/>
						</svg>
						Alphabetic
					{/if}
				</button>
			</div>

			<div>
				<button
					type="button"
					onclick={resetFilters}
					disabled={!name && !duration && !players && selectedMechanics.length === 0}
					class={[
						'w-full px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400 transition duration-300',
						!name && !duration && !players && selectedMechanics.length === 0
							? 'opacity-50 cursor-not-allowed'
							: 'hover:cursor-pointer'
					]}
				>
					Reset Filters
				</button>
			</div>
		</div>
	{/if}
</div>
