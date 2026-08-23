import type { SupabaseClient } from '@supabase/supabase-js';
import { categoryToSlug, getCategoryShowcase } from './categories';
import {
  COMPANY_INFO,
  PRODUCTS,
  SERVICES,
  groupProductsByCategory,
  type ProductData,
} from './data';
import { normalizeStoredPhone } from './phone';
import {
  canonicalizeProductSlug,
  getProductSlugCandidates,
  stripSeoBrandSuffix,
} from './seo';
import {
  isLeadStatus,
  LeadUpdateValidationError,
  type LeadStatus,
} from './lead-status';
import {
  getSupabaseAdmin,
  getSupabasePublic,
  hasSupabasePublicConfig,
  isSupabaseConfigured,
} from './supabase';

export interface ProductRecord extends ProductData {
  id: string;
  categoryId: string;
  categorySlug: string;
  gallery: string[];
  seoTitle: string;
  seoDesc: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface BlogRecord {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string;
  categoryId: string;
  featuredProductId: string;
  seoTitle: string;
  seoDesc: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeadRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  categoryId: string;
  machineInterest: string;
  message: string;
  source: string;
  read: boolean;
  status: LeadStatus;
  firstContactedAt: string | null;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  productId: string;
  categoryId: string;
  machineInterest: string;
  date: string;
  time: string;
  message: string;
  meetingLink: string;
  status: string;
  adminNotes: string;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string;
  image: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SiteSettingRecord {
  id: string;
  key: string;
  value: string;
  jsonValue: Record<string, unknown> | unknown[] | null;
  label: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  icon: string;
  categoryId: string;
  published: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  model_no: string | null;
  category_id?: string | null;
  category: string;
  short_desc: string;
  description: string;
  features: unknown;
  specs: unknown;
  faqs: unknown;
  image: string | null;
  image_alt: string | null;
  gallery: unknown;
  seo_title: string | null;
  seo_desc: string | null;
  published: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
  category_record?: ProductCategoryLinkRow | ProductCategoryLinkRow[] | null;
};

type ProductCategoryLinkRow = {
  id: string;
  name: string;
  slug: string;
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
  category_id: string | null;
  featured_product_id: string | null;
  seo_title: string | null;
  seo_desc: string | null;
  published: boolean | null;
  created_at: string;
  updated_at: string;
};

type LeadRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  product_id: string | null;
  category_id: string | null;
  machine_interest: string | null;
  message: string;
  source: string | null;
  read: boolean | null;
  status: string | null;
  first_contacted_at: string | null;
  last_contacted_at: string | null;
  created_at: string;
  updated_at: string;
};

type MeetingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  product_id: string | null;
  category_id: string | null;
  machine_interest: string | null;
  date: string;
  time: string;
  message: string | null;
  meeting_link: string | null;
  status: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

type CategoryRow = {
  id: string;
  name: string;
  slug: string;
  description: string;
  accent: string | null;
  image: string;
  published: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

type SiteSettingRow = {
  id: string;
  key: string;
  value: string;
  json_value: unknown;
  label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

type ServiceRow = {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  icon: string | null;
  category_id: string | null;
  published: boolean | null;
  sort_order: number | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_BLOG_IMAGE = '/images/brand/spectra-logo.png';
const EPOCH = new Date(0).toISOString();
const LEGACY_PRODUCT_SELECT = `
  id,
  title,
  slug,
  model_no,
  category,
  short_desc,
  description,
  features,
  specs,
  faqs,
  image,
  image_alt,
  gallery,
  seo_title,
  seo_desc,
  published,
  sort_order,
  created_at,
  updated_at
`;
const PRODUCT_SELECT = `
  id,
  title,
  slug,
  model_no,
  category_id,
  category,
  short_desc,
  description,
  features,
  specs,
  faqs,
  image,
  image_alt,
  gallery,
  seo_title,
  seo_desc,
  published,
  sort_order,
  created_at,
  updated_at,
  category_record:product_categories!products_category_id_fkey (
    id,
    name,
    slug
  )
`;

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

const dedupeStrings = (values: string[]) => Array.from(new Set(values));

const isLegacyLocalProductImagePath = (image: string) =>
  image.startsWith('/images/products/') || image.startsWith('images/products/');

const normalizeImagePath = (value: unknown) => {
  const image = typeof value === 'string' ? value.trim() : '';

  if (!image) {
    return '';
  }

  if (isLegacyLocalProductImagePath(image)) {
    return '';
  }

  if (
    image.startsWith('/') ||
    image.startsWith('http://') ||
    image.startsWith('https://') ||
    image.startsWith('data:') ||
    image.startsWith('blob:')
  ) {
    return image;
  }

  if (image.startsWith('public/')) {
    return `/${image.slice('public/'.length)}`;
  }

  return `/${image.replace(/^\.?\//, '')}`;
};

const toFaqArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => {
          if (!isPlainObject(item)) return null;
          const q = typeof item.q === 'string' ? item.q.trim() : '';
          const a = typeof item.a === 'string' ? item.a.trim() : '';
          if (!q || !a) return null;
          return { q, a };
        })
        .filter((item): item is { q: string; a: string } => Boolean(item))
    : [];

const toSpecsRecord = (value: unknown) => {
  if (!isPlainObject(value)) return {};

  return Object.entries(value).reduce<Record<string, string>>((acc, [key, item]) => {
    if (typeof item === 'string' && key.trim()) {
      acc[key] = item.trim();
    }
    return acc;
  }, {});
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const settingKeyify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

const toSortOrder = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const createSubmissionId = () => globalThis.crypto.randomUUID();

const cleanAttributionValue = (value: unknown, maxLength: number) =>
  typeof value === 'string'
    ? value.replace(/[\u0000-\u001f\u007f]/g, '').trim().slice(0, maxLength)
    : '';

const normalizeAttributionInput = (value: unknown) => {
  const raw = value && typeof value === 'object' && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
  const pathCandidate = cleanAttributionValue(
    raw.landingPath || raw.first_landing_page || raw.last_landing_page,
    300,
  );
  const landingPath = pathCandidate.startsWith('/') && !pathCandidate.startsWith('//')
    ? pathCandidate
    : '';
  const referrerCandidate = cleanAttributionValue(
    raw.referrer || raw.last_referrer_host || raw.first_referrer_host,
    120,
  ).toLowerCase();
  const referrer = /^[a-z0-9.-]+(?::\d{1,5})?$/i.test(referrerCandidate)
    ? referrerCandidate
    : '';

  return {
    landingPath,
    referrer,
    utmSource: cleanAttributionValue(
      raw.utmSource || raw.last_utm_source || raw.first_utm_source,
      100,
    ),
    utmMedium: cleanAttributionValue(
      raw.utmMedium || raw.last_utm_medium || raw.first_utm_medium,
      100,
    ),
    utmCampaign: cleanAttributionValue(
      raw.utmCampaign || raw.last_utm_campaign || raw.first_utm_campaign,
      160,
    ),
    utmTerm: cleanAttributionValue(
      raw.utmTerm || raw.last_utm_term || raw.first_utm_term,
      160,
    ),
    utmContent: cleanAttributionValue(
      raw.utmContent || raw.last_utm_content || raw.first_utm_content,
      160,
    ),
    gclid: cleanAttributionValue(raw.gclid || raw.last_gclid || raw.first_gclid, 160),
    gbraid: cleanAttributionValue(raw.gbraid || raw.last_gbraid || raw.first_gbraid, 160),
    wbraid: cleanAttributionValue(raw.wbraid || raw.last_wbraid || raw.first_wbraid, 160),
  };
};

const isMissingSupabaseTableError = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    return error.code === 'PGRST205' || error.code === '42P01';
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message.includes('Could not find the table');
  }

  return false;
};

const isMissingAttributionColumnError = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string' &&
    (error.code === 'PGRST204' || error.code === '42703')
  ) {
    return true;
  }

