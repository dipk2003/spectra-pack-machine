import { COMPANY_INFO } from './data';

const LEGACY_PRODUCT_SLUGS: Readonly<Record<string, string>> = {
  'double-door-chamber-vaccum-machine-with-conveyor':
    'double-door-chamber-vacuum-machine-with-conveyor',
  'pneumatic-vertical-sealing-machine-flame-proof-the-pneumatic-vertical-sea':
    'pneumatic-vertical-sealing-machine-flame-proof',
};

const BRAND_SUFFIX = new RegExp(
  `(?:\\s*[|–—-]\\s*${COMPANY_INFO.name.replace(/[.*+?^${}()|[\\]\\]/g, '\\$&')})+\\s*$`,
  'i',
);

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

  return normalized;
};

export const buildAbsoluteSeoTitle = (value: string, fallback: string) => {
  const base = stripSeoBrandSuffix(value) || stripSeoBrandSuffix(fallback) || COMPANY_INFO.name;
  const suffix = ` | ${COMPANY_INFO.name}`;
  const maxTitleLength = 68;
  const available = Math.max(24, maxTitleLength - suffix.length);
  return `${truncateAtWord(base, available)}${suffix}`;
};

export const buildMetaDescription = (value: string, fallback: string) =>
  truncateAtWord(value || fallback, 160);

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
