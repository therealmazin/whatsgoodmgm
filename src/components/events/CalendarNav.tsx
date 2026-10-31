import Link from 'next/link'
import { ChevronLeftIcon, ChevronRightIcon } from '@/components/icons'

/** Title and prev/today/next for the month and week views. */
export function CalendarNav({ title, unit, prevHref, nextHref, todayHref }: {
  title: string
  unit: 'month' | 'week'
  prevHref: string
  nextHref: string
  todayHref: string
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <h1 className="display text-2xl md:text-3xl">{title}</h1>
      <div className="flex shrink-0 gap-1">
        <Link href={prevHref} aria-label={`Previous ${unit}`} className="btn btn-sm !px-2"><ChevronLeftIcon /></Link>
        <Link href={todayHref} className="btn btn-sm">Today</Link>
        <Link href={nextHref} aria-label={`Next ${unit}`} className="btn btn-sm !px-2"><ChevronRightIcon /></Link>
      </div>
    </div>
  )
}
