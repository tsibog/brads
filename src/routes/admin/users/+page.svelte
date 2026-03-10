<script lang="ts">
	import { onMount } from 'svelte';

	type UserRecord = {
		id: string;
		username: string;
		email: string | null;
		is_admin: boolean;
		must_reset_password: boolean;
		created_at: string;
	};

	let userList = $state<UserRecord[]>([]);
	let isLoading = $state(true);
	let message = $state('');
	let messageType = $state<'success' | 'error'>('success');

	async function fetchUsers() {
		isLoading = true;
		try {
			const res = await fetch('/api/users');
			if (res.ok) {
				userList = await res.json();
			}
		} catch {
			showMessage('Failed to load users', 'error');
		} finally {
			isLoading = false;
		}
	}

	function showMessage(msg: string, type: 'success' | 'error') {
		message = msg;
		messageType = type;
		setTimeout(() => (message = ''), 4000);
	}

	async function resetPassword(userId: string, username: string) {
		if (!confirm(`Reset password for "${username}"?\n\nTheir temporary password will be: amnesiac\nThey'll be prompted to set a new one on next login.`)) return;

		try {
			const res = await fetch('/api/users', {
				method: 'PUT',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId })
			});

			if (res.ok) {
				showMessage(`Password for "${username}" reset. Temporary password: amnesiac`, 'success');
				fetchUsers();
			} else {
				const err = await res.json();
				showMessage(err.error || 'Failed to reset password', 'error');
			}
		} catch {
			showMessage('Network error', 'error');
		}
	}

	async function deleteUser(userId: string, username: string) {
		if (!confirm(`Delete user "${username}"? This cannot be undone.`)) return;

		try {
			const res = await fetch(`/api/users?id=${userId}`, { method: 'DELETE' });
			if (res.ok) {
				showMessage(`User "${username}" deleted`, 'success');
				fetchUsers();
			} else {
				const err = await res.json();
				showMessage(err.error || 'Failed to delete user', 'error');
			}
		} catch {
			showMessage('Network error', 'error');
		}
	}

	function formatDate(timestamp: string | number) {
		return new Date(timestamp).toLocaleDateString('en-GB', {
			day: 'numeric',
			month: 'short',
			year: 'numeric'
		});
	}

	onMount(fetchUsers);
</script>

<svelte:head>
	<title>Manage Users - Brads Admin</title>
</svelte:head>

<div class="max-w-4xl mx-auto">
	<h1 class="text-2xl font-bold text-gray-800 mb-6">Manage Users</h1>

	{#if message}
		<div
			class="mb-4 px-4 py-3 rounded-lg {messageType === 'success'
				? 'bg-green-50 text-green-700 border border-green-200'
				: 'bg-red-50 text-red-700 border border-red-200'}"
		>
			{message}
		</div>
	{/if}

	{#if isLoading}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-t-2 border-brads-green-dark rounded-full animate-spin"></div>
		</div>
	{:else}
		<div class="bg-white rounded-lg shadow overflow-hidden">
			<table class="w-full">
				<thead>
					<tr class="bg-gray-50 border-b">
						<th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Username</th>
						<th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
						<th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
						<th class="text-left px-4 py-3 text-sm font-medium text-gray-500">Joined</th>
						<th class="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
					</tr>
				</thead>
				<tbody>
					{#each userList as user}
						<tr class="border-b last:border-0 hover:bg-gray-50">
							<td class="px-4 py-3 font-medium">{user.username}</td>
							<td class="px-4 py-3 text-sm text-gray-500">{user.email || '—'}</td>
							<td class="px-4 py-3">
								<div class="flex flex-wrap gap-1">
									{#if user.is_admin}
										<span class="inline-block px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
											Admin
										</span>
									{:else}
										<span class="inline-block px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full">
											User
										</span>
									{/if}
									{#if user.must_reset_password}
										<span class="inline-block px-2 py-0.5 text-xs font-medium bg-amber-100 text-amber-700 rounded-full">
											Password Reset Pending
										</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3 text-sm text-gray-500">{formatDate(user.created_at)}</td>
							<td class="px-4 py-3 text-right">
								<div class="flex justify-end gap-2">
									<button
										onclick={() => resetPassword(user.id, user.username)}
										class="text-sm px-3 py-1 rounded bg-blue-50 text-blue-600 hover:bg-blue-100"
									>
										Reset Password
									</button>
									{#if !user.is_admin}
										<button
											onclick={() => deleteUser(user.id, user.username)}
											class="text-sm px-3 py-1 rounded bg-red-50 text-red-600 hover:bg-red-100"
										>
											Delete
										</button>
									{/if}
								</div>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>

		{#if userList.length === 0}
			<p class="text-center text-gray-500 py-8">No users found.</p>
		{/if}
	{/if}
</div>
