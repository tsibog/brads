export const AVAILABLE_LANGUAGES = [
	{ code: 'en', label: 'English', flag: '🇬🇧' },
	{ code: 'sv', label: 'Swedish', flag: '🇸🇪' },
	{ code: 'de', label: 'German', flag: '🇩🇪' },
	{ code: 'da', label: 'Danish', flag: '🇩🇰' },
	{ code: 'no', label: 'Norwegian', flag: '🇳🇴' },
	{ code: 'fi', label: 'Finnish', flag: '🇫🇮' },
	{ code: 'fr', label: 'French', flag: '🇫🇷' },
	{ code: 'es', label: 'Spanish', flag: '🇪🇸' },
	{ code: 'nl', label: 'Dutch', flag: '🇳🇱' },
	{ code: 'pl', label: 'Polish', flag: '🇵🇱' },
	{ code: 'ja', label: 'Japanese', flag: '🇯🇵' },
	{ code: 'zh', label: 'Chinese', flag: '🇨🇳' },
	{ code: 'ko', label: 'Korean', flag: '🇰🇷' },
	{ code: 'none', label: 'Language Independent', flag: '🌐' },
] as const;

export type LanguageCode = (typeof AVAILABLE_LANGUAGES)[number]['code'];

export function parseLanguages(raw: string | null | undefined): LanguageCode[] {
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed;
	} catch {
		// ignore
	}
	return [];
}

export function getLanguageInfo(code: string) {
	return AVAILABLE_LANGUAGES.find((l) => l.code === code);
}
