export const bootstrapElement = document.getElementById('dashboard-bootstrap');
export const bootstrap = bootstrapElement
  ? JSON.parse(bootstrapElement.textContent)
  : {};
export const searchInput = document.getElementById('dashboard-search');
export const themeToggle = document.getElementById('theme-toggle');
export const preferencesStorageKey = 'superbookmarks.dashboard.preferences';
export const tagCategoryOptions = [
  { value: 'social_media', label: 'Social Media' },
  { value: 'business', label: 'Business' },
  { value: 'tech', label: 'Tech' },
  { value: 'tools', label: 'Tools' },
  { value: 'infrastructure', label: 'Infrastructure' },
  { value: 'other', label: 'Other' },
];
