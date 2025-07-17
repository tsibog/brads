<script lang="ts">
	import type { BoardGame, Comment } from '$lib/server/db/schema';
	import { slide } from 'svelte/transition';

	type PageProps = {
		data: {
			game: BoardGame;
			similarGames: BoardGame[];
			comments: Comment[];
		};
	};

	const { data }: PageProps = $props();

	let game = $derived(data.game);
	let isDescriptionExpanded = $state(false);
	let areCategoriesExpanded = $state(false);
	let areMechanicsExpanded = $state(false);
	let comments = $derived(data.comments || []);
	let newComment = $state({ authorName: '', content: '' });
	let isSubmitting = $state(false);

	const categories = $derived.by(() => {
		return cleanArray(game.categories);
	});
	const mechanics = $derived.by(() => {
		return cleanArray(game.mechanics);
	});
	const designers = $derived.by(() => {
		return cleanArray(game.designers);
	});

	function toggleDescription() {
		isDescriptionExpanded = !isDescriptionExpanded;
	}

	function toggleCategories() {
		areCategoriesExpanded = !areCategoriesExpanded;
	}

	function toggleMechanics() {
		areMechanicsExpanded = !areMechanicsExpanded;
	}

	function cleanArray(str: string | null): string[] {
		if (typeof str !== 'string') return [];
		try {
			// Check for redundant wrapping quotes and remove them
			if (str.startsWith('"') && str.endsWith('"')) {
				str = str.slice(1, -1);
			}
			// Attempt to parse as JSON
			const parsed = JSON.parse(str);
			if (Array.isArray(parsed)) {
				return parsed.map((item) => cleanValue(item.trim()));
			}
		} catch (e) {
			// Fallback to splitting by commas if JSON parsing fails
			return str
				.replace(/^[\[\]]/g, '') // Remove surrounding brackets
				.split(',')
				.map((item) => cleanValue(item.trim().replace(/^"|"$/g, ''))); // Remove quotes
		}
		return [];
	}

	function cleanValue(value: string): string {
		// Remove any non-letter characters
		return value.replace(/[^a-zA-Z\s]/g, '');
	}

	async function submitComment(e: SubmitEvent) {
		isSubmitting = true;
		try {
			const response = await fetch('/api/comments', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					gameId: game.bggId,
					authorName: newComment.authorName,
					content: newComment.content
				})
			});

			if (response.ok) {
				alert('Comment submitted for approval!');
				newComment.authorName = '';
				newComment.content = '';
			} else {
				throw new Error('Failed to submit comment');
			}
		} catch (error) {
			alert('Error submitting comment. Please try again.');
		} finally {
			isSubmitting = false;
		}
	}
</script>

<svelte:head>
	<title>{game.name} - Board Game Details</title>
</svelte:head>

