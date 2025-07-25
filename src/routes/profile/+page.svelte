<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';

	interface User {
		id: string;
		username: string;
		email: string;
		displayName: string | null;
		bio: string | null;
		experienceLevel: string | null;
		vibePreference: string | null;
		contactEmail: string | null;
		contactPhone: string | null;
		contactVisibleTo: string | null;
		lookingForParty: boolean | null;
		partyStatus: string | null;
		openToAnyGame: boolean | null;
		lastLogin: string | null;
	}

	interface PageData {
		user: User;
	}

	interface ActionData {
		success?: boolean;
		message?: string;
	}

	let { data, form }: { data: PageData; form: ActionData | null } = $props();

	let isUpdatingProfile = $state(false);
	let isUpdatingPartyStatus = $state(false);

	// Profile form data - bind directly to data.user for proper state sync

	// Party finder form data - bind directly to data.user for proper state sync

	const handleProfileSubmit: SubmitFunction = () => {
		isUpdatingProfile = true;
		return async ({ update }) => {
			await update({ reset: false });
			isUpdatingProfile = false;
		};
	};

	const handlePartyStatusSubmit: SubmitFunction = () => {
		isUpdatingPartyStatus = true;
		return async ({ update }) => {
			await update({ reset: false });
			isUpdatingPartyStatus = false;
		};
	};
</script>

