<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import DaySelector from '$lib/components/DaySelector.svelte';
	import GameSelector from '$lib/components/GameSelector.svelte';

	let { data, form }: { data: any; form: any } = $props();

	let isUpdating = $state(false);
	let selectedDays = $state<number[]>(data.availability ?? []);
	let selectedGames = $state(
		(data.gamePreferences ?? []).map((g: any) => ({
			bggId: g.bggId,
			name: g.name,
			thumbnail: g.thumbnail
		}))
	);

	let contactMethod = $state(data.user.contactMethod || 'email');

	const handleSubmit: SubmitFunction = ({ formData }) => {
		formData.set('selected_days', JSON.stringify(selectedDays));
		formData.set('selected_games', JSON.stringify(selectedGames));
		isUpdating = true;
		return async ({ update }) => {
			await update({ reset: false });
			isUpdating = false;
		};
	};

	function getContactPlaceholder(method: string): string {
		switch (method) {
			case 'email':
				return 'your.email@example.com';
			case 'phone':
				return '+46 70 123 45 67';
			case 'whatsapp':
				return '+46 70 123 45 67';
			case 'discord':
				return '@username or username#1234';
			default:
				return '';
		}
	}
</script>

<svelte:head>
	<title>Profile - Brads Spelcafe</title>
</svelte:head>

