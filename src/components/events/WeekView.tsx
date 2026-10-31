import Link from 'next/link'
import type { DayGroup } from '@/lib/events/grouping'
import { addDays, todayKey, weekStart } from '@/lib/events/grouping'
import { dayParts, formatDayShort, formatEventTime } from '@/lib/events/format'
import { eventTone } from '@/lib/events/tones'
import { CalendarNav } from '@/components/events/CalendarNav'
import { ToneLegend } from '@/components/events/ToneLegend'

const weekdayFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', weekday: 'short' })

export function WeekView({ anchor, groups, prevHref, nextHref, todayHref }: {
  anchor: string // sunday day-key of the shown week
  groups: DayGroup[]
  prevHref: string
  nextHref: string
  todayHref: string
}) {
  const byDay = new Map(groups.map(g => [g.day, g.items]))
  const today = todayKey()
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart(anchor), i))

  return (
    <div className="mt-6">
      <CalendarNav
        title={`${formatDayShort(days[0])} – ${formatDayShort(days[6])}`}
        unit="week"
        prevHref={prevHref}
        nextHref={nextHref}
        todayHref={todayHref}
      />
      <div className="mt-4 md:grid md:grid-cols-7 md:divide-x md:divide-line md:overflow-hidden md:rounded-xl md:border md:border-line">
        {days.map(day => {
          const items = byDay.get(day) ?? []
          const isToday = day === today
          return (
            // A phone stacks the week, where a run of empty days is just scrolling.
            <section key={day} className={`min-w-0 ${items.length === 0 ? 'max-md:hidden' : ''}`}>
              <h2 className="flex items-baseline gap-2 border-b border-line py-2 md:block md:px-2">
                <span className="text-sm text-dim">{weekdayFmt.format(new Date(`${day}T12:00:00Z`))}</span>
                <span className={`font-medium tabular-nums md:mt-1 md:block ${isToday ? 'text-accent' : ''}`}>
                  {dayParts(day, today).date}
                </span>
              </h2>
              <ul className="space-y-1 py-2 md:p-1">
                {items.map(({ e, occursAt }) => (
                  <li key={`${e._id}${occursAt}`}>
                    <Link href={`/events/${e.slug}`} className={`pill tone-${eventTone(e.interests)} rounded-md px-2 py-1.5`}>
                      <span className="block text-xs leading-4 tabular-nums">{formatEventTime(occursAt)}</span>
                      <span className="mt-0.5 block text-sm font-medium leading-5 md:line-clamp-3 md:text-[13px] md:leading-4">{e.title}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )
        })}
      </div>
      <ToneLegend />
    </div>
  )
}
