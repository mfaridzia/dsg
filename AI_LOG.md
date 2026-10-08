# Catatan Penggunaan AI (AI_LOG.md)

Dokumen ini mencatat log penggunaan AI selama proses pengerjaan Technical Skill Test Fullstack Developer Kodeva (PT Digital Solusi Grup).

---

## 1. Tools AI yang Digunakan & Pembagian Peran

* **Tool Utama:** Google Antigravity (dengan engine Gemini).
* **Peran & Pembagian Kerja:**
  * **Brainstorming Arsitektur & Trade-Off Analysis:** Berdiskusi mengevaluasi alternatif stack (mengapa memilih *Built-in Edge CMS* berbasis SQLite/Cloudflare D1 & R2 dibanding ketergantungan pada SaaS CMS pihak ketiga seperti Sanity/Strapi).
  * **Code Scaffolding & Boilerplate:** Mempercepat penulisan komponen UI Tailwind, tabel database Drizzle ORM, dan form validasi Zod.
  * **Drafting Copywriting Realistis:** Menghasilkan copy produk SaaS B2B UMKM Indonesia (istilah POS kasir, perhitungan PPh 21 TER, kontrol COGS bahan baku, testimoni pebisnis lokal) agar website terasa hidup dan nyata.
  * **Pair-Programming & Bug Hunting:** Membantu menelusuri pesan kompilasi dan breaking changes internal pada Next.js 16 (seperti `cacheComponents` dan prerender dynamic dates).

---

## 2. Contoh Prompt yang Paling Membantu

Berikut 3 prompt riil yang memberikan hasil paling efektif:

### Prompt 1: Menyusun Mock Data B2B SaaS Indonesia yang Konseptual
> *"Buatkan 6 produk software B2B SaaS realistis untuk UMKM Indonesia dengan brand Kodeva (aplikasi kasir multi-outlet, HR payroll PPh 21 TER, multi-gudang inventory, loyalitas member, kitchen display system). Tiap produk harus punya sharedQuotaPoolId untuk validasi kuota promo bersama, 3 tier paket (Starter, Pro, Business), harga diskon vs coret, serta spesifikasi fitur yang masuk akal untuk bisnis cafe dan retail."*
* **Kenapa membantu:** Menghemat waktu pembuatan dummy data manual dan menghasilkan struktur data domain yang langsung siap dikonsumsi oleh store dan UI.

### Prompt 2: Pembuatan Proteksi Spam Honeypot & Bot Latency Check
> *"Buatkan endpoint Next.js Route Handler untuk menerima form leads. Sertakan proteksi spam dasar tanpa library captcha berat: gunakan hidden honeypot field 'website' dan validasi submission latency minimal 1.2 detik menggunakan timestamp client agar bot otomatis yang submit dalam hitungan milidetik langsung tertolak."*
* **Kenapa membantu:** Solusi anti-spam yang sangat efisien, ramah UX pengunjung (tanpa puzzle captcha yang mengganggu), dan memenuhi requirement brief secara elegan.

### Prompt 3: Setup GA4 dataLayer Helper dengan Deduplication Guard
> *"Bantu rancang utilitas dataLayer GA4 di Next.js App Router yang aman dari double trigger akibat re-render komponen React atau Strict Mode. Gunakan ref guard dan debounce key berbasis fingerprint event (nama event + ID produk)."*
* **Kenapa membantu:** Memberikan fondasi utilitas tracking yang bersih sebelum dihubungkan ke interaksi komponen UI.

---

## 3. Contoh Masalah / Kesalahan Output AI dan Cara Memperbaikinya

### Kasus 1: AI Salah Mengimplementasikan Validasi Kuota Promo Keranjang (Jebakan Per-Item)
* **Masalah yang Ditemukan:**  
  Ketika pertama kali diminta membuat validasi kuota promo di keranjang, AI menghasilkan logika standar:  
  `if (newItem.quantity > product.remainingQuota) reject;`  
  Logika ini **bocor parah**: jika produk "Kodeva Kasir" kuota promonya tersisa 5, user bisa memasukkan paket *Starter* sebanyak 3 lisensi, lalu memasukkan lagi paket *Pro* sebanyak 3 lisensi di baris keranjang baru. Totalnya jadi 6 lisensi, melampaui batas kuota promo 5!
* **Cara Memperbaiki:**  
  Saya menolak logika per-item tersebut dan merancang ulang pengecekan berbasis agregasi pool produk di `cartStore.ts`. Sistem menghitung akumulasi seluruh baris item yang memiliki `sharedQuotaPoolId` yang sama:
  ```typescript
  const currentTotal = items
    .filter((i) => i.sharedQuotaPoolId === targetPoolId)
    .reduce((sum, i) => sum + i.quantity, 0);

  if (currentTotal + delta > maxPoolQuota) {
    // Tolak mutasi state dan tampilkan pesan sisa kuota global yang sebenarnya
  }
  ```
* **Hasil Verifikasi:**  
  Diuji di browser: menambahkan 3 lisensi Starter + 2 lisensi Pro berhasil (total 5). Begitu tombol `+` diklik lagi atau paket Business coba ditambahkan, tombol otomatis terkunci/disabled dan muncul notifikasi peringatan bahwa batas kuota promo produk telah habis.

---

### Kasus 2: AI Menyimpan Parameter UTM Secara Naif (Hilang Saat Navigasi Halaman)
* **Masalah yang Ditemukan:**  
  AI awalnya hanya membaca UTM langsung menggunakan hook `useSearchParams()` di komponen form lead dan checkout. Akibatnya, jika pengunjung mengklik link iklan dari TikTok (`/?utm_source=tiktok&utm_campaign=promo`), lalu mereka mengeklik menu *"Lihat Katalog Software"* atau *"Baca Blog"* terlebih dahulu sebelum checkout, parameter URL menjadi bersih (`/marketplace` tanpa query params), dan seluruh data atribusi UTM **hilang tak berbekas**.
