import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import CircularProgress from '../components/CircularProgress'
import useAppStore, { formatRupiah, formatCompact } from '../store/appStore'

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function TodaySpendingCard({ amount, todayTxCount }) {
  const dateStr = new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })

  return (
    <div className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: 'linear-gradient(135deg, #EBF2FF 0%, #F0F5FF 100%)', border: '1px solid rgba(79,157,255,0.3)' }}>
      {/* Decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #4F9DFF, transparent)' }} />

      <p className="text-text-muted text-sm font-medium">Today's Spending</p>
      <p className="text-3xl font-bold text-text-primary mt-1">{formatRupiah(amount)}</p>
      <p className="text-text-muted text-xs mt-1">{dateStr}</p>

      <div className="mt-4 pt-4 border-t border-black/[0.08] flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-text-muted text-xs">
            {todayTxCount === 0 ? 'Belum ada transaksi hari ini' : `${todayTxCount} transaksi hari ini`}
          </span>
        </div>
      </div>
    </div>
  )
}

function DonutSection({ chartData, total }) {
  const RADIAN = Math.PI / 180
  const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.08) return null
    const r = innerRadius + (outerRadius - innerRadius) * 0.5
    const x = cx + r * Math.cos(-midAngle * RADIAN)
    const y = cy + r * Math.sin(-midAngle * RADIAN)
    return (
      <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight="600" fontFamily="DM Sans">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  const monthLabel = new Date().toLocaleDateString('id-ID', { month: 'long', year: 'numeric' })
  const isEmpty = total === 0 || chartData.length === 0

  return (
    <div className="rounded-2xl p-5 bg-card" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-primary font-semibold">Monthly Overview</p>
          <p className="text-text-muted text-xs capitalize">{monthLabel}</p>
        </div>
        <span className="text-xs text-text-muted bg-card2 px-3 py-1 rounded-full border border-black/[0.08]">
          Monthly
        </span>
      </div>

      {isEmpty ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <div className="w-16 h-16 rounded-full bg-card2 flex items-center justify-center border border-black/[0.06]">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M8 12h8M12 8v8"/>
            </svg>
          </div>
          <div className="text-center">
            <p className="text-text-muted text-sm font-medium">Belum ada pengeluaran bulan ini.</p>
            <p className="text-text-muted text-xs mt-1">Mulai catat transaksimu melalui AI Chat!</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-4">
          {/* Donut Chart */}
          <div className="relative flex-shrink-0" style={{ width: 160, height: 160 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                  startAngle={90}
                  endAngle={-270}
                  isAnimationActive={true}
                  animationBegin={0}
                  animationDuration={900}
                  animationEasing="ease-out"
                >
                  {chartData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.color} strokeWidth={0} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Center text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] text-text-muted">Total</span>
              <span className="text-base font-bold text-text-primary leading-tight">
                {formatCompact(total)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-col gap-2.5 flex-1 min-w-0">
            {chartData.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="text-text-muted text-xs truncate">{item.emoji} {item.name}</span>
                </div>
                <span className="text-text-primary text-xs font-semibold flex-shrink-0">
                  {formatCompact(item.value)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function QuickInsightCard({ onTap, hasTransactions, criticalBudget }) {
  const isOnboarding = !hasTransactions

  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] hover:brightness-110"
      style={isOnboarding ? {
        background: 'linear-gradient(135deg, rgba(0,201,138,0.12) 0%, rgba(0,201,138,0.06) 100%)',
        border: '1px solid rgba(0,201,138,0.25)',
      } : {
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.06) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: isOnboarding ? 'rgba(0,201,138,0.15)' : 'rgba(251,191,36,0.15)' }}>
          {isOnboarding ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#00C98A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
              stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
              <line x1="12" y1="9" x2="12" y2="13"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          )}
        </div>
        <div className="flex-1 min-w-0">
          {isOnboarding ? (
            <>
              <p className="text-[11px] font-semibold text-accent uppercase tracking-wide mb-0.5">Mulai Catat Keuanganmu · AI</p>
              <p className="text-text-primary text-sm font-medium leading-snug">
                Belum ada data pengeluaran. Tap di sini untuk ngobrol dengan AI tentang cara mencatat pertamamu!
              </p>
            </>
          ) : (
            <>
              <p className="text-[11px] font-semibold text-amber uppercase tracking-wide mb-0.5">Quick Insight · AI</p>
              <p className="text-text-primary text-sm font-medium leading-snug">
                {criticalBudget
                  ? <>Kamu sudah menggunakan <span className="text-amber font-bold">{Math.round((criticalBudget.currentSpent / criticalBudget.limit) * 100)}%</span> dari budget {criticalBudget.categoryName} bulan ini!</>
                  : 'Pengeluaranmu bulan ini masih terkendali. Tetap semangat!'
                }
              </p>
              <p className="text-text-muted text-xs mt-1">Tap untuk lihat solusi dari AI →</p>
            </>
          )}
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke={isOnboarding ? '#00C98A' : '#FBBF24'} strokeWidth="2.5" className="flex-shrink-0 mt-1">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  )
}

