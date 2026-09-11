import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Compass,
  MapPin,
  Sparkles,
  ShieldCheck,
  Heart,
  Search,
  Route,
  Users,
  ChevronRight,
  Star,
  Palmtree,
  Mountain,
  Building2,
  Utensils,
  UserRound,
  CalendarDays,
  Wallet,
  CheckCircle2,
  Store,
  Handshake,
} from 'lucide-react'

import '../styles/Home.css';

const Home = () => {
  const [searchQuery, setSearchQuery] = useState('')

  const categories = [
    {
      name: 'Pantai & Laut',
      icon: Palmtree,
      count: '120+ pengalaman',
    },
    {
      name: 'Gunung & Alam',
      icon: Mountain,
      count: '85+ pengalaman',
    },
    {
      name: 'Budaya & Kota',
      icon: Building2,
      count: '95+ pengalaman',
    },
    {
      name: 'Kuliner Lokal',
      icon: Utensils,
      count: '150+ pengalaman',
    },
  ]

  const popularDestinations = [
    {
      id: 1,
      title: 'Nusa Penida',
      location: 'Bali',
      rating: 4.9,
      reviews: 128,
      category: 'Pantai',
      image:
        'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 2,
      title: 'Taman Nasional Bromo',
      location: 'Jawa Timur',
      rating: 4.8,
      reviews: 210,
      category: 'Gunung',
      image:
        'https://images.unsplash.com/photo-1588668214407-6ea9a6d8c272?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 3,
      title: 'Labuan Bajo',
      location: 'Nusa Tenggara Timur',
      rating: 4.9,
      reviews: 95,
      category: 'Bahari',
      image:
        'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=800&q=80',
    },
  ]

  const experiences = [
    {
      icon: UserRound,
      title: 'Pemandu Lokal',
      description:
        'Terhubung dengan pemandu lokal untuk mengenal destinasi dari sudut pandang orang setempat.',
      link: '/tour-guide',
    },
    {
      icon: Store,
      title: 'UMKM & Kuliner',
      description:
        'Temukan produk, makanan, dan usaha lokal yang membuat perjalanan terasa lebih autentik.',
      link: '/local-business',
    },
    {
      icon: Sparkles,
      title: 'Hidden Experience',
      description:
        'Temukan aktivitas dan pengalaman lokal yang mungkin tidak muncul di pencarian biasa.',
      link: '/explore',
    },
  ]

  const processSteps = [
    {
      number: '01',
      icon: Search,
      title: 'Discover',
      subtitle: 'Temukan',
      description:
        'Jelajahi destinasi, kuliner, aktivitas, UMKM, dan pengalaman lokal di sekitarmu.',
    },
    {
      number: '02',
      icon: Sparkles,
      title: 'Match',
      subtitle: 'Sesuaikan',
      description:
        'Dapatkan rekomendasi berdasarkan lokasi, minat, budget, dan waktu perjalananmu.',
    },
    {
      number: '03',
      icon: CalendarDays,
      title: 'Plan',
      subtitle: 'Rencanakan',
      description:
        'Susun pilihan pengalaman menjadi perjalanan yang lebih terarah dan mudah dijalani.',
    },
    {
      number: '04',
      icon: CheckCircle2,
      title: 'Book',
      subtitle: 'Pesan',
      description:
        'Pesan pengalaman atau layanan lokal yang kamu pilih melalui NUSAJOY.',
    },
  ]

  const impactPoints = [
    {
      icon: Heart,
      title: 'Lebih Personal',
      text: 'Wisatawan menemukan pengalaman yang sesuai dengan kebutuhan dan gaya perjalanan.',
    },
    {
      icon: Users,
      title: 'Lebih Lokal',
      text: 'Wisatawan dapat mengenal destinasi melalui orang, cerita, dan usaha lokal.',
    },
    {
      icon: Handshake,
      title: 'Lebih Berdampak',
      text: 'Pelaku lokal memperoleh exposure dan peluang untuk menjangkau pasar wisatawan.',
    },
  ]

  return (
    <main className="nusajoy-home">

      {/* ================= HERO ================= */}
      <section className="nj-hero">
        <div className="nj-hero-glow nj-glow-one" aria-hidden="true" />
        <div className="nj-hero-glow nj-glow-two" aria-hidden="true" />

        <div className="nj-container nj-hero-inner">

          <div className="nj-hero-content">

            <div className="nj-eyebrow">
              <Sparkles size={13} />
              <span>LOCAL EXPERIENCE PLATFORM</span>
            </div>

            <h1>
              Temukan perjalanan
              <span>yang terasa lokal.</span>
            </h1>

            <p className="nj-hero-description">
              NUSAJOY membantu kamu menemukan destinasi, kuliner, aktivitas,
              dan pengalaman lokal yang sesuai dengan minat, waktu, dan budget.
            </p>

            <form
              className="nj-search-widget"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="nj-search-input-group">
                <Search size={18} className="nj-search-icon" />

                <input
                  type="text"
                  placeholder="Cari destinasi, pengalaman, atau kota..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              <Link to="/explore" className="nj-search-button">
                <Search size={16} />
                <span>Cari</span>
              </Link>
            </form>

            <div className="nj-hero-actions">
              <Link to="/explore" className="nj-primary-button">
                Mulai Jelajah
                <ArrowRight size={17} />
              </Link>

              <Link
                to="/recommendation"
                className="nj-secondary-button"
              >
                <Sparkles size={16} />
                Dapatkan Rekomendasi
              </Link>
            </div>

            <div className="nj-hero-trust">

              <div className="nj-trust-person">
                <div className="nj-avatar-stack">
                  <span>W</span>
                  <span>L</span>
                  <span>U</span>
                </div>

                <div>
                  <strong>Dibuat untuk wisatawan</strong>
                  <small>dan pelaku lokal Indonesia</small>
                </div>
              </div>

              <div className="nj-trust-divider" />

              <div className="nj-trust-mini">
                <ShieldCheck size={17} />
                <span>Berbasis Lokal</span>
              </div>

            </div>
          </div>

          {/* HERO IMAGE */}
          <div className="nj-hero-visual">

            <div className="nj-image-frame">
              <img
                src="https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&q=85"
                alt="Pengalaman wisata Indonesia"
              />

              <div className="nj-image-shade" />

              <div className="nj-image-location">
                <MapPin size={14} />
                <span>Indonesia</span>
              </div>

              <div className="nj-image-caption">
                <small>DISCOVER LOCAL EXPERIENCE</small>
                <strong>
                  Bukan hanya
                  <br />
                  tempat untuk dikunjungi.
                </strong>
              </div>
            </div>

            <div className="nj-floating-card nj-floating-top">
              <div className="nj-floating-icon">
                <Compass size={18} />
              </div>

              <div>
                <small>DISCOVER</small>
                <strong>Temukan lebih banyak</strong>
              </div>
            </div>

            <div className="nj-floating-card nj-floating-bottom">
              <div className="nj-floating-icon alt">
                <Heart size={17} />
              </div>

              <div>
                <strong>Lebih Personal</strong>
                <small>Sesuai perjalananmu</small>
              </div>
            </div>

          </div>
        </div>
      </section>


      {/* ================= QUICK DISCOVER ================= */}
      <section className="nj-categories-section">
        <div className="nj-container">

          <div className="nj-section-header">
            <div>
              <span className="nj-label">DISCOVER</span>
              <h2>Mulai dari apa yang kamu suka.</h2>
            </div>

            <Link to="/explore" className="nj-link-more">
              Jelajahi Semua
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="nj-categories-grid">
            {categories.map((cat) => {
              const Icon = cat.icon

              return (
                <Link
                  to="/explore"
                  key={cat.name}
                  className="nj-category-card"
                >
                  <div className="nj-category-icon">
                    <Icon size={22} />
                  </div>

                  <div className="nj-category-info">
                    <h3>{cat.name}</h3>
                    <span>{cat.count}</span>
                  </div>

                  <ChevronRight className="nj-category-arrow" size={17} />
                </Link>
              )
            })}
          </div>

        </div>
      </section>


      {/* ================= PROBLEM ================= */}
      <section className="nj-problem-section">
        <div className="nj-container">

          <div className="nj-problem-card">

            <div className="nj-problem-content">

              <span className="nj-label">MENGAPA NUSAJOY?</span>

              <h2>
                Terlalu banyak pilihan,
                <span>tetapi sulit menemukan yang tepat.</span>
              </h2>

              <p>
                Informasi wisata, kuliner, aktivitas, dan pengalaman lokal
                sering tersebar di berbagai tempat. Akibatnya, wisatawan
                cenderung memilih pilihan yang sudah populer.
              </p>

              <p>
                Di sisi lain, banyak pelaku lokal dan UMKM memiliki pengalaman
                menarik tetapi belum mendapatkan exposure digital yang cukup.
              </p>

            </div>

            <div className="nj-problem-side">

              <div className="nj-problem-item">
                <Search size={20} />
                <div>
                  <strong>Wisatawan bingung</strong>
                  <span>
                    Sulit menemukan pengalaman yang sesuai.
                  </span>
                </div>
              </div>

              <div className="nj-problem-item">
                <Users size={20} />
                <div>
                  <strong>Pelaku lokal kurang terlihat</strong>
                  <span>
                    Potensi lokal belum menjangkau pasar secara optimal.
                  </span>
                </div>
              </div>

            </div>

          </div>

        </div>
      </section>


      {/* ================= SOLUTION ================= */}
      <section className="nj-solution-section">
        <div className="nj-container">

          <div className="nj-solution-header">
            <span className="nj-label">SOLUSI</span>

            <h2>
              Satu tempat untuk
              <span>menemukan pengalaman lokal.</span>
            </h2>

            <p>
              NUSAJOY menghubungkan wisatawan dengan destinasi dan pelaku
              lokal melalui pengalaman yang lebih relevan dan personal.
            </p>
          </div>

          <div className="nj-experience-grid">

            {experiences.map((item) => {
              const Icon = item.icon

              return (
                <Link
                  to={item.link}
                  key={item.title}
                  className="nj-experience-card"
                >
                  <div className="nj-experience-icon">
                    <Icon size={22} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.description}</p>

                  <span>
                    Lihat pengalaman
                    <ArrowRight size={15} />
                  </span>
                </Link>
              )
            })}

          </div>

        </div>
      </section>


      {/* ================= HOW IT WORKS ================= */}
      <section className="nj-how-section">

        <div className="nj-container">

          <div className="nj-how-header">

            <div>
              <span className="nj-label">CARA KERJA NUSAJOY</span>

              <h2>
                Dari mencari pengalaman
                <span>hingga siap berangkat.</span>
              </h2>
            </div>

            <p>
              Empat langkah sederhana untuk membuat perjalanan lebih mudah,
              personal, dan terhubung dengan potensi lokal.
            </p>

          </div>


          <div className="nj-process">

            {processSteps.map((step) => {
              const Icon = step.icon

              return (
                <article
                  className="nj-process-item"
                  key={step.number}
                >

                  <div className="nj-process-top">

                    <span>{step.number}</span>

                    <div className="nj-process-icon">
                      <Icon size={19} />
                    </div>

                  </div>

                  <div className="nj-process-title">
                    <h3>{step.title}</h3>
                    <span>{step.subtitle}</span>
                  </div>

                  <p>{step.description}</p>

                </article>
              )
            })}

          </div>

          <div className="nj-flow-line">
            <span>DISCOVER</span>
            <ArrowRight size={15} />
            <span>MATCH</span>
            <ArrowRight size={15} />
            <span>PLAN</span>
            <ArrowRight size={15} />
            <span>BOOK</span>
          </div>

        </div>
      </section>


      {/* ================= DESTINATIONS ================= */}
      <section className="nj-destinations-section">
        <div className="nj-container">

          <div className="nj-section-header between">

            <div>
              <span className="nj-label">EXPLORE</span>
              <h2>Inspirasi perjalanan lokal.</h2>
            </div>

            <Link to="/explore" className="nj-link-more">
              Lihat Semua
              <ArrowRight size={16} />
            </Link>

          </div>


          <div className="nj-destinations-grid">

            {popularDestinations.map((item) => (
              <article
                key={item.id}
                className="nj-dest-card"
              >

                <div className="nj-dest-image">

                  <img
                    src={item.image}
                    alt={item.title}
                  />

                  <span className="nj-dest-badge">
                    {item.category}
                  </span>

                  <div className="nj-dest-overlay">
                    <span>
                      <MapPin size={12} />
                      {item.location}
                    </span>
                  </div>

                </div>

                <div className="nj-dest-body">

                  <div className="nj-dest-meta">

                    <span className="nj-dest-rating">
                      <Star
                        size={13}
                        fill="#f59e0b"
                        color="#f59e0b"
                      />
                      {item.rating}
                    </span>

                    <span>
                      {item.reviews} ulasan
                    </span>

                  </div>

                  <h3>{item.title}</h3>

                  <Link
                    to={`/destination/${item.id}`}
                    className="nj-dest-link"
                  >
                    Jelajahi destinasi
                    <ChevronRight size={15} />
                  </Link>

                </div>

              </article>
            ))}

          </div>

        </div>
      </section>


      {/* ================= PLAN ================= */}
      <section className="nj-plan-section">
        <div className="nj-container">

          <div className="nj-plan-card">

            <div className="nj-plan-visual">

              <div className="nj-plan-orbit orbit-a" />
              <div className="nj-plan-orbit orbit-b" />

              <div className="nj-plan-center">
                <Route size={32} />
                <strong>PLAN</strong>
              </div>

              <div className="nj-plan-mini mini-one">
                <MapPin size={14} />
                <span>Destination</span>
              </div>

              <div className="nj-plan-mini mini-two">
                <Wallet size={14} />
                <span>Budget</span>
              </div>

              <div className="nj-plan-mini mini-three">
                <CalendarDays size={14} />
                <span>Duration</span>
              </div>

            </div>


            <div className="nj-plan-content">

              <span className="nj-label">
                MINI ITINERARY
              </span>

              <h2>
                Tidak hanya menemukan tempat.
                <span>Rencanakan perjalananmu.</span>
              </h2>

              <p>
                Setelah menemukan pengalaman yang sesuai, NUSAJOY membantu
                mengubah pilihan tersebut menjadi rencana perjalanan yang
                lebih mudah diikuti.
              </p>

              <div className="nj-plan-checks">

                <div>
                  <CheckCircle2 size={17} />
                  <span>Sesuai durasi perjalanan</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Menyesuaikan budget</span>
                </div>

                <div>
                  <CheckCircle2 size={17} />
                  <span>Berbasis minat dan lokasi</span>
                </div>

              </div>

              <Link
                to="/recommendation"
                className="nj-plan-button"
              >
                Coba Rekomendasi
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* ================= IMPACT ================= */}
      <section className="nj-impact-section">
        <div className="nj-container">

          <div className="nj-section-intro">
            <span className="nj-label">DAMPAK NUSAJOY</span>

            <h2>
              Perjalanan yang lebih baik
              <span>untuk dua sisi.</span>
            </h2>

            <p>
              NUSAJOY tidak hanya membantu wisatawan menemukan pengalaman.
              Kami juga membuka ruang bagi potensi lokal untuk ditemukan.
            </p>
          </div>


          <div className="nj-impact-grid">

            {impactPoints.map((item) => {
              const Icon = item.icon

              return (
                <article
                  className="nj-impact-card"
                  key={item.title}
                >

                  <div className="nj-impact-icon">
                    <Icon size={21} />
                  </div>

                  <h3>{item.title}</h3>

                  <p>{item.text}</p>

                </article>
              )
            })}

          </div>

        </div>
      </section>


      {/* ================= LOCAL ECOSYSTEM ================= */}
      <section className="nj-local-section">
        <div className="nj-container">

          <div className="nj-local-card">

            <div className="nj-local-icon">
              <Users size={25} />
            </div>

            <div className="nj-local-content">

              <span className="nj-label">
                LOCAL ECOSYSTEM
              </span>

              <h2>
                Setiap perjalanan bisa
                <span>menghidupkan potensi lokal.</span>
              </h2>

              <p>
                Dari pemandu lokal hingga UMKM dan penyedia pengalaman,
                NUSAJOY membantu mempertemukan mereka dengan wisatawan
                yang sedang mencari sesuatu yang lebih autentik.
              </p>

            </div>

            <div className="nj-local-actions">

              <Link
                to="/tour-guide"
                className="nj-local-link"
              >
                Temukan Pemandu
                <ArrowRight size={16} />
              </Link>

              <Link
                to="/local-business"
                className="nj-local-link secondary"
              >
                Lihat Pelaku Lokal
                <ArrowRight size={16} />
              </Link>

            </div>

          </div>

        </div>
      </section>


      {/* ================= FINAL CTA ================= */}
      <section className="nj-final-section">

        <div className="nj-container">

          <div className="nj-final">

            <div className="nj-final-content">

              <span>YOUR NEXT LOCAL EXPERIENCE</span>

              <h2>
                Perjalananmu dimulai
                <strong>dari sini.</strong>
              </h2>

              <p>
                Temukan tempat baru, pengalaman lokal, dan perjalanan
                yang lebih sesuai dengan caramu menikmati Indonesia.
              </p>

              <div className="nj-final-actions">

                <Link
                  to="/explore"
                  className="nj-final-button"
                >
                  <span>Mulai Eksplorasi</span>
                  <ChevronRight size={16} />
                </Link>

                <Link
                  to="/recommendation"
                  className="nj-final-secondary"
                >
                  Cari Rekomendasi
                </Link>

              </div>

            </div>

            <div
              className="nj-final-icon"
              aria-hidden="true"
            >
              <Compass size={150} />
            </div>

          </div>

        </div>

      </section>

    </main>
  )
}

export default Home