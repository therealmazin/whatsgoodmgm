import type { Metadata } from 'next'
import { Fraunces, Instrument_Sans } from 'next/font/google'
import { SITE_URL } from '@/lib/siteUrl'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
})

const instrumentSans = Instrument_Sans({
  subsets: ['latin'],
  variable: '--font-instrument-sans',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // Google Search Console ownership (info@mmintelligence.ai). Keep: removing it unverifies the property.
  verification: { google: 'QuGL_V5xhEJvVfKLYtTBCNmH-mmWmFwNqsav8fI-TbQ' },
  title: { default: 'WhatsGoodMGM · Know what\'s good in the Gump', template: '%s · WhatsGoodMGM' },
  description: 'a free, community-made guide to what\'s good in Montgomery, Alabama. events, maps, and a calendar you can subscribe to.',
  openGraph: {
    siteName: 'WhatsGoodMGM',
    type: 'website',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // suppressHydrationWarning: the pre-paint script in <body> legitimately
    // flips data-theme before React hydrates when the visitor has dark stored
    <html lang="en" data-theme="light" suppressHydrationWarning className={`${fraunces.variable} ${instrumentSans.variable}`}>
      <body className="min-h-screen antialiased">
        {/* runs before paint so a dark preference (stored, or the system's) never flashes light */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=localStorage.getItem('wg-theme');if(t==='dark'||(!t&&matchMedia('(prefers-color-scheme: dark)').matches))document.documentElement.setAttribute('data-theme','dark')}catch(e){}",
          }}
        />
        {children}
      </body>
    </html>
  )
}
