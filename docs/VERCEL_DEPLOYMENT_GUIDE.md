# Panduan Deployment Dual-Project Vercel (Monorepo)
## StandUp INDO Timika (`apps/web` & `apps/admin`)

Dokumen ini memandu proses deployment monorepo StandUp INDO Timika ke platform **Vercel** menjadi **dua project terpisah (*dual-project deployment*)**:
1. **Project 1 (`apps/web`)**: Halaman publik / Landing Page Komunitas (`https://standuptimika.com`).
2. **Project 2 (`apps/admin`)**: Operations Center / Dashboard Pengurus & Kurator (`https://admin.standuptimika.com`).

Kedua aplikasi terhubung ke database terpusat yang sama (**Neon Serverless PostgreSQL**) dan media storage yang sama (**Cloudinary**).

---

## 1. Arsitektur Monorepo & Deployment

```
Repository GitHub: standupindo_timika
├── apps/
│   ├── web/     ──▶ Vercel Project 1: standupindo-timika-web   (Root Directory: apps/web)
│   └── admin/   ──▶ Vercel Project 2: standupindo-timika-admin (Root Directory: apps/admin)
├── packages/
│   ├── ui/      ──▶ Shared UI (ditranspile otomatis via next.config.js)
│   ├── eslint-config/
│   └── typescript-config/
└── turbo.json   ──▶ Build orchestrator (Turborepo)
```

---

## 2. Setup Project 1: `apps/web` (Landing Page Publik)

### Langkah-langkah di Vercel Dashboard:
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) ➜ Klik **"Add New..."** ➜ Pilih **"Project"**.
2. Pilih repositori GitHub Anda (`standupindo_timika`).
3. Pada halaman **Configure Project**:
   * **Project Name**: `standupindo-timika-web` (atau sesuaikan).
   * **Framework Preset**: **Next.js**
   * **Root Directory**: Klik tombol **Edit** ➜ Pilih direktori **`apps/web`** ➜ Klik **Continue**.
     > [!IMPORTANT]
     > Biarkan opsi *"Include source files outside of the Root Directory in the Build Step"* tetap **aktif (checked)** agar Vercel dapat membaca dependensi monorepo di `packages/*`.
4. **Build & Development Settings**:
   * **Build Command**: `bun run build` (atau biarkan default Next.js).
   * **Output Directory**: `.next` (default).
   * **Install Command**: `bun install`.
5. **Environment Variables**:
   Tambahkan variabel berikut (salin dari `apps/web/.env.example`):

| Variable Name | Environment | Deskripsi | Contoh Nilai |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Production, Preview | Direct Neon connection string | `postgresql://neondb_owner:***@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_URL_POOLED` | Production, Preview | **Pooled Neon connection string** (wajib berakhiran `-pooler`) | `postgresql://neondb_owner:***@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Production, Preview | Cloud name Cloudinary untuk delivery gambar | `dv2tmhzk9` |
| `NEXT_PUBLIC_SITE_URL` | Production | Domain utama website publik | `https://standuptimika.com` |
| `NEXT_PUBLIC_ADMIN_URL` | Production | Domain dashboard admin untuk navigasi | `https://admin.standuptimika.com` |

6. Klik **Deploy**.

---

## 3. Setup Project 2: `apps/admin` (Dashboard Admin)

