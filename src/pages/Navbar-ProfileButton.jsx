import { memo, useEffect, useState } from 'react';
import { getUserProfile, getProfileInitials, subscribeToProfile } from '../utils/profile.js';

const cx = (...classes) => classes.filter(Boolean).join(' ');

const ProfileButton = memo(function ProfileButton({ onClick }) {
  const [profile, setProfile] = useState(getUserProfile());

  useEffect(() => subscribeToProfile(setProfile), []);

  const initials = getProfileInitials(profile.name);

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Buka menu akun"
      title={profile.name || 'Akun'}
      className={cx(
        'group relative flex items-center justify-center',
        'rounded-full p-0.5',
        'border border-[#174D36]/30',
        'bg-[#FFFDF7]',
        'transition-all duration-200',
        'hover:border-[#174D36]',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/40',
        'cursor-pointer',
      )}
    >
      <span
        className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-[#174D36] bg-[#E8EFE3] p-[1.5px] font-['Outfit'] text-[11px] font-bold text-[#174D36]"
        aria-hidden="true"
      >
        {profile.photo ? (
          <img
            src={profile.photo}
            alt=""
            className="h-full w-full rounded-full object-cover"
          />
        ) : (
          initials
        )}
      </span>

      <span
        className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-[#8FA88C] ring-2 ring-[#FFFDF7]"
        aria-label="Status aktif"
      />
    </button>
  );
});

export default ProfileButton;
