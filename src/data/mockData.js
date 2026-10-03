/**
 * @file src/data/mockData.js
 * NuSaJoy Curated Indonesian Cultural Dataset (Pure JavaScript)
 * 
 * Mengacu pada Design System NuSaJoy:
 * Warna: Deep Nusa Green #174D36, Warm Sand Beige #F4EED8, Olive Gold #C69A3A,
 * Terracotta Clay #B5653A, Sage Mist #8FA88C.
 */

export const EXPERIENCES_DATA = [
  {
    id: 'exp-1',
    title: 'Napak Tilas Gang Keraton Mataram & Kopi Rempah',
    city: 'Yogyakarta',
    location: 'Kotagede, DI Yogyakarta',
    category: 'Walking Tour',
    badgeText: 'Paling Dicari',
    matchScore: 98,
    rating: 4.96,
    reviewCount: 142,
    durationHours: 3.5,
    durationText: '3.5 Jam',
    maxGuests: 6,
    price: 95000,
    priceFormatted: 'Rp95.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmgFp__kvQXjBG62woUEU3mqksY3YEETc_Pc96rjEDO1-5Vp_NexsBmtfWSSdFyhoGjsj07J9UjAEy-0A6JE3oCujqpC_O3ejVKVa4FK7DwDDKvxQQb80cLIvMNCu0-BQB7O40EM0CmenrJkEP1IcgAKTRywARuiN7M_Mb5aJfzYr77IkMLFwJKp58JfHe5Bn_LIEoxA-m8LttbC7E7xKRqNkP8f0U49BToqbCwNqnp2I6WR09VSQk6Q',
    description: 'Menyusuri lorong gang rahasia 400 tahun, mencicipi kipo legendaris, dan meracik wedang rempah hangat bersama keluarga lokal.',
    highlights: [
      'Menjelajahi arsitektur benteng Mataram Kuno yang tersembunyi dari jalan raya',
      'Mencicipi kue kipo langsung dari tungku arang generasi ketiga Bu Djito',
      'Workshop meracik wedang uwuh dan kopi rempah tradisional dengan resep keraton',
      'Percakapan santai dengan sesepuh paguyuban perak Kotagede'
    ],
    meetingPoint: 'Depan Masjid Gedhe Mataram Kotagede (Gapura Pintu Masuk Timur)',
    included: ['Pemandu lokal pencerita', 'Cicipan kue kipo 3 varian', 'Secangkir kopi rempah hangat', 'Donasi pemeliharaan cagar budaya'],
    guide: {
      id: 'guide-sekar',
      name: 'Sekar Kinanthi',
      role: 'Pencerita Sejarah & Arsitek Tradisi',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9oUqRNvX6jDrP1iMl3I1kvWeBtOXB0AuA227Lvk8sZkuSRF4XmeNMe4UAHv3POcSoJUxiIwUfAwdpfi4JuVocawUbdaMGGpdUSbThlt6oorvhjPkQnLIoh5Q2Q1TIKv3sj642q3aePV6AboUL9gg3jXlTcBxruzL0IFm4nn4c266ygNMV8FbXjru1HEoBSRP1x5BGymQi8LHyF18ZY8KrL8TBIWuaN98MM3iZU4vMg0QpYZY9P1_Abg',
      experience: '7 tahun mendampingi pelancong budaya',
      rating: 4.98,
      tripsCount: 280,
      languages: ['Bahasa Indonesia', 'Jawa Alus', 'English'],
      license: 'Lisensi Pemandu Budaya DIY No. 42/BDY/2023',
    }
  },
  {
    id: 'exp-2',
    title: 'Petik Sayur Desa Sidemen & Dapur Tradisi',
    city: 'Bali',
    location: 'Sidemen, Karangasem, Bali',
    category: 'Kuliner Tradisi',
    badgeText: 'Pilihan Warga',
    matchScore: 97,
    rating: 4.98,
    reviewCount: 96,
    durationHours: 4,
    durationText: '4 Jam',
    maxGuests: 6,
    price: 185000,
    priceFormatted: 'Rp185.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdjLXlKup8401dQ_UsI2bYPZMC3oYK9tODrZDGioicVSnltHfFZpjMfP8mYMHuPgP-pqKT9JIfV0dBXFdBkiZY06MDhVFxYYCgED-cPaBx2vIyRhTu2zM91MeTrIF9FK210SI39JbQXeNvT1mDMVN7_Z-mal2BSF8VGH9GYdwAtbH_CE458wWUaEPAah30FuA3itO3pIesXe0687HhMK_6qadBpKOwMHzOgQVzeG0Ni2inI-o4MEc-5g',
    description: 'Jalan pagi melintasi subak padi organik, memanen bumbu segar, dan memasak bersama Ni Wayan di pawon dapur tanah liat.',
    highlights: [
      'Menelusuri jalur subak persawahan lembah Gunung Agung tanpa kerumunan',
      'Mengenal tanaman obat keluarga (loloh) dan memetik cabai serta jahe langsung',
      'Membuat base genep (bumbu 9 rasa) di atas cobek batu vulkanik tradisional',
      'Makan siang prasmanan beralaskan daun pisang di bale bengong persawahan'
    ],
    meetingPoint: 'Bale Banjar Tabola, Desa Sidemen, Karangasem',
    included: ['Panen sayur organik', 'Bahan masakan lengkap', 'Makan siang tradisi', 'Jus loloh cemcem dingin'],
    guide: {
      id: 'guide-ketut',
      name: 'I Ketut Suweta',
      role: 'Pekaseh Muda Subak & Pegiat Pangan Alami',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB74vH_YlJdU4f-RPnv-GqRlN1288eeKAveIaXh1xPsuws7S23lya49IAG5tAOI0YmLf40gEvIZpHQkfhlOUY7mFM7K8ILIcdPLxZXVq_h2mNTO_aKHxln9hpSjIHofUAef4jGR-YJPFRzJi-L1WGejQHOL8vUnLHjNrwfcCf2AoGwlK8PWxKKFwNWmWJtXG9ptUzOU9Oq_wr9iN95ydIsIJZ14q_sdK7XpkrFIQ_Ftl46sMfcTrUQLWA',
      experience: '5 tahun melestarikan tradisi pangan Subak',
      rating: 4.97,
      tripsCount: 195,
      languages: ['Bahasa Indonesia', 'Basa Bali', 'English'],
      license: 'Pemandu Agrowisata Bali No. 18/AGR/2022',
    }
  },
  {
    id: 'exp-3',
    title: 'Sunrise Kebun Teh Malabar & Nasi Liwet',
    city: 'Bandung',
    location: 'Pangalengan, Kabupaten Bandung',
    category: 'Wisata Teduh',
    badgeText: 'Tenang & Asri',
    matchScore: 95,
    rating: 4.92,
    reviewCount: 118,
    durationHours: 5,
    durationText: '5 Jam',
    maxGuests: 8,
    price: 135000,
    priceFormatted: 'Rp135.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmDwIKPUz5sMRiKQ6Vmz3NgHBmI7CGrCi7zAywd0PQ9huiP0LMus6LKaDTwPzPXO_sLzbqSsp_htRz4eqnn8nXvXl8LPmQvZA4f9ehl7F66GxDmHmygp9KIBlIHNrCm8q8QxLLj-aIcGLkhnyAHICp0O25NrQoEbMmGNr7MH9rm3LDhXIuMckpKbhFZ-DV26CaYaJbJ-OGL4674nakH0s6iGtYmd3OfYr-fM8Sb80MdjlRgsLc4U4d9g',
    description: 'Menyaksikan kabut pagi perlahan terangkat dari perbukitan Malabar bersama pemetik teh veteran dan sarapan hangat di saung warga.',
    highlights: [
      'Menikmati golden sunrise berkabut di ketinggian 1.550 mdpl perbukitan teh',
      'Belajar teknik memetik pucuk teh pekoe terbaik bersama Ibu Entin (pemetik 30 tahun)',
      'Menyesap teh putih (white tea) murni racikan pabrik peninggalan Karel Bosscha',
      'Sarapan nasi liwet kastrol hangat dengan sambal terasi bakar dan lalapan segar'
    ],
    meetingPoint: 'Gerbang Perkebunan Teh Malabar (Depan Wisma Bosscha)',
    included: ['Pemandu lokal Pangalengan', 'Cicipan teh artisan 3 seduhan', 'Sarapan nasi liwet komplit', 'Peminjaman caping anyaman'],
    guide: {
      id: 'guide-asep',
      name: 'Kang Asep Ridwan',
      role: 'Ranger Gunung Puntang & Pemandu Teh Malabar',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTUBnmGDKlpMNlivbKfBqAoenkCHxgnH0BZS_GuV5CWPT8EPQoz2GeOoZxVrU3Tt4KDqwF8eIKkkmJI4r5P7V9w9F0DDUmQ6LLzndNvDBkumIYh1uYcsVClpkJzpPtzEzSAQF133PNuVLnRcVu9yOKXgpyxsQ--cxzYSkKlFsaFE12dK9CtReGzS7qpei2gtesWE4gmKE73fotcXsnac2Q8F0dcupnPSi1rXc-YipHWoJbsaaU2pqL3Q',
      experience: '8 tahun mengawal rute alam Priangan',
      rating: 4.95,
      tripsCount: 310,
      languages: ['Bahasa Indonesia', 'Basa Sunda', 'English'],
      license: 'HPI Jawa Barat No. 09/HPI/2021',
    }
  },
  {
    id: 'exp-4',
    title: 'Sentuhan Tanah Liat Kasongan & Kisah Gerabah Warga',
    city: 'Yogyakarta',
    location: 'Kasongan, Bantul, DI Yogyakarta',
    category: 'Lokakarya Kriya',
    badgeText: 'Kriya Warga',
    matchScore: 93,
    rating: 4.91,
    reviewCount: 77,
    durationHours: 3,
    durationText: '3 Jam',
    maxGuests: 5,
    price: 110000,
    priceFormatted: 'Rp110.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9MWBl1vbQhBHOeFU8tCIdMexa_eAN7N4sM5uTp-PWSt1iwwV5-SLhiQeISKcWzcpeAdzzGncYWXRGREALnNWjz75P8rq1_OdVJQB4tMZjZKIVhxPHSkMHRKGjzE4qWlXHj3Kf3QSG5PtWXatvlPiQ7ycmqrvzTBV6h9m4KeAIMVm85rZqcu1RMVfwN2BjGwUB3uVXL-ZnN6wx14UcZf0HuQXi3_74sv9dXLt-vc_cImONj5FOimAQbA',
    description: 'Mencoba teknik putar tangan di studio perajin gerabah tertua, membentuk cangkir keramikmu sendiri untuk dibawa pulang.',
    highlights: [
      'Mengenal jenis tanah lempung asli bantaran Sungai Bedog',
      'Praktik membentuk cangkir di atas meja putar manual tradisional',
      'Teknik pembakaran sekam padi yang menghasilkan corak terakota alami',
      'Hasil karyamu dikeringkan dan dapat dikirim ke rumah'
    ],
    meetingPoint: 'Studio Kriya Tembi-Kasongan Barat, Bantul',
    included: ['Bahan tanah liat tak terbatas', 'Bimbingan maestro gerabah', 'Kemasan pengaman karya', 'Teh poci gula batu'],
    guide: {
      id: 'guide-sekar',
      name: 'Sekar Kinanthi',
      role: 'Pencerita Sejarah & Arsitek Tradisi',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9oUqRNvX6jDrP1iMl3I1kvWeBtOXB0AuA227Lvk8sZkuSRF4XmeNMe4UAHv3POcSoJUxiIwUfAwdpfi4JuVocawUbdaMGGpdUSbThlt6oorvhjPkQnLIoh5Q2Q1TIKv3sj642q3aePV6AboUL9gg3jXlTcBxruzL0IFm4nn4c266ygNMV8FbXjru1HEoBSRP1x5BGymQi8LHyF18ZY8KrL8TBIWuaN98MM3iZU4vMg0QpYZY9P1_Abg',
      experience: '7 tahun mendampingi pelancong budaya',
      rating: 4.98,
      tripsCount: 280,
      languages: ['Bahasa Indonesia', 'Jawa Alus', 'English'],
      license: 'Lisensi Pemandu Budaya DIY No. 42/BDY/2023',
    }
  },
  {
    id: 'exp-5',
    title: 'Tenun Songket Sasak & Filosofi Desa Adat Sade',
    city: 'Lombok',
    location: 'Rambitan, Pujut, Lombok Tengah',
    category: 'Lokakarya Kriya',
    badgeText: 'Autentik',
    matchScore: 96,
    rating: 4.95,
    reviewCount: 164,
    durationHours: 3.5,
    durationText: '3.5 Jam',
    maxGuests: 6,
    price: 125000,
    priceFormatted: 'Rp125.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3RO7K5ysk-mHpF8liFCdOj6y8ZdxucUKhq2uFeK0mpOHUf0qh-DXo2x32wefb5OEobQ-AEwQx5GrK1ovIpy8_WrnLGB-0RoXhYm8Spr1DFmmubEB1qDjA1J_DOMSegAEsILD1YqvuP4exur3YoIC85rlKOyXmLs4LkQ-O_S6bxq159jTWqm5D0vvvdZcwk55vtR8nr575dPJywGZNU4hpN5TUFFfQlDZPtQadR7yMxmtIuIuXo6SSQ',
    description: 'Duduk bersama ibu-ibu penenun kain songket Sasak, belajar memintal kapas alami dan mendengar falsafah bale tani.',
    highlights: [
      'Memahami proses pembuatan benang dari kapas pohon randu lokal',
      'Mencoba alat tenun tradisional kayu tanpa jarum modern',
      'Melihat arsitektur tahan gempa bale tani dan lantai berbahan alami',
      'Diskusi budaya santai di teras lumbung desa bersama tetua adat'
    ],
    meetingPoint: 'Pintu Gerbang Desa Wisata Sade, Lombok Tengah',
    included: ['Pemandu warga adat generasi ke-3', 'Belajar pintal benang & tenun', 'Selendang tenun mini suvenir', 'Donasi kas desa'],
    guide: {
      id: 'guide-amaq',
      name: 'Amaq Sinar',
      role: 'Tetua Adat Sade & Pencerita Sasak Generasi ke-3',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTUBnmGDKlpMNlivbKfBqAoenkCHxgnH0BZS_GuV5CWPT8EPQoz2GeOoZxVrU3Tt4KDqwF8eIKkkmJI4r5P7V9w9F0DDUmQ6LLzndNvDBkumIYh1uYcsVClpkJzpPtzEzSAQF133PNuVLnRcVu9yOKXgpyxsQ--cxzYSkKlFsaFE12dK9CtReGzS7qpei2gtesWE4gmKE73fotcXsnac2Q8F0dcupnPSi1rXc-YipHWoJbsaaU2pqL3Q',
      experience: '12 tahun memandu tur budaya Sade',
      rating: 4.96,
      tripsCount: 420,
      languages: ['Bahasa Indonesia', 'Basa Sasak', 'English'],
      license: 'Pemandu Cagar Budaya NTB No. 05/CGB/2019',
    }
  },
  {
    id: 'exp-6',
    title: 'Lorong Kolonial Kota Lama & Cerita Rempah Semarang',
    city: 'Semarang',
    location: 'Kota Lama, Semarang, Jawa Tengah',
    category: 'Walking Tour',
    badgeText: 'Sejarah Hidup',
    matchScore: 92,
    rating: 4.89,
    reviewCount: 88,
    durationHours: 3,
    durationText: '3 Jam',
    maxGuests: 8,
    price: 85000,
    priceFormatted: 'Rp85.000',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAD5pN2P4hOYbxMfUHcQm6l9gx7X6zO_mpLllgrSLaSqxx_Fd46I4cKsrxnrR4zhln-WOESndlX5qNAKMPe6ihdj7E7cXYpGJEfoPP7ToaMxDvgO25TIfYvMrtKyGjG5kDNERQD5AmlHQaRt_l3C7wcxTA39Jy6pU8OeaJo8n2gOSdC1_OG1xK7xCWzI7KzhacYItMv_GRQK73cydsryOKoZUCsXD4m6DU83CGeu6ndQt5mSLJ-2xfqUA',
    description: 'Menelusuri sudut tersembunyi kota benteng abad ke-18, gudang tembakau tua, dan menikmati lumpia legendaris Gang Lombok.',
    highlights: [
      'Melihat arsip foto masa lalu Semarang sebelum dipugar',
      'Masuk ke halaman dalam gudang rempah VOC yang jarang dibuka',
      'Mencicipi lumpia basah asli rebung muda resep turun temurun',
      'Narasi mendalam tanpa glorifikasi penjajahan, fokus pada perjuangan warga'
    ],
    meetingPoint: 'Taman Srigunting (Samping Gereja Blenduk Kota Lama)',
    included: ['Pemandu sejarawan muda', '1 porsi lumpia basah legendaris', 'Buku panduan saku rute cagar budaya', 'Air minum kendi tanah liat'],
    guide: {
      id: 'guide-danang',
      name: 'Danang Prasetya',
      role: 'Peneliti Sejarah Urban & Pengarsip Narasi Lisan',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB74vH_YlJdU4f-RPnv-GqRlN1288eeKAveIaXh1xPsuws7S23lya49IAG5tAOI0YmLf40gEvIZpHQkfhlOUY7mFM7K8ILIcdPLxZXVq_h2mNTO_aKHxln9hpSjIHofUAef4jGR-YJPFRzJi-L1WGejQHOL8vUnLHjNrwfcCf2AoGwlK8PWxKKFwNWmWJtXG9ptUzOU9Oq_wr9iN95ydIsIJZ14q_sdK7XpkrFIQ_Ftl46sMfcTrUQLWA',
      experience: '6 tahun mengampu Komunitas Sejarah Semarang',
      rating: 4.93,
      tripsCount: 215,
      languages: ['Bahasa Indonesia', 'Jawa', 'English'],
      license: 'HPI Jawa Tengah No. 22/SMG/2022',
    }
  }
];

