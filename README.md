# Kodeva — Take-Home Technical Test (Fullstack Developer DSG)

Aplikasi web landing page promosi, sistem blog dengan CMS mandiri (_Built-in Edge CMS_), dan mini marketplace software bisnis berbasis lisensi berlangganan untuk brand fiktif **Kodeva** (produk PT Digital Solusi Grup).

---

## ⏱️ Waktu Pengerjaan Sebenarnya

- **Total Durasi:** ~7 jam kerja aktif.
- **Rincian:**
  - Analisis brief, pemodelan domain, dan keputusan arsitektur stack: ~1 jam
  - Setup Next.js 16, Drizzle ORM, Edge SQLite / Cloudflare D1-ready schema: ~1 jam
  - Landing page, anti-spam lead capture API, dan blog dengan CMS dinamis: ~1,5 jam
  - Mini marketplace (katalog 6 produk, detail switcher paket, keranjang kuota promo bersama, checkout simulasi): ~1,5 jam
  - Tracking GA4 dataLayer deduplication, first-touch UTM attribution, & floating inspector: ~45 menit
  - Built-in Admin CMS dashboard (`/admin`), pengujian build, dan penulisan dokumentasi: ~45 menit
  - Deployment ke Vercel / Cloudflare & verifikasi live production environment: ~30 menit

---

## 🚀 Cara Menjalankan Project di Lokal

### Prasyarat:

- Node.js v18.x atau lebih baru (rekomendasi Node.js v20+)
- npm

### Langkah Menjalankan:

1. **Clone repository & install dependencies:**

   ```bash
   git clone <repo-url>
   cd dsg
   npm install
   ```

2. **Jalankan server development:**

   ```bash
   npm run dev
   ```

   Buka browser di `http://localhost:3000`.

   > **Zero Setup Lokal:** Project menggunakan _smart hybrid storage_. Di lokal, sistem otomatis menggunakan SQLite lokal (`/tmp/kodeva-edge-cms.db`) dan menginisialisasi seluruh data demo (konten beranda & artikel blog) secara otomatis tanpa perlu setup database eksternal.

3. **Menjalankan Production Build:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🏛️ Arsitektur Singkat & Alasan Pemilihan Stack

| Layer / Fitur        | Stack yang Dipilih                      | Alasan & Keputusan Teknis                                                                                                                                                                                                                                                                                                           |
| :------------------- | :-------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Framework Utama**  | **Next.js 16 (App Router, TypeScript)** | Memaksimalkan SEO Google untuk pencarian aplikasi kasir & HR melalui SSR/SSG. Link preview WhatsApp dinamis via OpenGraph metadata. Performa mobile tinggi dengan optimasi `<Image />` WebP/AVIF.                                                                                                                                   |
| **Sistem CMS**       | **Built-in Edge CMS (Drizzle ORM)**     | **Keputusan sadar menghindari vendor lock-in SaaS CMS.** CMS dibuat langsung di dalam aplikasi (rute `/admin`), siap dideploy ke **Cloudflare D1** (database SQLite edge) dan **Cloudflare R2** (object storage gambar bebas biaya egress). Reviewer dapat langsung menguji edit konten tanpa perlu registrasi/invite pihak ketiga. |
| **Penyimpanan Data** | **SQLite / LibSQL (Drizzle ORM)**       | Skema Drizzle yang seragam untuk tabel `leads`, `landing_content`, dan `blog_posts`. Ringan, cepat, zero-config di lokal, dan _drop-in compatible_ ke Cloudflare D1 / Turso di production.                                                                                                                                          |
| **State Management** | **Zustand (`persist` middleware)**      | Sangat ringan (<1KB, tidak membebani First Load JS mobile). Menggunakan `localStorage` persistence agar isi keranjang dan kuota promo tetap utuh saat halaman di-refresh.                                                                                                                                                           |
| **Styling & UI**     | **Tailwind CSS v4 + Lucide Icons**      | Zero runtime CSS overhead, layout mobile-first yang responsif, dan ukuran tombol ramah sentuhan (touch target $\ge 44$px).                                                                                                                                                                                                          |
| **Form & Validasi**  | **Zod + React Hook Form**               | Type-safety penuh, validasi skema, proteksi honeypot anti-bot, dan pencegahan spam pengisian kilat.                                                                                                                                                                                                                                 |

