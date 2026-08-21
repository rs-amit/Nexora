import { isValidElement, type ReactElement } from 'react';
import { Outlet } from 'react-router-dom';
import Header, { type HeaderProps } from './Header';

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
          <Header {...(header as HeaderProps)} />
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