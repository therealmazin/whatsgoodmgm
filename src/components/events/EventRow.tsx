import Link from 'next/link'
import type { EventDoc } from '@/lib/sanity/queries'
import { formatDayShort, formatEventTime } from '@/lib/events/format'
import { localDayKey } from '@/lib/events/grouping'
import { FlyerImage } from '@/components/FlyerImage'

/** One line of the listings. Pass `showDate` where rows aren't already under a day heading. */
export function EventRow({ event, occursAt, showDate }: { event: EventDoc; occursAt: string; showDate?: boolean }) {
  const time = formatEventTime(occursAt)
  const isFree = /^free$/i.test((event.priceText ?? '').trim())
  const meta = [
    showDate && time,
    event.venue?.name,
    event.venue?.neighborhood,
    !isFree && event.priceText,
  ].filter(Boolean).join(' · ')

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group -mx-2 grid grid-cols-[3.5rem_minmax(0,1fr)_auto] items-start gap-x-3 rounded-lg px-2 py-3 transition-colors hover:bg-raised md:grid-cols-[4.5rem_minmax(0,1fr)_auto]"
    >
      <span className="text-sm leading-6 text-dim tabular-nums">
        {showDate ? formatDayShort(localDayKey(occursAt)) : time}
      </span>
      <span className="min-w-0">
        <span className="line-clamp-2 font-medium leading-6">{event.title}</span>
        {/* The one truncating line: venue names and free-form prices run long. */}
        {(isFree || meta) && (
          <span className="mt-1 flex gap-2 text-sm leading-5 text-dim">
            {isFree && <span className="shrink-0 font-medium text-accent">Free</span>}
            {meta && <span className="min-w-0 truncate">{meta}</span>}
          </span>
        )}
      </span>
      <FlyerImage
        src={event.imageUrl}
        alt=""
        width={128}
        height={128}
        className="h-16 w-16 rounded-lg object-cover object-top ring-1 ring-line"
      />
    </Link>
  )
}