export const GUIDES_DATA = [
  {
    id: 'guide-sekar',
    name: 'Sekar Kinanthi',
    city: 'Yogyakarta',
    location: 'Kotagede & Imogiri',
    role: 'Pencerita Sejarah & Arsitek Tradisi',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC9oUqRNvX6jDrP1iMl3I1kvWeBtOXB0AuA227Lvk8sZkuSRF4XmeNMe4UAHv3POcSoJUxiIwUfAwdpfi4JuVocawUbdaMGGpdUSbThlt6oorvhjPkQnLIoh5Q2Q1TIKv3sj642q3aePV6AboUL9gg3jXlTcBxruzL0IFm4nn4c266ygNMV8FbXjru1HEoBSRP1x5BGymQi8LHyF18ZY8KrL8TBIWuaN98MM3iZU4vMg0QpYZY9P1_Abg',
    rating: 4.98,
    reviewCount: 142,
    tripsCount: 280,
    pricePerDay: 250000,
    priceFormatted: 'Rp250.000 / hari',
    specialties: ['Sejarah Mataram', 'Batik Tulis Alami', 'Kuliner Lawasan', 'Arsitektur Joglo'],
    bio: 'Lahir dan besar di lorong gang Kotagede. Sekar mendedikasikan 7 tahun terakhir untuk merawat narasi lisan warga, membantu pelancong melihat Jogja melampaui Malioboro.',
    license: 'Lisensi Pemandu Budaya DIY No. 42/BDY/2023',
    ethicsVerified: true,
  },
  {
    id: 'guide-ketut',
    name: 'I Ketut Suweta',
    city: 'Bali',
    location: 'Sidemen & Karangasem',
    role: 'Pekaseh Muda Subak & Pegiat Pangan Alami',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB74vH_YlJdU4f-RPnv-GqRlN1288eeKAveIaXh1xPsuws7S23lya49IAG5tAOI0YmLf40gEvIZpHQkfhlOUY7mFM7K8ILIcdPLxZXVq_h2mNTO_aKHxln9hpSjIHofUAef4jGR-YJPFRzJi-L1WGejQHOL8vUnLHjNrwfcCf2AoGwlK8PWxKKFwNWmWJtXG9ptUzOU9Oq_wr9iN95ydIsIJZ14q_sdK7XpkrFIQ_Ftl46sMfcTrUQLWA',
    rating: 4.97,
    reviewCount: 96,
    tripsCount: 195,
    pricePerDay: 300000,
    priceFormatted: 'Rp300.000 / hari',
    specialties: ['Sistem Subak', 'Dapur Tradisi Pawon', 'Tenun Endek', 'Jalur Trekking Sawah'],
    bio: 'Pekaseh (pengatur air subak) yang gemar berbagi pengetahuan kearifan lokal Bali Timur. Bersama Ketut, kamu akan diajak makan bersama warga dan menikmati keheningan desa.',
    license: 'Pemandu Agrowisata Bali No. 18/AGR/2022',
    ethicsVerified: true,
  },
  {
    id: 'guide-asep',
    name: 'Kang Asep Ridwan',
    city: 'Bandung',
    location: 'Pangalengan & Ciwidey',
    role: 'Ranger Gunung Puntang & Pemandu Teh Malabar',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBTUBnmGDKlpMNlivbKfBqAoenkCHxgnH0BZS_GuV5CWPT8EPQoz2GeOoZxVrU3Tt4KDqwF8eIKkkmJI4r5P7V9w9F0DDUmQ6LLzndNvDBkumIYh1uYcsVClpkJzpPtzEzSAQF133PNuVLnRcVu9yOKXgpyxsQ--cxzYSkKlFsaFE12dK9CtReGzS7qpei2gtesWE4gmKE73fotcXsnac2Q8F0dcupnPSi1rXc-YipHWoJbsaaU2pqL3Q',
    rating: 4.95,
    reviewCount: 118,
    tripsCount: 310,
    pricePerDay: 275000,
    priceFormatted: 'Rp275.000 / hari',
    specialties: ['Kebun Teh Kuno', 'Sejarah Radio Malabar', 'Kopi Arabika Puntang', 'Jalur Kabut'],
    bio: 'Mengetahui setiap jengkal jalur perbukitan Malabar dan Puntang. Kang Asep mahir menceritakan sejarah era kolonial Bosscha dengan sudut pandang pelestarian alam Priangan.',
    license: 'HPI Jawa Barat No. 09/HPI/2021',
    ethicsVerified: true,
  }
];

