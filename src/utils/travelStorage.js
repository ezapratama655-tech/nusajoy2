const PREFIX = 'nusajoy:travel:';

export function readTravelData(owner, defaults) {
  try {
    const value = JSON.parse(localStorage.getItem(PREFIX + owner) || 'null');
    if (!value || !Array.isArray(value.trip?.items) || !Array.isArray(value.orders) || !Array.isArray(value.notifications)) return defaults;
    return { trip: value.trip, orders: value.orders, notifications: value.notifications };
  } catch {
    return defaults;
  }
}

export function saveTravelData(owner, data) {
  localStorage.setItem(PREFIX + owner, JSON.stringify(data));
}
