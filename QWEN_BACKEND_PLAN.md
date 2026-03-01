# FinLabs Backend & Qwen AI Implementation Plan

## 1. Arsitektur & Tech Stack
- **Backend Framework**: Node.js dengan Express.js (Ringan dan satu ekosistem dengan Frontend React).
- **Database**: Karena ini MVP Hackathon, kita tetap menggunakan Mock JSON Data, tetapi memindahkannya ke Backend di memori server atau file `.json` lokal. Frontend akan mengambil data melalui REST API.
- **AI Service**: **Alibaba Cloud Qwen AI** melalui **DashScope API**. Model yang dapat digunakan adalah `qwen-turbo` atau `qwen-max` untuk keseimbangan kecepatan dan kualitas respon.

## 2. API Endpoints Plan
- `GET /api/dashboard`: Mengembalikan data budget, insight, dan data chart (donut chart).
- `GET /api/transactions`: Mengembalikan history transaksi yang di-group per tanggal.
- `GET /api/subscriptions`: Mengembalikan daftar list langganan "vampire".
- `POST /api/chat`: Endpoint untuk melayani komunikasi Chatbot. 
  - **Input**: `{ "messages": [{ "role": "user", "content": "..." }] }`
  - **Output**: `{ "reply": "...", "action": "NAVIGATE_TO_SUBSCRIPTIONS" }` (Action bersifat opsional jika Qwen menyarankan review langganan).

## 3. Integrasi Qwen AI (DashScope)
- Backend akan memiliki **System Prompt** khusus saat memanggil Qwen AI yang menyatakan:
  *"Anda adalah FinLabs AI, asisten keuangan pribadi yang cerdas. Berikan jawaban singkat, proaktif, dan profesional dengan sentuhan premium tech. Jika pengguna bertanya soal pengeluaran berulang atau langganan, sertakan instruksi khusus di akhir jawaban agar frontend dapat memunculkan tombol 'Review Subscriptions'."*
- Menggunakan SDK resmi DashScope atau HTTP Request langsung ke API Endpoint Alibaba Cloud.

## 4. Perubahan di Frontend
- Update `src/store/appStore.js`: Mengganti data statis dengan fungsi `fetchData()` yang menembak ke `http://localhost:3000/api/...`.
- Update `src/pages/Chat.jsx`: Menghubungkan input pengguna ke endpoint `POST /api/chat`, menampilkan indikator *loading/thinking*, dan menangani render respons (mengenali jika ada UI action/tombol).
