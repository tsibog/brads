function debounce<T extends (...args: unknown[]) => void>(
	func: T,
	wait: number = 500
): (...args: Parameters<T>) => void {
	let timeout: ReturnType<typeof setTimeout> | null = null;

	return (...args: Parameters<T>) => {
		if (timeout) clearTimeout(timeout);

		timeout = setTimeout(() => {
			func(...args);
		}, wait);
	};
}
export default debounce;
