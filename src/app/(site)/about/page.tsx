import Link from 'next/link'
import { sanityFetch } from '@/lib/sanity/fetch'
import { PUBLIC_SOURCES, type PublicSource } from '@/lib/sanity/queries'

export const revalidate = 3600
export const metadata = { title: 'About' }

const heading = 'display text-2xl'

export default async function AboutPage() {
  const sources = await sanityFetch<PublicSource[]>(PUBLIC_SOURCES)
  return (
    <div className="wrap max-w-2xl space-y-10 pt-8 md:pt-12">
      <section>
        <h1 className="display text-4xl md:text-5xl">Know what&apos;s good in the Gump</h1>
        <p className="mt-5 leading-7">
          WhatsGoodMGM is a free, no-ads guide to what&apos;s happening in and around Montgomery,
          Alabama. It&apos;s a community project: events come from local venues, organizers, and
          people who live here. A machine helps collect; a human always decides. Every event links
          back to its source, because the people putting it on are the point.
        </p>
        <p className="mt-4 leading-7">
          Browse the list, flip to the calendar, or subscribe and let events land on your phone.
          Know about something we don&apos;t?{' '}
          <Link href="/submit" className="link text-ink">submit it</Link>. That&apos;s the
          whole deal.
        </p>
      </section>
      <section>
        <h2 className={heading}>Where the events come from</h2>
        <p className="mt-3 leading-7">
          These calendars feed the site automatically, checked weekly:
        </p>
        <ul className="mt-3 md:columns-2">
          {sources.map(s => (
            <li key={s.name} className="leading-7">
              {s.homepage ? (
                <a href={s.homepage} className="link text-ink" target="_blank" rel="noopener noreferrer">
                  {s.name}
                </a>
              ) : (
                <span>{s.name}</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-3 leading-7">
          On top of those, we read venue and ticketing pages around the river region by hand
          and pull in what&apos;s real. Run a venue, a market, or a series and want your events
          in here every week? <Link href="/submit" className="link text-ink">tell us</Link>.
        </p>
      </section>
      <section>
        <h2 className={heading}>Who&apos;s behind this</h2>
        <p className="mt-3 leading-7">
          WhatsGoodMGM is built and kept running by{' '}
          <a href="https://www.mmintelligence.ai" className="link text-ink" target="_blank" rel="noopener noreferrer">
            MM Intelligence
          </a>
          , a Montgomery software studio run by two brothers who build AI for real businesses
          and wanted to give something back to the city they build from. Free forever, no ads,
          no selling your data.
        </p>
      </section>
      <section>
        <h2 className={heading}>Inspiration &amp; thanks</h2>
        <p className="mt-3 leading-7">
          This site was inspired by the &ldquo;There&apos;s Nothing To Do In Montgomery&rdquo;
          weekly threads on{' '}
          <a href="https://www.reddit.com/r/Montgomery/" className="link text-ink" target="_blank" rel="noopener noreferrer">
            r/Montgomery
          </a>
          , proof this city wanted a real events list. Thanks also to the local venues, Eventbrite
          organizers, and everyone who submits.
        </p>
        <p className="mt-3 leading-7">
          Something wrong or missing? Holler:{' '}
          <a href="mailto:info@mmintelligence.ai" className="link text-ink">info@mmintelligence.ai</a>.
        </p>
      </section>
    </div>
  )
}
