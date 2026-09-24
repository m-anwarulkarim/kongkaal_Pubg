import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Crown, Users, Lock, ShieldAlert, ChevronRight } from 'lucide-react'

interface AdminLoginProps {
  email: string
  setEmail: (email: string) => void
  password: string
  setPassword: (password: string) => void
  errorMsg: string
  handleLogin: (e: React.FormEvent) => void
}

export default function AdminLogin({
  email,
  setEmail,
  password,
  setPassword,
  errorMsg,
  handleLogin,
}: AdminLoginProps) {
  return (
    <div className="min-h-screen bg-[#07080b] flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Glowing Flare Backgrounds */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full pointer-events-none" />

      <Card className="w-full max-w-md bg-[#0f131d]/90 backdrop-blur-xl border-2 border-red-900/50 text-gray-100 p-8 shadow-2xl rounded-2xl relative z-10">
        <CardHeader className="text-center pb-6 border-b border-white/5">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600/30 to-amber-600/20 border border-red-500/40 flex items-center justify-center text-red-500 mx-auto mb-3 shadow-lg shadow-red-600/20">
            <Crown className="w-8 h-8 text-red-500" />
          </div>
          <Badge className="bg-red-600/20 text-red-400 border border-red-600/30 font-gaming text-[10px] uppercase font-bold tracking-widest mx-auto mb-2 px-3 py-1">
            KONGKAAL ADMIN PORTAL
          </Badge>
          <CardTitle className="font-display text-3xl font-black text-white uppercase tracking-wider">
            ADMIN LOGIN
          </CardTitle>
          <p className="text-xs text-gray-400 font-medium mt-1">Enter your credentials to access management dashboard</p>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <Label className="text-xs font-bold text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-red-500" /> ADMIN EMAIL
              </Label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="kongkaal2026@gmail.com"
                className="bg-[#07080b] border-gray-700 text-white font-medium text-sm rounded-xl py-2.5 focus:border-red-500"
              />
            </div>

            <div>
              <Label className="text-xs font-bold text-gray-300 uppercase mb-1.5 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-red-500" /> PASSWORD
              </Label>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="bg-[#07080b] border-gray-700 text-white font-medium text-sm rounded-xl py-2.5 focus:border-red-500"
              />
            </div>

            {errorMsg && (
              <div className="bg-red-950/80 border border-red-600/60 p-3 rounded-xl text-xs font-bold text-red-400 text-center flex items-center justify-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <Button
              type="submit"
              className="w-full btn-kong-red py-3.5 rounded-xl font-gaming text-sm font-black uppercase tracking-wider shadow-lg shadow-red-600/30 flex items-center justify-center gap-2 group"
            >
              <span>ENTER ADMIN DASHBOARD</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