  return Boolean(
    typeof error === 'object' &&
      error !== null &&
      'message' in error &&
      typeof error.message === 'string' &&
      (error.message.includes("Could not find the 'submission_id' column") ||
        error.message.includes('column leads.submission_id does not exist') ||
        error.message.includes('column meetings.submission_id does not exist')),
  );
};

const isLegacyProductRelationError = (error: unknown) => {
  if (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    typeof error.code === 'string'
  ) {
    if (error.code === 'PGRST200' || error.code === '42703') {
      return true;
    }
  }

  if (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return (
      error.message.includes("Could not find a relationship between 'products' and 'product_categories'") ||
      error.message.includes('column products.category_id does not exist')
    );
  }

  return false;
};

async function runProductQuery(
  buildQuery: (select: string) => Promise<{ data: unknown; error: unknown }>,
) {
  const primaryResult = await buildQuery(PRODUCT_SELECT);

  if (!isLegacyProductRelationError(primaryResult.error)) {
    return primaryResult;
  }

  return buildQuery(LEGACY_PRODUCT_SELECT);
}

type ReadAccess = 'public' | 'admin';

type ReadQueryOptions = {
  publishedOnly?: boolean;
  access?: ReadAccess;
};

const getSupabaseReadClient = (access: ReadAccess = 'public'): SupabaseClient | null => {
  if (access === 'admin' && isSupabaseConfigured()) return getSupabaseAdmin();
  if (hasSupabasePublicConfig()) return getSupabasePublic();
  if (isSupabaseConfigured()) return getSupabaseAdmin();
  return null;
};

