'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { BlogRecord, CategoryRecord, ProductRecord } from '@/lib/cms';
import { parseBlogTemplateContent, serializeBlogTemplateContent } from '@/lib/blog-template';
import { ArrowLeft, Edit2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadField from '@/components/admin/ImageUploadField';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import styles from './BlogEditor.module.css';

type BlogFormState = {
  title: string;
  slug: string;
  excerpt: string;
  image: string;
  body: string;
  leftImage: string;
  leftImageAlt: string;
  rightImage: string;
  rightImageAlt: string;
  categoryId: string;
  featuredProductId: string;
  seoTitle: string;
  seoDesc: string;
  published: boolean;
};

type BlogEditorProps = {
  blogId?: string;
};

const emptyForm: BlogFormState = {
  title: '',
  slug: '',
  excerpt: '',
  image: '',
  body: '',
  leftImage: '',
  leftImageAlt: '',
  rightImage: '',
  rightImageAlt: '',
  categoryId: '',
  featuredProductId: '',
  seoTitle: '',
  seoDesc: '',
  published: false,
};

const generateSlug = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

const blogToForm = (blog: BlogRecord): BlogFormState => {
  const layout = parseBlogTemplateContent(blog.content || '');

  return {
    title: blog.title || '',
    slug: blog.slug || '',
    excerpt: blog.excerpt || '',
    image: blog.image || '',
    body: layout.body,
    leftImage: layout.leftImage,
    leftImageAlt: layout.leftImageAlt,
    rightImage: layout.rightImage,
    rightImageAlt: layout.rightImageAlt,
    categoryId: blog.categoryId || '',
    featuredProductId: blog.featuredProductId || '',
    seoTitle: blog.seoTitle || '',
    seoDesc: blog.seoDesc || '',
    published: Boolean(blog.published),
  };
};

const getSaveLabel = (saving: boolean, isEditing: boolean) => {
  if (saving) {
    return isEditing ? 'Updating...' : 'Creating...';
  }

  return isEditing ? 'Update Blog' : 'Create Blog';
};

export default function BlogEditor({ blogId }: BlogEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(blogId);
  const returnTo = '/admin/blogs';
  const [form, setForm] = useState<BlogFormState>(emptyForm);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);

      try {
        const requests: Promise<Response>[] = [
          fetch('/api/categories'),
          fetch('/api/products'),
        ];

        if (blogId) {
          requests.push(fetch(`/api/blogs/${blogId}`));
        }

        const responses = await Promise.all(requests);
        const categoriesRes = responses[0];
        const productsRes = responses[1];
        const blogRes = responses[2] ?? null;

        const categoriesData = await categoriesRes.json().catch(() => null);
        const productsData = await productsRes.json().catch(() => null);

        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error('list');
        }

        if (!ignore) {
          setCategories(Array.isArray(categoriesData) ? categoriesData : []);
          setProducts(Array.isArray(productsData) ? productsData : []);
        }

        if (blogRes) {
          if (blogRes.status === 404) {
            if (!ignore) setNotFound(true);
            return;
          }

          if (!blogRes.ok) {
            throw new Error('load');
          }

          const data = (await blogRes.json()) as BlogRecord;

          if (!ignore) {
            setForm(blogToForm(data));
            setNotFound(false);
          }
        } else if (!ignore) {
          setForm(emptyForm);
        }
      } catch {
        if (!ignore) {
          toast.error('Failed to load blog editor');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadData();

    return () => {
      ignore = true;
    };
  }, [blogId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const payload = {
        title: form.title,
        slug: generateSlug(form.slug || form.title),
        excerpt: form.excerpt,
        image: form.image,
        content: serializeBlogTemplateContent({
          body: form.body,
          leftImage: form.leftImage,
          leftImageAlt: form.leftImageAlt,
          rightImage: form.rightImage,
          rightImageAlt: form.rightImageAlt,
        }),
        categoryId: form.categoryId,
        featuredProductId: form.featuredProductId,
        seoTitle: form.seoTitle,
        seoDesc: form.seoDesc,
        published: form.published,
      };

      const res = await fetch(blogId ? `/api/blogs/${blogId}` : '/api/blogs', {
        method: blogId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        toast.error('Blog slug already exists');
        return;
      }

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success(blogId ? 'Blog updated' : 'Blog created');
      router.push(returnTo);
      router.refresh();
    } catch {
      toast.error('Failed to save blog');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={`${styles.card} ${styles.errorCard}`}>Loading blog editor...</div>;
  }

  if (notFound) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <h1 className={styles.pageTitle}>Blog not found</h1>
        <p>This blog post could not be found in admin data.</p>
        <Link href={returnTo} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>
    );
  }

  const selectedCategory =
    categories.find((category) => category.id === form.categoryId) || null;
  const selectedProduct =
    products.find((product) => product.id === form.featuredProductId) || null;

  return (
    <div className={styles.shell}>
      <Link href={returnTo} className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Blogs
      </Link>

      <div className={styles.header}>
        <span className={styles.eyebrow}>{isEditing ? 'Edit Blog' : 'New Blog'}</span>
        <h1 className={styles.pageTitle}>
          {isEditing ? 'Update blog template on a separate page' : 'Create a richer blog template'}
        </h1>
        <p className={styles.pageSubtitle}>
          Heading ke liye background image, body ke liye left/right support images, aur related
          product ya category link yahin se set karo.
        </p>
      </div>

      <div className={styles.layout}>
        <section className={`${styles.card} ${styles.formCard}`}>
          <h2>{isEditing ? 'Blog Details' : 'Create Blog'}</h2>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      title: event.target.value,
                      slug: isEditing ? current.slug : generateSlug(event.target.value),
                    }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Slug *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.slug}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      slug: generateSlug(event.target.value),
                    }))
                  }
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Excerpt *</label>
              <textarea
                className="form-input form-textarea"
                rows={3}
                required
                value={form.excerpt}
                onChange={(event) =>
                  setForm((current) => ({ ...current, excerpt: event.target.value }))
                }
              />
            </div>

            <section className={styles.editorSection}>
              <div className={styles.sectionIntro}>
                <h3 className={styles.sectionTitle}>Heading Background</h3>
                <p className={styles.sectionText}>
                  Yeh image public blog page ke heading background me show hogi.
                </p>
              </div>

              <ImageUploadField
                label="Hero / Heading Image *"
                value={form.image}
                onChange={(value) => setForm((current) => ({ ...current, image: value }))}
                folder="general"
                required
                hint="Wide image use karo taaki heading background clean dikhe."
              />
            </section>

            <section className={styles.editorSection}>
              <div className={styles.sectionIntro}>
                <h3 className={styles.sectionTitle}>Article Body</h3>
                <p className={styles.sectionText}>
                  Main text beech me rahega, aur optional left/right support images side me render hongi.
                </p>
              </div>

              <div className="form-group">
                <label className="form-label">Body Content *</label>
                <textarea
                  className="form-input form-textarea"
                  required
                  style={{ minHeight: '260px' }}
                  value={form.body}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, body: event.target.value }))
                  }
                />
              </div>

              <div className={styles.formRow}>
                <div>
                  <ImageUploadField
                    label="Left Image"
                    value={form.leftImage}
                    onChange={(value) => setForm((current) => ({ ...current, leftImage: value }))}
                    folder="general"
                    hint="Article text ke left side me dikhegi."
                  />
                </div>

                <div>
                  <ImageUploadField
                    label="Right Image"
                    value={form.rightImage}
                    onChange={(value) => setForm((current) => ({ ...current, rightImage: value }))}
                    folder="general"
                    hint="Article text ke right side me dikhegi."
                  />
                </div>
              </div>

              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Left Image Alt</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.leftImageAlt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, leftImageAlt: event.target.value }))
                    }
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Right Image Alt</label>
                  <input
                    type="text"
                    className="form-input"
                    value={form.rightImageAlt}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, rightImageAlt: event.target.value }))
                    }
                  />
                </div>
              </div>
            </section>

            <section className={styles.editorSection}>
              <div className={styles.sectionIntro}>
                <h3 className={styles.sectionTitle}>Related Link</h3>
                <p className={styles.sectionText}>
                  Neeche related product ya category CTA show karne ke liye yahan se select karo.
                </p>
              </div>

              <div className={styles.formRow}>
                <div className="form-group">
                  <label className="form-label">Related Product</label>
                  <select
                    className="form-input"
                    value={form.featuredProductId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, featuredProductId: event.target.value }))
                    }
                  >
                    <option value="">No product link</option>
                    {products.map((product) => (
                      <option key={product.id} value={product.id}>
                        {product.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Related Category</label>
                  <select
                    className="form-input"
                    value={form.categoryId}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, categoryId: event.target.value }))
                    }
                  >
                    <option value="">No category link</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">SEO Title</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.seoTitle}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, seoTitle: event.target.value }))
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.seoDesc}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, seoDesc: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className={styles.checkboxRow}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, published: event.target.checked }))
                  }
                />
                Publish immediately
              </label>
            </div>

            <div className={styles.formActions}>
              <Link href={returnTo} className="btn btn-sm btn-outline">
                Cancel
              </Link>

              <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                {getSaveLabel(saving, isEditing)}
              </button>
            </div>
          </form>
        </section>

        <aside className={styles.sideColumn}>
          <div className={`${styles.card} ${styles.previewCard}`}>
            <h2>Template Preview</h2>

            <div
              className={styles.heroPreview}
              style={
                form.image
                  ? {
                      backgroundImage: `linear-gradient(135deg, rgba(8, 17, 34, 0.88), rgba(8, 17, 34, 0.45)), url(${form.image})`,
                    }
                  : undefined
              }
            >
              <span className={styles.previewBadge}>Blog Hero</span>
              <h3>{form.title || 'Blog heading title'}</h3>
              <p>{form.excerpt || 'Short intro line yahan dikhega.'}</p>
            </div>

            <div className={styles.sideImageGrid}>
              <div className={styles.sideImageCard}>
                {form.leftImage ? (
                  <Image
                    src={form.leftImage}
                    alt={form.leftImageAlt || 'Left article visual'}
                    width={1200}
                    height={720}
                    className={styles.sideImage}
                    unoptimized={shouldBypassNextImageOptimization(form.leftImage)}
                  />
                ) : (
                  <div className={styles.emptyPreview}>Left image</div>
                )}
              </div>

              <div className={styles.sideImageCard}>
                {form.rightImage ? (
                  <Image
                    src={form.rightImage}
                    alt={form.rightImageAlt || 'Right article visual'}
                    width={1200}
                    height={720}
                    className={styles.sideImage}
                    unoptimized={shouldBypassNextImageOptimization(form.rightImage)}
                  />
                ) : (
                  <div className={styles.emptyPreview}>Right image</div>
                )}
              </div>
            </div>
          </div>

          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h2>Link Summary</h2>

            <div className={styles.metaList}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Slug</span>
                <span className={styles.metaValue}>/{form.slug || 'your-blog-slug'}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Product CTA</span>
                <span className={styles.metaValue}>{selectedProduct?.title || 'Not selected'}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Category CTA</span>
                <span className={styles.metaValue}>{selectedCategory?.name || 'Not selected'}</span>
              </div>

              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Status</span>
                <span className={styles.metaValue}>{form.published ? 'Published' : 'Draft'}</span>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
