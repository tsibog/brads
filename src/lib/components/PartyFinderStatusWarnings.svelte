<script lang="ts">
	interface Props {
		lookingForParty: boolean | null;
		partyStatus: string | null;
	}

	let { lookingForParty, partyStatus }: Props = $props();
</script>

{#if !lookingForParty}
	<div class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-sm text-yellow-800">
		<p class="font-medium">You're not visible in the Party Finder</p>
		<p class="mt-1">
			Enable "I'm looking for people to play with" in the settings panel to appear in search
			results and see other players' contact info.
		</p>
	</div>
{:else if partyStatus === 'resting'}
	<div class="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
		<p class="font-medium">Your status is currently "Resting"</p>
		<p class="mt-1">
			You were automatically set to resting due to inactivity. Update your settings to reactivate
			your profile.
		</p>
	</div>
{/if}