function BudgetStatusGrid({ budgets }) {
  return (
    <div className="rounded-2xl p-5 bg-card" style={{ border: '1px solid rgba(0,0,0,0.08)', boxShadow: '0 2px 16px rgba(0,0,0,0.06)' }}>
      <p className="text-text-primary font-semibold mb-4">Budget Status</p>
      <div className="grid grid-cols-2 gap-3">
        {budgets.map((b) => {
          const pct = Math.round((b.currentSpent / b.limit) * 100)
          const isCritical = pct >= 80
          const color = isCritical ? '#EF4444' : pct >= 60 ? '#D97706' : b.color
          return (
            <div key={b.id}
              className="rounded-xl p-3 flex flex-col items-center gap-2"
              style={{ background: 'rgba(0,0,0,0.02)', border: `1px solid ${isCritical ? 'rgba(239,68,68,0.25)' : 'rgba(0,0,0,0.07)'}` }}>
              <CircularProgress percentage={pct} color={color} size={64} strokeWidth={5}>
                <span className="text-sm">{b.emoji}</span>
              </CircularProgress>
              <div className="text-center">
                <p className="text-text-primary text-xs font-semibold">{b.categoryName}</p>
                <p className={`text-xs font-bold ${isCritical ? 'text-danger' : pct >= 60 ? 'text-amber' : 'text-accent'}`}>
                  {pct}%
                </p>
                <p className="text-text-muted text-[10px] mt-0.5">
                  {formatCompact(b.currentSpent)} / {formatCompact(b.limit)}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function Home() {
  const { user, budgets, transactions, setTab, getTodaySpending, getTodayTransactionsCount, getChartData, getTotalMonthlySpending, getCriticalBudgets } = useAppStore()

  const todaySpending = getTodaySpending()
  const todayTxCount = getTodayTransactionsCount()
  const chartData = getChartData()
  const totalMonthly = getTotalMonthlySpending()
  const criticalBudget = getCriticalBudgets()[0] ?? null

  const handleQuickInsightTap = () => {
    setTab('chat')
  }

  return (
    <div className="scroll-content px-4 pt-4 pb-4">
      <div className="page-enter flex flex-col gap-4">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-text-muted text-sm">{GREETING()},</p>
            <h1 className="text-text-primary text-xl font-bold">{user.name} 👋</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-9 h-9 rounded-xl bg-card2 flex items-center justify-center border border-black/[0.08] relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-accent rounded-full" />
            </button>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#4F9DFF] to-[#7B5CF6] flex items-center justify-center">
              <span className="text-white text-xs font-bold">{user.avatar}</span>
            </div>
          </div>
        </div>

        {/* Today's Spending */}
        <TodaySpendingCard amount={todaySpending} todayTxCount={todayTxCount} />

        {/* Donut Chart */}
        <DonutSection chartData={chartData} total={totalMonthly} />

        {/* Quick Insight */}
        <QuickInsightCard
          onTap={handleQuickInsightTap}
          hasTransactions={transactions.length > 0}
          criticalBudget={criticalBudget}
        />

        {/* Budget Status */}
        <BudgetStatusGrid budgets={budgets} />

        {/* Bottom padding */}
        <div className="h-2" />
      </div>
    </div>
  )
}
