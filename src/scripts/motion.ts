// Content stays visible without JavaScript. Animate only as it enters the viewport.
const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
const targets = [...document.querySelectorAll<HTMLElement>('[data-reveal]')];
const running = new Map<HTMLElement, Animation>();
const seen = new WeakSet<HTMLElement>();

const finish = (element: HTMLElement) => {
  running.get(element)?.cancel();
  running.delete(element);
  element.dataset.motionState = 'complete';
};

if ('IntersectionObserver' in window && !preference.matches) {
  const observer = new IntersectionObserver((entries) => {
    const incoming = entries.filter((entry) => entry.isIntersecting);
    incoming.forEach((entry, index) => {
      const element = entry.target as HTMLElement;
      if (seen.has(element)) return;
      seen.add(element);
      observer.unobserve(element);
      if (preference.matches || element.contains(document.activeElement)) return;
      element.dataset.motionState = 'running';
      const animation = element.animate([
        { opacity: 0, transform: 'translateY(22px)' },
        { opacity: 1, transform: 'translateY(0)' },
      ], {
        duration: 640,
        delay: Math.min(index, 3) * 45,
        easing: 'cubic-bezier(.22, 1, .36, 1)',
        fill: 'backwards',
      });
      running.set(element, animation);
      animation.onfinish = () => finish(element);
    });
  }, { threshold: 0.08 });
  targets.forEach((element) => observer.observe(element));

  preference.addEventListener('change', () => {
    if (!preference.matches) return;
    observer.disconnect();
    [...running.keys()].forEach(finish);
  });
  document.addEventListener('focusin', (event) => {
    for (const element of running.keys()) {
      if (event.target instanceof Node && element.contains(event.target)) finish(element);
    }
  });
  // Restored pages should keep their last readable state without replaying.
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) [...running.keys()].forEach(finish);
  });
}
