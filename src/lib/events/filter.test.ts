import { describe, expect, it } from 'vitest'
import { listWindow, matchesFilters } from './filter'
import type { EventDoc } from '@/lib/sanity/queries'

const ev = (over: Partial<EventDoc>): EventDoc => ({
  _id: 'x', title: 't', slug: 't', startDateTime: '2026-09-10T00:00:00Z',
  category: 'music', ...over,
} as EventDoc)

describe('matchesFilters', () => {
  it('passes everything with no filters', () => {
    expect(matchesFilters(ev({}), {})).toBe(true)
  })
  it('filters by category', () => {
    expect(matchesFilters(ev({ category: 'arts' }), { category: 'music' })).toBe(false)
    expect(matchesFilters(ev({ category: 'music' }), { category: 'music' })).toBe(true)
  })
  it('filters by interest membership', () => {
    expect(matchesFilters(ev({ interests: ['film'] }), { interest: 'film' })).toBe(true)
    expect(matchesFilters(ev({ interests: ['film'] }), { interest: 'kids' })).toBe(false)
    expect(matchesFilters(ev({}), { interest: 'kids' })).toBe(false)
  })
  it('free means the price text STARTS with free', () => {
    expect(matchesFilters(ev({ priceText: 'free' }), { free: true })).toBe(true)
    expect(matchesFilters(ev({ priceText: 'Free entry' }), { free: true })).toBe(true)
    expect(matchesFilters(ev({ priceText: '$8, kids free' }), { free: true })).toBe(false)
    expect(matchesFilters(ev({}), { free: true })).toBe(false)
  })
})

describe('listWindow', () => {
  // 2026-11-04 is a Wednesday, 2 PM Central.
  const wed = new Date('2026-11-04T20:00:00Z')

  it('defaults to the next 7 days from now', () => {
    const w = listWindow(undefined, wed)
    expect(w.range).toBe('7')
    expect(w.from).toBe(wed.toISOString())
    expect(w.to).toBe('2026-11-11T20:00:00.000Z')
    expect(w.label).toBe('in the next 7 days')
  })
  it('today stops at the end of the Central day, not 24h later', () => {
    const w = listWindow('today', wed)
    expect(w.from).toBe(wed.toISOString())
    expect(w.to).toBe('2026-11-05T05:59:59.999Z')
  })
  it('tomorrow is the whole next Central day', () => {
    const w = listWindow('tomorrow', wed)
    expect(w.from).toBe('2026-11-05T06:00:00.000Z')
    expect(w.to).toBe('2026-11-06T05:59:59.999Z')
    expect(w.label).toBe('tomorrow')
  })
  it('weekend midweek runs Fri 00:00 to Sun 23:59 Central', () => {
    const w = listWindow('weekend', wed)
    expect(w.from).toBe('2026-11-06T06:00:00.000Z')
    expect(w.to).toBe('2026-11-09T05:59:59.999Z')
  })
  it('weekend already underway starts from now', () => {
    const sat = new Date('2026-11-07T20:00:00Z')
    const w = listWindow('weekend', sat)
    expect(w.from).toBe(sat.toISOString())
    expect(w.to).toBe('2026-11-09T05:59:59.999Z')
  })
  it('on a sunday the weekend ends tonight', () => {
    const sun = new Date('2026-11-08T20:00:00Z')
    expect(listWindow('weekend', sun).to).toBe('2026-11-09T05:59:59.999Z')
  })
  it('keeps old numeric links working and clamps them to 90', () => {
    expect(listWindow('30', wed).range).toBe('30')
    expect(listWindow('14', wed).label).toBe('in the next 14 days')
    expect(listWindow('9999', wed).to).toBe(new Date(wed.getTime() + 90 * 86_400_000).toISOString())
  })
  it('falls back to the default on junk', () => {
    expect(listWindow('soon', wed).range).toBe('7')
  })
})
