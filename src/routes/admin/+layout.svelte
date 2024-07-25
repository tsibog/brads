<script>
	import { page } from '$app/stores';
</script>

<div class="flex h-screen bg-gray-100">
	<!-- Sidebar -->
	<aside class="w-64 bg-brads-yellow-light shadow-md">
		<nav class="p-4">
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
	</aside>

	<!-- Main content -->
	<main class="flex-1 p-8 overflow-y-auto">
		<slot />
	</main>
</div>
