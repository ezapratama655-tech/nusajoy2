import { useMemo, useState } from "react";
import {
  ArrowRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Compass,
  DollarSign,
  Hotel,
  Info,
  Map,
  MapPin,
  Plus,
  RefreshCw,
  ShoppingCart,
  Sparkles,
  Trash2,
  TramFront,
  WalletCards,
  X,
} from "lucide-react";

import { STAYS_DATA, TRANSPORTS_DATA } from "../data/mockData.js";
import "../styles/MyTrip.css";

const DEFAULT_TRIP = {
  title: "Petualangan Yogyakarta",
  dates: "12–13 September 2026",
  city: "Yogyakarta",
  items: [
    {
      id: "demo-1",
      day: 1,
      time: "09.00",
      title: "Eksplorasi Kotagede",
      category: "Budaya",
      location: "Kotagede, Yogyakarta",
      transportTip: "Jalan kaki + becak lokal",
      guideName: "Warga Setempat",
      price: 85000,
      isNew: false,
    },
    {
      id: "demo-2",
      day: 1,
      time: "13.30",
      title: "Kuliner Tradisional",
      category: "Kuliner",
      location: "Pasar Kotagede",
      transportTip: "Becak lokal • ± 2,4 km",
      guideName: "Komunitas Kuliner",
      price: 120000,
      isNew: true,
    },
    {
      id: "demo-3",
      day: 2,
      time: "09.30",
      title: "Jelajah Kasongan",
      category: "Kerajinan",
      location: "Kasongan, Bantul",
      transportTip: "Shuttle wisata • ± 7,8 km",
      guideName: "Pengrajin Lokal",
      price: 95000,
      isNew: false,
    },
    {
      id: "demo-4",
      day: 2,
      time: "15.00",
      title: "Senja di Sewon",
      category: "Alam",
      location: "Sewon, Bantul",
      transportTip: "Mobil listrik lokal • ± 4,0 km",
      guideName: "Warga Setempat",
      price: 75000,
      isNew: false,
    },
  ],
};

const FALLBACK_STAY = {
  name: "Ndalem Heritage Stay",
  category: "Homestay Budaya",
  pricePerNight: 275000,
  priceFormatted: "Rp275.000 / malam",
};

const FALLBACK_TRANSPORT = {
  name: "Shuttle Wisata Hijau",
  description: "Transportasi lokal hemat emisi",
  pricePerTrip: 120000,
  priceFormatted: "Rp120.000 / perjalanan",
};

const DAY_META = {
  1: { short: "Kotagede", distance: "6,2 km" },
  2: { short: "Bantul Selatan", distance: "8,0 km" },
  3: { short: "Kota Yogyakarta", distance: "5,6 km" },
};

function formatCurrency(value = 0) {
  return `Rp${Number(value || 0).toLocaleString("id-ID")}`;
}

