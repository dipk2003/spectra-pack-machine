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
  const categorySummaryById = new Map(
    categorySummaries
      .filter((category): category is AdminProductCategorySummary & { categoryId: string } =>
        Boolean(category.categoryId),
      )
      .map((category) => [category.categoryId, category]),
  );
  const categorySummaryBySlug = new Map(
    categorySummaries.map((category) => [category.slug, category]),
  );

  products.forEach((product) => {
    const slug = product.categorySlug || categoryToSlug(product.category);
    const existingCategory =
      (product.categoryId ? categorySummaryById.get(product.categoryId) : undefined) ||
      categorySummaryBySlug.get(slug);

    if (existingCategory) {
      existingCategory.productCount += 1;

      if (!existingCategory.image && product.image) {
        existingCategory.image = product.image;
      }

      if (!existingCategory.categoryId && product.categoryId) {
        existingCategory.categoryId = product.categoryId;
      }

      return;
    }

    const placeholderCategory: AdminProductCategorySummary = {
      categoryId: product.categoryId || undefined,
      name: product.category,
      slug,
      sortOrder: Number.MAX_SAFE_INTEGER,
      productCount: 1,
      description:
        'This category is already used by products, but its category card has not been set up yet.',
      accent: 'Needs Setup',
      image: product.image || '',
      published: true,
      hasCategoryRecord: false,
    };

    categorySummaries.push(placeholderCategory);
    categorySummaryBySlug.set(slug, placeholderCategory);

    if (placeholderCategory.categoryId) {
      categorySummaryById.set(
        placeholderCategory.categoryId,
        placeholderCategory as AdminProductCategorySummary & { categoryId: string },
      );
    }
  });

  return categorySummaries.sort(
    (left, right) => left.sortOrder - right.sortOrder || left.name.localeCompare(right.name),
  );
}
