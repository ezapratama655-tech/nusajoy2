import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';

export const FAVORITES_STORAGE_KEY =
  'nusajoy:favorites';

export const FAVORITES_UPDATED_EVENT =
  'nusajoy:favorites_updated';

const isBrowser = () =>
  typeof window !== 'undefined';

export const getFavoriteKey = (item) => {
  if (
    item === null ||
    item === undefined
  ) {
    return '';
  }

  if (
    typeof item === 'string' ||
    typeof item === 'number'
  ) {
    return String(item);
  }

  if (
    typeof item !== 'object'
  ) {
    return '';
  }

  if (item.favoriteKey) {
    return String(item.favoriteKey);
  }

  if (
    item.favoriteId !== undefined &&
    item.favoriteId !== null
  ) {
    return String(
      item.favoriteId,
    );
  }

  if (
    item.id !== undefined &&
    item.id !== null
  ) {
    return String(item.id);
  }

  if (item.slug) {
    return String(item.slug);
  }

  if (item.guideId) {
    return `guide-${item.guideId}`;
  }

  if (item.destinationId) {
    return `destination-${item.destinationId}`;
  }

  const name =
    item.title ||
    item.name;

  return name
    ? String(name)
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
    : '';
};

const normalizeItem = (item) => {
  if (
    !item ||
    typeof item !== 'object'
  ) {
    return null;
  }

  const favoriteKey =
    getFavoriteKey(item);

  if (!favoriteKey) {
    return null;
  }

  return {
    ...item,
    favoriteKey,
  };
};

export const getFavorites = () => {
  if (!isBrowser()) {
    return [];
  }

  try {
    const raw =
      localStorage.getItem(
        FAVORITES_STORAGE_KEY,
      );

    if (!raw) {
      return [];
    }

    const parsed =
      JSON.parse(raw);

    if (
      !Array.isArray(parsed)
    ) {
      return [];
    }

    const result = [];
    const keys = new Set();

    parsed.forEach((item) => {
      const normalized =
        normalizeItem(item);

      if (!normalized) {
        return;
      }

      if (
        keys.has(
          normalized.favoriteKey,
        )
      ) {
        return;
      }

      keys.add(
        normalized.favoriteKey,
      );

      result.push(normalized);
    });

    return result;
  } catch (error) {
    console.warn(
      'NuSaJoy: gagal membaca favorit.',
      error,
    );

    return [];
  }
};

export const saveFavorites = (
  items = [],
) => {
  const normalized = [];
  const keys = new Set();

  items.forEach((item) => {
    const value =
      normalizeItem(item);

    if (!value) {
      return;
    }

    if (
      keys.has(
        value.favoriteKey,
      )
    ) {
      return;
    }

    keys.add(
      value.favoriteKey,
    );

    normalized.push(value);
  });

  if (isBrowser()) {
    localStorage.setItem(
      FAVORITES_STORAGE_KEY,
      JSON.stringify(
        normalized,
      ),
    );
  }

  return normalized;
};

const emitUpdate = ({
  items,
  added = false,
  removed = false,
  item = null,
}) => {
  if (!isBrowser()) {
    return;
  }

  window.dispatchEvent(
    new CustomEvent(
      FAVORITES_UPDATED_EVENT,
      {
        detail: {
          items,
          added,
          removed,
          item,
        },
      },
    ),
  );
};

export const isFavorite = (
  item,
) => {
  const key =
    getFavoriteKey(item);

  if (!key) {
    return false;
  }

  return getFavorites().some(
    (favorite) =>
      getFavoriteKey(
        favorite,
      ) === key,
  );
};

