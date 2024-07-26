<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/db/schema';
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

	let currentPage = $state(parseInt($page.url.searchParams.get('page') || '1'));
	let gamesPerPage = $state(parseInt($page.url.searchParams.get('limit') || '20'));
	let minDuration = $state(parseInt($page.url.searchParams.get('minDuration') || '0'));
	let maxDuration = $state(parseInt($page.url.searchParams.get('maxDuration') || '0'));
	let minPlayers = $state(parseInt($page.url.searchParams.get('minPlayers') || '0'));
	let maxPlayers = $state(parseInt($page.url.searchParams.get('maxPlayers') || '0'));
	let selectedCategories = $state<string[]>(
		($page.url.searchParams.get('categories') || '').split(',')
	);

	let allCategories = $state<string[]>([]);
	let searchQuery = $state('');

	async function changePage(newPage: number) {
		const url = new URL($page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { keepFocus: true });
	}

	async function handleSearch() {
		const url = new URL($page.url);
		url.searchParams.set('name', searchQuery);
		url.searchParams.set('page', '1');
		await goto(url.toString());
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
				{#each Array(Math.min(5, data.meta.totalPages)) as _, i}
					{#if i + 1 <= 2 || i + 1 > data.meta.totalPages - 2 || i + 1 === currentPage}
						<button
							onclick={() => changePage(i + 1)}
							class="px-4 py-2 rounded {currentPage === i + 1
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
