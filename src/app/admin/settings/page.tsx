'use client';

import ImageUploadField from '@/components/admin/ImageUploadField';
import {
  buildCategoryCards,
  buildHeroSlides,
  parseHeroCarouselOverrideMap,
  type HeroCarouselOverrideFields,
  type HeroCarouselSlide,
} from '@/lib/home-hero';
import { PRODUCTS, groupProductsByCategory } from '@/lib/data';
import type { CategoryRecord } from '@/lib/cms';
import { Download, ExternalLink, RotateCcw, Save } from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

type EditableHeroField =
  | 'accent'
  | 'title'
  | 'subtitle'
  | 'description'
  | 'image'
  | 'imageAlt'
  | 'quoteHref';

const buildHeroOverridePayload = (
  currentSlides: HeroCarouselSlide[],
  defaultSlides: HeroCarouselSlide[],
) => {
  const defaultsById = new Map(defaultSlides.map((slide) => [slide.id, slide]));

  return currentSlides.reduce<Record<string, HeroCarouselOverrideFields>>((acc, slide) => {
    const defaultSlide = defaultsById.get(slide.id);
    if (!defaultSlide) return acc;

    const override: HeroCarouselOverrideFields = {};
    const accent = slide.accent.trim();
    const title = slide.title.trim();
    const subtitle = slide.subtitle.trim();
    const description = slide.description.trim();
    const image = slide.image.trim();
    const imageAlt = slide.imageAlt.trim();
    const quoteHref = slide.quoteHref.trim();

    if (accent && accent !== defaultSlide.accent.trim()) {
      override.accent = accent;
    }
    if (title && title !== defaultSlide.title.trim()) {
      override.title = title;
    }
    if (subtitle && subtitle !== defaultSlide.subtitle.trim()) {
      override.subtitle = subtitle;
    }
    if (description && description !== defaultSlide.description.trim()) {
      override.description = description;
    }
    if (image && image !== defaultSlide.image.trim()) {
      override.image = image;
    }
    if (imageAlt && imageAlt !== defaultSlide.imageAlt.trim()) {
      override.imageAlt = imageAlt;
    }
    if (quoteHref && quoteHref !== defaultSlide.quoteHref.trim()) {
      override.quoteHref = quoteHref;
    }

    if (Object.keys(override).length > 0) {
      acc[slide.id] = override;
    }

    return acc;
  }, {});
};

