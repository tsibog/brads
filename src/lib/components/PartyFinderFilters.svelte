<script lang="ts">
	interface Props {
		experience: string;
		playStyle: string;
		day: string;
		game: string;
		availableGames: Array<{ id: string; name: string }>;
		onFilterChange: () => void;
	}

	let { experience = $bindable('all'), playStyle = $bindable('all'), day = $bindable('all'), game = $bindable('all'), availableGames, onFilterChange }: Props = $props();

	const dayLabels: Record<string, string> = {
		'0': 'Sunday',
		'2': 'Tuesday',
		'3': 'Wednesday',
		'4': 'Thursday',
		'5': 'Friday',
		'6': 'Saturday'
	};
</script>

<div class="flex flex-wrap gap-3">
	<select
		bind:value={experience}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Experience</option>
		<option value="new">New to board games</option>
		<option value="some_experience">Some experience</option>
		<option value="experienced">Experienced</option>
	</select>

	<select
		bind:value={playStyle}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Play Styles</option>
		<option value="casual">Casual</option>
		<option value="competitive">Competitive</option>
		<option value="either">Either</option>
	</select>

	<select
		bind:value={day}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Days</option>
		{#each Object.entries(dayLabels) as [value, label]}
			<option {value}>{label}</option>
		{/each}
	</select>

	{#if availableGames.length > 0}
		<select
			bind:value={game}
			onchange={onFilterChange}
			class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
		>
			<option value="all">All Games</option>
			{#each availableGames as g}
				<option value={g.id}>{g.name}</option>
			{/each}
		</select>
	{/if}
</div>
