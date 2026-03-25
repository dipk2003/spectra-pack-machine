'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { CategoryRecord } from '@/lib/cms';
import { ArrowLeft, Edit2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import ImageUploadField from '@/components/admin/ImageUploadField';
import styles from './CategoryEditor.module.css';

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  accent: string;
  image: string;
  published: boolean;
  sortOrder: number;
};

type CategoryEditorProps = {
  categoryId?: string;
};

const emptyForm: CategoryFormState = {
  name: '',
  slug: '',
  description: '',
  accent: 'Machine Family',
  image: '',
  published: true,
  sortOrder: 0,
};

const generateSlug = (value: string) =>
  value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const categoryToForm = (category: CategoryRecord): CategoryFormState => ({
  name: category.name,
  slug: category.slug,
  description: category.description,
  accent: category.accent,
  image: category.image,
  published: category.published,
  sortOrder: category.sortOrder,
});

const buildPresetForm = (searchParams: URLSearchParams): CategoryFormState => {
  const name = searchParams.get('name')?.trim() || '';
  const slug = searchParams.get('slug')?.trim() || '';
  const accent = searchParams.get('accent')?.trim() || emptyForm.accent;
  const description = searchParams.get('description')?.trim() || '';
  const image = searchParams.get('image')?.trim() || '';

  return {
    ...emptyForm,
    name,
    slug: generateSlug(slug || name),
    accent,
    description,
    image,
  };
};

const getSaveLabel = (saving: boolean, isEditing: boolean) => {
  if (saving) {
    return isEditing ? 'Updating...' : 'Creating...';
  }

  return isEditing ? 'Update Category' : 'Create Category';
};

const renderMetaItem = (label: string, value: ReactNode) => (
  <div className={styles.metaItem}>
    <span className={styles.metaLabel}>{label}</span>
    <span className={styles.metaValue}>{value}</span>
  </div>
);

export default function CategoryEditor({ categoryId }: CategoryEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isEditing = Boolean(categoryId);
  const returnTo = searchParams.get('returnTo') || '/admin/categories';
  const [form, setForm] = useState<CategoryFormState>(() => buildPresetForm(searchParams));
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!categoryId) {
      return;
    }

    let ignore = false;

    const loadCategory = async () => {
      setLoading(true);

      try {
        const res = await fetch(`/api/categories/${categoryId}`);
        if (res.status === 404) {
          if (!ignore) setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error('load');
        }

        const data = (await res.json()) as CategoryRecord;

        if (!ignore) {
          setForm(categoryToForm(data));
          setNotFound(false);
        }
      } catch {
        if (!ignore) {
          toast.error('Failed to load category');
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    void loadCategory();

    return () => {
      ignore = true;
    };
  }, [categoryId]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    const payload = {
      ...form,
      slug: generateSlug(form.slug || form.name),
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      const res = await fetch(categoryId ? `/api/categories/${categoryId}` : '/api/categories', {
        method: categoryId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.status === 409) {
        toast.error('Category slug already exists');
        return;
      }

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success(categoryId ? 'Category updated' : 'Category created');
      router.push(returnTo);
      router.refresh();
    } catch {
      toast.error('Failed to save category');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className={`${styles.card} ${styles.errorCard}`}>Loading category editor...</div>;
  }

  if (notFound) {
    return (
      <div className={`${styles.card} ${styles.errorCard}`}>
        <h1 className={styles.pageTitle}>Category not found</h1>
        <p>This category could not be found in admin data.</p>
        <Link href={returnTo} className="btn btn-sm btn-outline">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.shell}>
      <Link href={returnTo} className={styles.backLink}>
        <ArrowLeft size={16} /> Back to Categories
      </Link>

      <div className={styles.header}>
        <span className={styles.eyebrow}>{isEditing ? 'Edit Category' : 'New Category'}</span>
        <h1 className={styles.pageTitle}>
          {isEditing ? 'Update category details cleanly' : 'Create a clean category record'}
        </h1>
        <p className={styles.pageSubtitle}>
          Category listing alag hai aur editor alag, isliye edit करते waqt context scattered
          nahi hoga. Yahan name, slug, image, sort order, aur publish state ek hi structured
          screen mein manage karo.
        </p>
      </div>

      <div className={styles.layout}>
        <section className={`${styles.card} ${styles.formCard}`}>
          <h2>{isEditing ? 'Category Details' : 'Create Category'}</h2>

          <form onSubmit={handleSubmit} className={styles.formGrid}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      name: event.target.value,
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

            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Accent Label *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.accent}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, accent: event.target.value }))
                  }
                />
              </div>

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
            </div>

            <div className="form-group">
              <label className="form-label">Category Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
              />
            </div>

            <div className="form-group">
              <ImageUploadField
                label="Card Image URL *"
                required
                value={form.image}
                onChange={(value) => setForm((current) => ({ ...current, image: value }))}
                folder="categories"
                placeholder="https://... or uploaded Supabase image URL"
                hint="Drag and drop the category image, upload one, or paste the image URL."
              />
            </div>

            <div className={styles.checkboxRow}>
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
                Show category on public pages
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
            <h2>Visual Preview</h2>
            <div className={styles.previewWrap}>
              {form.image ? (
                <Image
                  src={form.image}
                  alt={form.name || 'Category preview'}
                  width={1200}
                  height={720}
                  className={styles.previewImage}
                />
              ) : (
                <div className={styles.emptyPreview}>
                  Image add karte hi yahan category card preview dikh jayega.
                </div>
              )}
            </div>
          </div>

          <div className={`${styles.card} ${styles.stateCard}`}>
            <h2>Record Summary</h2>
            <div className={styles.metaList}>
              {renderMetaItem('Status', form.published ? 'Published' : 'Hidden')}
              {renderMetaItem('Slug', form.slug || 'Will be generated from name')}
              {renderMetaItem('Accent', form.accent || 'Machine Family')}
              {renderMetaItem('Sort Order', String(form.sortOrder || 0))}
            </div>
            <p className={styles.stateText}>
              Save ke baad aap seedha categories listing par wapas jaoge, jahan updated card
              clear list format mein dikhega.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
