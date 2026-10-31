import { describe, expect, it } from 'vitest'
import {
  localDayKey, groupByDay, addDays, weekStart, monthGrid, addMonths,
  isDayKey, isMonthKey, dayEndIso, dayPart, dayStartIso, pickFlyers, type Occurrence,
} from './grouping'

const occ = (id: string, iso: string): Occurrence =>
  ({ e: { _id: id } as Occurrence['e'], occursAt: iso })

describe('localDayKey', () => {
  it('buckets a UTC instant into its Montgomery-local day', () => {
    // 00:30 UTC on Jul 8 is 7:30pm Jul 7 in America/Chicago (CDT)
    expect(localDayKey('2026-07-08T00:30:00Z')).toBe('2026-07-07')
  })
  it('keeps a daytime instant on the same date', () => {
    expect(localDayKey('2026-07-07T18:00:00Z')).toBe('2026-07-07')
  })
})

describe('groupByDay', () => {
  it('groups by local day, days and items sorted ascending', () => {
    const groups = groupByDay([
      occ('b', '2026-09-08T23:00:00Z'),
      occ('a', '2026-09-08T16:00:00Z'),
      occ('c', '2026-09-08T00:30:00Z'), // local Sep 7
    ])
    expect(groups.map(g => g.day)).toEqual(['2026-09-07', '2026-09-08'])
    expect(groups[1].items.map(i => i.e._id)).toEqual(['a', 'b'])
  })
})

describe('day-key arithmetic', () => {
  it('addDays crosses month boundaries', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-09-01', -1)).toBe('2026-08-31')
  })
  it('weekStart returns the sunday containing the day', () => {
    expect(weekStart('2026-09-09')).toBe('2026-09-06') // Wed -> Sun
    expect(weekStart('2026-09-06')).toBe('2026-09-06') // Sun -> itself
  })
  it('addMonths handles year rollover', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
})

describe('monthGrid', () => {
  it('covers september 2026 in sun-sat weeks with inMonth flags', () => {
    const weeks = monthGrid('2026-09')
    expect(weeks.length).toBe(5)
    expect(weeks[0][0]).toEqual({ day: '2026-08-30', inMonth: false })
    expect(weeks[0][2]).toEqual({ day: '2026-09-01', inMonth: true })
    expect(weeks[4][6]).toEqual({ day: '2026-10-03', inMonth: false })
    for (const w of weeks) expect(w.length).toBe(7)
  })
})

describe('param guards', () => {
  it('validates day keys', () => {
    expect(isDayKey('2026-09-07')).toBe(true)
    expect(isDayKey('2026-9-7')).toBe(false)
    expect(isDayKey('garbage')).toBe(false)
  })
  it('validates month keys', () => {
    expect(isMonthKey('2026-09')).toBe(true)
    expect(isMonthKey('2026-13')).toBe(false)
    expect(isMonthKey('2026-09-07')).toBe(false)
  })
})

describe('dayStartIso', () => {
  it('is local midnight in standard and daylight time', () => {
    expect(dayStartIso('2026-12-01')).toBe('2026-12-01T06:00:00.000Z')
    expect(dayStartIso('2026-07-01')).toBe('2026-07-01T05:00:00.000Z')
  })
  it('handles the days the clocks change', () => {
    expect(dayStartIso('2026-11-01')).toBe('2026-11-01T05:00:00.000Z') // still CDT at midnight
    expect(dayStartIso('2026-03-08')).toBe('2026-03-08T06:00:00.000Z') // still CST at midnight
  })
})

describe('dayEndIso', () => {
  it('is the last millisecond of the Montgomery day', () => {
    expect(dayEndIso('2026-12-01')).toBe('2026-12-02T05:59:59.999Z')
    expect(dayEndIso('2026-07-01')).toBe('2026-07-02T04:59:59.999Z')
  })
  it('stops at the right hour on the day the clocks change', () => {
    expect(dayEndIso('2026-11-01')).toBe('2026-11-02T05:59:59.999Z')
  })
})

describe('pickFlyers', () => {
  const occ = (id: string, title: string, imageUrl?: string) =>
    ({ e: { _id: id, title, imageUrl } as Occurrence['e'], occursAt: '2026-11-04T20:00:00Z' })

  it('keeps order, skips flyerless events, and repeats nothing', () => {
    const picks = pickFlyers([
      occ('a', 'Fences', 'https://x/a.jpg'),
      occ('a', 'Fences', 'https://x/a.jpg'), // same recurring event
      occ('b', 'Fences', 'https://x/b.jpg'), // same show, separate doc
      occ('c', 'No flyer'),
      occ('d', 'Bingo', 'https://x/a.jpg'), // same image on a different listing
      occ('e', 'Trivia', 'https://x/e.jpg'),
    ], 6)
    expect(picks.map(p => p.e._id)).toEqual(['a', 'e'])
  })
  it('stops at the limit', () => {
    const many = ['a', 'b', 'c'].map(id => occ(id, id, `https://x/${id}.jpg`))
    expect(pickFlyers(many, 2)).toHaveLength(2)
  })
})

describe('groupByDay with unknown times', () => {
  it('sorts date-only events after the ones with real times', () => {
    const [day] = groupByDay([
      occ('tba', '2026-11-04T06:00:00Z'), // 12:00am Central: no time given
      occ('morning', '2026-11-04T14:00:00Z'),
      occ('night', '2026-11-05T01:00:00Z'),
    ])
    expect(day.items.map(i => i.e._id)).toEqual(['morning', 'night', 'tba'])
  })
})

describe('dayPart', () => {
  it('splits a day at 5pm Montgomery time', () => {
    expect(dayPart('2026-11-04T22:59:00Z')).toBe('day') // 4:59pm CST
    expect(dayPart('2026-11-04T23:00:00Z')).toBe('night') // 5:00pm CST
  })
  it('keeps the small hours with the night before', () => {
    expect(dayPart('2026-11-04T07:30:00Z')).toBe('night') // 1:30am CST
    expect(dayPart('2026-11-04T11:00:00Z')).toBe('day') // 5:00am CST
  })
  it('has no part for an unknown time', () => {
    expect(dayPart('2026-11-04T06:00:00Z')).toBe('tba') // 12:00am CST
  })
})