<main class="container mx-auto px-4 py-8 max-w-6xl">
	<a href="/" class="text-teal-500 hover:text-teal-700 mb-4 inline-block text-3xl"
		>&larr; Back to Game List</a
	>

	<div
		class="bg-gradient-to-br from-brads-green-dark to-brads-yellow-light shadow-2xl rounded-3xl overflow-hidden text-black"
	>
		<div class="relative h-96">
			{#if game.image}
				<img src={game.image} alt={game.name} class="w-full h-full object-cover" />
			{:else}
				<div class="w-full h-full bg-gray-300 flex items-center justify-center">
					No image available
				</div>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
		</div>

		<div class="p-8">
			<h2 class="text-4xl leading-tight mb-2">{game.name}</h2>

			<p class="text-xl">{game.yearPublished ?? 'Year unknown'}</p>

			<div class="grid grid-cols-2 sm:grid-cols-3 gap-6 text-lg mb-8">
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="  text-2xl">
						{game.minPlayers ?? '?'} - {game.maxPlayers ?? '?'}
					</p>
					<p class="text-sm uppercase tracking-wide">Players</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="  text-2xl">{game.playingTime ?? '?'} min</p>
					<p class="text-sm uppercase tracking-wide">Play Time</p>
				</div>
				<div class="bg-white/20 p-4 rounded-xl">
					<p class="  text-2xl">{game.age ? `${game.age}+` : 'Any'}</p>
					<p class="text-sm uppercase tracking-wide">Age</p>
				</div>
			</div>

			<div class="space-y-6">
				{#if categories && categories.length > 0}
					<div>
						<button onclick={toggleCategories} class={["text-xl", "mb-2", "flex", "items-center"]}>
							Categories
							<svg
								class={["w-4", "h-4", "ml-2", categories.length < 4 ? "hidden" : ""]}
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areCategoriesExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2">
							{#each categories.slice(0, areCategoriesExpanded ? undefined : 3) as category}
								<span class="bg-teal-700 px-3 py-1 rounded-full text-sm text-white">{category}</span
								>
							{/each}
							{#if !areCategoriesExpanded && categories.length > 3}
								<button
									class="bg-teal-700 px-3 py-1 rounded-full text-sm cursor-pointer text-white"
									onclick={toggleCategories}>+{categories.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if mechanics && mechanics.length > 0}
					<div>
						<button onclick={toggleMechanics} class="text-xl   mb-2 flex items-center">
							Mechanics
							<svg
								class="w-4 h-4 ml-2"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d={areMechanicsExpanded ? 'M19 9l-7 7-7-7' : 'M9 5l7 7-7 7'}
								></path>
							</svg>
						</button>
						<div class="flex flex-wrap gap-2 text-white">
							{#each mechanics.slice(0, areMechanicsExpanded ? undefined : 3) as mechanic}
								<span class="bg-blue-700 px-3 py-1 rounded-full text-sm">{mechanic}</span>
							{/each}
							{#if !areMechanicsExpanded && mechanics.length > 3}
								<button
									class="bg-blue-700 px-3 py-1 rounded-full text-sm cursor-pointer"
									onclick={toggleMechanics}>+{mechanics.length - 3} more</button
								>
							{/if}
						</div>
					</div>
				{/if}

				{#if designers && designers.length > 0}
					<div>
						<h2 class="text-xl   mb-2">Designers</h2>
						<div>{designers}</div>
					</div>
				{/if}
			</div>
			<a
				class="text-xl text-brads-green-dark   hover:text-brads-green transition-colors duration-200 float-right"
				href={`https://boardgamegeek.com/boardgame/${game.bggId}`}
				target="_blank"
			>
				🔗 BoardGameGeek Page
			</a>
		</div>

		{#if game.description}
			<div class="px-8 py-6 bg-white/10">
				<button
					onclick={toggleDescription}
					class="text-white bg-teal-600 hover:bg-teal-700   py-2 px-4 rounded-full focus:outline-none focus:shadow-outline transition duration-300"
				>
					{isDescriptionExpanded ? 'Hide Description' : 'Show Description'}
				</button>

				{#if isDescriptionExpanded}
					<div transition:slide={{ duration: 300 }} class="mt-4 text-black/90 leading-relaxed font-light">
						{@html game.description}
					</div>
				{/if}
			</div>
		{/if}

		{#if game.isStarred}
			<div
				class="bg-brads-yellow-light border-l-4 border-yellow-500 text-yellow-700 p-4"
				role="alert"
			>
				<p class=" ">🌟 Staff favorite!</p>
				{#if game.adminNote}
					<div class="bg-brads-yellow-light text-brads-green-dark">
						🗣️ <span class="italic">{game.adminNote}</span>
					</div>
				{/if}
			</div>
		{/if}
	</div>

	<div class="mt-12 bg-white rounded-lg shadow-lg p-6">
		<h2 class="text-3xl   mb-6 text-brads-green-dark">Comments</h2>
		{#if comments.length > 0}
			<ul class="space-y-6">
				{#each comments as comment}
					<li
						class="bg-brads-yellow-light/20 p-6 rounded-lg shadow-md border border-brads-green/20"
					>
						<div class="flex items-start">
							<div
								class="bg-brads-green-dark text-white rounded-full w-12 h-12 flex items-center justify-center text-xl  "
							>
								{comment.authorName[0].toUpperCase()}
							</div>
							<div class="ml-4 flex-grow">
								<p class="  text-lg text-brads-green-dark">{comment.authorName}</p>
								<p class="text-gray-600 text-sm">{new Date(comment.createdAt).toLocaleString()}</p>
							</div>
						</div>
						<p class="mt-4 text-gray-800 leading-relaxed">{comment.content}</p>
					</li>
				{/each}
			</ul>
		{:else}
			<div class="bg-brads-yellow-light/20 p-6 rounded-lg text-center">
				<p class="text-lg text-brads-green-dark">No comments yet. Be the first to comment!</p>
			</div>
		{/if}
	</div>

	<div class="mt-1 bg-white rounded-lg shadow-lg p-6">
		<h3 class="text-2xl   mb-6 text-brads-green-dark">Add a Comment</h3>
		<form onsubmit={(e) => submitComment(e)} class="space-y-6">
			<div>
				<label for="authorName" class="block mb-2 text-brads-green-dark  ">Name:</label>
				<input
					type="text"
					id="authorName"
					bind:value={newComment.authorName}
					required
					class="w-full p-3 border border-brads-green/20 rounded-lg focus:ring-2 focus:ring-brads-green focus:border-transparent"
				/>
			</div>
			<div>
				<label for="content" class="block mb-2 text-brads-green-dark  ">Comment:</label>
				<textarea
					id="content"
					bind:value={newComment.content}
					required
					class="w-full p-3 border border-brads-green/20 rounded-lg focus:ring-2 focus:ring-brads-green focus:border-transparent"
					rows="4"
				></textarea>
			</div>
			<button
				type="submit"
				disabled={isSubmitting}
				class="bg-brads-green-dark text-white px-6 py-3 rounded-lg hover:bg-brads-green transition duration-300 disabled:bg-gray-400 disabled:cursor-not-allowed"
			>
				{isSubmitting ? 'Submitting...' : 'Submit Comment'}
			</button>
		</form>
	</div>

	{#if data.similarGames.length > 0}
		<div class="mt-8">
			<h2 class="text-2xl   mb-4">Similar Games</h2>
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
				{#each data.similarGames as similarGame}
					<a href={`/game/${similarGame.bggId}`} class="block">
						<div class="bg-white rounded-lg shadow-md overflow-hidden">
							<img
								src={similarGame.thumbnail}
								alt={similarGame.name}
								class="w-full h-48 object-cover"
							/>
							<div class="p-4">
								<h3 class="  text-lg mb-2">{similarGame.name}</h3>
								<p class="text-sm text-gray-600">
									{similarGame.minPlayers}-{similarGame.maxPlayers} players
								</p>
								<p class="text-sm text-gray-600">{similarGame.playingTime} min</p>
							</div>
						</div>
					</a>
				{/each}
			</div>
		</div>
	{/if}
</main>

<style>
	:global(body) {
		background-color: #f0f4f8;
	}
</style>
