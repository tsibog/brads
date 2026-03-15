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
			user: { id: string; username: string } | null;
			playsEnabled: boolean;
		};
	} = $props();

	const currentPage = $derived.by(() => {
		return data.meta.page;
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
	<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-2">
		<h1 class="text-3xl font-londrina text-brads-green-dark">Brads Spelcafé Game Catalogue</h1>
		{#if data.playsEnabled}
			<div class="flex gap-2">
				{#if data.user}
					<a href="/plays" class="px-4 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors text-center">
						Adventure Log
					</a>
				{:else}
					<span class="px-4 py-2 bg-gray-300 text-gray-500 rounded-lg font-londrina text-lg cursor-not-allowed text-center" title="Log in to access the adventure log">
						Adventure Log
					</span>
					<a href="/login" class="px-4 py-2 bg-brads-green-light text-white rounded-lg font-londrina text-lg hover:bg-brads-green-light/90 transition-colors text-center">
						Log In
					</a>
				{/if}
			</div>
		{/if}
	</div>

	<div class="flex flex-col md:flex-row gap-8">
		<aside class="w-full md:w-1/4">
			<GameFilter 
				allMechanics={data.allMechanics} 
				currentCount={data.games.length}
				totalCount={data.meta.totalCount}
			/>
		</aside>

		<div class="w-full md:w-3/4">
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
