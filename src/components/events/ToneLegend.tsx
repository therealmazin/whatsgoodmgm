import { TONE_LEGEND } from '@/lib/events/tones'

/** What the calendar colours mean. */
export function ToneLegend() {
  return (
    <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs leading-4 text-dim">
      {TONE_LEGEND.map(({ tone, label }) => (
        <li key={tone} className="flex items-center gap-2">
          <span className={`tone-dot tone-${tone}`} />
          {label}
        </li>
      ))}
    </ul>
  )
}
