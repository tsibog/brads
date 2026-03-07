import { writable } from 'svelte/store';

export const adminViewMode = writable<'grid' | 'table'>('grid');