<svelte:head>
	<title>Profile - Brads Spelcafé</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 py-8">
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="space-y-8">
			<!-- Header -->
			<div class="bg-white shadow rounded-lg px-6 py-8">
				<h1 class="text-3xl font-bold text-gray-900">Profile Settings</h1>
				<p class="mt-2 text-gray-600">Manage your account and party finder preferences</p>
			</div>

			<!-- Success/Error Messages -->
			{#if form?.success}
				<div class="bg-green-50 border border-green-200 rounded-md p-4">
					<div class="flex">
						<div class="text-sm text-green-700">
							{form.message}
						</div>
					</div>
				</div>
			{/if}

			{#if form?.message && !form?.success}
				<div class="bg-red-50 border border-red-200 rounded-md p-4">
					<div class="flex">
						<div class="text-sm text-red-700">
							{form.message}
						</div>
					</div>
				</div>
			{/if}

			<!-- Profile Information -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Profile Information</h2>
				</div>
				<form
					method="POST"
					action="?/updateProfile"
					use:enhance={handleProfileSubmit}
					class="px-6 py-4 space-y-6"
				>
					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<label for="display_name" class="block text-sm font-medium text-gray-700"
								>Display Name</label
							>
							<input
								type="text"
								id="display_name"
								name="display_name"
								required
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								bind:value={data.user.displayName}
								disabled={isUpdatingProfile}
							/>
							<p class="mt-1 text-sm text-gray-500">How other players will see you</p>
						</div>

						<div>
							<label for="experience_level" class="block text-sm font-medium text-gray-700"
								>Experience Level</label
							>
							<select
								id="experience_level"
								name="experience_level"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								bind:value={data.user.experienceLevel}
								disabled={isUpdatingProfile}
							>
								<option value="beginner">Beginner</option>
								<option value="intermediate">Intermediate</option>
								<option value="advanced">Advanced</option>
							</select>
						</div>

						<div>
							<label for="vibe_preference" class="block text-sm font-medium text-gray-700"
								>Play Style</label
							>
							<select
								id="vibe_preference"
								name="vibe_preference"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								bind:value={data.user.vibePreference}
								disabled={isUpdatingProfile}
							>
								<option value="casual">Casual</option>
								<option value="competitive">Competitive</option>
								<option value="both">Both</option>
							</select>
						</div>

						<div>
							<label for="contact_visible_to" class="block text-sm font-medium text-gray-700"
								>Contact Visibility</label
							>
							<select
								id="contact_visible_to"
								name="contact_visible_to"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								bind:value={data.user.contactVisibleTo}
								disabled={isUpdatingProfile}
							>
								<option value="none">Hidden</option>
								<option value="matches">Good Matches Only</option>
								<option value="all">All Users</option>
							</select>
						</div>
					</div>

					<div>
						<label for="bio" class="block text-sm font-medium text-gray-700">Bio</label>
						<textarea
							id="bio"
							name="bio"
							rows="3"
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="Tell other players about yourself..."
							bind:value={data.user.bio}
							disabled={isUpdatingProfile}
						></textarea>
						<p class="mt-1 text-sm text-gray-500">Optional - max 500 characters</p>
					</div>

					<div class="grid grid-cols-1 gap-6 sm:grid-cols-2">
						<div>
							<label for="contact_email" class="block text-sm font-medium text-gray-700"
								>Contact Email</label
							>
							<input
								type="email"
								id="contact_email"
								name="contact_email"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="contact@example.com"
								bind:value={data.user.contactEmail}
								disabled={isUpdatingProfile}
							/>
							<p class="mt-1 text-sm text-gray-500">Optional - for other players to reach you</p>
						</div>

						<div>
							<label for="contact_phone" class="block text-sm font-medium text-gray-700"
								>Contact Phone</label
							>
							<input
								type="tel"
								id="contact_phone"
								name="contact_phone"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder="+46 70 123 45 67"
								bind:value={data.user.contactPhone}
								disabled={isUpdatingProfile}
							/>
							<p class="mt-1 text-sm text-gray-500">Optional - for other players to reach you</p>
						</div>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							disabled={isUpdatingProfile}
							class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{#if isUpdatingProfile}
								Saving...
							{:else}
								Save Profile
							{/if}
						</button>
					</div>
				</form>
			</div>

			<!-- Party Finder Settings -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Party Finder Settings</h2>
				</div>
				<form
					method="POST"
					action="?/updatePartyStatus"
					use:enhance={handlePartyStatusSubmit}
					class="px-6 py-4 space-y-6"
				>
					<div class="flex items-center">
						<input
							id="looking_for_party"
							name="looking_for_party"
							type="checkbox"
							class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							bind:checked={data.user.lookingForParty}
							disabled={isUpdatingPartyStatus}
						/>
						<label for="looking_for_party" class="ml-2 block text-sm text-gray-900">
							I'm looking for players to game with
						</label>
					</div>

					<div>
						<label for="party_status" class="block text-sm font-medium text-gray-700">Status</label>
						<select
							id="party_status"
							name="party_status"
							class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							bind:value={data.user.partyStatus}
							disabled={isUpdatingPartyStatus}
						>
							<option value="active">Active - Show me to other players</option>
							<option value="resting">Resting - Hide me from party finder</option>
						</select>
					</div>

					<div class="flex items-center">
						<input
							id="open_to_any_game"
							name="open_to_any_game"
							type="checkbox"
							class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
							bind:checked={data.user.openToAnyGame}
							disabled={isUpdatingPartyStatus}
						/>
						<label for="open_to_any_game" class="ml-2 block text-sm text-gray-900">
							I'm open to playing any game
						</label>
					</div>

					<div class="flex justify-end">
						<button
							type="submit"
							disabled={isUpdatingPartyStatus}
							class="bg-indigo-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
						>
							{#if isUpdatingPartyStatus}
								Saving...
							{:else}
								Save Settings
							{/if}
						</button>
					</div>
				</form>
			</div>

			<!-- Account Info -->
			<div class="bg-white shadow rounded-lg">
				<div class="px-6 py-4 border-b border-gray-200">
					<h2 class="text-lg font-medium text-gray-900">Account Information</h2>
				</div>
				<div class="px-6 py-4 space-y-4">
					<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
						<div>
							<dt class="text-sm font-medium text-gray-500">Username</dt>
							<dd class="mt-1 text-sm text-gray-900">{data.user.username}</dd>
						</div>
						<div>
							<dt class="text-sm font-medium text-gray-500">Email</dt>
							<dd class="mt-1 text-sm text-gray-900">{data.user.email}</dd>
						</div>
					</div>
					{#if data.user.lastLogin}
						<div>
							<dt class="text-sm font-medium text-gray-500">Last Login</dt>
							<dd class="mt-1 text-sm text-gray-900">
								{new Date(data.user.lastLogin).toLocaleString()}
							</dd>
						</div>
					{/if}
				</div>
			</div>
		</div>
	</div>
</div>
