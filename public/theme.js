(() => {
  let theme = 'dark';
  try { theme = localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'; } catch {}
  document.documentElement.dataset.theme = theme;
  const root = document.documentElement;
  if (root.dataset.composition) {
    const phone = matchMedia('(max-width: 760px)');
    function syncLayout() {
      root.dataset.layout = root.dataset.composition === 'sidebar' && !phone.matches ? 'sidebar' : 'studio';
    }
    syncLayout();
    phone.addEventListener('change', syncLayout);
  }
})();
