import React, { useRef, useState } from 'react';
import {
  getUserProfile,
  getProfileInitials,
  removeProfilePhoto,
  setProfilePhotoFromFile,
  subscribeToProfile,
} from '../utils/profile.js';

const cx = (...classes) => classes.filter(Boolean).join(' ');

export default function ProfilePhotoPicker({
  size = 'large',
  className = '',
  showControls = true,
}) {
  const inputRef = useRef(null);
  const [profile, setProfile] = useState(getUserProfile());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => subscribeToProfile(setProfile), []);

  const sizeClasses =
    size === 'small'
      ? 'h-12 w-12'
      : size === 'medium'
        ? 'h-20 w-20'
        : 'h-28 w-28';

  const handleChooseFile = () => {
    inputRef.current?.click();
  };

  const handleFileChange = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) return;

    setError('');
    setIsSaving(true);

    try {
      await setProfilePhotoFromFile(file);
    } catch (uploadError) {
      setError(uploadError.message || 'Foto profil gagal diperbarui.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemove = () => {
    setError('');
    removeProfilePhoto();
  };

  return (
    <div className={cx('flex flex-col items-center gap-3', className)}>
      <div
        className={cx(
          'relative overflow-hidden rounded-full',
          'border-2 border-[#174D36]/20 bg-[#E8EFE3]',
          'shadow-sm',
          sizeClasses,
        )}
      >
        {profile.photo ? (
          <img
            src={profile.photo}
            alt={`Foto profil ${profile.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center font-['Outfit'] text-xl font-bold text-[#174D36]">
            {getProfileInitials(profile.name)}
          </div>
        )}

        <span
          className="absolute bottom-1 right-1 h-3 w-3 rounded-full bg-[#8FA88C] ring-2 ring-[#FFFDF7]"
          aria-label="Status aktif"
        />
      </div>

      {showControls && (
        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            className="sr-only"
            onChange={handleFileChange}
          />

          <button
            type="button"
            onClick={handleChooseFile}
            disabled={isSaving}
            className={cx(
              'inline-flex items-center gap-2 rounded-xl px-4 py-2',
              'bg-[#174D36] text-sm font-semibold text-white',
              'transition hover:bg-[#0F3524]',
              'disabled:cursor-not-allowed disabled:opacity-60',
            )}
          >
            <span className="material-symbols-outlined text-[18px]">
              upload
            </span>
            {isSaving ? 'Memproses...' : 'Ganti foto'}
          </button>

          {profile.photo && (
            <button
              type="button"
              onClick={handleRemove}
              disabled={isSaving}
              className="rounded-xl border border-[#DDE2D9] bg-[#FFFDF7] px-4 py-2 text-sm font-semibold text-[#B5653A] transition hover:bg-[#FAF4DD] disabled:opacity-60"
            >
              Hapus
            </button>
          )}
        </div>
      )}

      {error && (
        <p className="max-w-xs text-center text-xs font-medium text-[#B5653A]">
          {error}
        </p>
      )}
    </div>
  );
}
