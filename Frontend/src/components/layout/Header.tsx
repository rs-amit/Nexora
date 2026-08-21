import type { MouseEventHandler, ReactNode } from 'react'
import { Bell, ChevronRight, Search } from 'lucide-react'
import logo from "../../assets/logo.png"

export interface HeaderLogo {
  name: string
  icon?: ReactNode
  href?: string
}

export interface Breadcrumb {
  label: string
  href?: string
}

export interface HeaderUser {
  name?: string
  initials?: string
  imageUrl?: string
}

export interface HeaderProps {
  logo?: HeaderLogo
  breadcrumbs?: Breadcrumb[]
  notificationCount?: number
  user?: HeaderUser
  onSearchClick?: MouseEventHandler<HTMLButtonElement>
  onNotificationsClick?: MouseEventHandler<HTMLButtonElement>
  onUserClick?: MouseEventHandler<HTMLButtonElement>
  /** Extra ReactNode(s) rendered before the icon cluster (e.g. a "Create" button) */
  actions?: ReactNode
  sticky?: boolean
  className?: string
}

/**
 * Header
 * ------
 * Reusable top navigation bar for dashboard-style apps.
 *
 * It is intentionally "dumb": it renders whatever data you pass it and
 * calls the callbacks you give it. Drop it into any page — or into
 * <DashboardLayout /> — and configure it per-page via props instead of
 * duplicating markup.
 *
 * Usage:
 *   <Header
 *     logo={{ name: 'Nexora' }}
 *     breadcrumbs={[{ label: 'Home', href: '/' }, { label: 'Dashboard' }]}
 *     notificationCount={2}
 *     user={{ name: 'Alex Rivera', initials: 'A' }}
 *     onSearchClick={() => setSearchOpen(true)}
 *     onNotificationsClick={() => setNotifOpen(true)}
 *     onUserClick={() => setMenuOpen(true)}
 *   />
 */
export default function Header({

  breadcrumbs = [],
  notificationCount = 0,
  user,
  onSearchClick,
  onNotificationsClick,
  onUserClick,
  actions,
  sticky = true,
  className = '',
}: HeaderProps) {
  return (
    <header
      className={[
        sticky ? 'sticky top-0 z-30' : '',
        'flex h-16 w-full items-center justify-between gap-4',
        'border-surface-border bg-surface-base/95 px-4 backdrop-blur',
        'sm:px-6',
        className,
      ].join(' ')}
    >
      {/* Left: logo + breadcrumbs */}
      <div className="flex min-w-0 items-center gap-3">

        <div className='w-[100%] max-w-[45px]'>
          <img src={logo} alt="" />
        </div>
        
        {breadcrumbs.length > 0 && (
          <nav aria-label="Breadcrumb" className="hidden min-w-0 items-center gap-1.5 sm:flex">
            {breadcrumbs.map((crumb, i) => {
              const isLast = i === breadcrumbs.length - 1
              return (
                <span key={crumb.label} className="flex items-center gap-1.5 truncate">
                  <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-600" />
                  {crumb.href && !isLast ? (
                    <a
                      href={crumb.href}
                      className="truncate text-sm text-gray-400 hover:text-gray-200"
                    >
                      {crumb.label}
                    </a>
                  ) : (
                    <span
                      className={[
                        'truncate text-sm',
                        isLast ? 'font-medium text-accent' : 'text-gray-400',
                      ].join(' ')}
                    >
                      {crumb.label}
                    </span>
                  )}
                </span>
              )
            })}
          </nav>
        )}
        
      </div>

      {/* Right: page-specific actions + notifications + search + avatar */}
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        {actions}

        <button
          type="button"
          onClick={onSearchClick}
          aria-label="Search"
          className="grid h-9 w-9 place-items-center rounded-lg text-gray-400 hover:bg-surface-raised hover:text-gray-100"
        >
          <Search className="h-[18px] w-[18px]" />
        </button>

        <button
          type="button"
          onClick={onNotificationsClick}
          aria-label="Notifications"
          className="relative grid h-9 w-9 place-items-center rounded-lg text-gray-400 hover:bg-surface-raised hover:text-gray-100"
        >
          <Bell className="h-[18px] w-[18px]" />
          {notificationCount > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-accent ring-2 ring-surface-base" />
          )}
        </button>

        {user && (
          <button
            type="button"
            onClick={onUserClick}
            aria-label={user.name ? `Account: ${user.name}` : 'Account'}
            className="ml-1 grid h-9 w-9 place-items-center overflow-hidden rounded-full bg-surface-raised text-sm font-medium text-gray-100 ring-1 ring-surface-border hover:ring-accent"
          >
            {user.imageUrl ? (
              <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              user.initials ?? user.name?.[0] ?? '?'
            )}
          </button>
        )}
      </div>
    </header>
  )
}
