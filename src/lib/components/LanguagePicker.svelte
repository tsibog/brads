<script lang="ts">
	import { AVAILABLE_LANGUAGES, type LanguageCode } from '$lib/utils/languages';

	let { selected = $bindable([]) }: { selected: LanguageCode[] } = $props();

	function toggle(code: LanguageCode) {
		if (selected.includes(code)) {
			selected = selected.filter((c) => c !== code);
		} else {
			selected = [...selected, code];
		}
	}
</script>

<div class="flex flex-wrap gap-2">
	{#each AVAILABLE_LANGUAGES as lang}
		<button
			type="button"
			onclick={() => toggle(lang.code)}
			class="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-sm border transition-colors
				{selected.includes(lang.code)
					? 'bg-brads-green-dark text-white border-brads-green-dark'
					: 'bg-white text-gray-700 border-gray-300 hover:border-gray-400'}"
		>
			<span>{lang.flag}</span>
			<span>{lang.label}</span>
		</button>
	{/each}
</div>
