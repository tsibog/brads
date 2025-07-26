<script lang="ts">
	import type { Player } from '$lib/server/db/schema';

	const { currentUser }: { currentUser: Player } = $props();
</script>

{#if !currentUser.lookingForParty}
	<div class="bg-yellow-50 border border-yellow-200 rounded-md p-4">
		<div class="flex">
			<div class="flex-shrink-0">
				<svg class="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
					<path
						fill-rule="evenodd"
						d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
						clip-rule="evenodd"
					/>
				</svg>
			</div>
			<div class="ml-3">
				<h3 class="text-sm font-medium text-yellow-800">
					You're not currently looking for players
				</h3>
				<div class="mt-2 text-sm text-yellow-700">
					<p>
						To appear in other players' searches and see contact information, enable "Looking for
						Party" in the sidebar settings on this page.
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}

{#if currentUser.partyStatus === 'resting'}
	<div class="bg-blue-50 border border-blue-200 rounded-md p-4">
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
				<h3 class="text-sm font-medium text-blue-800">You're currently resting</h3>
				<div class="mt-2 text-sm text-blue-700">
					<p>
						You won't appear in other players' searches while resting. Your status will
						automatically become active when you log in after being inactive.
					</p>
				</div>
			</div>
		</div>
	</div>
{/if}
