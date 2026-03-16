<script lang="ts">
	interface Props {
		selectedDays: number[];
		onchange?: (days: number[]) => void;
		disabled?: boolean;
	}

	let { selectedDays = $bindable([]), onchange, disabled = false }: Props = $props();

	// Tue(2) through Sun(0) — cafe is closed Monday(1)
	const days = [
		{ value: 2, label: 'Tue' },
		{ value: 3, label: 'Wed' },
		{ value: 4, label: 'Thu' },
		{ value: 5, label: 'Fri' },
		{ value: 6, label: 'Sat' },
		{ value: 0, label: 'Sun' }
	];

	function toggleDay(day: number) {
		if (disabled) return;
		if (selectedDays.includes(day)) {
			selectedDays = selectedDays.filter((d) => d !== day);
		} else {
			selectedDays = [...selectedDays, day];
		}
		onchange?.(selectedDays);
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each days as day}
		<button
			type="button"
			onclick={() => toggleDay(day.value)}
			{disabled}
			class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
				{selectedDays.includes(day.value)
				? 'bg-brads-green-dark text-white'
				: 'bg-gray-100 text-gray-600 hover:bg-gray-200'}
				{disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}"
		>
			{day.label}
		</button>
	{/each}
</div>
