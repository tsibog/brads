<script lang="ts">
	import { onMount } from 'svelte';

	const { isOpen, onConfirm, onCancel, title, message } = $props<{
		isOpen: boolean;
		onConfirm: () => void;
		onCancel: () => void;
		title: string;
		message: string;
	}>();

	let dialog: HTMLDialogElement;

	$effect(() => {
		if (isOpen && dialog) {
			dialog.showModal();
		} else if (dialog) {
			dialog.close();
		}
	});

	function handleCancel() {
		dialog.close();
		onCancel();
	}

	function handleConfirm() {
		dialog.close();
		onConfirm();
	}
</script>

<dialog bind:this={dialog} class="p-4 max-w-sm rounded-lg shadow-xl">
	<div class="flex flex-col items-center">
		<svg
			class="w-6 h-6 text-red-600 mb-4"
			xmlns="http://www.w3.org/2000/svg"
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
			/>
		</svg>
		<h3 class="text-lg font-semibold mb-2">{title}</h3>
		<p class="text-sm text-gray-600 text-center mb-4">{message}</p>
		<div class="flex justify-end space-x-2 w-full">
			<button
				class="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded hover:bg-gray-100"
				onclick={handleCancel}
			>
				Cancel
			</button>
			<button
				class="px-4 py-2 text-sm rounded hover:bg-red-500 text-red-200 bg-red-700"
				onclick={handleConfirm}
			>
				Delete
			</button>
		</div>
	</div>
</dialog>

<style>
	dialog::backdrop {
		background-color: rgba(0, 0, 0, 0.5);
	}
</style>
