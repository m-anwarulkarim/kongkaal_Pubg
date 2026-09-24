import { useState } from 'react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      q: 'কিভাবে স্লট বুক করব এবং পেমেন্ট করব?',
      a: 'ওয়েবসাইটের Match লিস্ট থেকে আপনার পছন্দের ম্যাচ নির্বাচন করে "Pay & Book Slot" বোতামে ক্লিক করুন। তারপর খেলোয়াড়ের വിവര ও বিকাশ/নগদে সেন্ড মানি করার পর প্রাপ্ত Transaction ID (TrxID) ফর্ম টি পূরণ করে সাবমিট করুন।',
    },
    {
      q: 'Room ID এবং Password কিভাবে পাব?',
      a: 'ম্যাচ শুরু হওয়ার ঠিক ১৫ মিনিট আগে আপনার বুকিং এ দেওয়া WhatsApp নাম্বারে সরাসরি রুম আইডি ও পাসওয়ার্ড পাঠানো হবে।',
    },
    {
      q: 'চিকেন ডিনার বা কিল প্রাইজ মানি কখন পাব?',
      a: 'ম্যাচ শেষ হওয়া মাত্রই বিজয়ী বা কিল অর্জনকারী প্লেয়ারের দেওয়া বিকাশ বা নগদ নাম্বারে ৩০ মিনিটের মধ্যে অটোমেটিক প্রাইজ মানি ক্যাশ-আউট বা সেন্ড মানি করে দেওয়া হয়।',
    },
    {
      q: 'যদি রুম ফুল হওয়ার আগে পেমেন্ট করি কিন্তু স্লট না পাই?',
      a: 'রুম ফুল হয়ে গেলে সাথে সাথে আপনার প্রদত্ত পেমেন্ট সম্পূর্ণ টাকা বিকাশ বা নগদে রিফান্ড করে দেওয়া হবে অথবা পরবর্তী ম্যাচের স্লটে যুক্ত করা হবে।',
    },
    {
      q: 'কোনো সাহায্য বা প্রশ্নের জন্য কোথায় যোগাযোগ করব?',
      a: 'আমাদের অফিশিয়াল WhatsApp সাপোর্টে সরাসরি মেসেজ দিতে পারেন। আমাদের এডমিন প্যানেল ২৪/৭ আপনাদের যেকোনো সমস্যার তাৎক্ষণিক সমাধান প্রদান করে।',
    },
  ]

  return (
    <section id="faq" className="py-16 bg-[#080b10] border-b border-amber-500/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            NEED HELP?
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            FREQUENTLY ASKED <span className="text-amber-400">QUESTIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            টুর্নামেন্ট সংক্রান্ত সাধারণ জিজ্ঞাসাগুলোর উত্তর নিচে জেনে নিন।
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx

            return (
              <div key={idx} className="pubg-card overflow-hidden">
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 text-left font-gaming text-lg font-bold text-white flex justify-between items-center gap-4 hover:text-amber-400 transition-colors"
                >
                  <span>❓ {faq.q}</span>
                  <span className="font-display text-2xl text-amber-400">{isOpen ? '−' : '+'}</span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-sm text-gray-300 border-t border-gray-800/80 pt-3 leading-relaxed">
                    {faq.a}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
