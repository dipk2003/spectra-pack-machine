'use client';

import type { Session } from 'next-auth';
import { SessionProvider, signOut, useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  Activity,
  CalendarDays,
  Download,
  FileText,
  LayoutDashboard,
  LayoutGrid,
  LogOut,
  Menu,
  Package,
  Users,
} from 'lucide-react';
import { COMPANY_INFO } from '@/lib/data';
import styles from './layout.module.css';

type AdminShellProps = {
  children: React.ReactNode;
  session: Session | null;
  canAccessDeveloper: boolean;
};

function AdminShellInner({
  children,
  canAccessDeveloper,
}: Omit<AdminShellProps, 'session'>) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleSignOut = async () => {
    setSidebarOpen(false);
    if (canAccessDeveloper) {
      await fetch('/api/admin/developer/pin', {
        method: 'DELETE',
        credentials: 'same-origin',
      }).catch(() => undefined);
    }
    await signOut({ redirect: false });
    window.location.assign('/admin/login');
  };

  useEffect(() => {
    if (pathname === '/admin/login' || pathname === '/admin/login/') return;

    if (status === 'unauthenticated') {
      window.location.assign('/admin/login');
    }
  }, [pathname, status]);

  const hiddenSiteChrome = (
    <style jsx global>{`
      #site-navbar,
      #site-footer,
      #site-whatsapp,
      #site-chat-widget {
        display: none !important;
      }
    `}</style>
  );

  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return <>{hiddenSiteChrome}{children}</>;
  }

  if (status === 'loading') {
    return <div className={styles.loading}>Loading secure admin…</div>;
  }

  const isNavItemActive = (href: string) =>
    href === '/admin'
      ? pathname === href
      : pathname === href || pathname.startsWith(`${href}/`);

  const adminName = session?.user?.name || 'Admin';
  const adminEmail = session?.user?.email || 'Authenticated admin';
  const navItems = [
    { href: '/admin', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
    { href: '/admin/leads', icon: <Users size={20} />, label: 'Leads' },
    { href: '/admin/meetings', icon: <CalendarDays size={20} />, label: 'Meetings' },
    { href: '/admin/categories', icon: <LayoutGrid size={20} />, label: 'Categories' },
    { href: '/admin/products', icon: <Package size={20} />, label: 'Products' },
    { href: '/admin/settings', icon: <Download size={20} />, label: 'Catalog' },
    { href: '/admin/blogs', icon: <FileText size={20} />, label: 'Blogs' },
    ...(canAccessDeveloper
      ? [{ href: '/admin/developer', icon: <Activity size={20} />, label: 'Developer (PIN)' }]
      : []),
  ];

  return (
    <div className={styles.adminLayout}>
      {hiddenSiteChrome}

      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoImageWrap}>
            <Image
              src={COMPANY_INFO.displayLogoPath}
              alt={COMPANY_INFO.name}
              width={1632}
              height={607}
              className={styles.logoImage}
              priority
              sizes="120px"
            />
          </div>
          <div>
            <span className={styles.logoName}>Admin Panel</span>
            <span className={styles.logoTag}>Spectra Pack</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isNavItemActive(item.href) ? styles.navItemActive : ''}`}
              onClick={() => setSidebarOpen(false)}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span>{adminName}</span>
            <span className={styles.userEmail}>{adminEmail}</span>
          </div>
          <button type="button" className={styles.logoutBtn} onClick={() => void handleSignOut()}>
            <LogOut size={18} /> Sign Out
          </button>
        </div>
      </aside>

      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <button
            type="button"
            className={styles.menuToggle}
            aria-label="Toggle admin navigation"
            aria-expanded={sidebarOpen}
            onClick={() => setSidebarOpen((open) => !open)}
          >
            <Menu size={24} />
          </button>
          <Link href="/" className={styles.viewSite} target="_blank" rel="noopener noreferrer">
            View Website →
          </Link>
        </header>
        <div className={styles.contentArea}>{children}</div>
      </div>

      {sidebarOpen && (
        <button
          type="button"
          className={styles.overlay}
          aria-label="Close admin navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}

export default function AdminShell({
  children,
  session,
  canAccessDeveloper,
}: AdminShellProps) {
  return (
    <SessionProvider session={session} refetchOnWindowFocus={false}>
      <AdminShellInner canAccessDeveloper={canAccessDeveloper}>
        {children}
      </AdminShellInner>
    </SessionProvider>
  );
}
