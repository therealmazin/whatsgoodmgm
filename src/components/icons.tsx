import type { SVGProps } from 'react'
import type { BrandIconName } from '@/lib/events/links'

// One set, one size, one stroke. Icons take the colour of their text.
function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      aria-hidden="true"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {children}
    </svg>
  )
}

type Props = SVGProps<SVGSVGElement>

// The two halves of the logo, used to split each day.
export const CoffeeIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M10 2v2M14 2v2M6 2v2" />
    <path d="M16 8a1 1 0 0 1 1 1v8a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V9a1 1 0 0 1 1-1h14a4 4 0 1 1 0 8h-1" />
  </Icon>
)
export const MartiniIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M8 22h8M12 11v11" />
    <path d="m19 3-7 8-7-8Z" />
  </Icon>
)

export const SearchIcon = (p: Props) => (
  <Icon {...p}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-4-4" />
  </Icon>
)
export const CloseIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M18 6 6 18M6 6l12 12" />
  </Icon>
)
export const BackIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m12 19-7-7 7-7M19 12H5" />
  </Icon>
)
export const ChevronLeftIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m15 18-6-6 6-6" />
  </Icon>
)
export const ChevronRightIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m9 18 6-6-6-6" />
  </Icon>
)
export const ChevronDownIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
)
export const PinIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </Icon>
)
export const CalendarPlusIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M8 2v4M16 2v4M3 10h18M12 14v4M10 16h4" />
    <rect x="3" y="4" width="18" height="18" rx="2" />
  </Icon>
)
export const NavigationIcon = (p: Props) => (
  <Icon {...p}>
    <path d="m3 11 19-9-9 19-2-8-8-2Z" />
  </Icon>
)
export const TicketIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2ZM13 5v2M13 17v2M13 11v2" />
  </Icon>
)
const DownloadIcon = (p: Props) => (
  <Icon {...p}>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
  </Icon>
)

// Marks people already recognise, so a menu reads at a glance. They keep their
// own colours, the one exception to icons following their text.
const brand = { 'aria-hidden': true, width: 18, height: 18, viewBox: '0 0 24 24' }

export function BrandIcon({ name }: { name: BrandIconName }) {
  switch (name) {
    case 'google':
      return (
        <svg {...brand} fill="#4285F4">
          <path d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
        </svg>
      )
    case 'apple':
      return (
        <svg {...brand} fill="currentColor">
          <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701" />
        </svg>
      )
    case 'outlook':
      return (
        <svg {...brand} viewBox="0 0 32 32" fill="currentColor" className="brand-outlook">
          <path d="M19.484 7.937v5.477l1.916 1.205a.5.5 0 0 0 .21 0l8.238-5.554a1.174 1.174 0 0 0-.959-1.128Z" />
          <path d="m19.484 15.457 1.747 1.2a.52.52 0 0 0 .543 0c-.3.181 8.073-5.378 8.073-5.378v10.066a1.408 1.408 0 0 1-1.49 1.555h-8.874zm-9.044-2.525a1.61 1.61 0 0 0-1.42.838 4.13 4.13 0 0 0-.526 2.218A4.05 4.05 0 0 0 9.02 18.2a1.6 1.6 0 0 0 2.771.022 4 4 0 0 0 .515-2.2 4.37 4.37 0 0 0-.5-2.281 1.54 1.54 0 0 0-1.366-.809" />
          <path d="M2.153 5.155v21.427L18.453 30V2Zm10.908 14.336a3.23 3.23 0 0 1-2.7 1.361 3.19 3.19 0 0 1-2.64-1.318A5.46 5.46 0 0 1 6.706 16.1a5.87 5.87 0 0 1 1.036-3.616 3.27 3.27 0 0 1 2.744-1.384 3.12 3.12 0 0 1 2.61 1.321 5.64 5.64 0 0 1 1 3.484 5.76 5.76 0 0 1-1.035 3.586" />
        </svg>
      )
    case 'waze':
      return <NavigationIcon style={{ color: '#1EA5D9' }} />
    case 'download':
      return <DownloadIcon />
  }
}
