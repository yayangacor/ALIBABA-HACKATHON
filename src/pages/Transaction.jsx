import { useState } from 'react'
import useAppStore, { formatRupiah, formatTime } from '../store/appStore'

const SOURCE_COLORS = {
  Mandiri: { bg: '#FFF9E6', text: '#B8860B', dark_bg: 'rgba(251,191,36,0.12)', dark_text: '#FBBF24' },
  ShopeePay: { bg: '#FFF0F0', text: '#B83232', dark_bg: 'rgba(248,113,113,0.12)', dark_text: '#F87171' },
  GoPay:     { bg: '#F0FFF4', text: '#1B7A3A', dark_bg: 'rgba(0,229,160,0.12)', dark_text: '#00E5A0' },
  OVO:       { bg: '#F5F0FF', text: '#6B3BCA', dark_bg: 'rgba(167,139,250,0.12)', dark_text: '#A78BFA' },
  BCA:       { bg: '#EFF8FF', text: '#1A56DB', dark_bg: 'rgba(79,157,255,0.12)', dark_text: '#4F9DFF' },
  Cash:      { bg: '#F0F0F0', text: '#555', dark_bg: 'rgba(255,255,255,0.07)', dark_text: '#8892B0' },
  Default:   { bg: '#F1F5F9', text: '#64748B', dark_bg: 'rgba(255,255,255,0.07)', dark_text: '#8892B0' },
}

const CATEGORY_COLORS = {
  'C-FOOD':     '#4F9DFF',
  'C-DRINK':    '#00E5A0',
  'C-SNACK':    '#FBBF24',
  'C-ENTERTAIN':'#F472B6',
}

function TransactionCard({ tx }) {
  const src = SOURCE_COLORS[tx.paymentSource] || SOURCE_COLORS.Default
  const catColor = CATEGORY_COLORS[tx.categoryId] || '#8892B0'

  return (
    <div className="flex items-center gap-3 py-3 transition-all duration-150 active:bg-black/[0.03] rounded-xl px-1">
      {/* Emoji circle */}
      <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-xl"
        style={{ background: `${catColor}18`, border: `1px solid ${catColor}30` }}>
        {tx.emoji}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-text-primary text-sm font-semibold truncate">{tx.merchant}</p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: `${catColor}18`, color: catColor }}>
            {tx.categoryName}
          </span>
          <span className="text-text-muted text-[10px]">•</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-md font-medium"
            style={{ background: src.bg ?? src.dark_bg, color: src.text ?? src.dark_text }}>
            {tx.paymentSource}
          </span>
        </div>
      </div>

      {/* Amount + time */}
      <div className="text-right flex-shrink-0">
        <p className="text-danger text-sm font-bold">-{formatRupiah(tx.amount)}</p>
        <p className="text-text-muted text-[10px] mt-0.5">{formatTime(tx.date)}</p>
      </div>
    </div>
  )
}

function DateGroup({ group }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-text-muted text-xs font-semibold uppercase tracking-wide">{group.label}</span>
        <span className="text-text-muted text-xs">-{formatRupiah(group.totalAmount)}</span>
      </div>
      <div className="rounded-2xl bg-card divide-y divide-black/[0.06]" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}>
        {group.items.map((tx) => (
          <div key={tx.id} className="px-3">
            <TransactionCard tx={tx} />
          </div>
        ))}
      </div>
    </div>
  )
}

const FILTERS = ['Semua', 'Foods', 'Drinks', 'Snacks', 'Entertainment']

export default function Transaction() {
  const { getGroupedTransactions } = useAppStore()
  const [activeFilter, setActiveFilter] = useState('Semua')
  const [search, setSearch] = useState('')

  const groups = getGroupedTransactions()

  const filteredGroups = groups
    .map(group => ({
      ...group,
      items: group.items.filter(tx => {
        const matchFilter = activeFilter === 'Semua' || tx.categoryName === activeFilter
        const matchSearch = !search || tx.merchant.toLowerCase().includes(search.toLowerCase())
        return matchFilter && matchSearch
      }),
    }))
    .filter(g => g.items.length > 0)

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-bg border-b border-black/[0.08]">
        <h2 className="text-text-primary text-xl font-bold mb-3">Transactions</h2>

        {/* Search */}
        <div className="flex items-center gap-2.5 bg-card rounded-xl px-3.5 py-2.5 mb-3"
          style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="2.5">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Cari merchant..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-muted outline-none"
          />
        </div>

        {/* Filter chips */}
        <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
          {FILTERS.map(f => (
            <button key={f}
              onClick={() => setActiveFilter(f)}
              className={`flex-shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-all duration-150 ${
                activeFilter === f
                  ? 'bg-accent text-white'
                  : 'bg-card2 text-text-muted border border-black/[0.08]'
              }`}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Scrollable list */}
      <div className="scroll-content px-4 py-4 flex flex-col gap-4">
        {filteredGroups.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <span className="text-4xl">🔍</span>
            <p className="text-text-muted text-sm">Tidak ada transaksi ditemukan</p>
          </div>
        ) : (
          filteredGroups.map(group => (
            <DateGroup key={group.dateKey} group={group} />
          ))
        )}
        <div className="h-2" />
      </div>
    </div>
  )
}
