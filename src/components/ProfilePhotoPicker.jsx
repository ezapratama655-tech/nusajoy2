/**
 * @file src/components/ProfilePhotoPicker.jsx
 * Foto profil yang dikendalikan pengguna.
 *
 * - Tanpa foto → inisial nama (placeholder netral, bukan foto orang lain).
 * - Foto dipilih dari perangkat, disimpan lewat utils/profile.js,
 *   dan otomatis tampil di tempat lain (navbar, akun) via subscribeToProfile.
 *
 * Props:
 *   size          'small' | 'medium' | 'large'
 *   showControls  false → hanya menampilkan avatar (mis. di navbar)
 *   onSaved       dipanggil setelah foto berhasil diganti
 *   onRemoved     dipanggil setelah foto dihapus
 */

import { useEffect, useRef, useState } from 'react';
import { Camera } from 'lucide-react';

import {
  getUserProfile,
  getProfileInitials,
  removeProfilePhoto,
  setProfilePhotoFromFile,
  subscribeToProfile,
} from '../utils/profile.js';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ACCEPTED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

const SIZE_CLASSES = {
  small: 'h-12 w-12 text-sm',
  medium: 'h-20 w-20 text-xl',
  large: 'h-28 w-28 text-3xl',
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/50 focus-visible:ring-offset-2';

const validateFile = (file) => {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return 'Format foto harus PNG, JPG, WebP, atau GIF.';
  }

  if (file.size > MAX_FILE_SIZE) {
    return 'Ukuran foto maksimal 5 MB.';
  }

  return '';
};

export default function ProfilePhotoPicker({
  size = 'large',
  className = '',
  showControls = true,
  onSaved,
  onRemoved,
}) {
  const inputRef = useRef(null);

  const [profile, setProfile] = useState(getUserProfile);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => subscribeToProfile(setProfile), []);

  const name = profile?.name || '';
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.large;

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];

    /* Reset agar file yang sama bisa dipilih ulang. */
    event.target.value = '';

    if (!file) {
      return;
    }

    const validationMessage = validateFile(file);

    if (validationMessage) {
      setError(validationMessage);

      return;
    }

    setError('');
    setIsSaving(true);

    try {
      await setProfilePhotoFromFile(file);
      onSaved?.();
    } catch (uploadError) {
      setError(uploadError?.message || 'Foto profil gagal diperbarui.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    setError('');
    removeProfilePhoto();
    onRemoved?.();
  };

  const avatarContent = profile?.photo ? (
    <img
      src={profile.photo}
      alt={name ? `Foto profil ${name}` : 'Foto profil'}
      className="h-full w-full object-cover"
    />
  ) : (
    <span
      className="flex h-full w-full items-center justify-center font-['Outfit'] font-bold text-[#174D36]"
      aria-label={name ? `Inisial ${name}` : 'Inisial pengguna'}
    >
      {getProfileInitials(name)}
    </span>
  );

  const avatarBase = cx(
    'group relative overflow-hidden rounded-full',
    'border-2 border-[#174D36]/20 bg-[#E8EFE3]',
    sizeClass,
  );

  return (
    <div className={cx('flex flex-col items-center gap-3', className)}>
      {showControls ? (
        <button
          type="button"
          onClick={handleChooseFile}
          disabled={isSaving}
          aria-label="Ganti foto profil"
          className={cx(avatarBase, focusRing, 'disabled:opacity-60')}
        >
          {avatarContent}

          {size !== 'small' && (
            <span className="absolute inset-0 flex items-center justify-center bg-[#0F3524]/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
              <Camera size={20} aria-hidden="true" />
            </span>
          )}
        </button>
      ) : (
        <div className={avatarBase}>{avatarContent}</div>
      )}

      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED_TYPES.join(',')}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={handleChooseFile}
            disabled={isSaving}
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2',
              'bg-[#174D36] text-sm font-semibold text-white',
              'transition-colors hover:bg-[#0F3524]',
              'disabled:cursor-not-allowed disabled:opacity-60',
              focusRing,
            )}
          >
            {isSaving ? 'Memproses...' : 'Ganti foto'}
          </button>

          {profile?.photo && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSaving}
              className={cx(
                'rounded-xl border border-[#DDE2D9] bg-[#FFFDF7] px-4 py-2',
                'text-sm font-semibold text-[#B5653A]',
                'transition-colors hover:bg-[#FAF4DD]',
                'disabled:opacity-60',
                focusRing,
              )}
            >
              Hapus foto
            </button>
          )}
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="max-w-xs text-center text-xs font-medium text-[#B5653A]"
        >
          {error}
        </p>
      )}
    </div>
  );
}
