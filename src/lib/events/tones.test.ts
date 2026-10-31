import { describe, expect, it } from 'vitest'
import { eventTone, interestTone, TONE_LEGEND } from './tones'
import { INTERESTS } from './interests'

describe('eventTone', () => {
  it('colours an event by what it is', () => {
    expect(eventTone(['live-music'])).toBe('music')
    expect(eventTone(['kids'])).toBe('family')
  })
  it('lets the specific tag beat the catch-all one', () => {
    expect(eventTone(['history-and-civic', 'live-music'])).toBe('music')
    expect(eventTone(['free-stuff', 'kids'])).toBe('family')
  })
  it('is neutral when nothing says what it is', () => {
    expect(eventTone(undefined)).toBe('plain')
    expect(eventTone([])).toBe('plain')
    expect(eventTone(['free-stuff'])).toBe('plain')
  })
})

describe('tone coverage', () => {
  it('gives every interest except free-stuff a colour', () => {
    for (const { id } of INTERESTS) {
      if (id === 'free-stuff') expect(interestTone(id)).toBe('plain')
      else expect(interestTone(id)).not.toBe('plain')
    }
  })
  it('lists every colour in the legend once', () => {
    const tones = TONE_LEGEND.map(l => l.tone)
    expect(new Set(tones).size).toBe(tones.length)
    expect(tones).not.toContain('plain')
  })
})
