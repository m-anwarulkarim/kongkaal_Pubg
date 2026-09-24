import { Swords, CheckCircle2 } from 'lucide-react'

export default function Leaderboard() {
  const winners = [
    {
      match: 'Erangel Squad Championship #308',
      team: 'VIP ESPORTS',
      captain: 'VIP_SHADOW',
      kills: 18,
      prize: '৳৬,৪৪০',
      status: 'VERIFIED PAYOUT',
    },
    {
      match: 'Solo Erangel Rush #100',
      team: 'SOLO PLAYER',
      captain: 'CYCLONE_99',
      kills: 11,
      prize: '৳১,৭২০',
      status: 'VERIFIED PAYOUT',
    },
    {
      match: 'Duo Miramar Tactical #203',
      team: 'DEADLY DUO',
      captain: 'RAKIB_OP',
      kills: 14,
      prize: '৳৩,৫৬০',
      status: 'VERIFIED PAYOUT',
    },
    {
      match: 'Squad Sanhok War #307',
      team: 'DARK HUNTERS',
      captain: 'HUNTER_X',
      kills: 21,
      prize: '৳৭,৬৮০',
      status: 'VERIFIED PAYOUT',
    },
  ]

  return (
    <section id="leaderboard" className="py-16 bg-[#0c1017] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            HALL OF FAME & PAYOUT HISTORY
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            RECENT <span className="text-amber-400">CHAMPIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            আমাদের আগের ম্যাচগুলোর বিজয়ী এবং বিকাশ/নগদে ক্যাশ প্রাইজ বুঝে নেওয়া প্লেয়ারদের তালিকা।
          </p>
        </div>

        <div className="pubg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-300">
              <thead className="bg-[#0b0e14] font-gaming text-xs uppercase tracking-wider text-amber-400 border-b border-gray-800">
                <tr>
                  <th className="px-6 py-4">MATCH TITLE</th>
                  <th className="px-6 py-4">WINNER / TEAM</th>
                  <th className="px-6 py-4">TOTAL KILLS</th>
                  <th className="px-6 py-4">CASH PRIZE WON</th>
                  <th className="px-6 py-4">PAYMENT STATUS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800 font-medium">
                {winners.map((win, idx) => (
                  <tr key={idx} className="hover:bg-amber-500/5 transition-colors">
                    <td className="px-6 py-4 text-white font-bold">{win.match}</td>
                    <td className="px-6 py-4">
                      <span className="text-amber-400 font-bold block">{win.team}</span>
                      <span className="text-xs text-gray-400">IGN: {win.captain}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 rounded bg-gray-800 text-white font-bold text-xs inline-flex items-center gap-1.5">
                        <Swords className="w-3.5 h-3.5 text-amber-400" />
                        <span>{win.kills} KILLS</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 font-display text-xl font-bold text-green-400">
                      {win.prize}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full bg-green-500/20 border border-green-500/40 text-green-400 text-xs font-bold uppercase inline-flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{win.status}</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  )
}
}
