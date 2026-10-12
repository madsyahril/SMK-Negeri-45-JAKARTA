# Panduan Konfigurasi Supabase PostgreSQL & Deployment SI-PKL SMART

Dokumen ini berisi panduan lengkap langkah demi langkah untuk mengintegrasikan backend Supabase PostgreSQL, autentikasi pengguna, penyimpanan foto privat, dan aturan keamanan (Row Level Security) ke dalam aplikasi **SI-PKL SMART**.

---

## 1. Membuat Project Supabase

1. Buka [https://supabase.com](https://supabase.com) dan masuk ke dashboard.
2. Klik tombol **New Project**.
3. Isi informasi project:
   - **Name**: `SI-PKL SMART` (atau nama sekolah Anda)
   - **Database Password**: Buat password yang kuat dan simpan dengan aman.
   - **Region**: Pilih region terdekat dengan lokasi Anda (misal: `Singapore (ap-southeast-1)`).
4. Klik **Create new project** dan tunggu proses provisioning selama 1–2 menit.

---

## 2. Menjalankan Skema Database & Migrasi SQL

1. Di dashboard Supabase, buka menu **SQL Editor** pada navigasi sebelah kiri.
2. Klik **New query**.
3. Buka file `/supabase/schema.sql` di proyek ini, salin seluruh kodenya, dan tempelkan ke SQL Editor.
4. Klik **Run** (atau tekan `Ctrl+Enter`).
5. Pastikan semua tabel berikut berhasil dibuat:
   - `profiles`
   - `classes`
   - `industries`
   - `students`
   - `attendance_records`
   - `absence_requests`
   - `audit_logs`
   - Beserta fungsi RLS dan index pencarian.

---

## 3. Membuat Storage Bucket Privat untuk Foto Presensi

Peraturan privasi siswa mengharuskan foto disimpan dalam **bucket privat**, diakses melalui *Signed URL* berjangka waktu (bukan URL publik).

1. Buka menu **Storage** di dashboard Supabase.
2. Klik **Create new bucket**:
   - **Bucket Name**: `attendance-photos`
   - **Public bucket**: **MATIKAN (Private)**
   - **Allowed MIME types**: `image/jpeg, image/png, image/webp`
   - **Max file size**: `5 MB`
3. Buat bucket kedua untuk lampiran surat:
   - **Bucket Name**: `absence-attachments`
   - **Public bucket**: **MATIKAN (Private)**
4. Pada tab **Policies**, tambahkan storage policy agar:
   - Pengguna terautentikasi dapat mengunggah file (`INSERT`).
   - Siswa dan guru yang berwenang dapat membaca file melalui Signed URL (`SELECT`).

---

## 4. Konfigurasi Variabel Lingkungan (.env)

1. Di dashboard Supabase, buka menu **Project Settings** > **API**.
2. Salin:
   - **Project URL** (contoh: `https://xyzcompany.supabase.co`)
   - **anon / public key** (kunci publik aman untuk sisi client)
3. Buat file `.env` di root direktori aplikasi (atau atur di panel hosting):

```env
VITE_SUPABASE_URL="https://xyzcompany.supabase.co"
VITE_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## 5. Akun Pengguna Demo & Struktur Peran

Aplikasi menyediakan 4 peran:
1. **Siswa (`student`)**: Melakukan presensi GPS & kamera, mengajukan izin/sakit, melihat riwayat pribadi.
2. **Guru Pembimbing (`advisor`)**: Memantau siswa bimbingannya, memeriksa bukti & peta radius, validasi pengajuan, catatan pembinaan.
3. **Wali Kelas (`homeroom`)**: Memantau seluruh siswa di kelas, rekap harian/bulanan, verifikasi foto & lokasi, audit koreksi resmi.
4. **Administrator (`admin`)**: Manajemen data siswa, kelas, DUDI/industri, pengaturan radius geofence, dan cetak laporan.

Jika Supabase belum terhubung, aplikasi secara otomatis berjalan dalam **Mode Demo Aktif** dengan data realistis yang tersimpan persisten di LocalStorage peramban pengguna.

---

## 6. Deployment ke Server Produksi

Aplikasi siap di-build dan di-deploy ke platform seperti Vercel, Netlify, Cloudflare Pages, atau Cloud Run:

```bash
# 1. Install dependencies
npm install

# 2. Build aplikasi produksi
npm run build

# 3. Preview hasil build
npm run preview
```

Pastikan server produksi menggunakan protokol **HTTPS** agar fitur Web API kamera (`navigator.mediaDevices`) dan GPS (`navigator.geolocation`) dapat diakses oleh browser mobile siswa.
