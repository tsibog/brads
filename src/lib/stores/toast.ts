import { writable } from 'svelte/store';

type ToastMessage = {
	id: number;
	text: string;
	type: 'success' | 'error';
};

let nextId = 0;

export const toasts = writable<ToastMessage[]>([]);

export function toast(text: string, type: 'success' | 'error' = 'success') {
	const id = nextId++;
	toasts.update((all) => [...all, { id, text, type }]);
	setTimeout(() => {
		toasts.update((all) => all.filter((m) => m.id !== id));
	}, 3000);
}
