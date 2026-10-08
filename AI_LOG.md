# Catatan Penggunaan AI (AI_LOG.md)

## 1. Tools AI yang Digunakan & Pembagian Peran

- **Tool Utama:** AI Harness (Claude, Codex, Antigravity)
- **Peran & Pembagian Kerja:**
  - **Brainstorming & Trade-Off Analysis:** Berdiskusi mengevaluasi alternatif stack (Sanity vs Custom CMS vs SQLite/Cloudflare D1, Turso vs Supabase).
  - **Code Scaffolding & Boilerplate:** Mempercepat penulisan komponen UI Tailwind, schema, dan tipe data awalan.
  - **Drafting Copywriting Realistis:** Menghasilkan copy produk SaaS B2B UMKM Indonesia (istilah POS, PPh 21 TER, resep COGS, testimoni realistis) agar website tidak terlihat seperti template dummy murahan.
  - **Code Generation based on Context:** Membantu membuat fitur berdasarkan prompt/context instruksi yang sudah diberikan
  - **Pair-Programming & Bug Hunting:** Membantu menelusuri pesan kompilasi dan breaking changes internal pada Next.js 16.

---

## 2. Contoh Prompt yang Paling Membantu

Berikut prompt yang memberikan hasil paling efektif:

### Prompt 1: Diskusi dan Brainstorming Terkait Context Projek/Produk yang Akan Dibuat

> \_"Saya mempunyai requirements seperti berikut, Berperanlah sebagai Senior Software Architect dan Senior Frontend Engineer yang pragmatis.

Analisis requirements yang saya berikan, lalu diskusikan pendekatan terbaik dari sisi tech stack, CMS, arsitektur, database, SEO, security, dan deployment.

Saya mempertimbangkan Next.js, Mengembangkan CMS sendiri, SQLite/Cloudflare D1 untuk database, R1 untuk storage, dan Vercel, tetapi terbuka untuk alternatif yang lebih baik.

Prioritaskan solusi yang simple, maintainable, cepat diimplementasikan, dan tidak overengineering, tetapi tetap mengikuti best practices.

Challenge keputusan saya jika ada pendekatan yang lebih tepat. "\_

- **Kenapa membantu:** Ini sangat membantu dalam proses pemilihan tech stack serta architecture di awal.

### Prompt 2: Pembuatan Proteksi Spam Honeypot & Bot Latency Check

> _"Buatkan endpoint Next.js Route Handler untuk menerima form leads. Sertakan proteksi spam dasar tanpa library captcha berat: gunakan hidden honeypot field 'website' dan validasi submission latency minimal 1.2 detik menggunakan timestamp client agar bot otomatis yang submit dalam hitungan milidetik langsung tertolak."_

- **Kenapa membantu:** Solusi anti-spam yang sangat efisien, ramah UX pengunjung (tanpa puzzle captcha yang mengganggu), dan memenuhi requirement brief secara elegan.

### Prompt 3: Setup GA4 dataLayer Helper dengan Deduplication Guard

> _"Bantu rancang utilitas dataLayer seperti GA4 di Next.js App Router yang aman dari double trigger akibat re-render komponen React atau Strict Mode. Gunakan ref guard dan debounce key berbasis fingerprint event (nama event + ID produk)."_

- **Kenapa membantu:** Memberikan fondasi utilitas tracking yang bersih sebelum dihubungkan ke interaksi komponen UI.

---

## 3. Contoh Masalah / Kesalahan Output AI dan Cara Memperbaikinya

### Kasus 1: AI Salah Mengimplementasikan Validasi Kuota Promo Keranjang/Cart

- **Masalah yang Ditemukan:**  
  Ketika pertama kali diminta membuat validasi kuota promo di keranjang/cart, AI menghasilkan logika standar:  
  `if (newItem.quantity > product.remainingQuota) reject;`  
  Logika ini **bocor parah**: jika produk "Kodeva Kasir" kuota promonya tersisa 5, user bisa memasukkan paket _Starter_ sebanyak 3 lisensi, lalu memasukkan lagi paket _Pro_ sebanyak 3 lisensi di baris keranjang baru. Totalnya jadi 6 lisensi, melampaui batas kuota promo 5!
