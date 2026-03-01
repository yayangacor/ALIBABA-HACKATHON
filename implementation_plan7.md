# Rencana Implementasi: Peningkatan Fitur Chatbot (Vision & Ikon Langganan)

Dokumen ini berisi analisis dan rencana implementasi untuk dua fitur baru pada chatbot FinLabs:
1. **Dynamic Subscription Icons**: Menampilkan logo yang akurat secara pintar saat me-review langganan.
2. **Receipt Vision**: Fitur upload foto struk untuk membaca otomatis konteks gambar dan merekam data transaksi menggunakan `Qwen`.

## Analisis & Arsitektur Solusi

### 1. Pencarian Ikon/Gambar Langganan (Subscription Icons)
**Pertanyaan AI:** *Apakah applicable menggunakan image generation dari model Qwen untuk mencari/membuat gambar logo?*

**Analisis Tech Lead:**
Menggunakan Image Generation (seperti Tongyi Wanxiang / Stable Diffusion) untuk membuat logo secara *real-time* sangat **tidak direkomendasikan** karena:
- Waktu inferensi lambat (berdampak pada UX).
- AI generator sering berhalusinasi saat membuat teks/logo spesifik (misal logo YouTube warnanya malah biru, atau tulisannya "YouToobe").
- Biaya API akan membengkak jika fitur sering diakses.

**Solusi Profesional:**
Gunakan **Clearbit Logo API** dipadukan dengan ekstraksi domain pintar dari LLM.
- **Backend:** Instruksikan Qwen untuk merekem/menyediakan nama domain merchant (misal: "Netflix" -> "netflix.com").
- **Frontend:** Gunakan `https://logo.clearbit.com/netflix.com` sebagai referensi `<img src="...">`. Ini dijamin valid, instan, gratis dari Clearbit, dan UI akan langsung terlihat sangat premium!

### 2. Fitur Baca Struk Pembayaran (Receipt Vision)
**Pertanyaan AI:** *Apakah bisa menerima foto receipt dan membaca mengenai transaksi menggunakan model dari Qwen agar terekam ke data?*

**Analisis Tech Lead:**
**Sangat bisa dan ini adalah Killer Feature untuk Hackathon!**
Kita akan mengganti/meng-upgrade model Qwen untuk endpoint Chat dari text (`qwen-plus`) menjadi Vision-Language model yaitu **`qwen-vl-plus`** atau **`qwen-vl-max`** via Alibaba Cloud DashScope. Model ini dirancang untuk membaca konteks gambar (Struk/Invoice/Screenshot) secara akurat.

---

## User Review Required
> [!IMPORTANT]
> **Silakan setujui pendekatan berikut:**
> 1. Kita akan menggunakan **Clearbit API + Qwen Domain Extraction** untuk icon agar desain terlihat *sleek* & profesional alih-alih mencoba meng-generate logo dari nol. Setuju?
> 2. Untuk fitur Struk, user akan bisa mengetik teks, ATAU mengupload gambar, ATAU keduanya. Endpoint node.js akan dikonfigurasi menembak `qwen-vl-plus`, yang otomatis bisa menerima kombinasi gambar + teks. Setuju?

---

## Proposed Changes

### Frontend (User Interface)
#### [MODIFY] [src/pages/Chat.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Chat.jsx)
- Tambahkan icon kamera / attachment (Lucide React) di samping input teks chatbot.
- Tambahkan hidden `<input type="file" accept="image/*" />` lalu trigger `onClick`.
- Saat gambar dipilih, baca dengan `FileReader` ke Base64 (tambahkan juga utilitas kompresi Canvas agar ukuran file gambar tidak memicu error API payload terlalu besar).
- Render *preview* gambar berukuran kecil *(thumbnail)* di atas input field sebelum terkirim.
- Modifikasi payload di dalam `handleSend()` untuk mengirim string Base64 ke dalam payload `{ message, imageBase64, userId }` ketika melakukan POST ke `/api/chat`.
- (Untuk Ikon Langganan) Di komponen yang me-render daftar langganan di dalam Chat atau Timeline, tambahkan elemen `<img>` yang membaca dari state baru/respons aksi AI (sumber gambar: `https://logo.clearbit.com/${domain}`).

### Backend (Node.js & Qwen LLM)
#### [MODIFY] [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
- **DashScope API Update**: Ubah implementasi `POST /api/chat` agar dapat menerima `imageBase64`.
- **Conditional Model**: Jika ada gambar, gunakan model `qwen-vl-max`. Format `messages` dalam payload DashScope berubah dari *string content* biasa menjadi struktur objek multicontent (`[{ image: base64_image }, { text: user_prompt }]`).
- **Update System Prompt**: Tambahkan instruksi spesifik untuk model VL:
  *"Anda adalah intelligent finance assistant. Jika diberikan struk, ekstrak nama merchant, jumlah (hanya angka), kategori terbaik (Food, Transport, dll), dan tipe (expense/income). Lalu kembalikan [ACTION:ADD_TRANSACTION:<Merchant>:<Amount>:<Kategori>]. Jika ini merupakan interaksi mengenai daftar layanan berlangganan (subscriptions), keluarkan juga domain web resmi layanannya untuk keperluan ikon (contoh: youtube.com) dalam payload ACTION Anda. Jangan berhalusinasi."*

---

## Verification Plan

### Opsi 1: Automated / API Testing
- Siapkan skrip node.js sederhana untuk melakukan request POST ke `/api/chat` dengan payload base64 gambar dummy. Pastikan responnya sukses dan `ACTION` terurai dengan tepat.

### Opsi 2: Manual Verification (Demo Flow Hackathon)
1. **Fitur Upload Struk:**
   - Run `npm run dev` dan buka Browser Tab/Mobile View di `localhost:5173`.
   - Pilih tab Chatbot.
   - Klik icon Camera, upload gambar struk. Tekan Send.
   - Amati AI Loading, balasan teks mengenai analisis gambar, berikut tombol *"Catat Pengeluaran Rp X di Y"*.
   - Tekan tombol, cek Timeline/Home dashboard, transaksi harus merefleksikan nilai dari struk tersebut.
2. **Dynamic Subscription Logo:**
   - Minta bot untuk mereview subscriptions atau mencatat langganan baru (misal *Netflix*).
   - Pastikan di UI muncul list langganan beserta gambar logo resmi yang dilaod secara cepat dari internet.
