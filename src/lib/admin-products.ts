import { categoryToSlug } from './categories';
import type { CategoryRecord, ProductRecord } from './cms';

export type AdminProductCategorySummary = {
  categoryId?: string;
  name: string;
  slug: string;
  sortOrder: number;
  productCount: number;
  description: string;
  accent: string;
  image: string;
  published: boolean;
  hasCategoryRecord: boolean;
};

export function buildAdminProductCategories(
  categories: readonly CategoryRecord[],
  products: readonly ProductRecord[],
): AdminProductCategorySummary[] {
  const productCounts = new Map<string, number>();
  const productNames = new Map<string, string>();
  const productImages = new Map<string, string>();
  const categorySummaries: AdminProductCategorySummary[] = categories.map((category, index) => ({
    categoryId: category.id,
    name: category.name,
    slug: category.slug || categoryToSlug(category.name),
    sortOrder: category.sortOrder ?? index,
    productCount: 0,
    description: category.description,
    accent: category.accent,
    image: category.image,
    published: category.published,
    hasCategoryRecord: true,
  }));

  products.forEach((product) => {
    const slug = categoryToSlug(product.category);
    productCounts.set(slug, (productCounts.get(slug) ?? 0) + 1);

    if (!productNames.has(slug)) {
      productNames.set(slug, product.category);
    }

    if (!productImages.has(slug) && product.image) {
      productImages.set(slug, product.image);
    }
  });

  const knownSlugs = new Set(categorySummaries.map((category) => category.slug));

  for (const [slug, productCount] of Array.from(productCounts.entries())) {
    const existingCategory = categorySummaries.find((category) => category.slug === slug);

    if (existingCategory) {
      existingCategory.productCount = productCount;

      if (!existingCategory.image && productImages.has(slug)) {
        existingCategory.image = productImages.get(slug) || '';
      }

      continue;
    }

    if (!knownSlugs.has(slug)) {
      categorySummaries.push({
        categoryId: undefined,
        name: productNames.get(slug) || slug,
        slug,
        sortOrder: Number.MAX_SAFE_INTEGER,
        productCount,
        description:
          'This category is already used by products, but its category card has not been set up yet.',
        accent: 'Needs Setup',
        image: productImages.get(slug) || '',
        published: true,
        hasCategoryRecord: false,
      });
      knownSlugs.add(slug);
    }
  }

  return categorySummaries.sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}
