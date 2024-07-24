<script lang="ts">
	let { game }: { game: any } = $props();
</script>

<div class="bg-white shadow-lg rounded-lg overflow-hidden max-w-md mx-auto">
	<div class="relative pb-2/3">
		<img src={game.image} alt={game.name} class="h-full w-full object-cover" />
	</div>
	<div class="p-6">
		<h2 class="text-2xl font-bold text-gray-800 mb-2">{game.name}</h2>
		<div class="space-y-2">
			<p class="text-gray-600">
				<span class="font-semibold">Year:</span>
				{game.yearPublished || 'N/A'}
			</p>
			<p class="text-gray-600">
				<span class="font-semibold">Players:</span>
				{game.minPlayers || '?'} - {game.maxPlayers || '?'}
			</p>
			<p class="text-gray-600">
				<span class="font-semibold">Playing Time:</span>
				{game.playingTime ? `${game.playingTime} minutes` : 'N/A'}
			</p>
		</div>
	</div>
</div>
