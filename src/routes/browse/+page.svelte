<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import GameFilter from '$lib/components/GameFilter.svelte';
	import { browser } from '$app/environment';

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
			allMechanics: string[];
		};
	} = $props();

	const currentPage = $derived.by(() => {
		return data.meta.page;
	});

	const isLatestFirst = $derived.by(() => {
		const sortBy = $page.url.searchParams.get('sortBy');
		const sortOrder = $page.url.searchParams.get('sortOrder');
		return sortBy === 'id' && sortOrder === 'desc';
	});

	const isMobile = $derived.by(() => {
		if (browser) {
			return window.innerWidth < 640;
		}

		return false;
	});

	const pageNumbers = $derived.by(() => {
		return generatePageNumbers(currentPage, data.meta.totalPages, isMobile);
	});

	async function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { replaceState: true, keepFocus: true });
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
		
		url.searchParams.set('page', '1'); // Reset to first page when sorting
		await goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	function generatePageNumbers(
		current: number,
		total: number,
		isMobile: boolean
	): (number | string)[] {
		const delta = isMobile ? 1 : 2;
		const range = [];
		for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
			range.push(i);
		}

		if (current - delta > 2) {
			range.unshift('...');
		}
		if (current + delta < total - 1) {
			range.push('...');
		}

		range.unshift(1);
		if (total > 1) {
			range.push(total);
		}

		return range;
	}
</script>

<svelte:head>
	<title>Brads Spelcafé</title>
</svelte:head>

{#snippet pageButton(
	onClick: () => Promise<void>,
	disabled: boolean,
	label: string | number,
	current: boolean = false
)}
	<button
		onclick={onClick}
		class="w-12 h-12 aspect-square text-sm rounded-sm {current
			? 'bg-blue-500 text-white'
			: disabled
				? 'bg-gray-300 text-gray-500'
				: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		{disabled}
	>
		{label}
	</button>
{/snippet}

<main class="container mx-auto px-2 sm:px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Brads Spelcafé Game Catalogue</h1>

	<div class="flex flex-col md:flex-row gap-8">
		<aside class="w-full md:w-1/4">
			<GameFilter 
				allMechanics={data.allMechanics} 
				currentCount={data.games.length}
				totalCount={data.meta.totalCount}
			/>
		</aside>

		<div class="w-full md:w-3/4">
			<!-- Sort toggle -->
			<div class="flex justify-between items-center mb-6">
				<h2 class="text-lg font-semibold text-gray-800">Games</h2>
				<button
					onclick={toggleSortOrder}
					class="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 transition-colors"
				>
					{#if isLatestFirst}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
						Latest Additions
					{:else}
						<svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
						</svg>
						Alphabetic
					{/if}
				</button>
			</div>
			
			<BoardGameGrid games={data.games} />

			<nav
				class="flex justify-center items-center flex-wrap gap-1 mt-8 font-londrina"
				aria-label="Pagination"
			>
				{#each pageNumbers as pageNum}
					{#if pageNum === '...'}
						<span class="w-12 h-12 aspect-square flex items-center justify-center">...</span>
					{:else}
						{@render pageButton(
							() => changePage(Number(pageNum)),
							false,
							pageNum,
							currentPage === pageNum
						)}
					{/if}
				{/each}
			</nav>
		</div>
	</div>
</main>
