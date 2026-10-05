/**
 * @file src/pages/Home.jsx
 * NuSaJoy — Beranda
 *
 * Beranda sebagai layar kerja, bukan landing page:
 *   pencarian → pintasan → trip aktif → pengalaman → pemandu
 *
 * Data pemandu memakai hook katalog Supabase; aksi dan pengalaman
 * datang dari sharedPageProps di App.jsx.
 * Bentuk data dibaca lewat helper utils/format.js supaya tidak bergantung
 * pada struktur mockData tertentu.
 */

import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  Bus,
  Compass,
  Heart,
  Plus,
  Route,
  Search,
  Sparkles,
  Store,
  UserRound,
  X,
} from 'lucide-react';

import PartnerStrip from '../components/PartnerStrip.jsx';
import useTourGuides from '../hooks/useTourGuide.js';
import { formatGuidePrice, getGuideInitials } from '../utils/guide.js';

import {
  getItemImage,
  getItemPriceLabel,
  getItemTitle,
  getLocationLabel,
  getRating,
  getReviewCount,
} from '../utils/format.js';

/* ==========================================================================
   KONSTANTA
   ========================================================================== */

const DEFAULT_LIMIT = 6;
const FILTERED_LIMIT = 12;
const GUIDE_LIMIT = 8;
const SKELETON_COUNT = 6;

/** Destinasi yang sudah punya halaman detail (/destination/:id). */
const FEATURED_DESTINATIONS = [
  {
    id: 1,
    title: 'Nusa Penida',
    location: 'Bali',
    category: 'Pantai',
    image:
      'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Taman Nasional Bromo',
    location: 'Jawa Timur',
    category: 'Gunung',
    image:
      'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Labuan Bajo',
    location: 'Nusa Tenggara Timur',
    category: 'Bahari',
    image:
      'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
  },
];

const toRating = (value) => {
  const number = Number(value);

  return Number.isFinite(number) && number > 0 ? number.toFixed(1) : null;
};

const focusRing =
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#174D36]/40';

/* ==========================================================================
   BAGIAN KECIL
   ========================================================================== */

const ICONS = {
  search: Search,
  close: X,
  favorite: Heart,
  add: Plus,
  explore: Compass,
  auto_awesome: Sparkles,
  trip: Route,
  stay: Building2,
  transport: Bus,
  guide: UserRound,
  business: Store,
};

function Icon({ name, filled = false, className = '' }) {
  const Glyph = ICONS[name];

  if (!Glyph) {
    return null;
  }

  const size = Number(/text-\[(\d+)px\]/.exec(className)?.[1]) || 20;

  return (
    <Glyph
      size={size}
      className={className}
      fill={filled ? 'currentColor' : 'none'}
      aria-hidden="true"
    />
  );
}

function SectionHeader({ title, actionLabel, onAction }) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4">
      <h2 className="font-['Outfit'] text-xl font-bold text-[#17251E] sm:text-2xl">
        {title}
      </h2>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`rounded-lg px-1 text-sm font-semibold text-[#174D36] hover:underline ${focusRing}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

function QuickAction({ icon, label, badge, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex flex-col items-center gap-2 rounded-[20px] border border-[#DDE2D9] bg-[#FFFDF7] px-1.5 py-3.5 text-center transition-colors hover:border-[#8FA88C] hover:bg-white ${focusRing}`}
    >
      <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#F4EED8] text-[#174D36]">
        <Icon name={icon} className="text-[24px]" />
      </span>

      <span className="text-[12px] font-semibold leading-tight text-[#17251E] sm:text-[13px]">
        {label}
      </span>

      {badge > 0 && (
        <span
          className="absolute right-2.5 top-2.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-[#B5653A] px-1.5 text-[11px] font-bold text-white"
          aria-label={`${badge} item`}
        >
          {badge}
        </span>
      )}
    </button>
  );
}

