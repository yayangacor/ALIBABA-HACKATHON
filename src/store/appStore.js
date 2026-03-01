import { create } from 'zustand'

// ─── Mock Data (sesuai plan.md) ───────────────────────────────────────────────
const MOCK_DATA = {
  user: {
    id: 'U-101',
    name: 'Edward',
    totalMonthlyGoal: 5000000,
    avatar: 'EW',
  },

  budgets: [
    { id: 'B-01', categoryId: 'C-FOOD',      categoryName: 'Foods',         limit: 1500000, currentSpent: 1230000, color: '#4F9DFF', emoji: '🍛' },
    { id: 'B-02', categoryId: 'C-DRINK',     categoryName: 'Drinks',        limit: 500000,  currentSpent: 250000,  color: '#00E5A0', emoji: '☕' },
    { id: 'B-03', categoryId: 'C-SNACK',     categoryName: 'Snacks',        limit: 300000,  currentSpent: 130000,  color: '#FBBF24', emoji: '🍟' },
    { id: 'B-04', categoryId: 'C-ENTERTAIN', categoryName: 'Entertainment', limit: 200000,  currentSpent: 50000,   color: '#F472B6', emoji: '🎬' },
  ],

  transactions: [
    // Feb 28 (today)
    {
      id: 'TX-001', date: '2026-02-28T08:30:00Z',
      merchant: 'Kopi Janji Jiwa', amount: 27000,
      paymentSource: 'GoPay', categoryId: 'C-DRINK', categoryName: 'Drinks', emoji: '☕',
    },
    {
      id: 'TX-002', date: '2026-02-28T12:30:00Z',
      merchant: 'Warteg Bu Sari', amount: 18000,
      paymentSource: 'Cash', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍛',
    },

    // Feb 27
    {
      id: 'TX-991', date: '2026-02-27T13:00:00Z',
      merchant: 'Indomaret', amount: 23400,
      paymentSource: 'Mandiri', categoryId: 'C-SNACK', categoryName: 'Snacks', emoji: '🛒',
      paylabsMetadata: { items: ['Lays', 'Aqua'], location: 'Jakarta' },
    },
    {
      id: 'TX-003', date: '2026-02-27T19:30:00Z',
      merchant: 'Bakmi Naga', amount: 55000,
      paymentSource: 'OVO', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍜',
    },
    {
      id: 'TX-004', date: '2026-02-27T15:00:00Z',
      merchant: 'Chatime', amount: 45000,
      paymentSource: 'ShopeePay', categoryId: 'C-DRINK', categoryName: 'Drinks', emoji: '🧋',
    },

    // Feb 26
    {
      id: 'TX-992', date: '2026-02-26T19:00:00Z',
      merchant: 'Sei Indonesia', amount: 40000,
      paymentSource: 'ShopeePay', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍖',
      paylabsMetadata: { items: ['Paket Sei Sapi Reguler'], location: 'Jakarta' },
    },
    {
      id: 'TX-005', date: '2026-02-26T08:00:00Z',
      merchant: 'Starbucks', amount: 68000,
      paymentSource: 'GoPay', categoryId: 'C-DRINK', categoryName: 'Drinks', emoji: '☕',
    },
    {
      id: 'TX-006', date: '2026-02-26T14:00:00Z',
      merchant: 'KFC Sudirman', amount: 75000,
      paymentSource: 'Mandiri', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍗',
    },

    // Feb 25
    {
      id: 'TX-007', date: '2026-02-25T12:00:00Z',
      merchant: 'Warung Padang', amount: 28000,
      paymentSource: 'Cash', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍛',
    },
    {
      id: 'TX-008', date: '2026-02-25T20:00:00Z',
      merchant: 'Netflix', amount: 54000,
      paymentSource: 'BCA', categoryId: 'C-ENTERTAIN', categoryName: 'Entertainment', emoji: '🎬',
    },
    {
      id: 'TX-009', date: '2026-02-25T16:30:00Z',
      merchant: 'Miniso', amount: 89000,
      paymentSource: 'OVO', categoryId: 'C-SNACK', categoryName: 'Snacks', emoji: '🛍️',
    },

    // Feb 24
    {
      id: 'TX-010', date: '2026-02-24T07:30:00Z',
      merchant: 'Fore Coffee', amount: 38000,
      paymentSource: 'GoPay', categoryId: 'C-DRINK', categoryName: 'Drinks', emoji: '☕',
    },
    {
      id: 'TX-011', date: '2026-02-24T13:00:00Z',
      merchant: 'Sushi Tei', amount: 165000,
      paymentSource: 'BCA', categoryId: 'C-FOOD', categoryName: 'Foods', emoji: '🍱',
    },
  ],

  subscriptions: [
    {
      id: 'SUB-1', serviceName: 'YouTube Premium',
      amount: 69000, nextBillingDate: '2026-03-01',
      isVampireRisk: false, bgColor: '#FF0000', emoji: '▶️',
      category: 'Entertainment',
    },
    {
      id: 'SUB-2', serviceName: 'ChatGPT Go',
      amount: 70000, nextBillingDate: '2026-03-06',
      isVampireRisk: true, bgColor: '#10A37F', emoji: '🤖',
      category: 'AI Tools',
      vampireReason: 'Duplikat dengan Gemini Advanced',
    },
    {
      id: 'SUB-3', serviceName: 'Gemini Advanced',
      amount: 309000, nextBillingDate: '2026-03-09',
      isVampireRisk: false, bgColor: '#4285F4', emoji: '✨',
      category: 'AI Tools',
    },
    {
      id: 'SUB-4', serviceName: 'Spotify Premium',
      amount: 54990, nextBillingDate: '2026-03-15',
      isVampireRisk: false, bgColor: '#1DB954', emoji: '🎵',
      category: 'Music',
    },
  ],
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
export const formatRupiah = (amount) =>
  `Rp ${amount.toLocaleString('id-ID')}`

export const formatCompact = (amount) => {
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(2).replace('.', ',')}jt`
  if (amount >= 1_000)    return `Rp ${(amount / 1_000).toFixed(0)}rb`
  return `Rp ${amount}`
}

export const formatDate = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

export const formatDateShort = (isoString) => {
  const d = new Date(isoString)
  const today    = new Date()
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString())     return 'Hari ini'
  if (d.toDateString() === yesterday.toDateString()) return 'Kemarin'
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
}

export const formatTime = (isoString) => {
  const d = new Date(isoString)
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
}

// ─── Auth persistence helpers (simple localStorage — no extra deps needed) ────
const _loadAuth = () => {
  try {
    return {
      user: JSON.parse(localStorage.getItem('finlabs_user') || 'null'),
      onboardingCompleted: localStorage.getItem('finlabs_onboarding') === 'true',
    }
  } catch { return { user: null, onboardingCompleted: false } }
}

// ─── Zustand Store ────────────────────────────────────────────────────────────
const useAppStore = create((set, get) => ({
  // Data — starts empty; fetchAppData() fills from the backend.
  // MOCK_DATA is kept as an offline fallback only (see catch block below).
  user: null,
  budgets: [],
  transactions: [],
  subscriptions: [],

  // ── Auth ──────────────────────────────────────────────────────────────────
  ..._loadAuth(),

  // Called by LandingPage after Google OAuth succeeds.
  // idToken = signed JWT credential from @react-oauth/google GoogleLogin component.
  loginWithGoogle: async (idToken) => {
    const res = await fetch('/api/auth/google', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ idToken }),
    })
    if (!res.ok) throw new Error('Auth request failed')
    const data = await res.json()
    localStorage.setItem('finlabs_user', JSON.stringify(data.user))
    if (data.hasProfile) localStorage.setItem('finlabs_onboarding', 'true')
    set({ user: data.user, onboardingCompleted: data.hasProfile })
    return data
  },

  // Demo bypass — skips Google OAuth entirely. Useful for hackathon demos and
  // local dev when Google Cloud Console propagation is still pending.
  demoLogin: async () => {
    const res = await fetch('/api/auth/demo', { method: 'POST' })
    if (!res.ok) throw new Error('Demo login failed')
    const data = await res.json()
    localStorage.setItem('finlabs_user', JSON.stringify(data.user))
    if (data.hasProfile) localStorage.setItem('finlabs_onboarding', 'true')
    set({ user: data.user, onboardingCompleted: data.hasProfile })
  },

  logout: () => {
    localStorage.removeItem('finlabs_user')
    localStorage.removeItem('finlabs_onboarding')
    set({ user: null, onboardingCompleted: false, currentTab: 'home' })
  },

  // Called after the user clicks "Confirm & Save" on the review screen.
  saveProfile: async (profileData) => {
    const { user } = get()
    const res = await fetch('/api/user/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, ...profileData }),
    })
    if (!res.ok) throw new Error('Failed to save profile')
    localStorage.setItem('finlabs_onboarding', 'true')
    set({ onboardingCompleted: true })
  },

  // Navigation
  currentTab: 'home',
  setTab: (tab) => set({ currentTab: tab }),

  // Chat deep-link: Quick Insight → Chat
  chatTriggered: false,
  setChatTriggered: (val) => set({ chatTriggered: val }),

  // Fetch live data from backend (falls back to MOCK_DATA if server is offline)
  isDataLoaded: false,
  fetchAppData: async () => {
    const { user } = get()
    try {
      const userId = user?.id
      const url = userId ? `/api/data?userId=${encodeURIComponent(userId)}` : '/api/data'
      const res = await fetch(url)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const data = await res.json()
      set({
        user:          data.user  ?? user,
        budgets:       data.budgets       ?? [],
        transactions:  data.transactions  ?? [],
        subscriptions: data.subscriptions ?? [],
        isDataLoaded: true,
      })
    } catch (err) {
      console.warn('[FinLabs] Backend offline — using local mock data.', err.message)
      set({ ...MOCK_DATA, isDataLoaded: true })
    }
  },

  // Derived: Today's total spending
  getTodaySpending: () => {
    const todayStr = new Date().toISOString().split('T')[0]
    return get().transactions
      .filter(t => t.date.startsWith(todayStr))
      .reduce((sum, t) => sum + t.amount, 0)
  },

  // Derived: Number of transactions today
  getTodayTransactionsCount: () => {
    const todayStr = new Date().toISOString().split('T')[0]
    return get().transactions.filter(t => t.date.startsWith(todayStr)).length
  },

  // Derived: Monthly spending grouped by category (for donut chart)
  getChartData: () => {
    return get().budgets.map(b => ({
      name: b.categoryName,
      value: b.currentSpent,
      color: b.color,
      emoji: b.emoji,
    }))
  },

  // Derived: Critical budgets (>= 80%)
  getCriticalBudgets: () => {
    return get().budgets.filter(b => (b.currentSpent / b.limit) >= 0.80)
  },

  // Derived: Total monthly spending
  getTotalMonthlySpending: () => {
    return get().budgets.reduce((sum, b) => sum + b.currentSpent, 0)
  },

  // Add a new budget category (calls POST /api/categories)
  addCategory: async (categoryData) => {
    const { user } = get()
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, ...categoryData }),
    })
    if (!res.ok) throw new Error('Failed to add category')
    const data = await res.json()
    set(state => ({ budgets: [...state.budgets, data.budget] }))
  },

  // Update limits of existing categories (calls PUT /api/budgets)
  rebalanceBudgets: async (updatedBudgets) => {
    const { user } = get()
    const res = await fetch('/api/budgets', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user?.id, budgets: updatedBudgets }),
    })
    if (!res.ok) throw new Error('Failed to update budgets')
    set(state => ({
      budgets: state.budgets.map(b => {
        const updated = updatedBudgets.find(u => u.id === b.id)
        return updated ? { ...b, limit: updated.limit } : b
      }),
    }))
  },

  // Derived: Transactions grouped by date for Transaction page
  getGroupedTransactions: () => {
    const groups = {}
    get().transactions.forEach(t => {
      const key = t.date.split('T')[0]
      if (!groups[key]) groups[key] = []
      groups[key].push(t)
    })
    return Object.entries(groups)
      .sort(([a], [b]) => b.localeCompare(a))
      .map(([date, items]) => ({
        dateKey: date,
        label: formatDateShort(date + 'T00:00:00Z'),
        totalAmount: items.reduce((s, t) => s + t.amount, 0),
        items: items.sort((a, b) => b.date.localeCompare(a.date)),
      }))
  },

  // Total subscription per month
  getTotalSubscriptions: () => {
    return get().subscriptions.reduce((sum, s) => sum + s.amount, 0)
  },
}))

export default useAppStore
