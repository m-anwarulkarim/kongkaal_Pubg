import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import TournamentGridSection, { KONGKAAL_MATCHES } from '../components/TournamentGridSection'
import BottomSection from '../components/BottomSection'
import StorePreview from '@/features/store/components/StorePreview'
import HowItWorks from '../components/HowItWorks'
import RulesAccordion from '@/features/rules/components/RulesAccordion'
import SlotBookingModal from '@/features/matches/components/SlotBookingModal'
import Footer from '../components/Footer'
import type { MatchItem } from '@/types/match'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenBooking = (match?: MatchItem) => {
    setSelectedMatch(match || KONGKAAL_MATCHES[0])
    setIsModalOpen(true)
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

        {/* 5. E-Commerce UC & Gaming Store Preview */}
        <StorePreview />

        {/* 6. How It Works (4-Step Process) */}
        <HowItWorks />

        {/* 7. Rules Accordion (Shadcn UI) */}
        <RulesAccordion />
      </main>

      {/* 8. Footer */}
      <Footer />

      {/* 9. Payment First Slot Booking Modal */}
      <SlotBookingModal
        match={selectedMatch}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
