import type { SupabaseClient } from '@supabase/supabase-js';
import { categoryToSlug, getCategoryShowcase } from './categories';
import { COMPANY_INFO, PRODUCTS, groupProductsByCategory, type ProductData } from './data';
import {
  getSupabaseAdmin,
  getSupabasePublic,
  hasSupabasePublicConfig,
  isSupabaseConfigured,
} from './supabase';

export interface ProductRecord extends ProductData {
  id: string;
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
  message: string;
  source: string;
  read: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MeetingRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  date: string;
  time: string;
  message: string;
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
  label: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

type ProductRow = {
  id: string;
  title: string;
  slug: string;
  model_no: string | null;
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
};

type BlogRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  image: string | null;
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
  message: string;
  source: string | null;
  read: boolean | null;
  created_at: string;
  updated_at: string;
};

type MeetingRow = {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string | null;
  date: string;
  time: string;
  message: string | null;
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
  label: string | null;
  description: string | null;
  created_at: string;
  updated_at: string;
};

const DEFAULT_BLOG_IMAGE = '/images/brand/spectra-pack-logo.png';
const EPOCH = new Date(0).toISOString();

const isPlainObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const toStringArray = (value: unknown) =>
  Array.isArray(value)
    ? value
        .filter((item): item is string => typeof item === 'string')
        .map((item) => item.trim())
        .filter(Boolean)
    : [];

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

const getSupabaseReadClient = (): SupabaseClient | null => {
  if (isSupabaseConfigured()) return getSupabaseAdmin();
  if (hasSupabasePublicConfig()) return getSupabasePublic();
  return null;
};

const mapStaticProduct = (product: ProductData, index: number): ProductRecord => ({
  id: product.slug,
  title: product.title,
  slug: product.slug,
  modelNo: product.modelNo,
  category: product.category,
  shortDesc: product.shortDesc,
  description: product.description,
  features: product.features,
  specs: product.specs,
  faqs: product.faqs,
  image: product.image,
  imageAlt: product.imageAlt,
  gallery: [product.image],
  seoTitle: `${product.title} | Spectra Pack Machines`,
  seoDesc: product.shortDesc,
  published: true,
  sortOrder: index,
  createdAt: EPOCH,
  updatedAt: EPOCH,
});

const staticProducts = PRODUCTS.map(mapStaticProduct);

const staticCategories: CategoryRecord[] = groupProductsByCategory(PRODUCTS).map((group, index) => {
  const showcase = getCategoryShowcase(group.category, group.items);
  return {
    id: categoryToSlug(group.category),
    name: group.category,
    slug: categoryToSlug(group.category),
    description: showcase.description,
    accent: showcase.accent,
    image: showcase.image,
    published: true,
    sortOrder: index,
    createdAt: EPOCH,
    updatedAt: EPOCH,
  };
});

const staticSiteSettings: SiteSettingRecord[] = [
  {
    id: 'catalog-path',
    key: 'catalog_path',
    value: COMPANY_INFO.catalogPath,
    label: 'Catalog PDF',
    description: 'Public PDF path or full URL used for Download Catalog links.',
    createdAt: EPOCH,
    updatedAt: EPOCH,
  },
];

