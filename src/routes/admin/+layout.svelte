<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { children } = $props();

	let isLoggingOut = $state(false);

	function handleLogout() {
		isLoggingOut = true;
	}

	$effect(() => {
		isLoggingOut = false;
	});
</script>

{#if $page.url.pathname !== '/admin/login' && $page.data.user}
	<div class="flex h-screen bg-gray-100">
		<!-- Sidebar -->
		<aside class="w-64 bg-brads-yellow-light shadow-md p-4 flex flex-col">
			<nav class="flex-grow pb-4">
				<h2 class="text-xl font-semibold mb-4 text-gray-800">Brads Admin</h2>
				<ul class="space-y-2">
					<li>
						<a
							href="/admin/manage"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/manage'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Manage Games
						</a>
					</li>
					<li>
						<a
							href="/admin/add-game"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/add-game'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Add New Game
						</a>
					</li>
				</ul>
			</nav>

			<!-- Logout form -->
			<form action="/admin/logout" method="POST" use:enhance={handleLogout} class="mt-auto">
				<button
					type="submit"
					class="w-full p-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors duration-200"
					disabled={isLoggingOut}
				>
					Logout
				</button>
			</form>
		</aside>

		<!-- Main content -->
		<main class="flex-1 p-8 overflow-y-auto">
			{@render children()}
		</main>
	</div>
{:else}
	{@render children()}
{/if}
