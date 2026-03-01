import { useState, useEffect, useRef } from 'react'
import useAppStore, { formatRupiah } from '../store/appStore'

// ─── Demo Conversation ────────────────────────────────────────────────────────
const DEMO_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    type: 'alert',
    content: null,
    time: '12:45',
  },
  {
    id: 2,
    role: 'user',
    content: 'What\'s the easiest way to increase my savings for the rest of the month?',
    time: '12:46',
  },
  {
    id: 3,
    role: 'ai',
    type: 'analysis',
    content: null,
    time: '12:46',
    showAction: true,
  },
]

// ─── AI Response logic ────────────────────────────────────────────────────────
const AI_RESPONSES = [
  {
    keywords: ['saving', 'hemat', 'nabung', 'budget', 'kurang', 'habis', 'uang'],
    response: 'Berdasarkan analisis saya, pengeluaran Foods kamu sudah kritis (82%). Saya menemukan peluang penghematan cepat: kamu berlangganan **Gemini Advanced** dan **ChatGPT Go** sekaligus — keduanya adalah AI assistant yang serupa. Batalkan ChatGPT Go dan hemat **Rp 70.000** bulan ini! 🎯',
    action: { type: 'NAVIGATE_TO_SUBSCRIPTIONS' },
  },
  {
    keywords: ['subscription', 'langganan', 'vampire', 'cancel', 'batal'],
    response: 'Berikut ringkasan vampire subscriptions yang terdeteksi:\n\n🧛 **ChatGPT Go** — Rp 70.000/bulan\n→ Duplikat dengan Gemini Advanced yang lebih powerful.\n\nTotal potensi penghematan: **Rp 70.000/bulan** atau **Rp 840.000/tahun!**',
    action: { type: 'NAVIGATE_TO_SUBSCRIPTIONS' },
  },
  {
    keywords: ['food', 'makan', 'restoran', 'snack'],
    response: 'Pengeluaran Foods kamu bulan ini sudah Rp 1.230.000 dari limit Rp 1.500.000 (82%). Tips: Kurangi makan di restoran 2x/minggu dan ganti dengan masak sendiri — estimasi hemat **Rp 200.000** bulan depan! 🍳',
    action: null,
  },
]

const DEFAULT_RESPONSE = 'Saya memahami pertanyaanmu! Berdasarkan data keuanganmu, pengeluaran terbesar adalah di kategori **Foods (82% dari limit)**. Mau saya bantu analisis lebih dalam atau ada yang spesifik ingin kamu tanyakan?'

function getAIResponse(userMsg) {
  const lower = userMsg.toLowerCase()
  for (const r of AI_RESPONSES) {
    if (r.keywords.some(k => lower.includes(k))) {
      return { text: r.response, action: r.action ?? null }
    }
  }
  return { text: DEFAULT_RESPONSE, action: null }
}

// ─── Components ───────────────────────────────────────────────────────────────
function AIOrb() {
  return (
    <div className="flex flex-col items-center gap-2 py-4 flex-shrink-0">
      <div className="relative">
        {/* Outer pulse rings */}
        <div className="absolute inset-0 rounded-full bg-accent/20 animate-orb-ring scale-150" />
        <div className="absolute inset-0 rounded-full bg-accent/10 animate-orb-ring scale-150"
          style={{ animationDelay: '0.8s' }} />
        {/* Core orb */}
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center animate-orb-pulse"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #00F5B4, #00A873)',
            boxShadow: '0 0 20px rgba(0,229,160,0.5), 0 0 40px rgba(0,229,160,0.25)',
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(0,0,0,0.7)" strokeWidth="2">
            <path d="M12 2a10 10 0 1 0 10 10"/>
            <path d="M12 6v6l3 3"/>
            <path d="M20 2v4h4"/>
          </svg>
        </div>
      </div>
      <div className="text-center">
        <p className="text-accent text-sm font-bold">FinLabs AI</p>
        <p className="text-text-muted text-[11px]">Asisten keuanganmu · Aktif</p>
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, #00E5A0, #00A873)' }}>
        <span className="text-[10px] font-bold text-black">AI</span>
      </div>
      <div className="bg-card2 rounded-2xl rounded-bl-md px-4 py-3 border border-white/[0.06]">
        <div className="flex items-center gap-1.5 h-4">
          <span className="typing-dot" />
          <span className="typing-dot" />
          <span className="typing-dot" />
        </div>
      </div>
    </div>
  )
}

