import Link from 'next/link'
import BottomNav from '@/components/BottomNav'
import Logo from '@/components/Logo'
import SiteNav from '@/components/SiteNav'
import ThemeToggle from '@/components/ThemeToggle'

const Wordmark = () => (
  <span className="font-display font-medium tracking-tight whitespace-nowrap">
    What&apos;s Good<span className="text-accent">.</span>MGM
  </span>
)

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="border-b border-line">
        <div className="wrap flex h-16 items-center justify-between gap-2 md:gap-6">
          <Link href="/" className="flex min-h-10 shrink-0 items-center gap-2 text-lg min-[400px]:text-xl md:gap-3">
            <Logo className="h-7 w-auto min-[400px]:h-8" />
            <Wordmark />
          </Link>
          <div className="flex items-center md:gap-6">
            <SiteNav />
            <ThemeToggle />
          </div>
        </div>
      </header>
      <main>{children}</main>
      <footer className="mt-16 border-t border-line pb-24 pt-8 md:pb-8">
        <div className="wrap flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-sm text-dim">Made in Montgomery, for Montgomery</p>
          <p className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-dim">
            <a href="https://www.mmintelligence.ai" className="link" target="_blank" rel="noopener noreferrer">
              Built by MM Intelligence
            </a>
            <Link href="/about" className="link">About</Link>
            <Link href="/archive" className="link">Archive</Link>
            <Link href="/privacy" className="link">Privacy</Link>
            <a href="mailto:info@mmintelligence.ai" className="link">Email us</a>
            <span className="text-muted">© 2026</span>
          </p>
        </div>
      </footer>
      <BottomNav />
    </>
  )
}
