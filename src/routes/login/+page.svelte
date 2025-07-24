<script lang="ts">
	import { enhance } from '$app/forms';

	let { form }: { form: any } = $props();

	let username = $state('');
	let password = $state('');
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
	<title>Sign In - Brads Spelcafé</title>
</svelte:head>

<div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
	<div class="max-w-md w-full space-y-8">
		<div>
			<h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign In</h2>
			<p class="mt-2 text-center text-sm text-gray-600">
				Access your account to find gaming partners
			</p>
		</div>

		<form method="POST" use:enhance={handleSubmit} class="mt-8 space-y-6">
			<div class="-space-y-px rounded-md shadow-sm">
				<div>
					<label for="username" class="sr-only">Username</label>
					<input
						id="username"
						name="username"
						type="text"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Username"
						bind:value={username}
						disabled={isSubmitting}
					/>
				</div>
				<div>
					<label for="password" class="sr-only">Password</label>
					<input
						id="password"
						name="password"
						type="password"
						required
						class="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-hidden focus:ring-3 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
						placeholder="Password"
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
						Signing In...
					{:else}
						Sign In
					{/if}
				</button>
			</div>

			<div class="text-center">
				<p class="text-sm text-gray-600">
					Don't have an account?
					<a href="/register" class="font-medium text-indigo-600 hover:text-indigo-500">
						Create one here
					</a>
				</p>
			</div>
		</form>
	</div>
</div>
