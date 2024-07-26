<script lang="ts">
	import BoardGameTable from '$lib/components/BoardGameTable.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import type { BoardGame } from '$lib/db/schema';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import debounce from '$lib/utils/debounce';
	import AdminBoardGameGrid from '$lib/components/AdminBoardGameGrid.svelte';

	const {
		data
	}: {
		data: {
			games: BoardGame[];
			meta: {
				page: number;
				totalPages: number;
				totalCount: number;
				limit: number;
			};
			searchQuery: string;
		};
	} = $props();

	let isGridView = $state(true);
	let currentSort = $state($page.url.searchParams.get('sortBy') || 'name');
	let currentOrder: 'asc' | 'desc' = $state(
		($page.url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
	);
	let searchQuery = $state(data.searchQuery);

	function handleSort(sortBy: string, orderBy: 'asc' | 'desc') {
		const url = new URL($page.url);
		currentSort = sortBy;
		currentOrder = orderBy;
		url.searchParams.set('sortBy', sortBy);
		url.searchParams.set('sortOrder', orderBy);
		goto(url.toString());
	}

	const debouncedSearch = debounce(async () => {
		const url = new URL($page.url);
		url.searchParams.set('search', searchQuery);
		url.searchParams.set('page', '1');
		await goto(url.toString(), { keepFocus: true });
	}, 300);

	function handleSearch(event: Event) {
		searchQuery = (event.target as HTMLInputElement).value;
		debouncedSearch();
	}

	function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Brads Admin - Manage Games</title>
</svelte:head>

<div class="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
	<div class="w-full sm:w-auto">
		<input
			type="text"
			placeholder="Search games..."
			value={searchQuery}
			oninput={handleSearch}
			class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
	</div>

	<div class="flex items-center gap-4">
		<SortDropdown {currentSort} {currentOrder} onsort={handleSort} />

		<div class="bg-brads-yellow-light p-1 rounded-full inline-flex gap-1">
			<button
				onclick={() => (isGridView = true)}
				class="px-4 py-2 rounded-full transition-all duration-300 relative"
				class:text-brads-yellow-light={isGridView}
				class:font-bold={isGridView}
				class:bg-white={!isGridView}
				class:bg-brads-green-light={isGridView}
			>
				Grid
				{#if isGridView}
					<span class="absolute inset-0 bg-brads-green-dark rounded-full -z-10" />
				{/if}
			</button>
			<button
				onclick={() => (isGridView = false)}
				class="px-4 py-2 rounded-full transition-all duration-300 relative"
				class:text-brads-yellow-light={!isGridView}
				class:font-bold={!isGridView}
				class:bg-white={isGridView}
				class:bg-brads-green-light={!isGridView}
			>
				Table
				{#if !isGridView}
					<span class="absolute inset-0 bg-brads-green-dark rounded-full -z-10" />
				{/if}
			</button>
		</div>
	</div>
</div>

{#if isGridView}
	<AdminBoardGameGrid games={data.games} />
{:else}
	<BoardGameTable games={data.games} {currentSort} {currentOrder} onSort={handleSort} />
{/if}

<div class="mt-8 flex justify-center items-center space-x-2">
	<button
		onclick={() => changePage(data.meta.page - 1)}
		class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
		disabled={data.meta.page === 1}
	>
		Previous
	</button>
	{#each Array(Math.min(5, data.meta.totalPages)) as _, i}
		{#if i + 1 <= 2 || i + 1 > data.meta.totalPages - 2 || i + 1 === data.meta.page}
			<button
				onclick={() => changePage(i + 1)}
				class="px-4 py-2 rounded {data.meta.page === i + 1
					? 'bg-blue-500 text-white'
					: 'bg-gray-200'}"
			>
				{i + 1}
			</button>
		{:else if i === 2}
			<span class="px-2">...</span>
		{/if}
	{/each}
	<button
		onclick={() => changePage(data.meta.page + 1)}
		class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
		disabled={data.meta.page === data.meta.totalPages}
	>
		Next
	</button>
</div>
