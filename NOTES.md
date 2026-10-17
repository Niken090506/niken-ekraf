# TanStack Ekraf Dashboard — Execution Notes

Dokumen ini merangkum perbaikan bug, penyesuaian visual Web3 design system, serta peningkatan keamanan (hardening) pada proyek **TanStack Ekraf Dashboard**.

---

## 1. What Was Broken & How It Was Fixed ("What I broke and how I fixed it")

### 1.1 Form Keystroke Freezing & Re-mounting Bug
- **Penyebab:** Pada implementasi sebelumnya di `products/new.tsx` dan `products/$productId.tsx`, komponen menggunakan pembacaan `form.getFieldValue()` dan `form.setFieldValue()` dari `@tanstack/react-form` tanpa subskripsi reaktif yang tepat. Pada halaman edit, inisialisasi form terjadi sebelum data query produk selesai dimuat, menyebabkan input kehilangan fokus (*loss of focus*) dan menolak atau menghilangkan ketikan user di setiap *keystroke*.
- **Solusi:**
  1. Memisahkan form ke dalam komponen terisolasi (`EditProductForm` dan `ProductFormModal`) yang hanya dirender ketika data produk siap.
  2. Menggunakan *controlled state* React murni dengan *instant two-way binding* (`value` & `onChange`) yang responsif seketika tanpa *re-mounting*.
  3. Membangun modal interaktif `ProductFormModal` yang mendukung Create & Edit langsung dari tabel produk tanpa perlu berpindah halaman.

### 1.2 Route Param Resolution & TanStack Table v9 Typing
- **Penyebab:** 
  1. Versi TanStack Router yang digunakan mewajibkan penulisan parameter rute eksplisit `{ from: '/path/$param' }`. Pemanggilan tanpa opsi menyebabkan runtime error.
  2. Pada TanStack Table v9, pendefinisian array kolom mewajibkan pembungkusan dengan `columnHelper.columns([...])` agar inferensi tipe generic `ColumnDef` cocok dengan hook `useTable`.
- **Solusi:**
  1. Seluruh rute dinamis (`/products/$productId` dan `/users/$userId`) kini memanggil `useParams({ from: '/products/$productId' })` dan `useParams({ from: '/users/$userId' })` secara konsisten dan aman.
  2. Membungkus pendefinisian kolom dengan `useMemo(() => columnHelper.columns([...]), [columnHelper])` pada `products/index.tsx` dan `users/index.tsx`.

### 1.3 Biome Lint & Format Errors
- **Penyebab:** 
  1. `slider.tsx`: Penggunaan `key={index}` pada array elemen.
  2. `__root.tsx`: Peringatan `noDangerouslySetInnerHtml` pada skrip inisialisasi tema.
  3. `styles.css`: Aturan `@import "tw-animate-css"` diletakkan setelah `@plugin`, dan override properti *shorthand* `background` setelah `background-color`.
- **Solusi:**
  1. Memberikan key unik `key={`thumb-${index}`}` serta anotasi ignore yang terjustifikasi.
  2. Memberikan komentar `// biome-ignore lint/security/noDangerouslySetInnerHtml` terisolasi untuk skrip inline anti-flicker tema.
  3. Memindahkan `@import` ke bagian atas berkas CSS dan mengubah properti menjadi `background-image` yang valid. Hasil: `bun run lint` lolos 100% tanpa error.

### 1.4 Pembersihan Route Demo & Dead Links
- **Penyebab:** Masih terdapat route demo bawaan scaffold (`/demo/*`, `/about.tsx`) dan link yang mengarah ke route tersebut.
- **Solusi:** Menghapus folder `src/routes/demo` dan berkas `src/routes/about.tsx`. Mengarahkan alur login ke halaman login mandiri `/login` yang didesain dengan konsep glassmorphic Web3, lalu menjalankan `tsr generate` untuk meregenerasi `routeTree.gen.ts`.

---

## 2. Mitigasi Keamanan & Hardening (Security Enhancements)

### 2.1 Validasi Zod Server-Side pada Seluruh `createServerFn`
- Seluruh mutasi dan query parameter (`createProduct`, `updateProduct`, `deleteProduct`, `getProductById`, `updateUserRole`, `deleteUser`, `checkLoginRateLimit`, `reportLoginAttempt`) divalidasi ketat di sisi server menggunakan skema Zod.
- Melindungi aplikasi dari payload berbahaya, tipe data yang tidak sesuai, angka negatif, maupun string kosong/berlebih.

