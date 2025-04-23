<script lang="ts">
	import { goto } from '$app/navigation';
	import type { BoardGame } from '$lib/server/db/schema';
	import ConfirmationModal from '$lib/components/ConfirmationModal.svelte';

	const {
		data
	}: {
		data: {
			game: {
				game: BoardGame;
			};
		};
	} = $props();

	$inspect(data);

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
			alert('Game updated successfully');
			goto('/admin/manage');
		} else {
			alert('Failed to update game');
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
			alert('Game deleted successfully');
			goto('/admin/manage');
		} else {
			alert('Failed to delete game');
		}
		closeDeleteModal();
	}
</script>

<div class="max-w-2xl mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
	<h1 class="text-2xl font-bold mb-6">Edit Game: {game.name}</h1>

	<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="space-y-4">
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

<ConfirmationModal
	isOpen={isDeleteModalOpen}
	onConfirm={confirmDelete}
	onCancel={closeDeleteModal}
	title="Confirm Deletion"
	message="Are you sure you want to delete this game? This action cannot be undone."
/>
