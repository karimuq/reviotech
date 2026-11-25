(function () {
  const STORAGE_KEY = 'revio_theme';

  function getPreferredTheme() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      return saved;
    }
    return 'dark';
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
  }

  applyTheme(getPreferredTheme());

  document.addEventListener('DOMContentLoaded', function () {
    const headerActions = document.querySelector('.header-actions');
    const headerContent = document.querySelector('.header-content');
    const target = headerActions || headerContent;
    if (!target || document.getElementById('theme-toggle')) {
      return;
    }

    const button = document.createElement('button');
    button.id = 'theme-toggle';
    button.className = 'theme-toggle';
    button.type = 'button';
    if (headerActions) {
      headerActions.prepend(button);
    } else {
      headerContent.appendChild(button);
    }

    function updateToggle() {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      button.innerHTML = isDark
        ? '<i class="fa-solid fa-sun" aria-hidden="true"></i>'
        : '<i class="fa-solid fa-moon" aria-hidden="true"></i>';
      button.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
      button.setAttribute('title', isDark ? 'Light mode' : 'Dark mode');
    }

    updateToggle();

    button.addEventListener('click', function () {
      const isDark = document.documentElement.getAttribute('data-theme') !== 'light';
      const nextTheme = isDark ? 'light' : 'dark';
      applyTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
      updateToggle();
    });
  });
})();
