import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts'
import CircularProgress from '../components/CircularProgress'
import useAppStore, { formatRupiah, formatCompact } from '../store/appStore'

const GREETING = () => {
  const h = new Date().getHours()
  if (h < 12) return 'Good morning'
  if (h < 17) return 'Good afternoon'
  return 'Good evening'
}

function TodaySpendingCard({ amount }) {
  return (
    <div className="relative overflow-hidden rounded-2xl p-5"
      style={{ background: 'linear-gradient(135deg, #1A1E3D 0%, #131528 100%)', border: '1px solid rgba(79,157,255,0.15)' }}>
      {/* Decorative blob */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-10"
        style={{ background: 'radial-gradient(circle, #4F9DFF, transparent)' }} />

      <p className="text-text-muted text-sm font-medium">Today's Spending</p>
      <p className="text-3xl font-bold text-text-primary mt-1">{formatRupiah(amount)}</p>
      <p className="text-text-muted text-xs mt-1">28 Februari 2026</p>

      <div className="mt-4 pt-4 border-t border-white/[0.06] flex items-center gap-2">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-accent" />
          <span className="text-text-muted text-xs">2 transaksi hari ini</span>
        </div>
        <span className="ml-auto text-xs text-accent font-semibold flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/>
            <polyline points="17 6 23 6 23 12"/>
          </svg>
          -12% vs kemarin
        </span>
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
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central"
        fontSize={11} fontWeight="600" fontFamily="DM Sans">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    )
  }

  return (
    <div className="rounded-2xl p-5 bg-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-text-primary font-semibold">Monthly Overview</p>
          <p className="text-text-muted text-xs">Februari 2026</p>
        </div>
        <span className="text-xs text-text-muted bg-card2 px-3 py-1 rounded-full border border-white/[0.06]">
          Monthly
        </span>
      </div>

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
    </div>
  )
}

function QuickInsightCard({ onTap }) {
  return (
    <button
      onClick={onTap}
      className="w-full text-left rounded-2xl p-4 transition-all duration-200 active:scale-[0.98] hover:brightness-110"
      style={{
        background: 'linear-gradient(135deg, rgba(251,191,36,0.12) 0%, rgba(251,191,36,0.06) 100%)',
        border: '1px solid rgba(251,191,36,0.25)',
      }}
    >
      <div className="flex items-start gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5"
          style={{ background: 'rgba(251,191,36,0.15)' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
            stroke="#FBBF24" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
            <line x1="12" y1="9" x2="12" y2="13"/>
            <line x1="12" y1="17" x2="12.01" y2="17"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] font-semibold text-amber uppercase tracking-wide mb-0.5">Quick Insight · AI</p>
          <p className="text-text-primary text-sm font-medium leading-snug">
            Kamu sudah menggunakan <span className="text-amber font-bold">82%</span> dari budget Foods bulan ini!
          </p>
          <p className="text-text-muted text-xs mt-1">Tap untuk lihat solusi dari AI →</p>
        </div>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
          stroke="#FBBF24" strokeWidth="2.5" className="flex-shrink-0 mt-1">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </button>
  )
}

function BudgetStatusGrid({ budgets }) {
  return (
    <div className="rounded-2xl p-5 bg-card" style={{ border: '1px solid rgba(255,255,255,0.06)' }}>
      <p className="text-text-primary font-semibold mb-4">Budget Status</p>
      <div className="grid grid-cols-2 gap-3">
        {budgets.map((b) => {
          const pct = Math.round((b.currentSpent / b.limit) * 100)
          const isCritical = pct >= 80
          const color = isCritical ? '#F87171' : pct >= 60 ? '#FBBF24' : b.color
          return (
            <div key={b.id}
              className="rounded-xl p-3 flex flex-col items-center gap-2"
              style={{ background: 'rgba(255,255,255,0.03)', border: `1px solid ${isCritical ? 'rgba(248,113,113,0.2)' : 'rgba(255,255,255,0.05)'}` }}>
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
  const { user, budgets, setTab, setChatTriggered, getTodaySpending, getChartData, getTotalMonthlySpending } = useAppStore()

  const todaySpending = getTodaySpending()
  const chartData = getChartData()
  const totalMonthly = getTotalMonthlySpending()

  const handleQuickInsightTap = () => {
    setChatTriggered(true)
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
            <button className="w-9 h-9 rounded-xl bg-card2 flex items-center justify-center border border-white/[0.06] relative">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#8892B0" strokeWidth="2">
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
        <TodaySpendingCard amount={todaySpending} />

        {/* Donut Chart */}
        <DonutSection chartData={chartData} total={totalMonthly} />

        {/* Quick Insight */}
        <QuickInsightCard onTap={handleQuickInsightTap} />

        {/* Budget Status */}
        <BudgetStatusGrid budgets={budgets} />

        {/* Bottom padding */}
        <div className="h-2" />
      </div>
    </div>
  )
}
