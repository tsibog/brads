<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';

	type PlayStats = {
		mostPlayed: Array<{
			gameBggId: string;
			gameName: string;
			gameThumbnail: string | null;
			playCount: number;
			totalPlayers: number;
		}>;
		totals: {
			totalPlays: number;
			totalPlayerSessions: number;
			uniqueGames: number;
			uniqueUsers: number;
		};
		recentPlays: Array<{
			id: number;
			username: string;
			gameName: string;
			gameThumbnail: string | null;
			gameBggId: string;
			playDate: string;
			playerCount: number;
			durationMinutes: number | null;
			notes: string | null;
		}>;
		byDayOfWeek: Array<{
			dayOfWeek: number;
			count: number;
		}>;
		topPlayers: Array<{
			userId: string;
			username: string;
			playCount: number;
			uniqueGames: number;
		}>;
	};

	type UserInfo = { id: string; username: string; is_admin: boolean } | null;
	const { data }: { data: { stats: PlayStats; period: string; user: UserInfo } } = $props();
	const user = $derived(data.user);

	const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
	const periods = [
		{ value: 'week', label: 'This Week' },
		{ value: 'month', label: 'This Month' },
		{ value: 'year', label: 'This Year' },
		{ value: 'all', label: 'All Time' }
	];

	// Log play form state
	let showLogForm = $state(false);
	let gameSearch = $state('');
	let searchResults = $state<Array<{ bggId: string; name: string; thumbnail: string | null }>>([]);
	let selectedGame = $state<{ bggId: string; name: string; thumbnail: string | null } | null>(
		null
	);
	let playerCount = $state(2);
	let durationMinutes = $state<number | undefined>(undefined);
	let notes = $state('');
	let playDate = $state(new Date().toISOString().split('T')[0]);
	let isSubmitting = $state(false);
	let submitMessage = $state('');
	let searchTimeout: ReturnType<typeof setTimeout>;

	// Tag players state
	let playerSearch = $state('');
	let playerSearchResults = $state<Array<{ id: string; username: string }>>([]);
	let taggedPlayers = $state<Array<{ id: string; username: string }>>([]);
	let playerSearchTimeout: ReturnType<typeof setTimeout>;
	let invalidPlayers = $state<string[]>([]);

	function formatDate(dateStr: string) {
		const date = new Date(dateStr);
		return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
	}

	function changePeriod(period: string) {
		const url = new URL($page.url);
		url.searchParams.set('period', period);
		goto(url.toString(), { replaceState: true });
	}

	async function searchGames() {
		if (gameSearch.length < 2) {
			searchResults = [];
			return;
		}
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(async () => {
			const res = await fetch(`/api/games?name=${encodeURIComponent(gameSearch)}&limit=8`);
			const json = await res.json();
			searchResults = (json.data || []).map(
				(g: { bggId: string; name: string; thumbnail: string | null }) => ({
					bggId: g.bggId,
					name: g.name,
					thumbnail: g.thumbnail
				})
			);
		}, 300);
	}

	function selectGame(game: { bggId: string; name: string; thumbnail: string | null }) {
		selectedGame = game;
		gameSearch = game.name;
		searchResults = [];
	}

	async function searchPlayers() {
		if (playerSearch.length < 1) {
			playerSearchResults = [];
			return;
		}
		clearTimeout(playerSearchTimeout);
		playerSearchTimeout = setTimeout(async () => {
			const res = await fetch(`/api/users/search?q=${encodeURIComponent(playerSearch)}`);
			const json = await res.json();
			playerSearchResults = (json as Array<{ id: string; username: string }>).filter(
				(u) => !taggedPlayers.some((t) => t.id === u.id)
			);
		}, 200);
	}

	function tagPlayer(player: { id: string; username: string }) {
		taggedPlayers = [...taggedPlayers, player];
		playerSearch = '';
		playerSearchResults = [];
		invalidPlayers = invalidPlayers.filter((n) => n.toLowerCase() !== player.username.toLowerCase());
	}

	function removeTaggedPlayer(playerId: string) {
		taggedPlayers = taggedPlayers.filter((p) => p.id !== playerId);
	}

	async function submitPlay() {
		if (!selectedGame) return;
		isSubmitting = true;
		submitMessage = '';
		invalidPlayers = [];

		try {
			const res = await fetch('/api/plays', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameBggId: selectedGame.bggId,
					playerCount,
					durationMinutes: durationMinutes || null,
					notes: notes.trim() || null,
					playDate,
					taggedUsernames: taggedPlayers.map((p) => p.username)
				})
			});

			if (res.ok) {
				const result = await res.json();
				const tagCount = result.taggedCount || 0;
				submitMessage = tagCount > 0
					? `Play logged for you and ${tagCount} other player${tagCount > 1 ? 's' : ''}!`
					: 'Play logged!';
				selectedGame = null;
				gameSearch = '';
				playerCount = 2;
				durationMinutes = undefined;
				notes = '';
				playDate = new Date().toISOString().split('T')[0];
				taggedPlayers = [];
				showLogForm = false;
				goto($page.url.toString(), { invalidateAll: true });
			} else {
				const err = await res.json();
				if (err.missingUsernames) {
					invalidPlayers = err.missingUsernames;
				}
				submitMessage = err.error || 'Failed to log play';
			}
		} catch {
			submitMessage = 'Network error';
		} finally {
			isSubmitting = false;
		}
	}

	// Max bar width for the day-of-week chart
	const maxDayCount = $derived(
		Math.max(1, ...(data.stats.byDayOfWeek ?? []).map((d) => d.count))
	);
