export default function RulesSection() {
  const rules = [
    {
      title: '🔐 Room ID & Password বণ্টন নিয়ম',
      details: 'ম্যাচ শুরু হওয়ার ঠিক ১৫ মিনিট আগে আপনার নিবন্ধিত WhatsApp নাম্বারে রুম আইডি এবং পাসওয়ার্ড পাঠানো হবে। নির্ধারিত সময়ে গেম রুমে জয়েন করা বাধ্যতামূলক।',
    },
    {
      title: '🚫 অ্যান্টি-চিট ও ফেয়ার প্লে পলিসি',
      details: 'যেকোনো ধরনের হ্যাক, স্ক্রিপ্ট, ফাইল মডিফিকেশন বা টিম-আপ সম্পূর্ণ নিষিদ্ধ। কোনো প্লেয়ারের বিরুদ্ধে প্রমাণ পাওয়া গেলে তাকে সাথে সাথে ব্যান ও ডিসকোয়ালিফাই করা হবে।',
    },
    {
      title: '📱 মোবাইল বনাম এমুলেটর (Emulator Rules)',
      details: 'আমাদের সকল ম্যাচ শুধুমাত্র Mobile Players দের জন্য নির্ধারিত (যদি না বিশেষ কোনো Emulator Match ডিক্লেয়ার করা হয়)। এমুলেটর ধরা পড়লে কোনো রিফান্ড দেওয়া হবে না।',
    },
    {
      title: '📸 উইনার স্ক্রিনশট ও প্রাইজ ক্লেইম',
      details: 'ম্যাচে চিকেন ডিনার বা সর্বোচ্চ কিলারদের ম্যাচের শেষের রেজাল্ট পেজের একটি স্ক্রিনশট নিতে হবে এবং আমাদের এডমিন কে WhatsApp এ পাঠাতে হবে। ৩০ মিনিটের মধ্যে পেমেন্ট সম্পন্ন হবে।',
    },
  ]

  return (
    <section id="rules" className="py-16 bg-[#080b10] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            TOURNAMENT CODE OF CONDUCT
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            RULES & <span className="text-amber-400">REGULATIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            সুষ্ঠু ও নিরপেক্ষ প্রতিযোগিতার জন্য সকল নিয়ম কানুন কঠোরভাবে অনুসরণ করা হয়।
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {rules.map((rule, idx) => (
            <div key={idx} className="pubg-card p-6 border-l-4 border-l-amber-500">
              <h3 className="font-gaming text-xl font-bold text-white mb-2">{rule.title}</h3>
              <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">{rule.details}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
