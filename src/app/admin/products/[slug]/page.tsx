'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import type { CategoryRecord, ProductRecord } from '@/lib/cms';
import { categoryToSlug } from '@/lib/categories';
import { buildAdminProductCategories } from '@/lib/admin-products';
import { Edit2, Trash2, Eye, EyeOff, ArrowLeft, Settings2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

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

  const categoryEditHref = activeCategory.hasCategoryRecord && activeCategory.categoryId
    ? {
        pathname: `/admin/categories/${activeCategory.categoryId}`,
        query: { returnTo: `/admin/products/${slug}` },
      }
    : {
        pathname: '/admin/categories/new',
        query: {
          name: activeCategory.name,
          slug: activeCategory.slug,
          accent: activeCategory.accent,
          description: activeCategory.description,
          image: activeCategory.image,
          returnTo: `/admin/products/${slug}`,
        },
      };

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
          <Link href={categoryEditHref} className="btn btn-sm btn-outline">
            <Settings2 size={16} /> Edit Category
          </Link>
          <Link href={`/admin/products/${slug}/new`} className="btn btn-primary btn-sm">
            <Plus size={16} /> New Product
          </Link>
        </div>
      </div>

      {!activeCategory.hasCategoryRecord && (
        <div className={styles.notice}>
          This category has products, but its matching card is missing in the Categories tab.
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
                    <Link
                      href={`/admin/products/${slug}/${product.id}`}
                      className="btn btn-sm btn-outline"
                    >
                      <Edit2 size={14} /> Edit
                    </Link>

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
