# Implementation Plan: Authentication & Voice-Driven Personalization

## Goal Description
Implement an authentication flow (Google Auth) restricting the main app to logged-in users, paired with a voice-driven AI onboarding experience using Qwen Speech-to-Text. The goal is to collect user personalization data (financial goals, constraints, persona) seamlessly while maximizing user trust and privacy for the FinLabs MVP.

## Privacy & Trust Strategy (Business Logic)
Untuk mengatasi skeptisisme pengguna mengenai privasi, terapkan 4 prinsip ini:
1. **Transparansi & Pilihan (Opt-in)**: Beritahu pengguna *kenapa* kita meminta akses suara ("Ceritakan sedikit tentang dirimu agar FinLabs bisa menjadi asisten yang lebih personal"). Selalu sediakan tombol **"Atau ketik manual"** sebagai fallback jika mereka enggan berbicara.
2. **Proses Ephemeral (Audio Tidak Disimpan)**: Yakinkan pengguna di dalam UI bahwa suara mereka hanya dikonversi menjadi teks (transcribed), dan file audio *tidak akan disimpan* setelah proses selesai.
3. **Review & Konfirmasi (User Control)**: Setelah Qwen mengekstrak data dari suara (Goals, Constraints, Persona), **jangan langsung disimpan diam-diam**. Tampilkan ringkasan hasil AI ke layar. Biarkan pengguna melihat, mengedit, dan menekan tombol "Konfirmasi & Simpan". Ini memberi mereka rasa aman bahwa AI menangkap data dengan benar dan tidak ada data lain yang diambil bersamanya.
4. **Visual "Secure & Premium"**: Pasang lencana visual (misal: ikon gembok, "Powered by Secure Alibaba Cloud Qwen AI") di halaman onboarding untuk memberikan reassurance secara psikologis.

## Proposed Changes

### Database Layer
#### [MODIFY] server/db.js
- Update skema tabel `users` untuk menyertakan `google_id`, `email`, `name`, `avatar_url`.
- Buat skema tabel baru `user_profiles` dengan kolom: `user_id`, `financial_goals` (Teks), `money_constraints` (Teks), `persona_type` (Enum: Student, Employed, dll).

### Backend Layer
#### [MODIFY] server/package.json
- Tambahkan dependency: `google-auth-library` (untuk verifikasi token Google) dan `multer` (untuk penerimaan file audio/Blob dari frontend).
#### [MODIFY] server/server.js
- **Google Auth Endpoint**: `POST /api/auth/google` yang menerima idToken dari frontend, memverifikasinya, dan mengembalikan user data + session token internal.
- **Voice Onboarding Endpoint**: `POST /api/onboarding/transcribe`. Endpoint ini akan:
  1. Menerima file audio (via multer).
  2. Memanggil **Qwen Speech-to-Text (STT)** API untuk mendapatkan transkrip lengkap.
  3. Mengirim transkrip ke **Qwen LLM** dengan system prompt untuk mengekstrak JSON spesifik (persona, goals, constraints).
  4. Mengembalikan JSON tersebut ke frontend untuk direview.
- **Save Profile Endpoint**: `POST /api/user/profile` untuk menyimpan data yang sudah dikonfirmasi user ke database.

### Frontend Layer
#### [MODIFY] src/App.jsx
- Implementasikan logic routing:
  - Belum login -> `<LandingPage />`
  - Auth berhasil, tapi belum punya profil -> `<OnboardingPage />`
  - Auth selesai & profil lengkap -> Masuk ke Main App (BottomNav, Home, dsb).
#### [NEW] src/pages/LandingPage.jsx
- Halaman awal (marketing copy) dengan tombol "Sign in with Google" (@react-oauth/google).
#### [NEW] src/pages/OnboardingPage.jsx
- UI interaksi suara (Microphone Button). Menggunakan `MediaRecorder` API bawaan browser untuk merekam suara dan mengirim Float32Array/Blob audio ke backend.
- UI Review Data: Form atau Card yang menampilkan hasil tangkapan Qwen (Misal: "Tujuanmu: Beli Rumah, Kendala: Boros ngopi, Status: Karyawan"). Bisa diedit sebelum di-submit.
#### [MODIFY] src/store/appStore.js
- Tambahkan state `user` (menyimpan info login) dan status onboarding.
- Tambahkan fungsi async untuk auto-login saat aplikasi reload jika token ada di LocalStorage.

## Verification Plan
### Automated & Manual Verification
- **Testing Frontend**: Memastikan tombol login Google muncul saat app dimulai dalam state unauthenticated.
- **Testing Mic Recording**: Memastikan browser meminta izin microphone, merekam suara dengan jelas, dan berhasil dikirim ke server (Network Tab).
- **Testing AI Extraction**: Mengecek respond dari endpoint `/api/onboarding/transcribe` bahwa suara seperti "Halo, saya Budi, masih kuliah tapi uang jajan selalu habis untuk nongkrong, target saya mau nabung untuk beli laptop" bisa diubah jadi JSON `{ persona: "Student", constraints: "Pengeluaran tidak terkontrol untuk hangout", financial_goals: "Membeli Laptop" }`.
- **Testing DB**: Memastikan data tersimpan di tabel `user_profiles` dan berhasil ditampilkan sapaannya di Dashboard `Home.jsx`.
