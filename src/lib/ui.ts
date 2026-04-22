/**
 * Little Bo Peep — Design system tokens
 *
 * Brand palette:
 *   Plum      #614270  Primary / headings / active
 *   Sage      #92998B  Secondary text / borders
 *   LightSage #D1D9C5  Background fills
 *   SoftBlue  #7D8DCC  Primary actions / CTA / links
 *   Green     #9ED663  Success
 *   Yellow    #EADA69  Warning
 *   Teal      #63BD8F  Positive / active states
 *   Orange    #FA9335  Alert / danger
 */

// ─── Colour palette ──────────────────────────────────────────────────────────

export const colors = {
  primary:   'brand-soft-blue',
  secondary: 'brand-plum',
  danger:    'brand-orange',
  warning:   'brand-yellow',
  success:   'brand-green',
  neutral:   'brand-sage',
} as const

// ─── Button variants ─────────────────────────────────────────────────────────

const base =
  'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-40'

export const btn = {
  /** Full-width large primary CTA — Soft Blue */
  primary:
    `${base} w-full py-4 bg-[#7D8DCC] text-white hover:bg-[#6b7bb8] focus:ring-[#7D8DCC] shadow-sm`,

  /** Full-width secondary — Plum outline */
  secondary:
    `${base} w-full py-4 border-2 border-[#614270] text-[#614270] bg-white hover:bg-[#614270] hover:text-white focus:ring-[#614270]`,

  /** Full-width ghost — back / cancel */
  ghost:
    `${base} w-full py-3 bg-[#D1D9C5] text-[#614270] hover:bg-[#c4ceba] focus:ring-[#92998B]`,

  /** Full-width destructive — delete / logout */
  danger:
    `${base} w-full py-3 bg-[#FA9335]/10 text-[#FA9335] hover:bg-[#FA9335]/20 focus:ring-[#FA9335]`,

  /** Inline small — table actions, secondary links */
  sm:
    `${base} px-3 py-1.5 text-sm bg-[#D1D9C5] text-[#614270] hover:bg-[#c4ceba] focus:ring-[#92998B]`,

  /** Inline small primary */
  smPrimary:
    `${base} px-3 py-1.5 text-sm bg-[#7D8DCC] text-white hover:bg-[#6b7bb8] focus:ring-[#7D8DCC]`,

  /** Inline small danger */
  smDanger:
    `${base} px-3 py-1.5 text-sm bg-[#FA9335]/10 text-[#FA9335] hover:bg-[#FA9335]/20 focus:ring-[#FA9335]`,

  /** Outline — secondary pill actions */
  outline:
    `${base} px-4 py-2 border border-[#92998B] text-[#614270] bg-white hover:bg-[#D1D9C5] focus:ring-[#92998B]`,
} as const

// ─── Form inputs ─────────────────────────────────────────────────────────────

export const input =
  'w-full px-4 py-3 border border-[#92998B] rounded-xl text-[#614270] placeholder:text-[#92998B] bg-white ' +
  'focus:outline-none focus:ring-2 focus:ring-[#7D8DCC] focus:border-transparent'

export const label = 'block text-sm font-medium text-[#614270] mb-1'

export const errorText = 'text-sm text-[#FA9335] mt-1'

export const helpText = 'text-xs text-[#92998B] mt-1'

// ─── Cards ───────────────────────────────────────────────────────────────────

export const card = 'bg-white rounded-2xl shadow-sm border border-[#D1D9C5]'

export const cardPadded = `${card} p-4`

// ─── Typography ──────────────────────────────────────────────────────────────

export const text = {
  h1: 'text-3xl font-bold text-[#614270] font-serif',
  h2: 'text-xl font-bold text-[#614270] font-serif',
  h3: 'text-lg font-semibold text-[#614270]',
  h4: 'text-base font-semibold text-[#614270]',
  body: 'text-sm text-[#92998B]',
  small: 'text-xs text-[#92998B]',
  label: 'text-sm font-medium text-[#614270]',
} as const

// ─── Status badges ───────────────────────────────────────────────────────────

export const badge = {
  reported: 'px-2 py-0.5 rounded-full text-xs font-medium bg-[#EADA69]/20 text-[#8a7a00]',
  claimed:  'px-2 py-0.5 rounded-full text-xs font-medium bg-[#7D8DCC]/15 text-[#5a6db8]',
  resolved: 'px-2 py-0.5 rounded-full text-xs font-medium bg-[#9ED663]/20 text-[#5a8a1a]',
  complete: 'px-2 py-0.5 rounded-full text-xs font-medium bg-[#D1D9C5] text-[#92998B]',
  escalated:'px-2 py-0.5 rounded-full text-xs font-medium bg-[#FA9335]/15 text-[#c96a00]',
} as const

// ─── Layout helpers ──────────────────────────────────────────────────────────

/** Standard page gutter + bottom pad for BottomNav */
export const pageMain = 'max-w-4xl mx-auto px-4 py-6 pb-28'

/** Stack of form fields / action buttons */
export const stack = 'space-y-3'
