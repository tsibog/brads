<script lang="ts">
	interface Props {
		selectedDays: number[];
		userId: string;
	}

	let { selectedDays = $bindable(), userId }: Props = $props();

	const daysOfWeek = [
		// { name: 'Monday', value: 0 }, // CAFE CLOSED
		// { name: 'Tuesday', value: 1 }, // CAFE CLOSED
		{ name: 'Wednesday', value: 2 },
		{ name: 'Thursday', value: 3 },
		{ name: 'Friday', value: 4 },
		{ name: 'Saturday', value: 5 },
		{ name: 'Sunday', value: 6 }
	];

	function isDaySelected(dayValue: number): boolean {
		return selectedDays.includes(dayValue);
	}

	function toggleDay(dayValue: number) {
		if (isDaySelected(dayValue)) {
			selectedDays = selectedDays.filter((d) => d !== dayValue);
		} else {
			selectedDays = [...selectedDays, dayValue];
		}
	}
</script>

<div class="space-y-3">
	<!-- Day Selection Checkboxes -->
	<div class="flex flex-row gap-4">
		{#each daysOfWeek as day}
			<label class="flex items-center space-x-2 cursor-pointer">
				<input
					type="checkbox"
					checked={isDaySelected(day.value)}
					onchange={() => toggleDay(day.value)}
					class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
				/>
				<span class="text-gray-700">{day.name.slice(0, 3)}</span>
			</label>
		{/each}
	</div>
</div>
