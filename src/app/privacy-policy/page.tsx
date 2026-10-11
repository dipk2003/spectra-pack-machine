import { completePageMetadata } from '@/lib/seo';
import type { Metadata } from 'next';
import Link from 'next/link';
import { COMPANY_INFO } from '@/lib/data';
import styles from './page.module.css';

export const metadata: Metadata = completePageMetadata({
  title: 'Privacy Policy',
  description: 'How Spectra Pack Machines collects, uses, protects and manages website enquiry and analytics information.',
  alternates: { canonical: '/privacy-policy' },
  robots: { index: true, follow: true },
});

export default function PrivacyPolicyPage() {
  return (
    <main className={styles.page}>
      <div className="container">
        <article className={styles.card}>
          <span className="section-label">Privacy & Data Use</span>
          <h1>Privacy Policy</h1>
          <p className={styles.updated}>Last updated: 26 September 2026</p>

          <p>
            This policy explains how {COMPANY_INFO.name} uses information submitted through this website and
            limited measurement data generated when visitors use it.
          </p>

          <h2>Information you choose to provide</h2>
          <p>
            Enquiry, quotation, meeting and chat forms may collect your name, business email, phone number,
            company, product or machine requirement, delivery location and the message you submit. We use this
            information to respond, prepare recommendations or quotations, schedule discussions and provide support.
          </p>

          <h2>Website measurement and advertising</h2>
          <p>
            When enabled with your consent, the site may use Google Analytics, Google Tag Manager, Google Ads and
            Microsoft Advertising (Bing UET) and Meta Pixel measurement to understand page usage and whether campaigns generate
            enquiries. Events may include page views, catalog downloads and clicks on WhatsApp, phone, email, forms
            or meeting actions. We do not send form names, email addresses, phone numbers or message text to
            analytics platforms. Microsoft explains its handling of this measurement data in its{' '}
            <a
              href="https://privacy.microsoft.com/en-us/privacystatement"
              target="_blank"
              rel="noreferrer"
            >
              Privacy Statement
            </a>
            .
          </p>

          <p>
            When a Meta Pixel is configured and you allow measurement, Meta receives page views, confirmed enquiry
            and meeting events, and contact clicks. Its tag may receive the page URL, browser information and
            advertising cookies. We disable automatic event configuration and do not supply form fields for
            advanced matching. See <a href="https://www.facebook.com/privacy/policy/" target="_blank" rel="noreferrer">Meta&apos;s Privacy Policy</a>.
            You can withdraw permission using Privacy choices in the footer.
          </p>

          <h2>Attribution data</h2>
          <p>
            An enquiry may include campaign values such as source, medium, campaign, landing page,
            referrer and advertising click identifiers. These help us understand which marketing generated a genuine
            business enquiry. First and latest campaign context can accompany a form you submit; it is stored
            across visits for up to 90 days only when you allow analytics. You can change analytics preferences
            from the cookie controls shown on the website.
          </p>

          <h2>Service providers and security</h2>
          <p>
            We use hosting, database, email, spam-protection and analytics providers to operate the website. Access
            to enquiry data is restricted to authenticated administrators and assigned sales employees. The CRM
            records assignments, follow-ups and staff communication activity. WhatsApp and phone actions open
            the relevant app; email may be sent through our configured email provider. We apply reasonable technical and
            organizational safeguards, but no internet transmission or storage system is completely risk-free.
          </p>

          <h2>Retention and your choices</h2>
          <p>
            We keep business enquiries for as long as reasonably needed to respond, maintain service records and meet
            legitimate operational or legal requirements. You may ask us to correct or delete information, subject to
            records we must retain. Withdrawing analytics consent does not remove an enquiry you intentionally submitted.
          </p>

          <h2>Contact us</h2>
          <p>
            For a privacy question or data request, email <a href={`mailto:${COMPANY_INFO.email[0]}`}>{COMPANY_INFO.email[0]}</a>
            {' '}or use our <Link href="/contact">contact page</Link>. We may verify the requester before changing a record.
          </p>
        </article>
      </div>
    </main>
  );
}
