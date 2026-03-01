# FinLabs – Hackathon Project Memory

## Project Overview
FinLabs: Zero-Effort AI Financial Assistant — Alibaba Hackathon MVP.

## Stack
- **Vite + React** (no TypeScript, keep simple)
- **Tailwind CSS v3** with custom theme (`tailwind.config.js`)
- **Zustand** — global state in `src/store/appStore.js`
- **Recharts** — Donut/Pie chart in Home page
- **Lucide React** — icons (installed but using inline SVGs for now)
- **DM Sans** font via Google Fonts

## File Structure
```
d:/WORK/HACKATHON/AliBaba2/
├── src/
│   ├── store/appStore.js      # Zustand + mock JSON + helpers
│   ├── components/
│   │   ├── BottomNav.jsx      # 4-tab bottom nav
│   │   └── CircularProgress.jsx  # SVG circular progress
│   ├── pages/
│   │   ├── Home.jsx           # Dashboard (donut chart, budget status, quick insight)
│   │   ├── Timeline.jsx       # Transactions grouped by date
│   │   ├── Subscriptions.jsx  # Vampire subscription list
│   │   └── Chat.jsx           # AI chat with animated green orb
│   ├── App.jsx                # Tab router
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```


## Key Flows
1. **Wow Factor Demo**: Home → Quick Insight card (amber) → tap → navigates to Chat tab → auto-plays demo conversation (AI alert → User question → AI analysis with "Review Subscriptions →" button → navigates to Subscriptions tab)
2. State: `chatTriggered` in Zustand controls demo auto-play in Chat.jsx
3. **Deep link**: Chat "Review Subscriptions →" button calls `setTab('subscriptions')`

## Dev Server
`npm run dev` → http://localhost:5173 (mobile-first max-w-sm layout)

## User Preferences
- No auth/login, no real DB — all hardcoded mock data
- Focus on visual "Wow Factor" for hackathon judges
- Dark premium fintech aesthetic

Yang Dibuat/Diubah
File	Status	Keterangan
server/package.json	Baru	Dependencies: express, cors, dotenv
server/server.js	Baru	Express + GET /api/data + POST /api/chat → Qwen
server/.env.example	Baru	Template env
vite.config.js	Update	Proxy /api → localhost:3001 (no CORS issues)
src/store/appStore.js	Update	Tambah fetchAppData() dengan graceful fallback ke mock
src/pages/Chat.jsx	Update	handleSend jadi async, call /api/chat, fallback lokal
Bagaimana Action Token Bekerja

User: "cek langganan saya"
        ↓
Qwen returns: "...teks jawaban... [ACTION:REVIEW_SUBSCRIPTIONS]"
        ↓
server.js strips token → reply: "...teks jawaban...", action: "NAVIGATE_TO_SUBSCRIPTIONS"
        ↓
Chat.jsx renders tombol "Review Subscriptions →" jika action !== null
        ↓
Tombol onClick → setTab('subscriptions')
Demo wow-factor (chatTriggered auto-play) tidak tersentuh — tetap berjalan persis seperti sebelumnya

Yang Sudah Dilakukan
File Baru: server/db.js
Modul database yang menangani 3 hal sekaligus:

Connection Pool ke ApsaraDB MySQL via mysql2/promise (10 koneksi paralel)
DDL — CREATE TABLE IF NOT EXISTS untuk semua 4 tabel
Auto-seed — INSERT mock data hanya jika tabel users masih kosong
File Diupdate: server/server.js
GET /api/data — 4 query paralel via Promise.all(), return JSON dengan struktur identik seperti sebelumnya (frontend tidak perlu diubah)
POST /api/chat — buildSystemPrompt() query real-time dari DB sebelum call ke Qwen
Startup sequence: initializeDatabase() → jika gagal konek DB, server tidak jalan (process.exit(1))
File Diupdate: server/.env.example
Semua variable DB sudah didokumentasikan.


Changes Made
server/server.js
1. POST /api/chat — New action parser (lines 125–146)