const mapStaticProduct = (product: ProductData, index: number): ProductRecord => ({
  id: product.slug,
  title: product.title,
  slug: product.slug,
  modelNo: product.modelNo,
  categoryId: product.categoryId || product.categorySlug || categoryToSlug(product.category),
  category: product.category,
  categorySlug: product.categorySlug || categoryToSlug(product.category),
  shortDesc: product.shortDesc,
  description: product.description,
  features: product.features,
  specs: product.specs,
  faqs: product.faqs,
  image: product.image,
  imageAlt: product.imageAlt,
  gallery: [product.image],
  seoTitle: product.title,
  seoDesc: product.shortDesc,
  published: true,
  sortOrder: index,
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

const staticProducts = PRODUCTS.map(mapStaticProduct);
const staticProductBySlug = new Map(staticProducts.map((product) => [product.slug, product]));
const LEGACY_VACUUM_CATEGORY_SLUG = 'double-door-chamber-vaccum-packing-machine';
const CANONICAL_VACUUM_CATEGORY_SLUG = 'vacuum-packaging-machines';
const CANONICAL_VACUUM_CATEGORY_NAME = 'Vacuum Packaging Machines';

const staticCategories: CategoryRecord[] = groupProductsByCategory(PRODUCTS).map((group, index) => {
  const showcase = getCategoryShowcase(group.category, group.items);
  return {
    id: group.slug,
    name: group.category,
    slug: group.slug,
    description: showcase.description,
    accent: showcase.accent,
    image: showcase.image,
    published: true,
    sortOrder: index,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  };
});
const staticCategoryBySlug = new Map(staticCategories.map((category) => [category.slug, category]));

const staticSiteSettings: SiteSettingRecord[] = [
  {
    id: 'catalog-path',
    key: 'catalog_path',
    value: COMPANY_INFO.catalogPath,
    jsonValue: null,
    label: 'Catalog PDF',
    description: 'Public PDF path or full URL used for Download Catalog links.',
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

const staticServices: ServiceRecord[] = SERVICES.map((service, index) => ({
  id: service.slug,
  title: service.title,
  slug: service.slug,
  description: service.description,
  content: service.content,
  icon: service.icon,
  categoryId: '',
  published: true,
  sortOrder: index,
  createdAt: EPOCH,
  updatedAt: EPOCH,
}));

const mapProductRow = (row: ProductRow): ProductRecord => {
  const canonicalSlug = canonicalizeProductSlug(row.slug);
  const staticProduct = staticProductBySlug.get(canonicalSlug);
  const isLegacySlug = canonicalSlug !== row.slug;
  const title = isLegacySlug && staticProduct ? staticProduct.title : row.title;
  const image = normalizeImagePath(row.image) || staticProduct?.image || '';
  const gallery = dedupeStrings([
    ...toStringArray(row.gallery).map(normalizeImagePath).filter(Boolean),
    ...(image ? [image] : []),
  ]);
  const categoryRecord = Array.isArray(row.category_record)
    ? row.category_record[0] || null
    : row.category_record || null;
  const sourceCategory = categoryRecord?.name || row.category;
  const sourceCategorySlug = categoryRecord?.slug || categoryToSlug(sourceCategory);
  const hasLegacyVacuumCategory =
    sourceCategorySlug === LEGACY_VACUUM_CATEGORY_SLUG ||
    /\bvaccum\b/i.test(sourceCategory);
  const category = hasLegacyVacuumCategory
    ? CANONICAL_VACUUM_CATEGORY_NAME
    : isLegacySlug && staticProduct
      ? staticProduct.category
      : sourceCategory;
  return {
    id: row.id,
    title,
    slug: canonicalSlug,
    modelNo: row.model_no || '',
    categoryId: categoryRecord?.id || row.category_id || '',
    category,
    categorySlug:
      hasLegacyVacuumCategory
        ? CANONICAL_VACUUM_CATEGORY_SLUG
        : isLegacySlug && staticProduct
        ? staticProduct.categorySlug
        : sourceCategorySlug,
    shortDesc: row.short_desc,
    description: row.description,
    features: toStringArray(row.features),
    specs: toSpecsRecord(row.specs),
    faqs: toFaqArray(row.faqs),
    image,
    imageAlt: row.image_alt || staticProduct?.imageAlt || title,
    gallery: gallery.length > 0 ? gallery : image ? [image] : [],
    seoTitle: stripSeoBrandSuffix(
      isLegacySlug && staticProduct ? staticProduct.title : row.seo_title || title,
    ),
    seoDesc: row.seo_desc || row.short_desc,
    published: Boolean(row.published),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapBlogRow = (row: BlogRow): BlogRecord => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  excerpt: row.excerpt,
  content: row.content,
  image: normalizeImagePath(row.image) || DEFAULT_BLOG_IMAGE,
  categoryId: row.category_id || '',
  featuredProductId: row.featured_product_id || '',
  seoTitle: stripSeoBrandSuffix(row.seo_title || row.title),
  seoDesc: row.seo_desc || row.excerpt,
  published: Boolean(row.published),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapLeadRow = (row: LeadRow): LeadRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company || '',
  productId: row.product_id || '',
  categoryId: row.category_id || '',
  machineInterest: row.machine_interest || '',
  message: row.message,
  source: row.source || 'contact',
  read: Boolean(row.read),
  status: isLeadStatus(row.status) ? row.status : 'new',
  firstContactedAt: row.first_contacted_at || null,
  lastContactedAt: row.last_contacted_at || null,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapMeetingRow = (row: MeetingRow): MeetingRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company || '',
  productId: row.product_id || '',
  categoryId: row.category_id || '',
  machineInterest: row.machine_interest || '',
  date: row.date,
  time: row.time,
  message: row.message || '',
  meetingLink: row.meeting_link || '',
  status: row.status || 'pending',
  adminNotes: row.admin_notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCategoryRow = (row: CategoryRow): CategoryRecord => {
  const staticCategory = staticCategoryBySlug.get(row.slug);

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    accent: row.accent || 'Machine Family',
    image: normalizeImagePath(row.image) || staticCategory?.image || '',
    published: Boolean(row.published),
    sortOrder: row.sort_order ?? 0,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const mapSiteSettingRow = (row: SiteSettingRow): SiteSettingRecord => ({
  id: row.id,
  key: row.key,
  value: row.value,
  jsonValue: isPlainObject(row.json_value) || Array.isArray(row.json_value) ? row.json_value : null,
  label: row.label || row.key,
  description: row.description || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapServiceRow = (row: ServiceRow): ServiceRecord => ({
  id: row.id,
  title: row.title,
  slug: row.slug,
  description: row.description,
  content: row.content,
  icon: row.icon || 'settings',
  categoryId: row.category_id || '',
  published: Boolean(row.published),
  sortOrder: row.sort_order ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const readCategoryLookupKey = (input: Record<string, unknown>) => {
  const categoryId = String(input.categoryId || '').trim();
  const categorySlug = slugify(String(input.categorySlug || '').trim());
  const categoryName = String(input.category || '').trim();

  return {
    categoryId,
    categorySlug,
    categoryName,
  };
};

const readProductLookupKey = (input: Record<string, unknown>) => {
  const productId = String(input.productId || '').trim();
  const explicitProductSlug = slugify(String(input.productSlug || '').trim());
  const source = String(input.source || '').trim().toLowerCase();
  const sourceProductSlug = source.startsWith('product-')
    ? slugify(source.slice('product-'.length))
    : '';

  return {
    productId,
    productSlug: explicitProductSlug || sourceProductSlug,
  };
};

type ProductLookupRow = {
  id: string;
  title: string;
  category_id: string | null;
  category: string;
};

async function findProductCategory(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
) {
  const { categoryId, categorySlug, categoryName } = readCategoryLookupKey(input);
  const categorySelect = 'id, name, slug';

  if (categoryId) {
    const { data, error } = await supabase
      .from('product_categories')
      .select(categorySelect)
      .eq('id', categoryId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProductCategoryLinkRow;
  }

  if (categorySlug) {
    const { data, error } = await supabase
      .from('product_categories')
      .select(categorySelect)
      .eq('slug', categorySlug)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProductCategoryLinkRow;
  }

  if (categoryName) {
    const { data, error } = await supabase
      .from('product_categories')
      .select(categorySelect)
      .eq('name', categoryName)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProductCategoryLinkRow;

    const fallbackSlug = slugify(categoryName);
    if (fallbackSlug && fallbackSlug !== categorySlug) {
      const slugLookup = await supabase
        .from('product_categories')
        .select(categorySelect)
        .eq('slug', fallbackSlug)
        .maybeSingle();

      if (slugLookup.error) throw slugLookup.error;
      if (slugLookup.data) return slugLookup.data as ProductCategoryLinkRow;
    }
  }

  return null;
}

async function resolveProductCategory(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
) {
  const category = await findProductCategory(supabase, input);

  if (category) {
    return category;
  }

  throw new Error('A valid category is required before saving a product');
}

async function findProductReference(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
) {
  const { productId, productSlug } = readProductLookupKey(input);
  const productSelect = 'id, title, category_id, category';

  if (productId) {
    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('id', productId)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProductLookupRow;
  }

  if (productSlug) {
    const { data, error } = await supabase
      .from('products')
      .select(productSelect)
      .eq('slug', productSlug)
      .maybeSingle();

    if (error) throw error;
    if (data) return data as ProductLookupRow;
  }

  return null;
}

async function resolveCatalogRelations(
  supabase: SupabaseClient,
  input: Record<string, unknown>,
) {
  const product = await findProductReference(supabase, input);
  const category =
    (product?.category_id
      ? await findProductCategory(supabase, { categoryId: product.category_id })
      : null) || (await findProductCategory(supabase, input));
  const machineInterest = String(input.machineInterest || '').trim();

  return {
    productId: product?.id || '',
    categoryId: product?.category_id || category?.id || '',
    machineInterest: (machineInterest || product?.title || '').slice(0, 200),
  };
}

async function buildProductPayload(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const title = String(input.title || '').trim();
  const slug = slugify(String(input.slug || title));
  const shortDesc = String(input.shortDesc || '').trim();
  const description = String(input.description || '').trim();
  const image = String(input.image || '').trim();
  const category = await resolveProductCategory(supabase, input);

  if (!title || !slug || !shortDesc || !description || !image) {
    throw new Error(
      'title, slug, shortDesc, description, image, and a valid category are required',
    );
  }

  return {
    title,
    slug,
    model_no: String(input.modelNo || '').trim(),
    category_id: category.id,
    category: category.name,
    short_desc: shortDesc,
    description,
    features: toStringArray(input.features),
    specs: toSpecsRecord(input.specs),
    faqs: toFaqArray(input.faqs),
    image: normalizeImagePath(image),
    image_alt: String(input.imageAlt || title).trim(),
    gallery: dedupeStrings(toStringArray(input.gallery).map(normalizeImagePath).filter(Boolean)),
    seo_title: stripSeoBrandSuffix(String(input.seoTitle || title)),
    seo_desc: String(input.seoDesc || shortDesc).trim(),
    published: input.published === undefined ? true : Boolean(input.published),
    sort_order: toSortOrder(input.sortOrder),
  };
}

export function normalizeBlogInput(input: Record<string, unknown>) {
  const title = String(input.title || '').trim();
  const slug = slugify(String(input.slug || title));
  const excerpt = String(input.excerpt || '').trim();
  const content = String(input.content || '').trim();
  const categoryId = String(input.categoryId || '').trim();
  const featuredProductId = String(input.featuredProductId || '').trim();

  if (!title || !slug || !excerpt || !content) {
    throw new Error('title, slug, excerpt, and content are required');
  }

  return {
    title,
    slug,
    excerpt,
    content,
    image: normalizeImagePath(input.image) || DEFAULT_BLOG_IMAGE,
    category_id: categoryId || null,
    featured_product_id: featuredProductId || null,
    seo_title: stripSeoBrandSuffix(String(input.seoTitle || title)),
    seo_desc: String(input.seoDesc || excerpt).trim(),
    published: input.published === undefined ? true : Boolean(input.published),
  };
}

export function normalizeCategoryInput(input: Record<string, unknown>) {
  const name = String(input.name || '').trim();
  const slug = slugify(String(input.slug || name));
  const description = String(input.description || '').trim();
  const accent = String(input.accent || 'Machine Family').trim();
  const image = String(input.image || '').trim();

  if (!name || !slug || !description || !accent || !image) {
    throw new Error('name, slug, description, accent, and image are required');
  }

  return {
    name,
    slug,
    description,
    accent,
    image: normalizeImagePath(image),
    published: input.published === undefined ? true : Boolean(input.published),
    sort_order: toSortOrder(input.sortOrder),
  };
}

export function normalizeLeadInput(input: Record<string, unknown>) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  const phone = normalizeStoredPhone(input.phone);
  const message = String(input.message || '').trim();

  if (!name || !email || !phone || !message) {
    throw new Error('name, email, phone, and message are required');
  }

  return {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: phone.slice(0, 30),
    company: String(input.company || '').trim().slice(0, 200),
    productId: String(input.productId || '').trim(),
    productSlug: slugify(String(input.productSlug || '').trim()),
    categoryId: String(input.categoryId || '').trim(),
    categorySlug: slugify(String(input.categorySlug || '').trim()),
    category: String(input.category || '').trim().slice(0, 120),
    machineInterest: String(input.machineInterest || '').trim().slice(0, 200),
    message: message.slice(0, 2000),
    source: String(input.source || 'contact').trim().slice(0, 100),
    attribution: normalizeAttributionInput(input.attribution),
  };
}

export function normalizeMeetingInput(input: Record<string, unknown>) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  const phone = normalizeStoredPhone(input.phone);
  const date = String(input.date || '').trim();
  const time = String(input.time || '').trim();
  const meetingLink = String(input.meetingLink || '').trim();

  if (!name || !email || !phone || !date || !time) {
    throw new Error('name, email, phone, date, and time are required');
  }

  return {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: phone.slice(0, 30),
    company: String(input.company || '').trim().slice(0, 200),
    productId: String(input.productId || '').trim(),
    productSlug: slugify(String(input.productSlug || '').trim()),
    categoryId: String(input.categoryId || '').trim(),
    categorySlug: slugify(String(input.categorySlug || '').trim()),
    category: String(input.category || '').trim().slice(0, 120),
    machineInterest: String(input.machineInterest || '').trim().slice(0, 200),
    date,
    time,
    message: String(input.message || '').trim().slice(0, 2000),
    meeting_link: meetingLink.slice(0, 1000),
    source: String(input.source || 'meeting-page').trim().slice(0, 100),
    attribution: normalizeAttributionInput(input.attribution),
  };
}

export function normalizeSiteSettingInput(input: Record<string, unknown>) {
  const key = settingKeyify(String(input.key || '').trim());
  const value = String(input.value || '').trim();
  const jsonValue = input.jsonValue;
  const hasStructuredValue = isPlainObject(jsonValue) || Array.isArray(jsonValue);

  if (!key || (!value && !hasStructuredValue)) {
    throw new Error('key and a value or jsonValue are required');
  }

  return {
    key,
    value,
    json_value: hasStructuredValue ? jsonValue : null,
    label: String(input.label || key).trim(),
    description: String(input.description || '').trim(),
  };
}

export async function listProducts(options?: ReadQueryOptions) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return (options?.publishedOnly
      ? staticProducts.filter((product) => product.published)
      : staticProducts
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  const { data, error } = await runProductQuery(async (select) => {
    let query = supabase
      .from('products')
      .select(select)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false });

    if (options?.publishedOnly) {
      query = query.eq('published', true);
    }

    return query;
  });
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return (options?.publishedOnly
        ? staticProducts.filter((product) => product.published)
        : staticProducts
      ).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    throw error;
  }
  const canonicalProducts = new Map<
    string,
    { product: ProductRecord; sourceWasCanonical: boolean }
  >();

  for (const row of data as ProductRow[]) {
    const product = mapProductRow(row);
    const sourceWasCanonical = row.slug === product.slug;
    const existing = canonicalProducts.get(product.slug);

    if (!existing || (sourceWasCanonical && !existing.sourceWasCanonical)) {
      canonicalProducts.set(product.slug, { product, sourceWasCanonical });
    }
  }

  return Array.from(canonicalProducts.values(), ({ product }) => product);
}

export async function getProductBySlug(
  slug: string,
  options?: ReadQueryOptions,
) {
  const supabase = getSupabaseReadClient(options?.access);
  const canonicalSlug = canonicalizeProductSlug(slug);

  if (!supabase) {
    const match = staticProducts.find(
      (product) =>
        product.slug === canonicalSlug && (!options?.publishedOnly || product.published),
    );
    return match || null;
  }

  const { data, error } = await runProductQuery(async (select) => {
    let query = supabase
      .from('products')
      .select(select)
      .in('slug', getProductSlugCandidates(canonicalSlug));

    if (options?.publishedOnly) {
      query = query.eq('published', true);
    }

    return query;
  });
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      const match = staticProducts.find(
        (product) =>
          product.slug === canonicalSlug && (!options?.publishedOnly || product.published),
      );
      return match || null;
    }
    throw error;
  }
  const rows = Array.isArray(data) ? (data as ProductRow[]) : [];
  const match =
    rows.find((row) => row.slug === canonicalSlug) ||
    rows[0];
  return match ? mapProductRow(match) : null;
}

export async function getProductById(id: string, options?: { access?: ReadAccess }) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return staticProducts.find((product) => product.id === id) || null;
  }

  const { data, error } = await runProductQuery(async (select) =>
    supabase
      .from('products')
      .select(select)
      .eq('id', id)
      .maybeSingle(),
  );

  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return staticProducts.find((product) => product.id === id) || null;
    }
    throw error;
  }
  return data ? mapProductRow(data as ProductRow) : null;
}

export async function createProduct(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = await buildProductPayload(input);
  const { data, error } = await supabase
    .from('products')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return mapProductRow(data as ProductRow);
}

export async function updateProduct(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = await buildProductPayload(input);
  const { data, error } = await supabase
    .from('products')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapProductRow(data as ProductRow);
}

export async function deleteProduct(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

export async function listBlogs(options?: ReadQueryOptions) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return [] as BlogRecord[];
  }

  let query = supabase
    .from('blogs')
    .select('*')
    .order('created_at', { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return [] as BlogRecord[];
    }
    throw error;
  }
  return (data as BlogRow[]).map(mapBlogRow);
}

