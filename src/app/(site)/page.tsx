import { buildWebsiteJsonLd, jsonLdScript } from '@/lib/seo/jsonLd'
import { EventsSurface, type SurfaceSearchParams } from '@/components/events/EventsSurface'

export const revalidate = 3600

export default async function HomePage({ searchParams }: { searchParams: Promise<SurfaceSearchParams> }) {
  const params = await searchParams
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(buildWebsiteJsonLd()) }}
      />
      <EventsSurface view="list" searchParams={params} />
    </>
  )
}
