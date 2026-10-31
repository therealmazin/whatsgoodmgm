import { addDays, hasKnownTime, localDayKey } from './grouping'

const TZ = 'America/Chicago'

export function formatEventDateTime(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit',
  }).format(new Date(iso))
}

export function formatEventDate(iso: string): string {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ, weekday: 'long', month: 'long', day: 'numeric',
  }).format(new Date(iso))
}

const timeFmt = new Intl.DateTimeFormat('en-US', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })

const clock = (iso: string) =>
  timeFmt.format(new Date(iso)).toLowerCase().replace(' ', '').replace(':00', '')

export function formatEventTime(iso: string): string {
  return hasKnownTime(iso) ? clock(iso) : 'TBA'
}

// An end this soon after the start is a late night, not a run of days.
const OVERNIGHT_MS = 16 * 3_600_000

/** Full date and time lines for an event page. */
export function formatWhen(startIso: string, endIso?: string): { date: string; time: string } {
  const start = formatEventDate(startIso)
  const end = endIso && Date.parse(endIso) > Date.parse(startIso) ? endIso : undefined
  const spansDays = !!end && localDayKey(end) !== localDayKey(startIso)
  const isRun = spansDays && Date.parse(end) - Date.parse(startIso) >= OVERNIGHT_MS
  const date = isRun ? `${start} – ${formatEventDate(end)}` : start

  if (!hasKnownTime(startIso)) return { date, time: 'Time TBA' }
  if (!end) return { date, time: clock(startIso) }
  // A night that ends at midnight really does; only a run's midnight means "no time given".
  const showEnd = hasKnownTime(end) || (spansDays && !isRun)
  return { date, time: showEnd ? `${clock(startIso)} – ${clock(end)}` : clock(startIso) }
}

// Day keys are date-only (YYYY-MM-DD); anchor to noon UTC so the calendar
// date can't shift across timezones.
const noon = (dayKey: string) => new Date(`${dayKey}T12:00:00Z`)
const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'long' })
const shortDateFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'short', day: 'numeric' })

export const formatDayShort = (dayKey: string) => shortDateFmt.format(noon(dayKey))

/** The two halves of a day heading: "Today" / "Oct 31", "Friday" / "Nov 6". */
export function dayParts(dayKey: string, today: string): { name: string; date: string } {
  const name =
    dayKey === today ? 'Today'
    : dayKey === addDays(today, 1) ? 'Tomorrow'
    : weekdayFmt.format(noon(dayKey))
  return { name, date: formatDayShort(dayKey) }
}
