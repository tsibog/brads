<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import PartyFinderSettings from '$lib/components/PartyFinderSettings.svelte';
	import PartyFinderFilters from '$lib/components/PartyFinderFilters.svelte';
	import PartyFinderPagination from '$lib/components/PartyFinderPagination.svelte';
	import PartyFinderStatusWarnings from '$lib/components/PartyFinderStatusWarnings.svelte';
	import PlayerDiscoveryTable from '$lib/components/PlayerDiscoveryTable.svelte';

	let { data, form }: { data: any; form: any } = $props();

	let experience = $state(data.currentFilters.experience);
	let playStyle = $state(data.currentFilters.playStyle);
	let day = $state(data.currentFilters.day);
	let game = $state(data.currentFilters.game);

	function applyFilters() {
		const params = new URLSearchParams();
		if (experience !== 'all') params.set('experience', experience);
		if (playStyle !== 'all') params.set('playStyle', playStyle);
		if (day !== 'all') params.set('availability_day', day);
		if (game !== 'all') params.set('game_preference', game);
		goto(`/party-finder?${params.toString()}`, { replaceState: true });
	}

	function handlePageChange(newPage: number) {
		const params = new URLSearchParams($page.url.searchParams);
		params.set('page', newPage.toString());
		goto(`/party-finder?${params.toString()}`, { replaceState: true });
	}
</script>

<svelte:head>
	<title>Party Finder - Brads Spelcafe</title>
</svelte:head>

<div class="min-h-screen bg-brads-yellow-light">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<!-- Header -->
		<div class="mb-6">
			<h1 class="text-4xl font-londrina text-brads-green-dark">Party Finder</h1>
			<p class="text-lg font-londrina text-brads-green-dark/60 mt-1">
				Find people to play board games with at the cafe
			</p>
		</div>

		<PartyFinderStatusWarnings
			lookingForParty={data.currentUser.looking_for_party}
			partyStatus={data.currentUser.party_status}
		/>

		<div class="mt-6 grid grid-cols-1 lg:grid-cols-4 gap-6">
			<!-- Sidebar -->
			<div class="lg:col-span-1">
				<PartyFinderSettings
					lookingForParty={data.currentUser.looking_for_party ?? false}
					openToAnyGame={data.currentUser.open_to_any_game ?? false}
					selectedDays={data.currentUser.availability.map((a: any) => a.dayOfWeek)}
					selectedGames={data.currentUser.gamePreferences.map((g: any) => ({
						bggId: g.gameBggId,
						name: g.name,
						thumbnail: g.thumbnail
					}))}
					{form}
				/>
			</div>

			<!-- Main content -->
			<div class="lg:col-span-3">
				<!-- Stats bar -->
				<div class="bg-white rounded-xl shadow border border-brads-green-light/20 px-5 py-3 mb-4 flex items-center justify-between">
					<div class="text-sm text-gray-500">
						<span class="font-medium text-brads-green-dark">
							{data.paginatedPlayers.meta.totalCount}
						</span>
						active player{data.paginatedPlayers.meta.totalCount !== 1 ? 's' : ''}
						{#if data.paginatedPlayers.meta.averageCompatibility > 0}
							&middot;
							<span class="font-medium text-brads-green-dark">
								{data.paginatedPlayers.meta.averageCompatibility}%
							</span>
							avg compatibility
						{/if}
					</div>
				</div>

				<!-- Filters -->
				<div class="mb-4">
					<PartyFinderFilters
						bind:experience
						bind:playStyle
						bind:day
						bind:game
						availableGames={data.availableGames}
						onFilterChange={applyFilters}
					/>
				</div>

				<!-- Player list -->
				<PlayerDiscoveryTable
					players={data.paginatedPlayers.data}
					currentUser={data.currentUser}
					currentUserGamePreferences={data.currentUser.gamePreferences.map((g: any) => g.gameBggId)}
				/>

				<!-- Pagination -->
				<PartyFinderPagination
					currentPage={data.paginatedPlayers.meta.page}
					totalPages={data.paginatedPlayers.meta.totalPages}
					totalCount={data.paginatedPlayers.meta.totalCount}
					onPageChange={handlePageChange}
				/>
			</div>
		</div>
	</div>
</div>
