import { tagCategoryOptions } from './constants.js';
import { cloneTemplateRoot } from './templates.js';

const swalDialogClasses = {
  popup: 'swal-dashboard-popup',
  confirmButton: 'swal-dashboard-confirm',
  cancelButton: 'swal-dashboard-cancel',
};

export async function openCreateTagDialog() {
  const dialogContent = cloneTemplateRoot('tag-dialog-template');
  const categoryField = dialogContent.querySelector('#swal-tag-category');

  if (categoryField) {
    tagCategoryOptions.forEach((option) => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      categoryField.appendChild(optionElement);
    });
  }

  const result = await Swal.fire({
    title: 'Create tag',
    width: 540,
    focusConfirm: false,
    confirmButtonText: 'Create tag',
    showCancelButton: true,
    buttonsStyling: false,
    customClass: swalDialogClasses,
    html: dialogContent,
    preConfirm: async () => {
      const content = document.getElementById('swal-tag-content')?.value.trim();
      const category = document.getElementById('swal-tag-category')?.value;

      if (!content) {
        Swal.showValidationMessage('Tag label is required.');
        return false;
      }

      const response = await fetch('/tag', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, category }),
      });

      if (!response.ok) {
        const message = await this.extractErrorMessage(
          response,
          'Unable to create tag.',
        );
        Swal.showValidationMessage(message);
        return false;
      }

      return response.json();
    },
  });

  if (!result.isConfirmed) {
    return null;
  }

  await this.fetchTags();

  await Swal.fire({
    icon: 'success',
    title: 'Tag created',
    text: `${result.value.content} is now available.`,
    timer: 1200,
    showConfirmButton: false,
    customClass: swalDialogClasses,
  });

  return result.value;
}

export async function openItemDialog({ mode, item = null }) {
  if (!this.allTags.length) {
    await this.fetchTags();
  }

  const formState = getInitialItemFormState(item);
  const dialogContent = cloneTemplateRoot('item-dialog-template');

  const result = await Swal.fire({
    title: mode === 'edit' ? 'Edit dashboard item' : 'Add dashboard item',
    width: 680,
    focusConfirm: false,
    confirmButtonText: mode === 'edit' ? 'Save changes' : 'Create item',
    showCancelButton: true,
    buttonsStyling: false,
    customClass: swalDialogClasses,
    html: dialogContent,
    didOpen: () => {
      populateItemForm(formState, this.allTags);

      const typeField = document.getElementById('swal-item-type');
      typeField?.addEventListener('change', syncItemFormByType);

      const tagSearchField = document.getElementById('swal-item-tag-search');
      tagSearchField?.addEventListener('input', filterTagOptions);
    },
    preConfirm: async () => {
      const payload = collectItemFormPayload();

      if (!payload) {
        return false;
      }

      const endpoint = mode === 'edit' ? `/item/${item.id}` : '/item';
      const method = mode === 'edit' ? 'PATCH' : 'POST';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await this.extractErrorMessage(
          response,
          mode === 'edit' ? 'Unable to update item.' : 'Unable to create item.',
        );
        Swal.showValidationMessage(message);
        return false;
      }

      return response.json();
    },
  });

  if (result.isConfirmed) {
    await this.fetchItems();
  }

  return result;
}

function getInitialItemFormState(item) {
  const type = item?.type ?? 'url';
  const metaData = item?.metaData ?? {};
  const tags = item?.tags?.map((tag) => tag.id) ?? [];

  if (type === 'url') {
    return {
      title: item?.title ?? '',
      description: item?.description ?? '',
      type,
      target: metaData.url ?? '',
      secondary: metaData.label ?? '',
      ip: '',
      isExternal: false,
      isFav: item?.isFav ?? false,
      tags,
    };
  }

  if (type === 'app') {
    return {
      title: item?.title ?? '',
      description: item?.description ?? '',
      type,
      target: metaData.target ?? '',
      secondary: metaData.appName ?? 'VS Code',
      ip: '',
      isExternal: false,
      isFav: item?.isFav ?? false,
      tags,
    };
  }

  return {
    title: item?.title ?? '',
    description: item?.description ?? '',
    type,
    target: metaData.hostname ?? '',
    secondary: metaData.domain ?? '',
    ip: metaData.ip ?? '',
    isExternal: metaData.is_external ?? false,
    isFav: item?.isFav ?? false,
    tags,
  };
}

function populateItemForm(formState, allTags) {
  document.getElementById('swal-item-title').value = formState.title;
  document.getElementById('swal-item-description').value =
    formState.description;
  document.getElementById('swal-item-type').value = formState.type;
  document.getElementById('swal-item-target').value = formState.target;
  document.getElementById('swal-item-secondary').value =
    formState.secondary;
  document.getElementById('swal-item-ip').value = formState.ip;
  document.getElementById('swal-item-external').checked = Boolean(
    formState.isExternal,
  );
  document.getElementById('swal-item-fav').checked = Boolean(formState.isFav);
  renderTagOptions(document.getElementById('swal-item-tags'), allTags, formState.tags);
  syncItemFormByType();
}

