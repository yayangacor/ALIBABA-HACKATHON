import { useState, useRef, useEffect } from 'react'
import useAppStore from '../store/appStore'

// ─── Persona options shown in the review editor ───────────────────────────────
const PERSONAS = ['Student', 'Young Professional', 'Entrepreneur']

// ─── Standardised money constraint categories (from riset fintech) ────────────
const MONEY_CONSTRAINTS = [
  'Impulse snacking',
  'Low Cash Flow',
  'Over-leveraged',
  'Manual entry friction',
]

// ── Small reusable components ─────────────────────────────────────────────────

function ConstraintChips({ value, onChange }) {
  return (
    <div className="flex flex-col gap-2">
      {MONEY_CONSTRAINTS.map((c) => (
        <button
          key={c}
          type="button"
          onClick={() => onChange(c)}
          className={`w-full text-left px-4 py-3 rounded-xl text-xs font-semibold border transition-all active:scale-[0.98]
            ${value === c
              ? 'bg-accent/15 border-accent text-accent'
              : 'bg-bg border-white/10 text-text-muted hover:border-accent/30 hover:text-text-primary'}`}
        >
          {c}
        </button>
      ))}
    </div>
  )
}

function PrivacyBadge() {
  return (
    <div className="flex items-center gap-2 bg-card border border-white/8 rounded-full px-3 py-1.5">
      <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-accent flex-shrink-0">
        <path fillRule="evenodd" clipRule="evenodd"
          d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
      </svg>
      <span className="text-[10px] text-text-muted font-medium">
        Audio never stored · Alibaba Cloud Qwen · End-to-end secure
      </span>
    </div>
  )
}

function SectionHeader({ step, title, subtitle }) {
  return (
    <div className="text-center mb-6">
      <span className="text-xs font-bold text-accent/70 tracking-widest uppercase mb-2 block">
        Step {step} of 2
      </span>
      <h2 className="text-xl font-bold text-text-primary mb-1.5">{title}</h2>
      {subtitle && <p className="text-text-muted text-sm leading-relaxed">{subtitle}</p>}
    </div>
  )
}

