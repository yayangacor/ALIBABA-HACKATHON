import { useState } from 'react'
import { GoogleLogin } from '@react-oauth/google'
import useAppStore from '../store/appStore'

// ─── Feature cards shown on the landing page ─────────────────────────────────
const FEATURES = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    label: 'Smart Budgets',
    desc: 'Real-time category tracking',
    color: '#4F9DFF',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    label: 'Vampire Detect',
    desc: 'Kill wasted subscriptions',
    color: '#F87171',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} className="w-5 h-5">
        <path strokeLinecap="round" strokeLinejoin="round"
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    label: 'AI Chat',
    desc: 'Ask anything, anytime',
    color: '#00E5A0',
  },
]

export default function LandingPage() {
  const { loginWithGoogle, demoLogin } = useAppStore()
  const [isLoading, setIsLoading]   = useState(false)
  const [error, setError]           = useState(null)

  // GoogleLogin component uses Google Identity Services (GSI) — only needs
  // "Authorized JavaScript Origins" in Google Cloud Console, no redirect URIs.
  // onSuccess gives credentialResponse.credential which is a signed JWT (ID token).
  const handleSuccess = async (credentialResponse) => {
    // Guard: COOP issues or unregistered origin can deliver a null credential.
    // Show a clear message instead of sending a 400 to the server.
    if (!credentialResponse?.credential) {
      setError('Google sign-in failed — credential not received. Check Console config or use Demo Login.')
      return
    }
    setIsLoading(true)
    setError(null)
    try {
      await loginWithGoogle(credentialResponse.credential)
    } catch (err) {
      console.error('[LandingPage] Login error:', err)
      setError('Sign-in failed. Please try again.')
      setIsLoading(false)
    }
  }

  const handleError = () => {
    setError('Google sign-in was cancelled or blocked.')
  }

  // Demo bypass — works immediately without Google Cloud Console setup.
  // Perfect for hackathon demos while OAuth propagation is pending.
  const handleDemoLogin = async () => {
    setIsLoading(true)
    setError(null)
    try {
      await demoLogin()
    } catch (err) {
      console.error('[LandingPage] Demo login error:', err)
      setError('Demo login failed — is the backend running on port 3001?')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bg flex flex-col overflow-y-auto">
      {/* ── Background glow ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% -10%, rgba(0,201,138,0.15) 0%, transparent 70%),' +
            'radial-gradient(ellipse 40% 30% at 80% 80%, rgba(79,157,255,0.1) 0%, transparent 60%)',
        }}
      />

      <div className="relative flex flex-col items-center px-6 pt-14 pb-10 max-w-sm mx-auto w-full">

        {/* ── Logo ── */}
        <div
          className="w-16 h-16 rounded-2xl bg-card border border-accent/30 flex items-center justify-center mb-5"
          style={{ boxShadow: '0 0 24px rgba(0,201,138,0.3), 0 4px 16px rgba(0,0,0,0.08)' }}
        >
          {/* Sparkle / AI icon */}
          <svg viewBox="0 0 24 24" fill="none" className="w-8 h-8" stroke="#00E5A0" strokeWidth={1.6}>
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 11l5.91-1.74L12 2z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 15l1 3-3-1" opacity="0.5" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 9l-1-3 3 1" opacity="0.5" />
          </svg>
        </div>

        {/* ── Brand ── */}
        <h1 className="text-3xl font-bold text-text-primary tracking-tight mb-1">FinLabs</h1>
        <p className="text-text-muted text-sm mb-10 text-center leading-relaxed">
          Zero-Effort AI Financial Assistant<br />
          <span className="text-accent/70 text-xs">Powered by Alibaba Cloud Qwen</span>
        </p>

        {/* ── Hero copy ── */}
        <div className="text-center mb-8">
          <h2 className="text-[1.65rem] font-bold text-text-primary leading-tight mb-3">
            Your money,<br />
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #00E5A0 0%, #4F9DFF 100%)' }}
            >
              understood.
            </span>
          </h2>
          <p className="text-text-muted text-sm leading-relaxed max-w-xs">
            AI-powered insights that monitor spending, detect subscriptions draining your wallet,
            and chat with you — all in real time.
          </p>
        </div>

        {/* ── Feature grid ── */}
        <div className="grid grid-cols-3 gap-3 w-full mb-10">
          {FEATURES.map((f) => (
            <div
              key={f.label}
              className="bg-card rounded-2xl p-3 flex flex-col items-center text-center gap-2 border border-black/[0.08]" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${f.color}18`, color: f.color }}
              >
                {f.icon}
              </div>
              <span className="text-text-primary text-xs font-semibold leading-tight">{f.label}</span>
              <span className="text-text-muted text-[10px] leading-tight">{f.desc}</span>
            </div>
          ))}
        </div>

        {/* ── Sign-in section ── */}
        <div className="w-full flex flex-col items-center gap-3">
          {error && (
            <div className="w-full bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5 text-danger text-xs text-center">
              {error}
            </div>
          )}

          {isLoading ? (
            /* Loading state while our server processes the Google token */
            <div className="flex items-center gap-3 py-3 text-text-primary text-sm font-semibold">
              <svg className="w-5 h-5 animate-spin text-accent" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Signing you in…
            </div>
          ) : (
            /*
             * GoogleLogin uses Google Identity Services (GSI) — a popup or
             * redirect flow that only needs "Authorized JavaScript Origins"
             * in Google Cloud Console (no redirect URIs required).
             * onSuccess.credential is a signed JWT (ID token) — more secure
             * than an access token since the backend can verify it without
             * any secret key via Google's tokeninfo endpoint.
             */
            <div className="flex flex-col items-center gap-3 w-full">
              <GoogleLogin
                onSuccess={handleSuccess}
                onError={handleError}
                theme="outline"
                size="large"
                shape="pill"
                text="continue_with"
                width="320"
              />

              {/* ── Divider ── */}
              <div className="flex items-center gap-3 w-full max-w-xs">
                <div className="flex-1 h-px bg-black/[0.1]" />
                <span className="text-text-muted text-[10px] uppercase tracking-widest">or</span>
                <div className="flex-1 h-px bg-black/[0.1]" />
              </div>

              {/* Demo Login — bypasses Google OAuth for hackathon demos */}
              <button
                onClick={handleDemoLogin}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full border border-black/[0.12]
                           text-text-muted text-xs hover:text-text-primary hover:border-black/25
                           transition-all duration-200 active:scale-95"
              >
                <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-accent/60">
                  <path fillRule="evenodd" clipRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Try Demo — no login required
              </button>
            </div>
          )}

          {/* Trust / privacy note */}
          <div className="flex items-center justify-center gap-2 pt-1">
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-accent/60 flex-shrink-0">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
            </svg>
            <span className="text-text-muted text-[11px]">
              Secured · Powered by Alibaba Cloud Qwen AI
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
