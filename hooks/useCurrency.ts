'use client'

import { useState, useEffect } from 'react'

type Currency = 'USD' | 'KES' | 'GBP' | 'EUR'

const RATES: Record<Currency, number> = {
  USD: 1,
  KES: 130,
  GBP: 0.79,
  EUR: 0.92,
}

const SYMBOLS: Record<Currency, string> = {
  USD: '$',
  KES: 'KSh',
  GBP: '£',
  EUR: '€',
}

export function useCurrency() {
  const [currency, setCurrency] = useState<Currency>('USD')

  useEffect(() => {
    const saved = localStorage.getItem('mothergoose-currency') as Currency | null
    if (saved && RATES[saved]) setCurrency(saved)
  }, [])

  const changeCurrency = (c: Currency) => {
    setCurrency(c)
    localStorage.setItem('mothergoose-currency', c)
  }

  const format = (usdAmount: number) => {
    const converted = usdAmount * RATES[currency]
    return `${SYMBOLS[currency]}${converted.toLocaleString(undefined, {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`
  }

  return { currency, changeCurrency, format, currencies: Object.keys(RATES) as Currency[] }
}