- **Cara Memperbaiki:**  
  Menolak logika per-item tersebut dan meminta merancang ulang pengecekan berbasis agregasi pool produk di `cartStore.ts`. Sistem menghitung akumulasi seluruh baris item yang memiliki `sharedQuotaPoolId` yang sama:

  ```typescript
  const currentTotal = items
    .filter((i) => i.sharedQuotaPoolId === targetPoolId)
    .reduce((sum, i) => sum + i.quantity, 0);

  if (currentTotal + delta > maxPoolQuota) {
    // Tolak mutasi state dan tampilkan pesan sisa kuota global yang sebenarnya
  }
  ```

- **Hasil Verifikasi:**  
  Diuji di browser: menambahkan 3 lisensi Starter + 2 lisensi Pro berhasil (total 5). Begitu tombol `+` diklik lagi atau paket Business coba ditambahkan, tombol otomatis terkunci/disabled dan muncul notifikasi peringatan bahwa batas kuota promo produk telah habis.

---

### Kasus 2: AI Menyimpan Parameter UTM Secara Sementara (Hilang Saat Navigasi Halaman)

- **Masalah yang Ditemukan:**  
  AI awalnya hanya membaca UTM langsung menggunakan hook `useSearchParams()` di komponen form lead dan checkout. Akibatnya, jika pengunjung mengklik link iklan dari TikTok (`/?utm_source=tiktok&utm_campaign=promo`), lalu mereka mengeklik menu _"Lihat Katalog Software"_ atau _"Baca Blog"_ terlebih dahulu sebelum checkout, parameter URL menjadi bersih (`/marketplace` tanpa query params), dan seluruh data atribusi UTM **hilang**.
- **Cara Memperbaiki:**  
  Saya mengarahkan arsitektur _First-Touch Attribution Persistence_. Dibuat modul `utmStore.ts` berbasis Zustand yang menyimpan parameter UTM ke dalam storage browser segera ketika user pertama kali masuk di aplikasi. Kapan pun user berpindah halaman atau me-refresh tab, parameter UTM awal tetap tersimpan dan di inject secara otomatis ke setiap request submission lead maupun order mock.
- **Hasil Verifikasi:**  
  Diuji dengan simulasi link `?utm_source=tiktok&utm_campaign=akhir-tahun`, lalu navigate ke `/blog`, lalu ke `/marketplace/kodeva-pos-kasir`, lalu melakukan checkout. Pada tab DataLayer Inspector dan di tabel `/admin`, data lead dan payload order tetap teratribusi 100% ke TikTok.

---

### Kasus 3: Breaking Change Next.js 16 pada `revalidateTag` & Prerender Date

- **Masalah yang Ditemukan:**  
  Ketika menjalankan production build `npm run build`, Next.js 16 nge-throw error:
  1. `Expected 2 arguments, but got 1` pada fungsi `revalidateTag(tag)`.
  2. `Next.js encountered the unstable value new Date() while prerendering` pada komponen Footer.
     AI pada awalnya tidak menyadari breaking change ini karena batas _training data_ lamanya menganggap `revalidateTag` hanya menerima 1 argumen string.
- **Cara Memperbaiki:**  
   Periksa source code types Next.js 16 di `node_modules/next/cache.d.ts`, cek dokumentasi terbaru dan membaca panduan di `AGENTS.md`. Ternyata Next.js 16 mewajibkan argumen profil cache kedua (misalnya `revalidateTag(tag, "max")`). Untuk masalah dynamic date di prerender, saya menggantinya dengan tahun statis yang deterministik.
- **Hasil Verifikasi:**  
  Kompilasi build `npm run build` berjalan mulus dengan exit code 0 dan seluruh 24 rute halaman berhasil di-prerender.

---

## 4. Bagian Implementasi yang Banyak Dibantu AI & Pengujian Edge Case-nya

### 1. Scaffolding Komponen UI & Interaktivitas Kompleks (Tier Switcher & Keranjang)

