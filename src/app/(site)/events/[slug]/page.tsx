import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { groq } from 'next-sanity'
import { sanityFetch } from '@/lib/sanity/fetch'
import { EVENT_BY_SLUG, type EventDoc } from '@/lib/sanity/queries'
import { formatDayShort, formatEventDate, formatEventDateTime, formatWhen } from '@/lib/events/format'
import { localDayKey } from '@/lib/events/grouping'
import { expandOccurrences } from '@/lib/events/occurrences'
import { buildEventJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import { SITE_URL } from '@/lib/siteUrl'
import { EventRow } from '@/components/events/EventRow'
import VenueMiniMapLoader from '@/components/VenueMiniMapLoader'
import { FlyerImage } from '@/components/FlyerImage'
import { BackIcon, PinIcon, TicketIcon } from '@/components/icons'
import { LinkMenu } from '@/components/LinkMenu'
import { calendarLinks, directionLinks, sourceHost } from '@/lib/events/links'

export const revalidate = 3600

// Meta description: the event's own copy trimmed to ~155 chars, or a generated
// fallback when it has none.
function truncate(s: string, max = 155): string {
  const t = s.trim().replace(/\s+/g, ' ')
  if (t.length <= max) return t
  const cut = t.slice(0, max - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > 40 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`
}

function metaDescription(event: EventDoc): string {
  if (event.description?.trim()) return truncate(event.description)
  const at = event.venue?.name ? ` at ${event.venue.name}` : ''
  return `${event.title}${at}, ${formatEventDateTime(event.startDateTime)}, Montgomery AL`
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const event = await sanityFetch<EventDoc | null>(EVENT_BY_SLUG, { slug })
  if (!event) return {}

  const url = `${SITE_URL}/events/${slug}`
  const description = metaDescription(event)
  const images = event.imageUrl ? [event.imageUrl] : undefined

  return {
    title: event.title,
    description,
    alternates: { canonical: url },
    openGraph: { title: event.title, description, url, ...(images ? { images } : {}) },
    twitter: { card: 'summary_large_image', title: event.title, description, ...(images ? { images } : {}) },
  }
}

// Other approved events at the same venue: upcoming or recurring, never this
// same event. Defined inline (queries.ts is owned by another change) but
// mirrors EVENT_FIELDS so the rows render through the shared EventRow.
const MORE_AT_VENUE = groq`
  *[_type == "event" && status == "approved" && venue._ref == $venueRef && _id != $id &&
    (startDateTime >= $from || defined(recurrence.frequency))]
    | order(startDateTime asc)[0...4]{
      _id, title, "slug": slug.current, startDateTime, endDateTime, category,
      description, priceText, imageUrl, sourceType, sourceUrl, additionalSourceUrls,
      featured, recurrence,
      venue->{ _id, name, address, neighborhood, lat, lng }
    }`

const DAY_MS = 86_400_000

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const event = await sanityFetch<EventDoc | null>(EVENT_BY_SLUG, { slug })
  if (!event) notFound()

  const venue = event.venue
  const hasCoords = venue?.lat != null && venue?.lng != null
  const directions = directionLinks(venue)
  const eventJsonLd = buildEventJsonLd(event, `${SITE_URL}/events/${slug}`)

  // Recurring events get real upcoming dates rather than a single stale one.
  const now = new Date()
  const nextDates = event.recurrence?.frequency
    ? expandOccurrences(event, now.toISOString(), new Date(now.getTime() + 60 * DAY_MS).toISOString()).slice(0, 5)
    : []
  const occursAt = nextDates[0] ?? event.startDateTime
  const when = formatWhen(occursAt, nextDates.length > 0 ? undefined : event.endDateTime)
  const recurLabel = event.recurrence?.note ?? (event.recurrence?.frequency && `repeats ${event.recurrence.frequency}`)

  // Other events at this venue (only worth a query when there's a venue).
  const moreAtVenue = venue?._id
    ? await sanityFetch<EventDoc[]>(MORE_AT_VENUE, {
        venueRef: venue._id,
        id: event._id,
        from: now.toISOString(),
      })
    : []

  const [month, dayOfMonth] = formatDayShort(localDayKey(occursAt)).split(' ')
  const isFree = /^free$/i.test((event.priceText ?? '').trim())
  const calendar = calendarLinks(event, occursAt, `/api/calendar.ics?event=${encodeURIComponent(slug)}`)
  const host = sourceHost(event.sourceUrl)

  const tile = 'flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg border border-line bg-surface'
  const fact = 'col-span-2 flex items-center gap-3 lg:col-span-1'

  return (
    <article className="wrap pt-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(eventJsonLd) }}
      />
      <Link href="/" className="-ml-2 inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm text-dim transition-colors hover:text-ink">
        <BackIcon width={16} height={16} />
        All events
      </Link>

      {/* Facts come first at every width. A flyer can be taller than the
          screen, so on desktop it sits alongside them, not above them. */}
      <div className={`mt-4 grid gap-x-12 gap-y-8 ${event.imageUrl ? 'md:grid-cols-[minmax(0,1fr)_20rem] lg:grid-cols-[minmax(0,1fr)_24rem]' : 'max-w-2xl'}`}>
        <header className="min-w-0">
          <h1 className="display text-[2rem] text-pretty md:text-5xl">{event.title}</h1>

          {/* Each action sits beside the fact it's about. On small screens the
              first two pair up underneath, and the sticky bar has the third. */}
          <div className="mt-6 grid grid-cols-2 items-center gap-x-2 gap-y-4 lg:grid-cols-[minmax(0,1fr)_11rem] lg:gap-x-4">
            <div className={`${fact} lg:row-start-1`}>
              <div className={tile}>
                <span className="text-xs leading-4 text-dim">{month}</span>
                <span className="text-base font-medium leading-5 tabular-nums">{dayOfMonth}</span>
              </div>
              <div className="min-w-0">
                <p className="font-medium">{when.date}</p>
                <p className="text-sm text-dim">
                  {when.time}
                  {recurLabel && ` · ${recurLabel}`}
                </p>
              </div>
            </div>
            {venue && (
              <div className={`${fact} lg:row-start-2`}>
                <div className={tile}><PinIcon className="text-dim" /></div>
                <div className="min-w-0">
                  <p className="font-medium">{venue.name}</p>
                  {(venue.address || venue.neighborhood) && (
                    <p className="text-sm text-dim">{venue.address ?? venue.neighborhood}</p>
                  )}
                </div>
              </div>
            )}
            {(event.priceText || host) && (
              <div className={`${fact} lg:row-start-3`}>
                <div className={tile}><TicketIcon className="text-dim" /></div>
                <div className="min-w-0">
                  <p className={`font-medium first-letter:uppercase ${isFree ? 'text-accent' : ''}`}>{event.priceText ?? 'See the listing'}</p>
                  {host && <p className="truncate text-sm text-dim">Listed on {host}</p>}
                </div>
              </div>
            )}

            <LinkMenu
              label="Add to calendar"
              title="Add to calendar"
              icon="calendar"
              links={calendar}
              align="right"
              className="w-full max-[359px]:[&>svg:last-child]:hidden"
              rootClassName={`lg:col-start-2 lg:row-start-1 ${directions.length ? '' : 'col-span-2 lg:col-span-1'}`}
            />
            {directions.length > 0 && (
              <LinkMenu
                label="Directions"
                title={`Directions to ${venue!.name}`}
                icon="directions"
                links={directions}
                align="right"
                className="w-full max-[359px]:[&>svg:last-child]:hidden"
                rootClassName="lg:col-start-2 lg:row-start-2"
              />
            )}
            {event.sourceUrl && (
              <a
                href={event.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary btn-sm col-span-2 max-md:hidden lg:col-span-1 lg:col-start-2 lg:row-start-3"
              >
                Event page
              </a>
            )}
          </div>
        </header>

        {event.imageUrl && (
          <div className="md:sticky md:top-4 md:col-start-2 md:row-span-2 md:row-start-1 md:self-start">
            <FlyerImage
              src={event.imageUrl}
              alt={`Flyer for ${event.title}`}
              width={1344}
              height={896}
              sizes="(min-width: 1024px) 384px, (min-width: 768px) 320px, 100vw"
              loading="eager"
              fetchPriority="high"
              className="h-auto w-full rounded-xl ring-1 ring-line"
            />
          </div>
        )}

        <div className="min-w-0">
          {event.description && (
            <p className="max-w-prose whitespace-pre-line leading-7">{event.description}</p>
          )}

          {/* Next dates for a recurring event, so "every week" is concrete. */}
          {nextDates.length > 1 && (
            <section className="mt-8">
              <h2 className="display text-xl">Next dates</h2>
              <ul className="mt-2 divide-y divide-line">
                {nextDates.map(iso => (
                  <li key={iso} className="py-2 text-[15px] tabular-nums">{formatEventDate(iso)}</li>
                ))}
              </ul>
            </section>
          )}

          {hasCoords && (
            <section className="mt-8">
              <h2 className="display text-xl">Getting there</h2>
              <div className="relative mt-3">
                <div className="relative z-0 overflow-hidden rounded-xl ring-1 ring-line">
                  <VenueMiniMapLoader lat={venue!.lat!} lng={venue!.lng!} name={venue!.name} />
                </div>
                <LinkMenu
                  label="Get directions"
                  title={`Directions to ${venue!.name}`}
                  icon="directions"
                  links={directions}
                  rootClassName="!absolute left-3 top-3"
                  className="shadow-[0_1px_2px_rgba(0,0,0,0.1)]"
                />
              </div>
            </section>
          )}
        </div>
      </div>

      {moreAtVenue.length > 0 && (
        <section className="mt-12">
          <h2 className="display border-b border-line pb-2 text-2xl">More at {venue!.name}</h2>
          <div className="mt-2">
            {moreAtVenue.map(e => (
              <EventRow
                key={e._id}
                event={e}
                occursAt={expandOccurrences(e, now.toISOString(), new Date(now.getTime() + 60 * DAY_MS).toISOString())[0] ?? e.startDateTime}
                showDate
              />
            ))}
          </div>
        </section>
      )}

      {event.sourceUrl && (
        <div
          className="fixed inset-x-0 bottom-0 z-50 flex items-center justify-between gap-4 border-t border-line bg-bg px-4 pt-3 md:hidden"
          style={{ paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))' }}
        >
          <p className="min-w-0 text-sm">
            <span className="block truncate font-medium">{when.date}</span>
            <span className={`block truncate first-letter:uppercase ${isFree ? 'text-accent' : 'text-dim'}`}>
              {event.priceText ?? when.time}
            </span>
          </p>
          <a href={event.sourceUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary shrink-0">Event page</a>
        </div>
      )}
    </article>
  )
}
