'use client'
import { useCallback, useEffect, useRef, useState, type FocusEvent, type KeyboardEvent, type ReactNode } from 'react'
import { ChevronDownIcon } from '@/components/icons'

// Matches the phone rules for .menu in globals.css.
const SHEET_QUERY = '(width < 48rem)'

/**
 * A labelled button that opens a panel: a floating menu on desktop, a bottom
 * sheet on phones (see .menu in globals.css). The panel holds ordinary links
 * or buttons in tab order. On desktop it closes when focus leaves; a sheet is
 * modal, so focus stays inside until it's dismissed. Picking something or
 * pressing Escape returns focus to the button, so nobody loses their place.
 *
 * Don't put a z-index on this or an ancestor: it would trap the phone sheet in
 * that layer, underneath anything fixed like the event page's action bar.
 */
export function Dropdown({ label, title, align = 'left', active, className = '', rootClassName = '', children }: {
  label: ReactNode
  title: string // names the panel, and heads the sheet on phones
  align?: 'left' | 'right'
  active?: boolean // the control is doing something, so show it
  className?: string
  rootClassName?: string
  children: (close: () => void) => ReactNode
}) {
  const [open, setOpen] = useState(false)
  const [sheet, setSheet] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  const [closes, setCloses] = useState(0)

  const close = useCallback(() => {
    setOpen(false)
    setCloses(n => n + 1)
  }, [])

  // Runs after the panel is gone, once the focused row no longer exists.
  useEffect(() => {
    if (closes > 0) buttonRef.current?.focus()
  }, [closes])

  function toggle() {
    if (open) return close()
    setSheet(window.matchMedia(SHEET_QUERY).matches)
    setOpen(true)
  }

  useEffect(() => {
    if (!open) return
    function onPointerDown(e: PointerEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    function onKeyDown(e: globalThis.KeyboardEvent) {
      if (e.key === 'Escape') close()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open, close])

  useEffect(() => {
    if (!open) return
    if (sheet) panelRef.current?.focus()
    else panelRef.current?.scrollIntoView({ block: 'nearest' })
  }, [open, sheet])

  function onBlur(e: FocusEvent<HTMLDivElement>) {
    const next = e.relatedTarget
    if (open && !sheet && next instanceof Node && !rootRef.current?.contains(next)) setOpen(false)
  }

  // Tab wraps around inside a sheet instead of reaching the page behind it.
  function onPanelKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const panel = panelRef.current
    if (!sheet || e.key !== 'Tab' || !panel) return
    const items = [...panel.querySelectorAll<HTMLElement>('a[href], button:not(:disabled)')]
    const first = items[0]
    const last = items[items.length - 1]
    const active = document.activeElement
    if (e.shiftKey && (active === first || active === panel)) {
      e.preventDefault()
      last?.focus()
    } else if (!e.shiftKey && active === last) {
      e.preventDefault()
      first?.focus()
    }
  }

  return (
    <div ref={rootRef} onBlur={onBlur} className={`relative shrink-0 ${rootClassName}`}>
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        data-active={active ? 'true' : undefined}
        onClick={toggle}
        className={`btn btn-sm ${className}`}
      >
        {label}
        <ChevronDownIcon width={16} height={16} className={`shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <>
          <div aria-hidden="true" className="menu-backdrop" onClick={close} />
          <div
            ref={panelRef}
            role={sheet ? 'dialog' : 'group'}
            aria-modal={sheet || undefined}
            aria-label={title}
            tabIndex={-1}
            onKeyDown={onPanelKeyDown}
            className={`menu ${align === 'right' ? 'menu-right' : ''}`}
          >
            <p className="menu-title">{title}</p>
            {children(close)}
          </div>
        </>
      )}
    </div>
  )
}
