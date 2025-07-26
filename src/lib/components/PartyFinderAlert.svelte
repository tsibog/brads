<script lang="ts">
	import type { ActionData } from '../../routes/party-finder/$types';

	const { form }: { form: ActionData | null } = $props();
</script>

{#if form?.success}
	<div class="bg-green-50 border border-green-200 rounded-md p-4 mb-6">
		<div class="text-sm text-green-700">
			{form.message}
		</div>
	</div>
{/if}

{#if form?.message && !form?.success}
	<div class="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
		<div class="text-sm text-red-700">
			{form.message}
		</div>
	</div>
{/if}
