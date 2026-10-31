import { describe, expect, it } from 'vitest'
import { dayParts, formatEventTime, formatWhen } from './format'
import { hasKnownTime } from './grouping'

describe('formatEventTime', () => {
  it('drops :00 and keeps real minutes', () => {
    expect(formatEventTime('2026-11-04T01:00:00Z')).toBe('7pm') // Nov 3 7pm CST
    expect(formatEventTime('2026-11-04T01:30:00Z')).toBe('7:30pm')
  })
  it('treats local midnight as a missing time, not a midnight show', () => {
    expect(hasKnownTime('2026-11-04T06:00:00Z')).toBe(false) // 12:00am CST
    expect(hasKnownTime('2026-11-04T06:30:00Z')).toBe(true)
    expect(formatEventTime('2026-11-04T06:00:00Z')).toBe('TBA')
  })
})

describe('formatWhen', () => {
  it('collapses a same-day range', () => {
    expect(formatWhen('2026-11-04T00:00:00Z', '2026-11-04T04:00:00Z')).toEqual({
      date: 'Tuesday, November 3', time: '6pm – 10pm',
    })
  })
  it('keeps a night out on one date with both times', () => {
    // 10pm Tue to 2am Wed Central
    expect(formatWhen('2026-11-04T04:00:00Z', '2026-11-04T08:00:00Z')).toEqual({
      date: 'Tuesday, November 3', time: '10pm – 2am',
    })
  })
  it('shows a real midnight finish', () => {
    expect(formatWhen('2026-11-04T01:00:00Z', '2026-11-04T06:00:00Z')).toEqual({
      date: 'Tuesday, November 3', time: '7pm – 12am',
    })
  })
  it('names both days for a multi-day run', () => {
    expect(formatWhen('2026-11-04T00:00:00Z', '2026-11-06T04:00:00Z')).toEqual({
      date: 'Tuesday, November 3 – Thursday, November 5', time: '6pm – 10pm',
    })
  })
  it('keeps the end date of a run with no start time', () => {
    expect(formatWhen('2026-11-04T06:00:00Z', '2026-11-08T05:59:00Z')).toEqual({
      date: 'Wednesday, November 4 – Saturday, November 7', time: 'Time TBA',
    })
  })
  it('ignores an end that equals the start', () => {
    expect(formatWhen('2026-11-04T00:00:00Z', '2026-11-04T00:00:00Z').time).toBe('6pm')
  })
  it('has no time line when the time is unknown', () => {
    expect(formatWhen('2026-11-04T06:00:00Z').time).toBe('Time TBA')
  })
})

describe('dayParts', () => {
  it('names today and tomorrow, otherwise the weekday', () => {
    expect(dayParts('2026-11-04', '2026-11-04')).toEqual({ name: 'Today', date: 'Nov 4' })
    expect(dayParts('2026-11-05', '2026-11-04')).toEqual({ name: 'Tomorrow', date: 'Nov 5' })
    expect(dayParts('2026-11-06', '2026-11-04')).toEqual({ name: 'Friday', date: 'Nov 6' })
  })
})
