'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { CategoryRecord, ProductRecord } from '@/lib/cms';
import { Plus, Edit2, Trash2, Eye, EyeOff } from 'lucide-react';
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

const emptyForm: ProductFormState = {
  title: '',
  slug: '',
  modelNo: '',
  category: '',
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
};

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
    : emptyForm;

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

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  useEffect(() => {
    void Promise.all([fetchProducts(), fetchCategories()]);
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products');
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch {
      toast.error('Failed to load products');
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch {
      toast.error('Failed to load categories');
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowForm(false);
  };

  const categoryNames = categories.map((category) => category.name);
  const categorySortOrder = new Map(
    categories.map((category, index) => [category.name, category.sortOrder ?? index]),
  );
  const groupedProductsMap = new Map<
    string,
    { category: string; sortOrder: number; items: ProductRecord[] }
  >();

  [...products]
    .sort((left, right) => {
      const leftOrder = categorySortOrder.get(left.category) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = categorySortOrder.get(right.category) ?? Number.MAX_SAFE_INTEGER;

      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }

      if (left.category !== right.category) {
        return left.category.localeCompare(right.category);
      }

      if (left.sortOrder !== right.sortOrder) {
        return left.sortOrder - right.sortOrder;
      }

      return left.title.localeCompare(right.title);
    })
    .forEach((product) => {
      const existing = groupedProductsMap.get(product.category);

      if (existing) {
        existing.items.push(product);
        return;
      }

      groupedProductsMap.set(product.category, {
        category: product.category,
        sortOrder: categorySortOrder.get(product.category) ?? Number.MAX_SAFE_INTEGER,
        items: [product],
      });
    });

  const groupedProducts = Array.from(groupedProductsMap.values()).sort(
    (left, right) =>
      left.sortOrder - right.sortOrder || left.category.localeCompare(right.category),
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = toPayload(form);

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
      void fetchProducts();
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
    void fetchProducts();
  };

  const togglePublish = async (product: ProductRecord) => {
    const res = await fetch(`/api/products/${product.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...product,
        published: !product.published,
      }),
    });

    if (!res.ok) {
      toast.error('Update failed');
      return;
    }

    toast.success(product.published ? 'Unpublished' : 'Published');
    void fetchProducts();
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Products</h1>
          <p className={styles.pageSubtitle}>{products.length} total products</p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={16} /> New Product
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>{editId ? 'Edit Product' : 'Create Product'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.title}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      title: e.target.value,
                      slug: editId ? form.slug : generateSlug(e.target.value),
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
                  onChange={(e) => setForm({ ...form, modelNo: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, slug: generateSlug(e.target.value) })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input
                  type="text"
                  className="form-input"
                  list="product-category-options"
                  required
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                />
                <datalist id="product-category-options">
                  {categoryNames.map((name) => (
                    <option key={name} value={name} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.shortDesc}
                onChange={(e) => setForm({ ...form, shortDesc: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Full Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.description}
                style={{ minHeight: '180px' }}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, imageAlt: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, featuresText: e.target.value })}
                  placeholder="One feature per line"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Gallery URLs</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.galleryText}
                  style={{ minHeight: '150px' }}
                  onChange={(e) => setForm({ ...form, galleryText: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, specsText: e.target.value })}
                  placeholder="Capacity: 20 packs/min"
                />
              </div>
              <div className="form-group">
                <label className="form-label">FAQs</label>
                <textarea
                  className="form-input form-textarea"
                  value={form.faqsText}
                  style={{ minHeight: '180px' }}
                  onChange={(e) => setForm({ ...form, faqsText: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, seoTitle: e.target.value })}
                />
              </div>
              <div className="form-group">
                <label className="form-label">SEO Description</label>
                <input
                  type="text"
                  className="form-input"
                  value={form.seoDesc}
                  onChange={(e) => setForm({ ...form, seoDesc: e.target.value })}
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
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                />
              </div>
              <div className={styles.checkboxWrap}>
                <label className={styles.checkbox}>
                  <input
                    type="checkbox"
                    checked={form.published}
                    onChange={(e) => setForm({ ...form, published: e.target.checked })}
                  />
                  Publish immediately
                </label>
              </div>
            </div>

            <div className={styles.formActions}>
              <span className={styles.helpText}>
                Specs use `Label: Value`. FAQs use `Question :: Answer`. Category should match a category name from the Categories tab.
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

      {products.length === 0 ? (
        <div className={styles.empty}>No products yet. Create your first product!</div>
      ) : (
        <div className={styles.groupList}>
          {groupedProducts.map((group) => (
            <section key={group.category} className={styles.productGroup}>
              <div className={styles.groupHeader}>
                <div>
                  <h2 className={styles.groupTitle}>{group.category}</h2>
                  <p className={styles.groupMeta}>
                    {group.items.length} {group.items.length === 1 ? 'product' : 'products'}
                  </p>
                </div>
              </div>

              <div className={styles.productList}>
                {group.items.map((product) => (
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
                            {product.published ? <><EyeOff size={14} /> Unpublish</> : <><Eye size={14} /> Publish</>}
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
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
