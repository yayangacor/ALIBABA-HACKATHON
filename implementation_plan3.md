# Fix Home Page Static Mock Data and Empty States

This implementation plan addresses the issues with static mock data on the Home page and handles the empty state logic for new users who have no transactions yet.

## User Review Required
No breaking changes, but a few UI details for empty states are being implemented based on the new logic. Please review to ensure the empty state copywriting matches the intended experience.

## Proposed Changes

### Store logic update
#### [MODIFY] src/store/appStore.js
- **Dynamic Date in Store**: Update the [getTodaySpending](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#255-262) function to use the actual current date instead of the hardcoded `2026-02-28`.
- **New Selectors**: Add `getTodayTransactionsCount(todayDate)` to provide the exact count of today's transactions.

### Home Page UI update
#### [MODIFY] src/pages/Home.jsx

**1. [TodaySpendingCard](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#13-41)**:
- Use dynamic formatting for today's date instead of `28 Februari 2026`.
- Replace the hardcoded `2 transaksi hari ini` with the dynamic `todayTxCount` from the Zustand store.
- Hide or intelligently calculate the `-12% vs kemarin` text based on real data if possible, or hide it to avoid static misleading data.

**2. [DonutSection](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#42-124) (Monthly Overview)**:
- Replace `Februari 2026` with the dynamic current month and year.
- Inject a check `if (total === 0)`. Instead of rendering an empty pie chart, display an empty state UI: `Belum ada record transaksi bulan ini`.

**3. [QuickInsightCard](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#125-160)**:
- Determine if the user has any transactions (`transactions.length === 0`).
- If no transactions exist: display an onboarding AI insight (e.g., "Mulai Catat Transaksi" - "Belum ada data pengeluaran. Tap di sini untuk ngobrol dengan AI tentang cara mencatat transaksi!").
- If transactions exist: fetch dynamic insight using [getCriticalBudgets()](file:///d:/WORK/HACKATHON/AliBaba2/src/store/appStore.js#273-277) to show the most critical budget status, rather than the hardcoded 82% string.

## Verification Plan

### Manual Verification
1. Run the app using `npm run dev`.
2. Login as a new user (with no transactions).
3. Verify that [TodaySpendingCard](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#13-41) shows `Rp 0` and `0 transaksi hari ini`.
4. Verify that `Monthly Overview` displays an empty state message instead of a pie chart.
5. Verify that [QuickInsightCard](file:///d:/WORK/HACKATHON/AliBaba2/src/pages/Home.jsx#125-160) directs the user to learn how to record transactions.
6. Record a new transaction (via chat) and go back to the Home page to ensure the static data is now replaced by real dynamic data.
