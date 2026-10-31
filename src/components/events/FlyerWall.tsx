import Link from 'next/link'
import type { Occurrence } from '@/lib/events/grouping'
import { todayKey, localDayKey } from '@/lib/events/grouping'
import { dayParts, formatEventTime } from '@/lib/events/format'
import { FlyerImage } from '@/components/FlyerImage'

/** The next few events that have flyers, soonest first: a corkboard, not a recommendation. */
export function FlyerWall({ picks }: { picks: Occurrence[] }) {
  const today = todayKey()
  return (
    <section aria-label="Coming up" className="mt-8">
      <ul className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 [scrollbar-width:none] md:mx-0 md:grid md:snap-none md:grid-cols-6 md:gap-4 md:overflow-visible md:px-0">
        {picks.map(({ e, occursAt }) => (
          <li key={e._id} className="w-36 shrink-0 snap-start scroll-ml-4 md:w-auto">
            <Link href={`/events/${e.slug}`} className="group block">
              <FlyerImage
                src={e.imageUrl!}
                alt=""
                width={360}
                height={480}
                sizes="(min-width: 768px) 180px, 144px"
                className="aspect-[3/4] h-auto w-full rounded-xl object-cover object-top ring-1 ring-line transition-opacity group-hover:opacity-90"
              />
              <span className="mt-2 block text-[13px] leading-5 text-dim tabular-nums">
                {dayParts(localDayKey(occursAt), today).name} · {formatEventTime(occursAt)}
              </span>
              <span className="line-clamp-2 text-sm font-medium leading-5">{e.title}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
