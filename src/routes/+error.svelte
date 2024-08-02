<script lang="ts">
	import { page } from '$app/stores';

	const errorMessages = [
		'Oops! Looks like this game piece got lost under the couch.',
		'Sorry! This card seems to have been shuffled out of the deck.',
		"Oh no! This tile doesn't fit on our board.",
		'Whoops! This move is outside the boundaries of our game board.'
	];

	const randomMessage = errorMessages[Math.floor(Math.random() * errorMessages.length)];
</script>

<svelte:head>
	<title>404 - Page Not Found</title>
</svelte:head>

<main
	class="flex flex-col items-center justify-center min-h-screen bg-brads-yellow-light text-brads-green-dark"
>
	<h1 class="text-6xl font-londrina mb-4">{$page.status}</h1>
	<p class="text-2xl mb-8 text-center max-w-md">{randomMessage}</p>
	<p class="mb-8">Error: {$page.error?.message}</p>
	<a
		href="/"
		class="bg-brads-green-dark text-white px-6 py-3 rounded-full hover:bg-brads-green transition duration-300"
	>
		Retreat to safety
	</a>
</main>
