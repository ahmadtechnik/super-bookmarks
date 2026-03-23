import { bootstrap, searchInput } from './constants.js';
import { buildScoreHistoryContent, cloneTemplateRoot } from './templates.js';

const swalDialogClasses = {
  popup: 'swal-dashboard-popup',
  confirmButton: 'swal-dashboard-confirm',
  cancelButton: 'swal-dashboard-cancel',
};

const swalDangerDialogClasses = {
  ...swalDialogClasses,
  confirmButton: 'swal-dashboard-danger',
};

export async function fetchTags() {
  const response = await fetch('/tag');

  if (!response.ok) {
    await this.showRequestError('Unable to load tags.');
    return;
  }

  this.allTags = await response.json();
}

export async function fetchItems() {
  const params = new URLSearchParams();
  const query = searchInput?.value?.trim() || this.searchQuery;

  if (query) {
    params.set('q', query);
  }

  if (this.sortBy) {
    params.set('sortBy', this.sortBy);
  }

  if (this.groupBy) {
    params.set('groupBy', this.groupBy);
  }

  if (this.groupValue) {
    params.set('groupValue', this.groupValue);
  }

  if (this.onlyFavorites) {
    params.set('onlyFavorites', 'true');
  }

  const response = await fetch(`/search?${params.toString()}`);
  if (!response.ok) {
    await this.showRequestError('Unable to load dashboard items.');
    return;
  }

  const payload = await response.json();
  this.items = payload.items ?? [];
  this.expandedItemIds = this.expandedItemIds.filter((itemId) =>
    this.items.some((item) => item.id === itemId),
  );

  if (Array.isArray(payload.availableTags) && payload.availableTags.length) {
    this.allTags = payload.availableTags;
  }
}

export function isItemExpanded(item) {
  return this.expandedItemIds.includes(item.id);
}

export function toggleItemPreview(item) {
  if (this.isItemExpanded(item)) {
    this.expandedItemIds = this.expandedItemIds.filter(
      (itemId) => itemId !== item.id,
    );
    return;
  }

  this.expandedItemIds = [...this.expandedItemIds, item.id];
}

export function getServerMetadataEntries(item) {
  const metaData = item.metaData ?? {};
  return [
    { key: 'ip', label: 'IP', value: metaData.ip },
    { key: 'domain', label: 'Domain', value: metaData.domain },
    { key: 'hostname', label: 'Hostname', value: metaData.hostname },
  ].filter((entry) => typeof entry.value === 'string' && entry.value.trim().length);
}

export async function openItemDetails(item) {
  this.selectedItem = item;
  this.detailsOpen = true;

  const response = await fetch(`/item/${item.id}/scores`);
  if (!response.ok) {
    await this.showRequestError('Unable to load score history.');
    return;
  }

  const scores = await response.json();
  this.$nextTick(() => this.renderScoreTable(scores));
}

export async function handleFavoriteItem(item) {
  if (item.type === 'server') {
    await this.openFavoriteServerDialog(item);
    return;
  }

  await this.triggerItem(item);
}

export async function openFavoriteServerDialog(item) {
  const dialogContent = cloneTemplateRoot('favorite-server-template');
  const titleElement = dialogContent.querySelector('#favorite-server-title');
  const descriptionElement = dialogContent.querySelector(
    '#favorite-server-description',
  );
  const metadataHost = dialogContent.querySelector('#favorite-server-meta');
  const metadataEntries = this.getServerMetadataEntries(item);

  if (titleElement) {
    titleElement.textContent = item.title;
  }

  if (descriptionElement) {
    descriptionElement.textContent = item.description || 'No description added yet.';
  }

  if (metadataHost) {
    metadataHost.replaceChildren();

    metadataEntries.forEach((entry) => {
      const row = document.createElement('div');
      row.className =
        'grid grid-cols-[72px_minmax(0,1fr)_auto] items-center gap-3 rounded-xl border border-[var(--line)] bg-[var(--panel-strong)] px-3 py-2';

      const label = document.createElement('span');
      label.className =
        'text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-[var(--muted)]';
      label.textContent = entry.label;

      const value = document.createElement('code');
      value.className =
        'truncate bg-transparent px-0 text-[0.78rem] text-[var(--text)]';
      value.textContent = entry.value;

      const button = document.createElement('button');
      button.type = 'button';
      button.className =
        'icon-button inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-[var(--panel)] text-[var(--text)] transition hover:-translate-y-0.5 hover:bg-[var(--panel-hover)]';
      button.title = `Copy ${entry.label}`;
      button.innerHTML = '<i class="fa-regular fa-copy text-xs"></i>';
      button.addEventListener('click', () => {
        this.copyServerField(item, entry);
      });

      row.append(label, value, button);
      metadataHost.appendChild(row);
    });
  }

  await Swal.fire({
    title: 'Server details',
    width: 620,
    confirmButtonText: 'Close',
    buttonsStyling: false,
    customClass: swalDialogClasses,
    html: dialogContent,
  });
}