export default function MyTrip({
  trip = DEFAULT_TRIP,
  onRemoveTripItem,
  onOpenBookingSummary,
  onNavigateExplore,
  uiState = "normal",
  onRetry,
}) {
  const [selectedDay, setSelectedDay] = useState(1);
  const [mobileTab, setMobileTab] = useState("itinerary");
  const [notice, setNotice] = useState("");
  const [showAllDays, setShowAllDays] = useState(false);

  const selectedStay = STAYS_DATA?.[0] || FALLBACK_STAY;
  const selectedTransport = TRANSPORTS_DATA?.[0] || FALLBACK_TRANSPORT;

  const itemsList = trip?.items || [];

  const sortedItems = useMemo(() => {
    return [...itemsList].sort((a, b) => {
      if (a.isNew && !b.isNew) return -1;
      if (!a.isNew && b.isNew) return 1;
      return (a.day || 0) - (b.day || 0);
    });
  }, [itemsList]);

  const availableDays = useMemo(() => {
    const days = [...new Set(itemsList.map((item) => item.day).filter(Boolean))];
    return days.length ? days.sort((a, b) => a - b) : [1, 2];
  }, [itemsList]);

  const effectiveDay =
    availableDays.includes(selectedDay) ? selectedDay : availableDays[0];

  const dayFilteredItems = sortedItems.filter(
    (item) => item.day === effectiveDay
  );

  const totalExperienceCost = itemsList.reduce(
    (total, item) => total + Number(item.price || 0),
    0
  );

  const stayCost = Number(selectedStay?.pricePerNight || 0);
  const transportCost = Number(selectedTransport?.pricePerTrip || 0);
  const conservationFund = Math.round(
    (totalExperienceCost + stayCost) * 0.025
  );
  const grandTotal =
    totalExperienceCost + stayCost + transportCost + conservationFund;

  const openBooking = () => {
    onOpenBookingSummary?.({
      title: trip?.title,
      location: trip?.city,
      price: grandTotal,
      guestsCount: 1,
      type: "trip",
    });

    setNotice("Ringkasan perjalanan siap diproses.");
    window.setTimeout(() => setNotice(""), 2600);
  };

  const removeItem = (id) => {
    onRemoveTripItem?.(id);
    setNotice("Aktivitas dihapus dari rencana.");
    window.setTimeout(() => setNotice(""), 2600);
  };

  const navigateExplore = (target = "jelajah") => {
    onNavigateExplore?.(target);
  };

  if (uiState === "error") {
    return (
      <section className="mytrip-page">
        <div className="mytrip-state mytrip-state--error">
          <div className="state-icon state-icon--danger">
            <X size={30} />
          </div>
          <p className="state-label">TERJADI KESALAHAN</p>
          <h2>Gagal Memuat Jadwal Perjalanan</h2>
          <p>
            Terjadi kesalahan saat memproses data itinerary kamu. Coba muat
            ulang untuk melanjutkan.
          </p>
          <button className="mytrip-btn mytrip-btn--primary" onClick={onRetry}>
            <RefreshCw size={17} />
            Coba Lagi
          </button>
        </div>
      </section>
    );
  }

  if (uiState === "loading") {
    return (
      <section className="mytrip-page">
        <div className="mytrip-shell">
          <div className="skeleton skeleton--hero" />
          <div className="skeleton-grid">
            <div className="skeleton-column">
              <div className="skeleton skeleton--card" />
              <div className="skeleton skeleton--card" />
              <div className="skeleton skeleton--card" />
            </div>
            <div className="skeleton-column">
              <div className="skeleton skeleton--budget" />
              <div className="skeleton skeleton--map" />
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (uiState === "empty" || itemsList.length === 0) {
    return (
      <section className="mytrip-page">
        <div className="mytrip-state mytrip-state--empty">
          <div className="state-icon state-icon--soft">
            <Compass size={32} />
          </div>
          <p className="state-label">MY TRIP</p>
          <h2>Belum Ada Rencana Perjalanan</h2>
          <p>
            Kamu belum menyusun aktivitas untuk trip ini. Jelajahi pengalaman
            lokal atau gunakan Smart Matcher untuk membangun itinerary.
          </p>
          <div className="state-actions">
            <button
              className="mytrip-btn mytrip-btn--primary"
              onClick={() => navigateExplore("jelajah")}
            >
              <Compass size={17} />
              Jelajah Destinasi
            </button>
            <button
              className="mytrip-btn mytrip-btn--secondary"
              onClick={() => navigateExplore("rekomendasi")}
            >
              <Sparkles size={17} />
              Coba Matcher
            </button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="mytrip-page">
      <div className="mytrip-shell">
        <header className="mytrip-hero">
          <div className="hero-copy">
            <div className="hero-badge">
              <span className="hero-badge__dot" />
              <span>Trip Aktif Disusun</span>
            </div>

            <h1>{trip.title}</h1>

            <div className="hero-meta">
              <span>
                <CalendarDays size={16} />
                {trip.dates}
              </span>
              <span className="hero-meta__separator">•</span>
              <span>
                <MapPin size={16} />
                {trip.city}
              </span>
              <span className="hero-meta__separator">•</span>
              <strong>{itemsList.length} Aktivitas</strong>
            </div>
          </div>

          <div className="hero-actions">
            <button
              className="mytrip-btn mytrip-btn--secondary"
              onClick={() => navigateExplore("jelajah")}
            >
              <Plus size={17} />
              Tambah Aktivitas
            </button>

            <button className="mytrip-btn mytrip-btn--primary" onClick={openBooking}>
              <ShoppingCart size={17} />
              Pesan Seluruh Rute
            </button>
          </div>
        </header>

        {notice && <div className="mytrip-toast">{notice}</div>}

        <div className="mobile-tabs" role="tablist" aria-label="Tampilan My Trip">
          <button
            className={mobileTab === "itinerary" ? "active" : ""}
            onClick={() => setMobileTab("itinerary")}
          >
            <CalendarDays size={16} />
            Itinerary
          </button>
          <button
            className={mobileTab === "budget_map" ? "active" : ""}
            onClick={() => setMobileTab("budget_map")}
          >
            <WalletCards size={16} />
            Budget & Peta
          </button>
        </div>

        <div className="mytrip-layout">
          <main
            className={`itinerary-column ${
              mobileTab === "budget_map" ? "mobile-hidden" : ""
            }`}
          >
            <div className="section-heading">
              <div>
                <span className="section-kicker">JADWAL PERJALANAN</span>
                <h2>Itinerary Harian</h2>
              </div>

              <button
                className="day-dropdown"
                onClick={() => setShowAllDays((current) => !current)}
                aria-expanded={showAllDays}
              >
                <span>Hari {effectiveDay}</span>
                <ChevronDown
                  size={16}
                  className={showAllDays ? "rotate" : ""}
                />
              </button>
            </div>

            <div className={`day-selector ${showAllDays ? "expanded" : ""}`}>
              {availableDays.map((dayNum) => (
                <button
                  key={dayNum}
                  className={effectiveDay === dayNum ? "active" : ""}
                  onClick={() => {
                    setSelectedDay(dayNum);
                    setShowAllDays(false);
                  }}
                >
                  <span>Hari {dayNum}</span>
                  <small>{DAY_META[dayNum]?.short || `Rute ${dayNum}`}</small>
                </button>
              ))}
            </div>

            <div className="day-summary">
              <div>
                <span className="day-summary__label">Rute Hari {effectiveDay}</span>
                <strong>
                  {DAY_META[effectiveDay]?.short || "Eksplorasi Lokal"}
                </strong>
              </div>
              <span className="day-summary__distance">
                <Map size={15} />
                {DAY_META[effectiveDay]?.distance || "—"}
              </span>
            </div>

            <div className="timeline">
              {dayFilteredItems.length === 0 ? (
                <div className="empty-day">
                  <div className="empty-day__icon">
                    <CalendarDays size={23} />
                  </div>
                  <h3>Belum Ada Aktivitas</h3>
                  <p>
                    Belum ada kegiatan yang dijadwalkan pada Hari{" "}
                    {effectiveDay}.
                  </p>
                  <button
                    className="mytrip-btn mytrip-btn--primary mytrip-btn--small"
                    onClick={() => navigateExplore("jelajah")}
                  >
                    <Plus size={15} />
                    Pilih Aktivitas
                  </button>
                </div>
              ) : (
                dayFilteredItems.map((item, index) => (
                  <article
                    className={`timeline-card ${item.isNew ? "is-new" : ""}`}
                    key={item.id || `${item.day}-${index}`}
                  >
                    <div className="timeline-rail">
                      <span className="timeline-index">{index + 1}</span>
                      {index !== dayFilteredItems.length - 1 && (
                        <span className="timeline-line" />
                      )}
                    </div>

                    <div className="timeline-body">
                      <div className="timeline-top">
                        <span className="time-pill">
                          <Clock3 size={14} />
                          {item.time || "Waktu fleksibel"}
                        </span>

                        <div className="timeline-top__actions">
                          {item.isNew && (
                            <span className="new-badge">
                              <Sparkles size={12} />
                              Baru Ditambahkan
                            </span>
                          )}

                          <button
                            className="icon-button"
                            onClick={() => removeItem(item.id)}
                            title="Hapus dari rencana"
                            aria-label={`Hapus ${item.title}`}
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="timeline-content">
                        <span className="category-label">
                          {item.category || "Pengalaman Lokal"}
                        </span>
                        <h3>{item.title}</h3>

                        <p className="location-line">
                          <MapPin size={15} />
                          {item.location || "Lokasi belum ditentukan"}
                        </p>
                      </div>

                      {item.transportTip && (
                        <div className="transport-tip">
                          <TramFront size={16} />
                          <span>
                            Saran rute: <strong>{item.transportTip}</strong>
                          </span>
                        </div>
                      )}

                      <div className="timeline-footer">
                        <span>
                          Pemandu:{" "}
                          <strong>{item.guideName || "Warga Setempat"}</strong>
                        </span>
                        <strong className="activity-price">
                          {formatCurrency(item.price || 95000)}
                        </strong>
                      </div>
                    </div>
                  </article>
                ))
              )}
            </div>

            <section className="integration-card">
              <div className="integration-header">
                <div>
                  <span className="section-kicker">JALUR UTAMA INTEGRASI</span>
                  <h3>Rekomendasi Berdasarkan Rute</h3>
                </div>
                <Sparkles size={20} />
              </div>

              <div className="recommendation-list">
                <article className="recommendation-card">
                  <div className="recommendation-icon">
                    <Hotel size={21} />
                  </div>

                  <div className="recommendation-copy">
                    <span className="recommendation-type">PENGINAPAN</span>
                    <h4>{selectedStay.name}</h4>
                    <p>
                      {selectedStay.category || "Homestay lokal"} • 10 menit
                      dari titik akhir Hari {effectiveDay}
                    </p>
                    <strong>
                      {selectedStay.priceFormatted ||
                        formatCurrency(selectedStay.pricePerNight)}
                    </strong>
                  </div>

                  <span className="selected-chip">
                    <Check size={13} />
                    Terpilih
                  </span>
                </article>

                <article className="recommendation-card">
                  <div className="recommendation-icon">
                    <TramFront size={21} />
                  </div>

                  <div className="recommendation-copy">
                    <span className="recommendation-type">TRANSPORTASI</span>
                    <h4>{selectedTransport.name}</h4>
                    <p>{selectedTransport.description}</p>
                    <strong>
                      {selectedTransport.priceFormatted ||
                        formatCurrency(selectedTransport.pricePerTrip)}
                    </strong>
                  </div>

                  <span className="selected-chip">
                    <Check size={13} />
                    Terpilih
                  </span>
                </article>
              </div>
            </section>
          </main>

          <aside
            className={`trip-sidebar ${
              mobileTab === "itinerary" ? "mobile-hidden" : ""
            }`}
          >
            <section className="budget-card">
              <div className="budget-heading">
                <div>
                  <span className="section-kicker">RINGKASAN BIAYA</span>
                  <h2>Budget Perjalanan</h2>
                  <p>Otomatis diperbarui saat itinerary berubah.</p>
                </div>
                <div className="budget-heading__icon">
                  <DollarSign size={18} />
                </div>
              </div>

              <div className="budget-rows">
                <div className="budget-row">
                  <span>Total Pengalaman ({itemsList.length} item)</span>
                  <strong>{formatCurrency(totalExperienceCost)}</strong>
                </div>
                <div className="budget-row">
                  <span>Penginapan (1 malam)</span>
                  <strong>{formatCurrency(stayCost)}</strong>
                </div>
                <div className="budget-row">
                  <span>Transportasi Lokal</span>
                  <strong>{formatCurrency(transportCost)}</strong>
                </div>
                <div className="budget-row budget-row--conservation">
                  <span>
                    Dana Konservasi 2,5%
                    <Info size={13} title="Alokasi untuk konservasi budaya" />
                  </span>
                  <strong>+{formatCurrency(conservationFund)}</strong>
                </div>
              </div>

              <div className="budget-total">
                <span>Estimasi Total</span>
                <strong>{formatCurrency(grandTotal)}</strong>
              </div>

              <button className="payment-button" onClick={openBooking}>
                Lanjut ke Pembayaran
                <ArrowRight size={17} />
              </button>

              <p className="budget-note">
                <WalletCards size={14} />
                Harga ditampilkan sebagai estimasi dan dapat berubah.
              </p>
            </section>

            <section className="map-card">
              <div className="map-card__heading">
                <div>
                  <span className="section-kicker">VISUALISASI</span>
                  <h2>Peta Rute</h2>
                </div>
                <span className="map-points">3 titik singgah</span>
              </div>

              <div className="route-map">
                <div className="map-grid" />
                <div className="route-glow route-glow--one" />
                <div className="route-glow route-glow--two" />

                <div className="route-path">
                  <div className="route-node route-node--start">
                    <span>1</span>
                    <small>Kotagede</small>
                  </div>

                  <div className="route-segment route-segment--one" />

                  <div className="route-node route-node--middle">
                    <span>2</span>
                    <small>Kasongan</small>
                  </div>

                  <div className="route-segment route-segment--two" />

                  <div className="route-node route-node--end">
                    <span>3</span>
                    <small>Sewon</small>
                  </div>
                </div>

                <div className="map-label">
                  <MapPin size={13} />
                  <span>Total jelajah ±14,2 km</span>
                </div>
              </div>

              <div className="map-stats">
                <div>
                  <span>Jarak</span>
                  <strong>14,2 km</strong>
                </div>
                <div>
                  <span>Efisiensi</span>
                  <strong>94%</strong>
                </div>
                <div>
                  <span>Titik</span>
                  <strong>3</strong>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </section>
  );
}
