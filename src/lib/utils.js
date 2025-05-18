import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value, currency = 'USD', locale = 'en-US') {
  if (typeof value !== 'number') return value
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)
}

export function getStatusVariant(status) {
  switch (status) {
    case 'available':
      return 'available'
    case 'maintenance':
      return 'maintenance'
    case 'rented':
      return 'rented'
    default:
      return 'outline'
  }
}
