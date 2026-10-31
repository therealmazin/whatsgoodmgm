// What colours an event on the calendar. Interests rather than categories,
// since every event has interests and only a few have a category. Related
// interests share a colour so the calendar stays readable, and the legend
// explains them. Colour values live in globals.css as .tone-*.
export type Tone = 'music' | 'games' | 'food' | 'family' | 'art' | 'outdoors' | 'civic' | 'plain'

// In priority order: an event usually has several interests, and the broad
// ones ("history & civic", "free stuff") shouldn't win over a specific one.
const PRIORITY: [string, Tone][] = [
  ['live-music', 'music'],
  ['dancing', 'music'],
  ['games-and-trivia', 'games'],
  ['food-and-drink', 'food'],
  ['markets', 'food'],
  ['kids', 'family'],
  ['film', 'art'],
  ['art-and-making', 'art'],
  ['fitness-and-outdoors', 'outdoors'],
  ['books-and-talks', 'civic'],
  ['history-and-civic', 'civic'],
]

const BY_INTEREST = new Map(PRIORITY)

export const interestTone = (id: string): Tone => BY_INTEREST.get(id) ?? 'plain'

export function eventTone(interests: string[] | undefined): Tone {
  for (const [id, tone] of PRIORITY) if (interests?.includes(id)) return tone
  return 'plain'
}

export const TONE_LEGEND: { tone: Tone; label: string }[] = [
  { tone: 'music', label: 'Music & dancing' },
  { tone: 'games', label: 'Games & trivia' },
  { tone: 'food', label: 'Food & markets' },
  { tone: 'family', label: 'Kids & family' },
  { tone: 'art', label: 'Art & film' },
  { tone: 'outdoors', label: 'Fitness & outdoors' },
  { tone: 'civic', label: 'Talks & history' },
]
