#!/usr/bin/env node
/**
 * scripts/seed.js
 * 
 * Populates your Supabase database with the mock product data.
 * 
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=your_url NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key node scripts/seed.js
 *   
 * Or with .env.local:
 *   node -r dotenv/config scripts/seed.js dotenv_config_path=.env.local
 */

const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌  Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

const PRODUCTS = [
  {
    name: 'Chrono Elite Automatic',
    description: 'Swiss-made automatic movement with sapphire crystal glass. Water resistant to 100m. Elegant dress watch with a classic design for the modern gentleman.',
    price: 1299, original_price: 1599,
    category: 'watches', subcategory: 'automatic',
    images: ['https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80'],
    stock: 15, rating: 4.8, review_count: 124,
    tags: ['luxury', 'automatic', 'swiss'], featured: true, new_arrival: false,
  },
  {
    name: 'Sport Diver Pro 300',
    description: 'Professional diving watch with 300m water resistance. Unidirectional bezel, luminescent hands, and robust stainless steel bracelet.',
    price: 849, original_price: null,
    category: 'watches', subcategory: 'sport',
    images: ['https://images.unsplash.com/photo-1614164185128-e4ec99c436d7?w=800&q=80'],
    stock: 22, rating: 4.6, review_count: 89,
    tags: ['sport', 'diving', 'durable'], featured: true, new_arrival: true,
  },
  {
    name: 'Minimalist Quartz Slim',
    description: 'Ultra-thin quartz watch with a clean, minimalist design. Perfect for everyday elegance. Japanese movement, genuine leather strap.',
    price: 299, original_price: 399,
    category: 'watches', subcategory: 'quartz',
    images: ['https://images.unsplash.com/photo-1508057198894-247b23fe5ade?w=800&q=80'],
    stock: 40, rating: 4.5, review_count: 203,
    tags: ['minimalist', 'quartz', 'everyday'], featured: false, new_arrival: false,
  },
  {
    name: 'Midnight Navy Slim Fit Suit',
    description: 'Tailored from 100% Italian wool, this slim-fit suit exudes sophistication. Notch lapels, two-button closure, and a sleek silhouette for boardroom to ballroom.',
    price: 899, original_price: 1199,
    category: 'suits', subcategory: 'slim-fit',
    images: ['https://images.unsplash.com/photo-1593030761757-71fae45fa0e7?w=800&q=80'],
    stock: 18, rating: 4.9, review_count: 67,
    tags: ['italian wool', 'slim fit', 'formal'], featured: true, new_arrival: false,
  },
  {
    name: 'Charcoal Classic Fit Suit',
    description: 'The timeless charcoal suit in a classic fit. Crafted from a wool blend for comfort and durability. Includes matching trousers with a half-lined jacket.',
    price: 649, original_price: null,
    category: 'suits', subcategory: 'classic-fit',
    images: ['https://images.unsplash.com/photo-1617137968427-85924c800a22?w=800&q=80'],
    stock: 25, rating: 4.7, review_count: 112,
    tags: ['classic', 'formal', 'timeless'], featured: false, new_arrival: false,
  },
  {
    name: 'Ivory Linen Summer Suit',
    description: 'Beat the heat without sacrificing style. This breathable linen suit is perfect for summer weddings and outdoor events.',
    price: 549, original_price: 699,
    category: 'suits', subcategory: 'linen',
    images: ['https://images.unsplash.com/photo-1610652492500-ded49ceeb378?w=800&q=80'],
    stock: 12, rating: 4.4, review_count: 45,
    tags: ['linen', 'summer', 'wedding'], featured: false, new_arrival: true,
  },
  {
    name: 'Premium Cotton Oxford Shirt',
    description: 'Woven from 100% Egyptian cotton, this Oxford shirt offers unparalleled softness and breathability. Classic button-down collar, slim fit.',
    price: 129, original_price: 169,
    category: 'clothing', subcategory: 'shirts',
    images: ['https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800&q=80'],
    stock: 60, rating: 4.6, review_count: 445,
    tags: ['cotton', 'shirt', 'casual', 'formal'], featured: false, new_arrival: false,
  },
  {
    name: 'Merino Wool Crew Sweater',
    description: 'Luxuriously soft merino wool sweater. Perfect layering piece for cooler weather. Ribbed cuffs and hem for a refined finish.',
    price: 219, original_price: null,
    category: 'clothing', subcategory: 'knitwear',
    images: ['https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&q=80'],
    stock: 35, rating: 4.8, review_count: 189,
    tags: ['merino', 'wool', 'knitwear', 'winter'], featured: true, new_arrival: false,
  },
  {
    name: 'Tailored Chino Trousers',
    description: 'Smart-casual chinos in a tailored fit. Stretch cotton blend for all-day comfort. Versatile enough for office and weekend.',
    price: 149, original_price: 189,
    category: 'clothing', subcategory: 'trousers',
    images: ['https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&q=80'],
    stock: 45, rating: 4.5, review_count: 267,
    tags: ['chinos', 'trousers', 'smart casual'], featured: false, new_arrival: true,
  },
  {
    name: 'Classic White Tee',
    description: 'The perfect white t-shirt. Heavyweight 220gsm cotton, pre-shrunk, with a structured crew neck that holds its shape wash after wash.',
    price: 59, original_price: null,
    category: 'clothing', subcategory: 'tshirts',
    images: ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=800&q=80'],
    stock: 100, rating: 4.7, review_count: 823,
    tags: ['basic', 'cotton', 'everyday'], featured: false, new_arrival: false,
  },
  {
    name: 'Oxford Brogue Leather Shoes',
    description: 'Hand-crafted full-grain leather Oxford shoes with intricate brogue detailing. Leather sole with rubber heel for durability. Goodyear welted construction.',
    price: 449, original_price: 599,
    category: 'shoes', subcategory: 'formal',
    images: ['https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=800&q=80'],
    stock: 20, rating: 4.9, review_count: 156,
    tags: ['leather', 'oxford', 'formal', 'handcrafted'], featured: true, new_arrival: false,
  },
  {
    name: 'Premium Leather Chelsea Boots',
    description: 'Sleek Chelsea boots in premium calfskin leather. Elastic side panels for easy wear. Stacked leather heel with rubber outsole.',
    price: 389, original_price: null,
    category: 'shoes', subcategory: 'boots',
    images: ['https://images.unsplash.com/photo-1638247025967-b4e38f787b76?w=800&q=80'],
    stock: 28, rating: 4.7, review_count: 94,
    tags: ['chelsea', 'boots', 'leather'], featured: false, new_arrival: true,
  },
  {
    name: 'Luxury Suede Loafers',
    description: 'Supple suede penny loafers with a cushioned insole for all-day comfort. A wardrobe staple that bridges the gap between casual and smart.',
    price: 299, original_price: 379,
    category: 'shoes', subcategory: 'loafers',
    images: ['https://images.unsplash.com/photo-1449505278894-297fdb3edbc1?w=800&q=80'],
    stock: 32, rating: 4.6, review_count: 211,
    tags: ['suede', 'loafers', 'smart casual'], featured: false, new_arrival: false,
  },
  {
    name: 'Italian Silk Tie Collection',
    description: 'Hand-finished silk ties from Como, Italy. Classic repp stripe and geometric patterns. Available in 12 colorways.',
    price: 99, original_price: 129,
    category: 'accessories', subcategory: 'ties',
    images: ['https://images.unsplash.com/photo-1589756823695-278bc923f962?w=800&q=80'],
    stock: 75, rating: 4.5, review_count: 334,
    tags: ['silk', 'tie', 'italian', 'formal'], featured: false, new_arrival: false,
  },
  {
    name: 'Cashmere Pocket Square',
    description: 'Pure cashmere pocket squares with hand-rolled edges. Adds the perfect finishing touch to any suit or blazer. Set of 3.',
    price: 79, original_price: null,
    category: 'accessories', subcategory: 'pocket-squares',
    images: ['https://images.unsplash.com/photo-1617952739439-c0b89b4a3e78?w=800&q=80'],
    stock: 50, rating: 4.8, review_count: 67,
    tags: ['cashmere', 'pocket square', 'luxury'], featured: false, new_arrival: true,
  },
  {
    name: 'Executive Leather Briefcase',
    description: 'Full-grain vegetable-tanned leather briefcase. Fits 15" laptop. Multiple compartments for organisation. Brass hardware throughout.',
    price: 599, original_price: 799,
    category: 'bags', subcategory: 'briefcases',
    images: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80'],
    stock: 14, rating: 4.9, review_count: 88,
    tags: ['leather', 'briefcase', 'executive', 'laptop'], featured: true, new_arrival: false,
  },
  {
    name: 'Weekend Duffle Bag',
    description: 'Spacious waxed canvas and leather duffle bag for overnight adventures. Detachable shoulder strap, interior shoe compartment.',
    price: 349, original_price: null,
    category: 'bags', subcategory: 'duffle',
    images: ['https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'],
    stock: 19, rating: 4.7, review_count: 143,
    tags: ['canvas', 'duffle', 'weekend', 'travel'], featured: false, new_arrival: true,
  },
  {
    name: 'Slim Leather Card Wallet',
    description: 'Minimalist 6-card capacity wallet in hand-stitched Italian leather. RFID blocking technology. Built to last a lifetime.',
    price: 89, original_price: 119,
    category: 'accessories', subcategory: 'wallets',
    images: ['https://images.unsplash.com/photo-1627123424574-724758594e93?w=800&q=80'],
    stock: 80, rating: 4.6, review_count: 512,
    tags: ['wallet', 'leather', 'slim', 'rfid'], featured: false, new_arrival: false,
  },
]

async function seed() {
  console.log(`\n🌱 Seeding ${PRODUCTS.length} products to Supabase...\n`)

  // Clear existing products (optional — comment out to keep existing data)
  const { error: deleteError } = await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  if (deleteError) {
    console.warn('⚠️  Could not clear products (may not exist yet):', deleteError.message)
  }

  let success = 0
  let failed = 0

  for (const product of PRODUCTS) {
    const { error } = await supabase.from('products').insert(product)
    if (error) {
      console.error(`  ❌ Failed: ${product.name} — ${error.message}`)
      failed++
    } else {
      console.log(`  ✅ ${product.name}`)
      success++
    }
  }

  console.log(`\n✨ Done! ${success} seeded, ${failed} failed.\n`)
}

seed().catch(console.error)
