import test from 'node:test';
import assert from 'node:assert/strict';
import { getFavorites, addFavorite, removeFavorite, toggleFavorite, subscribeToFavorites, FAVORITES_UPDATED_EVENT } from '../src/utils/favorites.js';
import { calculateBookingCosts } from '../src/utils/pricing.js';
import { isGuideItem } from '../src/utils/format.js';
import { normalizeGuide } from '../src/utils/guide.js';
import { EXPERIENCES_DATA, GUIDES_DATA } from '../src/data/mockData.js';
import { readTravelData, saveTravelData } from '../src/utils/travelStorage.js';

const storage = new Map();
globalThis.localStorage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: (key) => storage.delete(key),
};
globalThis.window = new EventTarget();

test('migrates all favorite stores without resurrecting removed items', () => {
  storage.clear();
  localStorage.setItem('nusajoy_favorites', JSON.stringify([{ id: 7, name: 'Destinasi' }]));
  localStorage.setItem('nusaJoyFavorites', JSON.stringify([7, 8]));
  localStorage.setItem('nusajoy:favorites', JSON.stringify([{ id: 'exp-1' }]));
  assert.equal(getFavorites().length, 3);
  removeFavorite(8);
  assert.equal(getFavorites().length, 2);
  assert.equal(localStorage.getItem('nusaJoyFavorites'), null);
  assert.equal(localStorage.getItem('nusajoy:favorites'), null);
});

test('favorite subscribers see additions and removals, including numeric/string IDs', () => {
  storage.clear();
  const observed = [];
  const unsubscribe = subscribeToFavorites(() => observed.push(getFavorites().length));
  addFavorite({ id: 9, title: 'Destinasi' });
  assert.equal(toggleFavorite('9'), false);
  assert.deepEqual(observed, [1, 0]);
  unsubscribe();
  addFavorite({ id: 10 });
  assert.deepEqual(observed, [1, 0]);
  assert.equal(FAVORITES_UPDATED_EVENT, 'nusajoy-favorites-updated');
});

test('favorites tolerate corrupt storage and accept a zero ID', () => {
  storage.clear();
  localStorage.setItem('nusajoy_favorites', '{broken');
  assert.deepEqual(getFavorites(), []);
  assert.equal(toggleFavorite(0), true);
  assert.equal(toggleFavorite('0'), false);
});

test('experiences with a host and meeting point are not classified as guides', () => {
  assert.equal(isGuideItem(EXPERIENCES_DATA[0]), false);
  assert.equal(isGuideItem(GUIDES_DATA[0]), true);
  assert.equal(isGuideItem({ id: 'uuid', full_name: 'Guide', specialties: ['Budaya'], price_per_trip: 250000 }), true);
});

test('trip checkout keeps the budget total and charges conservation once', () => {
  const costs = calculateBookingCosts({ type: 'trip', price: 495000, conservationFund: 9375 }, 1);
  assert.equal(costs.totalAmount, 504375);
  assert.equal(costs.conservationFund, 9375);
});

test('experience checkout charges conservation for the selected participant count', () => {
  assert.equal(calculateBookingCosts({ type: 'experience', price: 95000 }, 2).totalAmount, 194750);
  assert.equal(calculateBookingCosts({ price: 0 }).totalAmount, 0);
});

test('guide catalog preserves per-trip prices and legacy daily prices', () => {
  const trip = normalizeGuide({ id: 'uuid', full_name: 'Guide', price_per_trip: 250000 });
  assert.equal(trip.price, 250000);
  assert.equal(trip.priceUnit, 'trip');
  assert.equal(trip.price_per_day, undefined);
  const daily = normalizeGuide({ id: 'guide-1', pricePerDay: 200000 });
  assert.equal(daily.price, 200000);
  assert.equal(daily.priceUnit, 'day');
});

test('travel data survives reload and remains separate for each account', () => {
  storage.clear();
  const defaults = { trip: { items: [] }, orders: [], notifications: [] };
  const data = { trip: { items: [{ id: 'activity' }] }, orders: [{ id: 'demo', isDemo: true }], notifications: [] };
  saveTravelData('user-a', data);
  assert.deepEqual(readTravelData('user-a', defaults), data);
  assert.deepEqual(readTravelData('user-b', defaults), defaults);
  localStorage.setItem('nusajoy:travel:user-a', '{bad');
  assert.deepEqual(readTravelData('user-a', defaults), defaults);
});
