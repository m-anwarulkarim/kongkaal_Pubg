import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'
import Header from '../components/Header'
import HeroSection from '../components/HeroSection'
import MatchList, { MOCK_MATCHES } from '@/features/matches/components/MatchList'
import StorePreview from '@/features/store/components/StorePreview'
import HowItWorks from '../components/HowItWorks'
import RulesAccordion from '@/features/rules/components/RulesAccordion'
import Leaderboard from '../components/Leaderboard'
import FAQSection from '../components/FAQSection'
import SlotBookingModal from '@/features/matches/components/SlotBookingModal'
import Footer from '../components/Footer'
import type { MatchItem } from '@/types/match'

export const Route = createFileRoute('/')({ component: App })

function App() {
  const [selectedMatch, setSelectedMatch] = useState<MatchItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleOpenBooking = (match?: MatchItem) => {
    setSelectedMatch(match || MOCK_MATCHES[0])
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
    <div className="min-h-screen bg-[#080b10] text-gray-100 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Navigation Header */}
      <Header onBookClick={() => handleOpenBooking()} />

      {/* Main Page Sections */}
      <main>
        {/* Hero Section */}
        <HeroSection
          onBookClick={() => handleOpenBooking()}
          onExploreMatches={() => scrollToSection('matches')}
        />

        {/* Tournament Matches Section (Solo, Duo, Squad) */}
        <MatchList onSelectMatch={(match) => handleOpenBooking(match)} />

        {/* E-Commerce UC & Gaming Store Preview */}
        <StorePreview />

        {/* How It Works (4-Step Process) */}
        <HowItWorks />

        {/* Rules & Regulations (Shadcn Accordion) */}
        <RulesAccordion />

        {/* Leaderboard & Recent Winner Payout History */}
        <Leaderboard />

        {/* FAQ Section */}
        <FAQSection />
      </main>

      {/* Footer */}
      <Footer />

      {/* Slot Booking Modal (Shadcn Dialog) */}
      <SlotBookingModal
        match={selectedMatch}
        open={isModalOpen}
        onClose={handleCloseModal}
      />
    </div>
  )
}
