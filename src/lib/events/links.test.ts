import { describe, expect, it } from 'vitest'
import { calendarLinks, directionLinks, sourceHost } from './links'
import type { EventDoc } from '@/lib/sanity/queries'

const ev = (over: Partial<EventDoc> = {}): EventDoc => ({
  _id: 'x', title: 'Jazz on the River', slug: 'jazz', category: 'music',
  startDateTime: '2026-11-04T00:00:00Z', ...over,
} as EventDoc)

describe('directionLinks', () => {
  it('offers Google, Apple and Waze to exact coordinates', () => {
    const [google, apple, waze] = directionLinks({ name: 'Capri', lat: 32.3, lng: -86.3 })
    expect(google.href).toBe('https://www.google.com/maps/dir/?api=1&destination=32.3,-86.3')
    expect(apple.href).toBe('https://maps.apple.com/?daddr=32.3,-86.3')
    expect(waze.href).toBe('https://waze.com/ul?ll=32.3,-86.3&navigate=yes')
  })
  it('falls back to searching the name and address', () => {
    const [google, apple, waze] = directionLinks({ name: 'Capri', address: '1045 E Fairview' })
    expect(google.href).toContain('query=Capri%2C%201045%20E%20Fairview')
    expect(apple.href).toContain('daddr=Capri%2C%201045%20E%20Fairview')
    expect(waze.href).toContain('q=Capri%2C%201045%20E%20Fairview')
  })
  it('has nothing to offer with no place at all', () => {
    expect(directionLinks(undefined)).toEqual([])
    expect(directionLinks({ name: '' })).toEqual([])
  })
})

describe('calendarLinks', () => {
  const start = '2026-11-11T00:00:00.000Z'
  const links = (e: EventDoc) => calendarLinks(e, start, '/api/calendar.ics?event=jazz')

  it('books Google for the occurrence passed in, not the first date', () => {
    const google = new URL(links(ev()).find(l => l.label === 'Google Calendar')!.href)
    expect(google.searchParams.get('dates')).toBe('20261111T000000Z/20261111T020000Z')
  })
  it('keeps the real length when an end time exists', () => {
    const e = ev({ endDateTime: '2026-11-04T03:30:00Z' })
    const google = new URL(links(e).find(l => l.label === 'Google Calendar')!.href)
    expect(google.searchParams.get('dates')).toBe('20261111T000000Z/20261111T033000Z')
  })
  it('points Apple at the ics file and Outlook at its compose page', () => {
    const all = links(ev())
    expect(all.find(l => l.label === 'Apple Calendar')!.href).toBe('/api/calendar.ics?event=jazz')
    const outlook = new URL(all.find(l => l.label === 'Outlook')!.href)
    expect(outlook.hostname).toBe('outlook.live.com')
    expect(outlook.searchParams.get('subject')).toBe('Jazz on the River')
    expect(outlook.searchParams.get('startdt')).toBe(start)
  })
})

describe('sourceHost', () => {
  it('shortens a url to the site name', () => {
    expect(sourceHost('https://www.mpaconline.org/events/x')).toBe('mpaconline.org')
  })
  it('never throws on a bad url', () => {
    expect(sourceHost('not a url')).toBeUndefined()
    expect(sourceHost(undefined)).toBeUndefined()
  })
})