export const STAYS_DATA = [
  {
    id: 'stay-1',
    name: 'Omah Kecebong Heritage Homestay',
    city: 'Yogyakarta',
    location: 'Cebongan, Mlati, Sleman',
    category: 'Homestay Budaya',
    pricePerNight: 350000,
    priceFormatted: 'Rp350.000 / malam',
    rating: 4.93,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBAMXwacoDteIDtfPnNAk304y9vMAvb6lNA8i1v3iCO4NZ_XLC_7MaC8AuEkgoQL1ICBprJJsM0gNm1udE5yyW8aKoBes9ZoWpex470TuEk0HL1KsvUfGVOV9kTEMWxfZ3v4yibgg-uSt9GBM1bqbJ4P_0p49hdL6-d5Bpwy0uNP3zY8kKmFPCGHYm34KGLTj8MDVSPFVAFDVkQ1n9njSXCvvpGBRr8bOX7KSa-2DnUeBk66LRjxyviGA',
    description: 'Rumah kayu limasan peninggalan 1920 yang dikelilingi kolam teratai dan sawah hijau. Sarapan bubur gudeg pawon khas pedesaan.',
    amenities: ['Wi-Fi Cepat', 'Sarapan Pawon Tradisional', 'Sepeda Keliling Desa', 'Air Panas'],
    host: 'Pak Bagus (Warga Cebongan)'
  },
  {
    id: 'stay-2',
    name: 'Bale Tenun Homestay Sidemen',
    city: 'Bali',
    location: 'Tabola, Sidemen, Karangasem',
    category: 'Eco Lodge Desa',
    pricePerNight: 420000,
    priceFormatted: 'Rp420.000 / malam',
    rating: 4.96,
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDdjLXlKup8401dQ_UsI2bYPZMC3oYK9tODrZDGioicVSnltHfFZpjMfP8mYMHuPgP-pqKT9JIfV0dBXFdBkiZY06MDhVFxYYCgED-cPaBx2vIyRhTu2zM91MeTrIF9FK210SI39JbQXeNvT1mDMVN7_Z-mal2BSF8VGH9GYdwAtbH_CE458wWUaEPAah30FuA3itO3pIesXe0687HhMK_6qadBpKOwMHzOgQVzeG0Ni2inI-o4MEc-5g',
    description: 'Bale bambu alami menghadap panorama terasering sawah dan Gunung Agung. Dikelola langsung oleh kelompok penenun tenun ikat desa.',
    amenities: ['Pemandangan Sawah 360°', 'Sarapan Masakan Ni Wayan', 'Teh Herbal Kebun Sendiri', 'Bebas Plastik'],
    host: 'Ibu Kadek (Koperasi Tenun Sidemen)'
  }
];

