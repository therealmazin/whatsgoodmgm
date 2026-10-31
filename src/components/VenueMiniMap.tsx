'use client'
import 'leaflet/dist/leaflet.css'
import { MapContainer, TileLayer, Marker } from 'react-leaflet'
import { divIcon } from 'leaflet'
import { useMemo } from 'react'

/**
 * A small, near-static locator map for a single venue on the event detail
 * page, using the big map's pin and tile treatment. Interaction is switched
 * off - this is a "here's the spot" glance, not a tool: no drag, no wheel
 * zoom, no controls.
 */
export default function VenueMiniMap({
  lat,
  lng,
  name,
}: {
  lat: number
  lng: number
  name: string
}) {
  const icon = useMemo(
    () =>
      divIcon({
        className: '',
        html: '<div class="wg-pin-hit"><div class="wg-pin wg-pin--on"></div></div>',
        iconSize: [40, 40],
        iconAnchor: [20, 20],
      }),
    [],
  )

  return (
    <MapContainer
      center={[lat, lng]}
      zoom={15}
      className="h-56 w-full"
      dragging={false}
      scrollWheelZoom={false}
      doubleClickZoom={false}
      touchZoom={false}
      boxZoom={false}
      keyboard={false}
      zoomControl={false}
      attributionControl={false}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Marker position={[lat, lng]} icon={icon} title={name} />
    </MapContainer>
  )
}
