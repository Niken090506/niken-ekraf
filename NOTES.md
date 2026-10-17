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

## 3. UI/UX Revitalisasi (Web3 Startup Aesthetic Alignment)

1. **Palet Warna Deep Teal / Hijau-Kebiruan Gelap:** Mengadopsi warna dasar `#071519` hingga `#0d252c` dengan aksen luminous teal (`#2dd4bf`), emerald (`#10b981`), dan cyan glow.
2. **Kartu Glassmorphism:** Panel semi-transparan dengan `backdrop-blur-xl`, border tipis bercahaya `border-white/10`, serta efek bayangan halus bernuansa Web3.
3. **Tombol Aksi Kapsul (Pill-Shaped):** Seluruh CTA utama menggunakan desain kapsul melengkung penuh (`rounded-full`) dengan efek hover glow.
4. **Tipografi Editorial Elegan:** Judul halaman menggunakan tipografi serif `Fraunces` dengan gaya editorial berpadu dengan sans-serif modern `Manrope` / `Space Grotesk`.
5. **Admin Shell & Sidebar Interaktif:** Layout admin modern dengan sidebar yang dapat diciutkan (*collapsible*), mobile drawer responsif berikon `lucide-react`, profil aktif pengguna, dan navigasi cepat.
