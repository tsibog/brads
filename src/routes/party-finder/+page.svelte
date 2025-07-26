<script lang="ts">
	import type { PageData, ActionData } from './$types';
	import type { SubmitFunction } from '@sveltejs/kit';
	import PlayerDiscoveryTable from '$lib/components/PlayerDiscoveryTable.svelte';
	import PartyFinderAlert from '$lib/components/PartyFinderAlert.svelte';
	import PartyFinderStatusWarnings from '$lib/components/PartyFinderStatusWarnings.svelte';
	import PartyFinderSettings from '$lib/components/PartyFinderSettings.svelte';
	import PartyFinderFilters from '$lib/components/PartyFinderFilters.svelte';
	import PartyFinderPagination from '$lib/components/PartyFinderPagination.svelte';
	import { page } from '$app/state';
	import { goto } from '$app/navigation';

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

	// Filters for player discovery - initialize from server data
	let experienceFilter = $state(data.currentFilters.experience);
	let vibeFilter = $state(data.currentFilters.vibe);
	let dayFilter = $state(data.currentFilters.day);
	let gameFilter = $state(data.currentFilters.game);

	// Pagination logic
	const currentPage = $derived.by(() => {
		return data.paginatedPlayers.meta.page;
	});

	async function changePage(newPage: number) {
		if (newPage === currentPage) return;

		const url = new URL(page.url);
		url.searchParams.set('page', newPage.toString());
		await goto(url.toString(), { replaceState: true, keepFocus: true });
	}

	async function updateFilters() {
		const url = new URL(page.url);

		// Reset to page 1 when filters change
		url.searchParams.set('page', '1');

		// Update filter parameters
		if (experienceFilter !== 'all') {
			url.searchParams.set('experience', experienceFilter);
		} else {
			url.searchParams.delete('experience');
		}

		if (vibeFilter !== 'all') {
			url.searchParams.set('vibe', vibeFilter);
		} else {
			url.searchParams.delete('vibe');
		}

		if (dayFilter !== 'all') {
			url.searchParams.set('availability_day', dayFilter);
		} else {
			url.searchParams.delete('availability_day');
		}

		if (gameFilter !== 'all') {
			url.searchParams.set('game_preference', gameFilter);
		} else {
			url.searchParams.delete('game_preference');
		}

		await goto(url.toString(), { replaceState: true, keepFocus: true });
	}
</script>

<svelte:head>
	<title>Party Finder - Brads Spelcafé</title>
</svelte:head>

<main class="container mx-auto px-2 sm:px-4 py-8">
	<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Party Finder</h1>

	<!-- Success/Error Messages -->
	<PartyFinderAlert {form} />

	<div class="flex flex-col md:flex-row gap-8">
		<!-- Sidebar with Settings -->
		<PartyFinderSettings
			currentUser={data.currentUser}
			bind:selectedDays
			bind:selectedGames
			{isUpdating}
			onSubmit={handleSubmit}
		/>

		<!-- Main Content Area -->
		<div class="w-full md:w-3/4">
			<div class="space-y-6">
				<!-- Party Finder Status Check -->
				<PartyFinderStatusWarnings currentUser={data.currentUser} />

				<!-- Player Discovery Section -->
				<div class="bg-white shadow rounded-lg">
					<div class="px-6 py-4 border-b border-gray-200">
						<div>
							<h2 class="text-lg font-medium text-gray-900">Active Players</h2>
							<p class="text-sm text-gray-500">Players currently looking for gaming partners</p>
						</div>

						<!-- Filters -->
						<PartyFinderFilters
							bind:experienceFilter
							bind:vibeFilter
							bind:dayFilter
							bind:gameFilter
							availableGames={data.availableGames}
							onFilterChange={updateFilters}
						/>
					</div>

					<div class="px-6 py-4">
						<PlayerDiscoveryTable
							players={data.paginatedPlayers.data}
							currentUser={data.currentUser}
							userGamePreferences={selectedGames}
							userAvailability={selectedDays}
						/>
					</div>

					<!-- Pagination Controls -->
					<PartyFinderPagination
						meta={data.paginatedPlayers.meta}
						currentCount={data.paginatedPlayers.data.length}
						onPageChange={changePage}
					/>
				</div>
			</div>
		</div>
	</div>
</main>
