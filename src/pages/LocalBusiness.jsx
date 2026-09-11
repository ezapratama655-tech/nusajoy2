import { useEffect, useMemo, useState } from 'react'
import { supabase } from '../utils/supabaseClient'

function LocalBusiness() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState(null)

  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('Semua')
  const [featuredOnly, setFeaturedOnly] = useState(false)

  // ==========================================
  // FETCH LOCAL BUSINESSES
  // ==========================================

  useEffect(() => {
    async function fetchBusinesses() {
      setLoading(true)

      const { data, error } = await supabase
        .from('local_businesses')
        .select(`
          *,
          destinations (
            id,
            name
          )
        `)
        .order('rating', { ascending: false })

      if (error) {
        setErrorMsg(error.message)
      } else {
        setBusinesses(data || [])
      }

      setLoading(false)
    }

    fetchBusinesses()
  }, [])

  // ==========================================
  // CATEGORY LIST
  // ==========================================

  const categories = useMemo(() => {
    const uniqueCategories = [
      ...new Set(
        businesses
          .map((business) => business.category)
          .filter(Boolean)
      ),
    ]

    return ['Semua', ...uniqueCategories]
  }, [businesses])

  // ==========================================
  // FILTER BUSINESSES
  // ==========================================

  const filteredBusinesses = useMemo(() => {
    let result = [...businesses]

    if (search.trim()) {
      const keyword = search.toLowerCase()

      result = result.filter((business) =>
        `${business.name}
         ${business.location}
         ${business.category}
         ${business.description || ''}
         ${business.destinations?.name || ''}`
          .toLowerCase()
          .includes(keyword)
      )
    }

    if (category !== 'Semua') {
      result = result.filter(
        (business) => business.category === category
      )
    }

    if (featuredOnly) {
      result = result.filter(
        (business) => business.is_featured === true
      )
    }

    return result
  }, [
    businesses,
    search,
    category,
    featuredOnly,
  ])

  // ==========================================
  // LOADING
  // ==========================================

  if (loading) {
    return (
      <div
        className="container"
        style={{
          minHeight: '60vh',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <p style={{ color: 'var(--color-muted)' }}>
          🏪 Memuat bisnis lokal...
        </p>
      </div>
    )
  }

  // ==========================================
  // ERROR
  // ==========================================

  if (errorMsg) {
    return (
      <div className="container">
        <div
          style={{
            padding: '1.5rem',
            borderRadius: '18px',
            background: '#fff1f1',
            color: '#c62828',
          }}
        >
          <h3>Gagal memuat bisnis lokal</h3>
          <p>{errorMsg}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container">

      {/* ====================================
          HERO
      ==================================== */}

      <section
        style={{
          padding: '1.5rem',
          borderRadius: '24px',
          marginBottom: '1.5rem',
          background:
            'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          color: 'white',
        }}
      >
        <div style={{ fontSize: '2.5rem', marginBottom: '.5rem' }}>
          🏪
        </div>

        <h1 style={{ margin: '0 0 .5rem' }}>
          Local Business
        </h1>

        <p
          style={{
            margin: 0,
            lineHeight: 1.6,
            opacity: .9,
          }}
        >
          Temukan UMKM, kuliner, dan pengalaman lokal yang
          membuat perjalananmu lebih bermakna.
        </p>
      </section>


      {/* ====================================
          SEARCH
      ==================================== */}

      <div
        style={{
          position: 'relative',
          marginBottom: '1rem',
        }}
      >
        <span
          style={{
            position: 'absolute',
            left: '1rem',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          🔍
        </span>

        <input
          type="text"
          placeholder="Cari UMKM, kuliner, atau lokasi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: '100%',
            boxSizing: 'border-box',
            padding: '.9rem 1rem .9rem 2.7rem',
            borderRadius: '14px',
            border: '1px solid #ddd',
            fontSize: '1rem',
          }}
        />
      </div>


      {/* ====================================
          CATEGORY
      ==================================== */}

      <div
        style={{
          display: 'flex',
          gap: '.6rem',
          overflowX: 'auto',
          paddingBottom: '.6rem',
          marginBottom: '1rem',
        }}
      >
        {categories.map((item) => (
          <button
            key={item}
            onClick={() => setCategory(item)}
            style={{
              padding: '.6rem 1rem',
              borderRadius: '999px',
              whiteSpace: 'nowrap',
              cursor: 'pointer',
              border:
                category === item
                  ? '1px solid var(--color-primary)'
                  : '1px solid #ddd',
              background:
                category === item
                  ? 'var(--color-primary)'
                  : 'white',
              color:
                category === item
                  ? 'white'
                  : 'var(--color-text)',
              fontWeight: 600,
            }}
          >
            {item === 'Semua' ? '✨ Semua' : item}
          </button>
        ))}
      </div>


      {/* ====================================
          FEATURED FILTER
      ==================================== */}

      <label
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '.6rem',
          marginBottom: '1.25rem',
          cursor: 'pointer',
        }}
      >
        <input
          type="checkbox"
          checked={featuredOnly}
          onChange={(e) =>
            setFeaturedOnly(e.target.checked)
          }
        />

        ⭐ Tampilkan bisnis unggulan saja
      </label>


      {/* ====================================
          RESULT
      ==================================== */}

      <p
        style={{
          color: 'var(--color-muted)',
          marginBottom: '1rem',
        }}
      >
        <strong style={{ color: 'var(--color-text)' }}>
          {filteredBusinesses.length}
        </strong>{' '}
        bisnis lokal ditemukan
      </p>


      {/* ====================================
          EMPTY STATE
      ==================================== */}

      {filteredBusinesses.length === 0 && (
        <div
          style={{
            padding: '3rem 1rem',
            textAlign: 'center',
          }}
        >
          <div style={{ fontSize: '3rem' }}>🏪</div>

          <h3>Belum ada bisnis yang ditemukan</h3>

          <p style={{ color: 'var(--color-muted)' }}>
            Coba gunakan kata kunci atau kategori lain.
          </p>
        </div>
      )}


      {/* ====================================
          BUSINESS GRID
      ==================================== */}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns:
            'repeat(auto-fill, minmax(250px, 1fr))',
          gap: '1.25rem',
        }}
      >
        {filteredBusinesses.map((business) => (
          <div
            key={business.id}
            className="card"
            style={{
              overflow: 'hidden',
            }}
          >

            {/* IMAGE */}

            {business.image_url && (
              <img
                src={business.image_url}
                alt={business.name}
                style={{
                  width: '100%',
                  height: '170px',
                  objectFit: 'cover',
                  display: 'block',
                }}
              />
            )}


            {/* CONTENT */}

            <div style={{ padding: '1rem' }}>

              {business.is_featured && (
                <span className="badge-gem">
                  ⭐ Business Pilihan
                </span>
              )}

              <h3
                style={{
                  margin: '.6rem 0 .35rem',
                }}
              >
                {business.name}
              </h3>


              <p
                style={{
                  margin: '0 0 .7rem',
                  color: 'var(--color-muted)',
                  fontSize: '.9rem',
                }}
              >
                📍 {business.location}
                {' • '}
                {business.category}
              </p>


              <p
                style={{
                  fontSize: '.9rem',
                  lineHeight: 1.5,
                }}
              >
                {business.description}
              </p>


              {/* BUSINESS INFO */}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: '.5rem',
                  fontSize: '.85rem',
                  marginTop: '1rem',
                  paddingTop: '.8rem',
                  borderTop: '1px solid #eee',
                }}
              >
                <span>
                  💰 {business.price_range || '-'}
                </span>

                <span>
                  ⭐ {business.rating || '-'}
                </span>
              </div>


              {/* DESTINATION CONNECTION */}

              {business.destinations && (
                <div
                  style={{
                    marginTop: '.9rem',
                    padding: '.7rem',
                    borderRadius: '10px',
                    background: '#f7f7f7',
                    fontSize: '.8rem',
                  }}
                >
                  🧭 Cocok dikunjungi saat berada di{' '}
                  <strong>
                    {business.destinations.name}
                  </strong>
                </div>
              )}

            </div>

          </div>
        ))}
      </div>

    </div>
  )
}

export default LocalBusiness