export const addFavorite = (
  item,
) => {
  const normalized =
    normalizeItem(item);

  const current =
    getFavorites();

  if (!normalized) {
    return {
      items: current,
      item: null,
      added: false,
    };
  }

  const exists =
    current.some(
      (favorite) =>
        getFavoriteKey(
          favorite,
        ) ===
        normalized.favoriteKey,
    );

  if (exists) {
    return {
      items: current,
      item: normalized,
      added: false,
    };
  }

  const next = [
    normalized,
    ...current,
  ];

  saveFavorites(next);

  emitUpdate({
    items: next,
    added: true,
    item: normalized,
  });

  return {
    items: next,
    item: normalized,
    added: true,
  };
};

export const removeFavorite = (
  itemOrId,
) => {
  const key =
    getFavoriteKey(
      itemOrId,
    );

  const current =
    getFavorites();

  const removedItem =
    current.find(
      (favorite) =>
        getFavoriteKey(
          favorite,
        ) === key,
    ) || null;

  const next =
    current.filter(
      (favorite) =>
        getFavoriteKey(
          favorite,
        ) !== key,
    );

  if (
    next.length ===
    current.length
  ) {
    return {
      items: current,
      item: removedItem,
      removed: false,
    };
  }

  saveFavorites(next);

  emitUpdate({
    items: next,
    removed: true,
    item: removedItem,
  });

  return {
    items: next,
    item: removedItem,
    removed: true,
  };
};

export const toggleFavorite = (
  item,
) => {
  if (
    isFavorite(item)
  ) {
    const result =
      removeFavorite(item);

    return {
      ...result,
      added: false,
      isFavorite: false,
    };
  }

  const result =
    addFavorite(item);

  return {
    ...result,
    removed: false,
    isFavorite: true,
  };
};

export const clearFavorites = () => {
  saveFavorites([]);

  emitUpdate({
    items: [],
    removed: true,
  });

  return [];
};

export const useFavorites = () => {
  const [
    favorites,
    setFavorites,
  ] = useState(
    () => getFavorites(),
  );

  useEffect(() => {
    if (!isBrowser()) {
      return undefined;
    }

    const handleUpdate =
      (event) => {
        const items =
          event.detail?.items;

        setFavorites(
          Array.isArray(items)
            ? items
            : getFavorites(),
        );
      };

    const handleStorage =
      (event) => {
        if (
          event.key ===
          FAVORITES_STORAGE_KEY
        ) {
          setFavorites(
            getFavorites(),
          );
        }
      };

    window.addEventListener(
      FAVORITES_UPDATED_EVENT,
      handleUpdate,
    );

    window.addEventListener(
      'storage',
      handleStorage,
    );

    return () => {
      window.removeEventListener(
        FAVORITES_UPDATED_EVENT,
        handleUpdate,
      );

      window.removeEventListener(
        'storage',
        handleStorage,
      );
    };
  }, []);

  const handleAdd =
    useCallback(
      (item) =>
        addFavorite(item),
      [],
    );

  const handleRemove =
    useCallback(
      (item) =>
        removeFavorite(item),
      [],
    );

  const handleToggle =
    useCallback(
      (item) =>
        toggleFavorite(item),
      [],
    );

  const handleIsFavorite =
    useCallback(
      (item) => {
        const key =
          getFavoriteKey(item);

        return Boolean(
          key &&
          favorites.some(
            (favorite) =>
              getFavoriteKey(
                favorite,
              ) === key,
          ),
        );
      },
      [favorites],
    );

  const handleClear =
    useCallback(
      () =>
        clearFavorites(),
      [],
    );

  const favoriteKeys =
    useMemo(
      () =>
        new Set(
          favorites.map(
            (item) =>
              getFavoriteKey(item),
          ),
        ),
      [favorites],
    );

  return {
    favorites,
    favoritesList: favorites,
    favoritesCount:
      favorites.length,

    favoriteKeys,

    isFavorite:
      handleIsFavorite,

    addFavorite:
      handleAdd,

    removeFavorite:
      handleRemove,

    toggleFavorite:
      handleToggle,

    clearFavorites:
      handleClear,
  };
};

export default useFavorites;