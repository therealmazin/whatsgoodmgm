'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import type { DayGroup, MonthCell } from '@/lib/events/grouping'
import { dayParts } from '@/lib/events/format'
import { eventTone } from '@/lib/events/tones'
import { CalendarNav } from '@/components/events/CalendarNav'
import { DayAgenda } from '@/components/events/EventList'
import { ToneLegend } from '@/components/events/ToneLegend'

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
const PILLS_DESKTOP = 3
const PILLS_PHONE = 2

export function MonthView({ weeks, groups, monthLabel, today, prevHref, nextHref, todayHref }: {
  weeks: MonthCell[][]
  groups: DayGroup[]
  monthLabel: string
  today: string
  prevHref: string
  nextHref: string
  todayHref: string
}) {
  const byDay = new Map(groups.map(g => [g.day, g.items]))
  const cells = weeks.flat()
  const inMonth = cells.filter(c => c.inMonth)
  // Open on something: today if it's in this month, else the first busy day.
  const [selected, setSelected] = useState<string | null>(
    inMonth.some(c => c.day === today) ? today : (inMonth.find(c => byDay.has(c.day))?.day ?? null),
  )
  const selectedItems = selected ? (byDay.get(selected) ?? []) : []
  const agendaRef = useRef<HTMLElement>(null)

  // Where the day's list sits under the grid, a tap would otherwise change
  // something off screen and look like it did nothing.
  function pick(day: string) {
    setSelected(day)
    requestAnimationFrame(() => {
      const agenda = agendaRef.current
      if (!agenda || agenda.getBoundingClientRect().top < window.innerHeight * 0.75) return
      const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      agenda.scrollIntoView({ behavior: calm ? 'auto' : 'smooth' })
    })
  }
  const heading = selected ? dayParts(selected, today) : null

  return (
    <div className="mt-6 lg:grid lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
      <div className="min-w-0">
        <CalendarNav title={monthLabel} unit="month" prevHref={prevHref} nextHref={nextHref} todayHref={todayHref} />

        <div className="mt-4 overflow-hidden rounded-xl border border-line">
          <div className="grid grid-cols-7 border-b border-line">
            {WEEKDAYS.map(d => (
              <div key={d} className="py-2 text-center text-xs text-dim md:px-2 md:text-left">{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map(cell => {
              const items = byDay.get(cell.day) ?? []
              const n = items.length
              const isSelected = selected === cell.day
              return (
                <div
                  key={cell.day}
                  className={`relative min-h-22 min-w-0 border-b border-r border-line p-1 transition-colors [&:nth-child(7n)]:border-r-0 [&:nth-last-child(-n+7)]:border-b-0 md:min-h-30 md:p-2 ${
                    isSelected ? 'bg-raised' : 'hover:bg-raised'
                  } ${cell.inMonth ? '' : 'text-muted'}`}
                >
                  {/* Stretches over the cell, so a click anywhere picks the day.
                      Pills sit above it on desktop and open their event. */}
                  <button
                    type="button"
                    onClick={() => pick(cell.day)}
                    aria-pressed={isSelected}
                    aria-label={`${dayParts(cell.day, today).date}, ${n} ${n === 1 ? 'event' : 'events'}`}
                    className={`mx-auto flex h-6 min-w-6 cursor-pointer items-center justify-center rounded-full px-1 text-sm tabular-nums after:absolute after:inset-0 md:mx-0 ${
                      cell.day === today ? 'bg-accent font-medium text-accent-ink' : ''
                    }`}
                  >
                    {Number(cell.day.slice(8, 10))}
                  </button>
                  <div className="mt-1 space-y-0.5 md:space-y-1">
                    {items.slice(0, PILLS_DESKTOP).map(({ e, occursAt }, i) => (
                      <Link
                        key={`${e._id}${occursAt}`}
                        href={`/events/${e.slug}`}
                        title={e.title}
                        className={`pill tone-${eventTone(e.interests)} relative z-10 overflow-hidden whitespace-nowrap px-1 text-[11px] font-medium leading-4 max-md:pointer-events-none md:truncate md:px-1.5 md:text-xs md:leading-5 ${
                          i >= PILLS_PHONE ? 'max-md:hidden' : ''
                        }`}
                      >
                        {e.title}
                      </Link>
                    ))}
                    {n > PILLS_PHONE && (
                      <p className="px-1 text-[11px] leading-4 text-muted tabular-nums md:px-1.5 md:text-xs">
                        <span className="md:hidden">+{n - PILLS_PHONE}</span>
                        {n > PILLS_DESKTOP && <span className="max-md:hidden">{n - PILLS_DESKTOP} more</span>}
                      </p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <ToneLegend />
      </div>

      {heading && (
        <section ref={agendaRef} aria-live="polite" className="mt-8 min-w-0 scroll-mt-4 lg:sticky lg:top-4 lg:mt-0 lg:max-h-[calc(100dvh-2rem)] lg:self-start lg:overflow-y-auto">
          <h2 className="flex items-baseline gap-2 border-b border-line pb-2">
            <span className="display text-2xl">{heading.name}</span>
            <span className="text-sm text-dim">{heading.date}</span>
          </h2>
          {selectedItems.length === 0
            ? <p className="mt-4 text-dim">Nothing listed for this day</p>
            : <DayAgenda items={selectedItems} />}
        </section>
      )}
    </div>
  )
}
