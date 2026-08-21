import type { ReactNode } from 'react'
import { Outlet } from 'react-router-dom'
import logo from "../../assets/logo.png"

export interface AuthLayoutProps {
  /** The auth form / card itself (e.g. a <LoginCard />, <SignUpCard />) */
  children?: ReactNode
  /** Optional content rendered above the card — typically a logo/brand mark */
  logo?: ReactNode
  /** Optional content rendered below the card — legal links, "© 2026 Nexora", etc. */
  footer?: ReactNode
  /** Width of the centered column. Defaults to 'md'. */
  maxWidth?: 'sm' | 'md' | 'lg'
  className?: string
  contentClassName?: string
}

const MAX_WIDTH: Record<NonNullable<AuthLayoutProps['maxWidth']>, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
}

/**
 * AuthLayout
 * -----------
 * Body-only page shell for unauthenticated flows (sign in, sign up, forgot
 * password, invite-accept, etc). Unlike <DashboardLayout>, it renders no
 * <Header /> — there's no logged-in nav, breadcrumb, or account menu to show
 * before a user has signed in. It just centers whatever card you give it on
 * the page background.
 *
 * Usage:
 *   <AuthLayout logo={<Logo />} footer={<p>© 2026 Nexora</p>}>
 *     <LoginCard />
 *   </AuthLayout>
 *
 * Every auth screen (LoginPage, SignUpPage, ForgotPasswordPage, ...) wraps
 * its form in this same layout and only swaps out `children`.
 */
export default function AuthLayout({
  children,
  footer,
  maxWidth = 'md',
  className = '',
  contentClassName = '',
}: AuthLayoutProps) {
  return (
    <div
      className={[
        'relative flex min-h-screen w-full items-center justify-center overflow-hidden',
        'bg-surface-canvas px-4 py-10 sm:px-6',
        className,
      ].join(' ')}
    >
      {/* Soft decorative glow — purely cosmetic, safe to delete */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute left-1/2 top-[-10%] h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-accent/20 blur-[120px]" />
      </div>

      <div className={['flex w-full flex-col items-center', MAX_WIDTH[maxWidth]].join(' ')}>
        <div className="mb-12 max-w-[120px]">
          <img src={logo} alt="" />
        </div>

        <div className={['w-full max-w-[300px]', contentClassName].join(' ')}>{children ?? <Outlet />}</div>

        {footer && <div className="mt-8 text-center text-sm text-gray-400">{footer}</div>}
      </div>
    </div>
  )
}
