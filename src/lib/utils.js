import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { today, getLocalTimeZone } from '@internationalized/date'

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
    case 'cancelled':
      return 'destructive'
    case 'pending':
      return 'maintenance'
    case 'approved':
      return 'available'
    case 'rejected':
      return 'destructive'
    case 'confirmed':
      return 'available'
    case 'for_release':
      return 'maintenance'
    case 'released':
      return 'available'
    case 'pending_return':
      return 'maintenance'
    case 'in_use':
      return 'rented'
    case 'completed':
      return 'available'
    default:
      return 'outline'
  }
}

export function getActiveLabel(items, value) {
  const item = items.find((item) => item.value === value)
  return item?.label || items[0].label
}

export function isDateDisabled(date) {
  const now = today(getLocalTimeZone())
  return date.compare(now) <= 0
}
