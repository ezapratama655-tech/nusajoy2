import { EXPERIENCES_DATA, GUIDES_DATA } from '../data/mockData.js';

export const FAVORITES_STORAGE_KEY = 'nusajoy_favorites';
export const FAVORITES_UPDATED_EVENT = 'nusajoy-favorites-updated';

export function getFavoriteId(item) {
  const id = typeof item === 'object' && item !== null ? item.id ?? item.slug : item;
  return id === null || id === undefined ? null : String(id);
}

function readList(key) {
  try {
    const value = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(value) ? value : [];
  } catch {
    return [];
  }
}

export function getFavorites() {
  const favorites = readList(FAVORITES_STORAGE_KEY);
  const legacy = [...readList('nusaJoyFavorites'), ...readList('nusajoy:favorites')];
  for (const item of legacy) {
    if (!favorites.some((favorite) => getFavoriteId(favorite) === getFavoriteId(item))) favorites.push(item);
  }
  if (legacy.length) {
    try {
      localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
      localStorage.removeItem('nusaJoyFavorites');
      localStorage.removeItem('nusajoy:favorites');
    } catch {
      // Preserve the old data when migration cannot be saved.
    }
  }
  return favorites.map((item) => {
    if (typeof item === 'object' && item !== null) return item;
    return [...EXPERIENCES_DATA, ...GUIDES_DATA].find((row) => String(row.id) === String(item))
      || { id: item, type: 'destination', title: 'Destinasi tersimpan', unresolved: true };
  });
}

function saveFavorites(items) {
  localStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(items));
  window.dispatchEvent(new CustomEvent(FAVORITES_UPDATED_EVENT, { detail: items }));
}

export function subscribeToFavorites(callback) {
  const onStorage = (event) => {
    if (event.key === FAVORITES_STORAGE_KEY || event.key === null) callback();
  };
  window.addEventListener(FAVORITES_UPDATED_EVENT, callback);
  window.addEventListener('storage', onStorage);
  return () => {
    window.removeEventListener(FAVORITES_UPDATED_EVENT, callback);
    window.removeEventListener('storage', onStorage);
  };
}

export function isFavorite(item) {
  const id = getFavoriteId(item);
  return id !== null && getFavorites().some((favorite) => getFavoriteId(favorite) === id);
}

export function addFavorite(item) {
  const id = getFavoriteId(item);
  const items = getFavorites();
  if (id === null) return items;
  const existing = items.findIndex((favorite) => getFavoriteId(favorite) === id);
  if (existing < 0) items.push(item);
  else if (typeof item === 'object') items[existing] = item;
  saveFavorites(items);
  return items;
}

export function removeFavorite(item) {
  const items = getFavorites().filter((favorite) => getFavoriteId(favorite) !== getFavoriteId(item));
  saveFavorites(items);
  return items;
}

export function toggleFavorite(item) {
  if (getFavoriteId(item) === null) return false;
  if (isFavorite(item)) {
    removeFavorite(item);
    return false;
  }
  addFavorite(item);
  return true;
}

export function clearFavorites() { saveFavorites([]); }
export function getFavoriteCount() { return getFavorites().length; }

export default { getFavorites, addFavorite, removeFavorite, toggleFavorite, isFavorite, clearFavorites, getFavoriteCount };
