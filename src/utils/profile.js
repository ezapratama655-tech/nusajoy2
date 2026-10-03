/**
 * NuSaJoy — User Profile Storage
 *
 * Menyimpan data profil pengguna secara lokal di browser.
 * Tidak membutuhkan backend untuk fitur foto profil dasar.
 */

export const PROFILE_STORAGE_KEY = 'nusajoy:user-profile';
export const PROFILE_UPDATED_EVENT = 'nusajoy:profile_updated';

export const DEFAULT_PROFILE = {
  name: 'Pengguna NuSaJoy',
  email: '',
  phone: '',
  photo: '',
};

const isBrowser = () => typeof window !== 'undefined';

export const getUserProfile = () => {
  if (!isBrowser()) return DEFAULT_PROFILE;

  try {
    const raw = window.localStorage.getItem(PROFILE_STORAGE_KEY);

    if (!raw) return DEFAULT_PROFILE;

    const parsed = JSON.parse(raw);

    return {
      ...DEFAULT_PROFILE,
      ...(parsed && typeof parsed === 'object' ? parsed : {}),
    };
  } catch (error) {
    console.warn(
      'NuSaJoy: gagal membaca profil lokal.',
      error,
    );

    return DEFAULT_PROFILE;
  }
};

const dispatchProfileUpdated = (profile) => {
  if (!isBrowser()) return;

  window.dispatchEvent(
    new CustomEvent(PROFILE_UPDATED_EVENT, {
      detail: {
        profile,
      },
    }),
  );
};

export const saveUserProfile = (updates = {}) => {
  const current = getUserProfile();

  const next = {
    ...current,
    ...updates,
  };

  if (!isBrowser()) {
    return next;
  }

  try {
    window.localStorage.setItem(
      PROFILE_STORAGE_KEY,
      JSON.stringify(next),
    );

    dispatchProfileUpdated(next);
  } catch (error) {
    console.error(
      'NuSaJoy: gagal menyimpan profil.',
      error,
    );

    throw new Error(
      'Profil tidak dapat disimpan. Penyimpanan browser mungkin penuh.',
      { cause: error },
    );
  }

  return next;
};

export const resetUserProfile = () => {
  if (!isBrowser()) {
    return DEFAULT_PROFILE;
  }

  try {
    window.localStorage.removeItem(
      PROFILE_STORAGE_KEY,
    );

    dispatchProfileUpdated(DEFAULT_PROFILE);
  } catch (error) {
    console.warn(
      'NuSaJoy: gagal mereset profil.',
      error,
    );
  }

  return DEFAULT_PROFILE;
};

const readFileAsDataUrl = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = () => {
      reject(
        new Error('Gagal membaca file gambar.'),
      );
    };

    reader.readAsDataURL(file);
  });

const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      resolve(image);
    };

    image.onerror = () => {
      reject(
        new Error('Gagal memuat gambar.'),
      );
    };

    image.src = src;
  });

/**
 * Resize + compress agar foto profil
 * tidak terlalu besar untuk localStorage.
 */
export const processProfileImage = async (
  file,
  {
    maxSize = 512,
    quality = 0.84,
  } = {},
) => {
  if (!file) {
    throw new Error(
      'File gambar belum dipilih.',
    );
  }

  if (!file.type.startsWith('image/')) {
    throw new Error(
      'File profil harus berupa gambar.',
    );
  }

  // Maksimum ukuran file sebelum diproses.
  if (file.size > 10 * 1024 * 1024) {
    throw new Error(
      'Ukuran foto maksimal 10 MB.',
    );
  }

  const originalDataUrl =
    await readFileAsDataUrl(file);

  const image =
    await loadImage(originalDataUrl);

  const sourceWidth =
    image.naturalWidth || image.width;

  const sourceHeight =
    image.naturalHeight || image.height;

  const longestSide = Math.max(
    sourceWidth,
    sourceHeight,
  );

  const scale =
    longestSide > maxSize
      ? maxSize / longestSide
      : 1;

  const width = Math.max(
    1,
    Math.round(sourceWidth * scale),
  );

  const height = Math.max(
    1,
    Math.round(sourceHeight * scale),
  );

  const canvas =
    document.createElement('canvas');

  canvas.width = width;
  canvas.height = height;

  const context =
    canvas.getContext('2d');

  if (!context) {
    throw new Error(
      'Browser tidak mendukung pemrosesan gambar.',
    );
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = 'high';

  context.drawImage(
    image,
    0,
    0,
    width,
    height,
  );

  return canvas.toDataURL(
    'image/jpeg',
    quality,
  );
};

export const setProfilePhotoFromFile =
  async (file) => {
    const photo =
      await processProfileImage(file);

    return saveUserProfile({
      photo,
    });
  };

export const removeProfilePhoto = () =>
  saveUserProfile({
    photo: '',
  });

export const getProfileInitials = (
  name = DEFAULT_PROFILE.name,
) => {
  const normalized =
    String(
      name || DEFAULT_PROFILE.name,
    )
      .trim()
      .replace(/\s+/g, ' ');

  if (!normalized) {
    return 'N';
  }

  const words =
    normalized.split(' ');

  if (words.length === 1) {
    return words[0]
      .slice(0, 2)
      .toUpperCase();
  }

  return `${words[0][0]}${words[words.length - 1][0]}`
    .toUpperCase();
};

export const subscribeToProfile = (
  callback,
) => {
  if (!isBrowser()) {
    return () => {};
  }

  const handleCustomUpdate =
    (event) => {
      callback(
        event.detail?.profile ||
          getUserProfile(),
      );
    };

  const handleStorageUpdate =
    (event) => {
      if (
        event.key === PROFILE_STORAGE_KEY
      ) {
        callback(
          getUserProfile(),
        );
      }
    };

  window.addEventListener(
    PROFILE_UPDATED_EVENT,
    handleCustomUpdate,
  );

  window.addEventListener(
    'storage',
    handleStorageUpdate,
  );

  return () => {
    window.removeEventListener(
      PROFILE_UPDATED_EVENT,
      handleCustomUpdate,
    );

    window.removeEventListener(
      'storage',
      handleStorageUpdate,
    );
  };
};