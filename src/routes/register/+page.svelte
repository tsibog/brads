<script lang="ts">
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { fade, slide } from 'svelte/transition';
	import debounce from '$lib/utils/debounce';

	let { form }: { form: any } = $props();

	let username = $state('');
	let email = $state('');
	let phone = $state('');
	let password = $state('');
	let displayName = $state('');
	let isSubmitting = $state(false);

	// Game selection state
	let selectedGames: any[] = $state([]);
	let searchQuery = $state('');
	let searchResults: any[] = $state([]);
	let isLoading = $state(false);

	// Client-side validation states
	let emailError = $state('');
	let phoneError = $state('');
	let gameError = $state('');
	let contactError = $state('');

	const debouncedSearch = debounce(async () => {
		if (searchQuery.length < 2) {
			searchResults = [];
			return;
		}

		isLoading = true;
		try {
			const response = await fetch(`/api/games?name=${encodeURIComponent(searchQuery)}&limit=20`);
			if (!response.ok) {
				throw new Error('Network response was not ok');
			}
			const result = await response.json();
			const games = result.data || [];
			// Filter out games already selected
			const selectedBggIds = selectedGames.map((g) => g.bggId);
			searchResults = games.filter((game: any) => !selectedBggIds.includes(game.bggId));
		} catch (error) {
			console.error('Search error:', error);
			searchResults = [];
		} finally {
			isLoading = false;
		}
	}, 300);

	const addGame = (game: any) => {
		if (selectedGames.length >= 4) {
			gameError = 'You can select up to 4 games maximum';
			setTimeout(() => (gameError = ''), 3000);
			return;
		}

		selectedGames = [...selectedGames, game];
		searchQuery = '';
		searchResults = [];
		gameError = '';
	};

	const removeGame = (gameBggId: string) => {
		selectedGames = selectedGames.filter((g) => g.bggId !== gameBggId);
		gameError = '';
	};

	function validateForm() {
		let isValid = true;

		// Reset errors
		emailError = '';
		phoneError = '';
		gameError = '';
		contactError = '';

		// Contact validation - either email OR phone required
		if (!email.trim() && !phone.trim()) {
			contactError = 'Either email or phone number is required';
			isValid = false;
		}

		// Email format validation if provided
		if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
			emailError = 'Please enter a valid email address';
			isValid = false;
		}

		// Phone format validation if provided (basic)
		if (phone.trim() && !/^[+]?[\d\s\-\(\)]{8,}$/.test(phone.trim())) {
			phoneError = 'Please enter a valid phone number';
			isValid = false;
		}

		// Game selection validation
		if (selectedGames.length < 1) {
			gameError = 'Please select at least 1 preferred game';
			isValid = false;
		} else if (selectedGames.length > 4) {
			gameError = 'Please select no more than 4 games';
			isValid = false;
		}

		return isValid;
	}

	const handleSubmit: SubmitFunction = ({
		formData,
		cancel,
		action,
		formElement,
		controller,
		submitter
	}) => {
		// Run client-side validation for UX feedback
		validateForm();

		console.log('=== FORM SUBMISSION DEBUG ===');
		console.log('Selected games:', selectedGames);
		console.log('Selected games length:', selectedGames.length);
		console.log(
			'Selected game IDs:',
			selectedGames.map((g) => g.bggId)
		);

		isSubmitting = true;

		console.log('=== PRE-SUBMISSION: FORM DATA BEFORE APPEND ===');
		console.log('FormData entries:', Object.fromEntries(formData.entries()));

		// Always add selected games to form data (let server handle validation)
		const gameIds = selectedGames.map((g) => g.bggId);
		const gameIdsJson = JSON.stringify(gameIds);
		console.log('Appending selected_games:', gameIdsJson);

		formData.append('selected_games', gameIdsJson);

		console.log('=== PRE-SUBMISSION: FORM DATA AFTER APPEND ===');
		console.log('FormData entries:', Object.fromEntries(formData.entries()));
		console.log('selected_games field:', formData.get('selected_games'));
		console.log('=== SENDING TO SERVER ===');

		// Return result callback
		return async ({ result, update }) => {
			console.log('=== POST-SUBMISSION RESULT ===');
			console.log('Result:', result);
			await update();
			isSubmitting = false;
		};
	};

	$effect(() => {
		if (searchQuery.length < 2) {
			searchResults = [];
			return;
		}
		debouncedSearch();
	});
