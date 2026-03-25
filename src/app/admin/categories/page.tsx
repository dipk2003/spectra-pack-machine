'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CategoryRecord } from '@/lib/cms';
import { Edit2, Eye, EyeOff, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    void fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);

    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: string) => {
    if (!confirm('Delete this category?')) return;

    const res = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      toast.error(typeof data?.error === 'string' ? data.error : 'Delete failed');
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
            Listing aur editing ab alag rakhe gaye hain. Yahan se category cards review karo,
            aur edit button se dedicated editor screen kholo.
          </p>
        </div>

        <Link href="/admin/categories/new" className="btn btn-primary btn-sm">
          <Plus size={16} /> New Category
        </Link>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading categories...</div>
      ) : categories.length === 0 ? (
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

              <div className={styles.categoryPreview}>
                <Image
                  src={category.image}
                  alt={category.name}
                  width={1200}
                  height={720}
                  className={styles.categoryPreviewImage}
                />
              </div>

              <p className={styles.categoryImagePath}>{category.image}</p>

              <div className={styles.categoryActions}>
                <Link href={`/admin/categories/${category.id}`} className="btn btn-sm btn-outline">
                  <Edit2 size={14} /> Edit
                </Link>

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
