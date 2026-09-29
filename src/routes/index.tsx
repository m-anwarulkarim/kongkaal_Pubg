import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import TournamentGridSection, { KONGKAAL_MATCHES } from '../components/TournamentGridSection'
import BottomSection from '../components/BottomSection'
import HowItWorks from '../components/HowItWorks'
import RulesAccordion from '@/features/rules/components/RulesAccordion'
import SlotBookingModal from '@/features/matches/components/SlotBookingModal'
import CustomerAuthModal from '@/components/CustomerAuthModal'
import ContactSection from '../components/ContactSection'
import Footer from '../components/Footer'
import WhatsAppFloatingButton from '../components/WhatsAppFloatingButton'
import { useCustomerAuth } from '@/lib/auth'
import { trackVisitor, getLocalMatches } from '@/lib/db'
import type { MatchItem } from '@/types/match'

export const Route = createFileRoute('/')({
  head: () => ({
    meta: [
      { title: 'KongKaaL Gaming - Bangladesh PUBG Mobile Tournament Platform' },
      { name: 'description', content: 'Play, Compete & Win PUBG Mobile Custom Tournaments in Bangladesh. Solo, Duo, Squad matches with instant bKash & Nagad cash prize payouts on KongKaaL Gaming!' },
      { name: 'keywords', content: 'KongKaaL, KongKaaL Gaming, PUBG Mobile Bangladesh, PUBG Tournament BD, PUBG Custom Room BD, Play PUBG Win Cash, bKash PUBG Tournament, Nagad Gaming BD' },
      { property: 'og:title', content: 'KongKaaL Gaming - Premier PUBG Mobile Tournament Platform in BD' },
      { property: 'og:description', content: 'Compete in daily PUBG Mobile Solo, Duo & Squad custom matches. Win cash prizes with instant bKash & Nagad withdrawal!' },
      { property: 'og:url', content: 'https://kongkaal.com/' },
      { property: 'og:image', content: 'https://kongkaal.com/kongkaal_hero.webp' },
    ],
    links: [
      { rel: 'canonical', href: 'https://kongkaal.com/' },
    ],
  }),
  component: App,
})

function App() {
  const { user } = useCustomerAuth()
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [authModalOpen, setAuthModalOpen] = useState(false)

  // Track site visitor & capture referral code on homepage load
  useEffect(() => {
    trackVisitor()
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const refParam = params.get('ref')
      if (refParam) {
        localStorage.setItem('pending_referral_code', refParam.trim())
      }
    }
  }, [])


  const handleOpenBooking = (match?: MatchItem) => {
    const localMatches = getLocalMatches()
    let target = match
    if (!target) {
      target = localMatches.find((m) => m.status === 'OPEN' || m.status === 'FILLING_FAST') || localMatches[0] || KONGKAAL_MATCHES[0]
    }

    if (
      target &&
      (target.status === 'COMPLETED' ||
        target.status === 'CLOSED' ||
        target.status === 'LIVE_SOON' ||
        target.status === 'COMING_SOON' ||
        (target.joinedSlots || 0) >= (target.maxSlots || 100))
    ) {
      toast.error('এই টুর্নামেন্টের রেজিস্ট্রেশন বন্ধ হয়ে গেছে বা টুর্নামেন্টটি সম্পন্ন হয়েছে!')
      return
    }

    setSelectedMatch(target)

    if (!user) {
      setAuthModalOpen(true)
    } else {
      setIsModalOpen(true)
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedMatch(null)
  }

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-[#07080b] text-gray-100 selection:bg-red-600/30 selection:text-red-200">
      {/* 1. KongKaaL GAMING Navigation Bar */}
      <Header onRegisterClick={() => handleOpenBooking()} />

      <main>
        {/* 2. Hero Banner Section */}
        <HeroSection
          onJoinClick={() => handleOpenBooking()}
          onViewAllClick={() => scrollToSection('tournaments')}
        />

        {/* 3. Tournament Mode Selector, Grid & Leaderboard */}
        <TournamentGridSection onSelectMatch={(match) => handleOpenBooking(match)} />

        {/* 4. Bottom Stats, Recent Winner & WhatsApp Banner */}
        <BottomSection />

        {/* 5. How It Works (4-Step Process) */}
        <HowItWorks />

        {/* 6. Rules Accordion (Shadcn UI) */}
        <RulesAccordion />

        {/* 7. Premium 24/7 Support & Contact Section */}
        <ContactSection />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* 8. Floating WhatsApp Support Button */}
      <WhatsAppFloatingButton />

      {/* 9. Payment First Slot Booking Modal */}
      <SlotBookingModal
        match={selectedMatch}
        open={isModalOpen}
        onClose={handleCloseModal}
      />

      {/* 10. Customer Auth Modal */}
      <CustomerAuthModal
        open={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        user={user}
      />
    </div>
  )
}
