import Link from 'next/link'
import type { DayGroup, DayPart, Occurrence } from '@/lib/events/grouping'
import { dayPart, todayKey } from '@/lib/events/grouping'
import { dayParts } from '@/lib/events/format'
import { EventRow } from '@/components/events/EventRow'
import { CoffeeIcon, MartiniIcon } from '@/components/icons'

// The logo is a coffee and a martini, so a day reads the same way.
const PARTS: { key: DayPart; label: string; icon?: React.ReactNode }[] = [
  { key: 'day', label: 'Daytime', icon: <CoffeeIcon width={16} height={16} /> },
  { key: 'night', label: 'After dark', icon: <MartiniIcon width={16} height={16} /> },
  { key: 'tba', label: 'Time TBA' },
]

/** A day's rows under its coffee and martini headings. */
export function DayAgenda({ items, wide }: { items: Occurrence[]; wide?: boolean }) {
  return PARTS.map(({ key, label, icon }) => {
    const part = items.filter(i => dayPart(i.occursAt) === key)
    if (part.length === 0) return null
    return (
      <div key={key} className="mt-4 first:mt-2">
        <h3 className="flex items-center gap-2 text-sm text-muted">{icon}{label}</h3>
        <div className={`mt-1 ${wide ? 'lg:grid lg:grid-cols-2 lg:gap-x-8' : ''}`}>
          {part.map(({ e, occursAt }) => (
            <EventRow key={`${e._id}${occursAt}`} event={e} occursAt={occursAt} />
          ))}
        </div>
      </div>
    )
  })
}

export function EventList({ groups }: { groups: DayGroup[] }) {
  const today = todayKey()
  if (groups.length === 0) {
    return (
      <div className="py-12">
        <p className="display text-2xl">Nothing matches that</p>
        <p className="mt-2 text-dim">
          Try a longer date range or fewer filters, or <Link href="/" className="link text-ink">start over</Link>.
        </p>
      </div>
    )
  }
  return (
    <div className="space-y-8">
      {groups.map(g => {
        const { name, date } = dayParts(g.day, today)
        return (
          <section key={g.day}>
            <h2 className="day-head sticky top-0 z-10 flex items-baseline gap-2 border-b border-line py-2">
              <span className="display text-2xl">{name}</span>
              <span className="text-sm text-dim">{date}</span>
              <span className="ml-auto text-sm text-muted tabular-nums">
                {g.items.length} {g.items.length === 1 ? 'event' : 'events'}
              </span>
            </h2>
            <DayAgenda items={g.items} wide />
          </section>
        )
      })}
    </div>
  )
}