const mapProductRow = (row: ProductRow): ProductRecord => {
  const gallery = toStringArray(row.gallery);
  const image = row.image || '';
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    modelNo: row.model_no || '',
    category: row.category,
    shortDesc: row.short_desc,
    description: row.description,
    features: toStringArray(row.features),
    specs: toSpecsRecord(row.specs),
    faqs: toFaqArray(row.faqs),
    image,
    imageAlt: row.image_alt || row.title,
    gallery: gallery.length > 0 ? gallery : image ? [image] : [],
    seoTitle: row.seo_title || row.title,
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
  image: row.image || DEFAULT_BLOG_IMAGE,
  seoTitle: row.seo_title || row.title,
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
  message: row.message,
  source: row.source || 'contact',
  read: Boolean(row.read),
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapMeetingRow = (row: MeetingRow): MeetingRecord => ({
  id: row.id,
  name: row.name,
  email: row.email,
  phone: row.phone,
  company: row.company || '',
  date: row.date,
  time: row.time,
  message: row.message || '',
  status: row.status || 'pending',
  adminNotes: row.admin_notes || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapCategoryRow = (row: CategoryRow): CategoryRecord => ({
  id: row.id,
  name: row.name,
  slug: row.slug,
  description: row.description,
  accent: row.accent || 'Machine Family',
  image: row.image,
  published: Boolean(row.published),
  sortOrder: row.sort_order ?? 0,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

const mapSiteSettingRow = (row: SiteSettingRow): SiteSettingRecord => ({
  id: row.id,
  key: row.key,
  value: row.value,
  label: row.label || row.key,
  description: row.description || '',
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export function normalizeProductInput(input: Record<string, unknown>) {
  const title = String(input.title || '').trim();
  const slug = slugify(String(input.slug || title));
  const category = String(input.category || '').trim();
  const shortDesc = String(input.shortDesc || '').trim();
  const description = String(input.description || '').trim();
  const image = String(input.image || '').trim();

  if (!title || !slug || !category || !shortDesc || !description || !image) {
    throw new Error(
      'title, slug, category, shortDesc, description, and image are required',
    );
  }

  return {
    title,
    slug,
    model_no: String(input.modelNo || '').trim(),
    category,
    short_desc: shortDesc,
    description,
    features: toStringArray(input.features),
    specs: toSpecsRecord(input.specs),
    faqs: toFaqArray(input.faqs),
    image,
    image_alt: String(input.imageAlt || title).trim(),
    gallery: toStringArray(input.gallery),
    seo_title: String(input.seoTitle || title).trim(),
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

  if (!title || !slug || !excerpt || !content) {
    throw new Error('title, slug, excerpt, and content are required');
  }

  return {
    title,
    slug,
    excerpt,
    content,
    image: String(input.image || DEFAULT_BLOG_IMAGE).trim(),
    seo_title: String(input.seoTitle || title).trim(),
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
    image,
    published: input.published === undefined ? true : Boolean(input.published),
    sort_order: toSortOrder(input.sortOrder),
  };
}

export function normalizeLeadInput(input: Record<string, unknown>) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  const phone = String(input.phone || '').trim();
  const message = String(input.message || '').trim();

  if (!name || !email || !phone || !message) {
    throw new Error('name, email, phone, and message are required');
  }

  return {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: phone.slice(0, 50),
    company: String(input.company || '').trim().slice(0, 200),
    message: message.slice(0, 2000),
    source: String(input.source || 'contact').trim().slice(0, 100),
  };
}

export function normalizeMeetingInput(input: Record<string, unknown>) {
  const name = String(input.name || '').trim();
  const email = String(input.email || '').trim();
  const phone = String(input.phone || '').trim();
  const date = String(input.date || '').trim();
  const time = String(input.time || '').trim();

  if (!name || !email || !phone || !date || !time) {
    throw new Error('name, email, phone, date, and time are required');
  }

  return {
    name: name.slice(0, 200),
    email: email.slice(0, 200),
    phone: phone.slice(0, 50),
    company: String(input.company || '').trim().slice(0, 200),
    date,
    time,
    message: String(input.message || '').trim().slice(0, 2000),
  };
}

export function normalizeSiteSettingInput(input: Record<string, unknown>) {
  const key = settingKeyify(String(input.key || '').trim());
  const value = String(input.value || '').trim();

  if (!key || !value) {
    throw new Error('key and value are required');
  }

  return {
    key,
    value,
    label: String(input.label || key).trim(),
    description: String(input.description || '').trim(),
  };
}

export async function listProducts(options?: { publishedOnly?: boolean }) {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return (options?.publishedOnly
      ? staticProducts.filter((product) => product.published)
      : staticProducts
    ).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  let query = supabase
    .from('products')
    .select('*')
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: false });

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query;
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      return (options?.publishedOnly
        ? staticProducts.filter((product) => product.published)
        : staticProducts
      ).sort((a, b) => a.sortOrder - b.sortOrder);
    }
    throw error;
  }
  return (data as ProductRow[]).map(mapProductRow);
}

export async function getProductBySlug(
  slug: string,
  options?: { publishedOnly?: boolean },
) {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    const match = staticProducts.find(
      (product) =>
        product.slug === slug && (!options?.publishedOnly || product.published),
    );
    return match || null;
  }

  let query = supabase.from('products').select('*').eq('slug', slug);

  if (options?.publishedOnly) {
    query = query.eq('published', true);
  }

  const { data, error } = await query.maybeSingle();
  if (error) {
    if (isMissingSupabaseTableError(error)) {
      const match = staticProducts.find(
        (product) =>
          product.slug === slug && (!options?.publishedOnly || product.published),
      );
      return match || null;
    }
    throw error;
  }
  return data ? mapProductRow(data as ProductRow) : null;
}

export async function getProductById(id: string) {
  const supabase = getSupabaseReadClient();

  if (!supabase) {
    return staticProducts.find((product) => product.id === id) || null;
  }

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .maybeSingle();

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
  const payload = normalizeProductInput(input);
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
  const payload = normalizeProductInput(input);
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

export async function listBlogs(options?: { publishedOnly?: boolean }) {
  const supabase = getSupabaseReadClient();

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
  options?: { publishedOnly?: boolean },
) {
  const supabase = getSupabaseReadClient();

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

export async function getBlogById(id: string) {
  const supabase = getSupabaseReadClient();

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

export async function listCategories(options?: { publishedOnly?: boolean }) {
  const supabase = getSupabaseReadClient();

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
  options?: { publishedOnly?: boolean },
) {
  const categories = await listCategories(options);
  return categories.find((category) => category.slug === slug) || null;
}

export async function getCategoryById(id: string) {
  const categories = await listCategories();
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
  return mapCategoryRow(data as CategoryRow);
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
  if (!isSupabaseConfigured()) {
    return [] as LeadRecord[];
  }

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
  const supabase = isSupabaseConfigured()
    ? getSupabaseAdmin()
    : hasSupabasePublicConfig()
      ? getSupabasePublic()
      : null;

  if (!supabase) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function updateLead(id: string, input: Record<string, unknown>) {
  const supabase = getSupabaseAdmin();
  const payload: Record<string, unknown> = {};

  if (typeof input.read === 'boolean') {
    payload.read = input.read;
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
  if (!isSupabaseConfigured()) {
    return [] as MeetingRecord[];
  }

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
  const supabase = isSupabaseConfigured()
    ? getSupabaseAdmin()
    : hasSupabasePublicConfig()
      ? getSupabasePublic()
      : null;

  if (!supabase) {
    throw new Error(
      'Supabase public env is missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_DEFAULT_KEY.',
    );
  }

  const { data, error } = await supabase
    .from('meetings')
    .insert(payload)
    .select('id')
    .single();

  if (error) throw error;
  return data as { id: string };
}

export async function getMeetingById(id: string) {
  if (!isSupabaseConfigured()) {
    return null;
  }

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

  const { data, error } = await supabase
    .from('meetings')
    .update(payload)
    .eq('id', id)
    .select('*')
    .single();

  if (error) throw error;
  return mapMeetingRow(data as MeetingRow);
}

export async function listSiteSettings() {
  const supabase = getSupabaseReadClient();

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

export async function getSiteSetting(key: string) {
  const normalizedKey = settingKeyify(key);
  const supabase = getSupabaseReadClient();

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

export async function getCatalogPath() {
  const catalogSetting = await getSiteSetting('catalog_path');
  return catalogSetting?.value || COMPANY_INFO.catalogPath;
}
