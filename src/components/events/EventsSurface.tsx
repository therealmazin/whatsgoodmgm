import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import { UPCOMING_OR_RECURRING, EVENTS_SEARCH, type EventDoc } from '@/lib/sanity/queries'
import { INTERESTS } from '@/lib/events/interests'
import { expandOccurrences } from '@/lib/events/occurrences'
import { listWindow, matchesFilters } from '@/lib/events/filter'
import {
  addDays, addMonths, dayEndIso, dayStartIso, groupByDay, isDayKey, isMonthKey, monthGrid, pickFlyers, todayKey, weekStart,
  type Occurrence,
} from '@/lib/events/grouping'
import { SITE_URL } from '@/lib/siteUrl'
import EventFilters from '@/components/EventFilters'
import { EventList } from '@/components/events/EventList'
import { FlyerWall } from '@/components/events/FlyerWall'
import { MonthView } from '@/components/events/MonthView'
import { WeekView } from '@/components/events/WeekView'
import { ViewTabs, type EventsView } from '@/components/events/ViewTabs'
import { SubscribeMenu } from '@/components/events/SubscribeMenu'

export type SurfaceSearchParams = Record<string, string | undefined>

const monthLabelFmt = new Intl.DateTimeFormat('en-US', { timeZone: 'UTC', month: 'long', year: 'numeric' })

const FLYER_WALL_SIZE = 6
const MIN_FLYERS = 3

function query(params: Record<string, string | undefined>): string {
  const p = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v) p.set(k, v)
  const s = p.toString()
  return s ? `?${s}` : ''
}

export async function EventsSurface({ view, searchParams }: { view: EventsView; searchParams: SurfaceSearchParams }) {
  const { q, category, interest, free, days, m, w } = searchParams
  const filters = { category, interest, free: !!free }
  const filterParams = { category, interest, free: free ? '1' : undefined }
  const now = new Date()
  const today = todayKey(now)

  // window per view. The calendars start at the top of their grid rather than
  // at "now", so earlier days this month show what happened instead of blanks.
  const list = listWindow(days, now)
  const ym = m && isMonthKey(m) ? m : today.slice(0, 7)
  const anchor = w && isDayKey(w) ? weekStart(w) : weekStart(today)
  const weeks = monthGrid(ym)
  const from =
    view === 'month' ? dayStartIso(weeks[0][0].day)
    : view === 'week' ? dayStartIso(anchor)
    : list.from
  const to =
    view === 'month' ? dayEndIso(weeks[weeks.length - 1][6].day)
    : view === 'week' ? dayEndIso(addDays(anchor, 6))
    : list.to

  const searchHorizon = new Date(now.getTime() + 2 * 365 * 86_400_000).toISOString()

  // search only applies to the list view
  const searching = view === 'list' && !!q
  const events = searching
    ? await sanityFetch<EventDoc[]>(EVENTS_SEARCH, { q })
    : await sanityFetch<EventDoc[]>(UPCOMING_OR_RECURRING, { from })

  const filtered = events.filter(e => matchesFilters(e, filters))
  const occurrences: Occurrence[] = searching
    // One row per event, on its next date. Past events live in the archive.
    ? filtered.flatMap(e => expandOccurrences(e, from, searchHorizon).slice(0, 1).map(occursAt => ({ e, occursAt })))
    : filtered
        .flatMap(e => expandOccurrences(e, from, to).map(occursAt => ({ e, occursAt })))
        .sort((a, b) => a.occursAt.localeCompare(b.occursAt))
  const groups = groupByDay(occurrences)

  const count = occurrences.length
  const narrowed = !!(category || interest || free)
  const flyers = view === 'list' && !searching ? pickFlyers(occurrences, FLYER_WALL_SIZE) : []
  const noun = count === 1 ? 'thing' : 'things'

  // How many events each interest would show right now, so a filter never
  // leads to an empty page. Not meaningful across a text search.
  let interestCounts: Record<string, number> | undefined
  if (!searching) {
    interestCounts = {}
    for (const e of events) {
      if (!matchesFilters(e, { category, free: !!free })) continue
      const n = expandOccurrences(e, from, to).length
      if (n) for (const i of e.interests ?? []) interestCounts[i] = (interestCounts[i] ?? 0) + n
    }
  }

  return (
    <div className="wrap">
      {view === 'list' && (
        <section className="pt-8 md:pt-12">
          <h1 className="display text-[2.5rem] text-balance md:text-[3.5rem]">
            Know what&apos;s good in the Gump
            <span className="sr-only">: events in Montgomery, Alabama</span>
          </h1>
          <p className="mt-2 text-lg leading-7 text-dim">
            {searching
              ? `${count} ${count === 1 ? 'result' : 'results'} for “${q}”`
              : `${count} ${noun} to do in Montgomery ${list.label}`}
          </p>
        </section>
      )}

      {flyers.length >= MIN_FLYERS && <FlyerWall picks={flyers} />}

      <EventFilters
        key={view}
        showDates={view === 'list'}
        keep={view === 'month' ? { m } : view === 'week' ? { w } : undefined}
        viewTabs={<ViewTabs view={view} query={query(filterParams)} />}
        subscribe={<SubscribeMenu siteUrl={SITE_URL} feedQuery={query(filterParams)} filtered={narrowed} />}
        counts={interestCounts}
        q={q}
        category={category}
        interest={interest}
        days={list.range}
        free={free}
        interests={INTERESTS}
      />

      {view === 'list' && (
        <div className="mt-6">
          <EventList groups={groups} />
          {!searching && count > 0 && !['30', '90'].includes(list.range) && (
            <p className="mt-8">
              <Link href={`/${query({ ...filterParams, days: '30' })}`} className="btn">See the next 30 days</Link>
            </p>
          )}
        </div>
      )}
      {view === 'month' && (
        <MonthView
          key={ym}
          weeks={weeks}
          groups={groups}
          monthLabel={monthLabelFmt.format(new Date(`${ym}-01T12:00:00Z`))}
          today={today}
          prevHref={`/calendar${query({ ...filterParams, m: addMonths(ym, -1) })}`}
          nextHref={`/calendar${query({ ...filterParams, m: addMonths(ym, 1) })}`}
          todayHref={`/calendar${query(filterParams)}`}
        />
      )}
      {view === 'week' && (
        <WeekView
          anchor={anchor}
          groups={groups}
          prevHref={`/calendar/week${query({ ...filterParams, w: addDays(anchor, -7) })}`}
          nextHref={`/calendar/week${query({ ...filterParams, w: addDays(anchor, 7) })}`}
          todayHref={`/calendar/week${query(filterParams)}`}
        />
      )}
    </div>
  )
}
