<script lang="ts">
	import type { PageData } from './$types';
	import type { Player, GamePreference } from '$lib/server/db/schema';
	import DaySelector from '$lib/components/DaySelector.svelte';
	import GameSelector from '$lib/components/GameSelector.svelte';
	import PlayerDiscoveryTable from '$lib/components/PlayerDiscoveryTable.svelte';

	let { data }: { data: PageData } = $props();

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
			filtered = filtered.filter((p: Player) => p.availability.some((a: { dayOfWeek: number }) => a.dayOfWeek === filterDay));
		}

		// Game preference filter
		if (gameFilter !== 'all') {
			filtered = filtered.filter(
				(p: Player) => p.openToAnyGame || p.gamePreferences.some((g: GamePreference) => g.gameBggId === gameFilter)
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

	<div class="flex flex-col md:flex-row gap-8">
		<!-- Sidebar with Settings -->
		<aside class="w-full md:w-1/4">
			<div class="space-y-6">
				<!-- Your Availability -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-4 py-3 border-b border-gray-200">
						<h2 class="text-base font-medium text-gray-900">Your Availability</h2>
						<p class="text-xs text-gray-500">Select the days you're available to play</p>
					</div>
					<div class="px-4 py-3">
						<DaySelector bind:selectedDays userId={data.currentUser.id} />
					</div>
				</div>

				<!-- Your Game Preferences -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-4 py-3 border-b border-gray-200">
						<h2 class="text-base font-medium text-gray-900">Your Game Preferences</h2>
						<p class="text-xs text-gray-500">Choose games you'd like to play</p>
					</div>
					<div class="px-4 py-3">
						<GameSelector bind:selectedGames userId={data.currentUser.id} />
					</div>
				</div>
			</div>
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
										"Looking for Party" in your <a href="/profile" class="font-medium underline"
											>profile settings</a
										>.
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
										You won't appear in other players' searches while resting. Change your status in
										your <a href="/profile" class="font-medium underline">profile settings</a>.
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
