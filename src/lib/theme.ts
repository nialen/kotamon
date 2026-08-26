export const THEME_STORAGE_KEY = 'kotamon-theme';

export const THEME_BOOT_SCRIPT = `
  (function () {
    var root = document.documentElement;
    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    try {
      var storedTheme = window.localStorage.getItem('${THEME_STORAGE_KEY}');
      root.dataset.theme = storedTheme === 'light' || storedTheme === 'dark' ? storedTheme : systemTheme;
    } catch (error) {
      root.dataset.theme = systemTheme;
    }
  })();
`;