---

## 💡 Asumsi yang Dibuat Atas Hal yang Ambigu

Brief sengaja membiarkan beberapa aspek terbuka untuk interpretasi kandidat. Berikut asumsi dan keputusan yang diambil:

1. **Rencana Ekspansi Malaysia & Singapura:**
   - _Ambiguitas:_ Apakah sistem harus sudah langsung multi-mata uang (MYR/SGD) dan multi-bahasa saat ini?
   - _Asumsi:_ Untuk peluncuran kampanye akhir tahun di Indonesia, basis mata uang utama saat ini adalah IDR. Namun, fungsi kalkulasi harga dan formatting dibuat modular (`formatIDR`), dan skema database artikel siap diekstensi dengan kolom `locale` (`id`, `ms`, `en`) tanpa perlu migrasi ulang tabel.
2. **Aturan Batas Kuota Promo Bersama Lintas Tier (_Shared Quota Pool_):**
   - _Ambiguitas:_ Bagaimana kuota promo bekerja bila produk memiliki 3 opsi tier (Starter, Pro, Business)?
   - _Asumsi:_ Kuota promo dihitung sebagai **satu pool unit global per produk**. Contoh: Jika "Kodeva POS Kasir" memiliki sisa kuota promo 5 lisensi, maka pembelian 3 lisensi Starter + 2 lisensi Pro langsung menghabiskan kuota promo produk tersebut menjadi 0. Penambahan berikutnya otomatis dikunci oleh sistem keranjang belanja.
3. **Pemisahan Lead Capture vs Checkout Marketplace:**
   - _Ambiguitas:_ Apakah pengisi form demo di landing page otomatis terhubung ke akun checkout?
   - _Asumsi:_ Form di landing page adalah untuk prospek konsultasi demo B2B (sales lead), sedangkan checkout adalah pembelian mandiri (_self-serve purchase_). Keduanya merekam parameter atribusi UTM yang sama sejak user pertama kali mendarat.
4. **Alur Pengujian Pembayaran Simulasi:**
   - _Ambiguitas:_ Bagaimana reviewer bisa mencoba alur sukses dan alur gagal secara realistis?
   - _Asumsi:_ Disediakan toggle kontrol skenario interaktif di halaman checkout (_"Simulasikan Sukses"_ vs _"Simulasikan Gagal"_). Skenario sukses memotong kuota dan menerbitkan kunci lisensi aktif unik; skenario gagal menampilkan pesan error penolakan bank dan mempertahankan kuota promo.

---

## 📊 Status Fitur & Rencana Pengembangan

### Yang Sudah Selesai (100% Requirement Utama):

- [x] **Landing Page Marketing:** Hero section dengan CTA terukur, highlight produk unggulan promo, testimoni pengusaha riil, FAQ interaktif, dan form lead capture dengan proteksi honeypot anti-spam.
- [x] **Blog CMS Dinamis:** Halaman daftar artikel dengan filter kategori dan pagination; halaman detail artikel dengan URL slug SEO-friendly dan kartu rekomendasi produk marketplace yang tertaut.
- [x] **Mini Marketplace:** Katalog 6 produk lengkap dengan filter kategori, detail produk dengan switch tier paket yang mengubah harga secara realtime, keranjang belanja persisten saat refresh.
- [x] **Validasi Kuota Promo Bersama:** Sistem menghitung total lisensi produk di seluruh baris keranjang sebelum mengizinkan penambahan kuota.
- [x] **Checkout Simulasi:** Validasi data pembeli, ringkasan pesanan, simulasi pembayaran sukses (dengan faktur & kunci lisensi `KDV-XXX-XXXX`) dan simulasi pembayaran gagal dengan copy realistis.
- [x] **Marketing Tracking & UTM:**
  - Parameter UTM dari link TikTok/Instagram tersimpan otomatis di storage (_first-touch attribution_) dan terbawa ke lead form maupun payload checkout order.
  - Event GA4 `view_item`, `add_to_cart`, `begin_checkout`, `purchase`, dan `click_cta` terkirim ke `window.dataLayer`.
  - Dilengkapi pencegah duplikasi (_deduplication ref guard_) agar event tidak terkirim ganda saat komponen re-render.
  - **Fitur Khusus Reviewer:** Widget _DataLayer Inspector_ melayang di pojok kanan bawah untuk memverifikasi payload UTM & event secara visual.
