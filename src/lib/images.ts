// Hosts whose flyers go through next/image (resized + cached by Vercel).
// Flyers from any other host still render, just unoptimized, so a new source
// never breaks images. Add a host here when a new source shows up often.
export const FLYER_HOSTS = [
  'assets.simpleviewinc.com',
  'img.evbuc.com',
  'mmfa.org',
  'mpaconline.org',
  'pikeroad.us',
  'photos.bandsintown.com',
  'images.squarespace-cdn.com',
  'asf.net',
  'irp.cdn-website.com',
]

export function isOptimizableFlyer(src: string): boolean {
  try {
    const u = new URL(src)
    return u.protocol === 'https:' && FLYER_HOSTS.includes(u.hostname)
  } catch {
    return false
  }
}

/**
 * A small version of a flyer for places <Image> can't reach, like the HTML in a
 * map pin. 128 matches the list thumbnails, so it reuses that cached resize
 * rather than spending another image transformation.
 */
export function flyerThumbUrl(src: string): string {
  return isOptimizableFlyer(src)
    ? `/_next/image?url=${encodeURIComponent(src)}&w=128&q=75`
    : encodeURI(src).replace(/"/g, '%22')
}
