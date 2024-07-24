<script lang="ts">
	import type { BoardGame } from '$lib/db/schema';

	let { games }: { games: BoardGame[] } = $props();
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
	{#each games as game}
		<a href={`/game/${game.bggId}`} class="hover:shadow-lg">
			<div class="bg-white p-4 rounded shadow">
				<img src={game.image} alt={game.name} class="w-full h-48 object-contain mb-2" />
				<h3 class="font-semibold text-sm mb-2">{game.name}</h3>
				<p class="text-sm text-gray-600">Players: {game.minPlayers} - {game.maxPlayers}</p>
				<p class="text-sm text-gray-600">Play Time: {game.playingTime} min</p>
			</div>
		</a>
	{/each}
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600">No games found.</p>
{/if}