export async function getBlogBySlug(
  slug: string,
  options?: ReadQueryOptions,
) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return null;
  }

  let query = supabase.from('blogs').select('*').eq('slug', slug);

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return null;
    }
    throw error;
  }
  return data ? mapBlogRow(data as BlogRow) : null;
}

export async function getBlogById(id: string, options?: { access?: ReadAccess }) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return null;
  }

  const { data, error } = await supabase
    .from('blogs')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return null;
    }
    throw error;
  }
  return data ? mapBlogRow(data as BlogRow) : null;
}

export async function createBlog(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = normalizeBlogInput(input);
  const { data, error } = await supabase
    .from('blogs')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return mapBlogRow(data as BlogRow);
}

export async function updateBlog(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = normalizeBlogInput(input);
  const { data, error } = await supabase
    .from('blogs')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapBlogRow(data as BlogRow);
}

export async function deleteBlog(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('blogs').delete().eq('id', id);
  if (error) throw error;
}

export async function listCategories(options?: ReadQueryOptions) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return (options?.publishedOnly
      ? staticCategories.filter((category) => category.published)
      : staticCategories
    ).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  }

  let query = supabase
    .from('product_categories')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('name', { ascending: true });

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return (options?.publishedOnly
        ? staticCategories.filter((category) => category.published)
        : staticCategories
      ).sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
    }
    throw error;
  }
  return (data as CategoryRow[]).map(mapCategoryRow);
}

