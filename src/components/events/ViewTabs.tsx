import Link from 'next/link'

export type EventsView = 'list' | 'month' | 'week'

const tabs: { view: EventsView; href: string; label: string }[] = [
  { view: 'list', href: '/', label: 'List' },
  { view: 'month', href: '/calendar', label: 'Month' },
  { view: 'week', href: '/calendar/week', label: 'Week' },
]

export function ViewTabs({ view, query }: { view: EventsView; query: string }) {
  return (
    <div role="group" aria-label="View" className="seg shrink-0">
      {tabs.map(t => (
        <Link
          key={t.view}
          href={`${t.href}${query}`}
          aria-current={t.view === view ? 'page' : undefined}
          className="seg-item max-md:flex-1 max-md:justify-center"
        >
          {t.label}
        </Link>
      ))}
    </div>
  )
}
