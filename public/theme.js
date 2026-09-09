(() => {
  let theme = 'dark';
  try { theme = localStorage.getItem('portfolio-theme') === 'light' ? 'light' : 'dark'; } catch {}
  document.documentElement.dataset.theme = theme;
})();
