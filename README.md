# Agrego Web

Agrego Web adalah aplikasi frontend PWA (Progressive Web App) untuk platform koperasi digital **Agrego**. Aplikasi ini dibangun dengan performa tinggi menggunakan React 19, TypeScript, Vite 8, dan Tailwind CSS v4, didukung oleh Convex sebagai backend real-time dan database.

---

## 🛠️ Arsitektur Teknologi (Tech Stack)

Aplikasi ini menggunakan kombinasi teknologi modern untuk memastikan performa maksimal, kemudahan pemeliharaan, serta pengalaman pengguna yang responsif:

### 1. Frontend Core & Bundler

- **React 19**: Versi React terbaru dengan fitur optimal seperti automatic JSX runtime dan integrasi **React Compiler** (`babel-plugin-react-compiler`) untuk optimasi rendering otomatis secara out-of-the-box.
- **TypeScript**: Skrip yang diketik dengan aman (typed) dengan resolusi modul modern (`tsconfig.json` & `tsconfig.app.json`).
- **Vite 8**: _Build tool_ generasi baru yang sangat cepat untuk _HMR (Hot Module Replacement)_ saat pengembangan dan optimasi bundel produksi.

### 2. State & Data Layer (Backend)

- **Convex**: Layanan _backend-as-a-service_ real-time. Berfungsi untuk mendefinisikan skema basis data (`convex/schema.ts`), mengelola fungsi query/mutation, serta menghasilkan tipe data TypeScript otomatis untuk klien frontend (`convex/_generated/`).

### 3. Antarmuka & Styling (UI/UX)

- **Tailwind CSS v4**: Menggunakan integrasi `@tailwindcss/vite` untuk pemrosesan CSS secepat kilat dengan fitur-fitur CSS modern terkini.
- **Radix UI**: Primitif komponen UI tanpa gaya (headless) untuk membangun antarmuka yang aksesibel dan interaktif.
- **Lucide React**: Set ikon SVG rancangan modern.
- **React Hot Toast**: Notifikasi toast dinamis yang ringan dan menarik.

### 4. Routing & Form Management

- **React Router DOM v7**: Manajemen navigasi halaman, pencocokan rute, dan proteksi berbasis peran (role-based auth).
- **React Hook Form & Zod**: Penanganan formulir yang efisien dengan skema validasi tipe data yang aman (type-safe validation).

### 5. PWA (Progressive Web App)

- **Vite PWA Plugin**: Dikonfigurasi dalam `vite.config.ts` agar aplikasi dapat dipasang (_installable_), memiliki _service worker_ untuk caching offline, dan mendukung pembaruan aplikasi secara mulus.

### 6. Linting & Tooling

- **Bun**: Sebagai _runtime_ JavaScript/TypeScript, _package manager_ yang cepat, dan pengeksekusi script.
- **Oxlint**: Alat linter modern dari ekosistem Oxc yang ditulis dalam Rust, memberikan analisis kode super cepat untuk mendeteksi error dengan efisien.

---

## 📂 Struktur Direktori Utama

- `convex/`: Berisi skema basis data, logika query, dan mutation Convex backend.
- `src/`: Kode sumber utama aplikasi.
  - `src/components/`: Komponen UI modular (layout, dashboard, forms, display data).
  - `src/config/`: Konfigurasi navigasi, penentuan hak akses peran (role-based), dan pemetaan rute.
  - `src/lib/`: Fungsi utilitas, logika otentikasi local storage, dsb.
  - `src/pages/`: Halaman-halaman utama aplikasi (Dashboard, QC, Deposit, Kontrak, Profil, dll).
  - `src/styles/`: Berisi penyesuaian gaya CSS.
  - `src/App.tsx`: Gerbang masuk aplikasi utama yang mengurus inisialisasi state otentikasi dan struktur routing.
  - `src/main.tsx`: Entrypoint inisialisasi React ke DOM.

---

## 🚀 Cara Menjalankan Aplikasi

Ikuti langkah-langkah di bawah ini untuk menjalankan aplikasi Agrego Web di lingkungan pengembangan lokal Anda.

### 📋 Prasyarat