Replaces the old single-token boolean check with regex-based multi-token parsing. Priority order: ADD_TRANSACTION → CANCEL_SUBSCRIPTION → NAVIGATE_TO_SUBSCRIPTIONS. Returns a structured action object ({ type, payload }) or null.

2. buildSystemPrompt() — 3 new ACTION rules (rules 4–7)

Instructs Qwen to emit exactly one of:

[ACTION:REVIEW_SUBSCRIPTIONS] — general subscription discussions
[ACTION:ADD_TRANSACTION:<merchant>:<amount>:<categoryName>] — user mentions a new purchase
[ACTION:CANCEL_SUBSCRIPTION:<serviceName>] — user asks to cancel a specific service
3. POST /api/transactions (lines 153–182)

Parameterized INSERT + budget currentSpent UPDATE in one request. Looks up categoryId and emoji from budgets by categoryName.

4. DELETE /api/subscriptions (lines 184–203)

Parameterized DELETE by serviceName. Returns 404 if not found (affectedRows === 0).

src/pages/Chat.jsx
1. AI_RESPONSES / getAIResponse fallback

Replaced showAction: boolean with action: { type } | null to match the new API shape.

2. AITextBubble component

Now accepts action, actionDone, isActionLoading, and three callbacks. Renders:

Green "Review Subscriptions →" for NAVIGATE_TO_SUBSCRIPTIONS
Green "Catat Pengeluaran Rp X di Y" for ADD_TRANSACTION
Red "Batalkan Langganan X" for CANCEL_SUBSCRIPTION
"✓ Berhasil!" confirmation after actionDone
disabled + opacity while loading
3. handleAddTransaction / handleCancelSubscription

Call the new endpoints → on success, call useAppStore.getState().fetchAppData() to refresh all tabs, then mark actionDone: true on the message to replace the button with the success state.

4. Message rendering

Passes actionLoading === msg.id as isActionLoading so only the tapped button shows a spinner.

Files changed
server/db.js

Added google_id, email, avatar_url columns to users table
Added new user_profiles table (persona_type, financial_goals, money_constraints)
Live migration: try/catch ALTER TABLE statements so existing DBs without those columns get updated automatically on server start
server/server.js — 3 new endpoints:

POST /api/auth/google — receives the frontend's Google OAuth access token, verifies it by calling Google's /userinfo endpoint (no private keys needed), then upserts the user row and returns { user, hasProfile }
POST /api/onboarding/transcribe — receives audio/webm blob via multer (RAM only, never touches disk), attempts qwen-audio-turbo-latest for single-shot STT+extraction, falls back to qwen-plus LLM with a demo transcript, always returns { transcript, persona, financial_goals, money_constraints }
POST /api/user/profile — INSERT ... ON DUPLICATE KEY UPDATE upsert into user_profiles
src/store/appStore.js — Added auth slice:

_loadAuth() reads localStorage on init so state survives page refresh
loginWithGoogle(accessToken), logout(), saveProfile(profileData) async actions
src/main.jsx — Wrapped with <GoogleOAuthProvider>

src/App.jsx — Auth-aware 3-way routing: unauthenticated → Landing, authenticated no profile → Onboarding, otherwise main app

src/pages/LandingPage.jsx (new) — Premium dark landing: gradient background glow, animated brand orb, feature cards grid, fully custom-styled "Continue with Google" button using useGoogleLogin hook

src/pages/OnboardingPage.jsx (new) — 4-phase voice onboarding:

Intro: "Why we need voice" explanation, prominent privacy disclaimer, "audio is never stored" promise, Alibaba Cloud Qwen badge
Recording: pulsing red orb with live MM:SS timer, MediaRecorder API with audio/webm;codecs=opus
Processing: animated Qwen orb with typing dots
Review & Confirm: shows extracted JSON as editable fields (persona chip-selector, textarea for goals/constraints), transcript in a <details> disclosure, explicit "audio already discarded" confirmation before the green "Confirm & Save →" button
Manual fallback: full text form if mic is denied or user prefers typing
.env (new) — VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID_HERE

 Here's a summary of every change made:

