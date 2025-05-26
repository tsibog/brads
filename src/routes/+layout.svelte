<script>
	import '../app.css';
	import { dev } from '$app/environment';
	import { injectAnalytics } from '@vercel/analytics/sveltekit';

	injectAnalytics({ mode: dev ? 'development' : 'production' });
</script>

<div class="bg-brads-yellow-light min-h-screen font-londrina">
	<slot />
</div>