function syncItemFormByType() {
  const type = document.getElementById('swal-item-type').value;
  const primaryLabel = document.getElementById('swal-primary-label');
  const primaryHelp = document.getElementById('swal-primary-help');
  const secondaryLabel = document.getElementById('swal-secondary-label');
  const secondaryHelp = document.getElementById('swal-secondary-help');
  const targetField = document.getElementById('swal-item-target');
  const secondaryField = document.getElementById('swal-item-secondary');
  const serverOnlyFields = document.querySelectorAll('.server-only-field');

  if (type === 'url') {
    primaryLabel.textContent = 'URL';
    primaryHelp.textContent =
      'The browser destination opened when this item is triggered.';
    secondaryLabel.textContent = 'Link label';
    secondaryHelp.textContent =
      'Optional short label for future display or export use.';
    targetField.placeholder = 'https://example.com';
    secondaryField.placeholder = 'Production dashboard';
  } else if (type === 'app') {
    primaryLabel.textContent = 'Target path';
    primaryHelp.textContent =
      'Saved app prefixes from Settings will be prepended to this path.';
    secondaryLabel.textContent = 'App label';
    secondaryHelp.textContent =
      'Match this to a configured Settings prefix label.';
    targetField.placeholder = 'projects/acme-core';
    secondaryField.placeholder = 'VS Code';
  } else {
    primaryLabel.textContent = 'Hostname';
    primaryHelp.textContent =
      'Used as the default copied value when no domain is set.';
    secondaryLabel.textContent = 'Domain';
    secondaryHelp.textContent =
      'Preferred value copied when this server is triggered.';
    targetField.placeholder = 'db-01.internal';
    secondaryField.placeholder = 'db-01.internal.example.com';
  }

  serverOnlyFields.forEach((field) => {
    field.classList.toggle('hidden', type !== 'server');
    if (field.classList.contains('md:flex')) {
      field.classList.toggle('md:flex', type === 'server');
    }
  });
}

function renderTagOptions(field, allTags, selectedTagIds = []) {
  if (!field) {
    return;
  }

  field.replaceChildren();

  if (!allTags.length) {
    const emptyState = document.createElement('div');
    emptyState.className = 'tag-selector-empty';
    emptyState.textContent = 'No tags available yet';
    field.appendChild(emptyState);
    updateSelectedTagsCount();
    return;
  }

  allTags.forEach((tag) => {
    const optionElement = document.createElement('label');
    optionElement.className = 'tag-selector-option';
    optionElement.dataset.tagLabel = `${tag.content} ${tag.category}`.toLowerCase();

    const inputElement = document.createElement('input');
    inputElement.type = 'checkbox';
    inputElement.value = tag.id;
    inputElement.checked = selectedTagIds.includes(tag.id);
    inputElement.className = 'tag-selector-checkbox';
    inputElement.addEventListener('change', updateSelectedTagsCount);

    const contentElement = document.createElement('span');
    contentElement.className = 'tag-selector-content';

    const nameElement = document.createElement('span');
    nameElement.className = 'tag-selector-name';
    nameElement.textContent = tag.content;

    const categoryElement = document.createElement('span');
    categoryElement.className = 'tag-selector-category';
    categoryElement.textContent = tag.category.replaceAll('_', ' ');

    contentElement.append(nameElement, categoryElement);
    optionElement.append(inputElement, contentElement);
    field.appendChild(optionElement);
  });

  updateSelectedTagsCount();
}

function readSelectedTagIds() {
  const tagsField = document.getElementById('swal-item-tags');
  if (!tagsField) {
    return [];
  }

  return Array.from(
    tagsField.querySelectorAll('input[type="checkbox"]:checked'),
  ).map((option) => option.value);
}

function filterTagOptions() {
  const query = document
    .getElementById('swal-item-tag-search')
    ?.value.trim()
    .toLowerCase();
  const tagOptions = document.querySelectorAll('.tag-selector-option');

  tagOptions.forEach((option) => {
    const isVisible = !query || option.dataset.tagLabel?.includes(query);
    option.classList.toggle('hidden', !isVisible);
  });
}

function updateSelectedTagsCount() {
  const countElement = document.getElementById('swal-item-tags-count');
  if (!countElement) {
    return;
  }

  const count = readSelectedTagIds().length;
  countElement.textContent = `${count} selected`;
}

function collectItemFormPayload() {
  const title = document.getElementById('swal-item-title').value.trim();
  const type = document.getElementById('swal-item-type').value;
  const description = document
    .getElementById('swal-item-description')
    .value.trim();
  const target = document.getElementById('swal-item-target').value.trim();
  const secondary = document
    .getElementById('swal-item-secondary')
    .value.trim();
  const ip = document.getElementById('swal-item-ip').value.trim();
  const isExternal = document.getElementById('swal-item-external').checked;
  const isFav = document.getElementById('swal-item-fav').checked;
  const tags = readSelectedTagIds();

  if (!title) {
    Swal.showValidationMessage('Title is required.');
    return null;
  }

  if (!target) {
    Swal.showValidationMessage(
      type === 'server' ? 'Hostname is required.' : 'Primary target is required.',
    );
    return null;
  }

  if (type === 'app' && !secondary) {
    Swal.showValidationMessage('App label is required for APP items.');
    return null;
  }

  return {
    title,
    type,
    description,
    tags,
    isFav,
    metaData: buildMetaData(type, {
      target,
      secondary,
      ip,
      isExternal,
    }),
  };
}

function buildMetaData(type, values) {
  if (type === 'url') {
    return {
      url: values.target,
      label: values.secondary,
    };
  }

  if (type === 'app') {
    return {
      appName: values.secondary || 'VS Code',
      target: values.target,
    };
  }

  return {
    hostname: values.target,
    domain: values.secondary || values.target,
    ip: values.ip,
    is_external: values.isExternal,
  };
}
