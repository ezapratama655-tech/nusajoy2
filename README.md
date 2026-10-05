# NuSaJoy

Aplikasi wisata Indonesia berbasis React 19, Vite, Tailwind CSS, React Router, dan Supabase.

## Menjalankan project

1. Jalankan `npm ci`.
2. Salin `.env.example` ke `.env.local` di root project.
3. Isi `VITE_SUPABASE_URL` dan `VITE_SUPABASE_PUBLISHABLE_KEY` dari Supabase Dashboard. Nama `NEXT_PUBLIC_*` tidak dibaca Vite. Legacy `VITE_SUPABASE_ANON_KEY` masih didukung. Jangan gunakan service-role/secret key di frontend.
4. Jalankan `npm run dev`.

`.env.local` diabaikan Git. Konfigurasi yang sebelumnya berada di `src/env` telah dipindahkan ke konfigurasi root yang dibaca Vite. Hosting harus menyediakan variabel `VITE_*` saat build.

## Pemeriksaan

- `npm run lint`
- `npm test` (regresi favorit, checkout, tarif, penyimpanan per akun, pembayaran gagal/ulang/berhasil, request bersamaan, role dan dashboard mitra)
- `npm run build`
- `npm run preview`

## Autentikasi

Login dan registrasi memakai Supabase Auth. Pemandu dan pemilik bisnis diarahkan ke halaman akun. Role pada user metadata digunakan untuk tampilan, bukan untuk memberikan hak akses database.

Reset password mengirim tautan ke `/reset-password`. Tambahkan URL development dan deployment untuk route tersebut pada Supabase Authentication > URL Configuration > Redirect URLs. Halaman ini memerlukan session yang valid dari tautan recovery. Uji email recovery dengan akun sendiri; pengujian kode tidak membuktikan pengiriman email atau konfigurasi redirect pada project hosted.

Referensi: https://supabase.com/docs/reference/javascript/auth-resetpasswordforemail

## Data dan booking

Destinasi, pemandu, dan usaha lokal dibaca dari Supabase. Pemandu beranda memakai sumber katalog yang sama: `tour_guides` aktif yang belum dikelola dashboard, serta layanan pemandu `partner_listings` yang dipublikasikan dan tidak diarsipkan. Kartu membuka detail dengan ID database; beranda menampilkan loading, error dengan muat ulang, dan hasil kosong tanpa menggantinya dengan pemandu mock. Pengalaman beranda masih memakai data demo. Katalog pemandu hosted memakai `price_per_trip`; UI menghitung tarif tersebut sekali per trip, sedangkan data lama dengan tarif harian tetap didukung.

`public.bookings` sudah diaktifkan melalui `database/guide-bookings.sql`. Pembacaan tanpa login ditolak sesuai grant. Script memakai foreign key ke `tour_guides`, RLS, ownership `auth.uid()`, status awal pending, dan validasi harga per trip pada database. Pengujian booking nyata dengan akun login tetap diperlukan. Dashboard mitra berikut menggunakan reservasi simulasi di tabel terpisah.

Riwayat akun tetap membaca booking pengguna dari database. Checkout baru untuk pemandu, pengalaman, dan My Trip menggunakan pesanan simulasi terpisah; hasil pembayaran demo tidak mengubah booking nyata.

## Simulasi pembayaran

Jalankan `database/demo-payments.sql` di SQL Editor Supabase (boleh dijalankan ulang). Script membuat `demo_orders` dengan label `is_simulation = true`, RLS per pemilik, dan izin update hanya pada kolom status pembayaran. Hasil berhasil bersifat final; harga, owner, dan label simulasi tidak dapat diubah melalui API pengguna. Pengguna lain dan pengunjung tanpa login tidak dapat membaca/menulis tabel.

Alur: **Menunggu pembayaran → Simulasikan gagal → Coba lagi → Simulasikan berhasil → Menunggu konfirmasi mitra**. QRIS dan VA hanya pilihan contoh tanpa kode untuk dibayar. Semua tampilan memberi label **Simulasi — tidak ada transaksi uang**. Reservasi dari layanan yang terhubung ke pemilik muncul pada dashboard mitra setelah SQL dashboard diterapkan. Checkout pengalaman demo dan My Trip tidak memiliki pemilik layanan, sehingga tidak masuk inbox mitra. Dana konservasi My Trip dihitung sekali.