// ─── PHASE: intro ─────────────────────────────────────────────────────────────
function PhaseIntro({ onStartRecording, onTypeManually }) {
  return (
    <div className="flex flex-col items-center px-6 py-10 animate-fade-up">
      <SectionHeader
        step={1}
        title="Let's personalize FinLabs"
        subtitle="Speak for 15–30 seconds about your financial goals and situation — our AI does the rest."
      />

      {/* Animated idle orb */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-orb-ring" />
        <div className="absolute inset-2 rounded-full border border-accent/10 animate-orb-ring"
          style={{ animationDelay: '0.8s' }} />
        <div
          className="w-20 h-20 rounded-full bg-card flex items-center justify-center animate-orb-pulse"
          style={{ boxShadow: '0 0 28px rgba(0,229,160,0.4), 0 0 60px rgba(0,229,160,0.15)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth={1.6} className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        </div>
      </div>

      {/* What to say */}
      <div className="bg-card rounded-2xl p-4 w-full mb-6 border border-white/5">
        <p className="text-accent text-xs font-bold mb-2 uppercase tracking-wider">What to say:</p>
        <ul className="space-y-1.5">
          {[
            'Your financial goals (e.g. save for a house, build emergency fund)',
            'Your monthly budget or income range',
            'Things you want to spend less on',
            'Your life situation (student, working, family, etc.)',
          ].map((tip) => (
            <li key={tip} className="flex items-start gap-2">
              <span className="text-accent/60 mt-0.5 flex-shrink-0">›</span>
              <span className="text-text-muted text-xs leading-relaxed">{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Privacy disclaimer — must be prominent for FinTech trust */}
      <div className="bg-accent/5 border border-accent/20 rounded-2xl p-4 w-full mb-6">
        <div className="flex items-start gap-3">
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-accent flex-shrink-0 mt-0.5">
            <path fillRule="evenodd" clipRule="evenodd"
              d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" />
          </svg>
          <div>
            <p className="text-accent text-xs font-bold mb-0.5">Your privacy is guaranteed</p>
            <p className="text-text-muted text-xs leading-relaxed">
              Your audio is <strong className="text-text-primary">never stored</strong> anywhere.
              We convert it to text and immediately discard it.
              Only the extracted financial profile is saved — after <em>you</em> review and confirm it.
            </p>
          </div>
        </div>
      </div>

      <PrivacyBadge />

      {/* CTA buttons */}
      <div className="w-full mt-6 space-y-3">
        <button
          onClick={onStartRecording}
          className="w-full flex items-center justify-center gap-2.5 py-4 rounded-2xl
                     font-bold text-bg text-sm bg-accent hover:bg-accent-dim
                     active:scale-95 transition-all duration-200"
          style={{ boxShadow: '0 0 20px rgba(0,229,160,0.4)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          Start Speaking
        </button>

        <button
          onClick={onTypeManually}
          className="w-full py-3 text-text-muted text-sm hover:text-text-primary transition-colors"
        >
          Type manually instead →
        </button>
      </div>
    </div>
  )
}

// ─── PHASE: recording ─────────────────────────────────────────────────────────
function PhaseRecording({ elapsed, onStop }) {
  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0')
  const secs = String(elapsed % 60).padStart(2, '0')

  return (
    <div className="flex flex-col items-center px-6 py-10 animate-fade-up">
      <p className="text-accent text-xs font-bold tracking-widest uppercase mb-6">Recording…</p>

      {/* Pulsing recording orb — red tint while recording */}
      <div className="relative flex items-center justify-center w-36 h-36 mb-6">
        {/* Animated rings */}
        <div className="absolute inset-0 rounded-full border-2 border-red-400/30 animate-orb-ring" />
        <div className="absolute inset-3 rounded-full border border-red-400/20 animate-orb-ring"
          style={{ animationDelay: '0.6s' }} />
        {/* Core */}
        <div
          className="w-24 h-24 rounded-full flex flex-col items-center justify-center animate-orb-pulse"
          style={{
            background: 'radial-gradient(circle at 35% 35%, #FF6B6B, #CC2200)',
            boxShadow: '0 0 30px rgba(255,80,80,0.6), 0 0 60px rgba(255,80,80,0.25)',
          }}
        >
          {/* Live timer */}
          <span className="text-white font-mono text-lg font-bold leading-none">{mins}:{secs}</span>
          <span className="text-white/60 text-[9px] mt-0.5">recording</span>
        </div>
      </div>

      {/* Prompt */}
      <div className="bg-card rounded-2xl px-5 py-4 w-full mb-8 border border-white/5 text-center">
        <p className="text-text-primary text-sm font-semibold mb-1">Speak naturally…</p>
        <p className="text-text-muted text-xs leading-relaxed">
          Tell us about your financial goals, monthly budget, things you want to cut back on,
          and your life situation.
        </p>
      </div>

      {/* Subtle privacy reminder */}
      <div className="flex items-center gap-1.5 mb-8">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3 text-accent/50">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" />
        </svg>
        <span className="text-text-muted text-[10px]">Audio is processed in memory only — never saved to disk</span>
      </div>

      <button
        onClick={onStop}
        className="w-full py-4 rounded-2xl bg-card2 border border-danger/30 text-danger font-bold text-sm
                   hover:bg-danger/10 active:scale-95 transition-all duration-200"
      >
        Stop &amp; Analyze
      </button>
    </div>
  )
}

// ─── PHASE: processing ────────────────────────────────────────────────────────
function PhaseProcessing() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 animate-fade-up min-h-[60vh]">
      {/* Orb spinner */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-8">
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-orb-ring" />
        <div
          className="w-16 h-16 rounded-full bg-card animate-orb-pulse flex items-center justify-center"
          style={{ boxShadow: '0 0 24px rgba(0,229,160,0.5)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth={1.6} className="w-7 h-7">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 11l5.91-1.74L12 2z" />
          </svg>
        </div>
      </div>
      <p className="text-text-primary font-bold text-base mb-1">Qwen AI is analyzing…</p>
      <p className="text-text-muted text-sm text-center leading-relaxed max-w-[260px]">
        Transcribing your voice and extracting your financial profile. This takes a few seconds.
      </p>
      {/* Animated dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-typing"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
    </div>
  )
}

// ─── PHASE: budget_processing ─────────────────────────────────────────────────
function PhaseBudgetProcessing() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 animate-fade-up min-h-[60vh]">
      {/* Orb spinner */}
      <div className="relative flex items-center justify-center w-28 h-28 mb-8">
        <div className="absolute inset-0 rounded-full border border-accent/20 animate-orb-ring" />
        <div className="absolute inset-3 rounded-full border border-accent/10 animate-orb-ring"
          style={{ animationDelay: '0.8s' }} />
        <div
          className="w-20 h-20 rounded-full bg-card animate-orb-pulse flex items-center justify-center"
          style={{ boxShadow: '0 0 32px rgba(0,229,160,0.6), 0 0 64px rgba(0,229,160,0.2)' }}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth={1.6} className="w-9 h-9">
            <path strokeLinecap="round" strokeLinejoin="round"
              d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 11l5.91-1.74L12 2z" />
          </svg>
        </div>
      </div>
      <p className="text-text-primary font-bold text-lg mb-2">✨ AI is crafting your budget…</p>
      <p className="text-text-muted text-sm text-center leading-relaxed max-w-[260px]">
        Analyzing your income and constraints to create your perfect personalized budget plan.
      </p>
      {/* Animated dots */}
      <div className="flex gap-1.5 mt-6">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="w-2 h-2 rounded-full bg-accent animate-typing"
            style={{ animationDelay: `${i * 0.2}s` }}
          />
        ))}
      </div>
      <div className="mt-8 bg-accent/5 border border-accent/15 rounded-2xl px-5 py-4 w-full max-w-[280px]">
        <p className="text-accent text-xs font-bold mb-2 text-center">Powered by Alibaba Qwen AI</p>
        <ul className="space-y-1.5">
          {['Calculating spending limits per category', 'Adapting to your persona & goals', 'Optimizing for your constraints'].map((step) => (
            <li key={step} className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-accent/60 flex-shrink-0" />
              <span className="text-text-muted text-[11px]">{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// ─── PHASE: review ────────────────────────────────────────────────────────────
function PhaseReview({ data, onConfirm, onReRecord, isSaving }) {
  const [form, setForm] = useState({
    ...data,
    // Normalize to a known chip value; if LLM returned free text, clear it so
    // the user is required to make an explicit selection.
    money_constraints: MONEY_CONSTRAINTS.includes(data.money_constraints)
      ? data.money_constraints
      : '',
    monthly_income: data.monthly_income || '',
  })

  const field = (key, label, isTextarea = false) => (
    <div>
      <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
        {label}
      </label>
      {isTextarea ? (
        <textarea
          value={form[key] || ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          rows={3}
          className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-text-primary
                     text-xs leading-relaxed resize-none focus:outline-none focus:border-accent/50
                     transition-colors"
        />
      ) : (
        <input
          type="text"
          value={form[key] || ''}
          onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
          className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-text-primary
                     text-xs focus:outline-none focus:border-accent/50 transition-colors"
        />
      )}
    </div>
  )

  return (
    <div className="flex flex-col px-5 py-8 animate-fade-up">
      <SectionHeader
        step={2}
        title="Review your profile"
        subtitle="Qwen AI extracted this from your voice. Edit anything before saving."
      />

      {/* Transcript preview (collapsed) */}
      {form.transcript && (
        <details className="mb-4 bg-card rounded-xl border border-white/5 group">
          <summary className="px-4 py-3 text-text-muted text-xs cursor-pointer select-none
                              flex items-center justify-between">
            <span>View transcript</span>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 group-open:rotate-180 transition-transform">
              <path fillRule="evenodd" clipRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
            </svg>
          </summary>
          <p className="px-4 pb-4 text-text-muted text-xs leading-relaxed italic">
            "{form.transcript}"
          </p>
        </details>
      )}

      {/* Editable fields */}
      <div className="bg-card rounded-2xl p-4 border border-white/5 space-y-4 mb-5">
        {/* Persona selector */}
        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            Persona Type
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p}
                onClick={() => setForm((f) => ({ ...f, persona: p }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${form.persona === p
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-bg border-white/10 text-text-muted hover:border-accent/40'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {field('financial_goals', 'Financial Goals', true)}

        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            Monthly Income (Rp)
          </label>
          <input
            type="number"
            placeholder="e.g. 8000000"
            value={form.monthly_income || ''}
            onChange={(e) => setForm((f) => ({ ...f, monthly_income: e.target.value }))}
            className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-text-primary
                       text-xs focus:outline-none focus:border-accent/50 transition-colors
                       placeholder:text-text-muted/50"
          />
          <p className="text-text-muted text-[10px] mt-1">
            Used by AI to generate your personalized budget breakdown
          </p>
        </div>

        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            Money Constraint
          </label>
          <ConstraintChips
            value={form.money_constraints}
            onChange={(val) => setForm((f) => ({ ...f, money_constraints: val }))}
          />
        </div>
      </div>

      {/* Privacy confirmation */}
      <div className="flex items-start gap-2 bg-accent/5 border border-accent/15 rounded-xl px-3 py-2.5 mb-5">
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5">
          <path fillRule="evenodd" clipRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
        </svg>
        <p className="text-text-muted text-[10px] leading-relaxed">
          Your original audio has already been discarded. Only the text profile above will be saved when you confirm.
        </p>
      </div>

      {/* Actions */}
      <button
        onClick={() => onConfirm(form)}
        disabled={isSaving || !form.money_constraints}
        className="w-full py-4 rounded-2xl font-bold text-bg text-sm bg-accent
                   hover:bg-accent-dim active:scale-95 transition-all duration-200
                   disabled:opacity-60 disabled:cursor-not-allowed mb-3"
        style={{ boxShadow: '0 0 20px rgba(0,229,160,0.35)' }}
      >
        {isSaving ? 'Saving…' : 'Confirm & Save →'}
      </button>

      <button
        onClick={onReRecord}
        className="w-full py-3 text-text-muted text-sm hover:text-text-primary transition-colors"
      >
        ↩ Re-record voice
      </button>
    </div>
  )
}

// ─── PHASE: manual ────────────────────────────────────────────────────────────
function PhaseManual({ onSubmit, onBack }) {
  const [form, setForm] = useState({ persona: 'Young Professional', financial_goals: '', money_constraints: '', monthly_income: '' })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async () => {
    if (!form.financial_goals.trim() || !form.money_constraints) return
    setIsSubmitting(true)
    await onSubmit(form)
  }

  return (
    <div className="flex flex-col px-5 py-8 animate-fade-up">
      <SectionHeader
        step={1}
        title="Tell us about yourself"
        subtitle="Fill in your financial situation so FinLabs can personalize your experience."
      />

      <div className="bg-card rounded-2xl p-4 border border-white/5 space-y-4 mb-5">
        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            I am a…
          </label>
          <div className="flex flex-wrap gap-2">
            {PERSONAS.map((p) => (
              <button
                key={p}
                onClick={() => setForm((f) => ({ ...f, persona: p }))}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all
                  ${form.persona === p
                    ? 'bg-accent text-bg border-accent'
                    : 'bg-bg border-white/10 text-text-muted hover:border-accent/40'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            My financial goals
          </label>
          <textarea
            placeholder="e.g. Build a 3-month emergency fund, save for a house down payment…"
            rows={3}
            value={form.financial_goals}
            onChange={(e) => setForm((f) => ({ ...f, financial_goals: e.target.value }))}
            className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-text-primary
                       text-xs leading-relaxed resize-none focus:outline-none focus:border-accent/50
                       placeholder:text-text-muted/50 transition-colors"
          />
        </div>

        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            Monthly Income (Rp)
          </label>
          <input
            type="number"
            placeholder="e.g. 8000000"
            value={form.monthly_income}
            onChange={(e) => setForm((f) => ({ ...f, monthly_income: e.target.value }))}
            className="w-full bg-bg border border-white/10 rounded-xl px-3 py-2.5 text-text-primary
                       text-xs focus:outline-none focus:border-accent/50 transition-colors
                       placeholder:text-text-muted/50"
          />
          <p className="text-text-muted text-[10px] mt-1">
            Used by AI to generate your personalized budget breakdown
          </p>
        </div>

        <div>
          <label className="text-accent text-[10px] font-bold uppercase tracking-widest mb-1.5 block">
            My money constraint
          </label>
          <ConstraintChips
            value={form.money_constraints}
            onChange={(val) => setForm((f) => ({ ...f, money_constraints: val }))}
          />
        </div>
      </div>

      <button
        onClick={handleSubmit}
        disabled={isSubmitting || !form.financial_goals.trim() || !form.money_constraints}
        className="w-full py-4 rounded-2xl font-bold text-bg text-sm bg-accent
                   hover:bg-accent-dim active:scale-95 transition-all duration-200
                   disabled:opacity-40 disabled:cursor-not-allowed mb-3"
        style={{ boxShadow: '0 0 20px rgba(0,229,160,0.35)' }}
      >
        {isSubmitting ? 'Saving…' : 'Save & Continue →'}
      </button>

      <button onClick={onBack} className="w-full py-3 text-text-muted text-sm hover:text-text-primary transition-colors">
        ↩ Back to voice input
      </button>
    </div>
  )
}

// ─── Main OnboardingPage ───────────────────────────────────────────────────────
// Phases:  intro → recording → processing → review → (done — App.jsx navigates away)
//          intro → manual → (done)
export default function OnboardingPage() {
  const { logout } = useAppStore()

  const [phase, setPhase] = useState('intro')
  const [elapsed, setElapsed] = useState(0)
  const [extractedData, setExtracted] = useState(null)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  // Clean up timer on unmount
  useEffect(() => () => clearInterval(timerRef.current), [])

  // ── Recording helpers ──────────────────────────────────────────────────────

  const startRecording = async () => {
    setError(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })

      // Prefer webm/opus (Chrome/Firefox) — fall back to whatever the browser supports
      const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
        ? 'audio/webm;codecs=opus'
        : MediaRecorder.isTypeSupported('audio/webm')
          ? 'audio/webm'
          : '' // Let the browser decide

      const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
      chunksRef.current = []

      recorder.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data) }
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop()) // Release microphone immediately
        processAudio()
      }

      recorder.start(250) // Collect chunks every 250 ms for smoother stop
      mediaRecorderRef.current = recorder

      setElapsed(0)
      setPhase('recording')
      timerRef.current = setInterval(() => setElapsed((t) => t + 1), 1000)
    } catch (err) {
      const msg =
        err.name === 'NotAllowedError' ? 'Microphone access denied — use text input instead.' :
          err.name === 'NotFoundError' ? 'No microphone found — use text input instead.' :
            'Could not access microphone. Please use text input.'
      setError(msg)
    }
  }

  const stopRecording = () => {
    clearInterval(timerRef.current)
    setPhase('processing')
    mediaRecorderRef.current?.stop()
  }

  const processAudio = async () => {
    try {
      const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm'
      const blob = new Blob(chunksRef.current, { type: mimeType })

      const formData = new FormData()
      formData.append('audio', blob, 'recording.webm')

      const res = await fetch('/api/onboarding/transcribe', { method: 'POST', body: formData })
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      const data = await res.json()
      setExtracted(data)
      setPhase('review')
    } catch (err) {
      console.error('[OnboardingPage] Transcribe error:', err)
      setError('Analysis failed. Please try again or type manually.')
      setPhase('intro')
    }
  }

  // ── Confirm & Save ─────────────────────────────────────────────────────────
  // We call the API directly here so we can:
  //  1. Show budget_processing phase immediately while the API runs
  //  2. Call fetchAppData() after the API returns (to load AI-generated budgets)
  //  3. Then mark onboarding complete, triggering App.jsx navigation to home

  const handleConfirm = async (formData) => {
    setError(null)
    // Immediately transition to the cinematic loading phase
    setPhase('budget_processing')

    try {
      const user = useAppStore.getState().user
      const res = await fetch('/api/user/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          persona: formData.persona,
          financial_goals: formData.financial_goals,
          money_constraints: formData.money_constraints,
          monthly_income: Number(formData.monthly_income) || 0,
        }),
      })
      if (!res.ok) throw new Error(`Server error ${res.status}`)

      // Refresh store with the freshly generated budgets from the AI
      await useAppStore.getState().fetchAppData()

      // Mark onboarding complete → App.jsx re-renders and navigates to home
      localStorage.setItem('finlabs_onboarding', 'true')
      useAppStore.setState({ onboardingCompleted: true })
    } catch (err) {
      console.error('[OnboardingPage] Save error:', err)
      setError('Failed to save profile. Please try again.')
      // Revert to the appropriate input phase so the user can retry
      setPhase(extractedData ? 'review' : 'manual')
    }
  }

  // ─── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Background glow */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 50% 35% at 50% 0%, rgba(0,229,160,0.08) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="relative flex items-center justify-between px-5 pt-12 pb-2">
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-lg bg-card border border-accent/20 flex items-center justify-center"
            style={{ boxShadow: '0 0 12px rgba(0,229,160,0.3)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="#00E5A0" strokeWidth={2} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-5.26L4 11l5.91-1.74L12 2z" />
            </svg>
          </div>
          <span className="text-text-primary font-bold text-sm">FinLabs</span>
        </div>
        <button onClick={logout} className="text-text-muted text-xs hover:text-text-primary transition-colors">
          Sign out
        </button>
      </header>

      {/* Global error banner */}
      {error && (
        <div className="mx-5 mt-3 bg-danger/10 border border-danger/30 rounded-xl px-4 py-2.5 text-danger text-xs text-center animate-fade-up">
          {error}
        </div>
      )}

      {/* Phase content — key forces re-mount + re-animation on phase change */}
      <div className="flex-1 overflow-y-auto" key={phase}>
        {phase === 'intro' && (
          <PhaseIntro
            onStartRecording={startRecording}
            onTypeManually={() => { setError(null); setPhase('manual') }}
          />
        )}
        {phase === 'recording' && (
          <PhaseRecording elapsed={elapsed} onStop={stopRecording} />
        )}
        {phase === 'processing' && <PhaseProcessing />}
        {phase === 'budget_processing' && <PhaseBudgetProcessing />}
        {phase === 'review' && extractedData && (
          <PhaseReview
            data={extractedData}
            onConfirm={handleConfirm}
            onReRecord={() => { setExtracted(null); setPhase('intro') }}
            isSaving={false}
          />
        )}
        {phase === 'manual' && (
          <PhaseManual
            onSubmit={handleConfirm}
            onBack={() => setPhase('intro')}
          />
        )}
      </div>
    </div>
  )
}
