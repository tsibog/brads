<script lang="ts">
	import { page } from '$app/stores';
	import { enhance } from '$app/forms';

	let { children, data } = $props();
	let isLoggingOut = $state(false);
	const pendingCommentsCount = $derived.by(() => {
		return data.pendingCommentsCount;
	});

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
					<li>
						<a
							href="/admin/comments"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/comments'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Moderate Comments
							{#if pendingCommentsCount > 0}
								<span
									class="inline-block ml-2 px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full"
								>
									{pendingCommentsCount}
								</span>
							{/if}
						</a>
					</li>
					<li>
						<a
							href="/admin/party-finder-settings"
							class="block p-2 rounded hover:bg-brads-green-light {$page.url.pathname.includes(
								'/party-finder-settings'
							)
								? 'bg-brads-green font-bold'
								: ''}"
						>
							Party Finder Settings
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
