import { z } from 'zod'
import { toast } from 'sonner'

// 1. Slot Registration Form Schema
export const slotRegistrationSchema = z.object({
  player1Name: z
    .string()
    .min(2, { message: 'PUBG In-Game Name (IGN) কমপক্ষে ২ অক্ষরের হতে হবে!' }),
  player1Uid: z
    .string()
    .min(5, { message: 'PUBG Character ID (UID) কমপক্ষে ৫ সংখ্যার হতে হবে!' })
    .max(12, { message: 'PUBG Character ID (UID) সর্বোচ্চ ১২ সংখ্যার হতে হবে!' })
    .regex(/^[0-9]+$/, { message: 'PUBG Character ID (UID) শুধুমাত্র সংখ্যা হতে হবে!' }),
  whatsappNumber: z
    .string()
    .regex(/^(?:\+88)?01[3-9]\d{8}$/, {
      message: 'দয়া করে সঠিক ১১ ডিজিটের বাংলা ওয়াটসঅ্যাপ নম্বর দিন! (যেমন: 01700000000)',
    }),
  teamName: z.string().optional(),
  player2Name: z.string().optional(),
  player2Uid: z.string().optional(),
  player3Name: z.string().optional(),
  player3Uid: z.string().optional(),
  player4Name: z.string().optional(),
  player4Uid: z.string().optional(),
})

// 2. Transaction ID Payment Schema
export const paymentTrxSchema = z.object({
  trxId: z
    .string()
    .min(6, { message: 'Transaction ID (TrxID) কমপক্ষে ৬ অক্ষরের হতে হবে!' })
    .max(30, { message: 'Transaction ID (TrxID) সর্বোচ্চ ৩০ অক্ষরের হতে হবে!' })
    .regex(/^[A-Za-z0-9_-]+$/, { message: 'TrxID তে শুধুমাত্র ইংরেজি বর্ণ ও সংখ্যা ব্যবহার করুন!' }),
})

// 3. Contact Form Schema
export const contactFormSchema = z.object({
  name: z.string().min(2, { message: 'আপনার নাম কমপক্ষে ২ অক্ষরের হতে হবে!' }),
  phone: z
    .string()
    .regex(/^(?:\+88)?01[3-9]\d{8}$/, { message: 'সঠিক ১১ ডিজিটের মোবাইল/ওয়াটসঅ্যাপ নম্বর দিন!' }),
  subject: z.string().min(3, { message: 'বিষয় কমপক্ষে ৩ অক্ষরের হতে হবে!' }),
  message: z.string().min(5, { message: 'মেসেজ কমপক্ষে ৫ অক্ষরের হতে হবে!' }),
})

// 4. Admin Tournament Match Schema
export const adminMatchSchema = z.object({
  title: z.string().min(3, { message: 'টুর্নামেন্টের শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে!' }),
  entryFee: z.number().min(0, { message: 'এন্ট্রি ফি ০ বা তার বেশি হতে হবে!' }),
  winnerPrize: z.number().min(0, { message: '১ম পুরস্কার ০ বা তার বেশি হতে হবে!' }),
  perKillPrize: z.number().min(0, { message: 'পার-কিল বোনাস ০ বা তার বেশি হতে হবে!' }),
  maxSlots: z.number().min(2, { message: 'সর্বনিম্ন ২ টি স্লট হতে হবে!' }).max(200, { message: 'সর্বোচ্চ ২০০ টি স্লট হতে পারে!' }),
})

// Helper function to validate Zod schema and trigger Sonner toast
export function validateForm<T>(
  schema: z.ZodSchema<T>,
  data: unknown,
  showToast = true
): { success: true; data: T } | { success: false; errors: Record<string, string> } {
  const result = schema.safeParse(data)

  if (result.success) {
    return { success: true, data: result.data }
  }

  const errors: Record<string, string> = {}
  result.error.issues.forEach((issue) => {
    const path = issue.path.join('.') || 'form'
    if (!errors[path]) {
      errors[path] = issue.message
    }
  })

  // Show first error message as sonner toast
  const firstErrorMsg = result.error.issues[0]?.message
  if (showToast && firstErrorMsg && typeof window !== 'undefined') {
    toast.error(firstErrorMsg)
  }

  return { success: false, errors }
}