export function closeDetails() {
  this.detailsOpen = false;
  this.selectedItem = null;
}

export function renderScoreTable(scores) {
  const tableHost = document.getElementById('score-table');

  if (!tableHost) {
    return;
  }

  tableHost.replaceChildren(buildScoreHistoryContent(scores));
}

export async function toggleFavorite(item) {
  const response = await fetch(`/item/${item.id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ isFav: !item.isFav }),
  });

  if (!response.ok) {
    await this.showRequestError('Unable to update favorite state.');
    return;
  }

  await this.fetchItems();
}

export async function openAddItemDialog() {
  const result = await this.openItemDialog({ mode: 'create' });

  if (!result.isConfirmed) {
    return;
  }

  await fetch(`/item/${result.value.id}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      type: result.value.type === 'server' ? 'copy' : 'click',
    }),
  });

  await this.fetchItems();
  await Swal.fire({
    icon: 'success',
    title: 'Item created',
    text: `${result.value.title} is now part of the dashboard.`,
    timer: 1500,
    showConfirmButton: false,
    customClass: swalDialogClasses,
  });
}

export async function exportItemsBundle() {
  const response = await fetch('/item/export');

  if (!response.ok) {
    await this.showRequestError('Unable to export dashboard items.');
    return;
  }

  const bundle = await response.json();
  const timestamp = new Date().toISOString().replace(/[:]/g, '-');
  this.downloadJsonFile(`superbookmarks-items-${timestamp}.json`, bundle);
  await showToast('Export downloaded.');
}

export async function openImportItemsDialog() {
  const dialogContent = cloneTemplateRoot('item-import-template');

  const result = await Swal.fire({
    title: 'Import items',
    width: 760,
    focusConfirm: false,
    confirmButtonText: 'Import bundle',
    showCancelButton: true,
    buttonsStyling: false,
    customClass: swalDialogClasses,
    html: dialogContent,
    didOpen: () => {
      const fileField = document.getElementById('swal-import-file');
      const jsonField = document.getElementById('swal-import-json');

      fileField?.addEventListener('change', async (event) => {
        const target = event.target;
        if (!(target instanceof HTMLInputElement) || !target.files?.length) {
          return;
        }

        const file = target.files[0];
        const fileText = await file.text();
        if (jsonField instanceof HTMLTextAreaElement) {
          jsonField.value = fileText;
        }
      });
    },
    preConfirm: async () => {
      const jsonField = document.getElementById('swal-import-json');
      const rawPayload =
        jsonField instanceof HTMLTextAreaElement ? jsonField.value.trim() : '';

      if (!rawPayload) {
        Swal.showValidationMessage('Paste the exported JSON or choose an export file.');
        return false;
      }

      let parsedPayload;
      try {
        parsedPayload = JSON.parse(rawPayload);
      } catch {
        Swal.showValidationMessage('The provided content is not valid JSON.');
        return false;
      }

      const response = await fetch('/item/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(parsedPayload),
      });

      if (!response.ok) {
        const message = await this.extractErrorMessage(
          response,
          'Unable to import dashboard items.',
        );
        Swal.showValidationMessage(message);
        return false;
      }

      return response.json();
    },
  });

  if (!result.isConfirmed) {
    return;
  }

  await this.fetchTags();
  await this.fetchItems();
  await Swal.fire({
    icon: 'success',
    title: 'Import complete',
    text: `Created ${result.value.created} items, updated ${result.value.updated}, and added ${result.value.tagsCreated} tags.`,
    buttonsStyling: false,
    customClass: swalDialogClasses,
  });
}