Pastikan Anda sudah menginstal **Bun** di komputer Anda. Jika belum, Anda dapat menginstalnya dengan perintah berikut (atau merujuk ke [situs resmi Bun](https://bun.sh)):

```bash
powershell -Command "iwr https://bun.sh/install.ps1 | iex"
```

### 🏃 Langkah Pengembangan Lokal

1.  **Clone Repositori dan Masuk ke Direktori Project**

    ```bash
    git clone <repository_url>
    cd agrego-web
    ```

2.  **Instal Dependensi**
    Gunakan Bun untuk proses instalasi yang cepat:

    ```bash
    bun install
    ```

3.  **Konfigurasi Environment Variables**
    Buat file `.env.local` di direktori root proyek dan isi dengan credential deployment Convex Anda (contoh):

    ```env
    CONVEX_DEPLOYMENT=dev:warmhearted-fennec-411
    VITE_CONVEX_URL=https://warmhearted-fennec-411.convex.cloud
    VITE_CONVEX_SITE_URL=https://warmhearted-fennec-411.convex.site
    ```

4.  **Jalankan Backend Convex**
    Buka terminal baru dan jalankan layanan dev Convex. Ini akan memantau skema, menyinkronkan fungsi cloud, dan memperbarui definisi tipe data klien secara otomatis:

    ```bash
    bun run dev:convex
    ```

5.  **Jalankan Server Development Frontend**
    Di terminal utama Anda, jalankan server pengembangan Vite:
    ```bash
    bun run dev
    ```
    Aplikasi akan berjalan dan dapat diakses di browser pada alamat [http://localhost:5173](http://localhost:5173).

---

## 📦 Script Perintah yang Tersedia

Berikut adalah perintah-perintah yang dapat dijalankan menggunakan Bun:

- `bun run dev`: Menjalankan server pengembangan Vite secara lokal.
- `bun run dev:convex`: Menjalankan client sinkronisasi backend Convex dev.
- `bun run build`: Memeriksa tipe data dengan TypeScript compiler (`tsc`) dan membangun bundel produksi teroptimasi ke direktori `dist/`.
- `bun run preview`: Menjalankan server lokal untuk melihat hasil build produksi di `dist/`.
- `bun run lint`: Menjalankan linter **Oxlint** untuk mendeteksi kesalahan sintaks dan masalah kualitas kode dengan cepat.
- `bun run deploy`: Membangun bundel produksi (`dist/`) dan mendeploy aplikasi ke Cloudflare Workers (dengan fitur Assets) secara langsung menggunakan Wrangler.

---

## 🌐 Deployment ke Cloudflare Workers (dengan Assets)

Aplikasi ini siap dideploy ke **Cloudflare Workers** menggunakan fitur **Workers Assets** yang memungkinkan hosting aset statis di jaringan edge Cloudflare.

### Konfigurasi Cloudflare Workers (`wrangler.toml`)
Konfigurasi didefinisikan pada file `wrangler.toml` di direktori root:
```toml
name = "agrego-web"
compatibility_date = "2024-11-01"

[assets]
directory = "./dist"
not_found_handling = "single-page-application"
```
*   `directory = "./dist"`: Direktori hasil build produksi.
*   `not_found_handling = "single-page-application"`: Mengatur agar semua rute yang tidak ditemukan langsung dialihkan ke `/index.html` dengan status `200 OK` (sangat penting untuk routing SPA seperti React Router DOM agar tidak mengembalikan 404).

### Cara Mendeploy Langsung via CLI (Wrangler)
1.  Jalankan perintah deploy menggunakan Bun:
    ```bash
    bun run deploy
    ```
2.  Jika ini adalah pertama kalinya Anda menggunakan Wrangler di komputer Anda, Anda akan diminta untuk masuk (login) ke akun Cloudflare melalui browser.
3.  Wrangler akan otomatis mendeploy aplikasi sebagai Worker statis.

### Catatan Penting (Environment Variables)
Pastikan Anda menambahkan environment variables untuk backend Convex pada panel dashboard Cloudflare Workers Anda di bagian **Settings -> Variables -> Environment Variables**:
*   `VITE_CONVEX_URL`: URL API Convex Anda (misalnya `https://xxx.convex.cloud`).
*   `VITE_CONVEX_SITE_URL`: URL site/HTTP actions Convex Anda (misalnya `https://xxx.convex.site`).
