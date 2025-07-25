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

	let isUpdating = $state(false);
	let updateMessage = $state('');

	function isDaySelected(dayValue: number): boolean {
		return selectedDays.includes(dayValue);
	}

	function toggleDay(dayValue: number) {
		if (isDaySelected(dayValue)) {
			selectedDays = selectedDays.filter(d => d !== dayValue);
		} else {
			selectedDays = [...selectedDays, dayValue];
		}
	}

	async function updateAvailability() {
		isUpdating = true;
		updateMessage = '';

		try {
			const response = await fetch('/api/party-finder/availability', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					userId,
					selectedDays
				})
			});

			const result = await response.json();

			if (response.ok) {
				updateMessage = 'Availability updated successfully!';
				setTimeout(() => {
					updateMessage = '';
				}, 3000);
			} else {
				updateMessage = result.error || 'Failed to update availability';
			}
		} catch (error) {
			updateMessage = 'Network error occurred';
		} finally {
			isUpdating = false;
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
					disabled={isUpdating}
					class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
				/>
				<span class="text-gray-700">{day.name.slice(0, 3)}</span>
			</label>
		{/each}
	</div>

	<!-- Update Button -->
	<div class="flex items-center justify-between">
		<button
			type="button"
			onclick={updateAvailability}
			disabled={isUpdating}
			class="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
		>
			{#if isUpdating}
				<svg class="animate-spin -ml-1 mr-1 h-3 w-3 text-white inline" fill="none" viewBox="0 0 24 24">
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
				</svg>
				Saving...
			{:else}
				Save
			{/if}
		</button>

		{#if updateMessage}
			<div class="text-xs {updateMessage.includes('success') ? 'text-green-600' : 'text-red-600'}">
				{updateMessage}
			</div>
		{/if}
	</div>
</div>