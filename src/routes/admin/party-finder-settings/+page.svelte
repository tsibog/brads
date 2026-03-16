<script lang="ts">
	import { enhance } from '$app/forms';

	let { data, form }: { data: any; form: any } = $props();
	let isSaving = $state(false);
	let isRunningCleanup = $state(false);

	const dayLabels: Record<number, string> = {
		0: 'Sunday',
		1: 'Monday',
		2: 'Tuesday',
		3: 'Wednesday',
		4: 'Thursday',
		5: 'Friday',
		6: 'Saturday'
	};
</script>

<div class="space-y-6">
	<h1 class="text-2xl font-bold text-gray-800">Party Finder Settings</h1>

	{#if form?.success}
		<div class="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
			{form.message}
		</div>
	{/if}
	{#if form?.message && !form?.success}
		<div class="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-700">
			{form.message}
		</div>
	{/if}

	<!-- Settings -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-lg font-semibold mb-4">Inactivity Settings</h2>
		<form
			method="POST"
			action="?/updateSettings"
			use:enhance={() => {
				isSaving = true;
				return async ({ update }) => {
					await update({ reset: false });
					isSaving = false;
				};
			}}
			class="flex items-end gap-4"
		>
			<div>
				<label for="inactive_days" class="block text-sm font-medium text-gray-700 mb-1">
					Days before auto-resting
				</label>
				<input
					type="number"
					id="inactive_days"
					name="inactive_days"
					min="1"
					max="365"
					value={data.inactiveDays}
					class="border border-gray-300 rounded-lg px-3 py-2 w-24 text-sm"
				/>
			</div>
			<button
				type="submit"
				disabled={isSaving}
				class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 disabled:opacity-50"
			>
				{isSaving ? 'Saving...' : 'Save'}
			</button>
		</form>

		<div class="mt-4 pt-4 border-t">
			<form
				method="POST"
				action="?/triggerCleanup"
				use:enhance={() => {
					isRunningCleanup = true;
					return async ({ update }) => {
						await update({ reset: false });
						isRunningCleanup = false;
					};
				}}
			>
				<button
					type="submit"
					disabled={isRunningCleanup}
					class="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm hover:bg-orange-700 disabled:opacity-50"
				>
					{isRunningCleanup ? 'Running...' : 'Run Cleanup Now'}
				</button>
				<p class="mt-1 text-xs text-gray-500">
					Manually trigger the inactive user cleanup. Runs automatically daily at 06:00 UTC.
				</p>
			</form>
		</div>
	</div>

	<!-- Analytics -->
	<div class="bg-white rounded-lg shadow p-6">
		<h2 class="text-lg font-semibold mb-4">Party Finder Analytics</h2>

		<div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
			<div class="bg-gray-50 rounded-lg p-4 text-center">
				<div class="text-2xl font-bold text-gray-800">{data.analytics.totalUsers}</div>
				<div class="text-sm text-gray-500">Total Users</div>
			</div>
			<div class="bg-green-50 rounded-lg p-4 text-center">
				<div class="text-2xl font-bold text-green-700">{data.analytics.activeUsers}</div>
				<div class="text-sm text-gray-500">Active in Party Finder</div>
			</div>
			<div class="bg-blue-50 rounded-lg p-4 text-center">
				<div class="text-2xl font-bold text-blue-700">{data.analytics.lookingForParty}</div>
				<div class="text-sm text-gray-500">Looking for Party</div>
			</div>
			<div class="bg-yellow-50 rounded-lg p-4 text-center">
				<div class="text-2xl font-bold text-yellow-700">{data.analytics.restingUsers}</div>
				<div class="text-sm text-gray-500">Auto-Rested</div>
			</div>
		</div>

		{#if data.analytics.totalUsers > 0}
			<div class="text-sm text-gray-500 mb-6">
				Adoption rate:
				<span class="font-medium text-gray-800">
					{Math.round((data.analytics.lookingForParty / data.analytics.totalUsers) * 100)}%
				</span>
				of users have opted into party finder
			</div>
		{/if}

		<!-- Popular days -->
		{#if data.analytics.popularDays.length > 0}
			<div class="mb-6">
				<h3 class="text-sm font-semibold text-gray-700 mb-2">Most Popular Days</h3>
				<div class="space-y-1">
					{#each data.analytics.popularDays as day}
						<div class="flex items-center gap-3">
							<span class="text-sm text-gray-600 w-24">{dayLabels[day.dayOfWeek]}</span>
							<div class="flex-1 bg-gray-100 rounded-full h-4">
								<div
									class="bg-brads-green-dark rounded-full h-4"
									style="width: {Math.round(
										(day.count / Math.max(...data.analytics.popularDays.map((d: any) => d.count))) *
											100
									)}%"
								></div>
							</div>
							<span class="text-sm text-gray-500 w-8 text-right">{day.count}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Popular games -->
		{#if data.analytics.popularGames.length > 0}
			<div>
				<h3 class="text-sm font-semibold text-gray-700 mb-2">Most Requested Games</h3>
				<div class="space-y-1">
					{#each data.analytics.popularGames as game}
						<div class="flex items-center justify-between text-sm">
							<span class="text-gray-700">{game.name || game.gameBggId}</span>
							<span class="text-gray-500">{game.count} user{game.count !== 1 ? 's' : ''}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
	</div>
</div>
