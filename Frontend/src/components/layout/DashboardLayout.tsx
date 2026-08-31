import { isValidElement, type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import Header, { type HeaderProps } from './Header';
import { getCurrentUser } from '../../lib/currentUser';
import { logout } from '../../service/auth.service';

export interface DashboardLayoutProps {
  header?: HeaderProps | ReactElement;
  fullBleed?: boolean;
  contentClassName?: string;
  className?: string;
}

export default function DashboardLayout({
  header,
  fullBleed = false,
  contentClassName = '',
  className = '',
}: DashboardLayoutProps) {
  const currentUser = getCurrentUser();

  const defaultHeaderProps: HeaderProps = {
    user: currentUser
      ? { name: currentUser.name, initials: currentUser.name?.[0]?.toUpperCase() }
      : undefined,
    userMenuItems: [
      { label: 'Logout', icon: <LogOut size={15} />, danger: true, onClick: () => { logout(); } },
    ],
  };

  return (
    <div
      className={[
        'flex h-dvh w-full flex-col overflow-hidden bg-surface-canvas',
        className,
      ].join(' ')}
    >
      <div className="shrink-0">
        {isValidElement(header) ? (
          header
        ) : (
          <Header {...defaultHeaderProps} {...(header as HeaderProps)} />
        )}
      </div>

      <main
        className={[
          'min-h-0 flex-1 overflow-hidden',
          fullBleed
            ? ''
            : 'mx-auto w-full max-w-7xl',
          contentClassName,
        ].join(' ')}
      >
        <Outlet />
      </main>
    </div>
  );
}