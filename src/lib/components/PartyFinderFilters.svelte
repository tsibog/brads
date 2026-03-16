<script lang="ts">
	import { VALID_DAYS, DAY_LABELS_FULL, EXPERIENCE_LABELS, PLAY_STYLE_LABELS } from '$lib/partyFinderConstants';

	interface Props {
		experience: string;
		playStyle: string;
		day: string;
		game: string;
		availableGames: Array<{ id: string; name: string }>;
		onFilterChange: () => void;
	}

	let { experience = $bindable('all'), playStyle = $bindable('all'), day = $bindable('all'), game = $bindable('all'), availableGames, onFilterChange }: Props = $props();

	const dayOptions = VALID_DAYS.map((d) => ({ value: String(d), label: DAY_LABELS_FULL[d] }));
</script>

<div class="flex flex-wrap gap-3">
	<select
		bind:value={experience}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Experience</option>
		{#each Object.entries(EXPERIENCE_LABELS) as [value, label]}
			<option {value}>{label}</option>
		{/each}
	</select>

	<select
		bind:value={playStyle}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Play Styles</option>
		{#each Object.entries(PLAY_STYLE_LABELS) as [value, label]}
			<option {value}>{label}</option>
		{/each}
	</select>

	<select
		bind:value={day}
		onchange={onFilterChange}
		class="border border-gray-300 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
	>
		<option value="all">All Days</option>
		{#each dayOptions as opt}
			<option value={opt.value}>{opt.label}</option>
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