<div class="min-h-screen bg-brads-yellow-light py-8">
	<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
		<h1 class="text-3xl font-londrina text-brads-green-dark mb-6">Profile Settings</h1>

		<!-- Messages -->
		{#if form?.success}
			<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700 mb-6">
				{form.message}
			</div>
		{/if}
		{#if form?.message && !form?.success}
			<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700 mb-6">
				{form.message}
			</div>
		{/if}

		<form
			method="POST"
			action="?/updateProfile"
			use:enhance={handleSubmit}
		>
			<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
				<!-- Left column: Profile & Contact -->
				<div class="space-y-6">
					<!-- Profile Info -->
					<div class="bg-white shadow rounded-xl border border-brads-green-light/20">
						<div class="px-6 py-4 border-b border-gray-100">
							<h2 class="text-lg font-londrina text-brads-green-dark">Profile Information</h2>
						</div>
						<div class="px-6 py-4 space-y-4">
							<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
								<div>
									<label for="display_name" class="block text-sm font-medium text-gray-700">
										Display Name
									</label>
									<input
										type="text"
										id="display_name"
										name="display_name"
										required
										maxlength="50"
										value={data.user.displayName ?? ''}
										disabled={isUpdating}
										class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
									/>
								</div>
								<div>
									<label for="experience_level" class="block text-sm font-medium text-gray-700">
										Experience Level
									</label>
									<select
										id="experience_level"
										name="experience_level"
										value={data.user.experienceLevel ?? 'new'}
										disabled={isUpdating}
										class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
									>
										<option value="new">New to board games</option>
										<option value="some_experience">Some experience</option>
										<option value="experienced">Experienced</option>
									</select>
								</div>
								<div>
									<label for="play_style" class="block text-sm font-medium text-gray-700">
										Play Style
									</label>
									<select
										id="play_style"
										name="play_style"
										value={data.user.playStyle ?? 'either'}
										disabled={isUpdating}
										class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
									>
										<option value="casual">Casual</option>
										<option value="competitive">Competitive</option>
										<option value="either">Either</option>
									</select>
								</div>
								<div>
									<label for="contact_visible_to" class="block text-sm font-medium text-gray-700">
										Contact Visibility
									</label>
									<select
										id="contact_visible_to"
										name="contact_visible_to"
										value={data.user.contactVisibleTo ?? 'matches'}
										disabled={isUpdating}
										class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
									>
										<option value="none">Hidden</option>
										<option value="matches">Good Matches Only (50%+)</option>
										<option value="all">Everyone</option>
									</select>
								</div>
							</div>

							<div>
								<label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
								<textarea
									id="bio"
									name="bio"
									rows="3"
									maxlength="500"
									placeholder="Tell other players about yourself..."
									disabled={isUpdating}
									class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
								>{data.user.bio ?? ''}</textarea>
								<p class="mt-1 text-xs text-gray-400">Optional - max 500 characters</p>
							</div>
						</div>
					</div>

					<!-- Contact -->
					<div class="bg-white shadow rounded-xl border border-brads-green-light/20">
						<div class="px-6 py-4 border-b border-gray-100">
							<h2 class="text-lg font-londrina text-brads-green-dark">Contact Information</h2>
						</div>
						<div class="px-6 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<label for="contact_method" class="block text-sm font-medium text-gray-700">
									Contact Method
								</label>
								<select
									id="contact_method"
									name="contact_method"
									bind:value={contactMethod}
									disabled={isUpdating}
									class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
								>
									<option value="email">Email</option>
									<option value="phone">Phone</option>
									<option value="whatsapp">WhatsApp</option>
									<option value="discord">Discord</option>
								</select>
							</div>
							<div>
								<label for="contact_value" class="block text-sm font-medium text-gray-700">
									{contactMethod === 'email'
										? 'Email Address'
										: contactMethod === 'phone'
											? 'Phone Number'
											: contactMethod === 'whatsapp'
												? 'WhatsApp Number'
												: 'Discord Username'}
								</label>
								<input
									type={contactMethod === 'email' ? 'email' : 'text'}
									id="contact_value"
									name="contact_value"
									placeholder={getContactPlaceholder(contactMethod)}
									value={data.user.contactValue ?? ''}
									disabled={isUpdating}
									class="mt-1 block w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brads-green-light"
								/>
							</div>
						</div>
					</div>

					<!-- Account Info (read-only) -->
					<div class="bg-white shadow rounded-xl border border-brads-green-light/20">
						<div class="px-6 py-4 border-b border-gray-100">
							<h2 class="text-lg font-londrina text-brads-green-dark">Account Information</h2>
						</div>
						<div class="px-6 py-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
							<div>
								<dt class="text-sm font-medium text-gray-500">Username</dt>
								<dd class="mt-1 text-sm text-gray-900">{data.user.username}</dd>
							</div>
							{#if data.user.email}
								<div>
									<dt class="text-sm font-medium text-gray-500">Email</dt>
									<dd class="mt-1 text-sm text-gray-900">{data.user.email}</dd>
								</div>
							{/if}
							{#if data.user.lastLogin}
								<div>
									<dt class="text-sm font-medium text-gray-500">Last Login</dt>
									<dd class="mt-1 text-sm text-gray-900">
										{new Date(data.user.lastLogin).toLocaleString()}
									</dd>
								</div>
							{/if}
							{#if data.user.partyStatus}
								<div>
									<dt class="text-sm font-medium text-gray-500">Party Finder Status</dt>
									<dd class="mt-1 text-sm text-gray-900 capitalize">{data.user.partyStatus}</dd>
								</div>
							{/if}
						</div>
					</div>
				</div>

				<!-- Right column: Party Finder -->
				<div class="space-y-6">
					<div class="bg-white shadow rounded-xl border border-brads-green-light/20">
						<div class="px-6 py-4 border-b border-gray-100">
							<h2 class="text-lg font-londrina text-brads-green-dark">Party Finder</h2>
						</div>
						<div class="px-6 py-4 space-y-5">
							<div class="flex items-center gap-3">
								<input
									type="checkbox"
									id="looking_for_party"
									name="looking_for_party"
									checked={data.user.lookingForParty ?? false}
									disabled={isUpdating}
									class="h-4 w-4 text-brads-green-dark rounded border-gray-300 focus:ring-brads-green-light"
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
									checked={data.user.openToAnyGame ?? false}
									disabled={isUpdating}
									class="h-4 w-4 text-brads-green-dark rounded border-gray-300 focus:ring-brads-green-light"
								/>
								<label for="open_to_any_game" class="text-sm font-medium text-gray-700">
									Open to playing any game
								</label>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Available Days
								</label>
								<DaySelector bind:selectedDays disabled={isUpdating} />
								<p class="mt-1 text-xs text-gray-400">The cafe is closed on Mondays</p>
							</div>

							<div>
								<label class="block text-sm font-medium text-gray-700 mb-2">
									Preferred Games (up to 4)
								</label>
								<GameSelector bind:selectedGames maxGames={4} disabled={isUpdating} />
							</div>
						</div>
					</div>

					<!-- Submit -->
					<div class="flex justify-end">
						<button
							type="submit"
							disabled={isUpdating}
							class="px-6 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-lg hover:bg-brads-green-dark/90 transition-colors disabled:opacity-50"
						>
							{isUpdating ? 'Saving...' : 'Save Profile'}
						</button>
					</div>
				</div>
			</div>
		</form>
	</div>
</div>
