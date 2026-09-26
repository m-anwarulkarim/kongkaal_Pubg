import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/card'
import { Database, Crown, Calendar, Save, CheckCircle2, Shield, Clock } from 'lucide-react'
import { getHeroBannerSettings, saveHeroBannerSettings, type HeroBannerSettings } from '@/lib/db'
import { getDepositCooldownMinutes, saveDepositCooldownMinutes } from '@/lib/wallet'
import { toast } from 'sonner'

export default function SettingsTab() {
  const [heroSettings, setHeroSettings] = useState<HeroBannerSettings>(() => getHeroBannerSettings())
  const [savedSuccess, setSavedSuccess] = useState(false)
  const [cooldownMins, setCooldownMins] = useState<number>(() => getDepositCooldownMinutes())
  const [cooldownSaved, setCooldownSaved] = useState(false)

  useEffect(() => {
    setHeroSettings(getHeroBannerSettings())
    setCooldownMins(getDepositCooldownMinutes())
  }, [])

  const handleSaveBannerSettings = (e: React.FormEvent) => {
    e.preventDefault()
    saveHeroBannerSettings(heroSettings)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  const handleSaveCooldown = (e: React.FormEvent) => {
    e.preventDefault()
    saveDepositCooldownMinutes(cooldownMins)
    setCooldownSaved(true)
    toast.success(`Deposit Cooldown ${cooldownMins} মিনিটে আপডেট করা হয়েছে!`)
    setTimeout(() => setCooldownSaved(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* 1. Next Match Hero Banner Settings Card */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
              <Calendar className="w-5 h-5 text-red-500" />
              <span>Next Match & Hero Banner Manager</span>
            </h3>
            <span className="text-xs text-gray-400">
              হোমপেজের "Next Match" এবং "LIVE Tournament" কার্ডের তথ্য এডমিন প্যানেল থেকে পরিবর্তন করুন।
            </span>
          </div>
          {savedSuccess && (
            <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold flex items-center gap-1.5 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5" /> সেটিংস আপডেট করা হয়েছে!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveBannerSettings} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Next Match Time */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                Next Match Time (সময় ও তারিখ)
              </label>
              <input
                type="text"
                value={heroSettings.nextMatchTime}
                onChange={(e) => setHeroSettings({ ...heroSettings, nextMatchTime: e.target.value })}
                placeholder="e.g. Today • 10:00 PM"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-medium"
                required
              />
            </div>

            {/* Next Match Map & Mode */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                Next Match Map & Server (ম্যাপ ও সার্ভার)
              </label>
              <input
                type="text"
                value={heroSettings.nextMatchMap}
                onChange={(e) => setHeroSettings({ ...heroSettings, nextMatchMap: e.target.value })}
                placeholder="e.g. Erangel / Asia"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-medium"
                required
              />
            </div>

            {/* Live Tournament Status */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                LIVE Badge Status Text
              </label>
              <input
                type="text"
                value={heroSettings.liveStatusText}
                onChange={(e) => setHeroSettings({ ...heroSettings, liveStatusText: e.target.value })}
                placeholder="e.g. Tournament Ongoing"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-medium"
                required
              />
            </div>

            {/* Active Players Count */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                Active Players Count (সক্রিয় প্লেয়ার সংখ্যা)
              </label>
              <input
                type="number"
                value={heroSettings.activePlayersCount}
                onChange={(e) => setHeroSettings({ ...heroSettings, activePlayersCount: Number(e.target.value) })}
                placeholder="128"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-medium"
                required
              />
            </div>

            {/* Hero Background AI Video URL */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                Hero Background AI Video URL (ব্যাকগ্রাউন্ড ভিডিও MP4)
              </label>
              <input
                type="text"
                value={heroSettings.heroVideoUrl || ''}
                onChange={(e) => setHeroSettings({ ...heroSettings, heroVideoUrl: e.target.value })}
                placeholder="https://example.com/video.mp4"
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

            {/* YouTube Gameplay / Trailer Video URL */}
            <div>
              <label className="block text-xs font-bold text-gray-300 mb-1.5 uppercase">
                YouTube Gameplay Video URL (পপআপ ট্রেইলার ভিডিও)
              </label>
              <input
                type="text"
                value={heroSettings.youtubeVideoUrl || ''}
                onChange={(e) => setHeroSettings({ ...heroSettings, youtubeVideoUrl: e.target.value })}
                placeholder="https://www.youtube.com/watch?v=..."
                className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-red-500 font-mono"
              />
            </div>

          </div>

          {/* Banner Live Preview Card */}
          <div className="bg-[#080b12] border border-white/10 rounded-xl p-4 mt-2">
            <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider block mb-2">
              Preview Card (হোমপেজে যেভাবে দেখাবে)
            </span>
            <div className="bg-[#10131a] border border-white/10 rounded-xl p-3 flex items-center justify-between max-w-sm">
              <div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-gray-300 mb-0.5">
                  <Calendar className="w-3.5 h-3.5 text-red-500" />
                  <span>Next Match</span>
                </div>
                <div className="text-sm font-extrabold text-white">
                  {heroSettings.nextMatchTime}
                </div>
                <div className="text-[11px] text-gray-400 font-medium mt-0.5 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-red-500" /> {heroSettings.nextMatchMap}
                </div>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-red-600/30"
            >
              <Save className="w-4 h-4" />
              <span>Save Banner Settings</span>
            </button>
          </div>
        </form>
      </Card>

      {/* 2. Deposit Request Cooldown & Security Settings */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-5">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="font-display text-xl font-black text-white uppercase flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <span>Deposit Request Cooldown & Spam Filter</span>
            </h3>
            <span className="text-xs text-gray-400">
              ভুলবশত বারবার ক্লিক বা স্প্যামিং বন্ধ করতে টাকা জমা (Deposit Request) দেওয়ার বিরতি সময় নির্ধারণ করুন
            </span>
          </div>
          {cooldownSaved && (
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-in fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cooldown Updated!</span>
            </div>
          )}
        </div>

        <form onSubmit={handleSaveCooldown} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-bold text-gray-300 block mb-1">
                Deposit Request Cooldown (মিনিট)
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={cooldownMins}
                  onChange={(e) => setCooldownMins(Math.max(0, parseInt(e.target.value || '0', 10)))}
                  className="w-full bg-[#080b12] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500 font-bold"
                />
                <span className="text-xs font-bold text-amber-400 shrink-0">মিনিট</span>
              </div>
              <span className="text-[11px] text-gray-400 block mt-1">
                * ইউজার ১টি ডিপোজিট রিকোয়েস্ট সাবমিট করার পর এই নির্দিষ্ট মিনিট সময় অতিবাহিত না হওয়া পর্যন্ত ২য় রিকোয়েস্ট দিতে পারবে না। (0 দিলে কোন কুলডাউন থাকবে না)
              </span>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer shadow-lg shadow-amber-600/30"
              >
                <Save className="w-4 h-4" />
                <span>Save Cooldown Settings</span>
              </button>
            </div>
          </div>
        </form>
      </Card>

      {/* 3. Platform & Security Settings */}
      <Card className="bg-[#101422] border-white/10 p-6 rounded-2xl space-y-6">
        <div className="border-b border-white/10 pb-4">
          <h3 className="font-display text-2xl font-black text-white uppercase">
            Platform & Security Settings
          </h3>
          <span className="text-xs text-gray-400">Database connection, admin credentials & server health</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Supabase Status Card */}
          <div className="bg-[#080b12] border border-emerald-500/30 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Database className="w-6 h-6 text-emerald-400" />
              <div>
                <h4 className="font-bold text-white text-sm">Supabase Database Connection</h4>
                <span className="text-xs text-emerald-400 font-mono">CONNECTED & ACTIVE</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Live matches and registrations are automatically synchronized with Supabase PostgreSQL cloud database.
            </p>
          </div>

          {/* Admin Auth Info Card */}
          <div className="bg-[#080b12] border border-red-900/40 p-5 rounded-xl space-y-3">
            <div className="flex items-center gap-3">
              <Crown className="w-6 h-6 text-red-500" />
              <div>
                <h4 className="font-bold text-white text-sm">Admin Access Account</h4>
                <span className="text-xs text-gray-300 font-mono">kongkaal2026@gmail.com</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed">
              Full administrator rights enabled. All payment approvals and match creations are logged.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}
