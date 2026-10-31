import { describe, expect, it } from 'vitest'
import { flyerThumbUrl } from './images'

describe('flyerThumbUrl', () => {
  it('uses the resized copy for a known host', () => {
    expect(flyerThumbUrl('https://img.evbuc.com/a.jpg?w=1'))
      .toBe('/_next/image?url=https%3A%2F%2Fimg.evbuc.com%2Fa.jpg%3Fw%3D1&w=128&q=75')
  })
  it('falls back to the original for an unknown host', () => {
    expect(flyerThumbUrl('https://example.org/a.jpg')).toBe('https://example.org/a.jpg')
  })
  it('stays safe to place inside an html attribute', () => {
    expect(flyerThumbUrl('https://example.org/a"b>.jpg')).not.toMatch(/["<>]/)
  })
})
