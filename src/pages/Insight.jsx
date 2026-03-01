import { useState } from 'react'
import useAppStore, { formatRupiah, formatCompact } from '../store/appStore'

// ─── Constants ────────────────────────────────────────────────────────────────
const PRESET_COLORS = ['#4F9DFF', '#00E5A0', '#FBBF24', '#F472B6', '#A78BFA', '#FB923C']

// ─── Add Category Modal ───────────────────────────────────────────────────────
function AddCategoryModal({ onClose, onAdd }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('💰')
  const [limit, setLimit] = useState('')
  const [color, setColor] = useState(PRESET_COLORS[0])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async () => {
    if (!name.trim() || !limit) return
    setLoading(true)
    setError('')
    try {
      await onAdd({ categoryName: name.trim(), emoji, limit: Number(limit), color })
      onClose()
    } catch (err) {
      setError('Failed to add category. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm bg-card rounded-t-3xl px-6 pt-4 pb-8"
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
      >
        {/* Handle */}
        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-5" />
        <h3 className="text-text-primary text-lg font-bold mb-5">Add Category</h3>

        {/* Emoji + Name */}
        <div className="flex gap-3 mb-4">
          <input
            type="text"
            value={emoji}
            onChange={e => setEmoji(e.target.value)}
            className="w-14 h-12 rounded-xl border border-black/[0.1] bg-card2 text-center text-2xl outline-none"
            maxLength={2}
          />
          <input
            type="text"
            placeholder="Category name"
            value={name}
            onChange={e => setName(e.target.value)}
            className="flex-1 h-12 rounded-xl border border-black/[0.1] bg-card2 px-4 text-text-primary text-sm outline-none placeholder:text-muted"
          />
        </div>

        {/* Monthly Limit */}
        <div className="mb-4">
          <label className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-1.5 block">
            Monthly Limit
          </label>
          <div className="flex items-center gap-2 bg-card2 rounded-xl border border-black/[0.1] px-4 h-12">
            <span className="text-text-muted text-sm font-medium">Rp</span>
            <input
              type="number"
              placeholder="0"
              value={limit}
              onChange={e => setLimit(e.target.value)}
              className="flex-1 bg-transparent text-text-primary text-sm outline-none"
            />
          </div>
        </div>

        {/* Color swatches */}
        <div className="mb-5">
          <label className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-2 block">Color</label>
          <div className="flex gap-2.5">
            {PRESET_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setColor(c)}
                className="w-8 h-8 rounded-full transition-all duration-150 flex-shrink-0"
                style={{
                  background: c,
                  transform: color === c ? 'scale(1.2)' : 'scale(1)',
                  boxShadow: color === c ? `0 0 0 2px white, 0 0 0 4px ${c}` : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {error && <p className="text-danger text-xs mb-3">{error}</p>}

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-card2 text-text-muted text-sm font-semibold border border-black/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!name.trim() || !limit || loading}
            className="flex-1 h-12 rounded-2xl text-white text-sm font-bold disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #00C98A, #00A87A)' }}
          >
            {loading ? 'Saving…' : 'Add Category'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Rebalance Modal ──────────────────────────────────────────────────────────
function RebalanceModal({ budgets, onClose, onSave }) {
  const [limits, setLimits] = useState(budgets.map(b => ({ ...b })))
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (id, val) => {
    setLimits(prev => prev.map(b => b.id === id ? { ...b, limit: Number(val) || 0 } : b))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    try {
      await onSave(limits)
      onClose()
    } catch (err) {
      setError('Failed to save. Try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className="w-full max-w-sm bg-card rounded-t-3xl px-6 pt-4 pb-8"
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.15)' }}
      >
        <div className="w-10 h-1 rounded-full bg-black/10 mx-auto mb-5" />
        <h3 className="text-text-primary text-lg font-bold mb-0.5">Rebalance Budgets</h3>
        <p className="text-text-muted text-xs mb-5">Adjust monthly limits for each category</p>

        <div className="flex flex-col gap-3 mb-5 max-h-60 overflow-y-auto pr-1" style={{ scrollbarWidth: 'none' }}>
          {limits.map(b => (
            <div key={b.id} className="flex items-center gap-3">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: `${b.color}18`, border: `1px solid ${b.color}25` }}
              >
                {b.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-text-primary text-xs font-semibold mb-1 truncate">{b.categoryName}</p>
                <div className="flex items-center gap-1 bg-card2 rounded-xl border border-black/[0.08] px-3 h-9">
                  <span className="text-text-muted text-xs font-medium">Rp</span>
                  <input
                    type="number"
                    value={b.limit}
                    onChange={e => handleChange(b.id, e.target.value)}
                    className="flex-1 bg-transparent text-text-primary text-xs outline-none"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {error && <p className="text-danger text-xs mb-3">{error}</p>}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 h-12 rounded-2xl bg-card2 text-text-muted text-sm font-semibold border border-black/[0.08]"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="flex-1 h-12 rounded-2xl text-white text-sm font-bold disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #4F9DFF, #2563EB)' }}
          >
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Category Row ─────────────────────────────────────────────────────────────
function CategoryRow({ budget }) {
  const pct = budget.limit > 0 ? Math.min(100, Math.round((budget.currentSpent / budget.limit) * 100)) : 0
  const isCritical = pct >= 80
  const isWarning = pct >= 60 && pct < 80
  const barColor = isCritical ? '#EF4444' : isWarning ? '#D97706' : budget.color

  return (
    <div
      className="bg-card rounded-2xl px-4 py-3.5"
      style={{ border: '1px solid rgba(0,0,0,0.07)', boxShadow: '0 1px 8px rgba(0,0,0,0.04)' }}
    >
      <div className="flex items-center gap-3 mb-2.5">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl flex-shrink-0"
          style={{ background: `${budget.color}15`, border: `1px solid ${budget.color}25` }}
        >
          {budget.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-text-primary text-sm font-semibold">{budget.categoryName}</p>
          <p className="text-text-muted text-xs">{formatCompact(budget.currentSpent)} / {formatCompact(budget.limit)}</p>
        </div>
        <span
          className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
            isCritical ? 'text-danger' : isWarning ? 'text-amber-600' : 'text-green-600'
          }`}
          style={{
            background: isCritical ? 'rgba(239,68,68,0.1)' : isWarning ? 'rgba(217,119,6,0.1)' : 'rgba(0,201,138,0.1)',
          }}
        >
          {pct}%
        </span>
      </div>
      {/* Progress bar */}
      <div className="h-2 rounded-full bg-card2 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, background: barColor }}
        />
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function Insight() {
  const { user, budgets, getTotalMonthlySpending, addCategory, rebalanceBudgets } = useAppStore()
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRebalanceModal, setShowRebalanceModal] = useState(false)

  const totalSpent = getTotalMonthlySpending()
  const monthlyIncome = user?.monthly_income || user?.totalMonthlyGoal || 0
  const netIncome = monthlyIncome - totalSpent
  const isPositive = netIncome >= 0

  const totalBudgeted = budgets.reduce((sum, b) => sum + b.limit, 0)
  const totalLeft = Math.max(0, totalBudgeted - totalSpent)
  const spentPct = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0

  const incomeRatioPct =
    monthlyIncome > 0 ? Math.abs(Math.round((netIncome / monthlyIncome) * 100)) : null

  return (
    <div className="flex flex-col h-full">
      {/* Sticky header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-3 bg-bg border-b border-black/[0.08]">
        <h2 className="text-text-primary text-xl font-bold">Insight</h2>
      </div>

      {/* Scrollable content */}
      <div className="scroll-content px-4 py-4 flex flex-col gap-4">

        {/* ── Metric cards ── */}
        <div className="grid grid-cols-2 gap-3">
          {/* Net Income */}
          <div
            className="bg-card rounded-2xl px-4 py-4"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Net Income</p>
            <p className={`text-base font-bold leading-tight ${isPositive ? 'text-accent' : 'text-danger'}`}>
              {isPositive ? '+' : ''}{formatCompact(netIncome)}
            </p>
            <div className="flex items-center gap-1 mt-1.5">
              {isPositive ? (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#00C98A" strokeWidth="2.5">
                  <polyline points="18 15 12 9 6 15"/>
                </svg>
              ) : (
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2.5">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              )}
              <span className={`text-[10px] font-medium ${isPositive ? 'text-accent' : 'text-danger'}`}>
                {incomeRatioPct !== null ? `${incomeRatioPct}% of income` : 'No income set'}
              </span>
            </div>
          </div>

          {/* Total Spend */}
          <div
            className="bg-card rounded-2xl px-4 py-4"
            style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
          >
            <p className="text-text-muted text-[10px] font-semibold uppercase tracking-wide mb-1.5">Total Spend</p>
            <p className="text-text-primary text-base font-bold leading-tight">{formatCompact(totalSpent)}</p>
            <p className="text-text-muted text-[10px] mt-1.5">this month</p>
          </div>
        </div>

        {/* ── Budget progress overview ── */}
        <div
          className="bg-card rounded-2xl px-4 py-4"
          style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 12px rgba(0,0,0,0.05)' }}
        >
          <div className="flex items-start justify-between mb-3">
            <div>
              <p className="text-text-primary text-base font-bold leading-tight">
                {formatCompact(totalLeft)} left
              </p>
              <p className="text-text-muted text-xs mt-0.5">
                out of {formatCompact(totalBudgeted)} budgeted
              </p>
            </div>
            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full mt-0.5 ${
                spentPct >= 80 ? 'text-danger' : spentPct >= 60 ? 'text-amber-600' : 'text-green-600'
              }`}
              style={{
                background: spentPct >= 80 ? 'rgba(239,68,68,0.1)' : spentPct >= 60 ? 'rgba(217,119,6,0.1)' : 'rgba(0,201,138,0.1)',
              }}
            >
              {spentPct}% used
            </span>
          </div>

          {/* Segmented progress bar */}
          <div className="h-3 rounded-full bg-card2 overflow-hidden flex">
            {budgets.map(b => {
              const w = totalBudgeted > 0 ? (b.currentSpent / totalBudgeted) * 100 : 0
              return (
                <div
                  key={b.id}
                  className="h-full transition-all duration-500"
                  style={{ width: `${w}%`, background: b.color, minWidth: w > 0.5 ? '3px' : '0' }}
                />
              )
            })}
          </div>

          {/* Legend dots */}
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-2.5">
            {budgets.map(b => (
              <div key={b.id} className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: b.color }} />
                <span className="text-[10px] text-text-muted">{b.categoryName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Categories heading ── */}
        <div className="flex items-center justify-between">
          <h3 className="text-text-primary text-sm font-bold">Categories</h3>
          <span className="text-text-muted text-xs">{budgets.length} active</span>
        </div>

        {/* ── Category cards ── */}
        {budgets.length === 0 ? (
          <div className="flex flex-col items-center py-12 gap-3">
            <span className="text-4xl">📊</span>
            <p className="text-text-muted text-sm text-center">
              No categories yet.<br />Add one to start tracking!
            </p>
          </div>
        ) : (
          budgets.map(b => <CategoryRow key={b.id} budget={b} />)
        )}

        <div className="h-2" />
      </div>

      {/* ── Bottom action buttons ── */}
      <div
        className="flex-shrink-0 px-4 py-3 border-t border-black/[0.08] bg-card flex gap-3"
        style={{ boxShadow: '0 -2px 12px rgba(0,0,0,0.05)' }}
      >
        <button
          onClick={() => setShowAddModal(true)}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl bg-card2 text-text-primary text-sm font-semibold border border-black/[0.08] transition-all active:scale-95"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Category
        </button>
        <button
          onClick={() => setShowRebalanceModal(true)}
          disabled={budgets.length === 0}
          className="flex-1 flex items-center justify-center gap-2 h-11 rounded-2xl text-white text-sm font-bold transition-all active:scale-95 disabled:opacity-40"
          style={{ background: 'linear-gradient(135deg, #4F9DFF, #2563EB)' }}
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/>
            <line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/>
            <line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/>
            <line x1="17" y1="16" x2="23" y2="16"/>
          </svg>
          Rebalance
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <AddCategoryModal
          onClose={() => setShowAddModal(false)}
          onAdd={addCategory}
        />
      )}
      {showRebalanceModal && (
        <RebalanceModal
          budgets={budgets}
          onClose={() => setShowRebalanceModal(false)}
          onSave={rebalanceBudgets}
        />
      )}
    </div>
  )
}