- **Bagian:** Pembuatan komponen `ProductCard.tsx` (tier switch Starter/Pro/Business) dan `cartStore.ts` (Zustand + local storage persistence).
- **Edge Case yang Diuji:**
  1. **Perpindahan Tier Tanpa Stale State:** Mengganti paket dari _Starter_ ke _Business_ di halaman detail lalu langsung menekan _"Tambah ke Keranjang"_.  
     _Hasil:_ State tier, kalkulasi diskon coret, dan unit kuota ter-update seketika secara sinkron tanpa race condition atau salah harga.
  2. **Persistensi State Saat Refresh / Multi-Tab:** Menambah produk ke keranjang, membuka tab baru, atau me-refresh browser.  
     _Hasil:_ Isi keranjang dan akumulasi kuota tetap utuh berkat middleware Zustand `persist`, tanpa hydration mismatch warning di console.
  3. **Responsivitas & Touch Target Mobile:** Pengujian layout di viewport mobile (375px - 414px).  
     _Hasil:_ Seluruh tombol CTA, switch tier, dan tombol kuantitas memiliki area sentuh $\ge 44$px dan tidak terjadi horizontal layout overflow.

---

### 2. Pengecekan & Optimasi Performa (Lighthouse & Core Web Vitals)

- **Bagian:** Audit performa halaman landing dan marketplace menggunakan Google Lighthouse serta optimasi aset gambar dan rendering.
- **Edge Case yang Diuji:**
  1. **Largest Contentful Paint (LCP) < 1.2 Detik:** Gambar hero banner diuji pada simulasi jaringan lambat (Fast 3G).  
     _Hasil:_ Menambahkan atribut `priority` dan format modern WebP/AVIF pada komponen `<Image />` Next.js sehingga LCP tercapai di kisaran 0.8s - 1.1s.
  2. **Cumulative Layout Shift (CLS) = 0:** Banner promo dan kartu katalog diuji saat proses loading font dan gambar.  
     _Hasil:_ Memberikan aspek rasio dan container skeleton terdefinisi sehingga elemen tidak bergeser mendadak saat gambar selesai di-render (skor CLS 0.00).
  3. **Penanganan De-opt Prerender akibat Client Hooks:** Penggunaan `useSearchParams()` untuk membaca UTM diuji dampaknya terhadap SSG.  
     _Hasil:_ Membungkus komponen yang membaca search params dengan batas `<Suspense>`, sehingga seluruh shell halaman tetap ter-generate secara statis (skor Performance $\ge 95$).

---

### 3. Pencegahan Double-Trigger pada Event Tracking GA4 dataLayer

- **Bagian:** Integrasi fungsi `trackEvent` di `dataLayer.ts` pada interaksi checkout (`add_to_cart`, `begin_checkout`, `purchase`).
- **Edge Case yang Diuji:**
  1. **React Strict Mode / Double Render Guard:** Komponen di-mount dua kali di lingkungan development.  
     _Hasil:_ Utilitas tracking dilengkapi ref guard dan event-fingerprint deduplication, mencegah satu aksi klik tercatat dua kali di DataLayer.
  2. **Navigasi Cepat (Page Transition Race Condition):** Pengguna menekan tombol CTA checkout dan halaman langsung berpindah dalam < 100ms.  
     _Hasil:_ Event tetap berhasil masuk ke array `window.dataLayer` sebelum route transition selesai berkat synchronous array push.

---

## 5. Bagian yang Sengaja Dirancang Tanpa AI

Meskipun AI sangat membantu untuk hal-hal repetitif, bagian inti berikut **sengaja saya rancang tanpa meminta AI memutuskannya sendiri secara sepihak tanpa ada interpensi dari Developernya**:

### 1. Keputusan Arsitektur dan Tech Stack

- **Alasannya:**
  Mostly AI melakukan overengineering atau simplify suatu project, jadi pengalaman developer/engineernya tetap berpengaruh di sini untuk memberikan context ke AI nya sehingga AI Modelnya bisa memberikan solusi yang tepat.

  Jadi tidak memberikan hak sepenuhnya ke AI dari awal untuk membuat keputusan pemilihan arsitektur tanpa ada batasan atau context yg jelas di awal adalah strategy untuk membuat AI nya memberikan hasil yg lebih sesuai nantinya.
