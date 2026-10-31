'use client'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect, useRef, useState, useTransition, type KeyboardEvent, type ReactNode } from 'react'
import { DEFAULT_LIST_DAYS, LIST_RANGES } from '@/lib/events/filter'
import { interestTone } from '@/lib/events/tones'
import { Dropdown } from '@/components/Dropdown'
import { CloseIcon, SearchIcon } from '@/components/icons'

const DEFAULT_DAYS = String(DEFAULT_LIST_DAYS)

// The Free button filters on actual price, which is what people mean by it, so
// the looser "free stuff" interest tag would only be a confusing second one.
const HIDDEN_INTERESTS = ['free-stuff']

const sentenceCase = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

type Filters = { q?: string; category?: string; interest?: string; days?: string; free?: boolean }

type Props = {
  viewTabs: ReactNode
  subscribe: ReactNode
  showDates: boolean // search and When only exist on the list view
  keep?: Record<string, string | undefined> // params to preserve, e.g. the month being viewed
  counts?: Record<string, number> // events per interest; absent while searching
  q?: string
  category?: string
  interest?: string
  days?: string
  free?: string
  interests: readonly { id: string; label: string }[]
}

export default function EventFilters({
  viewTabs, subscribe, showDates, keep, counts, q, category, interest, days, free, interests,
}: Props) {
  const router = useRouter()
  const pathname = usePathname()
  const [pending, startTransition] = useTransition()
  const [search, setSearch] = useState(q ?? '')
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Keep the field in sync if the URL changes from elsewhere (e.g. back/forward nav).
  // Adjusting state during render (not in an effect) avoids a cascading re-render:
  // https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const [syncedQ, setSyncedQ] = useState(q)
  if (q !== syncedQ) {
    setSyncedQ(q)
    setSearch(q ?? '')
  }

  function navigate(next: Filters) {
    const params = new URLSearchParams()
    for (const [k, v] of Object.entries(keep ?? {})) if (v) params.set(k, v)
    if (showDates && next.q) params.set('q', next.q)
    if (next.category) params.set('category', next.category)
    if (next.interest) params.set('interest', next.interest)
    if (showDates && next.days && next.days !== DEFAULT_DAYS) params.set('days', next.days)
    if (next.free) params.set('free', '1')
    const qs = params.toString()
    startTransition(() => {
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
    })
  }

  function current(overrides: Filters = {}) {
    return { q: search, category, interest, days, free: !!free, ...overrides }
  }

  function onSearchChange(value: string) {
    setSearch(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => navigate(current({ q: value })), 400)
  }

  function onSearchKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      if (debounceRef.current) clearTimeout(debounceRef.current)
      navigate(current({ q: search }))
    }
  }

  function reset() {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    setSearch('')
    navigate({ days })
  }

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current)
    }
  }, [])

  const rangeLabel = LIST_RANGES.find(r => r.value === days)?.label ?? `Next ${days} days`
  const activeInterest = interests.find(i => i.id === interest)
  const narrowed = !!(search || category || interest || free)

  return (
    <form
      method="GET"
      className="mt-8"
      onSubmit={e => {
        // JS is active - we already auto-filter, so a native submit (e.g. a
        // stray Enter we didn't catch) should still just update the URL
        // rather than doing a full page reload.
        e.preventDefault()
        navigate(current())
      }}
    >
      <div className="flex flex-wrap items-center gap-2 md:gap-3">
        {showDates ? (
          <div className="relative w-full lg:w-64">
            <label className="sr-only" htmlFor="events-search">Search events</label>
            <SearchIcon className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
            <input
              id="events-search"
              name="q"
              type="search"
              value={search}
              onChange={e => onSearchChange(e.target.value)}
              onKeyDown={onSearchKeyDown}
              placeholder="Search"
              className="field h-11 pl-10 lg:!min-h-9 lg:h-9"
            />
          </div>
        ) : <div className="w-full md:w-auto">{viewTabs}</div>}

        {/* One line: scrolls sideways on phones rather than wrapping. The
            panels survive that because a phone shows them as fixed sheets. */}
        <div className="-mx-4 flex min-w-0 grow basis-full items-center gap-2 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:basis-0 md:flex-wrap md:overflow-visible md:px-0">
          {showDates && (
            <Dropdown title="When" label={rangeLabel} active={days !== DEFAULT_DAYS}>
              {close => LIST_RANGES.map(r => (
                <button
                  key={r.value}
                  type="button"
                  aria-pressed={days === r.value}
                  onClick={() => { navigate(current({ days: r.value })); close() }}
                  className="opt whitespace-nowrap"
                >
                  {r.label}
                </button>
              ))}
            </Dropdown>
          )}

          <Dropdown
            title="Interest"
            active={!!interest}
            label={
              <>
                {activeInterest && <span className={`tone-dot tone-${interestTone(activeInterest.id)}`} />}
                {activeInterest ? sentenceCase(activeInterest.label) : 'All interests'}
              </>
            }
          >
            {close => (
              <>
                <button
                  type="button"
                  aria-pressed={!interest}
                  onClick={() => { navigate(current({ interest: '' })); close() }}
                  className="opt whitespace-nowrap"
                >
                  All interests
                </button>
                {interests.filter(i => !HIDDEN_INTERESTS.includes(i.id) || i.id === interest).map(i => {
                  const on = interest === i.id
                  const n = counts?.[i.id]
                  return (
                    <button
                      key={i.id}
                      type="button"
                      aria-pressed={on}
                      disabled={counts !== undefined && !n && !on}
                      onClick={() => { navigate(current({ interest: i.id })); close() }}
                      className="opt whitespace-nowrap"
                    >
                      <span className={`tone-dot tone-${interestTone(i.id)}`} />
                      {sentenceCase(i.label)}
                      {n ? <span className="ml-auto pl-4 text-sm font-normal text-muted tabular-nums">{n}</span> : null}
                    </button>
                  )
                })}
              </>
            )}
          </Dropdown>

          <button
            type="button"
            aria-pressed={!!free}
            onClick={() => navigate(current({ free: !free }))}
            className="btn btn-sm shrink-0"
          >
            Free
          </button>

          {/* Few events have a category, so it isn't offered, but links can
              still arrive with one. Show it so it can be removed. */}
          {category && (
            <button type="button" aria-pressed onClick={() => navigate(current({ category: '' }))} className="btn btn-sm shrink-0">
              {sentenceCase(category)}
              <CloseIcon width={16} height={16} />
              <span className="sr-only">Remove category filter</span>
            </button>
          )}

          {narrowed && (
            <button type="button" onClick={reset} className="link shrink-0 cursor-pointer px-1 text-sm text-dim">Clear</button>
          )}
          <span aria-live="polite" className="shrink-0 whitespace-nowrap text-sm text-muted">{pending ? 'Updating…' : ''}</span>

          <div className="ml-auto flex shrink-0 items-center gap-2 md:gap-3">
            {showDates && <div className="hidden md:block">{viewTabs}</div>}
            {subscribe}
          </div>
        </div>
      </div>

      {/* No-JS fallback (degraded, accepted): the filters need JS, but these
          keep them in the URL when the search box is submitted natively. */}
      {category ? <input type="hidden" name="category" value={category} /> : null}
      {interest ? <input type="hidden" name="interest" value={interest} /> : null}
      {days && days !== DEFAULT_DAYS ? <input type="hidden" name="days" value={days} /> : null}
      {free ? <input type="hidden" name="free" value="1" /> : null}
    </form>
  )
}