function parseMarkdown(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-text-primary font-bold">$1</strong>')
    .replace(/\n/g, '<br/>')
}

function AlertBubble() {
  return (
    <div className="flex items-end gap-2 mb-3 animate-fade-up">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, #00E5A0, #00A873)' }}>
        <span className="text-[10px] font-bold text-black">AI</span>
      </div>
      <div className="max-w-[82%]">
        <div className="rounded-2xl rounded-bl-md p-4"
          style={{ background: 'rgba(251,191,36,0.1)', border: '1px solid rgba(251,191,36,0.25)' }}>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-amber text-base">⚠️</span>
            <p className="text-amber text-xs font-bold uppercase tracking-wide">Budget Alert</p>
          </div>
          <p className="text-text-primary text-sm leading-relaxed">
            Kamu sudah menggunakan <strong className="text-amber font-bold">Rp 1.230.000 (82%)</strong> dari budget Foods bulan ini!
            Dengan sisa 1 hari di Februari, kamu berisiko melebihi limit.
          </p>
        </div>
        <p className="text-text-muted text-[10px] mt-1 ml-1">12:45</p>
      </div>
    </div>
  )
}

function AnalysisBubble({ onGoToSubscriptions }) {
  return (
    <div className="flex items-end gap-2 mb-3 animate-fade-up">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, #00E5A0, #00A873)' }}>
        <span className="text-[10px] font-bold text-black">AI</span>
      </div>
      <div className="max-w-[82%]">
        <div className="rounded-2xl rounded-bl-md p-4 bg-card2 border border-white/[0.07]">
          <p className="text-text-primary text-sm leading-relaxed mb-3">
            Saya telah menganalisis pengeluaran kamu! 🎯 Pengeluaran Foods sudah kritis, tapi saya menemukan peluang menarik di <strong className="text-text-primary font-bold">subscriptions</strong>:
          </p>

          {/* Comparison box */}
          <div className="rounded-xl p-3 mb-3" style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)' }}>
            <p className="text-danger text-xs font-bold mb-2">🧛 Duplikat AI Subscription Terdeteksi!</p>
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-xs">✨ Gemini Advanced</span>
                <span className="text-text-primary text-xs font-semibold">Rp 309.000</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-text-muted text-xs">🤖 ChatGPT Go</span>
                <span className="text-danger text-xs font-semibold">Rp 70.000 ← Batalkan ini</span>
              </div>
            </div>
          </div>

          <p className="text-text-muted text-xs leading-relaxed mb-3">
            Kedua layanan ini fungsinya hampir sama. Batalkan ChatGPT Go dan hemat <strong className="text-accent font-bold">Rp 70.000</strong> bulan ini — cukup untuk 3x makan siang! 🍱
          </p>

          {/* Action button */}
          <button
            onClick={onGoToSubscriptions}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-[0.97]"
            style={{ background: 'linear-gradient(135deg, #00E5A0, #00B882)', color: '#000' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            Review Subscriptions →
          </button>
        </div>
        <p className="text-text-muted text-[10px] mt-1 ml-1">12:46</p>
      </div>
    </div>
  )
}

function UserBubble({ text, time }) {
  return (
    <div className="flex flex-row-reverse items-end gap-2 mb-3 animate-fade-up">
      <div className="max-w-[75%]">
        <div className="rounded-2xl rounded-br-md px-4 py-3"
          style={{ background: 'linear-gradient(135deg, #4F9DFF22, #4F9DFF11)', border: '1px solid rgba(79,157,255,0.2)' }}>
          <p className="text-text-primary text-sm leading-relaxed">{text}</p>
        </div>
        <p className="text-text-muted text-[10px] mt-1 mr-1 text-right">{time}</p>
      </div>
    </div>
  )
}

function AITextBubble({ text, action, actionDone, isActionLoading, onGoToSubscriptions, onAddTransaction, onCancelSubscription }) {
  let actionButton = null
  if (action && !actionDone) {
    if (action.type === 'NAVIGATE_TO_SUBSCRIPTIONS') {
      actionButton = (
        <button onClick={onGoToSubscriptions}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97]"
          style={{ background: 'linear-gradient(135deg, #00E5A0, #00B882)', color: '#000' }}>
          Review Subscriptions →
        </button>
      )
    } else if (action.type === 'ADD_TRANSACTION') {
      actionButton = (
        <button onClick={onAddTransaction} disabled={isActionLoading}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #00E5A0, #00B882)', color: '#000' }}>
          {isActionLoading ? 'Menyimpan...' : `Catat Pengeluaran ${formatRupiah(action.payload.amount)} di ${action.payload.merchant}`}
        </button>
      )
    } else if (action.type === 'CANCEL_SUBSCRIPTION') {
      actionButton = (
        <button onClick={onCancelSubscription} disabled={isActionLoading}
          className="mt-3 w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-semibold text-sm transition-all active:scale-[0.97] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg, #F87171, #ef4444)', color: '#fff' }}>
          {isActionLoading ? 'Membatalkan...' : `Batalkan Langganan ${action.payload.serviceName}`}
        </button>
      )
    }
  }

  return (
    <div className="flex items-end gap-2 mb-3 animate-fade-up">
      <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center"
        style={{ background: 'radial-gradient(circle, #00E5A0, #00A873)' }}>
        <span className="text-[10px] font-bold text-black">AI</span>
      </div>
      <div className="max-w-[82%]">
        <div className="rounded-2xl rounded-bl-md px-4 py-3 bg-card2 border border-white/[0.07]">
          <p className="text-text-primary text-sm leading-relaxed"
            dangerouslySetInnerHTML={{ __html: parseMarkdown(text) }} />
          {actionDone && (
            <p className="mt-2 text-accent text-xs font-semibold">✓ Berhasil!</p>
          )}
          {actionButton}
        </div>
      </div>
    </div>
  )
}

