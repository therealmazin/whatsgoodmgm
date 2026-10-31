import type { EventDoc } from '@/lib/sanity/queries'
import { addDays, dayEndIso, dayStartIso, todayKey } from './grouping'

// Homepage list window when no ?days= is set. Kept short so the default page
// stays light; the days filter and the "see more" link reach 30/90.
export const DEFAULT_LIST_DAYS = 7

const DAY_MS = 86_400_000
const MAX_LIST_DAYS = 90

// The When dropdown. The value lives in ?days= so existing ?days=30 links keep working.
export const LIST_RANGES = [
  { value: 'today', label: 'Today' },
  { value: 'tomorrow', label: 'Tomorrow' },
  { value: 'weekend', label: 'This weekend' },
  { value: '7', label: 'Next 7 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '90', label: 'Next 90 days' },
] as const

export type ListWindow = { from: string; to: string; range: string; label: string }

/** Resolve a ?days= value to a time window, in Montgomery time. */
export function listWindow(range: string | undefined, now: Date): ListWindow {
  const today = todayKey(now)
  const from = now.toISOString()
  if (range === 'today') return { from, to: dayEndIso(today), range, label: 'today' }
  if (range === 'tomorrow') {
    const tomorrow = addDays(today, 1)
    return { from: dayStartIso(tomorrow), to: dayEndIso(tomorrow), range, label: 'tomorrow' }
  }
  if (range === 'weekend') {
    const dow = new Date(`${today}T12:00:00Z`).getUTCDay() // 0 sun … 6 sat
    const underway = dow === 0 || dow >= 5
    return {
      from: underway ? from : dayStartIso(addDays(today, 5 - dow)),
      to: dayEndIso(addDays(today, dow === 0 ? 0 : 7 - dow)),
      range,
      label: 'this weekend',
    }
  }
  const days = Math.min(Math.max(Number(range) || DEFAULT_LIST_DAYS, 1), MAX_LIST_DAYS)
  return {
    from,
    to: new Date(now.getTime() + days * DAY_MS).toISOString(),
    range: String(days),
    label: `in the next ${days} days`,
  }
}

export type EventFilterParams = { category?: string; interest?: string; free?: boolean }

// free = free general admission, not "$8, kids free"
const FREE = /^free/i

export function matchesFilters(e: EventDoc, f: EventFilterParams): boolean {
  if (f.category && e.category !== f.category) return false
  if (f.interest && !e.interests?.includes(f.interest)) return false
  if (f.free && !FREE.test((e.priceText ?? '').trim())) return false
  return true
}
