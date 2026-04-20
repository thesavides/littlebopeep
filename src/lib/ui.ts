/**
 * Little Bo Peep — Design system tokens
 *
 * All common Tailwind class strings live here so they can be updated in one
 * place and remain consistent across every component.
 */

// ─── Colour palette ──────────────────────────────────────────────────────────

export const colors = {
  primary: 'green',     // Walker / nature
  secondary: 'blue',    // Farmer / management
  danger: 'red',
  warning: 'amber',
  neutral: 'slate',
} as const

// ─── Button variants ─────────────────────────────────────────────────────────

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40'

export const btn = {
  /** Full-width large primary — main CTA */
  primary:
    `${base} w-full py-4 bg-green-600 text-white hover:bg-green-700 focus:ring-green-500 shadow-sm`,

  /** Full-width secondary — farmer / blue actions */
  secondary:
    `${base} w-full py-4 bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm`,

  /** Full-width ghost — back / cancel */
  ghost:
    `${base} w-full py-3 bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400`,

  /** Full-width destructive — delete / logout */
  danger:
    `${base} w-full py-3 bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400`,

  /** Inline small — table actions, secondary links */
  sm:
    `${base} px-3 py-1.5 text-sm bg-slate-100 text-slate-700 hover:bg-slate-200 focus:ring-slate-400`,

  /** Inline small primary */
  smPrimary:
    `${base} px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 focus:ring-green-500`,

  /** Inline small danger */
  smDanger:
    `${base} px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400`,

  /** Outline — secondary pill actions */
  outline:
    `${base} px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 focus:ring-slate-400`,
} as const

// ─── Form inputs ─────────────────────────────────────────────────────────────

export const input =
  'w-full px-4 py-3 border border-slate-300 rounded-xl text-slate-800 placeholder:text-slate-400 ' +
  'focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'

export const label = 'block text-sm font-medium text-slate-700 mb-1'

export const errorText = 'text-sm text-red-600 mt-1'

export const helpText = 'text-xs text-slate-500 mt-1'

// ─── Cards ───────────────────────────────────────────────────────────────────

export const card = 'bg-white rounded-2xl shadow border border-slate-100'

export const cardPadded = `${card} p-4`

// ─── Typography ──────────────────────────────────────────────────────────────

export const text = {
  h1: 'text-3xl font-bold text-slate-800',
  h2: 'text-xl font-bold text-slate-800',
  h3: 'text-lg font-semibold text-slate-800',
  h4: 'text-base font-semibold text-slate-700',
  body: 'text-sm text-slate-600',
  small: 'text-xs text-slate-500',
  label: 'text-sm font-medium text-slate-700',
} as const

// ─── Status badges ───────────────────────────────────────────────────────────

export const badge = {
  reported: 'px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700',
  claimed:  'px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700',
  resolved: 'px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700',
  complete: 'px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600',
  escalated:'px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700',
} as const

// ─── Layout helpers ──────────────────────────────────────────────────────────

/** Standard page gutter + bottom pad for BottomNav */
export const pageMain = 'max-w-4xl mx-auto px-4 py-6 pb-28'

/** Stack of form fields / action buttons */
export const stack = 'space-y-3'
