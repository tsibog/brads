<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { Chart, registerables } from 'chart.js';

	Chart.register(...registerables);

	let period = $state(30);
	let isLoading = $state(true);
	let analytics = $state<any>(null);
	let lineChart: Chart | null = null;
	let barChart: Chart | null = null;
	let lineCanvas: HTMLCanvasElement;
	let barCanvas: HTMLCanvasElement;

	let periodLabel = $derived(period === 0 ? 'All time' : `Last ${period} days`);

	async function fetchAnalytics() {
		isLoading = true;
		try {
			const response = await fetch(`/api/analytics?period=${period}`);
			if (response.ok) {
				analytics = await response.json();
				await tick();
				renderCharts();
			}
		} catch (error) {
			console.error('Failed to fetch analytics:', error);
		} finally {
			isLoading = false;
		}
	}

	function renderCharts() {
		if (!analytics) return;

		// Destroy previous charts
		lineChart?.destroy();
		barChart?.destroy();

		// For all-time, use the raw data from the API; otherwise fill missing dates
		const dates =
			period === 0 ? analytics.viewsPerDay : fillDateRange(analytics.viewsPerDay, period);

		// Views over time (line chart)
		lineChart = new Chart(lineCanvas, {
			type: 'line',
			data: {
				labels: dates.map((d) => formatDate(d.date)),
				datasets: [
					{
						label: 'Page Views',
						data: dates.map((d) => d.views),
						borderColor: '#538874',
						backgroundColor: 'rgba(83, 136, 116, 0.1)',
						fill: true,
						tension: 0.3,
						pointRadius: 2,
						pointHoverRadius: 5
					}
				]
			},
			options: {
				responsive: true,
				maintainAspectRatio: false,
				plugins: {
					legend: { display: false }
				},
				scales: {
					y: {
						beginAtZero: true,
						ticks: { precision: 0 }
					},
					x: {
						ticks: {
							maxTicksLimit: 10,
							maxRotation: 0
						}
					}
				}
			}
		});

		// Top games (bar chart)
		if (analytics.topGames.length > 0) {
			barChart = new Chart(barCanvas, {
				type: 'bar',
				data: {
					labels: analytics.topGames.map((g: any) => truncate(g.gameName, 20)),
					datasets: [
						{
							label: 'Views',
							data: analytics.topGames.map((g: any) => g.views),
							backgroundColor: '#8bbf7e',
							borderColor: '#1a6045',
							borderWidth: 1,
							borderRadius: 4
						}
					]
				},
				options: {
					responsive: true,
					maintainAspectRatio: false,
					indexAxis: 'y',
					plugins: {
						legend: { display: false }
					},
					scales: {
						x: {
							beginAtZero: true,
							ticks: { precision: 0 }
						}
					}
				}
			});
		}
	}

	function fillDateRange(
		viewsPerDay: { date: string; views: number }[],
		days: number
	): { date: string; views: number }[] {
		const viewsMap = new Map(viewsPerDay.map((d) => [d.date, d.views]));
		const result: { date: string; views: number }[] = [];
		const now = new Date();

		for (let i = days - 1; i >= 0; i--) {
			const date = new Date(now);
			date.setDate(date.getDate() - i);
			const dateStr = date.toISOString().split('T')[0];
			result.push({
				date: dateStr,
				views: viewsMap.get(dateStr) || 0
			});
		}
		return result;
	}

	function formatDate(dateStr: string): string {
		const d = new Date(dateStr + 'T00:00:00');
		return d.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
	}

	function truncate(str: string, len: number): string {
		return str.length > len ? str.slice(0, len) + '...' : str;
	}

	function handlePeriodChange(newPeriod: number) {
		period = newPeriod;
		fetchAnalytics();
	}

	onMount(() => {
		fetchAnalytics();
	});
</script>

<svelte:head>
	<title>Analytics - Brads Admin</title>
</svelte:head>

<div class="max-w-6xl mx-auto">
	<div class="flex items-center justify-between mb-6">
		<h1 class="text-2xl font-bold text-gray-800">Analytics</h1>
		<div class="flex gap-2">
			{#each [{ value: 7, label: '7d' }, { value: 30, label: '30d' }, { value: 90, label: '90d' }, { value: 0, label: 'All' }] as { value, label }}
				<button
					onclick={() => handlePeriodChange(value)}
					class="px-3 py-1.5 rounded-lg text-sm font-medium transition-colors
						{period === value
							? 'bg-brads-green-dark text-white'
							: 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'}"
				>
					{label}
				</button>
			{/each}
		</div>
	</div>

	{#if isLoading && !analytics}
		<div class="flex justify-center py-12">
			<div class="w-8 h-8 border-t-2 border-brads-green-dark rounded-full animate-spin"></div>
		</div>
	{:else if analytics}
		<!-- Stat cards -->
		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
			<div class="bg-white rounded-lg shadow p-5">
				<p class="text-sm text-gray-500 uppercase tracking-wide">Total Views</p>
				<p class="text-3xl font-bold text-gray-800">{analytics.totalViews.toLocaleString()}</p>
				<p class="text-xs text-gray-400 mt-1">{periodLabel}</p>
			</div>
			<div class="bg-white rounded-lg shadow p-5">
				<p class="text-sm text-gray-500 uppercase tracking-wide">Avg / Day</p>
				<p class="text-3xl font-bold text-gray-800">
					{period === 0
						? analytics.viewsPerDay.length > 0
							? (analytics.totalViews / analytics.viewsPerDay.length).toFixed(1)
							: '0'
						: (analytics.totalViews / period).toFixed(1)}
				</p>
				<p class="text-xs text-gray-400 mt-1">Page views</p>
			</div>
			<div class="bg-white rounded-lg shadow p-5">
				<p class="text-sm text-gray-500 uppercase tracking-wide">Games Viewed</p>
				<p class="text-3xl font-bold text-gray-800">{analytics.uniqueGames}</p>
				<p class="text-xs text-gray-400 mt-1">of {analytics.totalGames} total</p>
			</div>
			<div class="bg-white rounded-lg shadow p-5">
				<p class="text-sm text-gray-500 uppercase tracking-wide">Coverage</p>
				<p class="text-3xl font-bold text-gray-800">
					{analytics.totalGames > 0
						? Math.round((analytics.uniqueGames / analytics.totalGames) * 100)
						: 0}%
				</p>
				<p class="text-xs text-gray-400 mt-1">Games with views</p>
			</div>
		</div>

		<!-- Views over time -->
		<div class="bg-white rounded-lg shadow p-6 mb-8">
			<h2 class="text-lg font-bold text-gray-800 mb-4">Views Over Time</h2>
			<div class="h-64">
				<canvas bind:this={lineCanvas}></canvas>
			</div>
		</div>

		<!-- Top games -->
		<div class="bg-white rounded-lg shadow p-6">
			<h2 class="text-lg font-bold text-gray-800 mb-4">Most Viewed Games</h2>
			{#if analytics.topGames.length > 0}
				<div class="h-80">
					<canvas bind:this={barCanvas}></canvas>
				</div>
			{:else}
				<p class="text-gray-500 text-center py-8">No views recorded yet in this period.</p>
			{/if}
		</div>
	{/if}
</div>
