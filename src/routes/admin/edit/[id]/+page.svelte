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
		<!-- Game info header -->
		<div class="flex gap-4 p-6 border-b border-gray-100">
			{#if game.image}
				<img
					src={game.image}
					alt={game.name}
					class="w-28 h-36 object-cover rounded-lg shrink-0"
				/>
			{/if}
			<div class="min-w-0">
				<h1 class="text-2xl font-bold mb-2">{game.name}</h1>
				<div class="text-sm text-gray-600 space-y-1">
					{#if game.yearPublished}
						<p>Published: {game.yearPublished}</p>
					{/if}
					<p>Players: {game.minPlayers}–{game.maxPlayers}</p>
					<p>Play Time: {game.playingTime} min</p>
					{#if game.age}
						<p>Age: {game.age}+</p>
					{/if}
				</div>
			</div>
		</div>

		<!-- Edit form -->
		<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="p-6 space-y-4">
			<div>
				<label class="block mb-2 font-bold" for="isStarred">
					<input type="checkbox" id="isStarred" bind:checked={isStarred} class="mr-2" />
					Mark as Favorite
				</label>
			</div>

			<div>
				<label class="block mb-2 font-bold" for="adminNote"> Admin Note </label>
				<textarea id="adminNote" bind:value={adminNote} class="w-full p-2 border rounded" rows="4"
				></textarea>
			</div>

			<div class="flex justify-between items-center">
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