export const TRANSPORTS_DATA = [
  {
    id: 'trans-1',
    name: 'Becak Listrik Ramah Lingkungan Heritage',
    city: 'Yogyakarta',
    type: 'Transportasi Lokal',
    pricePerTrip: 45000,
    priceFormatted: 'Rp45.000 / rute 4km',
    rating: 4.94,
    description: 'Becak kayuh bertenaga baterai surya karya paguyuban mekanik muda Yogyakarta. Nyaman menyusuri gang sempit Kotagede tanpa polusi suara.',
    driver: 'Pak Marto (Paguyuban Becak Listrik Mataram)'
  },
  {
    id: 'trans-2',
    name: 'Sewa Sepeda Onthel Klasik & Peta Rute Desa',
    city: 'Yogyakarta',
    type: 'Sepeda Wisata',
    pricePerTrip: 35000,
    priceFormatted: 'Rp35.000 / seharian',
    rating: 4.88,
    description: 'Sepeda onthel lawas terawat dengan keranjang rotan, bel kuningan nyaring, dan peta cetak spot hidden gem dari warga.',
    driver: 'Paguyuban Onthel Podjok'
  }
];

export const LOCAL_BUSINESSES = [
  {
    id: 'biz-1',
    name: 'Kipo Legendaris Bu Djito',
    category: 'Kuliner Pusaka',
    location: 'Kotagede, Yogyakarta',
    story: 'Kue kipo berbahan ketan hijau pandan dan kelapa gula jawa, resep yang sempat hampir punah sebelum dirawat oleh keluarga Bu Djito sejak 1946.',
    impact: '100% bahan baku berasal dari petani kelapa dan beras ketan Kulon Progo.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUWFWSR5P5TmtHMUM1BpTRVcgvgofel8x64EOb0MqaEXyQrB6_KINZjw2iHn26wNkgLjb1lAhiDcL4iYNW_9rllx0jbMSxUd6vRpkV05DwbV9hJcIbWGkhnyOOgPxy9tqHpQkwnYayc3iEi-mkWIO0QqKExkUCT-zcRV5NBL3EX-MLxHepBCQCgC3_cknvf6ZXC5DpEnGO4RFlxB1rPMLe3lh9pTJkbFr0uANTLLwGeWI4xl6lPyc8vQ'
  },
  {
    id: 'biz-2',
    name: 'Sanggar Tenun Pucuk Wangi Sidemen',
    category: 'Kriya Warga',
    location: 'Sidemen, Bali',
    story: 'Kelompok 28 ibu-ibu penenun pewarna alami (daun mangga, mengkudu, tarum). Menjual karya langsung ke pelancong tanpa potongan distributor.',
    impact: 'Memberdayakan ekonomi keluarga petani saat musim jeda tanam padi.',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAS3RO7K5ysk-mHpF8liFCdOj6y8ZdxucUKhq2uFeK0mpOHUf0qh-DXo2x32wefb5OEobQ-AEwQx5GrK1ovIpy8_WrnLGB-0RoXhYm8Spr1DFmmubEB1qDjA1J_DOMSegAEsILD1YqvuP4exur3YoIC85rlKOyXmLs4LkQ-O_S6bxq159jTWqm5D0vvvdZcwk55vtR8nr575dPJywGZNU4hpN5TUFFfQlDZPtQadR7yMxmtIuIuXo6SSQ'
  }
];

