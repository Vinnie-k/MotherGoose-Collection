// CATEGORIES is the only thing exported from this file.
// Products are stored in the database / product-store and fetched via /api/products.
// MOCK_PRODUCTS has been intentionally removed — all products are admin-managed.

export const CATEGORIES = [
  { slug: 'watches',     label: 'Watches',     icon: '⌚' },
  { slug: 'suits',       label: 'Suits',       icon: '🤵' },
  { slug: 'clothing',    label: 'Clothing',    icon: '👕' },
  { slug: 'shoes',       label: 'Shoes',       icon: '👟' },
  { slug: 'accessories', label: 'Accessories', icon: '💼' },
  { slug: 'bags',        label: 'Bags',        icon: '👜' },
]
