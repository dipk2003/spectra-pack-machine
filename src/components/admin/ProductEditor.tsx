'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import type { CategoryRecord, ProductRecord } from '@/lib/cms';
import { buildAdminProductCategories } from '@/lib/admin-products';
import { ArrowLeft, Edit2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadField from '@/components/admin/ImageUploadField';
import styles from './ProductEditor.module.css';

type ProductFormState = {
  title: string;
  slug: string;
  modelNo: string;
  category: string;
  shortDesc: string;
  description: string;
  image: string;
  imageAlt: string;
  featuresText: string;
  specsText: string;
  faqsText: string;
  galleryText: string;
  seoTitle: string;
  seoDesc: string;
  published: boolean;
  sortOrder: number;
};

type ProductEditorProps = {
  categorySlug: string;
  productId?: string;
};

const createEmptyForm = (category = ''): ProductFormState => ({
  title: '',
  slug: '',
  modelNo: '',
  category,
  shortDesc: '',
  description: '',
  image: '',
  imageAlt: '',
  featuresText: '',
  specsText: '',
  faqsText: '',
  galleryText: '',
  seoTitle: '',
  seoDesc: '',
  published: true,
  sortOrder: 0,
});

const generateSlug = (title: string) =>
  title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const parseLines = (value: string) =>
  value
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);

const parseSpecs = (value: string) =>
  parseLines(value).reduce<Record<string, string>>((acc, line) => {
    const [key, ...rest] = line.split(':');
    const cleanedKey = key?.trim();
    const cleanedValue = rest.join(':').trim();

    if (cleanedKey && cleanedValue) {
      acc[cleanedKey] = cleanedValue;
    }

    return acc;
  }, {});

const parseFaqs = (value: string) =>
  parseLines(value)
    .map((line) => {
      const [question, answer] = line.split('::');
      const q = question?.trim();
      const a = answer?.trim();
      if (!q || !a) return null;
      return { q, a };
    })
    .filter((item): item is { q: string; a: string } => Boolean(item));

const serializeSpecs = (specs: Record<string, string>) =>
  Object.entries(specs || {})
    .map(([key, value]) => `${key}: ${value}`)
    .join('\n');

const serializeFaqs = (faqs: Array<{ q: string; a: string }>) =>
  (faqs || []).map((faq) => `${faq.q} :: ${faq.a}`).join('\n');

const productToForm = (product: ProductRecord): ProductFormState => ({
  title: product.title || '',
  slug: product.slug || '',
  modelNo: product.modelNo || '',
  category: product.category || '',
  shortDesc: product.shortDesc || '',
  description: product.description || '',
  image: product.image || '',
  imageAlt: product.imageAlt || '',
  featuresText: (product.features || []).join('\n'),
  specsText: serializeSpecs(product.specs || {}),
  faqsText: serializeFaqs(product.faqs || []),
  galleryText: (product.gallery || []).join('\n'),
  seoTitle: product.seoTitle || '',
  seoDesc: product.seoDesc || '',
  published: Boolean(product.published),
  sortOrder: product.sortOrder || 0,
});

const toPayload = (form: ProductFormState) => ({
  title: form.title,
  slug: form.slug,
  modelNo: form.modelNo,
  category: form.category,
  shortDesc: form.shortDesc,
  description: form.description,
  image: form.image,
  imageAlt: form.imageAlt,
  features: parseLines(form.featuresText),
  specs: parseSpecs(form.specsText),
  faqs: parseFaqs(form.faqsText),
  gallery: parseLines(form.galleryText),
  seoTitle: form.seoTitle,
  seoDesc: form.seoDesc,
  published: form.published,
  sortOrder: Number(form.sortOrder) || 0,
});

const getSaveLabel = (saving: boolean, isEditing: boolean) => {
  if (saving) {
    return isEditing ? 'Updating...' : 'Creating...';
  }

  return isEditing ? 'Update Product' : 'Create Product';
};

const renderMetaItem = (label: string, value: ReactNode) => (
  <div className={styles.metaItem}>
    <span className={styles.metaLabel}>{label}</span>
    <span className={styles.metaValue}>{value}</span>
  </div>
);