export const INITIAL_TRIP = {
  id: 'trip-jogja-1',
  title: 'Menyusuri Jiwa Kuno Kotagede & Bantul',
  city: 'Yogyakarta',
  dates: '28 Sep - 30 Sep 2026',
  totalDays: 2,
  items: [
    {
      id: 'item-1',
      day: 1,
      time: '08:30 - 12:00',
      title: 'Napak Tilas Gang Keraton Mataram & Kopi Rempah',
      category: 'Walking Tour',
      location: 'Kotagede, Yogyakarta',
      price: 95000,
      guideName: 'Sekar Kinanthi',
      transportTip: '12 menit dengan becak listrik dari titik awal',
      isNew: false,
    },
    {
      id: 'item-2',
      day: 1,
      time: '13:30 - 16:30',
      title: 'Sentuhan Tanah Liat Kasongan & Kisah Gerabah Warga',
      category: 'Lokakarya Kriya',
      location: 'Kasongan, Bantul',
      price: 110000,
      guideName: 'Sekar Kinanthi',
      transportTip: '20 menit berkendara santai menyusuri Ringroad Selatan',
      isNew: false,
    },
    {
      id: 'item-3',
      day: 2,
      time: '09:00 - 11:30',
      title: 'Kipo Legendaris & Kopi Pawon Tradisi Mbah Marto',
      category: 'Kuliner Tradisi',
      location: 'Sewon, Bantul',
      price: 65000,
      guideName: 'Pemandu Kuliner Warga',
      transportTip: '15 menit dengan sepeda santai melintasi pematang sawah',
      isNew: false,
    }
  ],
  budget: {
    experiences: 270000,
    guides: 250000,
    conservationFund: 13000,
    transportEstimate: 80000,
  }
};