### Langkah-langkah di Vercel Dashboard:
1. Buka [Vercel Dashboard](https://vercel.com/dashboard) ➜ Klik **"Add New..."** ➜ Pilih **"Project"**.
2. Pilih repositori GitHub yang sama (`standupindo_timika`).
3. Pada halaman **Configure Project**:
   * **Project Name**: `standupindo-timika-admin` (atau sesuaikan).
   * **Framework Preset**: **Next.js**
   * **Root Directory**: Klik tombol **Edit** ➜ Pilih direktori **`apps/admin`** ➜ Klik **Continue**.
     > [!IMPORTANT]
     > Pastikan opsi *"Include source files outside of the Root Directory in the Build Step"* tetap **aktif (checked)**.
4. **Build & Development Settings**:
   * **Build Command**: `bun run build`.
   * **Output Directory**: `.next` (default).
   * **Install Command**: `bun install`.
5. **Environment Variables**:
   Tambahkan variabel berikut (salin dari `apps/admin/.env.example`):

| Variable Name | Environment | Deskripsi | Contoh Nilai |
| :--- | :---: | :--- | :--- |
| `DATABASE_URL` | Production, Preview | Direct Neon connection string | `postgresql://neondb_owner:***@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `DATABASE_URL_POOLED` | Production, Preview | **Pooled Neon connection string** (wajib berakhiran `-pooler`) | `postgresql://neondb_owner:***@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require` |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Production, Preview | Cloud name Cloudinary | `dv2tmhzk9` |
| `CLOUDINARY_CLOUD_NAME` | Production, Preview | Cloud name Cloudinary | `dv2tmhzk9` |
| `CLOUDINARY_API_KEY` | Production, Preview | Cloudinary API Key | `125352644565991` |
| `CLOUDINARY_API_SECRET` | Production, Preview | Cloudinary API Secret (server-only) | `fMNEG3BgJTxa12oS3pF9L8bzZw8` |
| `STORAGE_PROVIDER` | Production, Preview | Provider storage | `cloudinary` |
| `AUTH_SECRET` | Production, Preview | Secret key hashing session (min. 32 char) | `32+ random characters string` |
| `JWT_SECRET` | Production, Preview | Secret key autentikasi | `32+ random characters string` |
| `NEXT_PUBLIC_WEB_URL` | Production | Domain utama website publik | `https://standuptimika.com` |
| `NEXT_PUBLIC_APP_URL` | Production | Domain utama dashboard admin | `https://admin.standuptimika.com` |
| `NEXT_PUBLIC_ADMIN_URL` | Production | Domain utama dashboard admin | `https://admin.standuptimika.com` |

6. Klik **Deploy**.

---

## 4. Konfigurasi Neon Connection Pooling

Untuk memastikan aplikasi tidak mengalami kendala *Connection Exhaustion* saat terjadi lonjakan pengunjung:
1. Buka [Neon Console](https://console.neon.tech).
2. Pilih Project Anda ➜ Masuk ke menu **Connection Details**.
3. Centang opsi **Connection pooling**.
4. Salin string koneksi yang muncul. Perhatikan bahwa host Neon akan otomatis memiliki akhiran `-pooler`, contoh:
   ```
   ep-plain-unit-a5lgcbku-pooler.us-east-2.aws.neon.tech
   ```
5. Masukkan string koneksi ini ke dalam environment variable **`DATABASE_URL_POOLED`** di kedua Project Vercel.
6. Driver `postgres-js` pada kedua aplikasi sudah dioptimasi dengan singleton pattern (`globalThis._postgresSql`) dan pool limit serverless (`max: 1`) saat berjalan di Vercel (`VERCEL=1`), mencegah cold-start bottleneck.

---

## 5. Optimalisasi Build Minute (Ignored Build Step)

Untuk menghemat kuota build Vercel agar perubahan pada `apps/web` tidak memicu build ulang pada `apps/admin` (dan sebaliknya), gunakan fitur **Ignored Build Step** di Vercel:

1. Di Project Settings `standupindo-timika-web` ➜ **Git** ➜ **Ignored Build Step**:
   * Masukkan perintah:
     ```bash
     npx turbo-ignore --fallback=HEAD^1
     ```
2. Di Project Settings `standupindo-timika-admin` ➜ **Git** ➜ **Ignored Build Step**:
   * Masukkan perintah:
     ```bash
     npx turbo-ignore --fallback=HEAD^1
     ```

Turborepo akan otomatis memeriksa apakah terdapat perubahan file di aplikasi terkait atau shared packages sebelum memulai build.

---

## 6. Checklist Verifikasi Pre-Flight (Lokal)

Sebelum melakukan push ke GitHub / Vercel, pastikan seluruh tes kompilasi lokal berhasil:

```bash
# 1. Typecheck kedua project
bun run --cwd apps/web check-types
bun run --cwd apps/admin check-types

# 2. Build selektif dari root monorepo
bun run build:web
bun run build:admin

# 3. Build langsung dari sub-direktori
bun run --cwd apps/web build
bun run --cwd apps/admin build
```
Semua perintah di atas harus keluar dengan status **code 0 (exit 0)** tanpa error kompilasi.