export async function getCategoryBySlugRecord(
  slug: string,
  options?: ReadQueryOptions,
) {
  const categories = await listCategories(options);
  return categories.find((category) => category.slug === slug) || null;
}

export async function getCategoryById(id: string, options?: { access?: ReadAccess }) {
  const categories = await listCategories({ access: options?.access });
  return categories.find((category) => category.id === id) || null;
}

export async function createCategory(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = normalizeCategoryInput(input);
  const { data, error } = await supabase
    .from('product_categories')
    .insert(payload)
    .select('*')
    .single();

  if (error) throw error;
  return mapCategoryRow(data as CategoryRow);
}

export async function updateCategory(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = normalizeCategoryInput(input);
  const { data, error } = await supabase
    .from('product_categories')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;

  const mappedCategory = mapCategoryRow(data as CategoryRow);
  const syncProducts = await supabase
    .from('products')
    .update({ category: mappedCategory.name })
    .eq('category_id', id);

  if (syncProducts.error) throw syncProducts.error;

  return mappedCategory;
}

export async function deleteCategory(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase
    .from('product_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function listLeads() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as LeadRow[]).map(mapLeadRow);
}

export async function createLead(input: Record<string, unknown>) {
  const payload = normalizeLeadInput(input);
  const submissionId = createSubmissionId();
  const usePublicClient = hasSupabasePublicConfig();
  const supabase = usePublicClient
    ? getSupabasePublic()
    : isSupabaseConfigured()
      ? getSupabaseAdmin()
      : null;

  if (!supabase) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  const relationClient = getSupabaseReadClient('public') || supabase;
  const relations = relationClient
    ? await resolveCatalogRelations(relationClient, payload)
    : { productId: '', categoryId: '', machineInterest: payload.machineInterest };
  const legacyInsertPayload = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    message: payload.message,
    source: payload.source,
    product_id: relations.productId || null,
    category_id: relations.categoryId || null,
    machine_interest: relations.machineInterest,
  };
  const insertPayload = {
    ...legacyInsertPayload,
    submission_id: submissionId,
    landing_path: payload.attribution.landingPath || null,
    referrer: payload.attribution.referrer || null,
    utm_source: payload.attribution.utmSource || null,
    utm_medium: payload.attribution.utmMedium || null,
    utm_campaign: payload.attribution.utmCampaign || null,
    utm_term: payload.attribution.utmTerm || null,
    utm_content: payload.attribution.utmContent || null,
    gclid: payload.attribution.gclid || null,
    gbraid: payload.attribution.gbraid || null,
    wbraid: payload.attribution.wbraid || null,
  };

  if (usePublicClient) {
    const { error } = await supabase.from('leads').insert(insertPayload);

    if (error && isMissingAttributionColumnError(error)) {
      const { error: legacyError } = await supabase.from('leads').insert(legacyInsertPayload);
      if (legacyError) throw legacyError;
    } else if (error) {
      throw error;
    }
    return { id: submissionId };
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(insertPayload)
    .select('id')
    .single();

  if (error && isMissingAttributionColumnError(error)) {
    const legacyResult = await supabase
      .from('leads')
      .insert(legacyInsertPayload)
      .select('id')
      .single();
    if (legacyResult.error) throw legacyResult.error;
    return legacyResult.data as { id: string };
  }
  if (error) throw error;
  return data as { id: string };
}

export async function updateLead(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (typeof input.read === 'boolean') {
    payload.read = input.read;
  }

  if (input.status !== undefined) {
    if (!isLeadStatus(input.status)) {
      throw new LeadUpdateValidationError('Select a valid lead status.');
    }

    const { data: currentLead, error: currentLeadError } = await supabase
      .from('leads')
      .select('status, first_contacted_at')
      .eq('id', id)
      .maybeSingle();

    if (currentLeadError) throw currentLeadError;
    if (!currentLead) {
      throw new LeadUpdateValidationError('Lead not found.');
    }

    payload.status = input.status;

    if (input.status !== 'new') {
      payload.read = true;
    }

    const isContactStage = input.status !== 'new' && input.status !== 'spam';
    if (isContactStage && currentLead.status !== input.status) {
      const contactedAt = new Date().toISOString();
      payload.first_contacted_at = currentLead.first_contacted_at || contactedAt;
      payload.last_contacted_at = contactedAt;
    }
  }

  if (Object.keys(payload).length === 0) {
    throw new LeadUpdateValidationError('No valid lead changes were provided.');
  }

  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapLeadRow(data as LeadRow);
}

export async function deleteLead(id: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

export async function listMeetings() {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data as MeetingRow[]).map(mapMeetingRow);
}

export async function createMeeting(input: Record<string, unknown>) {
  const payload = normalizeMeetingInput(input);
  const submissionId = createSubmissionId();
  const usePublicClient = hasSupabasePublicConfig();
  const supabase = usePublicClient
    ? getSupabasePublic()
    : isSupabaseConfigured()
      ? getSupabaseAdmin()
      : null;

  if (!supabase) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  const relationClient = getSupabaseReadClient('public') || supabase;
  const relations = relationClient
    ? await resolveCatalogRelations(relationClient, payload)
    : { productId: '', categoryId: '', machineInterest: payload.machineInterest };
  const legacyInsertPayload = {
    name: payload.name,
    email: payload.email,
    phone: payload.phone,
    company: payload.company,
    date: payload.date,
    time: payload.time,
    message: payload.message,
    meeting_link: payload.meeting_link,
    product_id: relations.productId || null,
    category_id: relations.categoryId || null,
    machine_interest: relations.machineInterest,
  };
  const insertPayload = {
    ...legacyInsertPayload,
    submission_id: submissionId,
    source: payload.source,
    landing_path: payload.attribution.landingPath || null,
    referrer: payload.attribution.referrer || null,
    utm_source: payload.attribution.utmSource || null,
    utm_medium: payload.attribution.utmMedium || null,
    utm_campaign: payload.attribution.utmCampaign || null,
    gclid: payload.attribution.gclid || null,
  };

  if (usePublicClient) {
    const { error } = await supabase.from('meetings').insert(insertPayload);

    if (error && isMissingAttributionColumnError(error)) {
      const { error: legacyError } = await supabase
        .from('meetings')
        .insert(legacyInsertPayload);
      if (legacyError) throw legacyError;
    } else if (error) {
      throw error;
    }
    return {
      id: submissionId,
      name: insertPayload.name,
      email: insertPayload.email,
      phone: insertPayload.phone,
      company: insertPayload.company,
      productId: relations.productId,
      categoryId: relations.categoryId,
      machineInterest: relations.machineInterest,
      date: insertPayload.date,
      time: insertPayload.time,
      message: insertPayload.message,
      meetingLink: insertPayload.meeting_link,
      status: 'pending',
      adminNotes: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as MeetingRecord;
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert(insertPayload)
    .select('*')
    .single();

  if (error && isMissingAttributionColumnError(error)) {
    const legacyResult = await supabase
      .from('meetings')
      .insert(legacyInsertPayload)
      .select('*')
      .single();
    if (legacyResult.error) throw legacyResult.error;
    return mapMeetingRow(legacyResult.data as MeetingRow);
  }
  if (error) throw error;
  return mapMeetingRow(data as MeetingRow);
}

export async function getMeetingById(id: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from('meetings')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) throw error;
  return data ? mapMeetingRow(data as MeetingRow) : null;
}

export async function updateMeeting(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (typeof input.status === 'string') {
    payload.status = input.status;
  }
  if (typeof input.adminNotes === 'string') {
    payload.admin_notes = input.adminNotes;
  }
  if (typeof input.meetingLink === 'string') {
    payload.meeting_link = input.meetingLink.trim().slice(0, 1000);
  }

  const { data, error } = await supabase
    .from('meetings')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapMeetingRow(data as MeetingRow);
}

export async function listServices(options?: ReadQueryOptions) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return (options?.publishedOnly
      ? staticServices.filter((service) => service.published)
      : staticServices
    ).sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
  }

  let query = supabase
    .from('services')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('title', { ascending: true });

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return (options?.publishedOnly
        ? staticServices.filter((service) => service.published)
        : staticServices
      ).sort((a, b) => a.sortOrder - b.sortOrder || a.title.localeCompare(b.title));
    }
    throw error;
  }
  return (data as ServiceRow[]).map(mapServiceRow);
}

