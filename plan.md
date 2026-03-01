
🚀 FinLabs: "Zero-Effort" AI Financial Assistant
Context & Implementation Blueprint untuk AI Developer (Claude)

1. UI/UX State Mapping & Data Relations
Aplikasi ini memiliki 4 halaman utama (Bottom Navigation). Berikut adalah pemetaan komponen UI dan bagaimana data saling mengalir di belakang layar.

Halaman Home (Dashboard)
Komponen: Header sapaan, Today's Spending Card (Total pengeluaran hari ini), Donut Chart (Pengeluaran harian/bulanan berdasarkan kategori: Snacks, Foods, Drinks, Entertainments), Quick Insight Card (Notifikasi proaktif dari AI), dan Budget Status (Circular progress bar untuk limit bulanan).
Relasi Data: Halaman ini adalah View-Only Aggregation. Donut Chart mengambil data agregasi dari tabel Transactions yang difilter hari/bulan ini. Budget Status menghitung rasio agregasi Transactions terhadap limit di tabel Budgets. Quick Insight di-generate oleh AI berdasarkan trigger pencapaian threshold budget tertentu (misal: >80%).
Halaman Timeline
Komponen: Search bar, Filter, Daftar transaksi yang dikelompokkan berdasarkan tanggal (Date Header). Tiap card transaksi menampilkan Nama Merchant, Kategori/Ikon, Sumber Dana (Mandiri, ShopeePay), dan Nominal.
Relasi Data: Ini adalah Source of Truth. Data mentah ditarik dari mock API Paylabs (metadata transaksi). Setiap entri di sini akan langsung mengubah status di Dashboard dan menjadi bahan analisis untuk AI Chat.
Halaman Subscription Payment
Komponen: Header navigasi "Back", Daftar Vampire Subscriptions yang berisi Logo Layanan, Nama Layanan (YouTube, Spotify, ChatGPT), Nominal, dan Tanggal Jatuh Tempo (Next Billing Date).
Relasi Data: Bersumber dari tabel Subscriptions (hasil deteksi pola transaksi berulang dari Paylabs). Halaman ini sangat krusial untuk fitur "Pemotongan Biaya" yang disarankan AI.
Halaman Chat AI (Pusat Intervensi)
Komponen: Visualisasi AI (Green Glowing Orb), Chat History/Bubbles (User & AI), Input Field (Teks & Voice).
Relasi Data: AI memiliki Read-Access ke seluruh schema JSON. Saat user bertanya (atau saat AI memberi intervensi proaktif), AI membaca state Budgets, Transactions, dan Subscriptions untuk merumuskan jawaban yang sangat terpersonalisasi.
2. User Flow MVP (Skenario Hackathon: The "Wow" Factor)
Flow ini dirancang untuk didemokan kepada juri Hackathon. Skenario ini mendemonstrasikan bagaimana aplikasi berubah dari sekadar pencatat manual menjadi asisten proaktif.

Langkah 1 (The Trigger): User membuka aplikasi dan melihat halaman Dashboard. Mata langsung tertuju pada bagian "Quick Insight" yang berwarna kuning/merah: "You've already used 80% of your foods budget this month."
Langkah 2 (The Inquiry): Khawatir kehabisan uang di akhir bulan, user berpindah ke tab Chat AI dan mengetik: "What's the easiest way to increase my saving for the rest of the month?"
Langkah 3 (The AI Analysis): AI (Claude) mengeksekusi logika di backend. Ia melihat Budgets makanan hampir habis, lalu menganalisis Subscriptions. AI merespons: "Pengeluaran harianmu untuk makanan sudah kritis. Saya mendeteksi kamu berlangganan Gemini Advanced dan ChatGPT Go sekaligus. Kamu bisa menghemat Rp70.000 bulan ini dengan membatalkan ChatGPT Go."
Langkah 4 (The Action): Pada bubble chat AI, terdapat tombol aksi pintar (Deep Link): [Review Subscriptions].
Langkah 5 (The Resolution): User menekan tombol tersebut, sistem langsung mengarahkan ke halaman Subscription Payment. User melihat daftar langganannya dan bisa langsung mengambil tindakan pemotongan.
3. Data Schema (Mental Model untuk Mock Backend)
Gunakan struktur JSON berikut sebagai mock database di memori klien aplikasi atau mock server sederhana. Representasi sederhana ini merefleksikan arsitektur meta-data Paylabs.

json
{
  "user": {
    "id": "U-101",
    "name": "Edward",
    "totalMonthlyGoal": 5000000
  },
  "budgets": [
    { "id": "B-01", "categoryId": "C-FOOD", "categoryName": "Foods", "limit": 1500000, "currentSpent": 1230000 },
    { "id": "B-02", "categoryId": "C-DRINK", "categoryName": "Drinks", "limit": 500000, "currentSpent": 250000 }
  ],
  "transactions": [
    {
      "id": "TX-991",
      "date": "2026-02-27T13:00:00Z",
      "merchant": "Indomaret",
      "amount": 23400,
      "paymentSource": "Mandiri",
      "categoryId": "C-SNACK",
      "paylabsMetadata": { "items": ["Lays", "Aqua"], "location": "Jakarta" }
    },
    {
      "id": "TX-992",
      "date": "2026-02-26T19:00:00Z",
      "merchant": "Sei Indonesia",
      "amount": 40000,
      "paymentSource": "ShopeePay",
      "categoryId": "C-FOOD",
      "paylabsMetadata": { "items": ["Paket Sei Sapi Reguler"], "location": "Jakarta" }
    }
  ],
  "subscriptions": [
    { "id": "SUB-1", "serviceName": "YouTube Premium", "amount": 69000, "nextBillingDate": "2026-03-01", "isVampireRisk": false },
    { "id": "SUB-2", "serviceName": "ChatGPT Go", "amount": 70000, "nextBillingDate": "2026-03-06", "isVampireRisk": true },
    { "id": "SUB-3", "serviceName": "Gemini Advanced", "amount": 309000, "nextBillingDate": "2026-03-09", "isVampireRisk": false }
  ]
}
4. Instruksi Transisi ke Developer (Claude Agent)
[PROMPT INSTRUCTION UNTUK DIBERIKAN KEPADA CLAUDE] "Claude, tugas utama kamu hari ini adalah membangun MVP FinLabs (Frontend UI + Mock State Management). Jangan buat sistem Autentikasi/Login atau integrasi database sungguhan, langsung hardcode JSON context di atas ke dalam sebuah Global State (Context API/Zustand jika React). Mulailah segera dengan membuat kerangka navigasi utamanya (Bottom Tab Bar) dan implementasikan Halaman Home (Dashboard) lengkap dengan Donut Chart dan Budget Status berdasarkan mock JSON tersebut. Setelah Dashboard selesai dirender dengan sempurna dan mirip mockup, fokus beralih pada perangkaian Skenario Hackathon: jadikan 'Quick Insight' di Dashboard dapat di-klik yang akan menavigasikan user ke halaman AI Chat untuk mengeksekusi Wow Factor pemotongan vampire subscription. Buat desain menggunakan Tailwind CSS dengan prioritas pada estetika yang persis dengan referensi."