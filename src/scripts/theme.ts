// Theme toggle. The initial theme is resolved inline in <head> (see BaseHead)
// so first paint is already correct; this module only owns the button.
//
// Three states live in the DOM:
//   [data-theme] absent  → follow the system preference
//   [data-theme="light"] → reader chose light
//   [data-theme="dark"]  → reader chose dark
// Only an explicit choice is persisted.

const STORAGE_KEY = 'theme';
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
const root = document.documentElement;

const isDark = () =>
	root.dataset.theme === 'dark' ||
	(!root.dataset.theme && prefersDark.matches);

function applyButtonState(button: HTMLButtonElement) {
	const dark = isDark();
	button.setAttribute('aria-pressed', String(dark));
	const label = dark ? '切换到浅色主题' : '切换到深色主题';
	button.setAttribute('aria-label', label);
	button.title = label;
	root.style.removeProperty('color-scheme');
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
	applyButtonState(button);

	button.addEventListener('click', () => {
		const next = isDark() ? 'light' : 'dark';

		// Cross-fade the swap, then release the transition lock so ordinary
		// interactions stay snappy.
		root.dataset.themeSwitching = 'true';
		root.dataset.theme = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {
			/* Private mode — the choice simply does not persist. */
		}

		const settle = () => {
			delete root.dataset.themeSwitching;
		};
		if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) settle();
		else window.setTimeout(settle, 300);

		document
			.querySelector('meta[name="theme-color"]')
			?.setAttribute('content', next === 'dark' ? '#0a0a0a' : '#fafafa');

		for (const other of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
			applyButtonState(other);
		}
	});
}

prefersDark.addEventListener('change', () => {
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
		applyButtonState(button);
	}
});

// View transitions restore the document from cache; re-sync the buttons.
window.addEventListener('pageshow', () => {
	for (const button of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
		applyButtonState(button);
	}
});

export {};
