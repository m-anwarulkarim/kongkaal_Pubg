import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '@/components/ui/accordion'
import { Lock, ShieldAlert, Smartphone, Camera } from 'lucide-react'

export default function RulesAccordion() {
  const rules = [
    {
      id: 'item-1',
      icon: Lock,
      title: 'Room ID & Password বণ্টন নিয়ম',
      details: 'ম্যাচ শুরু হওয়ার ঠিক ১৫ মিনিট আগে আপনার নিবন্ধিত WhatsApp নাম্বারে রুম আইডি এবং পাসওয়ার্ড পাঠানো হবে। নির্ধারিত সময়ে গেম রুমে জয়েন করা বাধ্যতামূলক।',
    },
    {
      id: 'item-2',
      icon: ShieldAlert,
      title: 'অ্যান্টি-চিট ও ফেয়ার প্লে পলিসি',
      details: 'যেকোনো ধরনের হ্যাক, স্ক্রিপ্ট, ফাইল মডিফিকেশন বা টিম-আপ সম্পূর্ণ নিষিদ্ধ। কোনো প্লেয়ারের বিরুদ্ধে প্রমাণ পাওয়া গেলে তাকে সাথে সাথে ব্যান ও ডিসকোয়ালিফাই করা হবে।',
    },
    {
      id: 'item-3',
      icon: Smartphone,
      title: 'মোবাইল বনাম এমুলেটর (Emulator Rules)',
      details: 'আমাদের সকল ম্যাচ শুধুমাত্র Mobile Players দের জন্য নির্ধারিত (যদি না বিশেষ কোনো Emulator Match ডিক্লেয়ার করা হয়)। এমুলেটর ধরা পড়লে কোনো রিফান্ড দেওয়া হবে না।',
    },
    {
      id: 'item-4',
      icon: Camera,
      title: 'উইনার স্ক্রিনশট ও প্রাইজ ক্লেইম',
      details: 'ম্যাচে চিকেন ডিনার বা সর্বোচ্চ কিলারদেরMatches রেজাল্ট পেজের স্ক্রিনশট নিতে হবে এবং আমাদের এডমিন কে WhatsApp এ পাঠাতে হবে। ৩০ মিনিটের মধ্যে পেমেন্ট সম্পন্ন হবে।',
    },
  ]

  return (
    <section id="rules" className="py-16 bg-[#080b10] border-b border-amber-500/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            TOURNAMENT CODE OF CONDUCT
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            RULES & <span className="text-amber-400">REGULATIONS</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            সুষ্ঠু ও নিরপেক্ষ প্রতিযোগিতার জন্য সকল নিয়ম কানুন অত্যন্ত কঠোরভাবে অনুসরণ করা হয়।
          </p>
        </div>

        {/* Shadcn Accordion */}
        <Accordion type="single" collapsible defaultValue="item-1" className="space-y-4">
          {rules.map((rule) => {
            const IconComponent = rule.icon
            return (
              <AccordionItem key={rule.id} value={rule.id} className="pubg-card border border-amber-500/20 px-6 rounded-xl overflow-hidden">
                <AccordionTrigger className="font-gaming text-lg font-bold text-white hover:text-amber-400 py-4 no-underline flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5 text-amber-400 shrink-0" />
                    <span>{rule.title}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-gray-300 pb-4 leading-relaxed border-t border-gray-800/80 pt-3">
                  {rule.details}
                </AccordionContent>
              </AccordionItem>
            )
          })}
        </Accordion>
      </div>
    </section>
  )
}
