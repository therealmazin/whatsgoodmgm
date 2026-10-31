'use client'
import type { MenuLink } from '@/lib/events/links'
import { Dropdown } from '@/components/Dropdown'
import { BrandIcon, CalendarPlusIcon, NavigationIcon } from '@/components/icons'

const TRIGGER_ICONS = { calendar: CalendarPlusIcon, directions: NavigationIcon }

/** A dropdown of outbound links with recognisable marks: calendars, maps apps. */
export function LinkMenu({ label, title, icon, links, note, align, className, rootClassName, iconOnlyOnPhone }: {
  label: string
  title: string
  icon: keyof typeof TRIGGER_ICONS
  links: MenuLink[]
  note?: string
  align?: 'left' | 'right'
  className?: string
  rootClassName?: string
  iconOnlyOnPhone?: boolean
}) {
  const Icon = TRIGGER_ICONS[icon]
  return (
    <Dropdown
      title={title}
      align={align}
      className={className}
      rootClassName={rootClassName}
      label={
        <>
          <Icon width={16} height={16} className="shrink-0" />
          <span className={iconOnlyOnPhone ? 'max-md:sr-only' : ''}>{label}</span>
        </>
      }
    >
      {close => (
        <>
          {links.map(l => (
            <a
              key={l.label}
              href={l.href}
              target={l.external ? '_blank' : undefined}
              rel="noopener noreferrer"
              onClick={close}
              className="opt whitespace-nowrap"
            >
              <span className="flex w-5 shrink-0 justify-center"><BrandIcon name={l.icon} /></span>
              {l.label}
            </a>
          ))}
          {note && <p className="px-3 pb-2 pt-1 text-xs leading-4 text-muted">{note}</p>}
        </>
      )}
    </Dropdown>
  )
}
