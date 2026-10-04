import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'

import { Link } from 'react-router-dom'

import {
  ArrowRight,
  CalendarClock,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  Heart,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  Search,
  Sparkles,
  Star,
  WalletCards,
  X,
} from 'lucide-react'

// ============================================================
// SUPABASE
// ============================================================
//
// Recommendation.jsx berada di src/pages.
// Supabase client berada di src/utils.
//

import { supabase } from '../utils/supabaseClient'

// ============================================================
// STYLESHEET
// ============================================================

import '../styles/recommendation.css'

// ============================================================
// KONFIGURASI
// ============================================================

// Supabase (PostgREST) membatasi 1000 baris per permintaan.
// Data diambil per halaman agar SELURUH tabel terbaca.
const PAGE_SIZE = 1000
const MAX_ROWS = 10000
const CACHE_TTL_MS = 5 * 60 * 1000

// Kandidat yang disimpan setelah scoring, dan jumlah kartu
// yang tampil per tahap ("Tampilkan lebih banyak").
const RESULT_POOL_SIZE = 60
const INITIAL_VISIBLE = 8
const LOAD_MORE_STEP = 9

// Re-ranking keberagaman: kategori / wilayah yang sudah muncul
// diberi penalti kecil agar hasil tidak seragam.
const DIVERSITY_CATEGORY_PENALTY = 3
const DIVERSITY_AREA_PENALTY = 4
const DIVERSITY_MAX_REPEATS = 5

// Destinasi di luar wilayah yang dipilih tetap boleh muncul
// sebagai alternatif, tetapi selalu di bawah yang sesuai wilayah.
const OUT_OF_AREA_PENALTY = 100

// ============================================================
// PRESET SMART MATCHER (nilai awal / cadangan)
// Preset ini tetap dipakai. Saat data Supabase tersedia,
// daftar opsi diperkaya otomatis dari data.
// ============================================================

const CITY_OPTIONS = [
  {
    value: 'Semua Lokasi',
    label: 'Semua Lokasi',
    aliases: [],
  },
  {
    value: 'Yogyakarta',
    label: 'Yogyakarta & Sekitarnya',
    aliases: [
      'yogyakarta',
      'jogja',
      'sleman',
      'bantul',
      'kulon progo',
      'gunungkidul',
    ],
  },
  {
    value: 'Bali',
    label: 'Bali',
    aliases: [
      'bali',
      'sidemen',
      'karangasem',
      'bangli',
      'badung',
      'buleleng',
      'gianyar',
      'tabanan',
      'klungkung',
      'jembrana',
      'denpasar',
    ],
  },
  {
    value: 'Bandung',
    label: 'Bandung & Sekitarnya',
    aliases: ['bandung', 'pangalengan', 'lembang'],
  },
  {
    value: 'Lombok',
    label: 'Lombok',
    aliases: ['lombok', 'sade', 'mataram', 'sembalun'],
  },
  {
    value: 'Semarang',
    label: 'Semarang & Sekitarnya',
    aliases: ['semarang', 'kota lama'],
  },
]

const DURATION_OPTIONS = [
  {
    value: '2-4h',
    label: '2 - 4 Jam (Singkat & Padat)',
    hours: 4,
  },
  {
    value: 'halfday',
    label: 'Setengah Hari (4 - 6 Jam)',
    hours: 6,
  },
  {
    value: 'fullday',
    label: 'Seharian Penuh (8 Jam)',
    hours: 8,
  },
  {
    value: 'multiday',
    label: '2 - 3 Hari (Itinerary Lengkap)',
    hours: 72,
  },
]

const RHYTHM_OPTIONS = [
  { id: 'santai', label: 'Santai' },
  { id: 'sedang', label: 'Seimbang' },
  { id: 'aktif', label: 'Aktif' },
]

const INTEREST_PRESETS = [
  {
    value: 'Kuliner',
    label: 'Kuliner Warisan & Kopi',
    keywords: ['kuliner', 'makan', 'kopi', 'food'],
  },
  {
    value: 'Kriya',
    label: 'Lokakarya Kriya & Keramik',
    keywords: [
      'kriya',
      'keramik',
      'lokakarya',
      'craft',
      'handicraft',
    ],
  },
  {
    value: 'Walking',
    label: 'Walking Tour & Narasi Sejarah',
    keywords: [
      'walking',
      'sejarah',
      'heritage',
      'gang',
      'keraton',
      'history',
    ],
  },
  {
    value: 'Teduh',
    label: 'Wisata Alam & Perkebunan Teduh',
    keywords: [
      'alam',
      'perkebunan',
      'danau',
      'hutan',
      'kebun',
      'nature',
    ],
  },
]

const BUDGET_OPTIONS = [
  { value: 'hemat', label: 'Hemat', amount: 25000 },
  { value: 'menengah', label: 'Menengah', amount: 50000 },
  { value: 'nyaman', label: 'Nyaman', amount: 100000 },
  { value: 'fleksibel', label: 'Fleksibel', amount: 200000 },
]

// ============================================================
// HELPER MURNI
// ============================================================

function normalizeText(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function includesAny(text, keywords = []) {
  const normalized = normalizeText(text)

  return keywords.some((keyword) =>
    normalized.includes(normalizeText(keyword))
  )
}

function formatPrice(price) {
  const numericPrice = Number(price)

  if (!Number.isFinite(numericPrice)) {
    return 'Rp0'
  }

  return `Rp${numericPrice.toLocaleString('id-ID')}`
}

function formatDuration(destination) {
  if (destination?.durationText) {
    return destination.durationText
  }

  if (destination?.duration != null) {
    const numericDuration = Number(destination.duration)

    if (numericDuration === 72) {
      return '2 - 3 Hari'
    }

    if (numericDuration >= 24) {
      return `${Math.round(numericDuration / 24)} Hari`
    }

    if (Number.isFinite(numericDuration)) {
      return `${numericDuration} Jam`
    }
  }

  return 'Durasi fleksibel'
}

function formatHours(hours) {
  const numeric = Number(hours)

  if (numeric === 72) {
    return '2 - 3 hari'
  }

  if (numeric >= 24) {
    return `${Math.round(numeric / 24)} hari`
  }

  return `${numeric} jam`
}

function isTruthyBoolean(value) {
  return (
    value === true ||
    value === 1 ||
    value === '1' ||
    normalizeText(value) === 'true' ||
    normalizeText(value) === 'yes'
  )
}

/** Teks lokasi mentah dari satu baris destinasi. */
function getLocationText(destination) {
  return String(
    destination?.location || destination?.province || ''
  ).trim()
}

/** "Bangli, Bali" → "Bali" · "Pacitan" → "Pacitan". */
function getProvince(destination) {
  const parts = getLocationText(destination)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length ? parts[parts.length - 1] : ''
}

/** "Bangli, Bali" → "Bangli". */
function getLocality(destination) {
  const parts = getLocationText(destination)
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)

  return parts.length ? parts[0] : ''
}

function getSearchableText(destination) {
  return normalizeText(
    [
      destination?.category,
      destination?.title,
      destination?.name,
      destination?.description,
      destination?.short_description,
      destination?.activities,
    ]
      .flat()
      .join(' ')
  )
}

/**
 * Pilih `limit` item dengan keseimbangan skor dan keberagaman.
 * `items` HARUS sudah urut dari skor tertinggi.
 * Prefix hasilnya stabil: 8 item pertama selalu sama dengan
 * 8 item pertama dari hasil 17 item.
 */
function diversifyResults(
  items,
  limit,
  scoreKey,
  areaMode = 'province'
) {
  const pool = items.map((item) => ({
    item,
    base: Number(item?.[scoreKey]) || 0,
    category: normalizeText(item?.category) || '-',
    area:
      normalizeText(
        areaMode === 'locality'
          ? getLocality(item)
          : getProvince(item)
      ) || '-',
  }))

  const picked = []
  const categoryCount = new Map()
  const areaCount = new Map()

  while (pool.length > 0 && picked.length < limit) {
    let bestIndex = 0
    let bestValue = -Infinity

    for (let index = 0; index < pool.length; index += 1) {
      const entry = pool[index]

      const value =
        entry.base -
        Math.min(
          categoryCount.get(entry.category) || 0,
          DIVERSITY_MAX_REPEATS
        ) *
          DIVERSITY_CATEGORY_PENALTY -
        Math.min(
          areaCount.get(entry.area) || 0,
          DIVERSITY_MAX_REPEATS
        ) *
          DIVERSITY_AREA_PENALTY

      if (value > bestValue) {
        bestValue = value
        bestIndex = index
      }
    }

    const [chosen] = pool.splice(bestIndex, 1)

    picked.push(chosen.item)

    categoryCount.set(
      chosen.category,
      (categoryCount.get(chosen.category) || 0) + 1
    )

    areaCount.set(
      chosen.area,
      (areaCount.get(chosen.area) || 0) + 1
    )
  }

  return picked
}

// ============================================================
// PENGAMBILAN DATA SUPABASE (paginasi + cache)
// ============================================================

let destinationsCache = { rows: null, at: 0 }
let destinationsInflight = null

async function fetchDestinationPage(from, to) {
  let response = await supabase
    .from('destinations')
    .select('*')
    .order('id', { ascending: true })
    .range(from, to)

  // Tabel tanpa kolom "id": ulangi tanpa pengurutan.
  if (
    response.error &&
    (response.error.code === '42703' ||
      /column .*id/i.test(response.error.message || ''))
  ) {
    response = await supabase
      .from('destinations')
      .select('*')
      .range(from, to)
  }

  return response
}

