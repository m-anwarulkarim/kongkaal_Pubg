import type { StoreProduct } from '@/types/store'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    id: 'uc-60',
    title: 'PUBG Mobile 60 UC Top-Up',
    category: 'UC_TOPUP',
    priceBDT: 115,
    originalPriceBDT: 130,
    image: '/solo_match.jpg',
    rating: 4.9,
    stock: 50,
    inStock: true,
    badge: 'POPULAR',
  },
  {
    id: 'uc-325',
    title: 'PUBG Mobile 325 UC Top-Up Pack',
    category: 'UC_TOPUP',
    priceBDT: 570,
    originalPriceBDT: 620,
    image: '/squad_match.jpg',
    rating: 5.0,
    stock: 35,
    inStock: true,
    badge: 'BEST VALUE',
  },
  {
    id: 'pass-a8',
    title: 'Royale Pass A8 Upgrade Card',
    category: 'ROYALE_PASS',
    priceBDT: 720,
    originalPriceBDT: 800,
    image: '/hero_banner.jpg',
    rating: 4.8,
    stock: 20,
    inStock: true,
    badge: 'NEW SEASON',
  },
  {
    id: 'uc-660',
    title: 'PUBG Mobile 660 UC Mega Pack',
    category: 'UC_TOPUP',
    priceBDT: 1140,
    originalPriceBDT: 1250,
    image: '/solo_match.jpg',
    rating: 5.0,
    stock: 40,
    inStock: true,
    badge: 'HOT',
  },
]

export default function StorePreview() {
  return (
    <section id="store" className="py-16 bg-[#0b0f19] border-b border-amber-500/20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 font-gaming text-xs font-bold uppercase tracking-widest inline-block mb-3">
            OFFICIAL GAMING STORE & TOP-UP
          </span>
          <h2 className="font-display text-4xl sm:text-6xl font-black text-white uppercase tracking-tight">
            PUBG <span className="text-amber-400">UC & ITEMS STORE</span>
          </h2>
          <p className="text-gray-400 text-sm sm:text-base">
            ইনস্ট্যান্ট ইন-গেম ইউসি (UC Top-Up) এবং রয়েল পাস ডিসকাউন্টে কিনুন বিকাশে নগদ ও রকেটে।
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {STORE_PRODUCTS.map((product) => (
            <Card key={product.id} className="pubg-card overflow-hidden flex flex-col justify-between border-amber-500/20 bg-[#0e1420]/90">
              <div className="relative h-44 overflow-hidden">
                <img src={product.image} alt={product.title} className="w-full h-full object-cover hover:scale-105 transition-transform" />
                {product.badge && (
                  <Badge className="absolute top-3 left-3 bg-amber-500 text-black font-extrabold text-[10px]">
                    {product.badge}
                  </Badge>
                )}
              </div>

              <CardContent className="p-4">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider block mb-1">
                  {product.category.replace('_', ' ')}
                </span>
                <h3 className="font-gaming text-lg font-bold text-white mb-2 line-clamp-1">
                  {product.title}
                </h3>
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-display text-2xl font-bold text-white">৳{product.priceBDT}</span>
                  {product.originalPriceBDT && (
                    <span className="text-xs text-gray-500 line-through">৳{product.originalPriceBDT}</span>
                  )}
                </div>
              </CardContent>

              <CardFooter className="p-4 pt-0">
                <Button className="w-full pubg-btn-green py-2.5 rounded-lg text-xs font-extrabold">
                  ⚡ BUY NOW (৳{product.priceBDT})
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>

      </div>
    </section>
  )
}
