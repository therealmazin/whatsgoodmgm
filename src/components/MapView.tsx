'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker, Popup, ZoomControl, useMap } from 'react-leaflet'
import { divIcon, latLng, type Map as LeafletMap, type Marker as LeafletMarker } from 'leaflet'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import type { EventDoc } from '@/lib/sanity/queries'
import { expandOccurrences } from '@/lib/events/occurrences'
import { listWindow } from '@/lib/events/filter'
import { dayParts, formatEventDateTime, formatEventTime } from '@/lib/events/format'
import { localDayKey, todayKey } from '@/lib/events/grouping'
import { flyerThumbUrl } from '@/lib/images'
import { FlyerImage } from '@/components/FlyerImage'
import { CloseIcon } from '@/components/icons'

/**
 * List side: one card per event OCCURRENCE, chronological with day headers -
 * the same expansion the /events page uses, so "trivia every Tuesday" shows
 * up on its actual next Tuesday instead of a stale first date.
 *
 * Map side: one pin per venue (events at the same address would stack
 * invisibly otherwise) with a count badge. Venue-grouping lives ONLY in the
 * pin popup, where it's natural geography - never in the list.
 *
 * Sync: card click → fly to + open that venue's popup. Pin click → filter
 * the list to that venue (a chronological list scatters one venue's events
 * across day groups, so scrolling could only ever reach the first one);
 * the venue's name above the list, with a close button, is the way back.
 */

type Occ = { e: EventDoc; occursAt: string }

type VenueGroup = {
  key: string
  lat: number
  lng: number
  name: string
  neighborhood?: string
  occs: Occ[]
}

// Same windows as the homepage chips, minus the 90-day one (too many pins).
const RANGES = [
  { key: 'today', label: 'Today' },
  { key: 'weekend', label: 'This weekend' },
  { key: '7', label: '7 days' },
  { key: '30', label: '30 days' },
]

// On desktop the list floats over the map's left edge, so anything we centre
// has to sit in the part of the map that's still showing.
const MAP_CENTER = latLng(32.3771, -86.3)
const PANEL_OFFSET_PX = 208
const panelOffset = () => (window.innerWidth >= 768 ? PANEL_OFFSET_PX : 0)

// A venue only earns a map key when it can actually be placed on the map.
const venueKey = (v?: EventDoc['venue']): string | null =>
  v && v.lat != null && v.lng != null ? (v._id ?? `${v.lat},${v.lng}`) : null