</script>

<svelte:head>
	<title>Register - Brads Spelcafé</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create Account</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Join the board gaming community at Brads Spelcafé
			</p>
		</div>

		<form method="POST" use:enhance={handleSubmit} class="mt-8 space-y-6">
			<div class="space-y-4">
				<div>
					<label for="username" class="block text-sm font-medium text-gray-700">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="Choose a username (3-31 characters)"
						bind:value={username}
						disabled={isSubmitting}
					/>
				</div>

				<div>
					<label for="display_name" class="block text-sm font-medium text-gray-700"
						>Display Name</label
					>
					<input
						id="display_name"
						name="display_name"
						type="text"
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="How you'd like to be shown to other players"
						bind:value={displayName}
						disabled={isSubmitting}
					/>
				</div>

				<!-- Contact Information Section -->
				<div class="space-y-3">
					<div class="border-t border-gray-200 pt-4">
						<h3 class="text-sm font-medium text-gray-900 mb-2">Contact Information</h3>
						<p class="text-xs text-gray-600 mb-3">
							Provide either email or phone number (or both). This will be used for login and party
							finder contact sharing.
						</p>

						{#if contactError}
							<div class="text-red-500 text-xs mb-2">{contactError}</div>
						{/if}
					</div>

					<div>
						<label for="email" class="block text-sm font-medium text-gray-700"
							>Email (optional if phone provided)</label
						>
						<input
							id="email"
							name="email"
							type="email"
							class="mt-1 appearance-none relative block w-full px-3 py-2 border {emailError
								? 'border-red-300'
								: 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="your.email@example.com"
							bind:value={email}
							disabled={isSubmitting}
						/>
						{#if emailError}
							<p class="text-red-500 text-xs mt-1">{emailError}</p>
						{/if}
					</div>

					<div>
						<label for="phone" class="block text-sm font-medium text-gray-700"
							>Phone Number (optional if email provided)</label
						>
						<input
							id="phone"
							name="phone"
							type="tel"
							class="mt-1 appearance-none relative block w-full px-3 py-2 border {phoneError
								? 'border-red-300'
								: 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
							placeholder="+46 70 123 45 67"
							bind:value={phone}
							disabled={isSubmitting}
						/>
						{#if phoneError}
							<p class="text-red-500 text-xs mt-1">{phoneError}</p>
						{/if}
					</div>
				</div>

				<div>
					<label for="password" class="block text-sm font-medium text-gray-700">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="At least 8 chars with uppercase, lowercase, number"
						bind:value={password}
						disabled={isSubmitting}
					/>
				</div>

				<!-- Game Preferences Section -->
				<div class="space-y-3">
					<div class="border-t border-gray-200 pt-4">
						<h3 class="text-sm font-medium text-gray-900 mb-2">Preferred Games (1-4 required)</h3>
						<p class="text-xs text-gray-600 mb-3">
							Select 1-4 board games from our café collection that you'd like to play. This helps us
							match you with compatible players.
						</p>

						{#if gameError}
							<div class="text-red-500 text-xs mb-2">{gameError}</div>
						{/if}
					</div>

					<!-- Game Search Input -->
					<div class="relative">
						<input
							bind:value={searchQuery}
							placeholder="Search café games..."
							class="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
							disabled={isSubmitting}
						/>
						{#if isLoading}
							<div class="absolute right-3 top-1/2 transform -translate-y-1/2">
								<div
									class="w-4 h-4 border-t-2 border-indigo-500 border-solid rounded-full animate-spin"
								></div>
							</div>
						{/if}
					</div>

					<!-- Search Results -->
					{#if searchResults.length > 0}
						<div
							class="bg-white border border-gray-200 rounded-md shadow-sm max-h-48 overflow-y-auto"
							transition:slide|local={{ duration: 200 }}
						>
							{#each searchResults as game}
								<button
									type="button"
									onclick={() => addGame(game)}
									class="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 flex items-center space-x-3"
									transition:fade|local={{ duration: 150 }}
									disabled={isSubmitting}
								>
									{#if game.thumbnail}
										<img
											src={game.thumbnail}
											alt={game.name}
											class="w-10 h-10 object-cover rounded flex-shrink-0"
										/>
									{:else}
										<div
											class="w-10 h-10 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center"
										>
											<svg
												class="w-5 h-5 text-gray-400"
												fill="none"
												stroke="currentColor"
												viewBox="0 0 24 24"
											>
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
												/>
											</svg>
										</div>
									{/if}
									<div class="flex-1 min-w-0">
										<div class="font-medium text-gray-900 truncate text-sm">{game.name}</div>
									</div>
									<svg
										class="w-4 h-4 text-gray-400"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2"
											d="M12 6v6m0 0v6m0-6h6m-6 0H6"
										/>
									</svg>
								</button>
							{/each}
						</div>
					{/if}

					<!-- Selected Games -->
					{#if selectedGames.length > 0}
						<div class="space-y-2">
							<h4 class="text-sm font-medium text-gray-700">
								Selected Games ({selectedGames.length}/4)
							</h4>
							<div class="space-y-2">
								{#each selectedGames as game}
									<div
										class="flex items-center justify-between bg-indigo-50 border border-indigo-200 rounded-md px-3 py-2"
										transition:slide|local={{ duration: 200 }}
									>
										<div class="flex items-center space-x-3">
											{#if game.thumbnail}
												<img
													src={game.thumbnail}
													alt={game.name}
													class="w-8 h-8 object-cover rounded flex-shrink-0"
												/>
											{:else}
												<div
													class="w-8 h-8 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center"
												>
													<svg
														class="w-4 h-4 text-gray-400"
														fill="none"
														stroke="currentColor"
														viewBox="0 0 24 24"
													>
														<path
															stroke-linecap="round"
															stroke-linejoin="round"
															stroke-width="2"
															d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
														/>
													</svg>
												</div>
											{/if}
											<div>
												<div class="font-medium text-indigo-900 text-sm">{game.name}</div>
											</div>
										</div>
										<button
											type="button"
											onclick={() => removeGame(game.bggId)}
											class="text-indigo-400 hover:text-indigo-600 transition-colors"
											title="Remove game"
											aria-label="Remove {game.name} from preferences"
											disabled={isSubmitting}
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path
													stroke-linecap="round"
													stroke-linejoin="round"
													stroke-width="2"
													d="M6 18L18 6M6 6l12 12"
												/>
											</svg>
										</button>
									</div>
								{/each}
							</div>
						</div>
					{:else}
						<div
							class="text-sm text-gray-500 italic border border-gray-200 rounded-md p-3 bg-gray-50"
						>
							No games selected. Search and select 1-4 games from our café collection above.
						</div>
					{/if}
				</div>
			</div>

			{#if form?.message}
				<div class="text-red-500 text-sm bg-red-50 p-3 rounded-md border border-red-200">
					{form.message}
				</div>
			{/if}

			<div>
				<button
					type="submit"
					disabled={isSubmitting}
					class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					{#if isSubmitting}
						Creating Account...
					{:else}
						Create Account
					{/if}
				</button>
			</div>

			<div class="text-center">
				<p class="text-sm text-gray-600">
					Already have an account?
					<a href="/login" class="font-medium text-indigo-600 hover:text-indigo-500">
						Sign in here
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