- [x] **Portal Admin & Built-in CMS (`/admin`):**
  - **Tab 1 (Editor Beranda):** Edit headline hero, promo badge, FAQ, dan testimoni secara visual. Tombol simpan langsung memicu revalidasi seketika.
  - **Tab 2 (Manajemen Blog):** Tambah & edit artikel, ganti status (Draft / Published), kategori, dan tautan produk marketplace.
  - **Tab 3 (Database Leads):** Tabel prospek lengkap dengan parameter UTM kampanye TikTok dan Instagram.
  - **Login Demo:** Dilengkapi fitur 1-klik masuk untuk reviewer (`admin@kodeva.com` / `admin123`).
- [x] **Caching & On-Demand Revalidation (`/api/revalidate`):** Endpoint untuk purge cache instan (`revalidatePath`) saat konten di-publish tanpa redeploy manual.

### Yang Belum Selesai (Limitasi Waktu 6–8 Jam):

- Pembayaran payment gateway sungguhan (Midtrans/Xendit) karena brief meminta cukup di sisi frontend simulasi.

### Rencana Jika Ada Waktu 1 Minggu Lagi:

1. **Multi-Region & Internationalization (i18n):** Integrasi Next-intl untuk routing `/id`, `/my`, dan `/sg` dengan switcher mata uang IDR/MYR/SGD.
2. **Payment Gateway Produksi:** Integrasi webhook Midtrans Core API atau Xendit dengan validasi HMAC signature dan Redis lock.
3. **Automated Testing Suite:** End-to-end testing menggunakan Playwright untuk alur belanja dan Vitest untuk unit test invariant kuota promo.
4. **Fitur Bonus CMS:** Penjadwalan tanggal mulai/selesai promo langsung dari dashboard admin dan drag-and-drop reorder section landing page.

---

## ⚡ Strategi Caching & Revalidation Konten CMS

Untuk memenuhi requirement perubahan konten tanpa deploy ulang manual:

1. **Mekanisme yang Digunakan:** **On-Demand Path Revalidation** via Next.js `revalidatePath()`.
2. **Alur Kerja:**
   - Fetching data di Server Component di-render cepat dari cache.
   - Saat admin mengedit konten di `/admin` (misal mengubah teks hero atau mempublikasikan artikel blog baru) dan menekan tombol **"Simpan Perubahan"**, Server Action / API Handler mengeksekusi `revalidatePath('/')` dan `revalidatePath('/blog')`.
3. **Konsekuensi terhadap Latensi/Kecepatan:**
   - **Instan (Sub-detik):** Perubahan langsung terlihat seketika oleh pengunjung berikutnya tanpa jeda antrean cache waktu.
   - **Performa Maksimal:** Halaman tetap di-serve dari CDN cache dengan kecepatan static HTML tanpa perlu build atau deploy ulang aplikasi secara manual.

---

## 🔒 Rencana Menghubungkan Marketplace ke Backend Produksi

Berikut spesifikasi teknis untuk implementasi tahap backend produksi:

### 1. Endpoint API yang Dibutuhkan

- `POST /api/v1/orders/create` — Membuat draft order, mencatat data pembeli, rincian tier lisensi, dan mengunci kuota sementara (_hold reservation_ 15 menit).
- `POST /api/v1/payments/charge` — Menginisialisasi transaksi ke payment gateway (menerbitkan QRIS dinamis atau nomor Virtual Account).
- `POST /api/v1/payments/webhook` — Endpoint publik penerima notifikasi status pembayaran dari payment gateway.
- `GET /api/v1/orders/:orderId/status` — Polling status pembayaran dari frontend checkout.
- `GET /api/v1/licenses/my-licenses` — Mengambil daftar kunci lisensi yang berhasil dibeli.

### 2. Alur Payment Gateway yang Aman

