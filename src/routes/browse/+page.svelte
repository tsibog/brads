<script lang="ts">
	import BoardGameGrid from '$lib/components/BoardGameGrid.svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/db/schema';

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

	let currentPage = $state(parseInt($page.url.searchParams.get('page') || '1'));
	let gamesPerPage = $state(parseInt($page.url.searchParams.get('limit') || '20'));
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

	<div class="mb-6 flex flex-row gap-3">
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search for a board game..."
			class="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
		/>
		<button onclick={handleSearch} class="px-4 bg-blue-500 text-white rounded"> Search </button>
	</div>

	<BoardGameGrid games={data.games} />

	<div class="flex justify-center items-center space-x-2 mt-4">
		<button
			onclick={() => changePage(currentPage - 1)}
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
			disabled={currentPage === 1}
		>
			Previous
		</button>
		{#each Array(data.meta.totalPages) as _, i}
			<button
				onclick={() => changePage(i + 1)}
				class="px-4 py-2 rounded {currentPage === i + 1 ? 'bg-blue-500 text-white' : 'bg-gray-200'}"
			>
				{i + 1}
			</button>
		{/each}
		<button
			onclick={() => changePage(currentPage + 1)}
			class="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-300"
			disabled={currentPage === data.meta.totalPages}
		>
			Next
		</button>
	</div>
</main>
