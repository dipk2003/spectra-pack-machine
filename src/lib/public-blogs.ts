import { getBlogBySlug, listBlogs } from './cms';
import { getEditorialGuide, mergePublicBlogs } from './editorial-guides';

export async function listPublicBlogs() {
  // A CMS outage must not hide the independent, versioned guide library.
  const cmsBlogs = await listBlogs({ publishedOnly: true, access: 'public' }).catch(() => []);
  return mergePublicBlogs(cmsBlogs);
}

export async function getPublicBlogBySlug(slug: string) {
  const cmsBlog = await getBlogBySlug(slug, { publishedOnly: true, access: 'public' }).catch(() => null);
  return cmsBlog || getEditorialGuide(slug);
}
