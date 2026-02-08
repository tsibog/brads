<script lang="ts">
	import { fly } from 'svelte/transition';
	import { toasts } from '$lib/stores/toast';
</script>

{#if $toasts.length > 0}
	<div class="fixed top-4 right-4 z-50 flex flex-col gap-2">
		{#each $toasts as msg (msg.id)}
			<div
				transition:fly={{ x: 300, duration: 300 }}
				class="px-4 py-3 rounded-lg shadow-lg text-white text-sm font-medium {msg.type ===
				'success'
					? 'bg-green-600'
					: 'bg-red-600'}"
			>
				{msg.text}
			</div>
		{/each}
	</div>
{/if}
