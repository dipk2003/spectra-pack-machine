import type { BlogRecord } from './cms';
import { getEditorialGuide } from './editorial-guides';
import { parseBlogTemplateContent } from './blog-template';
import { resolveGuideProduct } from './editorial-links';
import type { ProductData } from './products';

/** DB records keep their relationships after replacing source-backed articles. */
export function blogRelationships(blog: BlogRecord) {
  const fallback = getEditorialGuide(blog.slug);
  const body = parseBlogTemplateContent(blog.content).body;
  const links = (prefix: string) => Array.from(body.matchAll(new RegExp(`\\]\\(\\/${prefix}\\/([a-z0-9-]+)\\)`, 'g')), match => match[1]);
  const unique = (items: string[]) => Array.from(new Set(items));
  return {
    productSlugs: unique([...(blog.productSlugs || []), ...(fallback?.productSlugs || []), ...links('products')]),
    serviceSlugs: unique([...(blog.serviceSlugs || []), ...(fallback?.serviceSlugs || []), ...links('services')]),
    relatedGuideSlugs: unique([...(blog.relatedGuideSlugs || []), ...(fallback?.relatedGuideSlugs || []), ...links('blog')]),
  };
}

export function blogsForProduct(blogs: BlogRecord[], product: ProductData & { id?: string }, catalog: ProductData[]) {
  return blogs.filter(blog => blog.published && (
    Boolean(product.id && blog.featuredProductId === product.id) ||
    blogRelationships(blog).productSlugs.some(slug => resolveGuideProduct(slug, catalog)?.slug === product.slug)
  ));
}
