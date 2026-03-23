import { searchInput, themeToggle, bootstrap } from './constants.js';
import { applyTheme, restorePreferences, savePreferences } from './preferences.js';
import * as dialogMethods from './dialogs.js';
import * as actionMethods from './actions.js';

export function createDashboardOptions() {
  return {
    delimiters: ['[[', ']]'],
    data() {
      return {
        items: [],
        allTags: [],
        sortBy: 'totalScore',
        viewMode: 'grid',
        groupBy: '',
        groupValue: '',
        onlyFavorites: false,
        detailsOpen: false,
        selectedItem: null,
        expandedItemIds: [],
        theme: bootstrap.theme ?? 'dark',
        searchQuery: '',
      };
    },
    computed: {
      favoriteItems() {
        return this.items.filter((item) => item.isFav);
      },
      groupOptions() {
        if (this.groupBy === 'tag') {
          return this.allTags.map((tag) => tag.content);
        }

        if (this.groupBy === 'type') {
          return ['url', 'app', 'server'];
        }

        if (this.groupBy === 'title') {
          return [
            ...new Set(
              this.items.map((item) => item.title.charAt(0).toUpperCase()),
            ),
          ];
        }

        return [];
      },
    },
    async mounted() {
      this.restorePreferences();
      applyTheme(this.theme);

      if (searchInput && this.searchQuery) {
        searchInput.value = this.searchQuery;
      }

      themeToggle?.addEventListener('click', () => {
        this.theme = this.theme === 'dark' ? 'light' : 'dark';
        applyTheme(this.theme);
        this.savePreferences();
      });

      searchInput?.addEventListener('input', () => {
        this.searchQuery = searchInput.value.trim();
        this.savePreferences();
        window.clearTimeout(this._searchTimeout);
        this._searchTimeout = window.setTimeout(() => this.fetchItems(), 180);
      });

      await this.fetchTags();
      await this.fetchItems();
    },
    watch: {
      sortBy() {
        this.savePreferences();
        this.fetchItems();
      },
      groupBy() {
        this.groupValue = '';
        this.savePreferences();
        this.fetchItems();
      },
      groupValue() {
        this.savePreferences();
        this.fetchItems();
      },
      onlyFavorites() {
        this.savePreferences();
        this.fetchItems();
      },
      viewMode() {
        this.savePreferences();
      },
    },
    methods: {
      restorePreferences,
      savePreferences,
      ...dialogMethods,
      ...actionMethods,
    },
  };
}
