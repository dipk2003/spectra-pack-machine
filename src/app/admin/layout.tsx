'use client';

import { useSession, signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  FileText,
  Package,
  Users,
  CalendarDays,
  LogOut,
  Menu,
  LayoutGrid,
  Download,
} from 'lucide-react';
import { SessionProvider } from 'next-auth/react';
import { COMPANY_INFO } from '@/lib/data';
import styles from './layout.module.css';

type AdminStatus = {
  publicConfigured: boolean;
  adminConfigured: boolean;
  mode: 'service-role' | 'public-readonly' | 'disconnected';
  message: string;
};

function AdminLayoutInner({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [adminStatus, setAdminStatus] = useState<AdminStatus | null>(null);

  const handleSignOut = async () => {
    setSidebarOpen(false);
    await signOut({ redirect: false });
    window.location.assign('/admin/login');
  };

  useEffect(() => {
    if (pathname === '/admin/login') {
      return;
    }

    const loadAdminStatus = async () => {
      try {
        const res = await fetch('/api/admin/status');
        const data = await res.json().catch(() => null);

        if (res.ok && data && typeof data.message === 'string') {
          setAdminStatus(data as AdminStatus);
        }
      } catch {
        // Keep UI usable even if status check fails.
      }
    };

    void loadAdminStatus();
  }, [pathname]);

  // Login page - no sidebar
  if (pathname === '/admin/login') return <>{children}</>;

  if (status === 'loading') {
    return <div className={styles.loading}>Loading...</div>;
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
  ];

  return (
    <div className={styles.adminLayout}>
      <style jsx global>{`
        #site-navbar,
        #site-footer,
        #site-whatsapp,
        #site-chat-widget {
          display: none !important;
        }
      `}</style>

      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.sidebarHeader}>
          <div className={styles.logoImageWrap}>
            <Image
              src={COMPANY_INFO.displayLogoPath}
              alt={COMPANY_INFO.name}
              width={181}
              height={60}
              className={styles.logoImage}
              priority
              sizes="181px"
            />
          </div>
          <div>
            <span className={styles.logoName}>Admin Panel</span>
            <span className={styles.logoTag}>Spectra Pack</span>
          </div>
        </div>

        <nav className={styles.sidebarNav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}
              className={`${styles.navItem} ${isNavItemActive(item.href) ? styles.navItemActive : ''}`}
              onClick={() => setSidebarOpen(false)}>
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

      {/* Main content */}
      <div className={styles.mainContent}>
        <header className={styles.topBar}>
          <button className={styles.menuToggle} onClick={() => setSidebarOpen(!sidebarOpen)}>
            <Menu size={24} />
          </button>
          <Link href="/" className={styles.viewSite} target="_blank">View Website →</Link>
        </header>
        <div className={styles.contentArea}>
          {adminStatus && adminStatus.mode !== 'service-role' && (
            <div className={`${styles.statusBanner} ${adminStatus.mode === 'disconnected' ? styles.statusBannerError : ''}`}>
              <strong>Admin data status:</strong> {adminStatus.message}
            </div>
          )}
          {children}
        </div>
      </div>

      {sidebarOpen && <div className={styles.overlay} onClick={() => setSidebarOpen(false)} />}
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <AdminLayoutInner>{children}</AdminLayoutInner>
    </SessionProvider>
  );
}
