<script lang="ts">
	import { flip } from 'svelte/animate';
	import { fly } from 'svelte/transition';
	import type { BoardGame } from '$lib/server/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

{#snippet gameCard(game)}
	<div class="relative block overflow-hidden rounded-lg shadow-lg aspect-[3/4] group">
		<img
			class="w-full h-full object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
			src={game.image}
			alt={game.name}
		/>
		<div class="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
		{#if game.adminNote}
			<div
				class="absolute top-2 right-0 bg-yellow-400 text-brads-green-dark text-xs font-bold px-2 py-1 rounded-tl-lg rounded-bl-lg"
			>
				{game.adminNote}
			</div>
		{/if}
		{#if game.isStarred}
			<div class="absolute top-2 left-2 text-yellow-400">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					viewBox="0 0 24 24"
					fill="currentColor"
					class="w-6 h-6"
				>
					<path
						fill-rule="evenodd"
						d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
						clip-rule="evenodd"
					/>
				</svg>
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
		<a
			href={`/admin/edit/${game.bggId}`}
			class="absolute top-2 left-2 bg-blue-500 text-white px-2 py-1 rounded text-sm"
		>
			Edit
		</a>
	</div>
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
