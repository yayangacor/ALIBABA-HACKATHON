import useAppStore from '../store/appStore'

const NAV_ITEMS = [
  {
    id: 'home',
    label: 'Home',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? '#00E5A0' : 'none'}
        stroke={active ? '#00E5A0' : '#4B5280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    id: 'transaction',
    label: 'Transactions',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5A0' : '#4B5280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
        <line x1="16" y1="13" x2="8" y2="13"/>
        <line x1="16" y1="17" x2="8" y2="17"/>
        <polyline points="10 9 9 9 8 9"/>
      </svg>
    ),
  },
  {
    id: 'chat',
    label: 'AI Chat',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5A0' : '#4B5280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        {active && <circle cx="12" cy="10" r="1.5" fill="#00E5A0"/>}
      </svg>
    ),
  },
  {
    id: 'insight',
    label: 'Insight',
    icon: (active) => (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
        stroke={active ? '#00E5A0' : '#4B5280'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
        <path d="M22 12A10 10 0 0 0 12 2v10z"/>
      </svg>
    ),
  },
]

export default function BottomNav() {
  const { currentTab, setTab } = useAppStore()

  return (
    <nav className="flex-shrink-0 border-t border-black/[0.08] bg-card" style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.06)' }}>
      <div className="flex items-center justify-around px-2 pt-2 pb-safe" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV_ITEMS.map((item) => {
          const active = currentTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className="flex flex-col items-center gap-1 px-4 py-1 min-w-[60px] transition-all duration-200 active:scale-95"
            >
              <div className={`relative transition-all duration-200 ${active ? 'scale-110' : ''}`}>
                {item.icon(active)}
                {active && (
                  <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-accent" />
                )}
              </div>
              <span className={`text-[10px] font-medium transition-colors duration-200 ${
                active ? 'text-accent' : 'text-muted'
              }`}>
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
