<script lang="ts">
	import { enhance } from '$app/forms';

	let { form } = $props();
	let isSubmitting = $state(false);
</script>

<svelte:head>
	<title>Login - Brads Spelcafe</title>
</svelte:head>

<main class="min-h-screen flex items-center justify-center bg-brads-yellow-light py-12 px-4">
	<div class="max-w-sm w-full">
		<div class="text-center mb-8">
			<h1 class="text-4xl font-londrina text-brads-green-dark">Brads Spelcafe</h1>
			<p class="text-lg font-londrina text-brads-green-dark/60 mt-1">Log in to track your plays</p>
		</div>

		<form
			method="POST"
			use:enhance={() => {
				isSubmitting = true;
				return async ({ update }) => {
					isSubmitting = false;
					await update();
				};
			}}
			class="bg-white rounded-xl shadow-md p-6 space-y-4 border border-brads-green-light/20"
		>
			<div>
				<label for="username" class="block font-londrina text-lg text-brads-green-dark mb-1">
					Username
				</label>
				<input
					id="username"
					name="username"
					type="text"
					required
					autocomplete="username"
					class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
				/>
			</div>

			<div>
				<label for="password" class="block font-londrina text-lg text-brads-green-dark mb-1">
					Password
				</label>
				<input
					id="password"
					name="password"
					type="password"
					required
					autocomplete="current-password"
					class="w-full border border-gray-300 rounded-lg px-4 py-2 font-londrina text-lg focus:outline-none focus:ring-2 focus:ring-brads-green-light"
				/>
			</div>

			{#if form?.message}
				<p class="text-red-600 font-londrina text-lg">{form.message}</p>
			{/if}

			<button
				type="submit"
				disabled={isSubmitting}
				class="w-full px-4 py-2 bg-brads-green-dark text-white rounded-lg font-londrina text-xl hover:bg-brads-green-dark/90 transition-colors disabled:opacity-50"
			>
				{isSubmitting ? 'Logging in...' : 'Log In'}
			</button>
		</form>

		<p class="text-center mt-4 font-londrina text-lg text-brads-green-dark/60">
			Don't have an account?
			<a href="/register" class="text-brads-green-dark underline hover:text-brads-green-light">
				Register
			</a>
		</p>

		<p class="text-center mt-2 font-londrina text-brads-green-dark/40">
			<a href="/plays" class="hover:text-brads-green-dark/60">Back to Game Plays</a>
		</p>
	</div>
</main>
