<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DaySelector from './DaySelector.svelte';
	import GameSelector from './GameSelector.svelte';

	interface Props {
		lookingForParty: boolean;
		openToAnyGame: boolean;
		selectedDays: number[];
		selectedGames: Array<{ bggId: string; name: string; thumbnail: string | null }>;
		form: any;
	}

	let { lookingForParty, openToAnyGame, selectedDays, selectedGames, form }: Props = $props();

	let isSaving = $state(false);
	let localDays = $state(selectedDays);
	let localGames = $state(selectedGames);

	const handleSubmit: SubmitFunction = ({ formData }) => {
		formData.set('selected_days', JSON.stringify(localDays));
		formData.set('selected_games', JSON.stringify(localGames.map((g) => g.bggId)));
		isSaving = true;
		return async ({ update }) => {
			await update({ reset: false });
			isSaving = false;
		};
	};
</script>

<div class="bg-white rounded-xl shadow border border-brads-green-light/20 p-5">
	<h2 class="text-xl font-londrina text-brads-green-dark mb-4">Your Settings</h2>

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 text-sm text-green-700">
			{form.message}
		</div>
	{/if}
	{#if form?.message && !form?.success}
		<div class="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
			{form.message}
		</div>
	{/if}

	<form method="POST" action="?/updateSettings" use:enhance={handleSubmit} class="space-y-5">
		<div class="flex items-center gap-3">
			<input
				type="checkbox"
				id="looking_for_party"
				name="looking_for_party"
				checked={lookingForParty}
				disabled={isSaving}
				class="h-4 w-4 text-brads-green-dark rounded border-gray-300"
			/>
			<label for="looking_for_party" class="text-sm font-medium text-gray-700">
				I'm looking for people to play with
			</label>
		</div>

		<div class="flex items-center gap-3">
			<input
				type="checkbox"
				id="open_to_any_game"
				name="open_to_any_game"
				checked={openToAnyGame}
				disabled={isSaving}
				class="h-4 w-4 text-brads-green-dark rounded border-gray-300"
			/>
			<label for="open_to_any_game" class="text-sm font-medium text-gray-700">
				Open to any game
			</label>
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Available Days</label>
			<DaySelector bind:selectedDays={localDays} disabled={isSaving} />
		</div>

		<div>
			<label class="block text-sm font-medium text-gray-700 mb-2">Preferred Games</label>
			<GameSelector bind:selectedGames={localGames} maxGames={4} disabled={isSaving} />
		</div>

		<button
			type="submit"
			disabled={isSaving}
			class="w-full px-4 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors disabled:opacity-50"
		>
			{isSaving ? 'Saving...' : 'Save Settings'}
		</button>
	</form>
</div>
