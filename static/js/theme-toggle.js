window.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.getElementById('theme-toggle');
  if (!toggleButton) return;

  const storageKey = 'theme-preference';

  function getColorPreference() {
    const currentTheme = localStorage.getItem(storageKey);
    if (currentTheme) return currentTheme;
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }

  function setPreference(theme) {
    localStorage.setItem(storageKey, theme);
    reflectPreference();
  }

  function reflectPreference() {
    const theme = getColorPreference();
    document.documentElement.setAttribute('data-theme', theme);
    toggleButton.setAttribute('aria-label', theme === 'dark' ? 'ライトモードに切り替え' : 'ダークモードに切り替え');
  }

  // 初期反映 (aria-labelの適用など)
  reflectPreference();

  toggleButton.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const nextTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setPreference(nextTheme);
  });

  // OS設定の変更を監視
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', e => {
    if (!localStorage.getItem(storageKey)) {
      setPreference(e.matches ? 'dark' : 'light');
    }
  });
});
