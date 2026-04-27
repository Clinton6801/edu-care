'use client'

import { useSidebar } from './Sidebar'

interface TopbarProps {
  title: string
  subtitle?: string
  actions?: React.ReactNode
}

export function Topbar({ title, subtitle, actions }: TopbarProps) {
  const { setOpen } = useSidebar()

  return (
    <header className="flex items-center gap-3 px-4 sm:px-8 py-4 sm:py-5 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur sticky top-0 z-10">
      {/* Hamburger — mobile only */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden flex-shrink-0 text-zinc-400 hover:text-white transition p-1.5 rounded-lg hover:bg-zinc-800"
        aria-label="Open menu"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Title block */}
      <div className="flex-1 min-w-0">
        <h1 className="text-base sm:text-xl font-bold text-white truncate">{title}</h1>
        {subtitle && (
          <p className="text-xs sm:text-sm text-zinc-500 mt-0.5 truncate">{subtitle}</p>
        )}
      </div>

      {/* Actions */}
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">{actions}</div>
      )}
    </header>
  )
}
