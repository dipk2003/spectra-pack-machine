'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categoryToSlug, getCategoryShowcase } from '@/lib/categories';
import type { CategoryRecord } from '@/lib/cms';
import { PRODUCTS, COMPANY_INFO, groupProductsByCategory } from '@/lib/data';
import { Menu, X, ChevronDown, Phone, Mail, Download, ArrowRight } from 'lucide-react';
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
  const [activeCategorySlug, setActiveCategorySlug] = useState('');
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
    const managedCategory =
      categories.find((category) => category.slug === slug) ??
      categories.find((category) => category.name === group.category);
    const fallbackShowcase = getCategoryShowcase(group.category, group.items);

    return {
      category: group.category,
      slug,
      items: group.items,
      accent: managedCategory?.accent || fallbackShowcase.accent,
      description: managedCategory?.description || fallbackShowcase.description,
      image: managedCategory?.image || fallbackShowcase.image,
    };
  });
  const activeDesktopCategory =
    desktopMenuGroups.find((group) => group.slug === activeCategorySlug) ??
    desktopMenuGroups[0];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

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

  useEffect(() => {
    if (!desktopMenuGroups.length) {
      setActiveCategorySlug('');
      return;
    }

    if (!desktopMenuGroups.some((group) => group.slug === activeCategorySlug)) {
      setActiveCategorySlug(desktopMenuGroups[0].slug);
    }
  }, [activeCategorySlug, desktopMenuGroups]);

  const openProductsMenu = () => {
    setProductsOpen(true);
    if (!activeCategorySlug && desktopMenuGroups[0]) {
      setActiveCategorySlug(desktopMenuGroups[0].slug);
    }
  };

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
                onMouseEnter={openProductsMenu}
                onMouseLeave={() => setProductsOpen(false)}
              >
                <button className={styles.navLink}>
                  Products <ChevronDown size={16} className={`${styles.chevron} ${productsOpen ? styles.chevronOpen : ''}`} />
                </button>
                {productsOpen && activeDesktopCategory && (
                  <div className={styles.megaMenu}>
                    <div className={styles.megaMenuShell}>
                      <div className={styles.megaMenuRail}>
                        <div className={styles.megaMenuRailHeader}>
                          <span className={styles.megaMenuRailLabel}>Product</span>
                          <span className={styles.megaMenuRailSubLabel}>Machine categories</span>
                        </div>
                        <div className={styles.megaMenuCategoryList}>
                          {desktopMenuGroups.map((group) => (
                            <button
                              key={group.slug}
                              type="button"
                              className={`${styles.megaMenuCategoryTab} ${
                                activeDesktopCategory.slug === group.slug
                                  ? styles.megaMenuCategoryTabActive
                                  : ''
                              }`}
                              onMouseEnter={() => setActiveCategorySlug(group.slug)}
                              onFocus={() => setActiveCategorySlug(group.slug)}
                              onClick={() => setActiveCategorySlug(group.slug)}
                            >
                              <span className={styles.megaMenuCategoryCopy}>
                                <span className={styles.megaMenuCategoryTitle}>{group.category}</span>
                                <span className={styles.megaMenuCategoryMeta}>
                                  {group.items.length} {group.items.length === 1 ? 'machine' : 'machines'}
                                </span>
                              </span>
                              <ArrowRight size={15} className={styles.megaMenuCategoryArrow} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className={styles.megaMenuPanel}>
                        <div className={styles.megaMenuPanelHeader}>
                          <div className={styles.megaMenuPanelCopy}>
                            <span className={styles.megaMenuPanelLabel}>Products</span>
                            <h3 className={styles.megaMenuPanelTitle}>
                              {activeDesktopCategory.category}
                            </h3>
                            <p className={styles.megaMenuPanelDesc}>
                              {activeDesktopCategory.description}
                            </p>
                          </div>
                          <Link
                            href={`/products/category/${activeDesktopCategory.slug}`}
                            className={styles.megaMenuPanelAction}
                            onClick={() => setProductsOpen(false)}
                          >
                            View Category <ArrowRight size={14} />
                          </Link>
                        </div>

                        <div className={styles.megaMenuProductsPanel}>
                          <div className={styles.megaMenuProductsHeader}>
                            <span className={styles.megaMenuProductsLabel}>Products in this category</span>
                            <span className={styles.megaMenuProductsCount}>
                              {activeDesktopCategory.items.length} items
                            </span>
                          </div>
                          <div className={styles.megaMenuProductsGrid}>
                            {activeDesktopCategory.items.map((product) => (
                              <Link
                                key={product.slug}
                                href={`/products/${product.slug}`}
                                className={styles.megaMenuProductCard}
                                onClick={() => setProductsOpen(false)}
                              >
                                <span className={styles.megaMenuProductName}>{product.title}</span>
                                <ArrowRight size={14} className={styles.megaMenuProductArrow} />
                              </Link>
                            ))}
                          </div>
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
                {productGroups.map((group) => (
                  <div key={group.category} className={styles.mobileGroup}>
                    <Link
                      href={`/products/category/${categoryToSlug(group.category)}`}
                      className={styles.mobileGroupHeading}
                      onClick={() => setMobileOpen(false)}
                    >
                      {group.category}
                    </Link>
                    {group.items.map((p) => (
                      <Link key={p.slug} href={`/products/${p.slug}`} className={styles.mobileSubLink} onClick={() => setMobileOpen(false)}>
                        {p.title}
                      </Link>
                    ))}
                  </div>
                ))}
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