src/store/appStore.js
getTodaySpending() — replaced hardcoded '2026-02-28' with new Date().toISOString().split('T')[0] so it always uses today's real date.
getTodayTransactionsCount() — new selector, same date logic, returns .length instead of a sum.
src/pages/Home.jsx
TodaySpendingCard({ amount, todayTxCount })

Date line: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) — always current.
Transaction count: todayTxCount === 0 ? 'Belum ada transaksi hari ini' : \${todayTxCount} transaksi hari ini``
Removed the static "-12% vs kemarin" span entirely (can't compute it without a dedicated store selector).
DonutSection({ chartData, total })

Month label: new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' }) — always current.
isEmpty guard: when total === 0 || chartData.length === 0, renders a clean centered empty state (circle icon + two muted text lines) instead of the pie chart.
QuickInsightCard({ onTap, hasTransactions, criticalBudget })

Onboarding mode (!hasTransactions): green accent styling, sparkle star icon, "Mulai Catat Keuanganmu · AI" title, onboarding copy.
Insight mode (has transactions): existing amber styling; body text dynamically reads criticalBudget.currentSpent / criticalBudget.limit — falls back to "Pengeluaranmu bulan ini masih terkendali." if no budget hits ≥80%.
Home (default export)

Added transactions, getTodayTransactionsCount, getCriticalBudgets to the destructure.
Computes todayTxCount, criticalBudget and passes them down as props.

Summary of Changes
Home.jsx — Quick Insight fix
Removed setChatTriggered(true) from handleQuickInsightTap. Clicking the card now only calls setTab('chat'), navigating without triggering the dummy demo sequence.
Chat.jsx — Real user data in API calls
handleAddTransaction → body now includes userId so transactions are correctly saved for the logged-in user.
handleCancelSubscription → body now includes userId so only that user's subscription is deleted.
handleSend → body now includes userId so buildSystemPrompt fetches data for the correct user.
server/db.js — DB migration
Added a live ALTER TABLE user_profiles ADD COLUMN monthly_income BIGINT migration in the same try/catch pattern as existing migrations.
server/server.js — Four backend fixes
POST /api/chat — Extracts userId from body and passes it to buildSystemPrompt(userId).
buildSystemPrompt(userId) — All four queries now use WHERE user_id = ? (or WHERE id = ? for users), falling back to 'U-101' if no userId.
DELETE /api/subscriptions — Now filters by user_id when provided, preventing cross-user deletions.
POST /api/user/profile — Accepts monthly_income, saves it to the DB, then calls Qwen to generate a personalized 4-category budget (Foods/Drinks/Snacks/Entertainment), deletes old budgets, and inserts the AI-generated ones.
OnboardingPage.jsx — AI Budgeting UX
Added monthly_income input field to both PhaseReview and PhaseManual.
Added PhaseBudgetProcessing — a cinematic loading screen with animated orb, typed dots, and "Powered by Alibaba Qwen AI" details list.
handleConfirm now: (1) immediately switches to budget_processing phase, (2) POSTs to /api/user/profile with monthly_income, (3) awaits fetchAppData() to load AI-generated budgets into Zustand, (4) then sets onboardingCompleted: true via useAppStore.setState() which triggers App.jsx navigation to home.

Modified files:

src/App.jsx — Removed Subscriptions, renamed Timeline→Transaction, added Insight to PAGES
src/components/BottomNav.jsx — Tabs: Home / Transactions (receipt icon) / AI Chat / Insight (pie chart icon)
src/store/appStore.js — Added addCategory() and rebalanceBudgets() async actions
server/server.js — Three changes:
GET /api/data now LEFT JOINs user_profiles to include monthly_income
POST /api/categories — inserts a new budget row, returns the created budget object
PUT /api/budgets — bulk-updates limit column for an array of budgets
Deleted:

src/pages/Subscriptions.jsx