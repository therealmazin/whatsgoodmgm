import type { EventDoc, VenueDoc } from '@/lib/sanity/queries'

export type BrandIconName = 'google' | 'apple' | 'outlook' | 'waze' | 'download'
export type MenuLink = { label: string; href: string; icon: BrandIconName; external: boolean }

const HOUR_MS = 3_600_000

/** One link per maps app. Exact coordinates when we have them, else a search on the name and address. */
export function directionLinks(venue?: Pick<VenueDoc, 'name' | 'address' | 'lat' | 'lng'>): MenuLink[] {
  const hasCoords = venue?.lat != null && venue?.lng != null
  const place = encodeURIComponent([venue?.name, venue?.address].filter(Boolean).join(', '))
  if (!hasCoords && !place) return []
  const at = `${venue?.lat},${venue?.lng}`
  return [
    {
      label: 'Google Maps',
      icon: 'google',
      external: true,
      href: hasCoords
        ? `https://www.google.com/maps/dir/?api=1&destination=${at}`
        : `https://www.google.com/maps/search/?api=1&query=${place}`,
    },
    {
      label: 'Apple Maps',
      icon: 'apple',
      external: true,
      href: `https://maps.apple.com/?daddr=${hasCoords ? at : place}`,
    },
    {
      label: 'Waze',
      icon: 'waze',
      external: true,
      href: hasCoords ? `https://waze.com/ul?ll=${at}&navigate=yes` : `https://waze.com/ul?q=${place}&navigate=yes`,
    },
  ]
}

// Google Calendar wants basic-format UTC: 20260708T190000Z.
function gcalStamp(iso: string): string {
  return new Date(iso).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

/** Add-to-calendar links for one occurrence. `start` is that occurrence, which differs from a recurring event's first date. */
export function calendarLinks(event: EventDoc, start: string, icsHref: string): MenuLink[] {
  const duration = event.endDateTime
    ? Date.parse(event.endDateTime) - Date.parse(event.startDateTime)
    : 2 * HOUR_MS
  const end = new Date(Date.parse(start) + duration).toISOString()
  const location = event.venue?.address ?? event.venue?.name ?? ''

  const google = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${gcalStamp(start)}/${gcalStamp(end)}`,
  })
  if (event.description) google.set('details', event.description)
  if (location) google.set('location', location)

  const outlook = new URLSearchParams({
    path: '/calendar/action/compose',
    rru: 'addevent',
    subject: event.title,
    startdt: start,
    enddt: end,
  })
  if (location) outlook.set('location', location)

  return [
    { label: 'Google Calendar', icon: 'google', external: true, href: `https://calendar.google.com/calendar/render?${google}` },
    { label: 'Apple Calendar', icon: 'apple', external: false, href: icsHref },
    { label: 'Outlook', icon: 'outlook', external: true, href: `https://outlook.live.com/calendar/0/deeplink/compose?${outlook}` },
  ]
}

/** "mpaconline.org", for saying where a listing came from. */
export function sourceHost(url?: string): string | undefined {
  try {
    return url ? new URL(url).hostname.replace(/^www\./, '') : undefined
  } catch {
    return undefined
  }
}