export const INITIAL_ORDERS = [
  {
    id: 'ORD-NSJ-8821',
    date: '28 Sep 2026',
    title: 'Napak Tilas Gang Keraton Mataram & Kopi Rempah',
    location: 'Kotagede, Yogyakarta',
    guests: 2,
    totalPrice: 190000,
    status: 'Terkonfirmasi',
    statusBadgeColor: 'bg-secondary-container text-on-secondary-container',
    guideName: 'Sekar Kinanthi',
    guidePhone: '+62 812-3456-7890',
    meetingPoint: 'Depan Masjid Gedhe Mataram Kotagede',
    meetingTime: '08:30 WIB',
    paymentMethod: 'QRIS NuSaJoy',
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'notif-1',
    title: 'Pemandu Sekar Menghubungimu',
    message: 'Halo! Jangan lupa bawa payung lipat kecil untuk rute jalan kaki Kotagede besok pagi ya.',
    time: '15 menit yang lalu',
    read: false,
    type: 'chat',
  },
  {
    id: 'notif-2',
    title: 'Reservasi ORD-NSJ-8821 Terkonfirmasi',
    message: 'Pembayaran QRIS kamu sebesar Rp190.000 telah diverifikasi. Tiket digital siap digunakan.',
    time: '2 jam yang lalu',
    read: false,
    type: 'booking',
  },
  {
    id: 'notif-3',
    title: 'Dana Konservasi Budaya Diteruskan',
    message: '2.5% dari pesananmu telah disalurkan ke Paguyuban Perawatan Cagar Budaya Kotagede.',
    time: '1 hari yang lalu',
    read: true,
    type: 'impact',
  }
];
