// =====================================================
// NUSAJOY FAVORITES UTILITY
// =====================================================

const STORAGE_KEY = "nusajoy_favorites";


// =====================================================
// GET ALL FAVORITES
// =====================================================

export function getFavorites() {

  try {

    const storedFavorites =
      localStorage.getItem(STORAGE_KEY);

    if (!storedFavorites) {
      return [];
    }

    const parsedFavorites =
      JSON.parse(storedFavorites);

    return Array.isArray(parsedFavorites)
      ? parsedFavorites
      : [];

  } catch (error) {

    console.error(
      "Gagal membaca data favorit:",
      error
    );

    return [];
  }
}


// =====================================================
// SAVE FAVORITES
// =====================================================

function saveFavorites(favorites) {

  try {

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(favorites)
    );

    // Mengirim event agar halaman lain
    // dapat memperbarui state favorit
    window.dispatchEvent(
      new CustomEvent(
        "nusajoy-favorites-updated",
        {
          detail: favorites,
        }
      )
    );

  } catch (error) {

    console.error(
      "Gagal menyimpan data favorit:",
      error
    );
  }
}


// =====================================================
// GET ITEM ID
// =====================================================

function getItemId(item) {

  if (
    item === null ||
    item === undefined
  ) {
    return null;
  }

  // Jika langsung berupa ID
  if (
    typeof item === "string" ||
    typeof item === "number"
  ) {
    return String(item);
  }

  // Jika berupa object
  if (typeof item === "object") {

    if (item.id !== undefined) {
      return String(item.id);
    }

    if (item.slug !== undefined) {
      return String(item.slug);
    }
  }

  return null;
}


// =====================================================
// CHECK FAVORITE
// =====================================================

export function isFavorite(item) {

  const itemId =
    getItemId(item);

  if (!itemId) {
    return false;
  }

  const favorites =
    getFavorites();

  return favorites.some(
    (favorite) => {

      const favoriteId =
        getItemId(favorite);

      return favoriteId === itemId;

    }
  );
}


// =====================================================
// ADD FAVORITE
// =====================================================

export function addFavorite(item) {

  const itemId =
    getItemId(item);

  if (!itemId) {

    console.warn(
      "Item favorit tidak memiliki ID."
    );

    return getFavorites();
  }

  const favorites =
    getFavorites();

  const alreadyExists =
    favorites.some(
      (favorite) =>
        getItemId(favorite) === itemId
    );

  if (alreadyExists) {
    return favorites;
  }

  const updatedFavorites = [
    ...favorites,
    item,
  ];

  saveFavorites(
    updatedFavorites
  );

  return updatedFavorites;
}


// =====================================================
// REMOVE FAVORITE
// =====================================================

export function removeFavorite(item) {

  const itemId =
    getItemId(item);

  if (!itemId) {
    return getFavorites();
  }

  const favorites =
    getFavorites();

  const updatedFavorites =
    favorites.filter(
      (favorite) =>
        getItemId(favorite) !== itemId
    );

  saveFavorites(
    updatedFavorites
  );

  return updatedFavorites;
}


// =====================================================
// TOGGLE FAVORITE
// =====================================================

export function toggleFavorite(item) {

  if (!item) {
    return false;
  }

  const currentlyFavorite =
    isFavorite(item);

  if (currentlyFavorite) {

    removeFavorite(item);

    return false;

  } else {

    addFavorite(item);

    return true;
  }
}


// =====================================================
// CLEAR ALL FAVORITES
// =====================================================

export function clearFavorites() {

  saveFavorites([]);

}


// =====================================================
// FAVORITE COUNT
// =====================================================

export function getFavoriteCount() {

  return getFavorites().length;

}


// =====================================================
// DEFAULT EXPORT
// =====================================================

const favorites = {

  getFavorites,

  addFavorite,

  removeFavorite,

  toggleFavorite,

  isFavorite,

  clearFavorites,

  getFavoriteCount,

};

export default favorites;