import { listCategories, listProducts, listSiteSettings } from './cms';
import { getSupabaseAdmin, isSupabaseConfigured } from './supabase';

export const STORAGE_BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'site-assets';

const PUBLIC_STORAGE_PREFIX = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? `${process.env.NEXT_PUBLIC_SUPABASE_URL.replace(/\/+$/, '')}/storage/v1/object/public/${STORAGE_BUCKET}/`
  : '';

const MANAGED_FOLDERS = ['general', 'categories', 'products'] as const;

const looksLikeJson = (value: string) =>
  (value.startsWith('{') && value.endsWith('}')) || (value.startsWith('[') && value.endsWith(']'));

export const getManagedStorageObjectPath = (value: string) => {
  const normalizedValue = value.trim();

  if (!normalizedValue || !PUBLIC_STORAGE_PREFIX || !normalizedValue.startsWith(PUBLIC_STORAGE_PREFIX)) {
    return null;
  }

  const objectPath = normalizedValue.slice(PUBLIC_STORAGE_PREFIX.length).replace(/^\/+/, '');
  if (!objectPath) {
    return null;
  }

  if (!MANAGED_FOLDERS.some((folder) => objectPath === folder || objectPath.startsWith(`${folder}/`))) {
    return null;
  }

  return objectPath;
};

const collectManagedAssetUrlsInto = (value: unknown, urls: Set<string>) => {
  if (typeof value === 'string') {
    const normalizedValue = value.trim();
    const objectPath = getManagedStorageObjectPath(normalizedValue);

    if (objectPath) {
      urls.add(normalizedValue);
      return;
    }

    if (looksLikeJson(normalizedValue)) {
      try {
        collectManagedAssetUrlsInto(JSON.parse(normalizedValue), urls);
      } catch {
        // Ignore malformed JSON-like strings.
      }
    }

    return;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectManagedAssetUrlsInto(item, urls));
    return;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectManagedAssetUrlsInto(item, urls));
  }
};

export const collectManagedAssetUrls = (value: unknown) => {
  const urls = new Set<string>();
  collectManagedAssetUrlsInto(value, urls);
  return Array.from(urls);
};

export async function listReferencedManagedAssetUrls() {
  if (!isSupabaseConfigured()) {
    return [] as string[];
  }

  const [categories, products, settings] = await Promise.all([
    listCategories({ access: 'admin' }),
    listProducts({ access: 'admin' }),
    listSiteSettings({ access: 'admin' }),
  ]);

  const referencedUrls = new Set<string>();

  categories.forEach((category) => {
    collectManagedAssetUrls(category.image).forEach((url) => referencedUrls.add(url));
  });

  products.forEach((product) => {
    collectManagedAssetUrls(product.image).forEach((url) => referencedUrls.add(url));
    collectManagedAssetUrls(product.gallery).forEach((url) => referencedUrls.add(url));
  });

  settings.forEach((setting) => {
    collectManagedAssetUrls(setting.jsonValue).forEach((url) => referencedUrls.add(url));
    collectManagedAssetUrls(setting.value).forEach((url) => referencedUrls.add(url));
  });

  return Array.from(referencedUrls);
}

export async function cleanupUnusedManagedAssets(
  candidateValues: unknown[],
  preservedValues: unknown[] = [],
) {
  if (!isSupabaseConfigured()) {
    return [] as string[];
  }

  const candidateUrls = new Set<string>();
  candidateValues.forEach((value) => {
    collectManagedAssetUrls(value).forEach((url) => candidateUrls.add(url));
  });

  if (candidateUrls.size === 0) {
    return [] as string[];
  }

  const preservedUrls = new Set<string>();
  preservedValues.forEach((value) => {
    collectManagedAssetUrls(value).forEach((url) => preservedUrls.add(url));
  });

  const referencedUrls = new Set(await listReferencedManagedAssetUrls());
  const objectPathsToDelete = Array.from(candidateUrls)
    .filter((url) => !preservedUrls.has(url) && !referencedUrls.has(url))
    .map((url) => getManagedStorageObjectPath(url))
    .filter((path): path is string => Boolean(path));

  if (objectPathsToDelete.length === 0) {
    return [] as string[];
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove(objectPathsToDelete);

  if (error) {
    throw error;
  }

  return objectPathsToDelete;
}
