import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../utils/supabaseClient'

function Recommendation() {
  const [destinations, setDestinations] = useState([])
  const [results, setResults] = useState([])

  const [location, setLocation] = useState('Semua Lokasi')
  const [interest, setInterest] = useState('Semua Minat')

  const [budget, setBudget] = useState(50000)
  const [duration, setDuration] = useState(3)

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const [activeFilter, setActiveFilter] = useState(null)
  const [sortBy, setSortBy] = useState('recommended')

  // =========================================
  // AMBIL DATA DESTINASI DARI SUPABASE
  // =========================================

  useEffect(() => {
    let mounted = true

    async function fetchDestinations() {
      setLoading(true)
      setErrorMsg('')

      try {
        const { data, error } = await supabase
          .from('destinations')
          .select('*')

        if (error) {
          throw error
        }

        if (mounted) {
          setDestinations(Array.isArray(data) ? data : [])
        }
      } catch (error) {
        console.error('Gagal mengambil destinasi:', error)

        if (mounted) {
          setErrorMsg(
            error?.message ||
              'Gagal mengambil data destinasi.'
          )
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchDestinations()

    return () => {
      mounted = false
    }
  }, [])

  // =========================================
  // DATA LOKASI
  // =========================================

  const locations = useMemo(() => {
    return [
      ...new Set(
        destinations
          .map((destination) => destination?.location)
          .filter(Boolean)
      ),
    ]
  }, [destinations])

  // =========================================
  // DATA MINAT / KATEGORI
  // =========================================

  const interests = useMemo(() => {
    return [
      ...new Set(
        destinations
          .map((destination) => destination?.category)
          .filter(Boolean)
      ),
    ]
  }, [destinations])

  // =========================================
  // FORMAT HARGA
  // =========================================

  function formatPrice(price) {
    const numericPrice = Number(price)

    if (!Number.isFinite(numericPrice)) {
      return 'Rp0'
    }

    return `Rp${numericPrice.toLocaleString('id-ID')}`
  }

  // =========================================
  // GENERATE RECOMMENDATION
  // =========================================

  function generateRecommendation() {
    if (destinations.length === 0) {
      setHasSearched(true)
      setResults([])
      return
    }

    setHasSearched(true)
    setLoading(true)
    setErrorMsg('')

    setTimeout(() => {
      const scoredDestinations = destinations.map((destination) => {
        let score = 0
        const reasons = []

        const price = Number(destination?.price) || 0
        const destinationDuration =
          Number(destination?.duration) || 0
        const rating =
          Number(destination?.rating) || 0

        // =====================================
        // BUDGET
        // =====================================

        if (price <= budget) {
          score += 30
          reasons.push('Sesuai budget')
        } else {
          const difference = price - budget

          if (difference <= budget * 0.2) {
            score += 15
            reasons.push('Harga sedikit di atas budget')
          }
        }

        // =====================================
        // MINAT
        // =====================================

        const destinationCategory =
          String(destination?.category || '')
            .toLowerCase()

        if (
          interest === 'Semua Minat' ||
          destinationCategory ===
            interest.toLowerCase()
        ) {
          score += 25

          if (interest !== 'Semua Minat') {
            reasons.push(
              `Sesuai minat ${interest}`
            )
          }
        }

        // =====================================
        // DURASI
        // =====================================

        if (destinationDuration <= duration) {
          score += 20
          reasons.push('Sesuai durasi perjalanan')
        } else if (
          destinationDuration <= duration + 1
        ) {
          score += 10
          reasons.push('Durasi sedikit lebih lama')
        }

        // =====================================
        // LOKASI
        // =====================================

        const destinationLocation =
          String(destination?.location || '')
            .toLowerCase()

        if (
          location === 'Semua Lokasi' ||
          destinationLocation ===
            location.toLowerCase()
        ) {
          score += 15

          if (location !== 'Semua Lokasi') {
            reasons.push(
              `Berada di ${location}`
            )
          }
        }

        // =====================================
        // RATING
        // =====================================

        if (rating >= 4.5) {
          score += 5
          reasons.push('Rating sangat baik')
        } else if (rating >= 4) {
          score += 3
          reasons.push('Rating bagus')
        }

        // =====================================
        // HIDDEN GEM
        // =====================================

        if (destination?.is_hidden_gem === true) {
          score += 5
          reasons.push('Hidden Gem')
        }

        return {
          ...destination,
          recommendationScore: Math.min(score, 100),
          reasons,
        }
      })

      // =====================================
      // URUTKAN BERDASARKAN SCORE
      // =====================================

      scoredDestinations.sort((a, b) => {
        const scoreDifference =
          Number(b.recommendationScore || 0) -
          Number(a.recommendationScore || 0)

        if (scoreDifference !== 0) {
          return scoreDifference
        }

        return (
          Number(b.rating || 0) -
          Number(a.rating || 0)
        )
      })

      setResults(scoredDestinations.slice(0, 6))
      setLoading(false)
    }, 350)
  }

  // =========================================
  // SORTING
  // =========================================

  const sortedResults = useMemo(() => {
    const sorted = [...results]

    switch (sortBy) {
      case 'rating':
        sorted.sort(
          (a, b) =>
            Number(b.rating || 0) -
            Number(a.rating || 0)
        )
        break

      case 'price':
        sorted.sort(
          (a, b) =>
            Number(a.price || 0) -
            Number(b.price || 0)
        )
        break

      case 'duration':
        sorted.sort(
          (a, b) =>
            Number(a.duration || 0) -
            Number(b.duration || 0)
        )
        break

      default:
        sorted.sort(
          (a, b) =>
            Number(b.recommendationScore || 0) -
            Number(a.recommendationScore || 0)
        )
        break
    }

    return sorted
  }, [results, sortBy])

  // =========================================
  // RESET FILTER
  // =========================================

  function resetFilters() {
    setLocation('Semua Lokasi')
    setInterest('Semua Minat')
    setBudget(50000)
    setDuration(3)
    setActiveFilter(null)
  }

  // =========================================
  // JUMLAH FILTER AKTIF
  // =========================================

  const activeFilterCount =
    (location !== 'Semua Lokasi' ? 1 : 0) +
    (interest !== 'Semua Minat' ? 1 : 0) +
    (budget !== 50000 ? 1 : 0) +
    (duration !== 3 ? 1 : 0)

  // =========================================
  // FILTER BUTTON
  // =========================================

  function FilterButton({
    icon,
    label,
    value,
    filter,
  }) {
    const active = activeFilter === filter

    return (
      <button
        type="button"
        className={`filter-chip ${
          active ? 'active' : ''
        }`}
        onClick={() =>
          setActiveFilter(
            active ? null : filter
          )
        }
      >
        <span className="filter-icon">
          {icon}
        </span>

        <span className="filter-content">
          <small>{label}</small>
          <strong>{value}</strong>
        </span>

        <span className="filter-arrow">
          {active ? '⌃' : '⌄'}
        </span>
      </button>
    )
  }

  // =========================================
  // RENDER
  // =========================================

  return (
    <div className="recommendation-page">

      <div className="floating-orb orb-1" />
      <div className="floating-orb orb-2" />
      <div className="floating-orb orb-3" />

      <div className="floating-icon icon-1">✦</div>
      <div className="floating-icon icon-2">✈</div>
      <div className="floating-icon icon-3">🌴</div>

      {/* =====================================
          CSS
      ===================================== */}

      <style>{`

        * {
          box-sizing: border-box;
        }

        .recommendation-page {
          position: relative;
          width: 100%;
          max-width: 1180px;
          margin: 0 auto;
          padding: 32px 16px 80px;
          color: #18312b;
          overflow: hidden;
          isolation: isolate;
        }

        .recommendation-page::before {
          content: "";
          position: absolute;
          inset: 0;
          z-index: -3;
          background:
            radial-gradient(circle at 8% 8%, rgba(72, 201, 176, 0.16), transparent 28%),
            radial-gradient(circle at 92% 18%, rgba(255, 183, 77, 0.15), transparent 25%),
            radial-gradient(circle at 50% 85%, rgba(93, 173, 226, 0.13), transparent 30%);
          pointer-events: none;
        }

        .floating-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(22px);
          opacity: 0.34;
          pointer-events: none;
          z-index: -2;
        }

        .orb-1 {
          width: 180px;
          height: 180px;
          background: #38bfa7;
          top: 30px;
          left: -80px;
          animation: floatOrb 8s ease-in-out infinite;
        }

        .orb-2 {
          width: 150px;
          height: 150px;
          background: #f6b84b;
          right: -50px;
          top: 280px;
          animation: floatOrb 10s ease-in-out infinite reverse;
        }

        .orb-3 {
          width: 130px;
          height: 130px;
          background: #6c8cff;
          left: 35%;
          bottom: 80px;
          animation: floatOrb 9s ease-in-out infinite;
        }

        .floating-icon {
          position: absolute;
          z-index: -1;
          pointer-events: none;
          opacity: 0.16;
          font-size: 28px;
          animation: floatingIcon 5s ease-in-out infinite;
        }

        .icon-1 { top: 100px; right: 8%; }
        .icon-2 { top: 420px; left: 3%; animation-delay: 1s; }
        .icon-3 { bottom: 180px; right: 4%; animation-delay: 2s; }

        @keyframes floatOrb {
          0%, 100% { transform: translateY(0) translateX(0); }
          50% { transform: translateY(-25px) translateX(15px); }
        }

        @keyframes floatingIcon {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-14px) rotate(8deg); }
        }

        /* =============================== HERO =============================== */
        .hero-section {
          position: relative;
          margin-bottom: 28px;
          animation: heroReveal 0.8s ease both;
        }

        .eyebrow {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 15px;
          border-radius: 999px;
          background: linear-gradient(135deg, #d9fff4, #e4f5ff);
          border: 1px solid rgba(56, 191, 167, 0.25);
          color: #087b69;
          font-size: 12px;
          font-weight: 900;
          margin-bottom: 16px;
          box-shadow: 0 8px 24px rgba(56, 191, 167, 0.12);
          animation: badgeFloat 3s ease-in-out infinite;
        }

        .hero-section h1 {
          margin: 0 0 14px;
          font-size: clamp(2.3rem, 7vw, 3.8rem);
          line-height: 1.05;
          letter-spacing: -2px;
          background: linear-gradient(120deg, #173a33, #087b69 45%, #e38a2c);
          -webkit-background-clip: text;
          background-clip: text;
          -webkit-text-fill-color: transparent;
          background-size: 200% 200%;
          animation: gradientMove 7s ease infinite;
        }

        .hero-section p {
          max-width: 680px;
          margin: 0;
          color: var(--color-muted, #71807a);
          line-height: 1.7;
          font-size: 14px;
        }

        @keyframes badgeFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-4px); }
        }

        @keyframes gradientMove {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        @keyframes heroReveal {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        /* =============================== FILTER =============================== */
        .filter-card {
          position: relative;
          background: linear-gradient(135deg, rgba(255,255,255,0.96), rgba(240,255,250,0.95));
          border: 1px solid rgba(56, 191, 167, 0.18);
          border-radius: 28px;
          padding: 20px;
          margin-bottom: 38px;
          box-shadow: 0 18px 50px rgba(15, 80, 65, 0.10);
          backdrop-filter: blur(14px);
          overflow: hidden;
          animation: cardReveal 0.7s ease both;
        }

        .filter-card::before {
          content: "";
          position: absolute;
          width: 180px;
          height: 180px;
          top: -100px;
          right: -80px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(246,184,75,0.25), transparent 70%);
          pointer-events: none;
        }

        @keyframes cardReveal {
          from { opacity: 0; transform: translateY(18px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .filter-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
          margin-bottom: 16px;
          position: relative;
          z-index: 1;
        }

        .filter-title { margin: 0; font-size: 16px; }

        .filter-subtitle {
          margin-top: 5px;
          color: var(--color-muted, #71807a);
          font-size: 12px;
        }

        .reset-button {
          border: 1px solid rgba(8,123,105,0.12);
          background: rgba(255,255,255,0.7);
          color: var(--color-primary, #0f8f78);
          font-weight: 800;
          cursor: pointer;
          padding: 7px 10px;
          border-radius: 10px;
          transition: 0.2s ease;
        }

        .reset-button:hover { background: #eafff8; transform: translateY(-1px); }

        .filter-scroll {
          display: flex;
          gap: 10px;
          overflow-x: auto;
          padding-bottom: 4px;
          scrollbar-width: none;
          position: relative;
          z-index: 1;
        }

        .filter-scroll::-webkit-scrollbar { display: none; }

        .filter-chip {
          flex: 0 0 190px;
          min-height: 74px;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px;
          border: 1px solid rgba(30, 70, 60, 0.08);
          border-radius: 18px;
          background: rgba(255,255,255,0.78);
          text-align: left;
          cursor: pointer;
          transition: transform 0.25s ease, box-shadow 0.25s ease, border 0.25s ease, background 0.25s ease;
          position: relative;
          overflow: hidden;
        }

        .filter-chip::after {
          content: "";
          position: absolute;
          width: 80px;
          height: 80px;
          border-radius: 50%;
          right: -40px;
          bottom: -40px;
          background: rgba(56,191,167,0.08);
          transition: transform 0.3s ease;
        }

        .filter-chip:hover {
          transform: translateY(-5px) scale(1.01);
          border-color: rgba(56,191,167,0.35);
          box-shadow: 0 14px 28px rgba(20,90,70,0.10);
        }

        .filter-chip:hover::after { transform: scale(1.8); }

        .filter-chip.active {
          border-color: #24a98f;
          background: linear-gradient(135deg, #e4fff8, #eefaf7);
          box-shadow: 0 10px 24px rgba(36,169,143,0.16);
          transform: translateY(-2px);
        }

        .filter-icon {
          width: 40px;
          height: 40px;
          min-width: 40px;
          display: grid;
          place-items: center;
          border-radius: 13px;
          background: white;
          font-size: 18px;
          box-shadow: 0 5px 12px rgba(20,70,60,0.06);
          position: relative;
          z-index: 1;
        }

        .filter-chip:nth-child(1) .filter-icon { background: #e5f2ff; }
        .filter-chip:nth-child(2) .filter-icon { background: #ffe9ee; }
        .filter-chip:nth-child(3) .filter-icon { background: #fff3d9; }
        .filter-chip:nth-child(4) .filter-icon { background: #eee9ff; }

        .filter-content {
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: 3px;
          position: relative;
          z-index: 1;
        }

        .filter-content small { color: var(--color-muted, #71807a); font-size: 10px; }

        .filter-content strong {
          max-width: 105px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 13px;
        }

        .filter-arrow { margin-left: auto; color: #87928f; position: relative; z-index: 1; }

        .filter-panel {
          margin-top: 14px;
          padding: 16px;
          background: linear-gradient(135deg, #f4fffb, #f7fbff);
          border: 1px solid rgba(56,191,167,0.12);
          border-radius: 18px;
          animation: panelIn 0.25s ease;
          position: relative;
          z-index: 1;
        }

        @keyframes panelIn {
          from { opacity: 0; transform: translateY(-8px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .option-grid { display: flex; flex-wrap: wrap; gap: 8px; }

        .option-button {
          border: 1px solid #dfe7e3;
          background: white;
          padding: 10px 13px;
          border-radius: 999px;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          transition: 0.18s ease;
        }

        .option-button:hover { transform: translateY(-2px); border-color: rgba(56,191,167,0.4); }

        .option-button.active {
          color: white;
          border-color: #0f8f78;
          background: linear-gradient(120deg, #087b69, #28b99b);
          box-shadow: 0 7px 16px rgba(8,123,105,0.18);
        }

        /* =============================== BUDGET =============================== */
        .price-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 12px;
        }

        .price-value { color: var(--color-accent, #e38a2c); font-size: 17px; font-weight: 900; }
        .budget-range { width: 100%; accent-color: var(--color-primary, #0f8f78); cursor: pointer; }

        .range-labels {
          display: flex;
          justify-content: space-between;
          color: var(--color-muted, #71807a);
          font-size: 10px;
        }

        /* =============================== SEARCH =============================== */
        .search-button {
          position: relative;
          width: 100%;
          overflow: hidden;
          border: 0;
          border-radius: 18px;
          padding: 16px 20px;
          margin-top: 16px;
          background: linear-gradient(120deg, #087b69, #16a085, #38bfa7);
          background-size: 200% 100%;
          color: white;
          font-size: 14px;
          font-weight: 900;
          letter-spacing: 0.2px;
          cursor: pointer;
          box-shadow: 0 14px 28px rgba(8,123,105,0.25);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
          animation: buttonGlow 3s ease infinite;
        }

        .search-button::before {
          content: "";
          position: absolute;
          top: 0;
          left: -120%;
          width: 70%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent);
          transform: skewX(-20deg);
          transition: 0.6s ease;
        }

        .search-button:hover::before { left: 130%; }
        .search-button:hover { transform: translateY(-4px); box-shadow: 0 18px 35px rgba(8,123,105,0.30); }
        .search-button:active { transform: scale(0.98); }
        .search-button:disabled { opacity: 0.65; cursor: wait; }

        @keyframes buttonGlow {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }

        /* =============================== ERROR =============================== */
        .error-box {
          margin: 16px 0;
          padding: 14px;
          border: 1px solid #ffd6d6;
          border-radius: 14px;
          background: #fff1f1;
          color: #c0392b;
          font-size: 13px;
        }

        /* =============================== RESULTS =============================== */
        .result-section { position: relative; margin-top: 38px; }

        .result-header {
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding: 18px 20px;
          border-radius: 20px;
          background: linear-gradient(135deg, #eafff8, #f4fbff);
          border: 1px solid rgba(56,191,167,0.16);
          box-shadow: 0 10px 30px rgba(20,90,70,0.06);
          margin-bottom: 22px;
        }

        .result-header h2 { margin: 0 0 5px; font-size: 25px; letter-spacing: -0.5px; color: #173a33; }
        .result-header p { margin: 0; color: var(--color-muted, #71807a); font-size: 12px; line-height: 1.5; }

        .sort-select {
          width: 100%;
          border: 1px solid rgba(56,191,167,0.18);
          border-radius: 12px;
          padding: 11px 12px;
          background: white;
          cursor: pointer;
          font-size: 12px;
          font-weight: 700;
          box-shadow: 0 5px 14px rgba(20,70,60,0.05);
        }

        /* =============================== GRID =============================== */
        .destination-grid { display: grid; grid-template-columns: 1fr; gap: 16px; }

        .destination-card {
          position: relative;
          overflow: hidden;
          border: 1px solid rgba(20,70,60,0.08);
          border-radius: 24px;
          background: linear-gradient(180deg, #ffffff, #fbfffd);
          box-shadow: 0 12px 30px rgba(20,70,60,0.08);
          transition: transform 0.35s ease, box-shadow 0.35s ease, border 0.35s ease;
          animation: destinationReveal 0.6s ease both;
        }

        .destination-card::before {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(56,191,167,0.42), transparent 40%, rgba(246,184,75,0.30));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: 3;
        }

        .destination-card:hover {
          transform: translateY(-10px) scale(1.015);
          box-shadow: 0 24px 55px rgba(20,80,65,0.16);
        }

        .destination-card:hover::before { opacity: 1; }

        @keyframes destinationReveal {
          from { opacity: 0; transform: translateY(25px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* =============================== IMAGE =============================== */
        .image-wrapper {
          position: relative;
          height: 220px;
          overflow: hidden;
        }

        .destination-image {
          width: 100%;
          height: 100%;
          display: block;
          object-fit: cover;
          transition: transform 0.7s ease;
        }

        .destination-card:hover .destination-image { transform: scale(1.08); }

        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to bottom, rgba(10,30,25,0.05), transparent 45%, rgba(10,35,30,0.48));
          pointer-events: none;
        }

        .rank-badge,
        .score-badge {
          position: absolute;
          top: 12px;
          z-index: 2;
          padding: 7px 10px;
          border-radius: 999px;
          backdrop-filter: blur(8px);
          font-size: 10px;
          font-weight: 900;
        }

        .rank-badge {
          left: 12px;
          background: rgba(255,255,255,0.94);
          box-shadow: 0 5px 15px rgba(0,0,0,0.10);
        }

        .score-badge {
          right: 12px;
          color: white;
          background: linear-gradient(135deg, #087b69, #25b898);
          border: 1px solid rgba(255,255,255,0.35);
          box-shadow: 0 8px 18px rgba(8,123,105,0.28);
          animation: scorePulse 0.6s ease-out 1;
        }

        @keyframes scorePulse {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }

          70% {
            opacity: 1;
            transform: scale(1.04);
          }

          100% {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* =============================== CARD BODY =============================== */
        .card-body { padding: 16px; }

        .gem-badge {
          display: inline-flex;
          padding: 5px 9px;
          border-radius: 999px;
          background: linear-gradient(135deg, #fff0bd, #fff8df);
          color: #996600;
          font-size: 10px;
          font-weight: 900;
          box-shadow: 0 5px 12px rgba(153,102,0,0.08);
        }

        .destination-name { margin: 9px 0 5px; font-size: 18px; line-height: 1.25; color: #18312b; }

        .destination-meta {
          margin: 0 0 13px;
          color: var(--color-muted, #71807a);
          font-size: 12px;
          line-height: 1.7;
        }

        /* =============================== INFO =============================== */
        .destination-info {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 7px;
          margin-bottom: 14px;
        }

        .info-item {
          min-width: 0;
          padding: 9px 5px;
          border-radius: 11px;
          background: #f8fbfa;
          border: 1px solid rgba(20,70,60,0.05);
          text-align: center;
          font-size: 12px;
          transition: transform 0.2s ease;
        }

        .info-item:nth-child(1) { background: #fff7e8; }
        .info-item:nth-child(2) { background: #eef6ff; }
        .info-item:nth-child(3) { background: #fff8dc; }
        .info-item:hover { transform: translateY(-3px); }

        .info-item strong {
          display: block;
          margin-top: 4px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 11px;
        }

        .price-text { color: var(--color-accent, #e38a2c); }

        /* =============================== SCORE =============================== */
        .score-container { margin-bottom: 13px; }

        .score-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 5px;
          color: var(--color-muted, #71807a);
          font-size: 10px;
        }

        .score-row strong { color: var(--color-primary, #0f8f78); }

        .score-bar {
          height: 7px;
          overflow: hidden;
          border-radius: 999px;
          background: #e8eeeb;
        }

        .score-fill {
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #0b806c, #28b99b, #72d8c3);
          box-shadow: 0 0 10px rgba(40,185,155,0.22);
          transition: width 0.9s cubic-bezier(0.22,1,0.36,1);
        }

        /* =============================== REASONS =============================== */
        .reason-box {
          position: relative;
          padding: 13px;
          margin-bottom: 15px;
          border-radius: 15px;
          background: linear-gradient(135deg, #edfff9, #f3fbff);
          border-left: 4px solid #38bfa7;
          overflow: hidden;
        }

        .reason-box::after {
          content: "✦";
          position: absolute;
          right: 12px;
          top: 8px;
          color: rgba(56,191,167,0.18);
          font-size: 38px;
        }

        .reason-title { position: relative; z-index: 1; margin: 0 0 5px; font-size: 10px; font-weight: 900; }
        .reason { position: relative; z-index: 1; margin: 3px 0; color: var(--color-muted, #71807a); font-size: 10px; }

        /* =============================== DETAIL =============================== */
        .detail-button {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          width: 100%;
          padding: 12px;
          border-radius: 13px;
          background: linear-gradient(120deg, #0c7968, #16a085);
          color: white;
          text-decoration: none;
          font-size: 12px;
          font-weight: 900;
          box-shadow: 0 8px 18px rgba(12,121,104,0.18);
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }

        .detail-button:hover {
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(12,121,104,0.28);
        }

        .detail-button span { transition: transform 0.25s ease; }
        .detail-button:hover span { transform: translateX(5px); }

        /* =============================== EMPTY =============================== */
        .empty-state {
          padding: 55px 20px;
          border: 1px solid rgba(56,191,167,0.16);
          border-radius: 22px;
          background: linear-gradient(135deg, #ffffff, #f2fffb);
          text-align: center;
          box-shadow: 0 12px 30px rgba(20,70,60,0.06);
        }

        .empty-icon { margin-bottom: 10px; font-size: 42px; animation: badgeFloat 3s ease-in-out infinite; }
        .empty-state h3 { margin: 0 0 7px; font-size: 18px; }
        .empty-state p { margin: 0; color: var(--color-muted, #71807a); font-size: 12px; line-height: 1.6; }

        /* =============================== TABLET =============================== */
        @media (min-width: 640px) {
          .recommendation-page { padding: 36px 24px 80px; }
          .filter-card { padding: 22px; }
          .filter-scroll { display: grid; grid-template-columns: repeat(2, 1fr); overflow: visible; }
          .filter-chip { width: 100%; }
          .result-header { flex-direction: row; align-items: flex-end; justify-content: space-between; }
          .sort-select { width: auto; min-width: 190px; }
          .destination-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        }

        /* =============================== DESKTOP =============================== */
        @media (min-width: 900px) {
          .recommendation-page { padding: 46px 28px 90px; }
          .filter-scroll { grid-template-columns: repeat(4, 1fr); }
          .destination-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
          .image-wrapper { height: 190px; }
        }

        @media (min-width: 1200px) {
          .destination-grid { gap: 20px; }
          .destination-card { border-radius: 26px; }
          .image-wrapper { height: 205px; }
        }

        /* =============================== ACCESSIBILITY =============================== */
        button:focus-visible,
        select:focus-visible,
        a:focus-visible,
        input:focus-visible {
          outline: 3px solid rgba(15,143,120,0.28);
          outline-offset: 3px;
        }

        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

      `}</style>

      {/* =====================================
          HERO
      ===================================== */}

      <section className="hero-section">

        <div className="eyebrow">
          ✨ NuSaJoy Smart Recommendation
        </div>

        <h1>
          Temukan wisata
          <br />
          yang cocok untukmu.
        </h1>

        <p>
          Atur preferensimu dan biarkan
          NuSaJoy menemukan destinasi yang
          paling sesuai dengan gaya
          perjalananmu.
        </p>

      </section>

      {/* =====================================
          FILTER
      ===================================== */}

      <section className="filter-card">

        <div className="filter-top">

          <div>
            <h3 className="filter-title">
              🎯 Sesuaikan perjalananmu
            </h3>

            <div className="filter-subtitle">
              {activeFilterCount > 0
                ? `${activeFilterCount} filter aktif`
                : 'Pilih preferensi perjalanan'}
            </div>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              className="reset-button"
              onClick={resetFilters}
            >
              Reset
            </button>
          )}

        </div>

        <div className="filter-scroll">

          <FilterButton
            icon="📍"
            label="Lokasi"
            value={location}
            filter="location"
          />

          <FilterButton
            icon="❤️"
            label="Minat"
            value={interest}
            filter="interest"
          />

          <FilterButton
            icon="💰"
            label="Budget"
            value={formatPrice(budget)}
            filter="budget"
          />

          <FilterButton
            icon="⏱"
            label="Durasi"
            value={`${duration} jam`}
            filter="duration"
          />

        </div>

        {/* LOCATION */}

        {activeFilter === 'location' && (
          <div className="filter-panel">

            <div className="option-grid">

              <button
                type="button"
                className={`option-button ${
                  location === 'Semua Lokasi'
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  setLocation('Semua Lokasi')
                  setActiveFilter(null)
                }}
              >
                🌎 Semua Lokasi
              </button>

              {locations.map((loc) => (
                <button
                  type="button"
                  key={loc}
                  className={`option-button ${
                    location === loc
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setLocation(loc)
                    setActiveFilter(null)
                  }}
                >
                  📍 {loc}
                </button>
              ))}

            </div>

          </div>
        )}

        {/* INTEREST */}

        {activeFilter === 'interest' && (
          <div className="filter-panel">

            <div className="option-grid">

              <button
                type="button"
                className={`option-button ${
                  interest === 'Semua Minat'
                    ? 'active'
                    : ''
                }`}
                onClick={() => {
                  setInterest('Semua Minat')
                  setActiveFilter(null)
                }}
              >
                ✨ Semua Minat
              </button>

              {interests.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`option-button ${
                    interest === item
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setInterest(item)
                    setActiveFilter(null)
                  }}
                >
                  ❤️ {item}
                </button>
              ))}

            </div>

          </div>
        )}

        {/* BUDGET */}

        {activeFilter === 'budget' && (
          <div className="filter-panel">

            <div className="price-header">
              <strong>
                Budget maksimal
              </strong>

              <span className="price-value">
                {formatPrice(budget)}
              </span>
            </div>

            <input
              className="budget-range"
              type="range"
              min="5000"
              max="200000"
              step="5000"
              value={budget}
              onChange={(event) =>
                setBudget(
                  Number(event.target.value)
                )
              }
            />

            <div className="range-labels">
              <span>Rp5K</span>
              <span>Rp200K</span>
            </div>

            <div
              className="option-grid"
              style={{ marginTop: '14px' }}
            >
              {[25000, 50000, 100000, 200000].map(
                (price) => (
                  <button
                    type="button"
                    key={price}
                    className={`option-button ${
                      budget === price
                        ? 'active'
                        : ''
                    }`}
                    onClick={() =>
                      setBudget(price)
                    }
                  >
                    ≤ {formatPrice(price)}
                  </button>
                )
              )}
            </div>

          </div>
        )}

        {/* DURATION */}

        {activeFilter === 'duration' && (
          <div className="filter-panel">

            <div className="option-grid">

              {Array.from(
                { length: 12 },
                (_, index) => index + 1
              ).map((hour) => (
                <button
                  type="button"
                  key={hour}
                  className={`option-button ${
                    duration === hour
                      ? 'active'
                      : ''
                  }`}
                  onClick={() => {
                    setDuration(hour)
                    setActiveFilter(null)
                  }}
                >
                  ⏱ {hour} jam
                </button>
              ))}

            </div>

          </div>
        )}

        {/* SEARCH */}

        <button
          type="button"
          className="search-button"
          onClick={generateRecommendation}
          disabled={loading}
        >
          {loading
            ? '⏳ Mencari destinasi...'
            : '✨ Temukan Rekomendasi'}
        </button>

      </section>

      {/* =====================================
          ERROR
      ===================================== */}

      {errorMsg && (
        <div className="error-box">
          ⚠️ Terjadi kesalahan: {errorMsg}
        </div>
      )}

      {/* =====================================
          RESULT
      ===================================== */}

      {hasSearched && (
        <section className="result-section">

          <div className="result-header">

            <div>
              <h2>
                ✨ Pilihan untukmu
              </h2>

              <p>
                {sortedResults.length > 0
                  ? `${sortedResults.length} destinasi paling sesuai dengan preferensimu`
                  : 'Belum menemukan destinasi yang cocok'}
              </p>
            </div>

            {sortedResults.length > 0 && (
              <select
                className="sort-select"
                value={sortBy}
                onChange={(event) =>
                  setSortBy(event.target.value)
                }
              >
                <option value="recommended">
                  ✨ Paling Cocok
                </option>

                <option value="rating">
                  ⭐ Rating Tertinggi
                </option>

                <option value="price">
                  💰 Harga Terendah
                </option>

                <option value="duration">
                  ⏱ Durasi Terpendek
                </option>
              </select>
            )}

          </div>

          {sortedResults.length === 0 ? (

            <div className="empty-state">

              <div className="empty-icon">
                🗺️
              </div>

              <h3>
                Belum menemukan destinasi
              </h3>

              <p>
                Coba naikkan budget atau
                tambahkan pilihan minatmu.
              </p>

            </div>

          ) : (

            <div className="destination-grid">

              {sortedResults.map(
                (destination, index) => {

                  const score = Math.min(
                    Number(
                      destination
                        ?.recommendationScore || 0
                    ),
                    100
                  )

                  return (
                    <article
                      key={destination.id}
                      className="destination-card"
                      style={{
                        animationDelay: `${index * 0.12}s`,
                      }}
                    >

                      {/* IMAGE */}

                      <div className="image-wrapper">

                        {destination.image_url ? (
                          <img
                            src={
                              destination.image_url
                            }
                            alt={
                              destination.name ||
                              'Destinasi wisata'
                            }
                            className="destination-image"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            style={{
                              width: '100%',
                              height: '100%',
                              display: 'grid',
                              placeItems: 'center',
                              background:
                                '#e9efec',
                              fontSize: '40px',
                            }}
                          >
                            🏞️
                          </div>
                        )}

                        <div className="image-overlay" />

                        {index < 3 && (
                          <div className="rank-badge">
                            {index === 0
                              ? '🥇 Terbaik'
                              : index === 1
                              ? '🥈 Pilihan'
                              : '🥉 Pilihan'}
                          </div>
                        )}

                        <div className="score-badge">
                          {score}% cocok
                        </div>

                      </div>

                      {/* BODY */}

                      <div className="card-body">

                        {destination.is_hidden_gem && (
                          <span className="gem-badge">
                            ✨ Hidden Gem
                          </span>
                        )}

                        <h3 className="destination-name">
                          {destination.name ||
                            'Destinasi tanpa nama'}
                        </h3>

                        <p className="destination-meta">
                          📍{' '}
                          {destination.location ||
                            'Lokasi tidak tersedia'}
                          <br />
                          🎯{' '}
                          {destination.category ||
                            'Kategori wisata'}
                        </p>

                        {/* INFO */}

                        <div className="destination-info">

                          <div className="info-item">
                            💰
                            <strong className="price-text">
                              {formatPrice(
                                destination.price
                              )}
                            </strong>
                          </div>

                          <div className="info-item">
                            ⏱
                            <strong>
                              {destination.duration ??
                                '-'}{' '}
                              jam
                            </strong>
                          </div>

                          <div className="info-item">
                            ⭐
                            <strong>
                              {destination.rating ??
                                '-'}
                            </strong>
                          </div>

                        </div>

                        {/* SCORE */}

                        <div className="score-container">

                          <div className="score-row">
                            <span>
                              Tingkat kecocokan
                            </span>

                            <strong>
                              {score}%
                            </strong>
                          </div>

                          <div className="score-bar">
                            <div
                              className="score-fill"
                              style={{
                                width: `${score}%`,
                              }}
                            />
                          </div>

                        </div>

                        {/* REASONS */}

                        {destination.reasons
                          ?.length > 0 && (
                          <div className="reason-box">

                            <p className="reason-title">
                              Kenapa cocok untukmu?
                            </p>

                            {destination.reasons
                              .slice(0, 3)
                              .map(
                                (
                                  reason,
                                  reasonIndex
                                ) => (
                                  <p
                                    key={
                                      reasonIndex
                                    }
                                    className="reason"
                                  >
                                    ✓ {reason}
                                  </p>
                                )
                              )}

                          </div>
                        )}

                        {/* DETAIL */}

                        <Link
                          to={`/destination/${destination.id}`}
                          className="detail-button"
                        >
                          Lihat Destinasi
                          <span>→</span>
                        </Link>

                      </div>

                    </article>
                  )
                }
              )}

            </div>
          )}

        </section>
      )}

    </div>
  )
}

export default Recommendation