### 2.2 Pencegahan Self-Demotion & Self-Deletion
- **Anti Self-Demotion:** Pada fungsi `updateUserRole`, server memverifikasi identitas penyeru melalui sesi aktif (`requireAdmin()`). Jika admin mencoba menurunkan rolenya sendiri menjadi `user`, server menolak dengan HTTP 400 (`"Anda tidak dapat menurunkan peran (self-demotion) akun Anda sendiri"`).
- **Anti Self-Deletion:** Pada fungsi `deleteUser`, jika admin yang sedang login mencoba menghapus akunnya sendiri, server menolak dengan HTTP 400 (`"Anda tidak dapat menghapus akun Anda sendiri (self-deletion)"`).
- **Last Administrator Guard:** Server secara konsisten memastikan minimal 1 administrator tetap ada di dalam sistem untuk mencegah *admin lockout*.

### 2.3 Pembatasan Ukuran & Dimensi Gambar Produk (Maks 512px)
- **Sisi Klien (Client-side Canvas Downscaling):** Saat pengguna memilih file gambar di `ProductFormModal`, `new.tsx`, atau `$productId.tsx`, gambar dimuat ke objek `Image` dan di-render ulang melalui elemen HTML5 `Canvas` dengan batas dimensi maksimal 512x512 piksel dengan rasio aspek terjaga, menghasilkan format `image/jpeg` terkompresi (~30KB-100KB).
- **Sisi Server (Server-side Zod Validation):** Skema `productSchema` menerapkan batasan panjang payload base64 maksimal ~700KB dan memvalidasi format URI (`http://`, `https://`, atau `data:image/`).

### 2.4 Simulasi Rate-Limiting Percobaan Login
- Menambahkan pelacak percobaan login di sisi server (`loginRateLimitMap`).
- Pengguna yang mengalami kegagalan login sebanyak 5 kali berturut-turut pada email yang sama akan dikunci sementara selama 60 detik.
- Halaman `/login` menampilkan hitung mundur proteksi brute-force secara real-time.

### 2.5 Idempotensi Seeding (`/setup`)
- Fungsi `seedAdmin` dirombak agar idempoten penuh. Jika akun admin atau produk sudah ada di memori, pemanggilan ulang tidak akan menduplikasi produk atau menyebabkan *conflict crash*.

---

## 3. UI/UX Revitalisasi: Konsistensi Visual E-Commerce High-End (Gaya NORD)

Seluruh halaman telah dirombak secara total dan disatukan agar mengadopsi bahasa desain (*design system*) e-commerce high-end **NORD** yang bersih, mewah, dan sangat *user-friendly*:

1. **Skema Warna Luxury Cream & Jet Black Contrast:**
   - Latar belakang dasar *off-white / cream* lembut (`#F9F8F6`, `#F2EFE9`) di seluruh halaman publik dan admin.
   - Blok kontras hitam pekat (`#111111`) untuk bagian editorial dan tombol utama.
   - Kartu kontainer putih bersih (`#FFFFFF`) dengan border tipis minimalis (`#E5E2DC`) dan bayangan lembut (`shadow-xs` / `shadow-sm`).
   - Seluruh efek neon/glow ala dashboard masa lalu telah dihilangkan secara menyeluruh.

2. **Tipografi Modern & Sangat User-Friendly:**
   - **Teks Isi, Tabel, & Form:** Menggunakan font modern `Plus Jakarta Sans` dan `Inter` yang sangat bersih, nyaman dibaca di layar, dan memiliki kontras tajam.
   - **Judul Utama & Branding:** Menggunakan huruf kapital tegas dengan tracking berjarak renggang (`tracking-wider` / `tracking-[0.18em]`) serta tipografi display serif `Playfair Display` untuk jenama NORD / Ekraf Atelier.