</script>

<svelte:head>
	<title>Game Plays - Brads Spelcafe</title>
</svelte:head>

<main class="container mx-auto px-2 sm:px-4 py-8">
	<!-- User bar -->
	{#if user}
		<div class="flex items-center justify-end gap-3 mb-2">
			<span class="font-londrina text-brads-green-dark/60">Logged in as <strong class="text-brads-green-dark">{user.username}</strong></span>
			<form action="/logout" method="POST">
				<button
					type="submit"
					class="text-sm px-3 py-1 rounded border border-brads-green-light/30 text-brads-green-dark/60 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors font-londrina"
				>
					Log out
				</button>
			</form>
		</div>
	{/if}

	<div class="flex flex-col sm:flex-row sm:items-center justify-between mb-6 gap-4">
		<div>
			<h1 class="text-3xl font-londrina text-brads-green-dark">Game Plays</h1>
			<p class="text-brads-green-dark/70 font-londrina text-lg">
				See what the community is playing
			</p>
		</div>
		<div class="flex gap-2">
			<a
				href="/browse"
				class="px-4 py-2 bg-brads-green-light text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark transition-colors"
			>
				Browse Games
			</a>
			{#if user}
				<button
					onclick={() => (showLogForm = !showLogForm)}
					class="px-4 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors"
				>
					{showLogForm ? 'Cancel' : 'Log a Play'}
				</button>
			{:else}
				<a
					href="/login"
					class="px-4 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors"
				>
					Login
				</a>
			{/if}
		</div>
	</div>

	<!-- Log a Play Form -->
	{#if showLogForm}
		<div class="bg-white rounded-xl shadow-md p-6 mb-8 border border-brads-green-light/20">
			<h2 class="text-2xl font-londrina text-brads-green-dark mb-4">Log a Play</h2>
			<form onsubmit={(e) => { e.preventDefault(); submitPlay(); }} class="space-y-4">
				<!-- Game search -->
				<div class="relative">
					<label for="game-search" class="block font-londrina text-lg text-brads-green-dark mb-1"
						>Which game did you play?</label
					>
					{#if selectedGame}
						<div
							class="flex items-center gap-3 bg-brads-green-light/10 rounded-lg p-3 border border-brads-green-light/30"
						>
							{#if selectedGame.thumbnail}
								<img
									src={selectedGame.thumbnail}
									alt={selectedGame.name}
									class="w-10 h-10 rounded object-cover"
								/>
							{/if}
							<span class="font-londrina text-lg text-brads-green-dark flex-1"
								>{selectedGame.name}</span
							>
							<button
								type="button"
								onclick={() => {
									selectedGame = null;
									gameSearch = '';
								}}
								class="text-red-500 hover:text-red-700 font-londrina">Change</button
							>
						</div>
					{:else}
						<input
							id="game-search"
							type="text"
							bind:value={gameSearch}
							oninput={searchGames}
							placeholder="Search for a game..."
							class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
						/>
						{#if searchResults.length > 0}
							<ul
								class="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto"
							>
								{#each searchResults as game}
									<li>
										<button
											type="button"
											onclick={() => selectGame(game)}
											class="w-full flex items-center gap-3 px-4 py-2 hover:bg-brads-green-light/10 text-left"
										>
											{#if game.thumbnail}
												<img
													src={game.thumbnail}
													alt={game.name}
													class="w-8 h-8 rounded object-cover"
												/>
											{/if}
											<span class="font-londrina text-lg">{game.name}</span>
										</button>
									</li>
								{/each}
							</ul>
						{/if}
					{/if}
				</div>

				<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
					<!-- Player count -->
					<div>
						<label for="player-count" class="block font-londrina text-lg text-brads-green-dark mb-1"
							>Players</label
						>
						<input
							id="player-count"
							type="number"
							bind:value={playerCount}
							min="1"
							max="99"
							class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
						/>
					</div>

					<!-- Duration -->
					<div>
						<label for="duration" class="block font-londrina text-lg text-brads-green-dark mb-1"
							>Duration (min)</label
						>
						<input
							id="duration"
							type="number"
							bind:value={durationMinutes}
							min="1"
							placeholder="Optional"
							class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
						/>
					</div>

					<!-- Date -->
					<div>
						<label for="play-date" class="block font-londrina text-lg text-brads-green-dark mb-1"
							>Date</label
						>
						<input
							id="play-date"
							type="date"
							bind:value={playDate}
							max={new Date().toISOString().split('T')[0]}
							class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
						/>
					</div>
				</div>

				<!-- Notes -->
				<div>
					<label for="notes" class="block font-londrina text-lg text-brads-green-dark mb-1"
						>Notes (optional)</label
					>
					<textarea
						id="notes"
						bind:value={notes}
						rows="2"
						placeholder="How was the game?"
						class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light resize-none"
					></textarea>
				</div>

				<!-- Tag players -->
				<div>
					<label for="player-tag" class="block font-londrina text-lg text-brads-green-dark mb-1"
						>Tag other players (optional)</label
					>
					<p class="text-sm text-brads-green-dark/50 font-londrina mb-2">
						The play will also be logged for tagged players
					</p>

					{#if taggedPlayers.length > 0}
						<div class="flex flex-wrap gap-2 mb-2">
							{#each taggedPlayers as player}
								<span
									class="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-londrina {invalidPlayers.some((n) => n.toLowerCase() === player.username.toLowerCase()) ? 'bg-red-100 text-red-700 border border-red-300' : 'bg-brads-green-light/20 text-brads-green-dark border border-brads-green-light/30'}"
								>
									{player.username}
									<button
										type="button"
										onclick={() => removeTaggedPlayer(player.id)}
										class="hover:text-red-600 ml-1 font-bold">&times;</button
									>
								</span>
							{/each}
						</div>
					{/if}

					<div class="relative">
						<input
							id="player-tag"
							type="text"
							bind:value={playerSearch}
							oninput={searchPlayers}
							placeholder="Search for a player..."
							class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
						/>
						{#if playerSearchResults.length > 0}
							<ul
								class="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-40 overflow-y-auto"
							>
								{#each playerSearchResults as player}
									<li>
										<button
											type="button"
											onclick={() => tagPlayer(player)}
											class="w-full px-4 py-2 hover:bg-brads-green-light/10 text-left font-londrina text-lg"
										>
											{player.username}
										</button>
									</li>
								{/each}
							</ul>
						{:else if playerSearch.length >= 1 && playerSearchResults.length === 0}
							<div class="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 px-4 py-2 text-brads-green-dark/50 font-londrina">
								No players found
							</div>
						{/if}
					</div>

					{#if invalidPlayers.length > 0}
						<p class="text-red-600 text-sm font-londrina mt-1">
							Users not found: {invalidPlayers.join(', ')}
						</p>
					{/if}
				</div>

				<button
					type="submit"
					disabled={!selectedGame || isSubmitting}
					class="w-full sm:w-auto px-6 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{isSubmitting ? 'Logging...' : 'Log Play'}
				</button>

				{#if submitMessage}
					<p
						class="font-londrina text-lg {submitMessage.includes('logged')
							? 'text-green-600'
							: 'text-red-600'}"
					>
						{submitMessage}
					</p>
				{/if}
			</form>
		</div>
	{/if}

	<!-- Period filter -->
	<div class="flex gap-2 mb-6 flex-wrap">
		{#each periods as p}
			<button
				onclick={() => changePeriod(p.value)}
				class="px-4 py-1.5 rounded-full font-londrina text-lg transition-colors {data.period ===
				p.value
					? 'bg-brads-green-dark text-white'
					: 'bg-white text-brads-green-dark border border-brads-green-light/30 hover:bg-brads-green-light/10'}"
			>
				{p.label}
			</button>
		{/each}
	</div>

	<!-- Overview stats -->
	<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
		<div class="bg-white rounded-xl shadow-sm p-4 text-center border border-brads-green-light/20">
			<div class="text-3xl font-londrina text-brads-green-dark">
				{data.stats.totals?.totalPlays ?? 0}
			</div>
			<div class="font-londrina text-lg text-brads-green-dark/60">Total Plays</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm p-4 text-center border border-brads-green-light/20">
			<div class="text-3xl font-londrina text-brads-green-dark">
				{data.stats.totals?.uniqueGames ?? 0}
			</div>
			<div class="font-londrina text-lg text-brads-green-dark/60">Unique Games</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm p-4 text-center border border-brads-green-light/20">
			<div class="text-3xl font-londrina text-brads-green-dark">
				{data.stats.totals?.totalPlayerSessions ?? 0}
			</div>
			<div class="font-londrina text-lg text-brads-green-dark/60">Player Sessions</div>
		</div>
		<div class="bg-white rounded-xl shadow-sm p-4 text-center border border-brads-green-light/20">
			<div class="text-3xl font-londrina text-brads-green-dark">
				{data.stats.totals?.uniqueUsers ?? 0}
			</div>
			<div class="font-londrina text-lg text-brads-green-dark/60">Active Players</div>
		</div>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
		<!-- Most Played Games -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-brads-green-light/20">
			<h2 class="text-2xl font-londrina text-brads-green-dark mb-4">Most Played Games</h2>
			{#if data.stats.mostPlayed.length === 0}
				<p class="text-brads-green-dark/50 font-londrina text-lg">No plays logged yet</p>
			{:else}
				<ul class="space-y-3">
					{#each data.stats.mostPlayed as game, i}
						<li>
							<a
								href="/game/{game.gameBggId}"
								class="flex items-center gap-3 hover:bg-brads-green-light/5 rounded-lg p-2 -mx-2 transition-colors"
							>
								<span
									class="w-8 h-8 rounded-full bg-brads-green-dark text-white flex items-center justify-center font-londrina text-lg shrink-0"
								>
									{i + 1}
								</span>
								{#if game.gameThumbnail}
									<img
										src={game.gameThumbnail}
										alt={game.gameName}
										class="w-10 h-10 rounded object-cover shrink-0"
									/>
								{/if}
								<div class="flex-1 min-w-0">
									<div class="font-londrina text-lg text-brads-green-dark truncate">
										{game.gameName}
									</div>
									<div class="text-sm text-brads-green-dark/50 font-londrina">
										{game.playCount} play{game.playCount !== 1 ? 's' : ''} &middot; {game.totalPlayers}
										total players
									</div>
								</div>
							</a>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Recent Plays Feed -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-brads-green-light/20">
			<h2 class="text-2xl font-londrina text-brads-green-dark mb-4">Recent Plays</h2>
			{#if data.stats.recentPlays.length === 0}
				<p class="text-brads-green-dark/50 font-londrina text-lg">No plays logged yet</p>
			{:else}
				<ul class="space-y-3">
					{#each data.stats.recentPlays as play}
						<li
							class="flex items-start gap-3 border-b border-gray-100 pb-3 last:border-0 last:pb-0"
						>
							{#if play.gameThumbnail}
								<img
									src={play.gameThumbnail}
									alt={play.gameName}
									class="w-10 h-10 rounded object-cover shrink-0 mt-0.5"
								/>
							{/if}
							<div class="flex-1 min-w-0">
								<div class="font-londrina text-lg text-brads-green-dark">
									<span class="font-bold">{play.username}</span> played
									<a href="/game/{play.gameBggId}" class="underline hover:text-brads-green-light"
										>{play.gameName}</a
									>
								</div>
								<div class="text-sm text-brads-green-dark/50 font-londrina">
									{formatDate(play.playDate)} &middot; {play.playerCount} player{play.playerCount !==
									1
										? 's'
										: ''}
									{#if play.durationMinutes}
										&middot; {play.durationMinutes} min
									{/if}
								</div>
								{#if play.notes}
									<p class="text-sm text-brads-green-dark/70 mt-1 italic">"{play.notes}"</p>
								{/if}
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>

		<!-- Plays by Day of Week -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-brads-green-light/20">
			<h2 class="text-2xl font-londrina text-brads-green-dark mb-4">Busiest Days</h2>
			{#if data.stats.byDayOfWeek.length === 0}
				<p class="text-brads-green-dark/50 font-londrina text-lg">No data yet</p>
			{:else}
				<div class="space-y-2">
					{#each dayNames as day, i}
						{@const dayData = data.stats.byDayOfWeek.find((d) => d.dayOfWeek === i)}
						{@const count = dayData?.count ?? 0}
						<div class="flex items-center gap-3">
							<span class="w-10 font-londrina text-lg text-brads-green-dark">{day}</span>
							<div class="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
								<div
									class="bg-brads-green-light h-full rounded-full transition-all"
									style="width: {(count / maxDayCount) * 100}%"
								></div>
							</div>
							<span class="w-8 text-right font-londrina text-brads-green-dark/60">{count}</span>
						</div>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Top Players -->
		<div class="bg-white rounded-xl shadow-sm p-6 border border-brads-green-light/20">
			<h2 class="text-2xl font-londrina text-brads-green-dark mb-4">Top Players</h2>
			{#if data.stats.topPlayers.length === 0}
				<p class="text-brads-green-dark/50 font-londrina text-lg">No players yet</p>
			{:else}
				<ul class="space-y-3">
					{#each data.stats.topPlayers as player, i}
						<li class="flex items-center gap-3">
							<span
								class="w-8 h-8 rounded-full bg-brads-green-light text-white flex items-center justify-center font-londrina text-lg shrink-0"
							>
								{i + 1}
							</span>
							<div class="flex-1">
								<div class="font-londrina text-lg text-brads-green-dark">{player.username}</div>
								<div class="text-sm text-brads-green-dark/50 font-londrina">
									{player.playCount} play{player.playCount !== 1 ? 's' : ''} &middot; {player.uniqueGames}
									game{player.uniqueGames !== 1 ? 's' : ''}
								</div>
							</div>
						</li>
					{/each}
				</ul>
			{/if}
		</div>
	</div>
</main>
