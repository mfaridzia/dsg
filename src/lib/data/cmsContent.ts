export type PromoSchedule = {
  enabled: boolean;
  startDate: string;
  endDate: string;
  bannerText: string;
  linkText?: string;
  linkUrl?: string;
  promoBadgeText?: string;
  fallbackBadgeText?: string;
};

export type LandingContent = {
  hero: {
    badge?: string;
    title: string;
    subtitle: string;
    ctaPrimaryText: string;
    ctaPrimaryLink: string;
    ctaSecondaryText: string;
    ctaSecondaryLink: string;
    heroImageUrl: string;
    highlights: string[];
  };
  promoSchedule?: PromoSchedule;
  featuredProductIds: string[];
  testimonials: {
    id: string;
    authorName: string;
    role: string;
    businessName: string;
    businessType: string;
    avatarUrl: string;
    quote: string;
    rating: number;
  }[];
  faqs: {
    id: string;
    question: string;
    answer: string;
    category?: string;
  }[];
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string; // Markdown or HTML rich text
  coverImageUrl: string;
  category: string;
  author: {
    name: string;
    avatarUrl: string;
    role: string;
  };
  publishedAt: string;
  readTimeMinutes: number;
  linkedProductSlug?: string;
};

export const DEFAULT_LANDING_CONTENT: LandingContent = {
  hero: {
    badge: "",
    title: "Otomatisasi Kasir, Payroll, dan Stok Usaha Anda Tanpa Ribet",
    subtitle:
      "Platform software bisnis cloud terpadu untuk UMKM Indonesia. Pantau laporan omzet cabang, hitung gaji & PPh 21 otomatis, dan amankan stok barang dari mana saja lewat HP.",
    ctaPrimaryText: "Lihat Promo & Katalog Produk",
    ctaPrimaryLink: "/marketplace",
    ctaSecondaryText: "Konsultasi Demo Gratis",
    ctaSecondaryLink: "#lead-form",
    heroImageUrl:
      "https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1200&q=80",
    highlights: [
      "Dipercaya 14.500+ UMKM di 34 Provinsi",
      "Siap Digunakan dalam 10 Menit",
      "Garansi Dukungan Teknis 7 Hari Seminggu",
    ],
  },
  promoSchedule: {
    enabled: true,
    startDate: "2025-11-01",
    endDate: "2026-12-31",
    bannerText: "Promo Akhir Tahun Kodeva: Amankan diskon lisensi hingga 45% sebelum kuota habis!",
    linkText: "Lihat Semua Produk →",
    linkUrl: "/marketplace",
    promoBadgeText: "Promo Akhir Tahun: Diskon Lisensi s/d 45%",
  },
  featuredProductIds: ["prod-pos-01", "prod-hr-02", "prod-inv-03"],
  testimonials: [
    {
      id: "testi-01",
      authorName: "Hendra Wijaya",
      role: "Owner",
      businessName: "Kopi Seduh Nusantara (4 Outlet)",
      businessType: "Food & Beverage",
      avatarUrl:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80",
      quote:
        "Dulu rekap kasir 4 cabang butuh waktu sampai jam 1 malam di Excel. Sejak pakai Kodeva POS, jam 10 malam saya sudah santai lihat ringkasan omzet realtime di HP. Stok sirup dan beans juga klop tanpa selisih.",
      rating: 5,
    },
    {
      id: "testi-02",
      authorName: "Ibu Rina Sasmita",
      role: "Founder",
      businessName: "Batik Canting Cantik Solo",
      businessType: "Fashion & Retail",
      avatarUrl:
        "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200&q=80",
      quote:
        "Modul inventori Kodeva sangat teliti. Kami punya ribuan motif kain dengan kode barcode berbeda. Sekarang transfer antar gudang toko dan display kasir tidak pernah nyasar lagi.",
      rating: 5,
    },
    {
      id: "testi-03",
      authorName: "Bambang Prakoso",
      role: "Finance & HR Manager",
      businessName: "PT Sentra Logistik Cepat",
      businessType: "Jasa & Distribusi",
      avatarUrl:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80",
      quote:
        "Perhitungan PPh 21 TER bikin pusing tim keuangan tiap akhir bulan. Modul HR Kodeva langsung hitung otomatis potongan gaji dan buat slip PDF. Sangat menghemat waktu kerja tim kami.",
      rating: 5,
    },
  ],
  faqs: [
    {
      id: "faq-01",
      question: "Apakah aplikasi kasir Kodeva tetap bisa dipakai saat koneksi internet mati?",
      answer:
        "Ya, Kodeva POS memiliki fitur Offline-First Protection. Transaksi kasir tetap berjalan lancar dan struk tetap tercetak. Begitu koneksi internet kembali aktif, seluruh data transaksi akan tersinkronisasi otomatis ke cloud server tanpa risiko data ganda.",
    },
    {
      id: "faq-02",
      question: "Bagaimana sistem lisensi promo akhir tahun ini bekerja?",
      answer:
        "Lisensi promo akhir tahun memberikan potongan harga spesial hingga 45% untuk langganan tahun pertama. Kuota promo dibatasi per produk dan berlaku untuk semua paket (Basic, Pro, Business). Anda dapat mengamankan kuota promo dengan menyelesaikan checkout hari ini.",
    },
    {
      id: "faq-03",
      question: "Apakah tim Kodeva akan membantu migrasi data menu dan karyawan lama kami?",
      answer:
        "Tentu! Tim onboarding Kodeva menyediakan template impor Excel untuk produk, stok awal, dan database karyawan. Kami juga menyediakan sesi training online via Zoom gratis untuk staf kasir dan admin Anda.",
    },
    {
      id: "faq-04",
      question: "Apakah Kodeva sudah mendukung pembayaran QRIS dan transfer bank?",
      answer:
        "Semua paket Kodeva Pro dan Business sudah terintegrasi dengan QRIS Dinamis (generate QR code per struk belanja) serta integrasi Virtual Account bank terkemuka di Indonesia.",
    },
    {
      id: "faq-05",
      question: "Apakah ada biaya tersembunyi seperti biaya update atau maintenance server?",
      answer:
        "Tidak ada biaya tersembunyi sama sekali. Biaya berlangganan sudah mencakup pembaruan fitur (update berkala), penyimpanan cloud aman, backup harian otomatis, dan layanan customer care.",
    },
  ],
};

