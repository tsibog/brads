<script lang="ts">
	interface Game {
		id: string;
		name: string;
	}

	let {
		experienceFilter = $bindable(),
		vibeFilter = $bindable(),
		dayFilter = $bindable(),
		gameFilter = $bindable(),
		availableGames,
		onFilterChange
	}: {
		experienceFilter: string;
		vibeFilter: string;
		dayFilter: string;
		gameFilter: string;
		availableGames: Game[];
		onFilterChange: () => Promise<void>;
	} = $props();

	console.log('ag', availableGames);

	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
</script>

<div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
	<div>
		<label for="experience-filter" class="block text-xs font-medium text-gray-700">Experience</label
		>
		<select
			id="experience-filter"
			bind:value={experienceFilter}
			onchange={onFilterChange}
			class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
		>
			<option value="all">All Levels</option>
			<option value="beginner">Beginner</option>
			<option value="intermediate">Intermediate</option>
			<option value="advanced">Advanced</option>
		</select>
	</div>

	<div>
		<label for="vibe-filter" class="block text-xs font-medium text-gray-700">Play Style</label>
		<select
			id="vibe-filter"
			bind:value={vibeFilter}
			onchange={onFilterChange}
			class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
		>
			<option value="all">All Styles</option>
			<option value="casual">Casual</option>
			<option value="competitive">Competitive</option>
			<option value="both">Flexible</option>
		</select>
	</div>

	<div>
		<label for="day-filter" class="block text-xs font-medium text-gray-700">Available Day</label>
		<select
			id="day-filter"
			bind:value={dayFilter}
			onchange={onFilterChange}
			class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
		>
			<option value="all">Any Day</option>
			{#each daysOfWeek as day, index}
				<option value={index} disabled={index === 0 || index === 1}>{day}</option>
			{/each}
		</select>
	</div>

	<div>
		<label for="game-filter" class="block text-xs font-medium text-gray-700">Preferred Game</label>
		<select
			id="game-filter"
			bind:value={gameFilter}
			onchange={onFilterChange}
			class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
		>
			<option value="all">Any Game</option>
			{#each availableGames as game}
				<option value={game.id}>{game.name}</option>
			{/each}
		</select>
	</div>
</div>
