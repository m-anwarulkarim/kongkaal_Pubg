import { Users, Trophy, Coins, Shield, Medal, MessageCircle, ArrowRight } from 'lucide-react'

export default function BottomSection() {
  return (
    <div className="mx-auto max-w-7xl px-4 lg:px-8 my-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* 1. Left Stats Bar (4 columns) */}
        <div className="lg:col-span-5 bg-[#10131a] p-4 rounded-2xl border border-white/10 grid grid-cols-4 gap-2 text-center items-center">
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Users className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">1,248+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Players</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Trophy className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">86+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Tournaments</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Coins className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">৳2,48,750+</div>
            <div className="text-[10px] text-gray-400 font-medium">Total Prize Pool</div>
          </div>
          <div>
            <div className="w-8 h-8 rounded-full bg-red-600/10 text-red-500 flex items-center justify-center mx-auto mb-1">
              <Shield className="w-4 h-4" />
            </div>
            <div className="font-display text-lg font-black text-red-500 leading-none">99%</div>
            <div className="text-[10px] text-gray-400 font-medium">Fair Play Rate</div>
          </div>
        </div>

        {/* 2. Middle Recent Winner Box */}
        <div className="lg:col-span-3 bg-[#10131a] p-4 rounded-2xl border border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-white">
              <Trophy className="w-3.5 h-3.5 text-[#e50914]" /> Recent Winners
            </div>
            <a href="#" className="text-[10px] font-bold text-gray-400 hover:text-white no-underline flex items-center gap-1">
              View All <ArrowRight className="w-3 h-3" />
            </a>
          </div>

          <div className="flex items-center justify-between bg-[#0b0d14] p-2.5 rounded-xl border border-white/5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full overflow-hidden border border-red-500 shrink-0">
                <img src="/solo_battle.jpg" alt="RIYAD" className="w-full h-full object-cover" />
              </div>
              <div>
                <span className="text-xs font-bold text-white flex items-center gap-1 leading-none">
                  RIYAD <span className="font-bold text-[8px] text-emerald-400 bg-emerald-950/80 px-1 rounded border border-emerald-500/30">BD</span>
                </span>
                <span className="text-[9px] text-gray-400 block mt-0.5">
                  Solo Tournament • 1st Place
                </span>
              </div>
            </div>
            <div className="text-right">
              <span className="text-[9px] font-bold text-amber-500 flex items-center justify-end gap-0.5">
                <Medal className="w-3 h-3" /> 8 KILLS
              </span>
              <span className="font-display text-sm font-bold text-red-500">৳500</span>
            </div>
          </div>
        </div>

        {/* 3. Right WhatsApp Channel Banner */}
        <div className="lg:col-span-4 bg-gradient-to-r from-[#e50914]/20 via-[#10131a] to-[#10131a] p-4 rounded-2xl border border-red-900/40 relative overflow-hidden flex items-center justify-between">
          
          <div className="relative z-10 max-w-[220px]">
            <span className="text-[10px] text-gray-400 font-bold block uppercase tracking-wider mb-0.5">
              FOLLOW OUR
            </span>
            <h4 className="font-display text-lg font-black text-white uppercase leading-none mb-1">
              WhatsApp Channel
            </h4>
            <p className="text-[10px] text-gray-400 mb-3">
              Get latest updates, slots, results & more!
            </p>
            <a
              href="https://wa.me/8801700000000"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-kong-red px-3.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 no-underline shadow-md group"
            >
              <span>Join Now</span>
              <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
            </a>
          </div>

          {/* WhatsApp Logo Backdrop */}
          <div className="w-14 h-14 rounded-full bg-emerald-600/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 shrink-0">
            <MessageCircle className="w-7 h-7" />
          </div>

        </div>

      </div>
    </div>
  )
}