export const DEFAULT_BLOG_POSTS: BlogPost[] = [
  {
    id: "blog-01",
    slug: "panduan-memilih-aplikasi-kasir-cafe-resto-multi-outlet",
    title: "Panduan Lengkap Memilih Aplikasi Kasir untuk Cafe & Resto Multi-Outlet",
    excerpt:
      "Hindari kesalahan umum pemilik F&B: pelajari fitur wajib seperti split bill, manajemen meja, dan kontrol bahan baku COGS sebelum membeli lisensi POS.",
    content: `<p>Mengelola satu outlet cafe berbeda jauh dengan mengelola 3 atau 5 cabang sekaligus. Kesalahan paling umum dari pemilik bisnis F&B yang sedang bertumbuh adalah memilih sistem kasir yang hanya dirancang untuk <em>single-store</em>.</p>
<h2>1. Sinkronisasi Realtime & Akses Multi-Device</h2>
<p>Pastikan aplikasi kasir Anda dapat diakses dari beberapa perangkat kasir sekaligus tanpa tabrakan nomor struk. Jika satu kasir sedang melayani <em>dine-in</em>, kasir lain bisa fokus melayani pesanan <em>take-away</em> atau ojek online.</p>
<h2>2. Manajemen Meja dan Split Bill</h2>
<p>Pelanggan cafe dan resto sering kali meminta pisah tagihan (<em>split bill</em>) atau pindah meja. Software kasir yang baik harus memudahkan barista atau kasir melakukan pembagian pembayaran per menu tanpa harus membatalkan transaksi dari awal.</p>
<h2>3. Kontrol Bahan Baku (Cost of Goods Sold / COGS)</h2>
<p>Kunci keuntungan bisnis F&B bukan hanya di omzet, melainkan di efisiensi bahan baku. Pastikan setiap menu yang terjual (misalnya segelas Caffe Latte) otomatis memotong stok 18gr biji kopi, 150ml susu fresh milk, dan 1 paper cup di gudang Anda.</p>
<p>Solusi <strong>Kodeva POS Kasir Multi-Outlet</strong> dirancang khusus untuk mengatasi seluruh tantangan operasional ini dalam satu Dashboard yang mudah dipahami.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&q=80",
    category: "Kasir & Operasional",
    author: {
      name: "Rizky Pratama",
      role: "Lead Business Solution, Kodeva",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2025-11-20",
    readTimeMinutes: 5,
    linkedProductSlug: "kodeva-pos-kasir",
  },
  {
    id: "blog-02",
    slug: "perhitungan-pph-21-ter-terbaru-hindari-denda-pajak-karyawan",
    title: "Perhitungan PPh 21 Tarif Efektif Rata-Rata (TER): Panduan Praktis HR UMKM",
    excerpt:
      "Memahami skema pemotongan PPh 21 terbaru dari Direktorat Jenderal Pajak agar penghitungan slip gaji bulanan karyawan akurat dan patuh hukum.",
    content: `<p>Sejak berlakunya Peraturan Pemerintah terkait Tarif Efektif Rata-Rata (TER) PPh Pasal 21, banyak pemilik UMKM dan staf administrasi keuangan yang kebingungan menghitung potongan pajak penghasilan karyawan tetap maupun lepas.</p>
<h2>Mengapa Skema TER Diterapkan?</h2>
<p>Skema TER bertujuan menyederhanakan perhitungan pajak bulanan dari masa Januari hingga November. HR tidak perlu lagi menghitung Penghasilan Tidak Kena Pajak (PTKP) tahunan secara manual setiap bulan.</p>
<h2>Klasifikasi Kategori TER</h2>
<ul>
<li><strong>Kategori A:</strong> Dikenakan pada PTKP TK/0, TK/1, dan K/0.</li>
<li><strong>Kategori B:</strong> Dikenakan pada PTKP TK/2, TK/3, K/1, dan K/2.</li>
<li><strong>Kategori C:</strong> Dikenakan pada PTKP K/3.</li>
</ul>
<h2>Mengapa Perlu Otomatisasi dengan Software Payroll?</h2>
<p>Menghitung ratusan kombinasi tarif TER secara manual di spreadsheet sangat rawan <em>human error</em>. Dengan <strong>Kodeva HR & Payroll</strong>, sistem langsung mencocokkan status PTKP dan penghasilan bruto karyawan untuk mendapatkan persentase TER yang tepat secara otomatis.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=1200&q=80",
    category: "SDM & Regulasi",
    author: {
      name: "Sarah Amanda, S.E.",
      role: "Tax & Payroll Specialist",
      avatarUrl:
        "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2025-11-28",
    readTimeMinutes: 6,
    linkedProductSlug: "kodeva-hr-payroll",
  },
  {
    id: "blog-03",
    slug: "strategi-cegah-kebocoran-stok-gudang-multi-cabang",
    title: "5 Strategi Jitu Mengatasi Selisih Stok Barang Antar Gudang dan Toko",
    excerpt:
      "Selisih stok barang bisa menggerus laba hingga 15% per bulan. Terapkan audit kartu stok, barcode scanner, dan alur transfer surat jalan digital.",
    content: `<p>Bagi pelaku usaha retail dan distribusi, barang hilang atau rusak tanpa pertanggungjawaban adalah mimpi buruk. Tanpa pengawasan ketat, selisih stok sering kali baru terdeteksi saat <em>stock opname</em> tahunan, saat kerugian sudah terlanjur membengkak.</p>
<h2>1. Standarisasi Penerimaan Barang dengan Purchase Order</h2>
<p>Jangan biarkan staf gudang menerima kiriman supplier tanpa dokumen PO yang sah di sistem. Setiap barang yang masuk harus diverifikasi kuantitas dan nomor batch-nya.</p>
<h2>2. Terapkan Surat Jalan Digital untuk Mutasi Antar Cabang</h2>
<p>Saat outlet cabang A kekurangan stok dan meminta kiriman dari cabang B, proses transfer harus memiliki status: <strong>Diminta</strong>, <strong>Dalam Pengiriman</strong>, dan <strong>Diterima</strong>. Ini memastikan penanggung jawab jelas jika terjadi kehilangan di perjalanan.</p>
<h2>3. Lakukan Cycle Counting Berkala</h2>
<p>Jangan menunggu akhir tahun untuk menghitung fisik stok. Lakukan penghitungan berkala per kategori produk setiap minggu (Cycle Counting) menggunakan pemindai barcode kamera HP.</p>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80",
    category: "Operasional & Stok",
    author: {
      name: "Budi Santoso",
      role: "Operations Consultant",
      avatarUrl:
        "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2025-12-02",
    readTimeMinutes: 4,
    linkedProductSlug: "kodeva-inventory-sync",
  },
  {
    id: "blog-04",
    slug: "cara-ampuh-tingkatkan-omzet-membership-whatsapp",
    title: "Rahasia Toko Retail Meningkatkan Omzet 35% Lewat Member Loyalty WhatsApp",
    excerpt:
      "Mendapatkan pelanggan baru 5x lebih mahal daripada mempertahankan pelanggan lama. Pelajari cara memanfaatkan kupon loyalitas berbasis nomor WhatsApp.",
    content: `<p>Banyak pelaku usaha mengeluhkan mahalnya biaya iklan digital di media sosial. Padahal, aset terbesar mereka adalah pelanggan yang sudah pernah bertransaksi.</p>
<h2>Mengapa Kartu Member Plastik Sudah Ketinggalan Zaman?</h2>
<p>Pelanggan enggan membawa kartu fisik di dompet mereka. Dengan memanfaatkan nomor WhatsApp saat pembayaran kasir, pelanggan langsung terdaftar sebagai member tanpa perlu mengisi formulir panjang.</p>
<h2>Kunci Sukses Loyalty Marketing</h2>
<ul>
<li><strong>Poin Transaksi Instan:</strong> Berikan 1 poin setiap kelipatan Rp 10.000 belanja.</li>
<li><strong>Kupon Ulang Tahun Otomatis:</strong> Kirim voucher diskon eksklusif 3 hari sebelum hari ulang tahun pelanggan.</li>
<li><strong>Pesan Win-Back:</strong> Otomatis kirim tawaran promo bagi pelanggan yang sudah tidak berkunjung selama lebih dari 45 hari.</li>
</ul>`,
    coverImageUrl:
      "https://images.unsplash.com/photo-1556740738-b6a63e27c4df?auto=format&fit=crop&w=1200&q=80",
    category: "Marketing & CRM",
    author: {
      name: "Rizky Pratama",
      role: "Lead Business Solution, Kodeva",
      avatarUrl:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=200&q=80",
    },
    publishedAt: "2025-12-05",
    readTimeMinutes: 4,
    linkedProductSlug: "kodeva-loyalty-member",
  },
];
