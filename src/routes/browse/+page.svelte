<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import GameFilter from '$lib/components/GameFilter.svelte';

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
			allCategories: string[];
		};
	} = $props();

	const currentPage = $derived.by(() => {
		return data.meta.page;
	});

	async function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	const pageNumbers = $derived.by(() => generatePageNumbers(currentPage, data.meta.totalPages));

	function generatePageNumbers(current: number, total: number): (number | string)[] {
		const pages = new Set([1, 2, current - 1, current, current + 1, total - 1, total]);
		return Array.from(pages)
			.filter((page) => page > 0 && page <= total)
			.sort((a, b) => a - b)
			.reduce<(number | string)[]>((acc, page, index, array) => {
				if (index > 0 && page - array[index - 1] > 1) {
					acc.push('...');
				}
				acc.push(page);
				return acc;
			}, []);
	}
</script>

<svelte:head>
	<title>Brads Spelcafé</title>
</svelte:head>

<main class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Brads Spelcafé Game Catalogue</h1>

	<div class="flex flex-col md:flex-row gap-8">
		<aside class="w-full md:w-1/4">
			<GameFilter allCategories={data.allCategories} />
		</aside>

		<div class="w-full md:w-3/4">
			<BoardGameGrid games={data.games} />

			<div class="flex justify-center items-center space-x-2 mt-8">
				<button
					onclick={() => changePage(currentPage - 1)}
					class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
					disabled={currentPage === 1}
				>
					Previous
				</button>

				{#each pageNumbers as pageNum}
					{#if pageNum === '...'}
						<span class="px-2">...</span>
					{:else}
						<button
							onclick={() => changePage(Number.parseInt(pageNum))}
							class="px-4 py-2 rounded {currentPage === pageNum
								? 'bg-blue-500 text-white'
								: 'bg-gray-200'}"
						>
							{pageNum}
						</button>
					{/if}
				{/each}

				<button
					onclick={() => changePage(currentPage + 1)}
					class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
					disabled={currentPage === data.meta.totalPages}
				>
					Next
				</button>
			</div>
		</div>
	</div>
</main>
