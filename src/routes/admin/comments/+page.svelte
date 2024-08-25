<script lang="ts">
	import { fade } from 'svelte/transition';

	type Comment = {
		id: number;
		gameId: string;
		gameName: string;
		authorName: string;
		content: string;
		createdAt: string;
		isApproved: boolean;
	};

	const { data }: { data: { comments: Comment[] } } = $props();

	let comments = $state(data.comments);

	function formatDate(dateString: string): string {
		const date = new Date(dateString);

		const hours = date.getHours().toString().padStart(2, '0');
		const minutes = date.getMinutes().toString().padStart(2, '0');
		const day = date.getDate().toString().padStart(2, '0');
		const month = (date.getMonth() + 1).toString().padStart(2, '0');
		const year = date.getFullYear().toString();

		const weekdayFormatter = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
		const weekday = weekdayFormatter.format(date);

		return `${weekday} ${day}/${month}/${year} ${hours}:${minutes}`;
	}

	async function approveComment(id: number) {
		const response = await fetch('/api/comments', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, isApproved: true })
		});

		if (response.ok) {
			comments = comments.filter((comment) => comment.id !== id);
		} else {
			alert('Failed to approve comment');
		}
	}

	async function declineComment(id: number) {
		const response = await fetch('/api/comments', {
			method: 'PUT',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ id, isApproved: false })
		});

		if (response.ok) {
			comments = comments.filter((comment) => comment.id !== id);
		} else {
			alert('Failed to decline comment');
		}
	}
</script>

<svelte:head>
	<title>Admin - Comment Moderation</title>
</svelte:head>

<div class="container mx-auto px-4 py-8">
	<h1 class="text-3xl font-bold mb-6">Comment Moderation</h1>

	{#if comments.length === 0}
		<p class="text-xl">No comments pending approval.</p>
	{:else}
		<ul class="space-y-6">
			{#each comments as comment (comment.id)}
				<li transition:fade={{ duration: 300 }} class="bg-white p-6 rounded-lg shadow-md">
					<p class="font-semibold">{comment.authorName}</p>
					<p class="text-gray-600 text-sm mb-2">
						{formatDate(comment.createdAt)} | Game: {comment.gameName}
					</p>
					<p class="mb-4">{comment.content}</p>
					<div class="flex space-x-4">
						<button
							onclick={() => approveComment(comment.id)}
							class="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
						>
							Approve
						</button>
						<button
							onclick={() => declineComment(comment.id)}
							class="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
						>
							Decline
						</button>
					</div>
				</li>
			{/each}
		</ul>
	{/if}
</div>