3. **Konsistensi Visual Halaman demi Halaman:**
   - **Header & Navigasi Global:** Dilengkapi *announcement ticker* ("FREE SHIPPING ON ORDERS ABOVE $99"), logo NORD tebal di tengah, link navigasi bersih (Katalog, Dashboard, Pengguna, Setup), serta aksi keranjang/pencarian dan status auth.
   - **Beranda (Landing Page):** Mengadopsi hero section NORD dengan judul masif `NORD`, produk unggulan di atas podium batu brutalist, blok kontras hitam 3 kolom (Sneakers, Boots, Essentials), editorial split "RAW TEXTURES", bar 4 proposisi nilai (Fast Delivery, Easy Returns, Quality Assured, Secure Payment), grid produk "BEST OF NORD", dan arsip 16 Subsektor Ekraf.
   - **Katalog Produk (`/products`):** Menyediakan toggle tampilan Grid E-Commerce (kartu produk bersih berfoto jernih) dan Tabel Data TanStack Table v9 dengan pengurutan kolom dan pencarian interaktif.
   - **Admin Shell & Dashboard (`/dashboard`):** Panel samping (*sidebar*) bersih berwarna putih dengan border halus, navigasi aktif berlatar hitam pekat (`#111111`), 4 kartu metrik minimalis, dan ringkasan produk serta status sistem terverifikasi.
   - **Manajemen Pengguna (`/users` & `/users/$userId`):** Tabel pengguna putih bersih dengan tipografi yang sangat mudah dibaca, select dropdown peran yang elegan, serta proteksi keamanan anti self-demotion dan last admin guard.
   - **Setup & Auth (`/setup` & `/login`):** Kartu login dan setup putih bersih dengan tombol aksi tegas berwarna hitam pekat, form input responsif, dan pengamanan brute-force rate limiting.

---

## 4. Penyesuaian Header, Interaktivitas Tombol, & Warna Teks Tombol Utama

1. **Penambahan Menu HOME pada Header:**
   - Menambahkan tautan **HOME** di posisi paling kiri sebelum **KATALOG**, menghasilkan urutan navigasi: `HOME` | `KATALOG` | `DASHBOARD` | `PENGGUNA` | `SETUP`.
   - Mengembalikan tata letak tombol kanan (pencarian, wishlist, keranjang, sesi pengguna) ke posisi proporsional dan elegan di dalam kontainer `max-w-7xl mx-auto px-6` (tidak didorong mentok ke ujung layar).

2. **Fungsionalitas Interaktif Tombol Header:**
   - **Search:** Mengaktifkan modal pencarian interaktif yang menyaring seluruh katalog produk secara real-time dan mengarahkan langsung ke detail produk.
   - **Wishlist:** Tombol like interaktif terhubung dengan `useWishlist` (reactive store), menampilkan badge jumlah item, dan membuka drawer daftar item favorit.
   - **Cart:** Tombol keranjang belanja interaktif terhubung dengan `useCart`, menampilkan badge jumlah produk, drawer rincian belanja, pengatur kuantitas (`+` / `-`), subtotal dinamis, dan tombol checkout.

3. **Warna Teks & Ikon Tombol Utama (Wajib Putih):**
   - Menegaskan aturan `text-white` dan `[&_svg]:text-white` pada varian `default` di `src/components/ui/button.tsx` serta seluruh tombol berlatar gelap (`bg-[#111111]`) di Beranda, Katalog, Dashboard, Modals, Setup, dan Login. Tidak ada lagi teks tombol yang gelap atau tidak terbaca.

---

## 5. Koreksi Konten Ekraf, Aturan Keras Teks Tombol Putih, & Efek Interaktif (Hover States)

1. **Koreksi Konten: Kembali ke Ekonomi Kreatif Indonesia (Menghapus Produk Sepatu):**
   - Menghapus 100% referensi produk alas kaki (*sneakers, boots, shoes, sepatu*) di seluruh aplikasi.
   - Mengembalikan data sampel di `src/lib/server/auth.ts` (`seedAdmin`) dan etalase `CURATED_SHOWCASE` ke subsektor Ekonomi Kreatif Indonesia yang autentik:
     - **FoodLoop GIS Engine:** Platform logistik pangan & geospasial real-time untuk optimalisasi rantai pasok ekonomi kreatif kuliner lokal.
     - **UlosVerse AI Generative Suite:** Kecerdasan buatan pelestarian motif tenun Ulos tradisional resolusi tinggi untuk desainer grafis dan kriya.
     - **Tenun Ikat Sumba Timur Heritage:** Mahakarya kriya tekstil tradisional dengan pewarna alami akar mengkudu dan lumpur, ditenun tangan maestro pengrajin lokal.
     - **Saga Nusantara 3D Asset Pack:** Paket aset rigging 3D berstandar industri bertema arsitektur dan mitologi Nusantara untuk animator dan game developer.
   - Narasi di Beranda (`src/routes/index.tsx`) disesuaikan sebagai platform kurasi dan tata kelola 16 subsektor ekonomi kreatif Nusantara (bukan toko sepatu retail).
   - Ticker atas di Header disesuaikan menjadi "ETALASE RESMI 16 SUBSEKTOR EKONOMI KREATIF INDONESIA" dengan link kurasi dan panduan ekraf.

