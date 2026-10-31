import type { MenuLink } from '@/lib/events/links'
import { LinkMenu } from '@/components/LinkMenu'

export function SubscribeMenu({ siteUrl, feedQuery, filtered }: {
  siteUrl: string
  feedQuery: string // '' or '?category=music&free=1'
  filtered: boolean
}) {
  const feedUrl = `${siteUrl}/api/calendar.ics${feedQuery}`
  const webcal = feedUrl.replace(/^https?/, 'webcal')
  const links: MenuLink[] = [
    { label: 'Google Calendar', icon: 'google', external: true, href: `https://calendar.google.com/calendar/r?cid=${encodeURIComponent(webcal)}` },
    { label: 'Apple Calendar', icon: 'apple', external: false, href: webcal },
    { label: 'Outlook', icon: 'outlook', external: true, href: `https://outlook.live.com/calendar/0/addfromweb?url=${encodeURIComponent(feedUrl)}&name=whatsgoodmgm` },
    { label: 'Download .ics', icon: 'download', external: false, href: feedUrl },
  ]
  return (
    <LinkMenu
      label="Subscribe"
      title="Subscribe to this calendar"
      icon="calendar"
      links={links}
      align="right"
      iconOnlyOnPhone
      note={filtered ? 'Follows your current filters' : 'Updates as new events land'}
    />
  )
}
