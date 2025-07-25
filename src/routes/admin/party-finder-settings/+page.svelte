<script lang="ts">
	import { enhance } from '$app/forms';

	const {
		data,
		form
	}: {
		data: { inactiveDays: number };
		form: { success?: boolean; message?: string; error?: string; inactiveDays?: string } | null;
	} = $props();

	let inactiveDays = $state(form?.inactiveDays ? parseInt(form.inactiveDays) : data.inactiveDays);
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Brads Admin - Party Finder Settings</title>
</svelte:head>

<div class="max-w-2xl mx-auto">
	<div class="mb-6">
		<h1 class="text-3xl font-bold text-gray-900">Party Finder Settings</h1>
		<p class="text-gray-600 mt-2">Configure automated behavior for the party finder system.</p>
	</div>

	{#if form?.success}
		<div class="mb-6 p-4 bg-green-100 border border-green-200 rounded-md">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-green-800">{form.message}</p>
				</div>
			</div>
		</div>
	{/if}

	{#if form?.error}
		<div class="mb-6 p-4 bg-red-100 border border-red-200 rounded-md">
			<div class="flex">
				<div class="flex-shrink-0">
					<svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
						<path
							fill-rule="evenodd"
							d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
							clip-rule="evenodd"
						/>
					</svg>
				</div>
				<div class="ml-3">
					<p class="text-sm text-red-800">{form.error}</p>
				</div>
			</div>
		</div>
	{/if}

	<div class="bg-white shadow rounded-lg">
		<div class="px-6 py-4 border-b border-gray-200">
			<h2 class="text-lg font-medium text-gray-900">Automatic User Resting</h2>
			<p class="text-sm text-gray-600 mt-1">
				Users who haven't logged in for the specified number of days will be automatically set to
				"resting" status and hidden from the party finder.
			</p>
		</div>

		<form
			method="POST"
			action="?/updateSettings"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					await update();
					isSubmitting = false;
				};
			}}
			class="px-6 py-4"
		>
			<div class="space-y-4">
				<div>
					<label for="inactiveDays" class="block text-sm font-medium text-gray-700 mb-2">
						Days of inactivity before auto-resting
					</label>
					<div class="relative">
						<input
							type="number"
							id="inactiveDays"
							name="inactiveDays"
							bind:value={inactiveDays}
							min="1"
							max="365"
							required
							class="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
						/>
						<div class="absolute inset-y-0 right-0 flex items-center pr-3">
							<span class="text-gray-500 text-sm">days</span>
						</div>
					</div>
					<p class="text-xs text-gray-500 mt-1">
						Valid range: 1-365 days. Current setting: {data.inactiveDays} days
					</p>
				</div>

				<div class="bg-blue-50 p-4 rounded-md">
					<div class="flex">
						<div class="flex-shrink-0">
							<svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
								<path
									fill-rule="evenodd"
									d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
									clip-rule="evenodd"
								/>
							</svg>
						</div>
						<div class="ml-3">
							<h3 class="text-sm font-medium text-blue-800">How it works</h3>
							<div class="mt-2 text-sm text-blue-700">
								<ul class="list-disc pl-5 space-y-1">
									<li>
										Users who haven't logged in for {inactiveDays} days will be automatically hidden
										from party finder
									</li>
									<li>
										When they log back in, they'll be automatically reactivated if they were
										auto-rested
									</li>
									<li>Manual "resting" status is preserved and not affected by this setting</li>
									<li>The cleanup process runs daily via scheduled job</li>
								</ul>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div class="mt-6">
				<button
					type="submit"
					disabled={isSubmitting}
					class="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSubmitting}
						<svg
							class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
							xmlns="http://www.w3.org/2000/svg"
							fill="none"
							viewBox="0 0 24 24"
						>
							<circle
								class="opacity-25"
								cx="12"
								cy="12"
								r="10"
								stroke="currentColor"
								stroke-width="4"
							></circle>
							<path
								class="opacity-75"
								fill="currentColor"
								d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
							></path>
						</svg>
						Saving...
					{:else}
						Save Settings
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>
