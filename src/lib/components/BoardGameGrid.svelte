<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import type { BoardGame } from '$lib/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

{#snippet gameCard(game: BoardGame)}
	<a
		class="relative block overflow-hidden rounded-lg shadow-lg aspect-[3/4] group"
		href={`/game/${game.bggId}`}
	>
		<img
			class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
			src={game.image}
			alt={game.name}
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
		{#if game.adminNote}
			<div
				class="absolute {game.adminNote
					? 'top-2'
					: 'top-10'} right-0 bg-yellow-400 text-brads-green-dark text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg"
			>
				{game.adminNote}
			</div>
		{/if}
		{#if game.isStarred}
			<div
				class="absolute top-2 right-0 bg-brads-green text-white text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg border-l border-t border-b border-black"
			>
				⭐ Staff Pick!
			</div>
		{/if}
		<div class="absolute bottom-0 left-0 p-4 text-white">
			<h5 class="mb-1 text-xl font-bold tracking-tight">
				{game.name}
			</h5>
			<p class="text-sm flex flex-col">
				<span>
					Players: {game.minPlayers} - {game.maxPlayers}
				</span>
				<span>
					Play Time: {game.playingTime} min
				</span>
			</p>
		</div>
	</a>
{/snippet}

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
	{#each games as game (game.bggId)}
		<div animate:flip={{ duration: 300 }} transition:fly={{ y: 20, duration: 300 }}>
			{@render gameCard(game)}
		</div>
	{/each}
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600">No games found.</p>
{/if}
