import { Card } from '@/components/ui/card'
import { Database, Crown } from 'lucide-react'

export default function SettingsTab() {
  return (
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
  )
}
