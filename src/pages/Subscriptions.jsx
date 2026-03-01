import useAppStore, { formatRupiah, formatCompact } from '../store/appStore'

function SubIcon({ emoji, bgColor }) {
  return (
    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
      style={{ background: `${bgColor}22`, border: `1px solid ${bgColor}33` }}>
      {emoji}
    </div>
  )
}

function SubscriptionCard({ sub }) {
  const nextDate = new Date(sub.nextBillingDate).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric',
  })

  const daysLeft = Math.ceil((new Date(sub.nextBillingDate) - new Date('2026-02-28')) / (1000 * 60 * 60 * 24))

  return (
    <div className={`rounded-2xl p-4 transition-all ${
      sub.isVampireRisk
        ? 'border border-danger/30 bg-gradient-to-r from-[rgba(248,113,113,0.06)] to-card'
        : 'border border-white/[0.06] bg-card'
    }`}>
      <div className="flex items-start gap-3">
        <SubIcon emoji={sub.emoji} bgColor={sub.bgColor} />

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-text-primary text-sm font-bold">{sub.serviceName}</p>
                {sub.isVampireRisk && (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-danger/15 text-danger border border-danger/25">
                    🧛 Vampire
                  </span>
                )}
              </div>
              <p className="text-text-muted text-xs mt-0.5">{sub.category}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-text-primary text-sm font-bold">{formatRupiah(sub.amount)}</p>
              <p className="text-text-muted text-[10px]">/bulan</p>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#4B5280" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <span className="text-text-muted text-xs">{nextDate}</span>
              <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                daysLeft <= 3 ? 'bg-danger/15 text-danger' : 'bg-white/[0.06] text-text-muted'
              }`}>
                {daysLeft}h lagi
              </span>
            </div>

            {sub.isVampireRisk && (
              <button className="flex items-center gap-1.5 text-xs font-semibold text-danger bg-danger/10 px-3 py-1.5 rounded-xl border border-danger/20 active:scale-95 transition-transform">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Cancel
              </button>
            )}
          </div>

          {sub.isVampireRisk && sub.vampireReason && (
            <div className="mt-2.5 flex items-center gap-1.5 bg-danger/08 rounded-xl px-3 py-2 border border-danger/15">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#F87171" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <span className="text-danger text-[11px] font-medium">⚠️ {sub.vampireReason}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function Subscriptions() {
  const { subscriptions, getTotalSubscriptions } = useAppStore()
  const total = getTotalSubscriptions()
  const vampires = subscriptions.filter(s => s.isVampireRisk)
  const vampireTotal = vampires.reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex-shrink-0 px-4 pt-4 pb-4 border-b border-white/[0.04]">
        <h2 className="text-text-primary text-xl font-bold">Subscription</h2>
        <p className="text-text-muted text-sm mt-0.5">Kelola langganan bulananmu</p>
      </div>

      {/* Scroll */}
      <div className="scroll-content px-4 py-4 flex flex-col gap-4">

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-2xl p-4 bg-card border border-white/[0.06]">
            <p className="text-text-muted text-xs mb-1">Total Bulanan</p>
            <p className="text-text-primary text-lg font-bold">{formatCompact(total)}</p>
            <p className="text-text-muted text-[10px] mt-0.5">{subscriptions.length} layanan aktif</p>
          </div>
          <div className="rounded-2xl p-4 border"
            style={{ background: 'rgba(248,113,113,0.07)', borderColor: 'rgba(248,113,113,0.25)' }}>
            <p className="text-danger/80 text-xs mb-1 font-medium">🧛 Bisa Dihemat</p>
            <p className="text-danger text-lg font-bold">{formatCompact(vampireTotal)}</p>
            <p className="text-danger/60 text-[10px] mt-0.5">{vampires.length} vampire subscription</p>
          </div>
        </div>

        {/* AI tip */}
        {vampires.length > 0 && (
          <div className="rounded-2xl p-4 flex items-start gap-3"
            style={{ background: 'rgba(0,229,160,0.07)', border: '1px solid rgba(0,229,160,0.2)' }}>
            <span className="text-2xl flex-shrink-0">🤖</span>
            <div>
              <p className="text-accent text-xs font-bold mb-1">FinLabs AI Insight</p>
              <p className="text-text-muted text-xs leading-relaxed">
                Saya mendeteksi kamu berlangganan <span className="text-text-primary font-semibold">Gemini Advanced</span> dan <span className="text-text-primary font-semibold">ChatGPT Go</span> sekaligus — keduanya adalah AI assistant. Kamu bisa hemat <span className="text-accent font-bold">Rp 70.000/bulan</span> dengan membatalkan ChatGPT Go.
              </p>
            </div>
          </div>
        )}

        {/* Subscription list */}
        <div>
          <p className="text-text-muted text-xs font-semibold uppercase tracking-wide mb-3">Semua Langganan</p>
          <div className="flex flex-col gap-3">
            {subscriptions.map(sub => (
              <SubscriptionCard key={sub.id} sub={sub} />
            ))}
          </div>
        </div>

        <div className="h-2" />
      </div>
    </div>
  )
}