async function fetchAllDestinations() {
  if (!supabase || typeof supabase.from !== 'function') {
    throw new Error(
      'Supabase client belum tersedia. Periksa src/utils/supabaseClient.js.'
    )
  }

  const rows = []

  for (let from = 0; from < MAX_ROWS; from += PAGE_SIZE) {
    const { data, error } = await fetchDestinationPage(
      from,
      from + PAGE_SIZE - 1
    )

    if (error) {
      throw error
    }

    if (!Array.isArray(data) || data.length === 0) {
      break
    }

    rows.push(...data)

    if (data.length < PAGE_SIZE) {
      break
    }
  }

  // Buang baris duplikat bila ada.
  const unique = new Map()

  rows.forEach((row, index) => {
    unique.set(
      row?.id ?? row?.slug ?? `row-${index}`,
      row
    )
  })

  return [...unique.values()]
}

function getDestinations({ force = false } = {}) {
  const fresh =
    destinationsCache.rows &&
    Date.now() - destinationsCache.at < CACHE_TTL_MS

  if (!force && fresh) {
    return Promise.resolve(destinationsCache.rows)
  }

  if (!destinationsInflight) {
    destinationsInflight = fetchAllDestinations()
      .then((rows) => {
        destinationsCache = { rows, at: Date.now() }

        return rows
      })
      .finally(() => {
        destinationsInflight = null
      })
  }

  return destinationsInflight
}

// ============================================================
// KOMPONEN KECIL
// ============================================================

/** <option> dikelompokkan dengan <optgroup> bila `group` terisi. */
function GroupedOptions({ options }) {
  const groups = []

  options.forEach((option) => {
    const name = option.group || ''

    let bucket = groups.find((item) => item.name === name)

    if (!bucket) {
      bucket = { name, items: [] }
      groups.push(bucket)
    }

    bucket.items.push(option)
  })

  return groups.map((group) =>
    group.name ? (
      <optgroup key={group.name} label={group.name}>
        {group.items.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </optgroup>
    ) : (
      group.items.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))
    )
  )
}

// ============================================================
// LEGACY FILTER BUTTON
// DIPINDAHKAN KE LUAR Recommendation()
// AGAR TIDAK DIBUAT ULANG PADA SETIAP RENDER
// ============================================================

function FilterButton({
  icon,
  label,
  value,
  filter,
  activeFilter,
  onToggle,
}) {
  const active = activeFilter === filter

  return (
    <button
      type="button"
      className={`nusa-rec-filter-chip ${
        active ? 'is-active' : ''
      }`}
      onClick={() => onToggle(active ? null : filter)}
      aria-expanded={active}
      aria-controls={`nusa-rec-filter-panel-${filter}`}
    >
      <span className="nusa-rec-filter-icon">{icon}</span>

      <span className="nusa-rec-filter-content">
        <small>{label}</small>

        <strong>{value}</strong>
      </span>

      <span
        className="nusa-rec-filter-arrow"
        aria-hidden="true"
      >
        {active ? '⌃' : '⌄'}
      </span>
    </button>
  )
}

