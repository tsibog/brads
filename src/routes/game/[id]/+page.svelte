<!-- src/routes/game/[id]/+page.svelte -->
<script lang="ts">
	import type { BoardGame } from '$lib/server/db/schema';
	import { slide } from 'svelte/transition';

	type PageProps = {
		data: {
			game: BoardGame;
			similarGames: BoardGame[];
		};
	};

	const { data }: PageProps = $props();

	let game = $derived(data.game);
	let isDescriptionExpanded = $state(false);
	let areCategoriesExpanded = $state(false);
	let areMechanicsExpanded = $state(false);

	const categories = $derived.by(() => {
		return cleanArray(game.categories);
	});
	const mechanics = $derived.by(() => {
		return cleanArray(game.mechanics);
	});
	const designers = $derived.by(() => {
		return cleanArray(game.designers);
	});

	function toggleDescription() {
		isDescriptionExpanded = !isDescriptionExpanded;
	}

	function toggleCategories() {
		areCategoriesExpanded = !areCategoriesExpanded;
	}

	function toggleMechanics() {
		areMechanicsExpanded = !areMechanicsExpanded;
	}

	function cleanArray(str: string | null): string[] {
		if (typeof str !== 'string') return [];
		return str
			.replace(/^\[|\]$/g, '')
			.split(',')
			.map((item) => item.trim().replace(/^"|"$/g, ''));
	}
</script>

<svelte:head>
	<title>{game.name} - Board Game Details</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-6xl">
	<a href="/" class="text-teal-500 hover:text-teal-700 mb-4 inline-block font-bold"
		>&larr; Back to Game List</a
	>

	<div
		class="bg-gradient-to-br from-brads-green-dark to-brads-yellow-light shadow-2xl rounded-3xl overflow-hidden text-white"
	>
		<div class="relative h-96">
			{#if game.image}
				<img src={game.image} alt={game.name} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full bg-gray-300 flex items-center justify-center">
					No image available
				</div>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
		</div>

		<div class="p-8">
			<h2 class="text-4xl font-extrabold leading-tight mb-2">{game.name}</h2>
			<p class="text-xl mb-6">{game.yearPublished ?? 'Year unknown'}</p>

			<div class="grid grid-cols-2 sm:grid-cols-3 gap-6 text-lg mb-8">
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">
						{game.minPlayers ?? '?'} - {game.maxPlayers ?? '?'}
					</p>
					<p class="text-sm uppercase tracking-wide">Players</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">{game.playingTime ?? '?'} min</p>
					<p class="text-sm uppercase tracking-wide">Play Time</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="font-semibold text-2xl">{game.age ? `${game.age}+` : 'Any'}</p>
					<p class="text-sm uppercase tracking-wide">Age</p>
				</div>
			</div>

			<div class="space-y-6">
				{#if categories && categories.length > 0}
					<div>
						<button onclick={toggleCategories} class="text-xl font-semibold mb-2 flex items-center">
							Categories
							<svg
								class="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areCategoriesExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2">
							{#each categories.slice(0, areCategoriesExpanded ? undefined : 3) as category}
								<span class="bg-teal-700 px-3 py-1 rounded-full text-sm">{category}</span>
							{/each}
							{#if !areCategoriesExpanded && categories.length > 3}
								<button
									class="bg-teal-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleCategories}>+{categories.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if mechanics && mechanics.length > 0}
					<div>
						<button onclick={toggleMechanics} class="text-xl font-semibold mb-2 flex items-center">
							Mechanics
							<svg
								class="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areMechanicsExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2">
							{#each mechanics.slice(0, areMechanicsExpanded ? undefined : 3) as mechanic}
								<span class="bg-blue-700 px-3 py-1 rounded-full text-sm">{mechanic}</span>
							{/each}
							{#if !areMechanicsExpanded && mechanics.length > 3}
								<button
									class="bg-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleMechanics}>+{mechanics.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if designers && designers.length > 0}
					<div>
						<h2 class="text-xl font-semibold mb-2">Designers</h2>
						<div>{designers}</div>
					</div>
				{/if}
			</div>
		</div>

		{#if game.description}
			<div class="px-8 py-6 bg-white/10">
				<button
					onclick={toggleDescription}
					class="text-white bg-teal-600 hover:bg-teal-700 font-bold py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
				>
					{isDescriptionExpanded ? 'Hide Description' : 'Show Description'}
				</button>

				{#if isDescriptionExpanded}
					<div transition:slide={{ duration: 300 }} class="mt-4 text-black/90 leading-relaxed">
						{@html game.description}
					</div>
				{/if}
			</div>
		{/if}

		{#if game.isStarred}
			<div class="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
				<p class="font-bold">Staff Favorite</p>
			</div>
		{/if}

		{#if game.adminNote}
			<div class="bg-gray-100 p-4 mb-4 rounded">
				<h3 class="font-bold text-lg mb-2">Admin Note:</h3>
				<p>{game.adminNote}</p>
			</div>
		{/if}
	</div>

	{#if data.similarGames.length > 0}
		<div class="mt-8">
			<h2 class="text-2xl font-bold mb-4">Similar Games</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each data.similarGames as similarGame}
					<a href={`/game/${similarGame.bggId}`} class="block">
						<div class="bg-white rounded-lg shadow-md overflow-hidden">
							<img
								src={similarGame.thumbnail}
								alt={similarGame.name}
								class="w-full h-48 object-cover"
							/>
							<div class="p-4">
								<h3 class="font-bold text-lg mb-2">{similarGame.name}</h3>
								<p class="text-sm text-gray-600">
									{similarGame.minPlayers}-{similarGame.maxPlayers} players
								</p>
								<p class="text-sm text-gray-600">{similarGame.playingTime} min</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		background-color: #f0f4f8;
	}
</style>
