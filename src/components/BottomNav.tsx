'use client'

import type { ReactNode } from 'react'

export interface NavItem {
  id: string
  label: string
  icon: ReactNode
  onClick: () => void
  active?: boolean
  badge?: number
}

interface BottomNavProps {
  items: NavItem[]
  /** Optional center FAB (floating action button) */
  fab?: {
    label: string
    icon: ReactNode
    onClick: () => void
  }
}

export default function BottomNav({ items, fab }: BottomNavProps) {
  // Split items around the FAB slot if a fab is provided
  const leftItems = fab ? items.slice(0, Math.floor(items.length / 2)) : items
  const rightItems = fab ? items.slice(Math.floor(items.length / 2)) : []

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 safe-area-pb">
      <div className="flex items-end justify-around max-w-lg mx-auto px-2">
        {/* Left items */}
        {leftItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}

        {/* Centre FAB */}
        {fab && (
          <div className="flex flex-col items-center -mt-4 mb-1">
            <button
              onClick={fab.onClick}
              aria-label={fab.label}
              className="w-16 h-16 rounded-full bg-green-600 text-white shadow-lg flex items-center justify-center hover:bg-green-700 active:scale-95 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              {fab.icon}
            </button>
            <span className="text-[10px] text-slate-500 mt-1">{fab.label}</span>
          </div>
        )}

        {/* Right items */}
        {rightItems.map((item) => (
          <NavButton key={item.id} item={item} />
        ))}
      </div>
    </nav>
  )
}

function NavButton({ item }: { item: NavItem }) {
  return (
    <button
      onClick={item.onClick}
      aria-label={item.label}
      className={`relative flex flex-col items-center gap-0.5 py-2 px-3 min-w-[56px] focus:outline-none ${
        item.active ? 'text-green-600' : 'text-slate-400 hover:text-slate-600'
      }`}
    >
      <span className="text-xl leading-none">{item.icon}</span>
      <span className="text-[10px] font-medium leading-none">{item.label}</span>
      {!!item.badge && item.badge > 0 && (
        <span className="absolute top-1.5 right-2.5 min-w-[16px] h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
          {item.badge > 99 ? '99+' : item.badge}
        </span>
      )}
    </button>
  )
}
