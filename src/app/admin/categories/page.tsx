'use client';

import { useEffect, useState } from 'react';
import type { CategoryRecord } from '@/lib/cms';
import { Edit2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

type CategoryFormState = {
  name: string;
  slug: string;
  description: string;
  accent: string;
  image: string;
  published: boolean;
  sortOrder: number;
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

const categoryToForm = (category?: CategoryRecord): CategoryFormState =>
  category
    ? {
        name: category.name,
        slug: category.slug,
        description: category.description,
        accent: category.accent,
        image: category.image,
        published: category.published,
        sortOrder: category.sortOrder,
      }
    : emptyForm;

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<CategoryFormState>(emptyForm);

  useEffect(() => {
    void fetchCategories();
  }, []);

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

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const payload = {
      ...form,
      slug: generateSlug(form.slug || form.name),
      sortOrder: Number(form.sortOrder) || 0,
    };

    try {
      const res = await fetch(editId ? `/api/categories/${editId}` : '/api/categories', {
        method: editId ? 'PUT' : 'POST',
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

      toast.success(editId ? 'Category updated' : 'Category created');
      resetForm();
      void fetchCategories();
    } catch {
      toast.error('Failed to save category');
    }
  };

  const editCategory = (category: CategoryRecord) => {
    setForm(categoryToForm(category));
    setEditId(category.id);
    setShowForm(true);
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      toast.error('Delete failed');
      return;
    }

    toast.success('Category deleted');
    void fetchCategories();
  };

  const togglePublish = async (category: CategoryRecord) => {
    const res = await fetch(`/api/categories/${category.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...category,
        published: !category.published,
      }),
    });

    if (!res.ok) {
      toast.error('Update failed');
      return;
    }

    toast.success(category.published ? 'Category hidden' : 'Category published');
    void fetchCategories();
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Categories</h1>
          <p className={styles.pageSubtitle}>
            Manage category cards used across homepage and category pages.
          </p>
        </div>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
        >
          <Plus size={16} /> New Category
        </button>
      </div>

      {showForm && (
        <div className={styles.formCard}>
          <h3>{editId ? 'Edit Category' : 'Create Category'}</h3>
          <form onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <div className="form-group">
                <label className="form-label">Category Name *</label>
                <input
                  type="text"
                  className="form-input"
                  required
                  value={form.name}
                  onChange={(event) =>
                    setForm({
                      ...form,
                      name: event.target.value,
                      slug: editId ? form.slug : generateSlug(event.target.value),
                    })
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
                    setForm({ ...form, slug: generateSlug(event.target.value) })
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
                  onChange={(event) => setForm({ ...form, accent: event.target.value })}
                />
              </div>
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
            </div>

            <div className="form-group">
              <label className="form-label">Category Description *</label>
              <textarea
                className="form-input form-textarea"
                required
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Card Image URL *</label>
              <input
                type="text"
                className="form-input"
                required
                value={form.image}
                onChange={(event) => setForm({ ...form, image: event.target.value })}
                placeholder="/images/products/category-image.png"
              />
            </div>

            <div className={styles.formActions}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(event) => setForm({ ...form, published: event.target.checked })}
                />
                Show category on public pages
              </label>

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

      {categories.length === 0 ? (
        <div className={styles.empty}>No categories yet. Create your first category card.</div>
      ) : (
        <div className={styles.categoryList}>
          {categories.map((category) => (
            <div key={category.id} className={styles.categoryCard}>
              <div className={styles.categoryHeader}>
                <div>
                  <div className={styles.categoryEyebrow}>{category.accent}</div>
                  <h3>{category.name}</h3>
                  <span className={styles.categoryMeta}>
                    /{category.slug} · sort {category.sortOrder}
                  </span>
                </div>
                <span
                  className={`badge ${
                    category.published ? 'badge-success' : 'badge-warning'
                  }`}
                >
                  {category.published ? 'Published' : 'Hidden'}
                </span>
              </div>

              <p className={styles.categoryDesc}>{category.description}</p>
              <p className={styles.categoryImagePath}>{category.image}</p>

              <div className={styles.categoryActions}>
                <button className="btn btn-sm btn-outline" onClick={() => editCategory(category)}>
                  <Edit2 size={14} /> Edit
                </button>
                <button className="btn btn-sm" onClick={() => togglePublish(category)}>
                  {category.published ? (
                    <>
                      <EyeOff size={14} /> Hide
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
                  onClick={() => deleteCategory(category.id)}
                >
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
