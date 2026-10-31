'use client'
import Image, { type ImageProps } from 'next/image'
import { useState } from 'react'
import { isOptimizableFlyer } from '@/lib/images'

// Event flyers are external, often full-size (500KB+) images shown as small
// thumbnails. Known hosts get resized through next/image; unknown hosts fall
// back to the raw image. They're hotlinks, so any of them can vanish: a dead
// or missing one shows the logo mark at the same size and the layout holds.
export function FlyerImage({ src, alt, className, ...props }: Omit<ImageProps, 'src'> & { src?: string }) {
  const [failed, setFailed] = useState(false)

  if (failed || !src) {
    return (
      <span role={alt ? 'img' : undefined} aria-label={alt || undefined} className={`flex items-center justify-center bg-raised text-muted ${className ?? ''}`}>
        <span className="flyer-mark" />
      </span>
    )
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      unoptimized={!isOptimizableFlyer(src)}
      onError={() => setFailed(true)}
      // onError can't fire for an image that broke before hydration
      ref={el => {
        if (el?.complete && el.naturalWidth === 0) setFailed(true)
      }}
    />
  )
}
