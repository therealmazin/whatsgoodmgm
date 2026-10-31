import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="wrap pt-12">
      <p className="text-sm text-dim">404</p>
      <h1 className="display mt-2 max-w-2xl text-4xl md:text-5xl">That page wandered off down Dexter Avenue.</h1>
      <Link href="/" className="btn btn-primary mt-6">Back to the events</Link>
    </div>
  )
}
