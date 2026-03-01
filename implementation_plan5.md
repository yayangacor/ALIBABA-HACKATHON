# Implementation Plan

Goal: Menghapus halaman subscriptions, memperbarui Bottom Navigation (Home, Transaction, Chat, Insight), dan membangun halaman Insight baru dengan fitur analisis dari *Net Income*, *Spend*, *Categories*. Menyesuaikan budgeting secara manual dan penambahan kategori baru juga akan diimplementasikan. Menunggu screenshot referensi dari Anda untuk memvisualisasikan persentase pencapaian target finansial.

## User Review Required
1. Menunggu referensi screenshot dari Anda untuk visualisasi progress "uang yang terkumpul untuk mencapai target finansial".

## Proposed Changes

### Frontend Navigation & State
- **[MODIFY]** [src/App.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/App.jsx)
  - Hapus import dan routing untuk halaman [Subscriptions](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#307-311).
  - Ganti nama halaman `Timeline` menjadi [Transaction](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#289-306) (atau buat file baru).
  - Tambahkan routing untuk halaman baru `PAGES.insight = Insight`.
- **[MODIFY]** [src/components/BottomNav.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/components/BottomNav.jsx)
  - Hapus tab `subscriptions`.
  - Ganti id, icon, dan label `timeline` menjadi `transaction`.
  - Tambahkan tab baru `insight` dengan icon yang relevan (misal chart/bar).
- **[MODIFY]** [src/store/appStore.js](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js)
  - Tambahkan state dan action untuk `fetchBudgets` atau API call `addCategory` dan `adjustBudgetLimit`.

### Frontend Pages
- **[DELETE]** [src/pages/Subscriptions.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Subscriptions.jsx)
- **[MODIFY]** [src/pages/Timeline.jsx](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Timeline.jsx) (direname menjadi `Transaction.jsx` di UI)
- **[NEW]** `src/pages/Insight.jsx`
  - **Section Net Income & Spend**: Tampilkan sisa pendapatan (`monthly_income` dikurangi total *spend* bulan ini).
  - **Section Categories (Budgets)**: Tampilkan daftar kategori dengan *progress bar* sebagai pengingat batas *budget*.
  - **Feature Add Category**: Tombol/Modal untuk menambah kategori pengeluaran (*budget*) baru secara manual.
  - **Feature Adjust Budgeting**: Form/Modal (Edit icon) di setiap *card category budget* untuk mengubah limit nominal alokasi.
  - **Feature Financial Target**: Persentase uang terkumpul untuk `financial_goals` (Implementasinya menunggu screenshot).

### Backend APIs
- **[MODIFY]** [server/server.js](file:///d:/WORK/HACKATHON/AliBaba2/server/server.js)
  - Buat API endpoint `POST /api/budgets` untuk *add category/budget* manual.
  - Buat API endpoint `PUT /api/budgets/:id` untuk *adjust budget limit*.

## Verification Plan
### Manual Verification
1. Jalankan `npm run dev` dan pastikan BottomNav hanya berisi Home, Transaction, AI Chat, Insight.
2. Cek halaman Insight: Pastikan rumusan *Net income*, *Spend*, dan list *Categories* tampil.
3. Coba fitur *manual adjustment* pada budget dan penambahan kategori, lalu lihat apakah databasenya tersimpan.
4. (Nanti) Cocokkan desain visualisasi target finansial dengan screenshot yang diberikan.