export async function listSiteSettings(options?: { access?: ReadAccess }) {
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return staticSiteSettings;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .order('key', { ascending: true });

  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return staticSiteSettings;
    }
    throw error;
  }
  return (data as SiteSettingRow[]).map(mapSiteSettingRow);
}

export async function getSiteSetting(key: string, options?: { access?: ReadAccess }) {
  const normalizedKey = settingKeyify(key);
  const supabase = getSupabaseReadClient(options?.access);

  if (!supabase) {
    return staticSiteSettings.find((setting) => setting.key === normalizedKey) || null;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('key', normalizedKey)
    .maybeSingle();

  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return staticSiteSettings.find((setting) => setting.key === normalizedKey) || null;
    }
    throw error;
  }
  return data ? mapSiteSettingRow(data as SiteSettingRow) : null;
}

export async function upsertSiteSetting(input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload = normalizeSiteSettingInput(input);
  const { data, error } = await supabase
    .from('site_settings')
    .upsert(payload, { onConflict: 'key' })
    .select('*')
    .single();

  if (error) throw error;
  return mapSiteSettingRow(data as SiteSettingRow);
}

export async function getCatalogPath(options?: { access?: ReadAccess }) {
  const catalogSetting = await getSiteSetting('catalog_path', options);
  return catalogSetting?.value || COMPANY_INFO.catalogPath;
}