function ExperienceCard({
  item,
  favorited,
  onOpen,
  onToggleFavorite,
  onAddToTrip,
}) {
  const title = getItemTitle(item);
  const image = getItemImage(item);
  const location = getLocationLabel(item);
  const price = getItemPriceLabel(item);
  const rating = toRating(getRating(item));
  const reviews = Number(getReviewCount(item)) || 0;

  return (
    <article className="flex flex-col overflow-hidden rounded-[22px] border border-[#DDE2D9] bg-[#FFFDF7] transition-shadow hover:shadow-[0_10px_28px_rgba(23,37,30,0.08)]">
      <div className="relative">
        {/* Area gambar ikut membuka detail, tetapi tidak jadi tab-stop ganda. */}
        <button
          type="button"
          tabIndex={-1}
          aria-hidden="true"
          onClick={() => onOpen?.(item)}
          className="block w-full"
        >
          <div className="aspect-[4/3] w-full overflow-hidden bg-[#EEE8D2]">
            {image && (
              <img
                src={image}
                alt=""
                loading="lazy"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        </button>

        <button
          type="button"
          aria-pressed={favorited}
          aria-label={
            favorited
              ? `Hapus ${title} dari favorit`
              : `Simpan ${title} ke favorit`
          }
          onClick={() => onToggleFavorite?.(item)}
          className={`absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-white ${focusRing} ${
            favorited ? 'text-[#B5653A]' : 'text-[#68736D]'
          }`}
        >
          <Icon name="favorite" filled={favorited} className="text-[20px]" />
        </button>
      </div>

      <div className="flex flex-1 flex-col p-4">
        <button
          type="button"
          onClick={() => onOpen?.(item)}
          className={`rounded-md text-left ${focusRing}`}
        >
          <h3 className="font-['Outfit'] text-[17px] font-semibold leading-snug text-[#17251E]">
            {title}
          </h3>
        </button>

        <p className="mt-1 text-[13px] text-[#68736D]">
          {location}
          {rating && (
            <>
              <span aria-hidden="true"> · </span>
              <span>
                {rating}
                {reviews > 0 && ` (${reviews})`}
              </span>
            </>
          )}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-4">
          <span className="text-sm font-semibold text-[#174D36]">{price}</span>

          <button
            type="button"
            onClick={() => onAddToTrip?.(item)}
            aria-label={`Tambahkan ${title} ke My Trip`}
            className={`flex items-center gap-1 rounded-full border border-[#174D36]/25 px-3 py-1.5 text-[13px] font-semibold text-[#174D36] transition-colors hover:bg-[#174D36] hover:text-white ${focusRing}`}
          >
            <Icon name="add" className="text-[16px]" />
            Trip
          </button>
        </div>
      </div>
    </article>
  );
}

function GuideCard({ guide }) {
  const name = getItemTitle(guide);
  const image = guide.profile_photo || guide.image_url || guide.photo || guide.image;
  const [imageFailed, setImageFailed] = useState(false);
  const rating = toRating(getRating(guide));
  const specialty = guide.specialty || guide.specialties?.[0] || guide.category || '';

  return (
    <Link
      to={`/guide/${guide.id}`}
      aria-label={`Lihat profil ${name}`}
      className={`flex min-w-[250px] items-center gap-3 rounded-[20px] border border-[#DDE2D9] bg-[#FFFDF7] p-3 text-left transition-colors hover:border-[#8FA88C] ${focusRing}`}
    >
      <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#EEE8D2] font-semibold text-[#174D36]">
        {image && !imageFailed ? (
          <img
            src={image}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="h-full w-full object-cover"
          />
        ) : getGuideInitials(guide)}
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate text-[15px] font-semibold text-[#17251E]">
          {name}
        </span>

        <span className="block truncate text-[13px] text-[#68736D]">
          {[specialty, rating && `${rating} ★`].filter(Boolean).join(' · ')}
        </span>
        <span className="mt-1 block truncate text-[12px] text-[#68736D]">
          {getLocationLabel(guide)}
        </span>
        <span className="mt-1 block text-[13px] font-semibold text-[#174D36]">
          {guide.price > 0 ? `${formatGuidePrice(guide.price)} / ${guide.priceUnit === 'trip' ? 'trip' : 'hari'}` : 'Tarif belum tersedia'}
        </span>
      </span>
    </Link>
  );
}

function DestinationCard({ destination }) {
  return (
    <Link
      to={`/destination/${destination.id}`}
      className={`group flex items-center gap-3 rounded-[20px] border border-[#DDE2D9] bg-[#FFFDF7] p-3 transition-colors hover:border-[#8FA88C] ${focusRing}`}
    >
      <span className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-[#EEE8D2]">
        <img
          src={destination.image}
          alt=""
          loading="lazy"
          className="h-full w-full object-cover"
        />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block truncate font-['Outfit'] text-[16px] font-semibold text-[#17251E]">
          {destination.title}
        </span>

        <span className="block truncate text-[13px] text-[#68736D]">
          {destination.location} · {destination.category}
        </span>
      </span>
    </Link>
  );
}

function GuideSkeleton() {
  return (
    <div aria-hidden="true" className="flex items-center gap-3 rounded-[20px] border border-[#DDE2D9] bg-[#FFFDF7] p-3">
      <span className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-[#EEE8D2] motion-reduce:animate-none" />
      <span className="flex-1 space-y-2">
        <span className="block h-4 w-3/4 animate-pulse rounded bg-[#EEE8D2] motion-reduce:animate-none" />
        <span className="block h-3 w-1/2 animate-pulse rounded bg-[#EEE8D2] motion-reduce:animate-none" />
      </span>
    </div>
  );
}

function CardSkeleton() {
  return (
    <div
      className="overflow-hidden rounded-[22px] border border-[#DDE2D9] bg-[#FFFDF7]"
      aria-hidden="true"
    >
      <div className="aspect-[4/3] animate-pulse bg-[#EEE8D2] motion-reduce:animate-none" />
      <div className="space-y-2 p-4">
        <div className="h-4 w-3/4 animate-pulse rounded bg-[#EEE8D2] motion-reduce:animate-none" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-[#EEE8D2] motion-reduce:animate-none" />
      </div>
    </div>
  );
}

function StateMessage({ title, actionLabel, onAction }) {
  return (
    <div
      role="status"
      className="flex flex-col items-center gap-3 rounded-[22px] border border-dashed border-[#DDE2D9] bg-[#FFFDF7] px-6 py-12 text-center"
    >
      <p className="text-[15px] font-medium text-[#17251E]">{title}</p>

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className={`rounded-full bg-[#174D36] px-5 py-2 text-sm font-semibold text-white hover:bg-[#0F3524] ${focusRing}`}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

/* ==========================================================================
   HALAMAN
   ========================================================================== */

export default function Home({
  uiState = 'normal',
  onRetry,

  experiences = [],
  onSelectExperience,

  isFavorited,
  onToggleFavorite,
  favoritesCount = 0,
  onOpenFavorites,

  activeTrip,
  onAddToTrip,
  onGoToMyTrip,

  onNavigateTab,
  onNavigateExplore,
  onOpenQuickTripGate,
}) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const { guides, loading: guidesLoading, error: guidesError, refetch: refetchGuides } = useTourGuides();

  /* ------------------------------------------------------------------------
     DATA TURUNAN
  ------------------------------------------------------------------------ */

  const categories = useMemo(() => {
    const unique = new Set();

    experiences.forEach((experience) => {
      if (experience?.category) {
        unique.add(String(experience.category));
      }
    });

    return [...unique].slice(0, 6);
  }, [experiences]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();

    return experiences.filter((experience) => {
      if (category !== 'all' && String(experience?.category) !== category) {
        return false;
      }

      if (!keyword) {
        return true;
      }

      return [
        getItemTitle(experience),
        getLocationLabel(experience),
        experience?.category,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(keyword);
    });
  }, [experiences, query, category]);

  const isFiltering = query.trim() !== '' || category !== 'all';
  const visible = filtered.slice(
    0,
    isFiltering ? FILTERED_LIMIT : DEFAULT_LIMIT,
  );

  const tripItems = Array.isArray(activeTrip?.items) ? activeTrip.items : [];
  const tripCount = tripItems.length;

  /* ------------------------------------------------------------------------
     AKSI
  ------------------------------------------------------------------------ */

  const handleSearch = (event) => {
    event.preventDefault();

    document
      .getElementById('home-results')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const resetFilters = () => {
    setQuery('');
    setCategory('all');
  };

  /* ------------------------------------------------------------------------
     DAFTAR PENGALAMAN (mengikuti UI state dari State Simulator)
  ------------------------------------------------------------------------ */

  let experienceContent;

  if (uiState === 'loading') {
    experienceContent = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: SKELETON_COUNT }, (_, index) => (
          <CardSkeleton key={index} />
        ))}
      </div>
    );
  } else if (uiState === 'error') {
    experienceContent = (
      <StateMessage
        title="Pengalaman belum bisa dimuat."
        actionLabel="Coba lagi"
        onAction={onRetry}
      />
    );
  } else if (uiState === 'empty' || experiences.length === 0) {
    experienceContent = (
      <StateMessage
        title="Belum ada pengalaman untuk ditampilkan."
        actionLabel="Buka Jelajah"
        onAction={onNavigateExplore}
      />
    );
  } else if (visible.length === 0) {
    experienceContent = (
      <StateMessage
        title="Tidak ada yang cocok dengan pencarianmu."
        actionLabel="Hapus filter"
        onAction={resetFilters}
      />
    );
  } else {
    experienceContent = (
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((experience, index) => (
          <ExperienceCard
            key={experience?.id ?? index}
            item={experience}
            favorited={Boolean(isFavorited?.(experience))}
            onOpen={onSelectExperience}
            onToggleFavorite={onToggleFavorite}
            onAddToTrip={onAddToTrip}
          />
        ))}
      </div>
    );
  }

  /* ------------------------------------------------------------------------
     RENDER
  ------------------------------------------------------------------------ */

  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      {/* LOGO NUSAJOY & MITRA */}
      <PartnerStrip className="mb-6" />

      {/* PENCARIAN */}
      <form
        role="search"
        onSubmit={handleSearch}
        className="flex items-center gap-2 rounded-[22px] border border-[#DDE2D9] bg-[#FFFDF7] p-2 shadow-[0_8px_24px_rgba(23,37,30,0.06)]"
      >
        <Icon name="search" className="ml-3 shrink-0 text-[22px] text-[#68736D]" />

        <label htmlFor="home-search" className="sr-only">
          Cari destinasi atau pengalaman
        </label>

        <input
          id="home-search"
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Cari destinasi, pengalaman, atau kota"
          autoComplete="off"
          className="min-w-0 flex-1 bg-transparent px-1 py-3 text-[15px] text-[#17251E] outline-none placeholder:text-[#68736D]"
        />

        {query && (
          <button
            type="button"
            aria-label="Hapus pencarian"
            onClick={() => setQuery('')}
            className={`flex h-9 w-9 items-center justify-center rounded-full text-[#68736D] hover:bg-[#F4EED8] ${focusRing}`}
          >
            <Icon name="close" className="text-[18px]" />
          </button>
        )}

        <button
          type="submit"
          className={`rounded-2xl bg-[#174D36] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#0F3524] ${focusRing}`}
        >
          Cari
        </button>
      </form>

      {/* KATEGORI */}
      {categories.length > 0 && uiState === 'normal' && (
        <div
          role="group"
          aria-label="Filter kategori"
          className="mt-4 flex flex-wrap gap-2"
        >
          {['all', ...categories].map((value) => {
            const active = category === value;

            return (
              <button
                key={value}
                type="button"
                aria-pressed={active}
                onClick={() => setCategory(value)}
                className={`rounded-full border px-4 py-1.5 text-[13px] font-semibold transition-colors ${focusRing} ${
                  active
                    ? 'border-[#174D36] bg-[#174D36] text-white'
                    : 'border-[#DDE2D9] bg-[#FFFDF7] text-[#17251E] hover:border-[#8FA88C]'
                }`}
              >
                {value === 'all' ? 'Semua' : value}
              </button>
            );
          })}
        </div>
      )}

      {/* PINTASAN */}
      <nav
        aria-label="Pintasan"
        className="mt-6 grid grid-cols-4 gap-3 sm:grid-cols-8"
      >
        <QuickAction
          icon="explore"
          label="Jelajah"
          onClick={() => onNavigateExplore?.()}
        />
        <QuickAction
          icon="auto_awesome"
          label="Rekomendasi"
          onClick={() => onNavigateTab?.('rekomendasi')}
        />
        <QuickAction
          icon="trip"
          label="My Trip"
          badge={tripCount}
          onClick={() => onGoToMyTrip?.()}
        />
        <QuickAction
          icon="favorite"
          label="Favorit"
          badge={favoritesCount}
          onClick={() => onOpenFavorites?.()}
        />
        <QuickAction
          icon="guide"
          label="Pemandu"
          onClick={() => onNavigateTab?.('/tour-guide')}
        />
        <QuickAction
          icon="business"
          label="Usaha Lokal"
          onClick={() => onNavigateTab?.('/local-business')}
        />
        <QuickAction
          icon="stay"
          label="Penginapan"
          onClick={() => onOpenQuickTripGate?.('stay')}
        />
        <QuickAction
          icon="transport"
          label="Transportasi"
          onClick={() => onOpenQuickTripGate?.('transport')}
        />
      </nav>

      {/* TRIP AKTIF */}
      <section
        aria-label="Trip aktif"
        className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[#DDE2D9] bg-[#FFFDF7] px-5 py-4"
      >
        <div className="min-w-0">
          <p className="truncate font-['Outfit'] text-[17px] font-semibold text-[#17251E]">
            {activeTrip?.title || 'Trip kamu'}
          </p>

          <p className="text-[13px] text-[#68736D]">
            {tripCount > 0
              ? `${tripCount} aktivitas direncanakan`
              : 'Belum ada aktivitas. Tambahkan dari daftar di bawah.'}
          </p>
        </div>

        <button
          type="button"
          onClick={() => onGoToMyTrip?.()}
          className={`rounded-full border border-[#174D36]/25 px-4 py-2 text-sm font-semibold text-[#174D36] transition-colors hover:bg-[#174D36] hover:text-white ${focusRing}`}
        >
          Buka My Trip
        </button>
      </section>

      {/* PENGALAMAN */}
      <section id="home-results" aria-label="Pengalaman" className="mt-10 scroll-mt-28">
        <SectionHeader
          title={isFiltering ? 'Hasil pencarian' : 'Untuk kamu'}
          actionLabel={
            !isFiltering && experiences.length > DEFAULT_LIMIT
              ? 'Lihat semua'
              : undefined
          }
          onAction={() => onNavigateExplore?.()}
        />

        {experienceContent}
      </section>

      {/* DESTINASI */}
      {uiState === 'normal' && (
        <section aria-label="Destinasi" className="mt-10">
          <SectionHeader title="Destinasi" />

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURED_DESTINATIONS.map((destination) => (
              <DestinationCard key={destination.id} destination={destination} />
            ))}
          </div>
        </section>
      )}

      {/* PEMANDU */}
      {uiState === 'normal' && (
        <section aria-label="Pemandu lokal" className="mt-10">
          <SectionHeader title="Pemandu lokal" actionLabel="Lihat semua pemandu" onAction={() => onNavigateTab?.('/guides')} />

          {guidesLoading ? (
            <div role="status" aria-label="Memuat pemandu lokal" className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 3 }, (_, index) => <GuideSkeleton key={index} />)}
            </div>
          ) : guidesError ? (
            <StateMessage title="Pemandu lokal belum bisa dimuat." actionLabel="Coba muat ulang pemandu" onAction={() => void refetchGuides()} />
          ) : guides.length === 0 ? (
            <StateMessage title="Belum ada pemandu lokal yang dipublikasikan." />
          ) : <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0">
            {guides.slice(0, GUIDE_LIMIT).map((guide) => (
              <GuideCard
                key={guide.id}
                guide={guide}
              />
            ))}
          </div>}
        </section>
      )}
    </div>
  );
}
