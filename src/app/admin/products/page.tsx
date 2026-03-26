'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { CategoryRecord, ProductRecord } from '@/lib/cms';
import { buildAdminProductCategories } from '@/lib/admin-products';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import { ArrowRight, Settings2 } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories, setCategories] = useState<CategoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

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
        toast.error('Failed to load product categories');
      } finally {
        setLoading(false);
      }
    };

    void loadData();
  }, []);

  const categorySummaries = buildAdminProductCategories(categories, products);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Products by Category</h1>
          <p className={styles.pageSubtitle}>
            Pehle category select karo, phir us category ke andar products add ya manage karo.
          </p>
        </div>
        <Link href="/admin/categories" className="btn btn-sm btn-outline">
          <Settings2 size={16} /> Manage Categories
        </Link>
      </div>

      {loading ? (
        <div className={styles.empty}>Loading categories...</div>
      ) : categorySummaries.length === 0 ? (
        <div className={styles.empty}>
          No categories found. Create a category first, then add products inside it.
        </div>
      ) : (
        <div className={styles.categoryGrid}>
          {categorySummaries.map((category) => (
            <Link
              key={category.slug}
              href={`/admin/products/${category.slug}`}
              className={styles.categoryCard}
            >
              <div className={styles.categoryHeader}>
                <div>
                  <div className={styles.categoryEyebrow}>{category.accent}</div>
                  <h2 className={styles.categoryTitle}>{category.name}</h2>
                </div>
                <span
                  className={`badge ${
                    category.hasCategoryRecord
                      ? category.published
                        ? 'badge-success'
                        : 'badge-warning'
                      : 'badge-error'
                  }`}
                >
                  {category.hasCategoryRecord
                    ? category.published
                      ? 'Published'
                      : 'Hidden'
                    : 'Needs setup'}
                </span>
              </div>

              {category.image ? (
                <div className={styles.categoryPreview}>
                  <Image
                    src={category.image}
                    alt={category.name}
                    width={1200}
                    height={720}
                    className={styles.categoryImage}
                    unoptimized={shouldBypassNextImageOptimization(category.image)}
                  />
                </div>
              ) : null}

              <p className={styles.categoryDesc}>{category.description}</p>

              <div className={styles.categoryMeta}>
                <span>
                  {category.productCount} {category.productCount === 1 ? 'product' : 'products'}
                </span>
                <span className={styles.openLink}>
                  Open Products <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
