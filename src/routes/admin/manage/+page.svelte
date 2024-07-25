<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import BoardGameTable from '$lib/components/BoardGameTable.svelte';
	import SortDropdown from '$lib/components/SortDropdown.svelte';
	import type { BoardGame } from '$lib/db/schema';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

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
		};
	} = $props();

	let isGridView = $state(true);
	let currentSort = $state($page.url.searchParams.get('sortBy') || 'name');
	let currentOrder: 'asc' | 'desc' = $state(
		($page.url.searchParams.get('order') as 'asc' | 'desc') || 'asc'
	);

	function handleSort(sortBy: string, orderBy: 'asc' | 'desc') {
		const url = new URL($page.url);
		currentSort = sortBy;
		currentOrder = orderBy;
		url.searchParams.set('sortBy', sortBy);
		url.searchParams.set('sortOrder', orderBy);
		goto(url.toString());
	}
</script>

<svelte:head>
	<title>Brads Admin - Manage Games</title>
</svelte:head>

<div class="mb-4 flex justify-between items-center">
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

{#if isGridView}
	<BoardGameGrid games={data.games} />
{:else}
	<BoardGameTable games={data.games} {currentSort} {currentOrder} onSort={handleSort} />
{/if}
