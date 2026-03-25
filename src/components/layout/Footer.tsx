import Link from 'next/link';
import Image from 'next/image';
import { getCatalogPath, listProducts } from '@/lib/cms';
import { COMPANY_INFO, PRODUCTS } from '@/lib/data';
import { MapPin, Phone, Mail, Facebook, Instagram, Linkedin, Youtube, Twitter } from 'lucide-react';
import styles from './Footer.module.css';

export default async function Footer() {
  let products = PRODUCTS;
  let catalogPath = COMPANY_INFO.catalogPath;

  try {
    const [resolvedProducts, resolvedCatalogPath] = await Promise.all([
      listProducts({ publishedOnly: true }),
      getCatalogPath(),
    ]);

    if (resolvedProducts.length > 0) {
      products = resolvedProducts;
    }

    if (resolvedCatalogPath) {
      catalogPath = resolvedCatalogPath;
    }
  } catch {
    // Keep static catalog data in the footer when CMS data is unavailable.
  }

  const socialLinks = [
    { href: COMPANY_INFO.socialLinks.instagram, label: 'Instagram', icon: <Instagram size={18} /> },
    { href: COMPANY_INFO.socialLinks.x, label: 'X', icon: <Twitter size={18} /> },
    { href: COMPANY_INFO.socialLinks.youtube, label: 'YouTube', icon: <Youtube size={18} /> },
    { href: COMPANY_INFO.socialLinks.facebook, label: 'Facebook', icon: <Facebook size={18} /> },
    { href: COMPANY_INFO.socialLinks.linkedin, label: 'LinkedIn', icon: <Linkedin size={18} /> },
  ];

  return (
    <footer className={styles.footer}>
      <div className={styles.footerTop}>
        <div className="container">
          <div className={styles.footerGrid}>
            {/* Company info */}
            <div className={styles.footerCol}>
              <div className={styles.footerLogo}>
                <span className={styles.logoImageWrap}>
                  <Image
                    src={COMPANY_INFO.displayLogoPath}
                    alt={COMPANY_INFO.name}
                    width={181}
                    height={60}
                    className={styles.logoImage}
                    sizes="181px"
                  />
                </span>
              </div>
              <p className={styles.footerDesc}>
                Spectra Pack Machines manufactures shrink wrapping, sealing, vacuum packaging, conveyor,
                and end-of-line packaging machines from Maharashtra for Indian production lines.
              </p>
              <div className={styles.socials}>
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                  >
                    {social.icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Quick Links */}
            <div className={styles.footerCol}>
              <p className={styles.footerHeading}>Quick Links</p>
              <ul className={styles.footerLinks}>
                <li><Link href="/">Home</Link></li>
                <li><Link href="/about">About Us</Link></li>
                <li><Link href="/services">Services</Link></li>
                <li><Link href="/clients">Industries</Link></li>
                <li><Link href="/blog">Blog</Link></li>
                <li><Link href="/contact">Contact</Link></li>
                <li><a href={catalogPath} target="_blank" rel="noopener noreferrer">Download Catalog</a></li>
                <li><Link href="/schedule-meeting">Schedule Meeting</Link></li>
              </ul>
            </div>

            {/* Products */}
            <div className={styles.footerCol}>
              <p className={styles.footerHeading}>Our Category</p>
              <ul className={styles.footerLinks}>
                {products.slice(0, 7).map((p) => (
                  <li key={p.slug}><Link href={`/products/${p.slug}`}>{p.title}</Link></li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div className={styles.footerCol}>
              <p className={styles.footerHeading}>Contact Us</p>
              <div className={styles.contactItems}>
                <div className={styles.contactItem}>
                  <MapPin size={16} className={styles.contactIcon} />
                  <div>
                    <p className={styles.contactLabel}>Head Office</p>
                    <p>{COMPANY_INFO.headOffice}</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <MapPin size={16} className={styles.contactIcon} />
                  <div>
                    <p className={styles.contactLabel}>Factory</p>
                    <p>{COMPANY_INFO.factory}</p>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <Phone size={16} className={styles.contactIcon} />
                  <div className={styles.contactLinkStack}>
                    <a href={`tel:${COMPANY_INFO.phone[0].replace(/\s+/g, '')}`}>{COMPANY_INFO.phone[0]}</a>
                    <a href={`tel:${COMPANY_INFO.phone[1].replace(/\s+/g, '')}`}>{COMPANY_INFO.phone[1]}</a>
                  </div>
                </div>
                <div className={styles.contactItem}>
                  <Mail size={16} className={styles.contactIcon} />
                  <div className={styles.contactLinkStack}>
                    <a href={`mailto:${COMPANY_INFO.email[0]}`}>{COMPANY_INFO.email[0]}</a>
                    <a href={`mailto:${COMPANY_INFO.email[1]}`}>{COMPANY_INFO.email[1]}</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.footerBottom}>
        <div className="container">
          <div className={styles.footerBottomInner}>
            <p>&copy; {new Date().getFullYear()} Spectra Pack Machines. All rights reserved.</p>
            <p className={styles.madeWith}>{COMPANY_INFO.tagline}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
