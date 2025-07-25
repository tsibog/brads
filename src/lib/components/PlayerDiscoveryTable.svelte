<script lang="ts">
	import type {
		Player,
		GamePreference,
		ExtendedGamePreference,
		AppUser
	} from '$lib/server/db/schema';

	interface Props {
		players: Player[];
		currentUser: AppUser;
		userGamePreferences: ExtendedGamePreference[];
		userAvailability: number[];
	}

	let { players, currentUser, userGamePreferences, userAvailability }: Props = $props();

	const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

	// Calculate compatibility score between current user and another player
	function calculateCompatibilityScore(player: Player): number {
		let score = 0;
		let maxScore = 0;

		// Availability overlap (40% of score)
		maxScore += 40;
		const playerDays = player.availability.map((a) => a.dayOfWeek);
		const commonDays = userAvailability.filter((day) => playerDays.includes(day));
		score += (commonDays.length / Math.max(userAvailability.length, playerDays.length, 1)) * 40;

		// Game preferences overlap (40% of score)
		maxScore += 40;
		if (player.openToAnyGame || currentUser.openToAnyGame) {
			score += 40; // Perfect match if either is open to any game
		} else {
			const userGameIds = userGamePreferences.map((g) => g.gameBggId);
			const playerGameIds = player.gamePreferences.map((g) => g.gameBggId);
			const commonGames = userGameIds.filter((id) => playerGameIds.includes(id));
			if (userGameIds.length > 0 && playerGameIds.length > 0) {
				score += (commonGames.length / Math.max(userGameIds.length, playerGameIds.length, 1)) * 40;
			}
		}

		// Experience level compatibility (10% of score)
		maxScore += 10;
		if (currentUser.experienceLevel && player.experienceLevel) {
			if (currentUser.experienceLevel === player.experienceLevel) {
				score += 10;
			} else if (
				(currentUser.experienceLevel === 'intermediate' &&
					['beginner', 'advanced'].includes(player.experienceLevel)) ||
				(player.experienceLevel === 'intermediate' &&
					['beginner', 'advanced'].includes(currentUser.experienceLevel))
			) {
				score += 5; // Intermediate players are somewhat compatible with all levels
			}
		}

		// Vibe compatibility (10% of score)
		maxScore += 10;
		if (currentUser.vibePreference === 'both' || player.vibePreference === 'both') {
			score += 10;
		} else if (currentUser.vibePreference === player.vibePreference) {
			score += 10;
		} else {
			score += 2; // Small score for different but not incompatible vibes
		}

		return Math.round((score / maxScore) * 100);
	}

	// Get shared games between current user and player
	function getSharedGames(player: Player): GamePreference[] {
		const userGameIds = userGamePreferences.map((g) => g.gameBggId);
		return player.gamePreferences.filter((game) => userGameIds.includes(game.gameBggId));
	} // Get shared availability days
	function getSharedDays(player: Player): number[] {
		const playerDays = player.availability.map((a) => a.dayOfWeek);
		return userAvailability.filter((day) => playerDays.includes(day));
	}

	// Format last login for display
	function formatLastLogin(lastLogin: Date | null): string {
		if (!lastLogin) return 'Never';

		const now = new Date();
		const diffTime = Math.abs(now.getTime() - lastLogin.getTime());
		const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

		if (diffDays === 0) return 'Today';
		if (diffDays === 1) return 'Yesterday';
		if (diffDays < 7) return `${diffDays} days ago`;
		if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
		return `${Math.floor(diffDays / 30)} months ago`;
	}

	// Determine if contact info should be visible
	function canViewContact(player: Player): boolean {
		if (!currentUser.lookingForParty || currentUser.partyStatus !== 'active') {
			return false; // Current user must be active to see contacts
		}

		switch (player.contactVisibleTo) {
			case 'all':
				return true;
			case 'matches':
				return calculateCompatibilityScore(player) >= 50; // Show contact for good matches (50%+)
			case 'none':
			default:
				return false;
		}
	}

	// Sort players by compatibility score (highest first)
	const sortedPlayers = $derived(
		[...players].sort((a, b) => calculateCompatibilityScore(b) - calculateCompatibilityScore(a))
	);
</script>

