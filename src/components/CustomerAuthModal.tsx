import { useState } from 'react'
import { LogOut, CheckCircle2, ShieldCheck, Gamepad2 } from 'lucide-react'
import { signInWithGoogle, customerSignOut } from '@/lib/auth'
import type { User } from '@supabase/supabase-js'

interface CustomerAuthModalProps {
  open: boolean
  onClose: () => void
  user: User | null
}

export default function CustomerAuthModal({ open, onClose, user }: CustomerAuthModalProps) {
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  if (!open) return null

  const handleGoogleLogin = async () => {
    setLoading(true)
    setErrorMsg('')
    try {
      const { error } = await signInWithGoogle()
      if (error) {
        setErrorMsg(error.message || 'Failed to sign in with Google. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Something went wrong.')
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    setLoading(true)
    await customerSignOut()
    setLoading(false)
    onClose()
  }

  const userAvatar = user?.user_metadata?.avatar_url || user?.user_metadata?.picture
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0]
  const userEmail = user?.email

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0d0f17] border border-red-500/30 rounded-2xl shadow-[0_0_50px_rgba(229,9,20,0.2)] overflow-hidden">
        
        {/* Header Banner */}
        <div className="relative p-6 bg-gradient-to-r from-red-950/60 via-[#161a29] to-[#0d0f17] border-b border-white/10 text-center">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            ✕
          </button>

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-red-600/20 border border-red-500/40 text-red-500 mb-3 shadow-[0_0_15px_rgba(229,9,20,0.4)]">
            <Gamepad2 className="w-8 h-8 text-red-500" />
          </div>

          <h3 className="text-xl font-black font-display tracking-wider text-white uppercase">
            KONGKAAL <span className="text-[#e50914]">GAMING</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            {user ? 'Player Account & Profile' : 'Sign in to register tournaments & UC shop'}
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {errorMsg && (
            <div className="p-3 bg-red-950/50 border border-red-500/50 rounded-xl text-xs text-red-300 text-center">
              {errorMsg}
            </div>
          )}

          {user ? (
            /* Logged In State */
            <div className="space-y-5 text-center">
              <div className="flex flex-col items-center gap-3">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || 'User'}
                    className="w-20 h-20 rounded-full border-2 border-red-500 shadow-md shadow-red-600/30 object-cover"
                  />
                ) : (
                  <div className="w-20 h-20 rounded-full bg-red-600/20 border-2 border-red-500 flex items-center justify-center text-red-500 text-2xl font-bold">
                    {userName?.[0]?.toUpperCase() || 'P'}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-center gap-1.5 font-bold text-base text-white">
                    <span>{userName}</span>
                    <ShieldCheck className="w-4 h-4 text-emerald-400 inline" />
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5">{userEmail}</p>
                </div>
              </div>

              <div className="p-3 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-center justify-center gap-2 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Google Account Authenticated & Ready!</span>
              </div>

              <div className="pt-2 border-t border-white/5 flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl bg-[#e50914] text-white font-bold text-xs hover:bg-red-600 transition-colors shadow-md shadow-red-600/30"
                >
                  Continue to Gaming
                </button>
                <button
                  onClick={handleLogout}
                  disabled={loading}
                  className="px-4 py-2.5 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 font-bold text-xs hover:bg-red-900/60 transition-colors flex items-center justify-center gap-1.5"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          ) : (
            /* Logged Out State - Google Sign In */
            <div className="space-y-5">
              <div className="text-center text-xs text-gray-300">
                <p>Google দিয়ে লগইন করলে টুর্নামেন্ট বুকিং করা সহজ হবে এবং রুম আইডি & পাসওয়ার্ড সুরক্ষিত থাকবে।</p>
              </div>

              {/* Google OAuth Button */}
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-white text-gray-900 font-bold text-sm hover:bg-gray-100 transition-all shadow-lg flex items-center justify-center gap-3 group active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {/* Official Google G Logo */}
                <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>{loading ? 'Connecting Google...' : 'Continue with Google'}</span>
              </button>

              <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 pt-2 border-t border-white/5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span>100% Secure Auth powered by Supabase</span>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  )
}