// ─── Main Chat Page ───────────────────────────────────────────────────────────
export default function Chat() {
  const { chatTriggered, setChatTriggered, setTab } = useAppStore()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [demoPhase, setDemoPhase] = useState(0)
  const [actionLoading, setActionLoading] = useState(null)
  const bottomRef = useRef(null)

  const goToSubscriptions = () => {
    setChatTriggered(false)
    setTab('subscriptions')
  }

  const handleAddTransaction = async (payload, msgId) => {
    setActionLoading(msgId)
    try {
      const res = await fetch('/api/transactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await useAppStore.getState().fetchAppData()
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionDone: true } : m))
    } catch (err) {
      console.error('[handleAddTransaction]', err)
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async (payload, msgId) => {
    setActionLoading(msgId)
    try {
      const res = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      await useAppStore.getState().fetchAppData()
      setMessages(prev => prev.map(m => m.id === msgId ? { ...m, actionDone: true } : m))
    } catch (err) {
      console.error('[handleCancelSubscription]', err)
    } finally {
      setActionLoading(null)
    }
  }

  // Auto-play demo conversation when triggered from Quick Insight
  useEffect(() => {
    if (chatTriggered && demoPhase === 0) {
      setMessages([])
      setDemoPhase(1)

      // Phase 1: AI alert bubble
      setTimeout(() => {
        setMessages([{ id: 1, role: 'ai', type: 'alert' }])
        setDemoPhase(2)
      }, 600)

      // Phase 2: User message
      setTimeout(() => {
        setMessages(prev => [...prev, {
          id: 2, role: 'user',
          content: "What's the easiest way to increase my savings for the rest of the month?",
          time: 'Baru saja',
        }])
        setIsTyping(true)
        setDemoPhase(3)
      }, 1800)

      // Phase 3: AI analysis response
      setTimeout(() => {
        setIsTyping(false)
        setMessages(prev => [...prev, { id: 3, role: 'ai', type: 'analysis' }])
      }, 3500)
    }
  }, [chatTriggered])

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isTyping])

  const handleSend = async () => {
    if (!input.trim() || isTyping) return
    const userMsg = input.trim()
    setInput('')

    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
    const newId = Date.now()

    // Snapshot updated messages to build API payload
    const updatedMessages = [...messages, { id: newId, role: 'user', content: userMsg, time: now }]
    setMessages(updatedMessages)
    setIsTyping(true)

    try {
      // Only send plain text messages (user + ai text bubbles) to the API
      const apiMessages = updatedMessages
        .filter(m => m.content && (m.role === 'user' || (m.role === 'ai' && m.type === 'text')))
        .map(m => ({ role: m.role === 'ai' ? 'assistant' : 'user', content: m.content }))

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
      })

      const data = await res.json()
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: newId + 1, role: 'ai', type: 'text',
        content: data.reply,
        action: data.action ?? null,
        time: now,
      }])
    } catch (_err) {
      // Fallback: use local keyword-matching if backend is offline
      const { text, action } = getAIResponse(userMsg)
      setIsTyping(false)
      setMessages(prev => [...prev, {
        id: newId + 1, role: 'ai', type: 'text',
        content: text, action, time: now,
      }])
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* AI Orb header */}
      <AIOrb />

      {/* Chat area */}
      <div className="flex-1 scroll-content px-4 pb-4">
        {messages.length === 0 && !isTyping && (
          <div className="flex flex-col items-center justify-center h-full gap-4 py-8 text-center">
            <div className="text-4xl">💬</div>
            <p className="text-text-muted text-sm max-w-[220px] leading-relaxed">
              Tanyakan apa saja tentang keuangan kamu kepada FinLabs AI
            </p>
            <div className="flex flex-col gap-2 w-full max-w-[260px]">
              {[
                '📊 Berapa total pengeluaran saya bulan ini?',
                '💡 Cara hemat budget makanan?',
                '🧛 Cek vampire subscriptions saya',
              ].map(q => (
                <button key={q}
                  onClick={() => { setInput(q.slice(2).trim()); }}
                  className="text-left text-xs text-text-muted bg-card rounded-xl px-3 py-2.5 border border-white/[0.06] hover:border-accent/30 hover:text-text-primary transition-all active:scale-95">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map(msg => {
          if (msg.role === 'user') {
            return <UserBubble key={msg.id} text={msg.content} time={msg.time} />
          }
          if (msg.type === 'alert') {
            return <AlertBubble key={msg.id} />
          }
          if (msg.type === 'analysis') {
            return <AnalysisBubble key={msg.id} onGoToSubscriptions={goToSubscriptions} />
          }
          return (
            <AITextBubble
              key={msg.id}
              text={msg.content}
              action={msg.action}
              actionDone={msg.actionDone}
              isActionLoading={actionLoading === msg.id}
              onGoToSubscriptions={goToSubscriptions}
              onAddTransaction={() => handleAddTransaction(msg.action?.payload, msg.id)}
              onCancelSubscription={() => handleCancelSubscription(msg.action?.payload, msg.id)}
            />
          )
        })}

        {isTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input area */}
      <div className="flex-shrink-0 px-4 pb-4 pt-2 border-t border-white/[0.04]">
        <div className="flex items-center gap-2 bg-card rounded-2xl px-4 py-3 border border-white/[0.07]">
          <input
            type="text"
            placeholder="Tanya FinLabs AI..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            className="flex-1 bg-transparent text-text-primary text-sm placeholder:text-muted outline-none"
          />
          <div className="flex items-center gap-2">
            <button className="text-muted hover:text-text-muted transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="23"/>
                <line x1="8" y1="23" x2="16" y2="23"/>
              </svg>
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all ${
                input.trim() && !isTyping
                  ? 'bg-accent active:scale-90'
                  : 'bg-card2 opacity-40'
              }`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke={input.trim() && !isTyping ? '#000' : '#8892B0'} strokeWidth="2.5">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