2. **Aturan Keras Kontras Teks Tombol (Wajib Putih Bersih):**
   - Menambahkan aturan CSS global di `src/styles.css` dengan `!important` untuk seluruh elemen tombol primer/gelap (`button.bg-[#111111]`, `button.bg-primary`, `[data-variant="default"]`, `[data-variant="destructive"]`, dan ikon SVG di dalamnya) agar seluruh label teks dan ikon **selalu berwarna putih murni (`#ffffff`)** tanpa terkecuali.
   - Menambahkan kelas eksplisit `!text-white [&_svg]:!text-white` di seluruh komponen tombol aksi (`Button`, `ProductFormModal`, `products/index.tsx`, `products/new.tsx`, `products/$productId.tsx`, `dashboard.tsx`, `setup.tsx`, `login.tsx`, dan drawer keranjang Header).

3. **Efek Interaktif & Hover States (Web Terasa Hidup & Elegan):**
   - **Cards & Containers:** Menambahkan utility `.hover-lift` serta kelas `hover:-translate-y-1.5 hover:shadow-xl hover:border-black transition-all duration-300` pada seluruh kartu produk, kartu metrik statistik dashboard (dengan efek inversi warna ikon), dan kartu subsektor ekraf.
   - **Image Zoom:** Menambahkan efek perbesaran gambar yang halus (`group-hover:scale-105 transition-transform duration-500`) saat kartu produk di-hover.
   - **Buttons & Links:** Seluruh tombol memiliki efek transisi halus saat disentuh kursor (`hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`), ikon panah bergeser dinamis (`group-hover:translate-x-1`), dan tombol aksi header memiliki pembesaran mikro (`hover:scale-110`).
   - **Tables & Rows:** Baris tabel pada katalog produk, manajemen pengguna, dan dashboard admin memiliki transisi warna latar yang halus (`transition-colors duration-200 hover:bg-neutral-50/90`).

---

## 6. Penyempurnaan Akhir: Pemaksaan Teks Tombol Putih Murni & Penggantian Gambar Estetik Ekraf Section 2

1. **Pemaksaan Mutlak Warna Teks & Ikon Tombol Utama (Wajib Putih Bersih):**
   - **Isolasi Selector Global Anchor (`src/styles.css`):** Membatasi aturan `a { color: var(--lagoon-deep); }` dan `a:hover { color: var(--sea-ink); }` dengan pseudo-selector `:not([class*="bg-"]):not([class*="text-"]):not([class*="btn"])`. Hal ini mencegah browser secara otomatis mewarnai teks link tombol menjadi hitam saat di-hover maupun saat normal.
   - **Aturan CSS Hover & Child Enforcement:** Menambahkan aturan CSS spesifik untuk seluruh tombol dan link berlatar gelap (`.bg-[#111111]`, `.bg-primary`, `[data-variant="default"]`, `[data-variant="destructive"]`) termasuk kondisi `:hover`, child element `*`, dan `svg` dengan `color: #ffffff !important`, `stroke: #ffffff !important`, dan `text-decoration: none !important`.
   - **Penegasan Kelas Komponen:** Seluruh tombol aksi utama ("JELAJAHI KATALOG", "DASHBOARD ADMIN", "+ Tambah Produk", "JELAJAHI KOLEKSI EKRAF", "Buat Produk", "Simpan Perubahan", "Jalankan Seed Admin", "Masuk ke Akun", dan "Proses Checkout") dipastikan memiliki kelas ganda `!text-white text-white [&_svg]:!text-white [&_svg]:text-white` baik pada tag pembungkus maupun tag `<span>` di dalamnya.

2. **Penggantian Gambar Section Kedua Beranda (`src/routes/index.tsx`):**
   - Menghapus gambar gradasi warna abstrak fluid (ungu-oranye) pada section *"WARISAN BUDAYA INOVASI DIGITAL"*.
   - Menggantikannya dengan fotografi editorial kurasi karya ekonomi kreatif beresolusi tinggi bertema **Desain Interior & Kriya Kontemporer Nusantara** (`https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=85`) yang menampilkan studio atelier arsitektur modern berhiaskan keramik kriya buatan tangan, pencahayaan alami yang hangat, serta lengkungan bingkai `rounded-2xl` dengan efek zoom hover yang halus.



