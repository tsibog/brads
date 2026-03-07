<script lang="ts">
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';
	import { toast } from '$lib/stores/toast';

	const {
		data
	}: {
		data: {
			game: {
				game: BoardGame;
			};
		};
	} = $props();

	let game = $state(data.game.game);
	let name = $state(game.name);
	let yearPublished = $state(game.yearPublished);
	let minPlayers = $state(game.minPlayers);
	let maxPlayers = $state(game.maxPlayers);
	let playingTime = $state(game.playingTime);
	let minPlayTime = $state(game.minPlayTime);
	let maxPlayTime = $state(game.maxPlayTime);
	let age = $state(game.age);
	let thumbnail = $state(game.thumbnail || '');
	let image = $state(game.image || '');
	let isStarred = $state(game.isStarred);
	let adminNote = $state(game.adminNote || '');
	let isDeleteModalOpen = $state(false);

	async function handleSubmit() {
		const response = await fetch(`/api/games`, {
			method: 'PUT',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				...game,
				name,
				yearPublished,
				minPlayers,
				maxPlayers,
				playingTime,
				minPlayTime,
				maxPlayTime,
				age,
				thumbnail,
				image,
				isStarred,
				adminNote
			})
		});

		if (response.ok) {
			toast('Game updated successfully');
			goto('/admin/manage');
		} else {
			toast('Failed to update game', 'error');
		}
	}

	function openDeleteModal() {
		isDeleteModalOpen = true;
	}

	function closeDeleteModal() {
		isDeleteModalOpen = false;
	}

	async function confirmDelete() {
		const response = await fetch(`/api/games?id=${game.bggId}`, {
			method: 'DELETE'
		});

		if (response.ok) {
			toast('Game deleted successfully');
			goto('/admin/manage');
		} else {
			toast('Failed to delete game', 'error');
		}
		closeDeleteModal();
	}
</script>

<div class="max-w-2xl mx-auto mt-8">
	<a href="/admin/manage" class="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
		<svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
		</svg>
		Back to Games
	</a>

	<div class="bg-white rounded-lg shadow-md overflow-hidden">
		<!-- Game image preview -->
		<div class="flex gap-4 p-6 border-b border-gray-100">
			{#if image}
				<img
					src={image}
					alt={name}
					class="w-28 h-36 object-cover rounded-lg shrink-0"
				/>
			{:else}
				<div class="w-28 h-36 bg-gray-200 rounded-lg shrink-0 flex items-center justify-center text-gray-400 text-xs text-center">
					No image
				</div>
			{/if}
			<div class="min-w-0">
				<h1 class="text-2xl font-bold mb-1">{name}</h1>
				<p class="text-sm text-gray-500">BGG ID: {game.bggId}</p>
			</div>
		</div>

		<!-- Edit form -->
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-5">
			<!-- Game Name -->
			<div>
				<label class="block mb-1 font-bold text-sm text-gray-700" for="name">Game Name</label>
				<input
					type="text"
					id="name"
					bind:value={name}
					required
					class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
				/>
			</div>

			<!-- Year Published -->
			<div>
				<label class="block mb-1 font-bold text-sm text-gray-700" for="yearPublished">Year Published</label>
				<input
					type="number"
					id="yearPublished"
					bind:value={yearPublished}
					class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
				/>
			</div>

			<!-- Players -->
			<div class="grid grid-cols-2 gap-4">
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="minPlayers">Min Players</label>
					<input
						type="number"
						id="minPlayers"
						bind:value={minPlayers}
						min="1"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="maxPlayers">Max Players</label>
					<input
						type="number"
						id="maxPlayers"
						bind:value={maxPlayers}
						min="1"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>
			</div>

			<!-- Play Time -->
			<div class="grid grid-cols-3 gap-4">
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="playingTime">Play Time (min)</label>
					<input
						type="number"
						id="playingTime"
						bind:value={playingTime}
						min="0"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="minPlayTime">Min Time</label>
					<input
						type="number"
						id="minPlayTime"
						bind:value={minPlayTime}
						min="0"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>
				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="maxPlayTime">Max Time</label>
					<input
						type="number"
						id="maxPlayTime"
						bind:value={maxPlayTime}
						min="0"
						class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
					/>
				</div>
			</div>

			<!-- Minimum Age -->
			<div>
				<label class="block mb-1 font-bold text-sm text-gray-700" for="age">Minimum Age</label>
				<input
					type="number"
					id="age"
					bind:value={age}
					min="0"
					class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
				/>
			</div>

			<!-- Image URLs -->
			<div class="border-t pt-5">
				<h3 class="font-bold text-sm text-gray-700 mb-3">Images</h3>
				<div class="space-y-3">
					<div>
						<label class="block mb-1 text-sm text-gray-600" for="image">Full Image URL</label>
						<input
							type="url"
							id="image"
							bind:value={image}
							placeholder="https://..."
							class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
						/>
					</div>
					<div>
						<label class="block mb-1 text-sm text-gray-600" for="thumbnail">Thumbnail URL</label>
						<input
							type="url"
							id="thumbnail"
							bind:value={thumbnail}
							placeholder="https://..."
							class="w-full p-2 border rounded text-sm focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none"
						/>
					</div>
				</div>
			</div>

			<!-- Staff Favorite & Admin Note -->
			<div class="border-t pt-5">
				<label class="block mb-3 font-bold" for="isStarred">
					<input type="checkbox" id="isStarred" bind:checked={isStarred} class="mr-2" />
					Mark as Favorite
				</label>

				<div>
					<label class="block mb-1 font-bold text-sm text-gray-700" for="adminNote">Admin Note</label>
					<textarea id="adminNote" bind:value={adminNote} class="w-full p-2 border rounded focus:ring-2 focus:ring-brads-green/30 focus:border-brads-green-light focus:outline-none" rows="3"></textarea>
				</div>
			</div>

			<div class="flex justify-between items-center pt-2">
				<button
					type="submit"
					class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-300"
				>
					Update Game
				</button>
				<button
					type="button"
					onclick={openDeleteModal}
					class="bg-white text-red-500 border border-red-500 px-4 py-2 rounded hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-300"
				>
					Delete Game
				</button>
			</div>
		</form>
	</div>
</div>

<ConfirmationModal
	isOpen={isDeleteModalOpen}
	onConfirm={confirmDelete}
	onCancel={closeDeleteModal}
	title="Confirm Deletion"
	message="Are you sure you want to delete this game? This action cannot be undone."
/>
