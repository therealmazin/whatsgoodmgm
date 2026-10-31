import { sanityFetch } from '@/lib/sanity/fetch'
import { PAST_EVENTS, type EventDoc } from '@/lib/sanity/queries'
import { EventRow } from '@/components/events/EventRow'

export const revalidate = 3600
export const metadata = { title: 'Archive' }

export default async function ArchivePage() {
  const events = await sanityFetch<EventDoc[]>(PAST_EVENTS, { now: new Date().toISOString() })
  return (
    <div className="wrap pt-8 md:pt-12">
      <h1 className="display text-4xl md:text-5xl">The archive</h1>
      <p className="mt-2 text-dim">Everything that already happened, newest first</p>
      <div className="mt-6 max-w-3xl">
        {events.map(e => <EventRow key={e._id} event={e} occursAt={e.startDateTime} showDate />)}
      </div>
      {events.length === 0 && <p className="mt-4 text-dim">Nothing here yet</p>}
    </div>
  )
}
