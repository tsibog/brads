<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import type { Player, GamePreference } from '$lib/server/db/schema';
	import DaySelector from '$lib/components/DaySelector.svelte';
	import GameSelector from '$lib/components/GameSelector.svelte';
	import PlayerDiscoveryTable from '$lib/components/PlayerDiscoveryTable.svelte';

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	let isUpdating = $state(false);

	const handleSubmit: SubmitFunction = () => {
		isUpdating = true;
		return async ({ update }) => {
			await update({ reset: false });
			isUpdating = false;
		};
	};

	// Convert user availability to day format (0-6, Sunday=0)
	let selectedDays = $state(data.userAvailability.map((a) => a.dayOfWeek));

	// User's current game preferences
	let selectedGames = $state([...data.userGamePreferences]);

	// Filters for player discovery
	let experienceFilter = $state('all');
	let vibeFilter = $state('all');
	let dayFilter = $state('all');
	let gameFilter = $state('all');

	// Filter active players based on current filters
	const filteredPlayers = $derived.by(() => {
		let filtered: Player[] = data.activePlayers;

		// Experience level filter
		if (experienceFilter !== 'all') {
			filtered = filtered.filter((p: Player) => p.experienceLevel === experienceFilter);
		}

		// Vibe preference filter
		if (vibeFilter !== 'all') {
			filtered = filtered.filter(
				(p: Player) => p.vibePreference === vibeFilter || p.vibePreference === 'both'
			);
		}

		// Day availability filter
		if (dayFilter !== 'all') {
			const filterDay = parseInt(dayFilter);
			filtered = filtered.filter((p: Player) =>
				p.availability.some((a: { dayOfWeek: number }) => a.dayOfWeek === filterDay)
			);
		}

		// Game preference filter
		if (gameFilter !== 'all') {
			filtered = filtered.filter(
				(p: Player) =>
					p.openToAnyGame ||
					p.gamePreferences.some((g: GamePreference) => g.gameBggId === gameFilter)
			);
		}

		return filtered;
	});

	// Days of the week for display
	const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

	// Get unique games from all players for filter dropdown
	const availableGames = $derived.by(() => {
		const gameMap = new Map<string, string>();
		data.activePlayers.forEach((player: Player) => {
			player.gamePreferences.forEach((game: GamePreference) => {
				gameMap.set(game.gameBggId, game.name);
			});
		});
		return Array.from(gameMap.entries()).map(([id, name]) => ({ id, name }));
	});
</script>

<svelte:head>
	<title>Party Finder - Brads Spelcafé</title>
</svelte:head>

<main class="container mx-auto px-2 sm:px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Party Finder</h1>

	<!-- Success/Error Messages -->
	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
			<div class="flex">
				<div class="text-sm text-green-700">
					{form.message}
				</div>
			</div>
		</div>
	{/if}

	{#if form?.message && !form?.success}
		<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
			<div class="flex">
				<div class="text-sm text-red-700">
					{form.message}
				</div>
			</div>
		</div>
	{/if}

	<div class="flex flex-col md:flex-row gap-8">
		<!-- Sidebar with Settings -->
		<aside class="w-full md:w-1/4">
			<form method="POST" action="?/updateSettings" use:enhance={handleSubmit}>
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
						<DaySelector bind:selectedDays userId={data.currentUser.id} />
					</div>

					<!-- Your Game Preferences -->
					<div class="px-4 py-4 border-b border-gray-100">
						<h3 class="text-base font-medium text-gray-900 mb-2">Your Game Preferences</h3>
						<p class="text-xs text-gray-500 mb-3">Choose games you'd like to play</p>
						<GameSelector bind:selectedGames userId={data.currentUser.id} />
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
									bind:checked={data.currentUser.lookingForParty}
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
									bind:checked={data.currentUser.openToAnyGame}
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
								Save All Party Finder Settings
							{/if}
						</button>
					</div>
				</div>
			</form>
		</aside>

		<!-- Main Content Area -->
		<div class="w-full md:w-3/4">
			<div class="space-y-6">
				<!-- Party Finder Status Check -->
				{#if !data.currentUser.lookingForParty}
					<div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-yellow-800">
									You're not currently looking for players
								</h3>
								<div class="mt-2 text-sm text-yellow-700">
									<p>
										To appear in other players' searches and see contact information, enable
										"Looking for Party" in the sidebar settings on this page.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				{#if data.currentUser.partyStatus === 'resting'}
					<div class="bg-blue-50 border border-blue-200 rounded-md p-4">
						<div class="flex">
							<div class="flex-shrink-0">
								<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
									<path
										fill-rule="evenodd"
										d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
										clip-rule="evenodd"
									/>
								</svg>
							</div>
							<div class="ml-3">
								<h3 class="text-sm font-medium text-blue-800">You're currently resting</h3>
								<div class="mt-2 text-sm text-blue-700">
									<p>
										You won't appear in other players' searches while resting. Your status will
										automatically become active when you log in after being inactive.
									</p>
								</div>
							</div>
						</div>
					</div>
				{/if}

				<!-- Player Discovery Section -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<div class="flex justify-between items-center">
							<div>
								<h2 class="text-lg font-medium text-gray-900">Active Players</h2>
								<p class="text-sm text-gray-500">Players currently looking for gaming partners</p>
							</div>
							<div class="text-sm text-gray-500">
								{filteredPlayers.length} of {data.activePlayers.length} players
							</div>
						</div>

						<!-- Filters -->
						<div class="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
							<div>
								<label for="experience-filter" class="block text-xs font-medium text-gray-700"
									>Experience</label
								>
								<select
									id="experience-filter"
									bind:value={experienceFilter}
									class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="all">All Levels</option>
									<option value="beginner">Beginner</option>
									<option value="intermediate">Intermediate</option>
									<option value="advanced">Advanced</option>
								</select>
							</div>

							<div>
								<label for="vibe-filter" class="block text-xs font-medium text-gray-700"
									>Play Style</label
								>
								<select
									id="vibe-filter"
									bind:value={vibeFilter}
									class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="all">All Styles</option>
									<option value="casual">Casual</option>
									<option value="competitive">Competitive</option>
									<option value="both">Flexible</option>
								</select>
							</div>

							<div>
								<label for="day-filter" class="block text-xs font-medium text-gray-700"
									>Available Day</label
								>
								<select
									id="day-filter"
									bind:value={dayFilter}
									class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="all">Any Day</option>
									{#each daysOfWeek as day, index}
										<option value={index} disabled={index === 0 || index === 1}>{day}</option>
									{/each}
								</select>
							</div>

							<div>
								<label for="game-filter" class="block text-xs font-medium text-gray-700"
									>Preferred Game</label
								>
								<select
									id="game-filter"
									bind:value={gameFilter}
									class="mt-1 block w-full text-sm border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
								>
									<option value="all">Any Game</option>
									{#each availableGames as game}
										<option value={game.id}>{game.name}</option>
									{/each}
								</select>
							</div>
						</div>
					</div>

					<div class="px-6 py-4">
						<PlayerDiscoveryTable
							players={filteredPlayers}
							currentUser={data.currentUser}
							userGamePreferences={selectedGames}
							userAvailability={selectedDays}
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</main>