const directionsUrl = (lat: number, lng: number) =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`

// A dot, or a larger dot carrying the count when a venue hosts more than one
// occurrence in the window. iconSize stays fixed so state changes never
// re-anchor the pin; visual weight changes live in CSS.
const pinFor = (count: number, state: '' | 'on' | 'hover' | 'dim', flyer?: string) =>
  divIcon({
    className: '',
    // The visible dot sits centered inside a 40px transparent hit box so the
    // tap target clears the 40px Material/HIG minimum.
    html: flyer
      ? `<div class="wg-pin-hit"><img class="wg-pin wg-pin--flyer" src="${flyerThumbUrl(flyer)}" alt="" /></div>`
      : `<div class="wg-pin-hit"><div class="wg-pin${count > 1 ? ' wg-pin--many' : ''}${state ? ` wg-pin--${state}` : ''}">${
          count > 1 ? count : ''
        }</div></div>`,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -16],
  })

// Starts the city in the visible part of the map, not behind the panel.
// Computed from the fixed center so it's safe to run more than once.
function CenterBesidePanel() {
  const map = useMap()
  useEffect(() => {
    const zoom = map.getZoom()
    const shifted = map.project(MAP_CENTER, zoom).subtract([panelOffset(), 0])
    map.setView(map.unproject(shifted, zoom), zoom, { animate: false })
  }, [map])
  return null
}

export default function MapView({ events }: { events: EventDoc[] }) {
  const [now] = useState(() => new Date())
  const [range, setRange] = useState('7')
  const [venueFilter, setVenueFilter] = useState<{ key: string; name: string } | null>(null)
  const [selected, setSelected] = useState<string | null>(null)
  const [hovered, setHovered] = useState<{ key: string; flyer?: string } | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRefs = useRef<Record<string, LeafletMarker | null>>({})

  // Every occurrence in the window, in date order - recurring events land on
  // their actual next dates instead of appearing once with a stale date.
  const occurrences = useMemo<Occ[]>(() => {
    const { from, to } = listWindow(range, now)
    return events
      .flatMap(e => expandOccurrences(e, from, to).map(occursAt => ({ e, occursAt })))
      .sort((a, b) => a.occursAt.localeCompare(b.occursAt))
  }, [events, range, now])

  const venues = useMemo<VenueGroup[]>(() => {
    const byVenue = new Map<string, VenueGroup>()
    for (const o of occurrences) {
      const k = venueKey(o.e.venue)
      if (!k) continue
      const v = o.e.venue!
      const g = byVenue.get(k)
      if (g) g.occs.push(o)
      else
        byVenue.set(k, {
          key: k,
          lat: v.lat!,
          lng: v.lng!,
          name: v.name,
          neighborhood: v.neighborhood,
          occs: [o],
        })
    }
    return [...byVenue.values()]
  }, [occurrences])

  // The list: chronological, optionally narrowed to one venue by a pin click.
  // Events without coords stay IN the list (they just can't sync to the map).
  const listed = venueFilter ? occurrences.filter(o => venueKey(o.e.venue) === venueFilter.key) : occurrences

  const places = venueFilter ? 1 : venues.length
  const today = todayKey(now)
  const days: { key: string; name: string; date: string; occs: Occ[] }[] = []
  for (const o of listed) {
    const key = localDayKey(o.occursAt)
    const last = days[days.length - 1]
    if (last?.key === key) last.occs.push(o)
    else days.push({ key, ...dayParts(key, today), occs: [o] })
  }

  // Card → map: fly to the venue and open its popup. Never filters.
  const showOnMap = (key: string) => {
    const g = venues.find(v => v.key === key)
    if (!g) return
    setSelected(key)
    const m = mapRef.current
    if (m) {
      const zoom = Math.max(m.getZoom(), 14)
      const target = m.project(latLng(g.lat, g.lng), zoom).subtract([panelOffset(), 0])
      m.flyTo(m.unproject(target, zoom), zoom, { duration: 0.6 })
    }
    markerRefs.current[key]?.openPopup()
  }

  // Pin → list: narrow to that venue (its events are scattered through the
  // chronological list, so scrolling could only reach the first one).
  const filterToVenue = (g: VenueGroup) => {
    setSelected(g.key)
    setVenueFilter({ key: g.key, name: g.name })
  }

  const clearVenue = () => {
    setVenueFilter(null)
    setSelected(null)
  }

  const pinState = (key: string): '' | 'on' | 'hover' | 'dim' => {
    if (selected === key) return 'on'
    if (hovered?.key === key) return 'hover'
    if (venueFilter) return 'dim'
    return ''
  }

  return (
    <div className="md:relative md:h-[calc(100dvh-4rem)]">
      {/* Map - a band on top on phones, the whole stage on desktop. z-0 keeps
          leaflet's panes under the panel and any sticky chrome. */}
      <div className="wg-map-sheet relative z-0 h-[45dvh] md:absolute md:inset-0 md:h-auto">
        <MapContainer
          ref={mapRef}
          center={MAP_CENTER}
          zoom={12}
          className="h-full w-full"
          scrollWheelZoom
          zoomControl={false}
        >
          <CenterBesidePanel />
          <ZoomControl position="bottomright" />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {venues.map(g => {
            // The popup is the one place venue-grouping is natural: a compact
            // per-event digest (deduped - a weekly event shows once with its
            // next date, not four times).
            const seen = new Map<string, Occ>()
            for (const o of g.occs) if (!seen.has(o.e._id)) seen.set(o.e._id, o)
            const digest = [...seen.values()]
            return (
              <Marker
                key={g.key}
                position={[g.lat, g.lng]}
                icon={pinFor(g.occs.length, pinState(g.key), hovered?.key === g.key ? hovered.flyer : undefined)}
                zIndexOffset={hovered?.key === g.key ? 1000 : 0}
                ref={el => {
                  markerRefs.current[g.key] = el
                }}
                eventHandlers={{ click: () => filterToVenue(g) }}
              >
                <Popup>
                  <div className="wg-popup">
                    <strong>{g.name}</strong>
                    {g.neighborhood && <span className="wg-popup-hood">{g.neighborhood}</span>}
                    <ul>
                      {digest.slice(0, 4).map(o => (
                        <li key={o.e._id}>
                          <FlyerImage src={o.e.imageUrl} alt="" width={128} height={128} className="h-9 w-9 shrink-0 rounded-md object-cover object-top" />
                          <span className="min-w-0">
                            <Link href={`/events/${o.e.slug}`}>{o.e.title}</Link>
                            <span className="wg-popup-when">
                              {formatEventDateTime(o.occursAt)}
                              {o.e.recurrence?.frequency && ` · ${o.e.recurrence.frequency}`}
                            </span>
                          </span>
                        </li>
                      ))}
                    </ul>
                    {digest.length > 4 && <span className="wg-popup-more">{digest.length - 4} more in the list</span>}
                    <a href={directionsUrl(g.lat, g.lng)} target="_blank" rel="noopener noreferrer">
                      Directions
                    </a>
                  </div>
                </Popup>
              </Marker>
            )
          })}
        </MapContainer>
      </div>

      {/* List - a sheet over the bottom of the map on phones, a floating panel
          on desktop. */}
      <aside className="relative z-10 -mt-4 flex flex-col rounded-t-2xl bg-bg md:absolute md:bottom-4 md:left-4 md:top-4 md:mt-0 md:w-96 md:rounded-2xl md:border md:border-line md:shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <div className="sticky top-0 z-20 rounded-t-2xl border-b border-line bg-bg p-4 md:static">
          <p className="display text-2xl">Where it&apos;s happening</p>
          <p className="mt-1 text-sm text-dim">
            {listed.length} {listed.length === 1 ? 'event' : 'events'} at {places}{' '}
            {places === 1 ? 'place' : 'places'}
          </p>
          <div className="seg mt-3" role="group" aria-label="Date range">
            {RANGES.map(r => (
              <button key={r.key} type="button" aria-pressed={range === r.key} onClick={() => setRange(r.key)} className="seg-item max-md:flex-1 max-md:justify-center">
                {r.label}
              </button>
            ))}
          </div>
          {venueFilter && (
            <button type="button" onClick={clearVenue} className="btn btn-sm mt-2 w-full !justify-between">
              <span className="truncate">{venueFilter.name}</span>
              <CloseIcon width={16} height={16} className="shrink-0" />
              <span className="sr-only">Show all venues</span>
            </button>
          )}
        </div>

        <div className="px-4 pb-4 md:min-h-0 md:flex-1 md:overflow-y-auto md:[scrollbar-width:thin]">
          {days.map(day => (
            <section key={day.key} aria-label={`${day.name}, ${day.date}`} className="mt-4">
              <h2 className="day-head z-10 flex items-baseline gap-2 py-1 md:sticky md:top-0">
                <span className="display text-xl">{day.name}</span>
                <span className="text-sm text-dim">{day.date}</span>
              </h2>
              <div className="mt-1">
                {day.occs.map(o => {
                  const v = o.e.venue
                  const k = venueKey(v)
                  const isFree = /^free$/i.test((o.e.priceText ?? '').trim())
                  const on = k !== null && selected === k && !venueFilter
                  const meta = [
                    formatEventTime(o.occursAt),
                    v?.name ?? 'Venue TBA',
                    v && !k && 'not on the map yet',
                    !isFree && o.e.priceText,
                  ].filter(Boolean).join(' · ')
                  return (
                    <article
                      key={`${o.e._id}-${o.occursAt}`}
                      onMouseEnter={() => k && setHovered({ key: k, flyer: o.e.imageUrl })}
                      onMouseLeave={() => setHovered(null)}
                      className={`relative isolate -mx-2 flex items-center gap-3 rounded-lg px-2 py-2 transition-colors ${
                        on ? 'bg-raised' : k ? 'hover:bg-raised' : ''
                      }`}
                    >
                      {/* Stretched button: any click on the row pans the map to
                          this venue. The title link sits above it at z-10 and
                          keeps its own navigation. */}
                      {k && (
                        <button
                          type="button"
                          aria-label={`Show ${v!.name} on the map`}
                          onClick={() => showOnMap(k)}
                          className="absolute inset-0 z-0 cursor-pointer rounded-lg"
                        />
                      )}
                      <FlyerImage
                        src={o.e.imageUrl}
                        alt=""
                        width={128}
                        height={128}
                        className="h-11 w-11 shrink-0 rounded-lg object-cover object-top ring-1 ring-line"
                      />
                      <div className="min-w-0">
                        <h3 className="line-clamp-2 font-medium leading-6">
                          <Link href={`/events/${o.e.slug}`} className="relative z-10 hover:underline">
                            {o.e.title}
                          </Link>
                        </h3>
                        <p className="flex gap-2 text-sm leading-5 text-dim">
                          {isFree && <span className="shrink-0 font-medium text-accent">Free</span>}
                          <span className="min-w-0 truncate tabular-nums">{meta}</span>
                        </p>
                      </div>
                    </article>
                  )
                })}
              </div>
            </section>
          ))}

          {listed.length === 0 && (
            <div className="py-6 text-dim">
              {venueFilter ? (
                <p>
                  Nothing at {venueFilter.name} in this window.{' '}
                  <button type="button" onClick={clearVenue} className="link cursor-pointer text-ink">See everywhere</button>
                </p>
              ) : range !== '30' ? (
                <p>
                  Nothing on the map for these dates.{' '}
                  <button type="button" onClick={() => setRange('30')} className="link cursor-pointer text-ink">Try the next 30 days</button>
                </p>
              ) : (
                <p>Nothing on the books for the next month</p>
              )}
            </div>
          )}
        </div>
      </aside>
    </div>
  )
}
