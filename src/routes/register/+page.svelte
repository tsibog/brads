<script lang="ts">
	import { enhance } from '$app/forms';
	let { form }: { form: any } = $props();

	let username = $state('');
	let email = $state('');
	let password = $state('');
	let displayName = $state('');
	let isSubmitting = $state(false);

	function handleSubmit() {
		isSubmitting = true;
		return async ({ update }: any) => {
			await update();
			isSubmitting = false;
		};
	}
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
					<label for="email" class="block text-sm font-medium text-gray-700">Email</label>
					<input
						id="email"
						name="email"
						type="email"
						required
						class="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
						placeholder="your.email@example.com"
						bind:value={email}
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