{#if sortedPlayers.length === 0}
	<div class="text-center py-12">
		<svg
			class="mx-auto h-12 w-12 text-gray-400"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
			/>
		</svg>
		<h3 class="mt-2 text-sm font-medium text-gray-900">No players found</h3>
		<p class="mt-1 text-sm text-gray-500">No active players match your current filters.</p>
	</div>
{:else}
	<div class="space-y-4">
		{#each sortedPlayers as player}
			{@const compatibilityScore = calculateCompatibilityScore(player)}
			{@const sharedGames = getSharedGames(player)}
			{@const sharedDays = getSharedDays(player)}
			{@const canShowContact = canViewContact(player)}

			<div
				class="bg-white border border-gray-200 rounded-lg p-6 sm:p-4 hover:shadow-md transition-shadow"
			>
				<div class="flex flex-col lg:flex-row lg:gap-4">
					<!-- Player Info -->
					<div class="flex-1 min-w-0 mb-4 lg:mb-0">
						<div class="flex flex-col sm:flex-row sm:items-center sm:space-x-3 mb-3">
							<div class="flex items-center space-x-3 mb-2 sm:mb-0">
								<h3 class="text-xl sm:text-lg font-medium text-gray-900">
									{player.displayName || player.username}
								</h3>

								<!-- Great Match Indicator -->
								{#if compatibilityScore >= 75}
									<span
										class="inline-flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded text-sm sm:text-xs font-medium bg-purple-100 text-purple-800"
									>
										<svg class="w-4 h-4 sm:w-3 sm:h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
											<path
												d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
											/>
										</svg>
										Great Match
									</span>
								{/if}
							</div>
						</div>

						<!-- Player Details -->
						<div class="text-sm text-gray-600 space-y-2 mb-4">
							{#if player.experienceLevel}
								<div class="flex items-center space-x-1">
									<span class="font-medium">Experience:</span>
									<span class="capitalize">{player.experienceLevel}</span>
								</div>
							{/if}

							{#if player.vibePreference}
								<div class="flex items-center space-x-1">
									<span class="font-medium">Play Style:</span>
									<span class="capitalize"
										>{player.vibePreference === 'both' ? 'Flexible' : player.vibePreference}</span
									>
								</div>
							{/if}

							<div class="flex items-center space-x-1">
								<span class="font-medium">Last Active:</span>
								<span>{formatLastLogin(player.lastLogin)}</span>
							</div>

							<!-- Open to any game badge moved here -->
							{#if player.openToAnyGame}
								<div class="flex items-center space-x-1">
									<span
										class="inline-flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded text-sm sm:text-xs font-medium bg-blue-100 text-blue-800"
									>
										Open to any game
									</span>
								</div>
							{/if}
						</div>

						<!-- Bio -->
						{#if player.bio}
							<p class="text-base sm:text-sm text-gray-700 italic mb-4 sm:mb-2 leading-relaxed">
								"{player.bio}"
							</p>
						{/if}

						<!-- Shared Availability -->
						<div class="mb-4">
							<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
								Shared Availability
							</h4>
							{#if sharedDays.length > 0}
								<div class="flex flex-wrap gap-2">
									{#each sharedDays as day}
										<span
											class="inline-flex items-center px-3 py-2 sm:px-2 sm:py-1 rounded text-sm sm:text-xs font-medium bg-green-100 text-green-800 min-h-[32px]"
										>
											{daysOfWeek[day]}
										</span>
									{/each}
								</div>
							{:else}
								<div class="text-sm text-gray-500 italic">No overlapping days</div>
							{/if}
						</div>
					</div>

					<!-- Games Section -->
					<div class="flex-1 min-w-0 mb-4 lg:mb-0">
						<h4 class="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
							Preferred Games
						</h4>

						{#if player.gamePreferences.length > 0}
							<div class="grid grid-cols-1 md:grid-cols-2 gap-2">
								{#each player.gamePreferences.slice(0, 6) as game}
									{@const isShared = sharedGames.some((sg) => sg.gameBggId === game.gameBggId)}
									<a
										href="/game/{game.gameBggId}"
										class="flex items-center space-x-2 p-3 sm:p-2 rounded-lg transition-all duration-200 min-h-[44px] {isShared
											? 'bg-indigo-50 border-2 border-indigo-400 shadow-lg hover:bg-indigo-100 hover:shadow-xl'
											: 'bg-gray-50 border border-gray-200 hover:bg-gray-100 hover:shadow-md'}"
									>
										{#if game.thumbnail}
											<img
												src={game.thumbnail}
												alt={game.name}
												class="w-10 h-10 sm:w-8 sm:h-8 rounded object-cover flex-shrink-0"
												loading="lazy"
											/>
										{:else}
											<div
												class="w-10 h-10 sm:w-8 sm:h-8 bg-gray-200 rounded flex items-center justify-center flex-shrink-0"
											>
												<svg class="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
													<path
														d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
													/>
												</svg>
											</div>
										{/if}
										<div class="flex-1 min-w-0">
											<p
												class="text-sm sm:text-xs font-medium {isShared
													? 'text-indigo-900'
													: 'text-gray-700'} truncate"
											>
												{game.name}
											</p>
										</div>
									</a>
								{/each}
								{#if player.gamePreferences.length > 6}
									<div
										class="flex items-center justify-center p-3 sm:p-2 rounded-lg bg-gray-50 border border-gray-200 min-h-[44px]"
									>
										<span class="text-sm sm:text-xs font-medium text-gray-600">
											+{player.gamePreferences.length - 6} more
										</span>
									</div>
								{/if}
							</div>
						{:else if !player.openToAnyGame}
							<div class="text-sm text-gray-500 italic">No games selected</div>
						{/if}
					</div>

					<!-- Contact Info -->
					<div class="flex-shrink-0 w-full lg:w-48">
						{#if canShowContact}
							<div class="text-left lg:text-right space-y-2">
								<div class="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact</div>
								{#if player.contactEmail}
									<div class="text-sm text-gray-900">
										<a
											href="mailto:{player.contactEmail}"
											class="hover:text-indigo-600 inline-block min-h-[44px] py-2"
										>
											{player.contactEmail}
										</a>
									</div>
								{/if}
								{#if player.contactPhone}
									<div class="text-sm text-gray-900">
										<a
											href="tel:{player.contactPhone}"
											class="hover:text-indigo-600 inline-block min-h-[44px] py-2"
										>
											{player.contactPhone}
										</a>
									</div>
								{/if}
							</div>
						{:else}
							<div class="text-left lg:text-right">
								<div class="text-xs text-gray-400 italic">
									{#if !currentUser.lookingForParty || currentUser.partyStatus !== 'active'}
										Enable "Looking for Party" to see contacts
									{:else if player.contactVisibleTo === 'matches' && compatibilityScore < 50}
										Contact visible to better matches
									{:else}
										Contact info hidden
									{/if}
								</div>
							</div>
						{/if}
					</div>
				</div>
			</div>
		{/each}
	</div>
{/if}
