<script lang="ts">
	const {
		currentSort,
		currentOrder,
		onsort
	}: {
		currentSort: string;
		currentOrder: 'asc' | 'desc';
		onsort: (value: string, order: 'asc' | 'desc') => void;
	} = $props();

	let isOpen = $state(false);

	const sortOptions = [
		{ value: 'name', label: 'Name' },
		{ value: 'yearPublished', label: 'Year' },
		{ value: 'playingTime', label: 'Play Time' },
		{ value: 'minPlayers', label: 'Min Players' },
		{ value: 'adminNote', label: 'Admin Note' }
	];

	function toggleDropdown() {
		isOpen = !isOpen;
	}

	function selectOption(value: string) {
		onsort(value, currentOrder);
		isOpen = false;
	}

	function toggleOrder() {
		const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
		onsort(currentSort, newOrder);
	}
</script>

<div class="relative inline-block text-left">
	<div class="flex items-center">
		<button
			type="button"
			onclick={toggleDropdown}
			class="inline-flex justify-center rounded-l-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brads-green-dark"
		>
			Sort by: {sortOptions.find((option) => option.value === currentSort)?.label}
			<svg
				class="-mr-1 ml-2 h-5 w-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 20 20"
				fill="currentColor"
				aria-hidden="true"
			>
				<path
					fill-rule="evenodd"
					d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
					clip-rule="evenodd"
				/>
			</svg>
		</button>
		<button
			type="button"
			onclick={toggleOrder}
			class="inline-flex items-center justify-center rounded-r-md border border-l-0 border-gray-300 shadow-sm px-2 py-2 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brads-green-dark"
		>
			{#if currentOrder === 'asc'}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{:else}
				<svg
					xmlns="http://www.w3.org/2000/svg"
					class="h-5 w-5"
					viewBox="0 0 20 20"
					fill="currentColor"
				>
					<path
						fill-rule="evenodd"
						d="M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 012 0v11.586l4.293-4.293a1 1 0 011.414 0z"
						clip-rule="evenodd"
					/>
				</svg>
			{/if}
		</button>
	</div>

	{#if isOpen}
		<div
			class="origin-top-left absolute left-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
			role="menu"
			aria-orientation="vertical"
			aria-labelledby="options-menu"
		>
			<div class="py-1" role="none">
				{#each sortOptions as option}
					<button
						onclick={() => selectOption(option.value)}
						class="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
						role="menuitem"
					>
						{option.label}
					</button>
				{/each}
			</div>
		</div>
	{/if}
</div>