export default function AdminSettingsPage() {
  const [catalogPath, setCatalogPath] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroCarouselSlide[]>([]);
  const [defaultHeroSlides, setDefaultHeroSlides] = useState<HeroCarouselSlide[]>([]);
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [loadingHero, setLoadingHero] = useState(true);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoadingHero(true);

    try {
      const [productsRes, categoriesRes, settingsRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/site-settings'),
      ]);

      const productsData = await productsRes.json();
      const categoriesData = await categoriesRes.json();
      const settingsData = await settingsRes.json();

      const products = Array.isArray(productsData) ? productsData : PRODUCTS;
      const categories = Array.isArray(categoriesData) ? (categoriesData as CategoryRecord[]) : [];
      const heroOverrides = parseHeroCarouselOverrideMap(settingsData?.heroCarouselOverrides);
      const productGroups = groupProductsByCategory(products);
      const categoryCards = buildCategoryCards(productGroups, categories);
      const defaultSlides = buildHeroSlides(productGroups, categoryCards);
      const resolvedSlides = buildHeroSlides(productGroups, categoryCards, heroOverrides);

      setCatalogPath(
        typeof settingsData?.catalogPath === 'string' ? settingsData.catalogPath : '',
      );
      setDefaultHeroSlides(defaultSlides);
      setHeroSlides(resolvedSlides);
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoadingHero(false);
    }
  };

  const updateHeroSlide = (
    slideId: string,
    field: EditableHeroField,
    value: string,
  ) => {
    setHeroSlides((current) =>
      current.map((slide) =>
        slide.id === slideId
          ? {
              ...slide,
              [field]: value,
            }
          : slide,
      ),
    );
  };

  const resetHeroSlide = (slideId: string) => {
    const defaultSlide = defaultHeroSlides.find((slide) => slide.id === slideId);
    if (!defaultSlide) return;

    setHeroSlides((current) =>
      current.map((slide) => (slide.id === slideId ? { ...defaultSlide } : slide)),
    );
  };

  const resetAllHeroSlides = () => {
    setHeroSlides(defaultHeroSlides.map((slide) => ({ ...slide })));
  };

  const handleCatalogSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingCatalog(true);

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'catalog_path',
          value: catalogPath,
          label: 'Catalog PDF',
          description: 'Public PDF path or full URL used for Download Catalog links.',
        }),
      });

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success('Catalog updated');
      void fetchSettings();
    } catch {
      toast.error('Failed to update catalog');
    } finally {
      setSavingCatalog(false);
    }
  };

  const handleHeroSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSavingHero(true);

    try {
      const overridePayload = buildHeroOverridePayload(heroSlides, defaultHeroSlides);
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'hero_carousel_overrides',
          value: JSON.stringify(overridePayload),
          label: 'Hero Carousel Overrides',
          description:
            'Homepage hero carousel image and copy overrides managed from admin.',
        }),
      });

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success('Hero carousel updated');
      void fetchSettings();
    } catch {
      toast.error('Failed to update hero carousel');
    } finally {
      setSavingHero(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Site Settings</h1>
          <p className={styles.pageSubtitle}>
            Manage the public catalog link and homepage hero carousel content from one place.
          </p>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.iconWrap}>
              <Download size={22} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Public Catalog Link</h3>
              <p className={styles.cardDesc}>
                Use a local public path like `/catalog/file.pdf` or a full external URL.
              </p>
            </div>
          </div>

          <form onSubmit={handleCatalogSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Catalog Path / URL *</label>
              <input
                type="text"
                className="form-input"
                required
                value={catalogPath}
                onChange={(event) => setCatalogPath(event.target.value)}
                placeholder="/catalog/spectra-pack-machines-catalog.pdf"
              />
            </div>

            <div className={styles.actions}>
              <a
                href={catalogPath || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-sm btn-outline"
              >
                <ExternalLink size={14} /> Preview
              </a>
              <button
                type="submit"
                className="btn btn-primary btn-sm"
                disabled={savingCatalog}
              >
                <Save size={14} /> {savingCatalog ? 'Saving...' : 'Save Catalog'}
              </button>
            </div>
          </form>
        </div>

        <div className={`${styles.card} ${styles.heroCard}`}>
          <div className={styles.cardTop}>
            <div className={styles.iconWrap}>
              <Save size={22} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Homepage Hero Carousel</h3>
              <p className={styles.cardDesc}>
                Change slide copy, PNG image, and get-quote redirect category-wise. These updates
                go live on the homepage carousel.
              </p>
            </div>
          </div>

          <div className={styles.heroInfoBar}>
            <span>Drag and drop is enabled for every carousel image field.</span>
            <button
              type="button"
              className="btn btn-sm btn-outline"
              onClick={resetAllHeroSlides}
              disabled={loadingHero || savingHero || defaultHeroSlides.length === 0}
            >
              <RotateCcw size={14} /> Reset All to Default
            </button>
          </div>

          {loadingHero ? (
            <p className={styles.loadingText}>Loading hero carousel settings...</p>
          ) : (
            <form onSubmit={handleHeroSubmit} className={styles.heroForm}>
              <div className={styles.heroSlideGrid}>
                {heroSlides.map((slide) => (
                  <section key={slide.id} className={styles.heroSlideCard}>
                    <div className={styles.heroSlideHeader}>
                      <div>
                        <p className={styles.heroSlideKicker}>{slide.categoryName}</p>
                        <h4 className={styles.heroSlideTitle}>{slide.title}</h4>
                      </div>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline"
                        onClick={() => resetHeroSlide(slide.id)}
                      >
                        <RotateCcw size={14} /> Reset Slide
                      </button>
                    </div>

                    <div className={styles.heroSlideFields}>
                      <div className="form-group">
                        <label className="form-label">Accent Label</label>
                        <input
                          type="text"
                          className="form-input"
                          value={slide.accent}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'accent', event.target.value)
                          }
                          placeholder="Top Seller"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Main Title</label>
                        <input
                          type="text"
                          className="form-input"
                          value={slide.title}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'title', event.target.value)
                          }
                          placeholder="Band Sealer Machine"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Subtitle</label>
                        <textarea
                          className="form-input form-textarea"
                          rows={3}
                          value={slide.subtitle}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'subtitle', event.target.value)
                          }
                          placeholder="Short supporting line below the title"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input form-textarea"
                          rows={4}
                          value={slide.description}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'description', event.target.value)
                          }
                          placeholder="Detailed hero paragraph"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Get Quote Link</label>
                        <input
                          type="text"
                          className="form-input"
                          value={slide.quoteHref}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'quoteHref', event.target.value)
                          }
                          placeholder="/products/band-sealer-machine or /products/category/sealing-machines"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Image Alt Text</label>
                        <input
                          type="text"
                          className="form-input"
                          value={slide.imageAlt}
                          onChange={(event) =>
                            updateHeroSlide(slide.id, 'imageAlt', event.target.value)
                          }
                          placeholder="Describe the hero image"
                        />
                      </div>

                      <ImageUploadField
                        label="Carousel Image"
                        value={slide.image}
                        onChange={(value) => updateHeroSlide(slide.id, 'image', value)}
                        folder="general"
                        hint="Drag and drop a machine image here or click to upload. Recommended wide transparent PNG/webp."
                      />
                    </div>
                  </section>
                ))}
              </div>

              <div className={styles.actions}>
                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={savingHero || heroSlides.length === 0}
                >
                  <Save size={14} /> {savingHero ? 'Saving...' : 'Save Hero Carousel'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
