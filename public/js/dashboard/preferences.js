import { preferencesStorageKey, themeToggle } from './constants.js';

export function restorePreferences() {
  try {
    const rawPreferences = window.localStorage.getItem(preferencesStorageKey);
    if (!rawPreferences) {
      return;
    }

    const preferences = JSON.parse(rawPreferences);
    this.sortBy =
      typeof preferences.sortBy === 'string' ? preferences.sortBy : this.sortBy;
    this.viewMode = preferences.viewMode === 'list' ? 'list' : this.viewMode;
    this.groupBy =
      typeof preferences.groupBy === 'string' ? preferences.groupBy : this.groupBy;
    this.groupValue =
      typeof preferences.groupValue === 'string'
        ? preferences.groupValue
        : this.groupValue;
    this.onlyFavorites = Boolean(preferences.onlyFavorites);
    this.theme = preferences.theme === 'light' ? 'light' : this.theme;
    this.searchQuery =
      typeof preferences.searchQuery === 'string'
        ? preferences.searchQuery
        : '';
  } catch {
    window.localStorage.removeItem(preferencesStorageKey);
  }
}

export function savePreferences() {
  try {
    window.localStorage.setItem(
      preferencesStorageKey,
      JSON.stringify({
        sortBy: this.sortBy,
        viewMode: this.viewMode,
        groupBy: this.groupBy,
        groupValue: this.groupValue,
        onlyFavorites: this.onlyFavorites,
        theme: this.theme,
        searchQuery: this.searchQuery,
      }),
    );
  } catch {
    // Ignore localStorage write failures.
  }
}

export function applyTheme(theme) {
  document.body.dataset.theme = theme;
  syncThemeToggleIcon(theme);
}

export function syncThemeToggleIcon(theme) {
  const iconElement = themeToggle?.querySelector('i');

  if (!iconElement) {
    return;
  }

  iconElement.className =
    theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';

  if (themeToggle) {
    themeToggle.setAttribute(
      'aria-label',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    );
    themeToggle.setAttribute(
      'title',
      theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
    );
  }
}
