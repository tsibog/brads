<script lang="ts">
	import type { BoardGame } from '$lib/server/db/schema';

	let {
		games,
		currentSort,
		currentOrder,
		onSort
	}: {
		games: BoardGame[];
		currentSort: string;
		currentOrder: 'asc' | 'desc';
		onSort: (sortBy: string, sortOrder: 'asc' | 'desc') => void;
	} = $props();

	const columns = [
		{ key: 'name', label: 'Name' },
		{ key: 'players', label: 'Players' },
		{ key: 'playingTime', label: 'Play Time' },
		{ key: 'yearPublished', label: 'Year' },
		{ key: 'adminNote', label: 'Admin Note' }
	];

	function handleSort(column: string) {
		if (column === currentSort) {
			onSort(column, currentOrder === 'asc' ? 'desc' : 'asc');
		} else {
			onSort(column, 'asc');
		}
	}

	function getSortIcon(column: string) {
		if (column !== currentSort) return '⋮';
		return currentOrder === 'asc' ? '▲' : '▼';
	}
</script>

<div class="overflow-x-auto shadow-md rounded-lg">
	<table class="w-full text-lg text-left text-gray-700">
		<thead class="text-xs text-gray-800 uppercase bg-brads-yellow-light">
			<tr>
				{#each columns as column}
					<th
						scope="col"
						class="px-6 py-3 cursor-pointer hover:bg-brads-yellow-light/80"
						onclick={() => handleSort(column.key)}
					>
						<div class="flex items-center justify-between">
							<span>{column.label}</span>
							<span class="w-4 inline-block text-center">{getSortIcon(column.key)}</span>
						</div>
					</th>
				{/each}
			</tr>
		</thead>
		<tbody>
			{#each games as game, index}
				<tr
					class="border-b {index % 2 === 0
						? 'bg-white'
						: 'bg-gray-50'} hover:bg-brads-yellow-light/30 transition-colors"
				>
					<th scope="row" class="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">
						<a href={`/game/${game.bggId}`} class="hover:text-brads-green-dark">
							{game.name}
						</a>
					</th>
					<td class="px-6 py-4">{game.minPlayers} - {game.maxPlayers}</td>
					<td class="px-6 py-4">{game.playingTime} min</td>
					<td class="px-6 py-4">{game.yearPublished}</td>
					<td class="px-6 py-4">
						{#if game.adminNote}
							<a
							href={`/admin/edit/${game.bggId}`}
								class="bg-yellow-100 text-yellow-800 font-medium mr-2 px-2.5 py-0.5 rounded"
							>
								{game.adminNote}
							</a>
						{:else}
							<a href={`/admin/edit/${game.bggId}`} class="text-blue-500">Add note</a>
						{/if}
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>

{#if games.length === 0}
	<p class="text-center text-gray-600 mt-4">No games found.</p>
{/if}
