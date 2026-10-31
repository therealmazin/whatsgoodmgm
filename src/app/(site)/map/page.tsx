import { sanityFetch } from '@/lib/sanity/fetch'
import { UPCOMING_OR_RECURRING, type EventDoc } from '@/lib/sanity/queries'
import MapViewLoader from '@/components/MapViewLoader'

export const revalidate = 3600
export const metadata = { title: 'Map' }

export default async function MapPage() {
  const events = await sanityFetch<EventDoc[]>(UPCOMING_OR_RECURRING, { from: new Date().toISOString() })
  return (
    <>
      <h1 className="sr-only">Where it&apos;s happening in Montgomery</h1>
      <MapViewLoader events={events} />
    </>
  )
}
