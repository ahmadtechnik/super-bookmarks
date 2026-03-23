const settingsBootstrapElement = document.getElementById('settings-bootstrap');
const settingsBootstrap = settingsBootstrapElement ? JSON.parse(settingsBootstrapElement.textContent) : {};
const settingsThemeToggle = document.getElementById('theme-toggle');

const { createApp } = Vue;

function syncThemeToggleIcon(theme) {
  const iconElement = settingsThemeToggle?.querySelector('i');

  if (!iconElement) {
    return;
  }

  iconElement.className = theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
  settingsThemeToggle.setAttribute(
    'aria-label',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
  settingsThemeToggle.setAttribute(
    'title',
    theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme',
  );
}

createApp({
  delimiters: ['[[', ']]'],
  data() {
    return {
      appPrefixes: settingsBootstrap.appPrefixes ?? [],
      statusMessage: '',
      theme: settingsBootstrap.theme ?? 'dark',
    };
  },
  mounted() {
    document.body.dataset.theme = this.theme;
    syncThemeToggleIcon(this.theme);

    settingsThemeToggle?.addEventListener('click', () => {
      this.theme = this.theme === 'dark' ? 'light' : 'dark';
      document.body.dataset.theme = this.theme;
      syncThemeToggleIcon(this.theme);
    });
  },
  methods: {
    addPrefix() {
      this.appPrefixes.push({ label: '', prefix: '' });
    },
    removePrefix(index) {
      this.appPrefixes.splice(index, 1);
    },
    async save() {
      const response = await fetch('/settings/app-prefixes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appPrefixes: this.appPrefixes }),
      });

      if (!response.ok) {
        this.statusMessage = 'Unable to save prefixes.';
        return;
      }

      this.statusMessage = 'Prefixes saved.';
    },
  },
}).mount('#settings-app');
