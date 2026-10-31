'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const nav = [
  { href: '/', label: 'Events' },
  { href: '/calendar', label: 'Calendar' },
  { href: '/map', label: 'Map' },
  { href: '/submit', label: 'Submit' },
  { href: '/about', label: 'About' },
]

const linkClass = 'text-sm text-dim transition-colors hover:text-ink aria-[current=page]:font-medium aria-[current=page]:text-ink'

export default function SiteNav() {
  const pathname = usePathname()
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname.startsWith(href))
  return (
    <>
      <nav aria-label="primary" className="hidden items-center gap-6 md:flex">
        {nav.map(n => (
          <Link key={n.href} href={n.href} aria-current={isActive(n.href) ? 'page' : undefined} className={linkClass}>
            {n.label}
          </Link>
        ))}
      </nav>
      {/* phones get the bottom tab bar; About is the one page not on it */}
      <Link
        href="/about"
        aria-current={isActive('/about') ? 'page' : undefined}
        className={`inline-flex min-h-10 items-center px-2 max-[349px]:hidden md:hidden ${linkClass}`}
      >
        About
      </Link>
    </>
  )
}