export default function ProductEditor({ categorySlug, productId }: ProductEditorProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);
  const returnTo = `/admin/products/${categorySlug}`;
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [form, setForm] = useState<ProductFormState>(createEmptyForm());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let ignore = false;

    const loadData = async () => {
      setLoading(true);

      try {
        const requests: Promise<Response>[] = [fetch('/api/categories'), fetch('/api/products')];

        if (productId) {
          requests.push(fetch(`/api/products/${productId}`));
        }

        const responses = await Promise.all(requests);
        const categoriesRes = responses[0];
        const productsRes = responses[1];
        const productRes = responses[2] ?? null;

        const categoriesData = await categoriesRes.json().catch(() => null);
        const productsData = await productsRes.json().catch(() => null);

        if (!categoriesRes.ok || !productsRes.ok) {
          throw new Error('list');
        }

        const nextCategories = Array.isArray(categoriesData) ? categoriesData : [];
        const nextProducts = Array.isArray(productsData) ? productsData : [];

        if (!ignore) {
          setCategories(nextCategories);
          setProducts(nextProducts);
        }

        if (productRes) {
          if (productRes.status === 404) {
            if (!ignore) setNotFound(true);
            return;
          }

          if (!productRes.ok) {
            throw new Error('product');
          }

          const productData = (await productRes.json()) as ProductRecord;

          if (!ignore) {
            setForm(productToForm(productData));
            setNotFound(false);
          }
        }
      } catch {
        if (!ignore) {
          toast.error('Failed to load product editor');
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
  }, [productId]);

  const categorySummaries = buildAdminProductCategories(categories, products);
  const activeCategory = categorySummaries.find((category) => category.slug === categorySlug) || null;

  useEffect(() => {
    if (!isEditing && activeCategory) {
      setForm((current) => ({
        ...current,
        category: activeCategory.name,
      }));
    }
  }, [activeCategory, isEditing]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeCategory) {
      toast.error('Category not found');
      return;
    }

    setSaving(true);

    const payload = toPayload({
      ...form,
      category: activeCategory.name,
    });

    try {
      let res: Response;

      if (productId) {
        res = await fetch(`/api/products/${productId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.status === 409) {
        toast.error('Product slug already exists');
        return;
      }

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success(productId ? 'Product updated' : 'Product created');
      router.push(returnTo);
      router.refresh();
    } catch {
      toast.error('Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={`${styles.card} ${styles.errorCard}`}>Loading product editor...</div>;
  }

  if (!activeCategory || notFound) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <h1 className={styles.pageTitle}>
          {notFound ? 'Product not found' : 'Category not found'}
        </h1>
        <p>
          {notFound
            ? 'The selected product record could not be loaded.'
            : 'The selected product category could not be found.'}
        </p>
        <Link href={returnTo} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Link href={returnTo} className={styles.backLink}>
        <ArrowLeft size={16} /> Back to {activeCategory.name}
      </Link>

      <div className={styles.header}>
        <span className={styles.eyebrow}>{isEditing ? 'Edit Product' : 'New Product'}</span>
        <h1 className={styles.pageTitle}>
          {isEditing ? 'Edit product in a dedicated screen' : `Add product to ${activeCategory.name}`}
        </h1>
        <p className={styles.pageSubtitle}>
          Product list aur product editor ab alag hain. Is screen par title, slug, image,
          content, specs, SEO, aur publish state structured layout mein manage hoga bina list ke
          beech mein scatter hue.
        </p>
      </div>

      <div className={styles.layout}>
        <section className={`${styles.card} ${styles.formCard}`}>
          <h2>{isEditing ? 'Product Details' : 'Create Product'}</h2>

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
                <label className="form-label">Model No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.modelNo}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, modelNo: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
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

              <div className="form-group">
                <label className="form-label">Category</label>
                <div className={styles.categoryValue}>{activeCategory.name}</div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.shortDesc}
                onChange={(event) =>
                  setForm((current) => ({ ...current, shortDesc: event.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                style={{ minHeight: '180px' }}
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <ImageUploadField
                  label="Primary Image *"
                  required
                  value={form.image}
                  onChange={(value) => setForm((current) => ({ ...current, image: value }))}
                  folder="products"
                  placeholder="/images/products/your-product.png"
                  hint="Drag and drop a product image, upload one, or paste the image URL."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Image Alt</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.imageAlt}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageAlt: event.target.value }))
                  }
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Features</label>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: '150px' }}
                  value={form.featuresText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, featuresText: event.target.value }))
                  }
                  placeholder="One feature per line"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Gallery URLs</label>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: '150px' }}
                  value={form.galleryText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, galleryText: event.target.value }))
                  }
                  placeholder="One image URL per line"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Specifications</label>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: '180px' }}
                  value={form.specsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, specsText: event.target.value }))
                  }
                  placeholder="Capacity: 20 packs/min"
                />
              </div>

              <div className="form-group">
                <label className="form-label">FAQs</label>
                <textarea
                  className="form-input form-textarea"
                  style={{ minHeight: '180px' }}
                  value={form.faqsText}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, faqsText: event.target.value }))
                  }
                  placeholder="Can this run for bottles? :: Yes, it can."
                />
              </div>
            </div>

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

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input
                  type="number"
                  className="form-input"
                  value={form.sortOrder}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      sortOrder: Number(event.target.value),
                    }))
                  }
                />
              </div>

              <div className={styles.checkboxWrap}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        published: event.target.checked,
                      }))
                    }
                  />
                  Publish immediately
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <span className={styles.helpText}>
                Specs use `Label: Value`. FAQs use `Question :: Answer`. Save hone ke baad aap
                seedha is category ki product list par wapas jaoge.
              </span>

              <div className={styles.actionButtons}>
                <Link href={returnTo} className="btn btn-sm btn-outline">
                  Cancel
                </Link>
                <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
                  {isEditing ? <Edit2 size={16} /> : <Plus size={16} />}
                  {getSaveLabel(saving, isEditing)}
                </button>
              </div>
            </div>
          </form>
        </section>

        <aside className={styles.sideColumn}>
          <div className={`${styles.card} ${styles.summaryCard}`}>
            <h2>Product Summary</h2>
            <div className={styles.metaList}>
              {renderMetaItem('Category', activeCategory.name)}
              {renderMetaItem('Status', form.published ? 'Published' : 'Draft')}
              {renderMetaItem('Slug', form.slug || 'Will be generated from title')}
              {renderMetaItem('Model No.', form.modelNo || 'Not added')}
              {renderMetaItem('Sort Order', String(form.sortOrder || 0))}
            </div>
            <p className={styles.summaryText}>
              Yeh screen sirf selected category ke liye hai, isliye galat jagah edit khulne ka
              confusion nahi rahega.
            </p>
          </div>

          <div className={`${styles.card} ${styles.previewCard}`}>
            <h2>Image Preview</h2>
            <div className={styles.previewWrap}>
              {form.image ? (
                <Image
                  src={form.image}
                  alt={form.imageAlt || form.title || 'Product preview'}
                  width={1200}
                  height={900}
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.emptyPreview}>
                  Product image add karte hi yahan visual preview dikh jayega.
                </div>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