1. **Verifikasi Signature & Keamanan Webhook:**
   - Setiap payload webhook diverifikasi menggunakan tanda tangan digital:  
     `HMAC_SHA512(webhook_body, PAYMENT_GATEWAY_SERVER_KEY) === req.headers['x-callback-signature']`.
   - Request dengan signature tidak valid atau timestamp kedaluwarsa (>5 menit) langsung ditolak dengan status `401 Unauthorized`.
2. **Idempotensi Transaksi:**
   - Payload webhook mencantumkan `transaction_id`. Backend mencatat log webhook di tabel `payment_webhook_logs`.
   - Jika notifikasi dikirim ulang oleh payment gateway (retry mechanism), backend mendeteksi status transaksi yang sudah `PAID` dan tidak memproses pemotongan kuota atau pengiriman lisensi untuk kedua kalinya.
3. **Order State Machine:**
   - `PENDING` ➔ `PAID` ➔ `LICENSE_ISSUED` (Alur Sukses)
   - `PENDING` ➔ `EXPIRED` / `FAILED` ➔ `QUOTA_RELEASED` (Alur Gagal / Kedaluwarsa)

### 3. Cara Menjaga Kuota Lisensi Promo Tetap Akurat (_Race Condition Protection_)

- **Masalah:** Ketika sisa kuota promo tinggal 1 lisensi, namun ada 50 user mengklik bayar secara bersamaan.
- **Solusi di Database:**
  1. **Atomic Stock Decrement dengan Pessimistic Lock:**
     ```sql
     BEGIN TRANSACTION;
     SELECT remaining_promo_quota FROM products WHERE id = 'prod-pos-01' FOR UPDATE;
     -- Validasi kuota mencukupi
     UPDATE products
     SET remaining_promo_quota = remaining_promo_quota - 1
     WHERE id = 'prod-pos-01' AND remaining_promo_quota >= 1;
     COMMIT;
     ```
  2. **Distributed Lock (Redis / Redlock):**
     Sebelum membuat pembayaran, backend mengambil lock sementara: `SET lock:quota:prod-pos-01 "holder" EX 15 NX`. Jika lock berhasil, kuota promo di-reserve.
  3. **Auto-Rollback:** Jika order kedaluwarsa (user tidak membayar dalam 15 menit), cron job / Redis key expiry listener otomatis mengembalikan kuota ke pool produk.

### 4. Pengiriman Lisensi Setelah Pembayaran Berhasil

1. Setelah status order berubah menjadi `PAID`, sistem menembakkan event ke antrean pesan (_message queue_ seperti BullMQ / AWS SQS).
2. Worker background mengeksekusi:
   - **License Key Generator:** Membuat kunci lisensi terenkripsi dengan format `KDV-[PRODUCT]-[HASH]-[CHECKSUM]`.
   - **Email Dispatcher:** Mengirimkan email tanda terima transaksi, link aktivasi dasbor, dan faktur pajak elektronik via provider email transaksional (Resend / SendGrid).
   - **Customer Dashboard Sync:** Mengaitkan lisensi ke ID akun pengguna untuk langsung dapat diaktifkan di aplikasi kasir atau HR mereka.

---

## 📱 Skor Lighthouse Mobile (Landing Page)

Landing page dioptimasi secara ketat mengikuti **Vercel React Best Practices** untuk mencapai target brief ($\ge 80$ Performance Mobile):

- Menggunakan `<Image />` bawaan Next.js dengan WebP/AVIF compression dan `sizes` attribute yang tepat untuk meminimalkan LCP (Largest Contentful Paint).
- Widget `DataLayerInspector` dimuat secara dinamis (`ssr: false`) agar tidak membebani ukuran bundle First Load JavaScript.
- Kontras warna sesuai standar WCAG dan touch target minimum 44px untuk kenyamanan perangkat layar sentuh.

---

## 🔑 Kredensial Demo Akun CMS & Pengujian

- **URL Portal Admin & CMS:** `/admin`
- **Email Demo:** `admin@kodeva.com`
- **Password Demo:** `admin123`
  _(Tersedia tombol 1-Klik Masuk di halaman login untuk kemudahan reviewer)._

- **Testing Helper:** Buka tombol **"DataLayer Inspector"** di pojok kanan bawah untuk menguji simulasi atribusi link TikTok/Instagram dan melihat rekaman event GA4 secara realtime.
