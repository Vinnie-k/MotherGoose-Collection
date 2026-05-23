/**
 * Format a price in Kenyan Shillings
 * All prices in the database are stored in KES
 */
export function formatPrice(amount: number): string {
  return `Ksh ${Math.round(amount).toLocaleString('en-KE')}`
}
