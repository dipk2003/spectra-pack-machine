'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryToSlug } from '@/lib/categories';
import type { CategoryRecord } from '@/lib/cms';
import { PRODUCTS, COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import { Menu, X, ChevronDown, Phone, Mail, Download } from 'lucide-react';
import styles from './Navbar.module.css';

const HAS_PUBLIC_SUPABASE_CONFIG = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
);

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [productsOpen, setProductsOpen] = useState(false);
  const [activeDesktopCategory, setActiveDesktopCategory] = useState('');
  const [activeMobileCategory, setActiveMobileCategory] = useState('');
  const [products, setProducts] = useState(HAS_PUBLIC_SUPABASE_CONFIG ? [] : PRODUCTS);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [catalogPath, setCatalogPath] = useState(COMPANY_INFO.catalogPath);
  const primaryPhone = COMPANY_INFO.phone[0].replace(/\s+/g, '');
  const categoryOrder = new Map(
    categories.map((category, index) => [category.name, category.sortOrder ?? index]),
  );
  const productGroups = groupProductsByCategory(products).sort((left, right) => {
    const leftOrder = categoryOrder.get(left.category) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = categoryOrder.get(right.category) ?? Number.MAX_SAFE_INTEGER;

    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.category.localeCompare(right.category);
  });
  const desktopMenuGroups = productGroups.map((group) => {
    const slug = categoryToSlug(group.category);

    return {
      category: group.category,
      slug,
      items: group.items,
    };
  });
  const desktopMenuGroupSlugs = desktopMenuGroups.map((group) => group.slug).join('|');
  const activeDesktopGroup =
    desktopMenuGroups.find((group) => group.slug === activeDesktopCategory) ?? desktopMenuGroups[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const groupSlugs = desktopMenuGroupSlugs ? desktopMenuGroupSlugs.split('|') : [];

    if (groupSlugs.length === 0) {
      setActiveDesktopCategory('');
      setActiveMobileCategory('');
      return;
    }

    const firstGroupSlug = groupSlugs[0];
    const hasActiveDesktopGroup = groupSlugs.includes(activeDesktopCategory);
    const hasActiveMobileGroup = groupSlugs.includes(activeMobileCategory);

    if (!hasActiveDesktopGroup) {
      setActiveDesktopCategory(firstGroupSlug);
    }

    if (!hasActiveMobileGroup) {
      setActiveMobileCategory(firstGroupSlug);
    }
  }, [activeDesktopCategory, activeMobileCategory, desktopMenuGroupSlugs]);

  useEffect(() => {
    const loadSiteData = async () => {
      try {
        const [productsRes, categoriesRes, settingsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/site-settings'),
        ]);

        const productsData = await productsRes.json();
        const categoriesData = await categoriesRes.json();
        const settingsData = await settingsRes.json();

        if (Array.isArray(productsData)) {
          setProducts(productsData);
        }

        if (Array.isArray(categoriesData)) {
          setCategories(categoriesData);
        }

        if (typeof settingsData?.catalogPath === 'string' && settingsData.catalogPath.trim()) {
          setCatalogPath(settingsData.catalogPath);
        }
      } catch {
        // Static fallback stays only if the API request fails.
      }
    };

    void loadSiteData();
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
                onMouseEnter={() => {
                  setProductsOpen(true);
                  if (desktopMenuGroups[0]) {
                    setActiveDesktopCategory((current) => current || desktopMenuGroups[0].slug);
                  }
                }}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button
                  type="button"
                  className={styles.navLink}
                  aria-expanded={productsOpen}
                  aria-haspopup="true"
                  onClick={() => {
                    setProductsOpen((open) => !open);
                    if (desktopMenuGroups[0]) {
                      setActiveDesktopCategory((current) => current || desktopMenuGroups[0].slug);
                    }
                  }}
                >
                  Products <ChevronDown size={16} className={`${styles.chevron} ${productsOpen ? styles.chevronOpen : ''}`} />
                </button>
                {productsOpen && activeDesktopGroup && (
                  <div className={styles.simpleMenu}>
                    <div className={styles.simpleMenuLayout}>
                      <div className={styles.simpleMenuCategories} role="menu" aria-label="Product categories">
                        {desktopMenuGroups.map((group) => (
                          <button
                            key={group.slug}
                            type="button"
                            className={`${styles.simpleMenuCategoryButton} ${activeDesktopGroup.slug === group.slug ? styles.simpleMenuCategoryButtonActive : ''}`}
                            onMouseEnter={() => setActiveDesktopCategory(group.slug)}
                            onFocus={() => setActiveDesktopCategory(group.slug)}
                            onClick={() => setActiveDesktopCategory(group.slug)}
                          >
                            {group.category}
                          </button>
                        ))}
                      </div>
                      <div className={styles.simpleMenuProducts}>
                        <div className={styles.simpleMenuProductsHeader}>
                          <Link
                            href={`/products/category/${activeDesktopGroup.slug}`}
                            className={styles.simpleMenuHeading}
                            onClick={() => setProductsOpen(false)}
                          >
                            {activeDesktopGroup.category}
                          </Link>
                        </div>
                        <div className={styles.simpleMenuLinks}>
                          {activeDesktopGroup.items.map((product) => (
                            <Link
                              key={product.slug}
                              href={`/products/${product.slug}`}
                              className={styles.simpleMenuLink}
                              onClick={() => setProductsOpen(false)}
                            >
                              {product.title}
                            </Link>
                          ))}
                        </div>
                      </div>
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
                href={catalogPath}
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
                {productGroups.map((group) => {
                  const groupSlug = categoryToSlug(group.category);

                  return (
                    <div key={group.category} className={styles.mobileGroup}>
                    <button
                      type="button"
                      className={`${styles.mobileGroupHeading} ${activeMobileCategory === groupSlug ? styles.mobileGroupHeadingActive : ''}`}
                      onClick={() =>
                        setActiveMobileCategory((current) =>
                          current === groupSlug ? '' : groupSlug,
                        )
                      }
                    >
                      {group.category}
                    </button>
                    {activeMobileCategory === groupSlug && (
                      <>
                        <Link
                          href={`/products/category/${groupSlug}`}
                          className={styles.mobileCategoryLink}
                          onClick={() => setMobileOpen(false)}
                        >
                          View {group.category}
                        </Link>
                        {group.items.map((p) => (
                          <Link key={p.slug} href={`/products/${p.slug}`} className={styles.mobileSubLink} onClick={() => setMobileOpen(false)}>
                            {p.title}
                          </Link>
                        ))}
                      </>
                    )}
                  </div>
                  );
                })}
              </div>
            )}
            <Link href="/services" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Services</Link>
            <Link href="/about" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>About Us</Link>
            <Link href="/clients" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Industries</Link>
            <Link href="/blog" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Blog</Link>
            <Link href="/contact" className={styles.mobileLink} onClick={() => setMobileOpen(false)}>Contact</Link>
            <a
              href={catalogPath}
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
