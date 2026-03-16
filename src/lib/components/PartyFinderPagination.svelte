<script lang="ts">
	interface Props {
		currentPage: number;
		totalPages: number;
		totalCount: number;
		onPageChange: (page: number) => void;
	}

	let { currentPage, totalPages, totalCount, onPageChange }: Props = $props();

	function getPageNumbers(): (number | '...')[] {
		const pages: (number | '...')[] = [];
		const delta = 2;
		const start = Math.max(2, currentPage - delta);
		const end = Math.min(totalPages - 1, currentPage + delta);

		pages.push(1);
		if (start > 2) pages.push('...');
		for (let i = start; i <= end; i++) pages.push(i);
		if (end < totalPages - 1) pages.push('...');
		if (totalPages > 1) pages.push(totalPages);

		return pages;
	}
</script>

{#if totalPages > 1}
	<div class="flex items-center justify-between mt-6">
		<p class="text-sm text-gray-500">{totalCount} player{totalCount !== 1 ? 's' : ''} found</p>
		<div class="flex items-center gap-1">
			<button
				onclick={() => onPageChange(currentPage - 1)}
				disabled={currentPage <= 1}
				class="px-3 py-1 rounded text-sm border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
			>
				Prev
			</button>
			{#each getPageNumbers() as page}
				{#if page === '...'}
					<span class="px-2 text-gray-400">...</span>
				{:else}
					<button
						onclick={() => onPageChange(page)}
						class="px-3 py-1 rounded text-sm border {page === currentPage
							? 'bg-brads-green-dark text-white border-brads-green-dark'
							: 'border-gray-300 hover:bg-gray-50'}"
					>
						{page}
					</button>
				{/if}
			{/each}
			<button
				onclick={() => onPageChange(currentPage + 1)}
				disabled={currentPage >= totalPages}
				class="px-3 py-1 rounded text-sm border border-gray-300 disabled:opacity-30 hover:bg-gray-50"
			>
				Next
			</button>
		</div>
	</div>
{/if}