function Recommendation(props = {}) {
  // ============================================================
  // CALLBACK / SHARED PROPS
  // ============================================================

  const {
    onSelectExperience,
    onAddToTrip,
    onSaveFavorite,
    isFavorited,
    uiState = 'normal',
    onRetry,
  } = props

  const isMountedRef = useRef(true)

  // ============================================================
  // LEGACY STATE
  // ============================================================

  const [destinations, setDestinations] = useState([])
  const [results, setResults] = useState([])
  const [location, setLocation] = useState('Semua Lokasi')
  const [interest, setInterest] = useState('Semua Minat')
  const [budget, setBudget] = useState(50000)
  const [duration, setDuration] = useState(3)
  const [loading, setLoading] = useState(false)
  const [fetchingDestinations, setFetchingDestinations] =
    useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [hasSearched, setHasSearched] = useState(false)
  const [activeFilter, setActiveFilter] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')

  // ============================================================
  // SMART MATCHER STATE
  // ============================================================

  const [selectedRhythm, setSelectedRhythm] = useState('santai')

  const [selectedDuration, setSelectedDuration] =
    useState('2-4h')

  const [selectedBudgetTier, setSelectedBudgetTier] =
    useState('menengah')

  // Default "Semua Minat": sebelumnya label menampilkan
  // "Kuliner" padahal scoring memakai "Semua Minat".
  const [selectedInterestPreset, setSelectedInterestPreset] =
    useState('Semua Minat')

  const [selectedCityPreset, setSelectedCityPreset] =
    useState('Semua Lokasi')

  const [localFavorites, setLocalFavorites] = useState([])
  const [tripFeedback, setTripFeedback] = useState('')
  const [showAdvancedInfo, setShowAdvancedInfo] =
    useState(false)

  const [onlyHighMatch, setOnlyHighMatch] = useState(false)

  const [visibleCount, setVisibleCount] =
    useState(INITIAL_VISIBLE)

  // ============================================================
  // FETCH DESTINATIONS FROM SUPABASE
  // ============================================================

  const loadDestinations = useCallback(
    async ({ force = false } = {}) => {
      setFetchingDestinations(true)
      setErrorMsg('')

      try {
        const rows = await getDestinations({ force })

        if (isMountedRef.current) {
          setDestinations(
            Array.isArray(rows) ? rows : []
          )
        }
      } catch (error) {
        console.error('Gagal mengambil destinasi:', error)

        if (isMountedRef.current) {
          setDestinations([])

          setErrorMsg(
            error?.message ||
              'Gagal mengambil data destinasi.'
          )
        }
      } finally {
        if (isMountedRef.current) {
          setFetchingDestinations(false)
        }
      }
    },
    []
  )

  // ============================================================
  // INITIAL LOAD
  // PERBAIKAN:
  // Tidak memanggil loadDestinations() secara langsung di
  // body useEffect karena fungsi tersebut melakukan setState
  // sinkron. Loading awal tetap berjalan penuh.
  // ============================================================

  useEffect(() => {
    isMountedRef.current = true

    let cancelled = false

    const loadInitialDestinations = async () => {
      try {
        const rows = await getDestinations()

        if (cancelled || !isMountedRef.current) {
          return
        }

        setDestinations(
          Array.isArray(rows) ? rows : []
        )

        setErrorMsg('')
      } catch (error) {
        console.error('Gagal mengambil destinasi:', error)

        if (cancelled || !isMountedRef.current) {
          return
        }

        setDestinations([])

        setErrorMsg(
          error?.message ||
            'Gagal mengambil data destinasi.'
        )
      } finally {
        if (!cancelled && isMountedRef.current) {
          setFetchingDestinations(false)
        }
      }
    }

    void loadInitialDestinations()

    return () => {
      cancelled = true
      isMountedRef.current = false
    }
  }, [])

  // ============================================================
  // FILTER DERIVED DATA
  // ============================================================

  const locations = useMemo(() => {
    return [
      ...new Set(
        destinations
          .map((destination) => destination?.location)
          .filter(Boolean)
      ),
    ]
  }, [destinations])

  const interests = useMemo(() => {
    return [
      ...new Set(
        destinations
          .map((destination) => destination?.category)
          .filter(Boolean)
      ),
    ]
  }, [destinations])

  // Indeks ternormalisasi: dihitung sekali per perubahan data.
  const destinationIndex = useMemo(
    () =>
      destinations.map((destination) => ({
        loc: normalizeText(
          getLocationText(destination)
        ),

        hasComma:
          getLocationText(destination).includes(','),

        province: getProvince(destination),

        category: normalizeText(
          destination?.category
        ),

        text: getSearchableText(destination),

        price: Number(destination?.price) || 0,
      })),
    [destinations]
  )

  const coverage = useMemo(
    () => ({
      total: destinations.length,

      provinces: new Set(
        destinationIndex
          .map((item) =>
            normalizeText(item.province)
          )
          .filter(Boolean)
      ).size,

      categories: interests.length,
    }),
    [
      destinations.length,
      destinationIndex,
      interests.length,
    ]
  )

  // ============================================================
  // OPSI DINAMIS DARI SUPABASE
  // ============================================================

  const cityOptions = useMemo(() => {
    const allOption = {
      ...CITY_OPTIONS[0],
      shortLabel: 'Semua Lokasi',
      group: '',
    }

    if (destinationIndex.length === 0) {
      return [
        allOption,

        ...CITY_OPTIONS.slice(1).map((option) => ({
          ...option,
          shortLabel: option.label,
          group: 'Wilayah populer',
        })),
      ]
    }

    const countByAliases = (aliases) => {
      const normalized = aliases.map(normalizeText)

      return destinationIndex.reduce(
        (total, item) =>
          item.loc &&
          normalized.some((alias) =>
            item.loc.includes(alias)
          )
            ? total + 1
            : total,
        0
      )
    }

    const popular = CITY_OPTIONS.slice(1)
      .map((option) => ({
        ...option,

        count: countByAliases([
          option.value,
          ...option.aliases,
        ]),
      }))
      .filter((option) => option.count > 0)
      .map((option) => ({
        ...option,
        shortLabel: option.label,
        label: `${option.label} (${option.count})`,
        group: 'Wilayah populer',
      }))

    const covered = popular
      .flatMap((option) => [
        option.value,
        ...option.aliases,
      ])
      .map(normalizeText)

    const provinceNames = new Map()
    const cityNames = new Map()

    destinationIndex.forEach((item) => {
      if (!item.loc || !item.province) {
        return
      }

      if (
        covered.some((alias) =>
          item.loc.includes(alias)
        )
      ) {
        return
      }

      const key = normalizeText(item.province)

      const target = item.hasComma
        ? provinceNames
        : cityNames

      if (!target.has(key)) {
        target.set(key, item.province)
      }
    })

    const build = (names, group) =>
      [...names.entries()]
        .map(([key, display]) => ({
          value: display,

          shortLabel: display,

          aliases: [display],

          count: destinationIndex.filter((item) =>
            item.loc.includes(key)
          ).length,

          group,
        }))
        .sort(
          (a, b) =>
            b.count - a.count ||
            a.value.localeCompare(b.value, 'id')
        )
        .map((option) => ({
          ...option,
          label: `${option.value} (${option.count})`,
        }))

    return [
      {
        ...allOption,

        label: `Semua Lokasi (${destinationIndex.length})`,
      },

      ...popular,

      ...build(
        provinceNames,
        'Provinsi'
      ),

      ...build(
        cityNames,
        'Kota / Kabupaten'
      ),
    ]
  }, [destinationIndex])

  const interestOptions = useMemo(() => {
    const allOption = {
      value: 'Semua Minat',
      label: 'Semua Minat',
      shortLabel: 'Semua Minat',
      keywords: [],
      group: '',
    }

    if (destinationIndex.length === 0) {
      return [
        allOption,

        ...INTEREST_PRESETS.map((preset) => ({
          ...preset,
          shortLabel: preset.label,
          group: 'Tema pilihan',
        })),
      ]
    }

    const presets = INTEREST_PRESETS.map(
      (preset) => {
        const exact = normalizeText(
          preset.value
        )

        const count = destinationIndex.filter(
          (item) =>
            item.category === exact ||
            preset.keywords.some((keyword) =>
              item.text.includes(
                normalizeText(keyword)
              )
            )
        ).length

        return {
          ...preset,

          shortLabel: preset.label,

          label: `${preset.label} (${count})`,

          count,

          group: 'Tema pilihan',
        }
      }
    )

    const presetKeys = INTEREST_PRESETS.map(
      (preset) =>
        normalizeText(preset.value)
    )

    const categories = interests
      .filter(
        (category) =>
          !presetKeys.includes(
            normalizeText(category)
          )
      )
      .map((category) => {
        const key = normalizeText(category)

        const count = destinationIndex.filter(
          (item) =>
            item.category === key
        ).length

        return {
          value: category,

          shortLabel: category,

          keywords: [category],

          count,

          label: `${category} (${count})`,

          group: 'Kategori dari data',
        }
      })
      .sort(
        (a, b) =>
          b.count - a.count ||
          a.value.localeCompare(b.value, 'id')
      )

    return [
      {
        ...allOption,

        label: `Semua Minat (${destinationIndex.length})`,
      },

      ...presets.filter(
        (preset) => preset.count > 0
      ),

      ...categories,
    ]
  }, [
    destinationIndex,
    interests,
  ])

  const budgetOptions = useMemo(() => {
    const maxPrice = destinationIndex.reduce(
      (max, item) =>
        Math.max(max, item.price),
      0
    )

    const flexibleAmount = Math.max(
      200000,
      Math.ceil(maxPrice / 5000) * 5000
    )

    return BUDGET_OPTIONS.map((option) => {
      const amount =
        option.value === 'fleksibel'
          ? flexibleAmount
          : option.amount

      const count =
        destinationIndex.filter(
          (item) => item.price <= amount
        ).length

      return {
        ...option,

        amount,

        shortLabel: option.label,

        label:
          destinationIndex.length > 0
            ? `${option.label} · s/d ${formatPrice(
                amount
              )} (${count})`
            : option.label,
      }
    })
  }, [destinationIndex])

  const budgetMax =
    budgetOptions[
      budgetOptions.length - 1
    ].amount

  // ============================================================
  // VALIDASI PRESET TANPA setState DI useEffect
  //
  // Sebelumnya ada useEffect yang melakukan:
  // setSelectedCityPreset()
  // setLocation()
  // setSelectedInterestPreset()
  // setInterest()
  //
  // React memberi warning/error karena setState dipanggil
  // secara sinkron dari effect.
  //
  // Sekarang fallback dihitung secara derived state sehingga
  // fungsi lama tetap dipertahankan tanpa cascading render.
  // ============================================================

  const cityPresetIsAvailable =
    cityOptions.some(
      (option) =>
        option.value === selectedCityPreset
    )

  const interestPresetIsAvailable =
    interestOptions.some(
      (option) =>
        option.value ===
        selectedInterestPreset
    )

  const effectiveSelectedCityPreset =
    cityPresetIsAvailable
      ? selectedCityPreset
      : 'Semua Lokasi'

  const effectiveSelectedInterestPreset =
    interestPresetIsAvailable
      ? selectedInterestPreset
      : 'Semua Minat'

  const effectiveLocation =
    cityPresetIsAvailable
      ? location
      : 'Semua Lokasi'

  const effectiveInterest =
    interestPresetIsAvailable
      ? interest
      : 'Semua Minat'

  // ============================================================
  // RESOLUTION PRESETS
  // ============================================================

  /**
   * Nilai pilihan wilayah langsung disimpan sebagai `location`.
   * Pencocokan memakai alias sehingga "Bali" mencakup
   * SEMUA kabupaten di Bali, bukan hanya satu.
   */
  function resolveLocationForCity(cityValue) {
    if (cityValue === 'Semua Lokasi') {
      return 'Semua Lokasi'
    }

    return cityValue
  }

  function resolveInterestPreset(presetValue) {
    if (presetValue === 'Semua Minat') {
      return 'Semua Minat'
    }

    const preset = INTEREST_PRESETS.find(
      (item) => item.value === presetValue
    )

    // Kategori dinamis dari database dipakai apa adanya.
    if (!preset) {
      return presetValue
    }

    const exact = interests.find(
      (item) =>
        normalizeText(item) ===
        normalizeText(presetValue)
    )

    if (exact) {
      return exact
    }

    const fuzzy = interests.find((item) =>
      includesAny(
        item,
        preset.keywords
      )
    )

    return fuzzy || presetValue
  }

  function applyCityPreset(value) {
    setSelectedCityPreset(value)
    setLocation(
      resolveLocationForCity(value)
    )
  }

  function applyDurationPreset(value) {
    const preset =
      DURATION_OPTIONS.find(
        (item) =>
          item.value === value
      )

    if (!preset) {
      return
    }

    setSelectedDuration(value)
    setDuration(preset.hours)
  }

  function applyInterestPreset(value) {
    setSelectedInterestPreset(value)

    setInterest(
      resolveInterestPreset(value)
    )
  }

  function applyBudgetPreset(value) {
    const preset =
      budgetOptions.find(
        (item) => item.value === value
      )

    if (!preset) {
      return
    }

    setSelectedBudgetTier(value)
    setBudget(preset.amount)
  }

  /** True bila lokasi destinasi termasuk wilayah yang dipilih. */
  function locationMatches(
    destinationLocationText,
    selected
  ) {
    const dest =
      normalizeText(
        destinationLocationText
      )

    const sel =
      normalizeText(selected)

    if (
      !sel ||
      sel === 'semua lokasi'
    ) {
      return true
    }

    // Lokasi kosong tidak boleh cocok dengan apa pun.
    if (!dest) {
      return false
    }

    if (
      dest === sel ||
      dest.includes(sel) ||
      sel.includes(dest)
    ) {
      return true
    }

    const option =
      cityOptions.find(
        (item) =>
          normalizeText(item.value) ===
          sel
      )

    return (
      option?.aliases || []
    ).some((alias) =>
      dest.includes(
        normalizeText(alias)
      )
    )
  }

  // ============================================================
  // RESOLVED BUDGET PRESET
  // ============================================================

  const resolvedBudgetPreset = useMemo(() => {
    const sortedBudgetOptions =
      [...budgetOptions].sort(
        (a, b) =>
          a.amount - b.amount
      )

    return (
      budgetOptions.find(
        (item) =>
          item.value ===
          selectedBudgetTier
      ) ||
      sortedBudgetOptions.find(
        (item) =>
          item.amount >=
          Number(budget)
      ) ||
      sortedBudgetOptions[0]
    )
  }, [
    budget,
    selectedBudgetTier,
    budgetOptions,
  ])

  // ============================================================
  // RESOLVED CITY PRESET
  // ============================================================

  const resolvedCityPreset = useMemo(() => {
    if (
      effectiveLocation ===
      'Semua Lokasi'
    ) {
      return 'Semua Lokasi'
    }

    return (
      cityOptions.find(
        (city) =>
          city.value !==
            'Semua Lokasi' &&
          (
            normalizeText(
              effectiveLocation
            ).includes(
              normalizeText(
                city.value
              )
            ) ||
            (
              city.aliases || []
            ).some((alias) =>
              normalizeText(
                effectiveLocation
              ).includes(
                normalizeText(alias)
              )
            )
          )
      )?.value ||
      effectiveSelectedCityPreset ||
      'Semua Lokasi'
    )
  }, [
    effectiveLocation,
    effectiveSelectedCityPreset,
    cityOptions,
  ])

  // ============================================================
  // RESOLVED INTEREST PRESET
  // ============================================================

  const resolvedInterestPreset =
    useMemo(() => {
      if (
        effectiveInterest ===
        'Semua Minat'
      ) {
        return effectiveSelectedInterestPreset
      }

      return (
        INTEREST_PRESETS.find(
          (preset) =>
            normalizeText(
              effectiveInterest
            ).includes(
              normalizeText(
                preset.value
              )
            ) ||
            (
              preset.keywords || []
            ).some((keyword) =>
              normalizeText(
                effectiveInterest
              ).includes(
                normalizeText(keyword)
              )
            )
        )?.value ||
        effectiveSelectedInterestPreset ||
        'Semua Minat'
      )
    }, [
      effectiveInterest,
      effectiveSelectedInterestPreset,
    ])

  // ============================================================
  // RESOLVED DURATION PRESET
  // ============================================================

  const resolvedDurationPreset =
    useMemo(() => {
      return (
        DURATION_OPTIONS.find(
          (item) =>
            item.value ===
            selectedDuration
        ) ||
        DURATION_OPTIONS.find(
          (item) =>
            Number(item.hours) >=
            Number(duration)
        ) ||
        DURATION_OPTIONS[0]
      )
    }, [
      duration,
      selectedDuration,
    ])

  // ============================================================
  // FAVORITE / MY TRIP
  // ============================================================

  function isExperienceFavorited(
    id,
    item = null
  ) {
    if (
      typeof isFavorited ===
      'function'
    ) {
      try {
        return Boolean(
          isFavorited(id)
        )
      } catch {
        try {
          return Boolean(
            isFavorited(
              item || id
            )
          )
        } catch {
          return false
        }
      }
    }

    return localFavorites.includes(id)
  }

  function handleFavorite(exp) {
    if (
      typeof onSaveFavorite ===
      'function'
    ) {
      onSaveFavorite(exp)
      return
    }

    setLocalFavorites(
      (current) =>
        current.includes(exp.id)
          ? current.filter(
              (id) => id !== exp.id
            )
          : [
              ...current,
              exp.id,
            ]
    )
  }

  function handleTrip(exp) {
    if (
      typeof onAddToTrip ===
      'function'
    ) {
      onAddToTrip(exp)
      return
    }

    setTripFeedback(
      `${
        exp.name ||
        exp.title ||
        'Destinasi'
      } ditambahkan ke My Trip.`
    )

    window.setTimeout(
      () => setTripFeedback(''),
      2200
    )
  }

  // ============================================================
  // RHYTHM SCORING
  // ============================================================

 // Ganti seluruh `function getRhythmBonus(destination) { ... }` (Ln 1508-1624)
// dengan blok di bawah ini. Isi fungsi TIDAK diubah, hanya dibungkus useCallback.
// Pastikan `useCallback` sudah ada di import dari 'react' pada file ini.

const getRhythmBonus = useCallback(
  (destination) => {
    const difficulty =
      normalizeText(
        destination?.difficulty
      )

    const crowd =
      normalizeText(
        destination?.crowd_level
      )

    const category =
      normalizeText(
        destination?.category ||
          destination?.title ||
          destination?.name
      )

    const activities =
      Array.isArray(
        destination?.activities
      )
        ? destination.activities.join(
            ' '
          )
        : String(
            destination?.activities ||
              ''
          )

    const text = `${category} ${normalizeText(
      activities
    )}`

    const adventureLike =
      /aktif|trek|hiking|caving|adventure|petualang|diving|snorkel|rafting|cycling/.test(
        text
      )

    const quietLike =
      /santai|tenang|heritage|museum|kopi|kuliner|kampung|budaya|kebun|perkebunan/.test(
        text
      )

    if (
      selectedRhythm ===
      'santai'
    ) {
      if (
        /mudah/.test(
          difficulty
        ) ||
        /rendah/.test(crowd) ||
        quietLike
      ) {
        return 5
      }

      if (
        /sulit|menengah/.test(
          difficulty
        ) ||
        /tinggi/.test(crowd) ||
        adventureLike
      ) {
        return -2
      }

      return 2
    }

    if (
      selectedRhythm ===
      'aktif'
    ) {
      if (
        /sulit|menengah/.test(
          difficulty
        ) ||
        adventureLike
      ) {
        return 5
      }

      if (
        /mudah/.test(
          difficulty
        ) &&
        /rendah/.test(crowd)
      ) {
        return 1
      }

      return 2
    }

    if (
      /menengah/.test(
        difficulty
      ) ||
      /sedang/.test(crowd) ||
      (!adventureLike &&
        !quietLike)
    ) {
      return 5
    }

    if (
      /mudah|sulit/.test(
        difficulty
      )
    ) {
      return 2
    }

    return 3
  },
  [selectedRhythm],
)
  // ============================================================
  // HUMAN-FRIENDLY MATCH REASON
  // ============================================================

  function buildAdditionalReasons(
    destination
  ) {
    const reasons = []

    const text = normalizeText(
      [
        destination?.description,
        destination?.short_description,
        destination?.category,
        destination?.activities,
      ]
        .flat()
        .join(' ')
    )

    if (
      selectedRhythm ===
        'santai' &&
      includesAny(text, [
        'budaya',
        'heritage',
        'kuliner',
        'kopi',
        'kampung',
        'museum',
      ])
    ) {
      reasons.push(
        'Karakter pengalaman cocok untuk ritme santai'
      )
    }

    if (
      selectedRhythm ===
        'aktif' &&
      includesAny(text, [
        'hiking',
        'trek',
        'adventure',
        'snorkel',
        'cycling',
        'rafting',
      ])
    ) {
      reasons.push(
        'Aktivitasnya selaras dengan ritme aktif'
      )
    }

    if (
      destination?.review_count &&
      Number(
        destination.review_count
      ) >= 50
    ) {
      reasons.push(
        'Memiliki banyak ulasan pengguna'
      )
    }

    if (
      destination?.popularity &&
      Number(
        destination.popularity
      ) >= 80
    ) {
      reasons.push(
        'Termasuk pengalaman yang populer'
      )
    }

    return reasons
  }

  // ============================================================
  // SELECTED LABELS
  // ============================================================

  const currentCityLabel =
    cityOptions.find(
      (item) =>
        item.value ===
        resolvedCityPreset
    )?.shortLabel ||
    (
      effectiveLocation ===
      'Semua Lokasi'
        ? 'Semua Lokasi'
        : effectiveLocation
    )

  const currentInterestLabel =
    interestOptions.find(
      (item) =>
        item.value ===
        resolvedInterestPreset
    )?.shortLabel ||
    (
      effectiveInterest ===
      'Semua Minat'
        ? 'Semua Minat'
        : effectiveInterest
    )

  const activeFilterCount =
    (
      effectiveLocation !==
      'Semua Lokasi'
        ? 1
        : 0
    ) +
    (
      effectiveInterest !==
      'Semua Minat'
        ? 1
        : 0
    ) +
    (budget !== 50000 ? 1 : 0) +
    (duration !== 3 ? 1 : 0) +
    (
      selectedRhythm !==
      'santai'
        ? 1
        : 0
    )

  const activePresetSummary = [
    currentCityLabel,

    currentInterestLabel,

    formatHours(
      resolvedDurationPreset?.hours ??
        duration
    ),

    formatPrice(
      resolvedBudgetPreset?.amount ??
        budget
    ),

    selectedRhythm ===
    'santai'
      ? 'Ritme Santai'
      : selectedRhythm ===
        'aktif'
      ? 'Ritme Aktif'
      : 'Ritme Seimbang',
  ]

  // ============================================================
  // RESET
  // ============================================================

  function syncNewPresetsAfterReset() {
    setSelectedRhythm('santai')
    setSelectedDuration('2-4h')
    setSelectedBudgetTier('menengah')
    setSelectedInterestPreset(
      'Semua Minat'
    )
    setSelectedCityPreset(
      'Semua Lokasi'
    )
  }

  // ============================================================
  // GENERATE RECOMMENDATION
  // ============================================================

  function generateRecommendation() {
    setHasSearched(true)
    setVisibleCount(
      INITIAL_VISIBLE
    )

    if (
      destinations.length === 0
    ) {
      setResults([])
      return
    }

    setLoading(true)
    setErrorMsg('')

    window.setTimeout(() => {
      if (!isMountedRef.current) {
        return
      }

      const specificLocation =
        effectiveLocation !==
        'Semua Lokasi'

      const presetKeywords =
        INTEREST_PRESETS.find(
          (item) =>
            item.value ===
            selectedInterestPreset
        )?.keywords || []

      const normalizedInterest =
        normalizeText(
          effectiveInterest
        )

      const scoredDestinations =
        destinations.map(
          (destination) => {
            let score = 0

            const reasons = []

            const price =
              Number(
                destination?.price
              ) || 0

            const destinationDuration =
              Number(
                destination?.duration
              ) || 0

            const rating =
              Number(
                destination?.rating
              ) || 0

            // ==========================================
            // BUDGET
            // ==========================================

            if (price <= budget) {
              score += 30

              reasons.push(
                'Sesuai budget'
              )
            } else {
              const difference =
                price - budget

              if (
                budget > 0 &&
                difference <=
                  budget * 0.2
              ) {
                score += 15

                reasons.push(
                  'Harga sedikit di atas budget'
                )
              }
            }

            // ==========================================
            // MINAT
            // ==========================================

            const destinationCategory =
              normalizeText(
                destination?.category
              )

            const interestMatch =
              effectiveInterest ===
                'Semua Minat' ||
              destinationCategory ===
                normalizedInterest ||
              (
                normalizedInterest.length >
                2 &&
                destinationCategory.includes(
                  normalizedInterest
                )
              ) ||
              includesAny(
                [
                  destination?.category,
                  destination?.title,
                  destination?.name,
                  destination?.description,
                  destination?.activities,
                ]
                  .flat()
                  .join(' '),
                presetKeywords
              )

            if (interestMatch) {
              score += 25

              if (
                effectiveInterest !==
                'Semua Minat'
              ) {
                reasons.push(
                  `Sesuai minat ${effectiveInterest}`
                )
              }
            }

            // ==========================================
            // DURASI
            // ==========================================

            if (
              destinationDuration <=
                duration ||
              destinationDuration === 0
            ) {
              score += 20

              reasons.push(
                'Sesuai durasi perjalanan'
              )
            } else if (
              destinationDuration <=
              duration + 1
            ) {
              score += 10

              reasons.push(
                'Durasi sedikit lebih lama'
              )
            } else if (
              selectedDuration ===
                'multiday' &&
              destinationDuration <=
                72
            ) {
              score += 15

              reasons.push(
                'Cocok untuk itinerary beberapa hari'
              )
            }

            // ==========================================
            // LOKASI
            // ==========================================

            const locationMatch =
              !specificLocation ||
              locationMatches(
                getLocationText(
                  destination
                ),
                effectiveLocation
              )

            if (locationMatch) {
              score += 15

              if (
                specificLocation
              ) {
                reasons.push(
                  `Berada di ${effectiveLocation}`
                )
              }
            }

            // ==========================================
            // RATING
            // ==========================================

            if (rating >= 4.5) {
              score += 5

              reasons.push(
                'Rating sangat baik'
              )
            } else if (rating >= 4) {
              score += 3

              reasons.push(
                'Rating bagus'
              )
            }

            // ==========================================
            // HIDDEN GEM
            // ==========================================

            if (
              isTruthyBoolean(
                destination?.is_hidden_gem
              )
            ) {
              score += 5

              reasons.push(
                'Hidden Gem'
              )
            }

            // ==========================================
            // ADDITIONAL SIGNALS
            // ==========================================

            if (
              Number(
                destination?.popularity
              ) >= 80
            ) {
              score += 2
            }

            if (
              Number(
                destination?.review_count
              ) >= 50
            ) {
              score += 2
            }

            reasons.push(
              ...buildAdditionalReasons(
                destination
              )
            )

            return {
              ...destination,

              // Tampilan: 0–100.
              recommendationScore:
                Math.max(
                  0,
                  Math.min(
                    score,
                    100
                  )
                ),

              // Peringkat: tanpa batas,
              // plus penalti luar wilayah.
              rawScore:
                score -
                (
                  specificLocation &&
                  !locationMatch
                ) ?
                  OUT_OF_AREA_PENALTY :
                  0,

              matchesLocation:
                locationMatch,

              reasons: [
                ...new Set(
                  reasons
                ),
              ],
            }
          }
        )

      // ==========================================
      // SORT SCORE
      // ==========================================

      scoredDestinations.sort(
        (a, b) => {
          const scoreDifference =
            Number(
              b.rawScore || 0
            ) -
            Number(
              a.rawScore || 0
            )

          if (
            scoreDifference !== 0
          ) {
            return scoreDifference
          }

          const ratingDifference =
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )

          if (
            ratingDifference !== 0
          ) {
            return ratingDifference
          }

          return (
            Number(
              b.review_count || 0
            ) -
            Number(
              a.review_count || 0
            )
          )
        }
      )

      setResults(
        diversifyResults(
          scoredDestinations,
          RESULT_POOL_SIZE,
          'rawScore',
          specificLocation
            ? 'locality'
            : 'province'
        )
      )

      setLoading(false)
    }, 350)
  }

  // ============================================================
  // SORTING
  // ============================================================

  const sortedResults = useMemo(() => {
    const sorted = [...results]

    switch (sortBy) {
      case 'rating':
        sorted.sort(
          (a, b) =>
            Number(
              b.rating || 0
            ) -
            Number(
              a.rating || 0
            )
        )
        break

      case 'price':
        sorted.sort(
          (a, b) =>
            Number(
              a.price || 0
            ) -
            Number(
              b.price || 0
            )
        )
        break

      case 'duration':
        sorted.sort(
          (a, b) =>
            Number(
              a.duration || 0
            ) -
            Number(
              b.duration || 0
            )
        )
        break

      default:
        sorted.sort(
          (a, b) =>
            Number(
              b.rawScore || 0
            ) -
            Number(
              a.rawScore || 0
            )
        )
        break
    }

    return sorted
  }, [results, sortBy])

  // ============================================================
  // SMART MATCH LAYER
  // ============================================================

  const smartMatchedResults =
    useMemo(() => {
      const transformed =
        sortedResults
          .map((item) => {
            const rhythmBonus =
              getRhythmBonus(item)

            const computedMatch =
              Math.max(
                0,
                Math.min(
                  100,
                  Number(
                    item?.recommendationScore ||
                      0
                  ) +
                    rhythmBonus
                )
              )

            const reasons = [
              ...(item.reasons || []),
            ]

            if (
              rhythmBonus > 0
            ) {
              reasons.unshift(
                selectedRhythm ===
                  'santai'
                  ? 'Ritme santai lebih nyaman untuk pengalaman ini'
                  : selectedRhythm ===
                    'aktif'
                  ? 'Ritme aktif selaras dengan karakter pengalaman'
                  : 'Ritme seimbang sesuai dengan pengalaman'
              )
            }

            if (
              rhythmBonus < 0
            ) {
              reasons.push(
                'Ritme perjalanan perlu dipertimbangkan'
              )
            }

            return {
              ...item,

              computedMatch,

              // Dipakai untuk peringkat
              // (tidak terpotong 100).
              rankScore:
                Number(
                  item?.rawScore || 0
                ) +
                rhythmBonus +
                Number(
                  item?.rating || 0
                ) *
                  0.3,

              smartRhythmBonus:
                rhythmBonus,

              reasons: [
                ...new Set(
                  reasons
                ),
              ],
            }
          })
          .filter(
            (item) =>
              !onlyHighMatch ||
              Number(
                item.computedMatch ||
                  0
              ) >= 70
          )

      if (
        sortBy ===
        'recommended'
      ) {
        transformed.sort(
          (a, b) =>
            b.rankScore -
            a.rankScore
        )
      }

      return transformed
   }, [
  sortedResults,
  selectedRhythm,
  sortBy,
  onlyHighMatch,
  getRhythmBonus,
]);
  // ============================================================
  // TAMPILAN AKHIR
  // ============================================================

  const displayedResults =
    useMemo(() => {
      if (
        sortBy ===
        'recommended'
      ) {
        return diversifyResults(
          smartMatchedResults,
          visibleCount,
          'rankScore',
          effectiveLocation !==
            'Semua Lokasi'
            ? 'locality'
            : 'province'
        )
      }

      return smartMatchedResults.slice(
        0,
        visibleCount
      )
    }, [
      smartMatchedResults,
      visibleCount,
      sortBy,
      effectiveLocation,
    ])

  const scopeNote = useMemo(() => {
    if (
      effectiveLocation ===
        'Semua Lokasi' ||
      results.length === 0
    ) {
      return ''
    }

    const inArea =
      results.filter(
        (item) =>
          item.matchesLocation
      ).length

    if (inArea === 0) {
      return `Belum ada destinasi di ${currentCityLabel} pada data kami. Menampilkan alternatif terdekat yang paling cocok.`
    }

    if (inArea < results.length) {
      return `Ada ${inArea} destinasi di ${currentCityLabel}. Sisanya adalah alternatif terdekat.`
    }

    return ''
  }, [
    results,
    effectiveLocation,
    currentCityLabel,
  ])

  // ============================================================
  // STATE "KOSONG"
  // ============================================================

  const forceEmpty =
    uiState === 'empty'

  const effectiveHasSearched =
    hasSearched || forceEmpty

  const shownResults = forceEmpty
    ? []
    : displayedResults

  const totalMatches = forceEmpty
    ? 0
    : smartMatchedResults.length

  const remainingResults =
    Math.max(
      0,
      totalMatches -
        shownResults.length
    )

  // ============================================================
  // RESET FILTER
  // ============================================================

  function resetFilters() {
    setLocation('Semua Lokasi')
    setInterest('Semua Minat')
    setBudget(50000)
    setDuration(3)
    setActiveFilter(null)
    setResults([])
    setHasSearched(false)
    setErrorMsg('')
    setSortBy('recommended')
    setOnlyHighMatch(false)
    setShowAdvancedInfo(false)
    setVisibleCount(
      INITIAL_VISIBLE
    )

    syncNewPresetsAfterReset()
  }

  // ============================================================
  // ERROR STATE
  // ============================================================

  if (uiState === 'error') {
    return (
      <main className="nusa-rec-page">
        <div className="nusa-rec-shell">
          <section
            className="nusa-rec-state-card"
            role="alert"
          >
            <div className="nusa-rec-state-icon nusa-rec-state-icon-error">
              <X size={28} />
            </div>

            <span className="nusa-rec-section-kicker">
              NuSaJoy Smart Matcher
            </span>

            <h2>
              Mesin Pencocokan Mengalami Kendala
            </h2>

            <p>
              Tidak dapat menghitung skor personalisasi
              rute saat ini. Coba jalankan kembali
              pencocokan destinasi.
            </p>

            <button
              type="button"
              className="nusa-rec-search-button nusa-rec-state-button"
              onClick={() => {
                if (
                  typeof onRetry ===
                  'function'
                ) {
                  onRetry()
                } else {
                  generateRecommendation()
                }
              }}
            >
              <RefreshCw size={15} />

              Coba Hitung Ulang
            </button>
          </section>
        </div>
      </main>
    )
  }

  // ============================================================
  // GLOBAL LOADING STATE
  // ============================================================

  if (uiState === 'loading') {
    return (
      <main className="nusa-rec-page">
        <div className="nusa-rec-shell nusa-rec-skeleton-shell">
          <div className="nusa-rec-skeleton-hero" />

          <div className="nusa-rec-skeleton-filter" />

          <div className="nusa-rec-skeleton-heading" />

          <div className="nusa-rec-skeleton-grid">
            {[1, 2, 3].map(
              (item) => (
                <div
                  key={item}
                  className="nusa-rec-skeleton-card"
                />
              )
            )}
          </div>
        </div>
      </main>
    )
  }

  // ============================================================
  // PAGE
  // ============================================================

  const statusText =
    fetchingDestinations
      ? 'Mengambil data destinasi…'
      : loading
      ? 'Sedang menganalisis preferensimu…'
      : effectiveHasSearched
      ? 'Personalisasi aktif'
      : coverage.total > 0
      ? `Siap mencari di ${coverage.total.toLocaleString(
          'id-ID'
        )} destinasi`
      : 'Siap mencari pengalaman yang sesuai'

  return (
    <main className="nusa-rec-page">
      <div className="nusa-rec-shell">
        {/* =====================================================
            HERO
        ===================================================== */}

        <section
          className="nusa-rec-hero"
          aria-labelledby="nusa-rec-title"
        >
          <div className="nusa-rec-eyebrow">
            <span className="nusa-rec-eyebrow-dot" />

            Personalisasi akurat
          </div>

          <div className="nusa-rec-hero-copy">
            <div>
              <h1 id="nusa-rec-title">
                Rekomendasi Berdasarkan Ritme Hidupmu
              </h1>

              <p>
                Sesuaikan parameter di bawah ini. NuSaJoy
                mencocokkan waktu luang, preferensi,
                budget, lokasi, dan ritme perjalanan
                dengan pengalaman lokal yang paling relevan.
              </p>
            </div>

            <div
              className="nusa-rec-smart-status"
              aria-live="polite"
            >
              <span className="nusa-rec-status-icon">
                <Sparkles size={19} />
              </span>

              <div>
                <strong>
                  NuSaJoy Matching
                </strong>

                <span>
                  {statusText}
                </span>
              </div>
            </div>
          </div>

          <div
            className="nusa-rec-hero-stats"
            aria-label="Cakupan data NuSaJoy"
          >
            <div className="nusa-rec-hero-stat">
              <strong>
                {fetchingDestinations
                  ? '…'
                  : coverage.total.toLocaleString(
                      'id-ID'
                    )}
              </strong>

              <span>
                Destinasi
              </span>
            </div>

            <div className="nusa-rec-hero-stat">
              <strong>
                {fetchingDestinations
                  ? '…'
                  : coverage.provinces}
              </strong>

              <span>
                Wilayah
              </span>
            </div>

            <div className="nusa-rec-hero-stat">
              <strong>
                {fetchingDestinations
                  ? '…'
                  : coverage.categories}
              </strong>

              <span>
                Kategori
              </span>
            </div>
          </div>
        </section>

        {/* =====================================================
            FILTER / PERSONALIZATION
        ===================================================== */}

        <section
          className="nusa-rec-filter-card"
          aria-label="Parameter personalisasi perjalanan"
        >
          <div className="nusa-rec-filter-card-head">
            <div>
              <span className="nusa-rec-section-kicker">
                Personalisasi pencocokan
              </span>

              <h2>
                Parameter Personalisasi Perjalanan
              </h2>

              <p>
                {activeFilterCount > 0
                  ? `${activeFilterCount} parameter sedang aktif`
                  : 'Atur preferensi utama sebelum menjalankan matcher'}
              </p>
            </div>

            <div className="nusa-rec-head-actions">
              <button
                type="button"
                className="nusa-rec-help-toggle"
                onClick={() =>
                  setShowAdvancedInfo(
                    (current) =>
                      !current
                  )
                }
                aria-expanded={
                  showAdvancedInfo
                }
              >
                <Sparkles size={13} />

                {showAdvancedInfo
                  ? 'Sembunyikan Info'
                  : 'Cara Kerja'}
              </button>

              <button
                type="button"
                className="nusa-rec-reset-button"
                onClick={
                  resetFilters
                }
              >
                Reset
              </button>
            </div>
          </div>

          {/* ===================================================
              ALGORITHM NOTE
          =================================================== */}

          {showAdvancedInfo && (
            <div className="nusa-rec-algorithm-note">
              <div className="nusa-rec-algorithm-note__icon">
                <WalletCards size={17} />
              </div>

              <div>
                <strong>
                  Smart Matcher 2.0
                </strong>

                <p>
                  Skor dasar tetap berasal dari algoritma
                  lama: budget, minat, durasi, lokasi, rating,
                  dan hidden gem. Smart Matcher menambahkan
                  penyesuaian kecil berdasarkan ritme perjalanan.
                  Seluruh data dibaca langsung dari Supabase,
                  pilihan wilayah dan minat mengikuti isi
                  database, dan hasil disusun agar beragam —
                  bukan satu kategori atau satu daerah saja.
                </p>
              </div>
            </div>
          )}

          {/* ===================================================
              ADVANCED CONTROLS
          =================================================== */}

          <div className="nusa-rec-filter-grid">
            <div className="nusa-rec-advanced-control">
              <label htmlFor="nusa-rec-city">
                Kota Tujuan
              </label>

              <select
                id="nusa-rec-city"
                value={
                  effectiveSelectedCityPreset
                }
                onChange={(event) =>
                  applyCityPreset(
                    event.target.value
                  )
                }
              >
                <GroupedOptions
                  options={cityOptions}
                />
              </select>
            </div>

            <div className="nusa-rec-advanced-control">
              <label htmlFor="nusa-rec-duration">
                Waktu Luang
              </label>

              <select
                id="nusa-rec-duration"
                value={selectedDuration}
                onChange={(event) =>
                  applyDurationPreset(
                    event.target.value
                  )
                }
              >
                {DURATION_OPTIONS.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>

            <div className="nusa-rec-advanced-control">
              <span className="nusa-rec-control-label">
                Ritme Perjalanan
              </span>

              <div className="nusa-rec-segmented">
                {RHYTHM_OPTIONS.map(
                  (item) => (
                    <button
                      type="button"
                      key={item.id}
                      className={
                        selectedRhythm ===
                        item.id
                          ? 'is-active'
                          : ''
                      }
                      onClick={() =>
                        setSelectedRhythm(
                          item.id
                        )
                      }
                      aria-pressed={
                        selectedRhythm ===
                        item.id
                      }
                    >
                      {item.label}
                    </button>
                  )
                )}
              </div>
            </div>

            <div className="nusa-rec-advanced-control">
              <label htmlFor="nusa-rec-interest">
                Minat Utama
              </label>

              <select
                id="nusa-rec-interest"
                value={
                  effectiveSelectedInterestPreset
                }
                onChange={(event) =>
                  applyInterestPreset(
                    event.target.value
                  )
                }
              >
                <GroupedOptions
                  options={
                    interestOptions
                  }
                />
              </select>
            </div>

            <div className="nusa-rec-advanced-control">
              <label htmlFor="nusa-rec-budget-tier">
                Budget
              </label>

              <select
                id="nusa-rec-budget-tier"
                value={
                  selectedBudgetTier
                }
                onChange={(event) =>
                  applyBudgetPreset(
                    event.target.value
                  )
                }
              >
                {budgetOptions.map(
                  (item) => (
                    <option
                      key={item.value}
                      value={item.value}
                    >
                      {item.label}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {/* ===================================================
              LEGACY FILTER TOOLS
          =================================================== */}

          <div className="nusa-rec-legacy-tools">
            <FilterButton
              icon={
                <MapPin size={16} />
              }
              label="Lokasi lama"
              value={
                effectiveLocation
              }
              filter="location"
              activeFilter={
                activeFilter
              }
              onToggle={
                setActiveFilter
              }
            />

            <FilterButton
              icon={
                <Heart size={16} />
              }
              label="Minat lama"
              value={
                effectiveInterest
              }
              filter="interest"
              activeFilter={
                activeFilter
              }
              onToggle={
                setActiveFilter
              }
            />

            <FilterButton
              icon="Rp"
              label="Budget lama"
              value={formatPrice(budget)}
              filter="budget"
              activeFilter={
                activeFilter
              }
              onToggle={
                setActiveFilter
              }
            />

            <FilterButton
              icon={
                <Clock3 size={16} />
              }
              label="Durasi lama"
              value={`${duration} jam`}
              filter="duration"
              activeFilter={
                activeFilter
              }
              onToggle={
                setActiveFilter
              }
            />
          </div>

          {/* ===================================================
              LEGACY FILTER PANEL — LOCATION
          =================================================== */}

          {activeFilter ===
            'location' && (
            <div
              id="nusa-rec-filter-panel-location"
              className="nusa-rec-filter-panel"
            >
              <div className="nusa-rec-panel-heading">
                <strong>
                  Pilih lokasi
                </strong>

                <span>
                  Filter lama tetap tersedia untuk dataset
                  Supabase.
                </span>
              </div>

              <div className="nusa-rec-option-grid">
                <button
                  type="button"
                  className={`nusa-rec-option-button ${
                    effectiveLocation ===
                    'Semua Lokasi'
                      ? 'is-active'
                      : ''
                  }`}
                  onClick={() => {
                    setLocation(
                      'Semua Lokasi'
                    )

                    setSelectedCityPreset(
                      'Semua Lokasi'
                    )

                    setActiveFilter(
                      null
                    )
                  }}
                >
                  <Compass size={13} />

                  Semua Lokasi
                </button>

                {locations.map(
                  (loc) => (
                    <button
                      type="button"
                      key={loc}
                      className={`nusa-rec-option-button ${
                        effectiveLocation ===
                        loc
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => {
                        setLocation(loc)

                        setActiveFilter(
                          null
                        )
                      }}
                    >
                      <MapPin size={13} />

                      {loc}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              LEGACY FILTER PANEL — INTEREST
          =================================================== */}

          {activeFilter ===
            'interest' && (
            <div
              id="nusa-rec-filter-panel-interest"
              className="nusa-rec-filter-panel"
            >
              <div className="nusa-rec-panel-heading">
                <strong>
                  Minat dari dataset
                </strong>

                <span>
                  Preset terbaru akan mencari kategori terdekat
                  secara otomatis.
                </span>
              </div>

              <div className="nusa-rec-option-grid">
                <button
                  type="button"
                  className={`nusa-rec-option-button ${
                    effectiveInterest ===
                    'Semua Minat'
                      ? 'is-active'
                      : ''
                  }`}
                  onClick={() => {
                    setInterest(
                      'Semua Minat'
                    )

                    setSelectedInterestPreset(
                      'Semua Minat'
                    )

                    setActiveFilter(
                      null
                    )
                  }}
                >
                  <Sparkles size={13} />

                  Semua Minat
                </button>

                {interests.map(
                  (item) => (
                    <button
                      type="button"
                      key={item}
                      className={`nusa-rec-option-button ${
                        effectiveInterest ===
                        item
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => {
                        setInterest(
                          item
                        )

                        setActiveFilter(
                          null
                        )
                      }}
                    >
                      <Heart size={13} />

                      {item}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              LEGACY FILTER PANEL — BUDGET
          =================================================== */}

          {activeFilter ===
            'budget' && (
            <div
              id="nusa-rec-filter-panel-budget"
              className="nusa-rec-filter-panel"
            >
              <div className="nusa-rec-price-head">
                <div>
                  <strong>
                    Budget maksimal lama
                  </strong>

                  <span>
                    Penggeser ini tetap memakai rentang yang sudah
                    ada.
                  </span>
                </div>

                <strong className="nusa-rec-price-value">
                  {formatPrice(budget)}
                </strong>
              </div>

              <input
                className="nusa-rec-range"
                type="range"
                min="5000"
                max={budgetMax}
                step="5000"
                value={budget}
                onChange={(event) =>
                  setBudget(
                    Number(
                      event.target.value
                    )
                  )
                }
                aria-label="Budget maksimal"
              />

              <div className="nusa-rec-range-labels">
                <span>
                  Rp5K
                </span>

                <span>
                  {formatPrice(
                    budgetMax
                  )}
                </span>
              </div>

              <div className="nusa-rec-option-grid nusa-rec-budget-presets">
                {[25000, 50000, 100000, 200000].map(
                  (price) => (
                    <button
                      type="button"
                      key={price}
                      className={`nusa-rec-option-button ${
                        budget ===
                        price
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() =>
                        setBudget(
                          price
                        )
                      }
                    >
                      ≤{' '}
                      {formatPrice(
                        price
                      )}
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              LEGACY FILTER PANEL — DURATION
          =================================================== */}

          {activeFilter ===
            'duration' && (
            <div
              id="nusa-rec-filter-panel-duration"
              className="nusa-rec-filter-panel"
            >
              <div className="nusa-rec-panel-heading">
                <strong>
                  Waktu luang lama
                </strong>

                <span>
                  Nilai jam tetap diteruskan ke algoritma lama.
                </span>
              </div>

              <div className="nusa-rec-option-grid">
                {Array.from(
                  {
                    length: 12,
                  },
                  (
                    _,
                    index
                  ) =>
                    index + 1
                ).map(
                  (hour) => (
                    <button
                      type="button"
                      key={hour}
                      className={`nusa-rec-option-button ${
                        duration ===
                        hour
                          ? 'is-active'
                          : ''
                      }`}
                      onClick={() => {
                        setDuration(
                          hour
                        )

                        setSelectedDuration(
                          hour <= 4
                            ? '2-4h'
                            : hour <=
                              6
                            ? 'halfday'
                            : hour <=
                              8
                            ? 'fullday'
                            : 'multiday'
                        )

                        setActiveFilter(
                          null
                        )
                      }}
                    >
                      <Clock3 size={13} />

                      {hour} jam
                    </button>
                  )
                )}
              </div>
            </div>
          )}

          {/* ===================================================
              ACTIVE PARAMETERS
          =================================================== */}

          <div className="nusa-rec-active-params">
            <div className="nusa-rec-active-params__label">
              <Sparkles size={13} />

              Parameter aktif
            </div>

            <div className="nusa-rec-active-params__chips">
              {activePresetSummary.map(
                (item, index) => (
                  <span
                    key={`${item}-${index}`}
                    className="nusa-rec-active-chip"
                  >
                    <Check size={11} />

                    {item}
                  </span>
                )
              )}
            </div>
          </div>

          {/* ===================================================
              FILTER ACTIONS
          =================================================== */}

          <div className="nusa-rec-filter-actions">
            <div className="nusa-rec-filter-hint">
              <span className="nusa-rec-mini-orb" />

              <span>
                Matcher lama tetap menjadi dasar; preset ritme
                terbaru menambahkan penyesuaian kecil tanpa
                menghapus scoring lama.
              </span>
            </div>

            <div className="nusa-rec-filter-action-right">
              <label className="nusa-rec-high-match-toggle">
                <input
                  type="checkbox"
                  checked={
                    onlyHighMatch
                  }
                  onChange={(event) =>
                    setOnlyHighMatch(
                      event.target.checked
                    )
                  }
                />

                <span>
                  Hanya ≥70% cocok
                </span>
              </label>

              <button
                type="button"
                className="nusa-rec-search-button"
                onClick={
                  generateRecommendation
                }
                disabled={
                  loading ||
                  fetchingDestinations
                }
              >
                {loading ? (
                  <RefreshCw
                    size={15}
                    className="nusa-rec-spin"
                  />
                ) : (
                  <Search size={15} />
                )}

                {fetchingDestinations
                  ? 'Menunggu data…'
                  : loading
                  ? 'Mencari destinasi…'
                  : 'Temukan Rekomendasi'}
              </button>
            </div>
          </div>
        </section>

        {/* =====================================================
            FEEDBACK TOAST
        ===================================================== */}

        {tripFeedback && (
          <div
            className="nusa-rec-toast"
            role="status"
            aria-live="polite"
          >
            <span>
              <Check size={14} />
            </span>

            {tripFeedback}
          </div>
        )}

        {/* =====================================================
            SUPABASE ERROR
        ===================================================== */}

        {errorMsg && (
          <div
            className="nusa-rec-error"
            role="alert"
          >
            <span className="nusa-rec-error-icon">
              !
            </span>

            <div>
              <strong>
                Gagal memuat destinasi
              </strong>

              <p>
                {errorMsg}
              </p>

              <small>
                Periksa konfigurasi supabaseClient dan nama tabel
                <code>
                  destinations
                </code>
                .
              </small>

              <button
                type="button"
                className="nusa-rec-error-retry"
                onClick={() =>
                  loadDestinations({
                    force: true,
                  })
                }
              >
                <RefreshCw size={13} />

                Muat ulang data
              </button>
            </div>
          </div>
        )}

        {/* =====================================================
            RESULT SECTION
        ===================================================== */}

        {effectiveHasSearched && (
          <section
            className="nusa-rec-result-section"
            aria-live="polite"
          >
            <div className="nusa-rec-result-head">
              <div>
                <span className="nusa-rec-section-kicker">
                  Hasil personalisasi
                </span>

                <h2>
                  Hasil Kecocokan Tertinggi
                </h2>

                <p>
                  Diurutkan berdasarkan skor kecocokan algoritma
                  personalisasi untuk{' '}
                  {currentCityLabel ||
                    'pilihanmu'}
                  .
                </p>
              </div>

              <div className="nusa-rec-result-tools">
                {totalMatches > 0 && (
                  <div className="nusa-rec-match-status">
                    <span className="nusa-rec-live-dot" />

                    <span>
                      {shownResults.length}{' '}
                      dari{' '}
                      {totalMatches}{' '}
                      rekomendasi
                    </span>
                  </div>
                )}

                {totalMatches > 0 && (
                  <label className="nusa-rec-sort-wrap">
                    <span>
                      Urutkan
                    </span>

                    <select
                      className="nusa-rec-sort-select"
                      value={sortBy}
                      onChange={(event) =>
                        setSortBy(
                          event.target.value
                        )
                      }
                    >
                      <option value="recommended">
                        Paling Cocok
                      </option>

                      <option value="rating">
                        Rating Tertinggi
                      </option>

                      <option value="price">
                        Harga Terendah
                      </option>

                      <option value="duration">
                        Durasi Terpendek
                      </option>
                    </select>

                    <ChevronDown size={13} />
                  </label>
                )}
              </div>
            </div>

            {scopeNote &&
              !forceEmpty && (
                <p
                  className="nusa-rec-scope-note"
                  role="note"
                >
                  <MapPin size={14} />

                  {scopeNote}
                </p>
              )}

            {/* =================================================
                EMPTY RESULT
            ================================================= */}

            {shownResults.length ===
            0 ? (
              <div className="nusa-rec-empty-state">
                <div className="nusa-rec-empty-icon">
                  <Search size={22} />
                </div>

                <h3>
                  Belum menemukan destinasi
                </h3>

                <p>
                  Coba naikkan budget, pilih minat yang lebih umum,
                  atau perluas lokasi dan waktu luang.
                </p>

                <button
                  type="button"
                  className="nusa-rec-empty-reset"
                  onClick={
                    resetFilters
                  }
                >
                  <RefreshCw size={13} />

                  Kembalikan Parameter
                </button>
              </div>
            ) : (
              /* =================================================
                  DESTINATION GRID
              ================================================= */

              <div className="nusa-rec-destination-grid">
                {shownResults.map(
                  (
                    destination,
                    index
                  ) => {
                    const score =
                      Math.max(
                        0,
                        Math.min(
                          100,
                          Number(
                            destination.computedMatch ||
                              0
                          )
                        )
                      )

                    const title =
                      destination.name ||
                      destination.title ||
                      'Destinasi tanpa nama'

                    const image =
                      destination.image_url ||
                      destination.image ||
                      destination.thumbnail ||
                      ''

                    const detailId =
                      destination.id ??
                      destination.slug ??
                      `destination-${index}`

                    const description =
                      destination.short_description ||
                      destination.description ||
                      'Pengalaman lokal yang dipilih berdasarkan preferensimu.'

                    const durationText =
                      formatDuration(
                        destination
                      )

                    const priceFormatted =
                      destination.priceFormatted ||
                      formatPrice(
                        destination.price
                      )

                    const locationText =
                      destination.location ||
                      destination.province ||
                      'Lokasi tidak tersedia'

                    const favorite =
                      isExperienceFavorited(
                        detailId,
                        destination
                      )

                    return (
                      <article
                        key={`${detailId}-${index}`}
                        className={`nusa-rec-destination-card ${
                          index === 0
                            ? 'is-featured'
                            : ''
                        }`}
                      >
                        {/* =======================================
                            IMAGE / VISUAL
                        ======================================= */}

                        <div
                          className="nusa-rec-image-wrap"
                          role="button"
                          tabIndex={0}
                          aria-label={`Lihat detail ${title}`}
                          onClick={() =>
                            onSelectExperience?.(
                              destination
                            )
                          }
                          onKeyDown={(
                            event
                          ) => {
                            if (
                              event.key ===
                                'Enter' ||
                              event.key ===
                                ' '
                            ) {
                              event.preventDefault()

                              onSelectExperience?.(
                                destination
                              )
                            }
                          }}
                        >
                          {image ? (
                            <img
                              src={image}
                              alt={title}
                              className="nusa-rec-destination-image"
                              loading="lazy"
                              onError={(
                                event
                              ) => {
                                event.currentTarget.style.display =
                                  'none'

                                event.currentTarget.parentElement?.classList.add(
                                  'image-error'
                                )
                              }}
                            />
                          ) : (
                            <div
                              className="nusa-rec-image-fallback"
                              aria-hidden="true"
                            >
                              <Compass size={44} />
                            </div>
                          )}

                          <div className="nusa-rec-image-overlay" />

                          {/* TOP MATCH */}

                          {index ===
                            0 && (
                            <span className="nusa-rec-top-match-tag">
                              <Sparkles size={11} />

                              Pilihan Teratas
                            </span>
                          )}

                          {/* SCORE */}

                          <span className="nusa-rec-score-badge">
                            <Sparkles size={11} />

                            {score}% Cocok
                          </span>

                          {/* RHYTHM */}

                          <span className="nusa-rec-visual-pill">
                            {selectedRhythm ===
                            'santai'
                              ? 'Ritme Santai'
                              : selectedRhythm ===
                                'aktif'
                              ? 'Ritme Aktif'
                              : 'Ritme Seimbang'}
                          </span>
                        </div>

                        {/* =======================================
                            CARD BODY
                        ======================================= */}

                        <div className="nusa-rec-card-body">
                          <div className="nusa-rec-card-topline">
                            <span className="nusa-rec-card-category">
                              <Clock3 size={12} />

                              {durationText}

                              <span aria-hidden="true">
                                •
                              </span>

                              {destination.category ||
                                'Pengalaman Lokal'}
                            </span>

                            <span className="nusa-rec-card-rating">
                              <Star
                                size={12}
                                fill="currentColor"
                              />

                              {destination.rating ??
                                '-'}
                            </span>
                          </div>

                          {/* HIDDEN GEM */}

                          {isTruthyBoolean(
                            destination.is_hidden_gem
                          ) && (
                            <span className="nusa-rec-gem-badge">
                              <Sparkles size={11} />

                              Hidden Gem
                            </span>
                          )}

                          {/* TITLE */}

                          <h3
                            className="nusa-rec-destination-name nusa-rec-clickable"
                            role={
                              onSelectExperience
                                ? 'button'
                                : undefined
                            }
                            tabIndex={
                              onSelectExperience
                                ? 0
                                : undefined
                            }
                            onClick={() =>
                              onSelectExperience?.(
                                destination
                              )
                            }
                            onKeyDown={(
                              event
                            ) => {
                              if (
                                !onSelectExperience
                              ) {
                                return
                              }

                              if (
                                event.key ===
                                  'Enter' ||
                                event.key ===
                                  ' '
                              ) {
                                event.preventDefault()

                                onSelectExperience(
                                  destination
                                )
                              }
                            }}
                          >
                            {title}
                          </h3>

                          {/* LOCATION */}

                          <p className="nusa-rec-destination-location">
                            <MapPin size={13} />

                            {locationText}
                          </p>

                          {/* DESCRIPTION */}

                          <p className="nusa-rec-destination-description">
                            {description}
                          </p>

                          {/* =====================================
                              MATCH SCORE
                          ===================================== */}

                          <div className="nusa-rec-score-block">
                            <div className="nusa-rec-score-head">
                              <span>
                                Tingkat kecocokan
                              </span>

                              <strong>
                                {score}%
                              </strong>
                            </div>

                            <div
                              className="nusa-rec-score-bar"
                              role="progressbar"
                              aria-valuemin="0"
                              aria-valuemax="100"
                              aria-valuenow={score}
                              aria-label={`Tingkat kecocokan ${score}%`}
                            >
                              <div
                                className="nusa-rec-score-fill"
                                style={{
                                  width: `${score}%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* =====================================
                              INFO
                          ===================================== */}

                          <div className="nusa-rec-info-row">
                            <div className="nusa-rec-info-item">
                              <span className="nusa-rec-info-icon">
                                Rp
                              </span>

                              <span>
                                <small>
                                  Tarif Mulai
                                </small>

                                <strong className="nusa-rec-price-text">
                                  {
                                    priceFormatted
                                  }
                                </strong>
                              </span>
                            </div>

                            <div className="nusa-rec-info-item">
                              <span className="nusa-rec-info-icon">
                                <Star
                                  size={12}
                                  fill="currentColor"
                                />
                              </span>

                              <span>
                                <small>
                                  Rating
                                </small>

                                <strong>
                                  {destination.rating ??
                                    '-'}
                                </strong>
                              </span>
                            </div>
                          </div>

                          {/* =====================================
                              REASONS
                          ===================================== */}

                          {destination.reasons
                            ?.length >
                            0 && (
                            <div className="nusa-rec-reason-box">
                              <div className="nusa-rec-reason-title">
                                <Sparkles size={12} />

                                Kenapa cocok untukmu?
                              </div>

                              <div className="nusa-rec-reason-list">
                                {destination.reasons
                                  .slice(
                                    0,
                                    4
                                  )
                                  .map(
                                    (
                                      reason,
                                      reasonIndex
                                    ) => (
                                      <span
                                        key={`${reason}-${reasonIndex}`}
                                      >
                                        <b>
                                          <Check size={10} />
                                        </b>

                                        {reason}
                                      </span>
                                    )
                                  )}
                              </div>
                            </div>
                          )}

                          {/* =====================================
                              ACTIONS
                          ===================================== */}

                          <div className="nusa-rec-card-actions">
                            {/* FAVORITE */}

                            <button
                              type="button"
                              onClick={() =>
                                handleFavorite(
                                  destination
                                )
                              }
                              className={`nusa-rec-action-icon ${
                                favorite
                                  ? 'is-favorited'
                                  : ''
                              }`}
                              aria-label={
                                favorite
                                  ? 'Hapus favorit'
                                  : 'Simpan favorit'
                              }
                              title={
                                favorite
                                  ? 'Hapus dari favorit'
                                  : 'Simpan ke favorit'
                              }
                            >
                              <Heart
                                size={17}
                                fill={
                                  favorite
                                    ? 'currentColor'
                                    : 'none'
                                }
                              />
                            </button>

                            {/* TRIP */}

                            <button
                              type="button"
                              onClick={() =>
                                handleTrip(
                                  destination
                                )
                              }
                              className="nusa-rec-trip-button"
                            >
                              <span>
                                ＋ Trip
                              </span>
                            </button>

                            {/* DETAIL */}

                            {onSelectExperience ? (
                              <button
                                type="button"
                                onClick={() =>
                                  onSelectExperience(
                                    destination
                                  )
                                }
                                className="nusa-rec-detail-button"
                              >
                                <span>
                                  Detail
                                </span>

                                <ArrowRight
                                  size={14}
                                />
                              </button>
                            ) : (
                              <Link
                                to={`/destination/${detailId}`}
                                className="nusa-rec-detail-button"
                              >
                                <span>
                                  Detail
                                </span>

                                <ArrowRight
                                  size={14}
                                />
                              </Link>
                            )}
                          </div>
                        </div>
                      </article>
                    )
                  }
                )}
              </div>
            )}

            {/* =================================================
                LOAD MORE
            ================================================= */}

            {remainingResults >
              0 && (
              <div className="nusa-rec-load-more">
                <button
                  type="button"
                  className="nusa-rec-load-more-button"
                  onClick={() =>
                    setVisibleCount(
                      (current) =>
                        current +
                        LOAD_MORE_STEP
                    )
                  }
                >
                  <Plus size={15} />

                  Tampilkan lebih banyak

                  <small>
                    {remainingResults} lagi
                  </small>
                </button>
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            NO SEARCH YET
        ===================================================== */}

        {!effectiveHasSearched &&
          !fetchingDestinations && (
            <section className="nusa-rec-before-search">
              <div className="nusa-rec-before-search-icon">
                <Compass size={25} />
              </div>

              <div>
                <span className="nusa-rec-section-kicker">
                  Siap menjelajah
                </span>

                <h2>
                  Bangun rekomendasimu
                </h2>

                <p>
                  Atur parameter di atas kemudian jalankan matcher
                  untuk mendapatkan pengalaman lokal yang paling
                  sesuai.
                </p>
              </div>

              <div className="nusa-rec-before-search-actions">
                <span>
                  <CalendarClock size={13} />

                  {formatHours(
                    duration
                  )}
                </span>

                <span>
                  <WalletCards size={13} />

                  {formatPrice(
                    budget
                  )}
                </span>

                <span>
                  <Layers size={13} />

                  {
                    currentInterestLabel
                  }
                </span>

                <span>
                  <Sparkles size={13} />

                  {selectedRhythm ===
                  'santai'
                    ? 'Santai'
                    : selectedRhythm ===
                      'aktif'
                    ? 'Aktif'
                    : 'Seimbang'}
                </span>
              </div>
            </section>
          )}
      </div>
    </main>
  )
}

export default Recommendation