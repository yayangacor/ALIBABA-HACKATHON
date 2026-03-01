# Implementation Plan: Personalization & Data Integrity

Sebagai Tech Leader, saya telah menganalisis arsitektur eksisting di [MEMORY.md](file:///d:/WORK/HACKATHON/AliBaba2/MEMORY.md) dan permasalahan struktural generasi muda di `Riset Fintech.txt`. Berikut adalah rancangan perbaikan untuk aplikasi FinLabs.

## 1. Kategori Money Constraints (Maksimal 3 Kata)
Berdasarkan keluhan yang ditemukan di riset (Latte Factor, FOMO/Paylater, tidak ada dana darurat, dan malas mencatat), kita akan membakukan masalah keuangan (money constraints) menjadi pilihan berikut:
1. **Bocor Pengeluaran Kecil** (Fenomena *Latte factor* / Jajan mikro)
2. **Gaji Cepat Habis** (Siklus paycheck-to-paycheck / Ketiadaan dana darurat)
3. **Terjerat Cicilan Paylater** (FOMO & utang konsumtif gaya hidup)
4. **Malas Catat Manual** (Fatigue pencatatan, friksi sosiologis)

## User Review Required
Apakah 4 kategori di atas sudah sesuai dengan visi produk MVP ini? Jika setuju, ini akan diimplementasikan sebagai UI *Chips* (Select Choice) di halaman Onboarding.

## Proposed Changes

### Frontend Personalization (Onboarding)
- Modifikasi UI di fase "Review & Confirm" pada Onboarding.
- Ganti input *textarea* bebas untuk `money_constraints` menjadi kumpulan tombol pilihan (Choice Chips) menggunakan 4 kategori di atas.
- Pastikan ekstraksi LLM (Qwen STT) dipandu untuk *map* hasil transkripsi ke salah satu dari kategori baku tersebut (jika memungkinkan), dan pengguna bisa mengubahnya via klik.

#### [MODIFY] [src/pages/OnboardingPage.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/OnboardingPage.jsx)
- Ubah *render* field `money_constraints`.

### Backend & LLM Prompting
- Perbarui *system prompt* di endpoint transkripsi agar Qwen secara spesifik hanya mengembalikan salah satu dari 4 opsi kategori untuk *money constraints*.

#### [MODIFY] [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
- Sesuaikan instruksi pada `POST /api/onboarding/transcribe`.

### Data Integrity (Mock Data Bug Fix)
Masalah saat *sign up* data lama / *mock* masih muncul kemungkinan disebabkan oleh *state* global Zustand (`appStore.js`) yang memuat data lokal atau endpoint `/api/data` di backend yang belum menyesuaikan data berdasarkan *user* yang sedang *login*.

#### [MODIFY] [src/store/appStore.js](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js)
- Pastikan rutinitas *fetching* (`fetchAppData`) menghapus atau menimpa struktur *mock data* dengan *array* kosong jika database asli memang kosong untuk *user* baru, bukan *fallback* ke data simulasi lama.

#### [MODIFY] [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
- Periksa endpoint `GET /api/data`:
  - Jika belum ada data *transactions/subscriptions* untuk `google_id` atau `user_id` tertentu pengguna yang baru mendaftar, kembalikan *array* kosong `[]` (bukan data sampel dari tabel).
  - Pastikan *query* mengambil data dengan filter `WHERE user_id = ?`.

## Verification Plan
### Manual Verification
1. Login dengan akun Google baru.
2. Selesaikan *onboarding* suara/teks; verifikasi UI *Constraint* berupa tombol/pilihan, bukan teks bebas.
3. Setelah masuk *dashboard* utama, verifikasi grafik, total *budget*, dan riwayat transaksi kosong/bersih (0 rupiah), tidak memakai riwayat dari *testing* sebelumnya.
