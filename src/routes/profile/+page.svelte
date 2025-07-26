<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import Icon from '@iconify/svelte';

	interface User {
		id: string;
		username: string;
		email: string;
		displayName: string | null;
		bio: string | null;
		experienceLevel: string | null;
		vibePreference: string | null;
		contactMethod: string | null;
		contactValue: string | null;
		contactVisibleTo: string | null;
		// Legacy fields for backward compatibility
		contactEmail: string | null;
		contactPhone: string | null;
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

	const handleProfileSubmit: SubmitFunction = () => {
		isUpdatingProfile = true;
		return async ({ update }) => {
			await update({ reset: false });
			isUpdatingProfile = false;
		};
	};

	// Get placeholder text based on contact method
	function getContactPlaceholder(method: string | null): string {
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

	// Initialize contact method and value from user data or defaults
	let contactMethod = $state(data.user.contactMethod || 'email');
	let contactValue = $state(data.user.contactValue || '');
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
							<label for="contact_method" class="block text-sm font-medium text-gray-700 mb-2"
								>Contact Method</label
							>
							<select
								id="contact_method"
								name="contact_method"
								bind:value={contactMethod}
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								disabled={isUpdatingProfile}
							>
								<option value="email">
									<Icon icon="mdi:email" class="inline w-4 h-4 mr-2" />
									Email
								</option>
								<option value="phone">
									<Icon icon="mdi:phone" class="inline w-4 h-4 mr-2" />
									Phone
								</option>
								<option value="whatsapp">
									<Icon icon="mdi:whatsapp" class="inline w-4 h-4 mr-2" />
									WhatsApp
								</option>
								<option value="discord">
									<Icon icon="mdi:discord" class="inline w-4 h-4 mr-2" />
									Discord
								</option>
							</select>
							<p class="mt-1 text-sm text-gray-500">Choose your preferred contact method</p>
						</div>

						<div>
							<label
								for="contact_value"
								class="flex items-center text-sm font-medium text-gray-700 mb-2"
							>
								<Icon
									icon="mdi:{contactMethod === 'email'
										? 'email'
										: contactMethod === 'phone'
											? 'phone'
											: contactMethod === 'whatsapp'
												? 'whatsapp'
												: 'discord'}"
									class="w-4 h-4 mr-2"
								/>
								{contactMethod === 'email'
									? 'Email Address'
									: contactMethod === 'phone'
										? 'Phone Number'
										: contactMethod === 'whatsapp'
											? 'WhatsApp Number'
											: 'Discord Username'}
							</label>
							<input
								type={contactMethod === 'email'
									? 'email'
									: contactMethod === 'phone' || contactMethod === 'whatsapp'
										? 'tel'
										: 'text'}
								id="contact_value"
								name="contact_value"
								class="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
								placeholder={getContactPlaceholder(contactMethod)}
								bind:value={contactValue}
								disabled={isUpdatingProfile}
							/>
							<p class="mt-1 text-sm text-gray-500">For other players to reach you</p>
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
