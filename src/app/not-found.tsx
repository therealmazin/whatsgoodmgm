import Link from 'next/link'

// Root-level 404 for URLs that match no route. Bad event slugs inside the
// site segment use src/app/(site)/not-found.tsx, which keeps the site chrome.
export default function NotFound() {
  return (
    <div className="wrap flex min-h-screen flex-col items-start justify-center">
      <p className="text-sm text-dim">404</p>
      <h1 className="display mt-2 max-w-2xl text-4xl md:text-5xl">That page wandered off down Dexter Avenue.</h1>
      <Link href="/" className="btn btn-primary mt-6">Back to the events</Link>
    </div>
  )
}
