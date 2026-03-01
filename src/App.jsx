import { useEffect } from 'react'
import useAppStore from './store/appStore'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Timeline from './pages/Timeline'
import Subscriptions from './pages/Subscriptions'
import Chat from './pages/Chat'
import LandingPage from './pages/LandingPage'
import OnboardingPage from './pages/OnboardingPage'

const PAGES = {
  home: Home,
  timeline: Timeline,
  subscriptions: Subscriptions,
  chat: Chat,
}

export default function App() {
  const { currentTab, user, onboardingCompleted, fetchAppData } = useAppStore()

  // Load live data once the user is authenticated & onboarded
  useEffect(() => {
    if (user && onboardingCompleted) fetchAppData()
  }, [user, onboardingCompleted])

  // ── Unauthenticated ────────────────────────────────────────────────────────
  if (!user) return <LandingPage />

  // ── Authenticated but onboarding not done ─────────────────────────────────
  if (!onboardingCompleted) return <OnboardingPage />

  // ── Main app ───────────────────────────────────────────────────────────────
  const PageComponent = PAGES[currentTab] || Home

  return (
    <div
      className="flex flex-col h-screen max-w-sm mx-auto bg-bg overflow-hidden"
      style={{ boxShadow: '0 0 80px rgba(0,0,0,0.5)' }}
    >
      <main key={currentTab} className="flex-1 overflow-hidden page-enter">
        <PageComponent />
      </main>
      <BottomNav />
    </div>
  )
}
