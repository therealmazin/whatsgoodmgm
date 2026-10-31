import Link from 'next/link'

export const metadata = { title: 'Privacy' }

export default function PrivacyPage() {
  return (
    <div className="wrap max-w-2xl space-y-4 pt-8 md:pt-12">
      <h1 className="display text-4xl md:text-5xl">The short version</h1>
      <p className="leading-7 text-dim">
        We don&apos;t have accounts. We don&apos;t run trackers or analytics that follow you
        around the internet. We don&apos;t sell anything, including your data.
      </p>
      <p className="leading-7 text-dim">
        The <Link href="/submit" className="link text-ink">submit form</Link> stores exactly
        what you type (the event info, and an optional handle or email) so a human can review it.
        If you leave an email, we only use it to ask questions about your submission. Ask us to
        delete yours anytime, through the submit form or at{' '}
        <a href="mailto:info@mmintelligence.ai" className="link text-ink">info@mmintelligence.ai</a>.
      </p>
      <p className="leading-7 text-dim">
        Our hosting and CMS providers (Vercel, Sanity) keep standard server logs to run the
        infrastructure. That&apos;s their business, not ours, and it&apos;s the ordinary cost
        of a website existing.
      </p>
    </div>
  )
}
