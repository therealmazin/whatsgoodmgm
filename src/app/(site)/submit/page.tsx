'use client'
import { useActionState } from 'react'
import { submitEvent, type SubmitState } from './actions'

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      {hint && <span className="ml-2 text-sm text-dim">{hint}</span>}
      <span className="mt-1 block">{children}</span>
    </label>
  )
}

export default function SubmitPage() {
  const [state, action, pending] = useActionState<SubmitState, FormData>(submitEvent, null)
  return (
    <div className="wrap max-w-xl pt-8 md:pt-12">
      <h1 className="display text-4xl md:text-5xl">Got something good?</h1>
      <p className="mt-3 leading-7 text-dim">
        Tell us about an event, or give us an account to follow. Either one is enough. A person reviews
        everything before it goes up.
      </p>
      <form action={action} className="mt-8">
        <fieldset className="space-y-4">
          <legend className="display mb-4 w-full text-xl">An event</legend>
          <Field label="Title"><input name="eventTitle" className="field" /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label="When"><input name="eventDate" placeholder="Sat July 18, 7pm" className="field" /></Field>
            <Field label="Where"><input name="eventVenueText" placeholder="Venue or address" className="field" /></Field>
          </div>
          <Field label="Link"><input name="eventUrl" type="url" placeholder="Tickets, Facebook event, flyer" className="field" /></Field>
          <Field label="What's good about it?"><textarea name="eventDescription" rows={3} className="field" /></Field>
        </fieldset>
        <div className="mt-8 border-t border-line pt-8">
        <fieldset className="space-y-4">
          <legend className="display mb-4 w-full text-xl">An account</legend>
          <div className="grid grid-cols-[minmax(0,1fr)_8.5rem] gap-3">
            <Field label="Handle"><input name="handle" placeholder="@yourhandle" className="field" /></Field>
            <Field label="Platform">
              <select name="platform" className="field">
                <option value="instagram">Instagram</option><option value="tiktok">TikTok</option>
                <option value="facebook">Facebook</option><option value="other">Other</option>
              </select>
            </Field>
          </div>
        </fieldset>
        </div>
        <div className="mt-8 border-t border-line pt-8">
          <Field label="Your email" hint="Optional, in case we have questions">
            <input name="submitterEmail" type="email" className="field" />
          </Field>
        </div>
        <input name="website" className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />
        {state && (
          <p role="status" className={`mt-4 rounded-lg bg-raised p-3 ${state.ok ? '' : 'text-accent'}`}>
            {state.message}
          </p>
        )}
        <button disabled={pending} className="btn btn-primary mt-4">
          {pending ? 'Sending…' : 'Send it'}
        </button>
      </form>
      <p className="mt-6 text-dim">
        Prefer email?{' '}
        <a href="mailto:info@mmintelligence.ai" className="link text-ink">info@mmintelligence.ai</a>
      </p>
    </div>
  )
}
