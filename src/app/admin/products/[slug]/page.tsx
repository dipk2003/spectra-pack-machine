'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { CategoryRecord, ProductRecord } from '@/lib/cms';
import { categoryToSlug } from '@/lib/categories';
import { buildAdminProductCategories } from '@/lib/admin-products';
import { Plus, Edit2, Trash2, Eye, EyeOff, ArrowLeft, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadField from '@/components/admin/ImageUploadField';
import styles from './page.module.css';

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

const productToForm = (product?: ProductRecord): ProductFormState =>
  product
    ? {
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
      }
    : createEmptyForm();

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

export default function AdminCategoryProductsPage() {
  const params = useParams();
  const slug =
    typeof params.slug === 'string'
      ? params.slug
      : Array.isArray(params.slug)
        ? params.slug[0]
        : '';
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(createEmptyForm());

  useEffect(() => {
    const loadData = async () => {
      try {
        const [productsRes, categoriesRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
        ]);
        const [productsData, categoriesData] = await Promise.all([
          productsRes.json().catch(() => null),
          categoriesRes.json().catch(() => null),
        ]);

        setProducts(Array.isArray(productsData) ? productsData : []);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);

        if (!productsRes.ok || !categoriesRes.ok) {
          toast.error('Some product data could not be loaded');
        }
      } catch {
        toast.error('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json().catch(() => null);

      if (!Array.isArray(data)) {
        throw new Error('invalid');
      }

      setProducts(data);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const categorySummaries = buildAdminProductCategories(categories, products);
  const activeCategory = categorySummaries.find((category) => category.slug === slug) || null;
  const categoryProducts = [...products]
    .filter((product) => categoryToSlug(product.category) === slug)
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));

  const startCreateProduct = () => {
    setEditId(null);
    setForm(createEmptyForm(activeCategory?.name || ''));
    setShowForm(true);
  };

  const resetForm = () => {
    setForm(createEmptyForm(activeCategory?.name || ''));
    setEditId(null);
    setShowForm(false);
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!activeCategory) {
      toast.error('Category not found');
      return;
    }

    const payload = toPayload({ ...form, category: activeCategory.name });

    try {
      let res: Response;

      if (editId) {
        res = await fetch(`/api/products/${editId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('update');
        toast.success('Product updated');
      } else {
        res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.status === 409) {
          toast.error('Slug already exists');
          return;
        }
        if (!res.ok) throw new Error('create');
        toast.success('Product created');
      }

      resetForm();
      void refreshProducts();
    } catch {
      toast.error('Failed to save product');
    }
  };

  const editProduct = (product: ProductRecord) => {
    setForm(productToForm(product));
    setEditId(product.id);
    setShowForm(true);
  };

  const deleteProduct = async (id: string) => {
    if (!confirm('Delete this product?')) return;

    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }

    toast.success('Product deleted');
    void refreshProducts();
  };

  const togglePublish = async (product: ProductRecord) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        category: activeCategory?.name || product.category,
        published: !product.published,
      }),
    });

    if (!res.ok) {
      toast.error('Update failed');
      return;
    }

    toast.success(product.published ? 'Unpublished' : 'Published');
    void refreshProducts();
  };

  if (loading) {
    return <div className={styles.empty}>Loading category products...</div>;
  }

  if (!activeCategory) {
    return (
      <div className={styles.notFoundCard}>
        <h1 className={styles.pageTitle}>Category not found</h1>
        <p className={styles.pageSubtitle}>
          This product category does not exist in the admin data.
        </p>
        <Link href="/admin/products" className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back to Categories
        </Link>
      </div>
    );
  }

  return (
    <div>
      <Link href="/admin/products" className={styles.backLink}>
        <ArrowLeft size={16} /> All Product Categories
      </Link>

      <div className={styles.header}>
        <div className={styles.headerCopy}>
          <div className={styles.categoryEyebrow}>{activeCategory.accent}</div>
          <h1 className={styles.pageTitle}>{activeCategory.name}</h1>
          <p className={styles.pageSubtitle}>{activeCategory.description}</p>
          <p className={styles.pageMeta}>
            {categoryProducts.length} {categoryProducts.length === 1 ? 'product' : 'products'} in this
            category
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link href="/admin/categories" className="btn btn-sm btn-outline">
            <Settings2 size={16} /> Edit Category
          </Link>
          <button className="btn btn-primary btn-sm" onClick={startCreateProduct}>
            <Plus size={16} /> New Product
          </button>
        </div>
      </div>

      {!activeCategory.hasCategoryRecord && (
        <div className={styles.notice}>
          This category has products, but its matching card is missing in the Categories tab.
        </div>
      )}

      {showForm && (
        <div className={styles.formCard}>
          <h3>{editId ? 'Edit Product' : `Add Product to ${activeCategory.name}`}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.title}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      title: event.target.value,
                      slug: editId ? form.slug : generateSlug(event.target.value),
                    })
                  }
                />
              </div>
              <div className="form-group">
                <label className="form-label">Model No.</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.modelNo}
                  onChange={(event) => setForm({ ...form, modelNo: event.target.value })}
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
                    setForm({ ...form, slug: generateSlug(event.target.value) })
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
                onChange={(event) => setForm({ ...form, shortDesc: event.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.description}
                style={{ minHeight: '180px' }}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <ImageUploadField
                  label="Primary Image *"
                  required
                  value={form.image}
                  onChange={(value) => setForm({ ...form, image: value })}
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
                  onChange={(event) => setForm({ ...form, imageAlt: event.target.value })}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Features</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.featuresText}
                  style={{ minHeight: '150px' }}
                  onChange={(event) => setForm({ ...form, featuresText: event.target.value })}
                  placeholder="One feature per line"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gallery URLs</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.galleryText}
                  style={{ minHeight: '150px' }}
                  onChange={(event) => setForm({ ...form, galleryText: event.target.value })}
                  placeholder="One image URL per line"
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Specifications</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.specsText}
                  style={{ minHeight: '180px' }}
                  onChange={(event) => setForm({ ...form, specsText: event.target.value })}
                  placeholder="Capacity: 20 packs/min"
                />
              </div>
              <div className="form-group">
                <label className="form-label">FAQs</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.faqsText}
                  style={{ minHeight: '180px' }}
                  onChange={(event) => setForm({ ...form, faqsText: event.target.value })}
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
                  onChange={(event) => setForm({ ...form, seoTitle: event.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.seoDesc}
                  onChange={(event) => setForm({ ...form, seoDesc: event.target.value })}
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
                    setForm({ ...form, sortOrder: Number(event.target.value) })
                  }
                />
              </div>
              <div className={styles.checkboxWrap}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(event) => setForm({ ...form, published: event.target.checked })}
                  />
                  Publish immediately
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <span className={styles.helpText}>
                Specs use `Label: Value`. FAQs use `Question :: Answer`. Products created here stay in this category.
              </span>
              <div className={styles.formBtns}>
                <button type="button" className="btn btn-sm" onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm">
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {categoryProducts.length === 0 ? (
        <div className={styles.empty}>
          No products in this category yet. Add the first product for {activeCategory.name}.
        </div>
      ) : (
        <div className={styles.productList}>
          {categoryProducts.map((product) => (
            <div key={product.id} className={styles.productCard}>
              <div className={styles.productBody}>
                {product.image ? (
                  <div className={styles.productThumbWrap}>
                    <Image
                      src={product.image}
                      alt={product.imageAlt || product.title}
                      width={360}
                      height={360}
                      className={styles.productThumb}
                    />
                  </div>
                ) : null}

                <div className={styles.productContent}>
                  <div className={styles.productHeader}>
                    <div>
                      <h3>{product.title}</h3>
                      <span className={styles.productMeta}>
                        /{product.slug} · {product.modelNo || 'No model'} · sort {product.sortOrder}
                      </span>
                    </div>
                    <span className={`badge ${product.published ? 'badge-success' : 'badge-warning'}`}>
                      {product.published ? 'Published' : 'Draft'}
                    </span>
                  </div>
                  <p className={styles.productExcerpt}>{product.shortDesc}</p>
                  <div className={styles.productActions}>
                    <button className="btn btn-sm btn-outline" onClick={() => editProduct(product)}>
                      <Edit2 size={14} /> Edit
                    </button>
                    <button className="btn btn-sm" onClick={() => togglePublish(product)}>
                      {product.published ? (
                        <>
                          <EyeOff size={14} /> Unpublish
                        </>
                      ) : (
                        <>
                          <Eye size={14} /> Publish
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-sm"
                      style={{ color: 'var(--error)' }}
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
