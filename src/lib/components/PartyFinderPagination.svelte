<script lang="ts">
	import { browser } from '$app/environment';

	interface PaginationMeta {
		page: number;
		totalPages: number;
		totalCount: number;
	}

	let {
		meta,
		currentCount,
		onPageChange
	}: {
		meta: PaginationMeta;
		currentCount: number;
		onPageChange: (page: number) => Promise<void>;
	} = $props();

	const isMobile = $derived.by(() => {
		if (browser) {
			return window.innerWidth < 640;
		}
		return false;
	});

	const pageNumbers = $derived.by(() => {
		return generatePageNumbers(meta.page, meta.totalPages, isMobile);
	});

	function generatePageNumbers(
		current: number,
		total: number,
		isMobile: boolean
	): (number | string)[] {
		const delta = isMobile ? 1 : 2;
		const range = [];
		for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
			range.push(i);
		}

		if (current - delta > 2) {
			range.unshift('...');
		}
		if (current + delta < total - 1) {
			range.push('...');
		}

		range.unshift(1);
		if (total > 1) {
			range.push(total);
		}

		return range;
	}

	async function changePage(newPage: number) {
		if (newPage === meta.page) return;
		await onPageChange(newPage);
	}
</script>

{#snippet pageButton(
	onClick: () => Promise<void>,
	disabled: boolean,
	label: string | number,
	current: boolean = false
)}
	<button
		onclick={onClick}
		class="w-12 h-12 aspect-square text-sm rounded-sm {current
			? 'bg-blue-500 text-white'
			: disabled
				? 'bg-gray-300 text-gray-500'
				: 'bg-gray-200 text-gray-700 hover:bg-gray-300'}"
		{disabled}
	>
		{label}
	</button>
{/snippet}

{#if meta.totalPages > 1}
	<div class="px-6 py-4 border-t border-gray-200">
		<nav
			class="flex justify-center items-center flex-wrap gap-1 font-londrina"
			aria-label="Pagination"
		>
			{#each pageNumbers as pageNum}
				{#if pageNum === '...'}
					<span class="w-12 h-12 aspect-square flex items-center justify-center">...</span>
				{:else}
					{@render pageButton(
						() => changePage(Number(pageNum)),
						false,
						pageNum,
						meta.page === pageNum
					)}
				{/if}
			{/each}
		</nav>
		<div class="text-center text-sm text-gray-500 mt-2">
			Page {meta.page} of {meta.totalPages}
			(showing {currentCount} of {meta.totalCount} players)
		</div>
	</div>
{/if}