export async function openEditItemDialog(item) {
  const result = await this.openItemDialog({ mode: 'edit', item });

  if (!result.isConfirmed) {
    return;
  }

  if (this.selectedItem?.id === result.value.id) {
    this.selectedItem = result.value;
  }

  await Swal.fire({
    icon: 'success',
    title: 'Item updated',
    text: `${result.value.title} has been updated.`,
    timer: 1500,
    showConfirmButton: false,
    customClass: swalDialogClasses,
  });
}

export async function confirmDeleteItem(item) {
  const result = await Swal.fire({
    icon: 'warning',
    title: 'Delete item?',
    text: `${item.title} and its score history will be removed.`,
    showCancelButton: true,
    confirmButtonText: 'Delete item',
    buttonsStyling: false,
    customClass: swalDangerDialogClasses,
  });

  if (!result.isConfirmed) {
    return;
  }

  const response = await fetch(`/item/${item.id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    await this.showRequestError('Unable to delete this item.');
    return;
  }

  if (this.selectedItem?.id === item.id) {
    this.closeDetails();
  }

  await this.fetchItems();
  await Swal.fire({
    icon: 'success',
    title: 'Item deleted',
    timer: 1200,
    showConfirmButton: false,
    customClass: swalDialogClasses,
  });
}

export function getPrimaryActionLabel(item) {
  return item.type === 'app' ? 'Open App' : 'Open';
}

export async function copyServerField(item, entry) {
  await this.copyToClipboard(entry.value);

  const scoreResponse = await fetch(`/item/${item.id}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'copy' }),
  });

  if (!scoreResponse.ok) {
    await this.showRequestError('The value was copied, but the score was not recorded.');
    return;
  }

  await this.fetchItems();
  await showToast(`${entry.label} copied.`);
}

export async function triggerItem(item) {
  if (item.type === 'url' && item.metaData?.url) {
    window.open(item.metaData.url, '_blank', 'noopener');
  } else if (item.type === 'app') {
    const launchTarget = this.getAppLaunchTarget(item);

    if (!launchTarget) {
      await this.showRequestError(
        'No matching application prefix is configured for this APP item.',
      );
      return;
    }

    window.location.assign(launchTarget);
  } else {
    await this.showRequestError('This item does not have a valid target.');
    return;
  }

  const scoreResponse = await fetch(`/item/${item.id}/score`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'click' }),
  });

  if (!scoreResponse.ok) {
    await this.showRequestError('The item opened, but the score was not recorded.');
    return;
  }

  await this.fetchItems();
}

export function getAppLaunchTarget(item) {
  const rawTarget =
    typeof item.metaData?.target === 'string' ? item.metaData.target.trim() : '';

  if (!rawTarget) {
    return '';
  }

  if (/^[a-zA-Z][a-zA-Z\d+.-]*:/.test(rawTarget)) {
    return rawTarget;
  }

  const prefixEntry = bootstrap.appPrefixes?.find(
    (entry) => entry.label === item.metaData?.appName,
  );
  return prefixEntry ? `${prefixEntry.prefix}${rawTarget}` : '';
}

export async function extractErrorMessage(response, fallbackMessage) {
  const errorBody = await response.json().catch(() => ({ message: fallbackMessage }));
  return Array.isArray(errorBody.message)
    ? errorBody.message.join(', ')
    : errorBody.message || fallbackMessage;
}

export async function copyToClipboard(value) {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(value);
    return;
  }

  const helperInput = document.createElement('textarea');
  helperInput.value = value;
  helperInput.setAttribute('readonly', 'true');
  helperInput.style.position = 'absolute';
  helperInput.style.left = '-9999px';
  document.body.appendChild(helperInput);
  helperInput.select();
  document.execCommand('copy');
  document.body.removeChild(helperInput);
}

export function downloadJsonFile(fileName, value) {
  const blob = new Blob([JSON.stringify(value, null, 2)], {
    type: 'application/json',
  });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = objectUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(objectUrl);
}

export async function showRequestError(message) {
  await Swal.fire({
    icon: 'error',
    title: 'Request failed',
    text: message,
    buttonsStyling: false,
    customClass: swalDialogClasses,
  });
}

export async function showToast(message) {
  await Swal.fire({
    toast: true,
    position: 'top-end',
    icon: 'success',
    title: message,
    timer: 1800,
    showConfirmButton: false,
    timerProgressBar: true,
    customClass: {
      popup: 'swal-dashboard-toast',
    },
  });
}