- Login sebelum checkout untuk menyimpan simulasi dan status pembayaran ke Supabase. Riwayat **Akun → Pesanan saya** mengambil status terbaru setelah refresh dan menyediakan tombol untuk melanjutkan simulasi.
- Tanpa login, simulasi pengalaman demo disimpan di browser untuk guest. Reservasi layanan mitra yang dipublikasikan melalui dashboard wajib login. Login tidak memindahkan pesanan guest secara otomatis.
- Jika SQL belum aktif, checkout akun menampilkan error; tidak berpura-pura sudah tersimpan ke Supabase.
- Pengiriman ulang setelah respons jaringan hilang menggunakan ID pesanan yang sama. Dua hasil pembayaran bersamaan tidak boleh saling menimpa.

Trip dan notifikasi disimpan di browser dengan ruang terpisah untuk guest dan setiap ID pengguna. Simulasi akun disinkronkan dari Supabase; data guest dan trip lokal tidak tersinkron antarperangkat. Favorit memakai satu penyimpanan lokal bersama, memigrasikan dua key lama, dan memperbarui halaman/navbar melalui satu event.

## Dashboard pemandu dan bisnis

Jalankan `database/partner-dashboard.sql` di SQL Editor Supabase setelah kedua SQL di atas. Script boleh dijalankan ulang. Kemudian login sebagai pemandu (`pemandu`/`local_guide`) atau pemilik bisnis (`pemilik_bisnis`/`local_business`) dan buka `/account`. Role hanya memilih tampilan; semua akses database dibatasi ID akun melalui RLS.

- Kelola profil dan layanan: buat draf, edit tarif/lokasi/foto/deskripsi, publikasikan ke katalog, arsipkan, lalu pulihkan sebagai draf.
- Atur tanggal, jam, dan kapasitas per hari. Tanpa jadwal, tanggal belum dibatasi. Setelah jadwal pertama dibuat, reservasi hanya diterima pada tanggal tersedia; trip pemandu beberapa hari membutuhkan setiap tanggal tersedia. Konfirmasi memeriksa dan mengunci kapasitas agar reservasi bertabrakan ditolak.
- Reservasi simulasi yang sudah berhasil dibayar dapat dikonfirmasi, dibatalkan, atau ditandai selesai. Status terbaru juga terlihat oleh wisatawan setelah riwayat dimuat ulang. Harga, pemilik, jenis layanan, dan transisi status divalidasi database.
- Ringkasan memakai data akun sendiri. Total yang ditampilkan adalah nilai simulasi selesai, bukan pendapatan atau saldo yang bisa dicairkan.

Pemandu lama dipindahkan ke layanan dashboard hanya jika `tour_guides.user_id` cocok dengan ID yang ada di Supabase Auth. ID pemandu tetap sama; profil yang dikelola dashboard memakai tabel baru agar edit/arsip tidak tertimpa data lama. Usaha lama tanpa relasi owner tidak diklaim melalui nama/email; pemilik membuat layanan baru di dashboard. Booking nyata lama tetap terpisah dari simulasi.

SQL ini belum otomatis diterapkan ke project hosted. Jika tabel belum ada, dashboard menampilkan instruksi aktivasi. Setelah menerapkannya, verifikasi dengan dua akun: mitra membuat dan mempublikasikan layanan, wisatawan membuat serta membayar simulasi, lalu mitra mengonfirmasi. Foto dan kontak hanya dibuka ke katalog jika pemilik memilih publikasi; draf dan inbox reservasi tetap dibatasi RLS.

Pengujian SQL lokal tambahan tersedia di `tests/partner-db-check.mjs`. Set `NUSAJOY_PGLITE_MODULE` ke `dist/index.js` dari PGlite 0.5.8 yang terpasang di luar repository, lalu jalankan `node tests/partner-db-check.mjs`. Pengujian menggunakan database terisolasi, mencakup penerapan ulang SQL, ownership, harga, privasi, kapasitas dan trip beberapa hari; tidak mengubah data Supabase hosted.

## Pekerjaan lanjutan

- Terapkan SQL dashboard mitra dan verifikasi alur dengan dua akun login di Supabase hosted.
- Verifikasi email recovery dan allowlist URL deployment.
- Integrasi payment gateway (ditunda).
- Pengaturan lanjutan dan halaman legal.
- Hubungkan pengalaman beranda ke data nyata.
- Pemilihan penginapan/transportasi dan peta rute dinamis.
- Hubungkan Google Places ketika Edge Function siap.
