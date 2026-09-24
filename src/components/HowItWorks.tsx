import { Target, CreditCard, Lock, Trophy } from 'lucide-react'

export default function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'ম্যাচ সিলেক্ট করুন',
      desc: 'আপনার পছন্দের গেম মোড Solo, Duo বা Squad থেকে যেকোনো একটি আসন্ন ম্যাচ বেছে নিন।',
      icon: Target,
    },
    {
      num: '02',
      title: 'পেমেন্ট ও TrxID জমা দিন',
      desc: 'bKash, Nagad বা Rocket দিয়ে সেন্ড মানি করে Transaction ID দিয়ে স্লট কনফার্ম করুন।',
      icon: CreditCard,
    },
    {
      num: '03',
      title: 'Room ID & Password পাবেন',
      desc: 'ম্যাচ শুরু হওয়ার ঠিক ১৫ মিনিট আগে আপনার নিবন্ধিত WhatsApp নাম্বারে রুম আইডি দেওয়া হবে।',
      icon: Lock,
    },
    {
      num: '04',
      title: 'চিকেন ডিনার ও ক্যাশ প্রাইজ!',
      desc: 'গেম জিতে বা কিল করে প্রতি কিলের বিনিময়ে সাথে সাথে বিকাশ/নগদে প্রাইজ মানি বুঝে নিন।',
      icon: Trophy,
    },
  ]

  return (
    <section id="payment-rules" className="py-16 bg-[#0c1017] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            EASY 4-STEP PROCESS
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            HOW TO <span className="text-amber-400">PLAY & WIN</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            সহজ ৪ টি ধাপে কিভাবে টুর্নামেন্টে অংশ নেবেন এবং প্রাইজ মানি জিতবেন জেনে নিন।
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const IconComponent = step.icon
            return (
              <div key={step.num} className="pubg-card p-6 relative overflow-hidden flex flex-col justify-between">
                <div className="absolute top-2 right-4 font-display text-6xl font-black text-amber-500/10 select-none">
                  {step.num}
                </div>
                <div>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white mb-4 shadow-lg shadow-amber-500/20">
                    <IconComponent className="w-6 h-6" />
                  </div>
                  <h3 className="font-gaming text-xl font-bold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-gray-800 text-[11px] font-bold text-amber-400 uppercase">
                  STEP {step.num} COMPLETE
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
