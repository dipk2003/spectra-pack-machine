'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { PRODUCTS, COMPANY_INFO } from '@/lib/data';
import { Menu, X, ChevronDown, Phone, Mail, Download } from 'lucide-react';
import styles from './Navbar.module.css';

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [products, setProducts] = useState(PRODUCTS);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        const res = await fetch('/api/products');
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setProducts(data);
        }
      } catch {
        // Static products stay as fallback.
      }
    };

    void loadProducts();
  }, []);

  return (
    <>
      {/* Top bar */}
      <div className={styles.topBar}>
        <div className="container">
          <div className={styles.topBarInner}>
            <div className={styles.topBarLeft}>
              <a href={`tel:${primaryPhone}`} className={styles.topBarLink}>
                <Phone size={14} /> {COMPANY_INFO.phone[0]}
              </a>
              <a href={`mailto:${COMPANY_INFO.email[0]}`} className={styles.topBarLink}>
                <Mail size={14} /> {COMPANY_INFO.email[0]}
              </a>
            </div>
            <div className={styles.topBarRight}>
              <span className={styles.makeInIndia}>🇮🇳 Make in India</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main navbar */}
      <nav className={`${styles.navbar} ${scrolled ? styles.scrolled : ''}`}>
        <div className="container">
          <div className={styles.navInner}>
            <Link href="/" className={styles.logo} aria-label={COMPANY_INFO.name}>
              <span className={styles.logoImageWrap}>
                <Image
                  src={COMPANY_INFO.logoPath}
                  alt={COMPANY_INFO.name}
                  width={990}
                  height={328}
                  className={styles.logoImage}
                  priority
                />
              </span>
            </Link>

            {/* Desktop nav */}
            <div className={styles.navLinks}>
              <Link href="/" className={styles.navLink}>Home</Link>

              <div
                className={styles.dropdown}
                onMouseEnter={() => setProductsOpen(true)}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className={styles.navLink}>
                  Products <ChevronDown size={16} className={`${styles.chevron} ${productsOpen ? styles.chevronOpen : ''}`} />
                </button>
                {productsOpen && (
                  <div className={styles.megaMenu}>
                    <div className={styles.megaMenuGrid}>
                      {products.map((p) => (
                        <Link key={p.slug} href={`/products/${p.slug}`} className={styles.megaMenuItem} onClick={() => setProductsOpen(false)}>
                          <span className={styles.megaMenuDot} />
                          {p.title}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <Link href="/services" className={styles.navLink}>Services</Link>
              <Link href="/about" className={styles.navLink}>About Us</Link>
              <Link href="/clients" className={styles.navLink}>Industries</Link>
              <Link href="/blog" className={styles.navLink}>Blog</Link>
              <Link href="/contact" className={styles.navLink}>Contact</Link>
            </div>

            <div className={styles.navActions}>
              <a
                href={COMPANY_INFO.catalogPath}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-sm"
              >
                <Download size={15} />
                Download Catalog
              </a>
              <Link href="/schedule-meeting" className="btn btn-primary btn-sm">
                Enquire Now
              </Link>
            </div>

            {/* Mobile toggle */}
            <button className={styles.mobileToggle} onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className={styles.mobileMenu}>
            <Link href="/" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Home</Link>
            <button className={styles.mobileLink} onClick={() => setProductsOpen(!productsOpen)}>
              Products <ChevronDown size={16} />
            </button>
            {productsOpen && (
              <div className={styles.mobileSubMenu}>
                {products.map((p) => (
                  <Link key={p.slug} href={`/products/${p.slug}`} className={styles.mobileSubLink} onClick={() => setMobileOpen(false)}>
                    {p.title}
                  </Link>
                ))}
              </div>
            )}
            <Link href="/services" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About Us</Link>
            <Link href="/clients" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Industries</Link>
            <Link href="/blog" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
            <a
              href={COMPANY_INFO.catalogPath}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileLink}
            >
              Download Catalog
            </a>
            <Link href="/schedule-meeting" className="btn btn-primary" onClick={() => setMobileOpen(false)} style={{ margin: '1rem' }}>
              Enquire Now
            </Link>
          </div>
        )}
      </nav>
    </>
  );
}
