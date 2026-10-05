import { useCallback, useEffect, useMemo, useState } from 'react';
import * as store from '../utils/favorites.js';

export const FAVORITES_STORAGE_KEY = store.FAVORITES_STORAGE_KEY;
export const FAVORITES_UPDATED_EVENT = store.FAVORITES_UPDATED_EVENT;
export const getFavoriteKey = (item) => store.getFavoriteId(item) || '';
export const getFavorites = store.getFavorites;
export const isFavorite = store.isFavorite;

export function addFavorite(item) {
  const existed = store.isFavorite(item);
  return { items: store.addFavorite(item), item, added: !existed };
}
export function removeFavorite(item) {
  const existed = store.isFavorite(item);
  return { items: store.removeFavorite(item), item, removed: existed };
}
export function toggleFavorite(item) {
  const added = store.toggleFavorite(item);
  return { items: store.getFavorites(), item, added, removed: !added, isFavorite: added };
}
export function clearFavorites() { store.clearFavorites(); return []; }

export default function useFavorites() {
  const [favorites, setFavorites] = useState(getFavorites);
  useEffect(() => store.subscribeToFavorites(() => setFavorites(getFavorites())), []);
  const favoriteKeys = useMemo(() => new Set(favorites.map(getFavoriteKey)), [favorites]);
  const handleIsFavorite = useCallback((item) => favoriteKeys.has(getFavoriteKey(item)), [favoriteKeys]);
  return {
    favorites, favoritesList: favorites, favoritesCount: favorites.length, favoriteKeys,
    isFavorite: handleIsFavorite, addFavorite, removeFavorite, toggleFavorite, clearFavorites,
  };
}
export { useFavorites };
