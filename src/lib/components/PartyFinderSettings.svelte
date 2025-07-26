<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DaySelector from '$lib/components/DaySelector.svelte';
	import GameSelector from '$lib/components/GameSelector.svelte';
	import type { Player } from '$lib/server/db/schema';

	let {
		currentUser,
		selectedDays = $bindable(),
		selectedGames = $bindable(),
		isUpdating,
		onSubmit
	}: {
		currentUser: Player;
		selectedDays: number[];
		selectedGames: any[];
		isUpdating: boolean;
		onSubmit: SubmitFunction;
	} = $props();
</script>

<aside class="w-full md:w-1/4">
	<form method="POST" action="?/updateSettings" use:enhance={onSubmit}>
		<!-- Hidden inputs to pass component data -->
		<input type="hidden" name="selected_days" value={JSON.stringify(selectedDays)} />
		<input
			type="hidden"
			name="selected_games"
			value={JSON.stringify(selectedGames.map((g) => g.gameBggId))}
		/>

		<!-- Unified Settings Panel -->
		<div class="bg-white shadow rounded-lg">
			<!-- Header -->
			<div class="px-4 py-3 border-b border-gray-200">
				<h2 class="text-lg font-medium text-gray-900">Party Finder Settings</h2>
				<p class="text-sm text-gray-500">Configure your availability and preferences</p>
			</div>

			<!-- Your Availability -->
			<div class="px-4 py-4 border-b border-gray-100">
				<h3 class="text-base font-medium text-gray-900 mb-2">Your Availability</h3>
				<p class="text-xs text-gray-500 mb-3">Select the days you're available to play</p>
				<DaySelector bind:selectedDays userId={currentUser.id} />
			</div>

			<!-- Your Game Preferences -->
			<div class="px-4 py-4 border-b border-gray-100">
				<h3 class="text-base font-medium text-gray-900 mb-2">Your Game Preferences</h3>
				<p class="text-xs text-gray-500 mb-3">Choose games you'd like to play</p>
				<GameSelector bind:selectedGames userId={currentUser.id} />
			</div>

			<!-- Party Finder Status -->
			<div class="px-4 py-4 border-b border-gray-100">
				<h3 class="text-base font-medium text-gray-900 mb-3">Visibility Settings</h3>
				<div class="space-y-3">
					<div class="flex items-center">
						<input
							id="looking_for_party"
							name="looking_for_party"
							type="checkbox"
							class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							bind:checked={currentUser.lookingForParty}
						/>
						<label for="looking_for_party" class="ml-2 block text-sm text-gray-900">
							I'm looking for players to game with
						</label>
					</div>

					<div class="flex items-center">
						<input
							id="open_to_any_game"
							name="open_to_any_game"
							type="checkbox"
							class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							bind:checked={currentUser.openToAnyGame}
						/>
						<label for="open_to_any_game" class="ml-2 block text-sm text-gray-900">
							I'm open to playing any game
						</label>
					</div>
				</div>
			</div>

			<!-- Save Button -->
			<div class="px-4 py-4">
				<button
					type="submit"
					disabled={isUpdating}
					class="w-full bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isUpdating}
						<svg
							class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Saving All Settings...
					{:else}
						Save settings
					{/if}
				</button>
			</div>
		</div>
	</form>
</aside>
