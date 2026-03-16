<script lang="ts">
	interface GamePref {
		gameBggId: string;
		name: string;
		thumbnail?: string | null;
	}

	interface Player {
		id: string;
		username: string;
		displayName: string | null;
		bio: string | null;
		experienceLevel: string | null;
		playStyle: string | null;
		openToAnyGame: boolean;
		contactMethod: string | null;
		contactValue: string | null;
		contactVisibleTo: string | null;
		lastLogin: string | null;
		availability: Array<{ dayOfWeek: number }>;
		gamePreferences: GamePref[];
		compatibilityScore: number;
		sharedPlayCount?: number;
	}

	interface Props {
		players: Player[];
		currentUser: {
			id: string;
			looking_for_party: boolean | null;
			party_status: string | null;
		};
		currentUserGamePreferences: string[];
	}

	let { players, currentUser, currentUserGamePreferences }: Props = $props();

	const dayLabels: Record<number, string> = {
		0: 'Sun',
		2: 'Tue',
		3: 'Wed',
		4: 'Thu',
		5: 'Fri',
		6: 'Sat'
	};

	const experienceLabels: Record<string, string> = {
		new: 'New',
		some_experience: 'Some exp.',
		experienced: 'Experienced'
	};

	const playStyleLabels: Record<string, string> = {
		casual: 'Casual',
		competitive: 'Competitive',
		either: 'Either'
	};

	function shouldShowContact(player: Player): boolean {
		if (!currentUser.looking_for_party || currentUser.party_status !== 'active') return false;
		if (!player.contactValue) return false;
		if (player.contactVisibleTo === 'none') return false;
		if (player.contactVisibleTo === 'all') return true;
		if (player.contactVisibleTo === 'matches') return player.compatibilityScore >= 50;
		return false;
	}

	function isSharedGame(bggId: string): boolean {
		return currentUserGamePreferences.includes(bggId);
	}
</script>

{#if players.length === 0}
	<div class="text-center py-12 text-gray-500">
		<p class="text-lg font-londrina">No players found</p>
		<p class="text-sm mt-1">Try adjusting your filters or check back later.</p>
	</div>
{:else}
	<div class="space-y-4">
		{#each players as player}
			<div class="bg-white rounded-xl shadow border border-brads-green-light/20 p-5">
				<div class="flex items-start justify-between">
					<div>
						<h3 class="text-lg font-londrina text-brads-green-dark">
							{player.displayName || player.username}
						</h3>
						<div class="flex items-center gap-3 mt-1 text-xs text-gray-500">
							{#if player.experienceLevel}
								<span class="bg-gray-100 rounded px-2 py-0.5">
									{experienceLabels[player.experienceLevel] ?? player.experienceLevel}
								</span>
							{/if}
							{#if player.playStyle}
								<span class="bg-gray-100 rounded px-2 py-0.5">
									{playStyleLabels[player.playStyle] ?? player.playStyle}
								</span>
							{/if}
						</div>
					</div>
					<div class="text-right">
						<div
							class="text-2xl font-londrina {player.compatibilityScore >= 75
								? 'text-green-600'
								: player.compatibilityScore >= 50
									? 'text-yellow-600'
									: 'text-gray-400'}"
						>
							{player.compatibilityScore}%
						</div>
						{#if player.compatibilityScore >= 75}
							<span class="text-xs text-green-600 font-medium">Great Match</span>
						{/if}
					</div>
				</div>

				{#if player.bio}
					<p class="text-sm text-gray-600 mt-2">{player.bio}</p>
				{/if}

				<!-- Shared play history -->
				{#if player.sharedPlayCount && player.sharedPlayCount > 0}
					<div class="mt-2 text-sm text-brads-green-dark/70">
						Played together {player.sharedPlayCount} time{player.sharedPlayCount !== 1 ? 's' : ''}
					</div>
				{/if}

				<!-- Availability days -->
				{#if player.availability.length > 0}
					<div class="mt-3 flex flex-wrap gap-1.5">
						{#each player.availability as avail}
							<span class="text-xs px-2 py-0.5 rounded bg-brads-green-dark/10 text-brads-green-dark">
								{dayLabels[avail.dayOfWeek] ?? `Day ${avail.dayOfWeek}`}
							</span>
						{/each}
					</div>
				{/if}

				<!-- Game preferences -->
				{#if player.gamePreferences.length > 0}
					<div class="mt-3 flex flex-wrap gap-2">
						{#each player.gamePreferences as game}
							<div
								class="flex items-center gap-1.5 text-xs px-2 py-1 rounded-lg
									{isSharedGame(game.gameBggId)
									? 'bg-blue-50 text-blue-700 border border-blue-200'
									: 'bg-gray-50 text-gray-600 border border-gray-200'}"
							>
								{#if game.thumbnail}
									<img src={game.thumbnail} alt="" class="w-5 h-5 rounded object-cover" />
								{/if}
								<span>{game.name}</span>
							</div>
						{/each}
						{#if player.openToAnyGame}
							<span class="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 border border-green-200">
								Open to any game
							</span>
						{/if}
					</div>
				{/if}

				<!-- Contact info -->
				{#if shouldShowContact(player)}
					<div class="mt-3 pt-3 border-t border-gray-100 text-sm text-gray-600">
						<span class="font-medium capitalize">{player.contactMethod}:</span>
						{player.contactValue}
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