* **Cara Memperbaiki:**  
  Saya mengarahkan arsitektur *First-Touch Attribution Persistence*. Dibuat modul `utmStore.ts` berbasis Zustand yang menyimpan parameter UTM ke dalam storage browser segera saat user mendarat pertama kali di aplikasi. Kapan pun user berpindah halaman atau me-refresh tab, parameter UTM awal tetap tersimpan dan disuntikkan secara otomatis ke setiap request submission lead maupun order mock.
* **Hasil Verifikasi:**  
  Diuji dengan simulasi link `?utm_source=tiktok&utm_campaign=akhir-tahun`, lalu bernavigasi ke `/blog`, lalu ke `/marketplace/kodeva-pos-kasir`, lalu melakukan checkout. Pada tab DataLayer Inspector dan di tabel `/admin`, data lead dan payload order tetap teratribusi 100% ke TikTok.

---

### Kasus 3: Breaking Change Next.js 16 pada Dynamic Date saat Static Prerendering
* **Masalah yang Ditemukan:**  
  Saat kompilasi `next build`, Next.js 16 melempar error: `Next.js encountered the unstable value new Date() in a Client Component`. AI awalnya menyarankan menambahkan `"use client"`, tetapi di Next.js 16 (dengan fitur `cacheComponents` aktif), pemanggilan `new Date()` saat fase prerender tetap dianggap tidak stabil.
* **Cara Memperbaiki:**  
  Saya meneliti pesan error dan dokumentasi `AGENTS.md`, lalu mengganti tahun dinamis di footer dengan nilai statis deterministik untuk keperluan prerender, serta membungkus komponen yang membaca URL pathname (`FloatingCartButton`) ke dalam `<Suspense>`.
* **Hasil Verifikasi:**  
  Kompilasi build `npm run build` berhasil 100% dengan status static prerender hijau untuk seluruh 24 rute halaman.

---

## 4. Bagian Implementasi yang Banyak Dibantu AI & Pengujian Edge Case-nya

* **Bagian:** Pembuatan komponen `LeadCaptureForm.tsx` beserta rute API `/api/leads/route.ts` dengan proteksi honeypot anti-spam dan penyimpanan Drizzle SQLite.
* **Edge Case yang Diuji:**
  1. **Pengujian Bot Spam Cepat:** Form diisi secara instan via script dalam waktu < 1.2 detik sejak render.  
     *Hasil:* API menolak dengan status 400 (`"Terlalu cepat mengisi formulir"`).
  2. **Pengujian Field Honeypot:** Field rahasia `website` (yang tersembunyi dari mata manusia via CSS) diisi nilai acak oleh bot scraper.  
     *Hasil:* API merespons silent success 200 tanpa menyimpan baris data ke database (mencegah penumpukan data sampah).
  3. **Pengujian Nomor WhatsApp:** Memasukkan karakter huruf atau nomor kurang dari 8 digit.  
     *Hasil:* Validasi skema Zod menolak dan menampilkan indikator error merah pada input.
  4. **Pengujian Input Duplikat / Karakter Spesial:** Memasukkan nama dengan tanda petik/simbol SQL (`O'Connor`, `<script>`).  
     *Hasil:* Parameterized query Drizzle ORM menyimpan string secara aman tanpa kerentanan SQL injection.

---

## 5. Bagian yang Sengaja Dirancang & Ditulis Sendiri Tanpa AI

Meskipun AI sangat membantu untuk hal-hal repetitif, bagian-bagian inti berikut **sengaja saya rancang dan tulis langsung di IDE tanpa meminta AI**:

### 1. Keputusan Arsitektur: Memilih Built-in Edge CMS Dibanding SaaS CMS Pihak Ketiga
* **Alasannya:**  
  Di awal, opsi memakai SaaS CMS seperti Sanity atau Strapi sempat dipertimbangkan. Namun, setelah dianalisis secara kritis:
  * SaaS CMS menciptakan ketergantungan pihak ketiga (*vendor lock-in*) dan mewajibkan reviewer untuk di-invite akun terpisah atau login OAuth eksternal yang rawan hambatan akses saat penilaian.
  * Dengan membangun **Built-in Edge CMS langsung di dalam aplikasi (rute `/admin`) menggunakan Drizzle ORM**, aplikasi menjadi 100% mandiri, bebas biaya langganan, siap dideploy ke **Cloudflare D1** (database edge) & **Cloudflare R2** (storage gambar), serta memberikan pengalaman evaluasi tanpa friksi bagi reviewer (login instan dengan email demo dan langsung dapat menguji edit konten secara live).

### 2. Definisi Domain Contracts & Data Types (`src/types/marketplace.ts`)
* **Alasannya:**  
  Mengetik definisi tipe data (`Product`, `ProductTier`, `CartItem`, `sharedQuotaPoolId`) secara manual membantu saya memetakan dan mengunci batasan bisnis sistem Kodeva sejak awal. Menulis tipe ini sendiri menjamin nol halusinasi dan menjadi *single source of truth* yang kokoh bagi seluruh komponen lainnya.

### 3. Logika Matematis Invariant Kuota Bersama (`calculateQuotaInvariant`)
* **Alasannya:**  
  Menulis logika agregasi kuota promo lintas tier secara langsung di keyboard jauh lebih cepat, deterministik, dan terbebas dari kesalahan konseptual daripada harus bolak-balik menyusun prompt panjang ke AI.
