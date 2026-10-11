import type { Metadata } from 'next';
import { COMPANY_INFO } from './data';

const LEGACY_PRODUCT_SLUGS: Readonly<Record<string, string>> = {
  'double-door-chamber-vaccum-machine-with-conveyor':
    'double-door-chamber-vacuum-machine-with-conveyor',
  'pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea':
    'pneumatic-vertical-sealing-machine-flame-proof',
};

const BRAND_SUFFIX = /(?:\s*[|–—-]\s*Spectra\s*Pack(?:\s*Machines?)?)+\s*$/i;
const BRAND_MENTION = /\bSpectra\s*Pack(?:\s*Machines?)?\b/gi;

const removeBrandMentions = (value: string) => value
  .replace(/\b(?:by|from|at)\s+Spectra\s*Pack(?:\s*Machines?)?\b/gi, '')
  .replace(BRAND_MENTION, '')
  .replace(/\s+([,.;:!?])/g, '$1')
  .replace(/([,;:])\s*([.!?])/g, '$2')
  .replace(/\s+/g, ' ')
  .trim();

const truncateAtWord = (value: string, maxLength: number) => {
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxLength) return normalized;

  const shortened = normalized.slice(0, maxLength + 1);
  const boundary = shortened.lastIndexOf(' ');
  return `${shortened.slice(0, boundary > maxLength * 0.65 ? boundary : maxLength).trim()}…`;
};

export const stripSeoBrandSuffix = (value: string) => {
  let normalized = value.replace(/\s+/g, ' ').trim();
  let previous = '';

  while (normalized && normalized !== previous) {
    previous = normalized;
    normalized = normalized.replace(BRAND_SUFFIX, '').trim();
  }

  return removeBrandMentions(normalized).replace(/^[\s|–—-]+|[\s|–—-]+$/g, '').trim();
};

export const buildAbsoluteSeoTitle = (value: string, fallback: string) => {
  const base = stripSeoBrandSuffix(value) || stripSeoBrandSuffix(fallback) || COMPANY_INFO.name;
  const suffix = ` | ${COMPANY_INFO.name}`;
  return `${base}${suffix}`;
};

export const buildMetaDescription = (value: string, fallback: string) =>
  truncateAtWord(removeBrandMentions(value) || removeBrandMentions(fallback) || COMPANY_INFO.tagline, 160);

export const canonicalizeProductSlug = (value: string) =>
  LEGACY_PRODUCT_SLUGS[value] || value;

export const getProductSlugCandidates = (value: string) => {
  const canonical = canonicalizeProductSlug(value);
  return [
    canonical,
    ...Object.entries(LEGACY_PRODUCT_SLUGS)
      .filter(([, replacement]) => replacement === canonical)
      .map(([legacy]) => legacy),
  ];
};

export function machineSearchKeywords(title: string, category: string, city?: string) {
  const terms = [title, category];
  if (/web sealer/i.test(title)) terms.push('web sealer machine', 'shrink wrapping machine', 'shrink packaging machine');
  if (/band seal/i.test(title)) terms.push('band sealing machine', 'pouch sealing machine');
  if (/vacuum/i.test(title)) terms.push('vacuum packing machine', 'vacuum packaging machine');
  if (/stretch/i.test(title)) terms.push('pallet wrapping machine', 'stretch wrapping machine');
  if (/filling|filler/i.test(title)) terms.push('filling machine');
  const location = city || 'India';
  return Array.from(new Set(terms.filter(Boolean).flatMap(term => [term, `${term} in ${location}`])
    .concat([`${terms[0]} manufacturer`, `${terms[0]} supplier in ${location}`, `${terms[0]} price`])));
}

/** Complete page metadata without inheriting another page's social preview. */
export function completePageMetadata(input: Metadata): Metadata {
  const rawTitle = typeof input.title === 'string' ? input.title
    : input.title && 'absolute' in input.title ? input.title.absolute
    : input.title && 'default' in input.title ? input.title.default : COMPANY_INFO.name;
  // Preserve the complete machine/location name; truncating long titles can make
  // different models or cities indistinguishable. Google chooses display length.
  const title = stripSeoBrandSuffix(rawTitle || COMPANY_INFO.name) || 'Packaging Machinery';
  const description = buildMetaDescription(input.description || '', COMPANY_INFO.tagline);
  const canonical = input.alternates?.canonical;
  const url = typeof canonical === 'string' ? new URL(canonical, COMPANY_INFO.website).href.replace(/\/$/, '') : COMPANY_INFO.website;
  const og = input.openGraph;
  const openGraphTitle = typeof og?.title === 'string' ? og.title : title;
  const twitterTitle = typeof input.twitter?.title === 'string' ? input.twitter.title : title;
  const images = og?.images && (!Array.isArray(og.images) || og.images.length) ? og.images
    : [{ url: COMPANY_INFO.logoPath, alt: COMPANY_INFO.name }];
  const providedKeywords = typeof input.keywords === 'string' ? input.keywords.split(',') : input.keywords || [];
  const keywords = Array.from(new Set((providedKeywords.length ? providedKeywords : [title, COMPANY_INFO.name])
    .map(value => value.trim()).filter(Boolean)));
  return {
    ...input,
    title: { absolute: title === COMPANY_INFO.name ? title : title + ' | ' + COMPANY_INFO.name },
    description,
    keywords,
    alternates: { ...input.alternates, canonical: url },
    robots: input.robots || { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1, 'max-video-preview': -1 } },
    openGraph: { type: 'website', locale: 'en_IN', siteName: COMPANY_INFO.name, ...og, title: buildAbsoluteSeoTitle(openGraphTitle, title), description: buildMetaDescription(og?.description || description, description), url, images },
    twitter: { card: 'summary_large_image', ...input.twitter, title: buildAbsoluteSeoTitle(twitterTitle, title), description: buildMetaDescription(input.twitter?.description || description, description), images: input.twitter?.images || images },
  };
}
