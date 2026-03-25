'use client';

import Image from 'next/image';
import ImageUploadField from '@/components/admin/ImageUploadField';
import {
  buildCategoryCards,
  buildHeroSlides,
  parseHeroCarouselOverrideMap,
  type HeroCarouselOverrideFields,
  type HeroCarouselSlide,
} from '@/lib/home-hero';
import { groupProductsByCategory } from '@/lib/data';
import type { CategoryRecord } from '@/lib/cms';
import { Download, ExternalLink, RotateCcw, Save, Sparkles } from 'lucide-react';
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

const HERO_FIELD_LABELS: Record<EditableHeroField, string> = {
  accent: 'Accent',
  title: 'Title',
  subtitle: 'Subtitle',
  description: 'Description',
  image: 'Image',
  imageAlt: 'Alt text',
  quoteHref: 'Quote link',
};

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

    if (accent && accent !== defaultSlide.accent.trim()) override.accent = accent;
    if (title && title !== defaultSlide.title.trim()) override.title = title;
    if (subtitle && subtitle !== defaultSlide.subtitle.trim()) override.subtitle = subtitle;
    if (description && description !== defaultSlide.description.trim()) override.description = description;
    if (image && image !== defaultSlide.image.trim()) override.image = image;
    if (imageAlt && imageAlt !== defaultSlide.imageAlt.trim()) override.imageAlt = imageAlt;
    if (quoteHref && quoteHref !== defaultSlide.quoteHref.trim()) override.quoteHref = quoteHref;

    if (Object.keys(override).length > 0) {
      acc[slide.id] = override;
    }

    return acc;
  }, {});
};

const getChangedFields = (
  slide: HeroCarouselSlide,
  defaultSlide?: HeroCarouselSlide | null,
) => {
  if (!defaultSlide) return [] as EditableHeroField[];

  const changedFields: EditableHeroField[] = [];

  (Object.keys(HERO_FIELD_LABELS) as EditableHeroField[]).forEach((field) => {
    if (slide[field].trim() !== defaultSlide[field].trim()) {
      changedFields.push(field);
    }
  });

  return changedFields;
};

const getShortLinkLabel = (href: string) => {
  const cleaned = href
    .trim()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '');

  if (cleaned.length <= 34) return cleaned;
  return `${cleaned.slice(0, 31)}...`;
};

export default function AdminSettingsPage() {
  const [catalogPath, setCatalogPath] = useState('');
  const [heroSlides, setHeroSlides] = useState<HeroCarouselSlide[]>([]);
  const [defaultHeroSlides, setDefaultHeroSlides] = useState<HeroCarouselSlide[]>([]);
  const [activeSlideId, setActiveSlideId] = useState('');
  const [savingCatalog, setSavingCatalog] = useState(false);
  const [savingHero, setSavingHero] = useState(false);
  const [loadingHero, setLoadingHero] = useState(true);

  useEffect(() => {
    void fetchSettings();
  }, []);

  useEffect(() => {
    if (!heroSlides.length) {
      setActiveSlideId('');
      return;
    }

    setActiveSlideId((current) =>
      heroSlides.some((slide) => slide.id === current) ? current : heroSlides[0].id,
    );
  }, [heroSlides]);

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

      const products = Array.isArray(productsData) ? productsData : [];
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
          description: 'Public PDF path or full external URL used for Download Catalog links.',
        }),
      });

      if (!res.ok) throw new Error('save');

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
          value: '',
          jsonValue: overridePayload,
          label: 'Hero Carousel Overrides',
          description: 'Homepage hero carousel image and copy overrides managed from admin.',
        }),
      });

      if (!res.ok) throw new Error('save');

      toast.success('Hero carousel updated');
      void fetchSettings();
    } catch {
      toast.error('Failed to update hero carousel');
    } finally {
      setSavingHero(false);
    }
  };

  const activeSlide =
    heroSlides.find((slide) => slide.id === activeSlideId) || heroSlides[0] || null;
  const activeDefaultSlide =
    defaultHeroSlides.find((slide) => slide.id === activeSlide?.id) || null;
  const activeSlideChanges = activeSlide
    ? getChangedFields(activeSlide, activeDefaultSlide)
    : [];
  const customizedSlideCount = heroSlides.reduce((count, slide) => {
    const defaultSlide = defaultHeroSlides.find((item) => item.id === slide.id);
    return count + (getChangedFields(slide, defaultSlide).length > 0 ? 1 : 0);
  }, 0);
  const activeSlideIndex = activeSlide
    ? heroSlides.findIndex((slide) => slide.id === activeSlide.id)
    : -1;

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Site Settings</h1>
          <p className={styles.pageSubtitle}>
            Manage the public catalog link and homepage hero carousel content from one clean admin view.
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
              <Sparkles size={22} />
            </div>
            <div>
              <h3 className={styles.cardTitle}>Homepage Hero Carousel</h3>
              <p className={styles.cardDesc}>
                Select a slide from the left, update copy and image on the right, then save once to publish every change.
              </p>
            </div>
          </div>

          <div className={styles.heroInfoBar}>
            <div className={styles.heroInfoStats}>
              <span className={styles.statChip}>{heroSlides.length} Slides</span>
              <span className={styles.statChip}>{customizedSlideCount} Customized</span>
              <span className={styles.statChip}>Drag & drop image upload enabled</span>
            </div>

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
          ) : activeSlide ? (
            <form onSubmit={handleHeroSubmit} className={styles.heroForm}>
              <div className={styles.heroLayout}>
                <aside className={styles.heroSidebar}>
                  <div className={styles.heroSidebarTop}>
                    <p className={styles.sidebarKicker}>Slide List</p>
                    <h4 className={styles.sidebarTitle}>Choose the carousel slide you want to edit</h4>
                    <p className={styles.sidebarText}>
                      Each slide stays linked to its category, but image, text, and quote link can be overridden here.
                    </p>
                  </div>

                  <div className={styles.slideTabList}>
                    {heroSlides.map((slide, index) => {
                      const defaultSlide = defaultHeroSlides.find((item) => item.id === slide.id);
                      const changedFields = getChangedFields(slide, defaultSlide);
                      const isActive = slide.id === activeSlide.id;

                      return (
                        <button
                          key={slide.id}
                          type="button"
                          className={`${styles.slideTab} ${isActive ? styles.slideTabActive : ''}`}
                          onClick={() => setActiveSlideId(slide.id)}
                        >
                          <div className={styles.slideTabMedia}>
                            {slide.image ? (
                              <Image
                                src={slide.image}
                                alt={slide.imageAlt}
                                fill
                                sizes="72px"
                                className={styles.slideTabImage}
                              />
                            ) : (
                              <div className={styles.mediaPlaceholder}>No image</div>
                            )}
                          </div>

                          <div className={styles.slideTabBody}>
                            <div className={styles.slideTabTop}>
                              <span className={styles.slideTabIndex}>
                                {String(index + 1).padStart(2, '0')}
                              </span>
                              <span
                                className={`${styles.slideTabStatus} ${
                                  changedFields.length > 0
                                    ? styles.slideTabStatusCustom
                                    : styles.slideTabStatusDefault
                                }`}
                              >
                                {changedFields.length > 0
                                  ? `${changedFields.length} custom`
                                  : 'Default'}
                              </span>
                            </div>

                            <p className={styles.slideTabCategory}>{slide.categoryName}</p>
                            <h5 className={styles.slideTabTitle}>{slide.title}</h5>
                            <p className={styles.slideTabLink}>
                              Quote: {getShortLinkLabel(slide.quoteHref)}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </aside>

                <div className={styles.heroEditor}>
                  <div className={styles.editorHeader}>
                    <div>
                      <p className={styles.editorKicker}>
                        Editing slide {String(activeSlideIndex + 1).padStart(2, '0')} of {String(heroSlides.length).padStart(2, '0')}
                      </p>
                      <h4 className={styles.editorTitle}>{activeSlide.categoryName}</h4>
                      <p className={styles.editorSubtitle}>
                        Keep the category structure intact while tailoring the homepage presentation for sales.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline"
                      onClick={() => resetHeroSlide(activeSlide.id)}
                    >
                      <RotateCcw size={14} /> Reset This Slide
                    </button>
                  </div>

                  <div className={styles.previewCard}>
                    <div className={styles.previewMedia}>
                      {activeSlide.image ? (
                        <Image
                          src={activeSlide.image}
                          alt={activeSlide.imageAlt}
                          fill
                          sizes="(max-width: 900px) 100vw, 320px"
                          className={styles.previewImage}
                        />
                      ) : (
                        <div className={styles.mediaPlaceholder}>No image</div>
                      )}
                    </div>

                    <div className={styles.previewCopy}>
                      <span className={styles.previewAccent}>{activeSlide.accent}</span>
                      <h5 className={styles.previewTitle}>{activeSlide.title}</h5>
                      <p className={styles.previewSubtitle}>{activeSlide.subtitle}</p>
                      <p className={styles.previewDescription}>{activeSlide.description}</p>

                      <div className={styles.previewMeta}>
                        <span className={styles.previewMetaChip}>
                          {activeSlide.machineCount} {activeSlide.machineCount === 1 ? 'Machine' : 'Machines'}
                        </span>
                        <span className={styles.previewMetaChip}>
                          Quote: {getShortLinkLabel(activeSlide.quoteHref)}
                        </span>
                      </div>

                      <div className={styles.changeList}>
                        {activeSlideChanges.length > 0 ? (
                          activeSlideChanges.map((field) => (
                            <span key={field} className={styles.changeChip}>
                              {HERO_FIELD_LABELS[field]}
                            </span>
                          ))
                        ) : (
                          <span className={styles.changeChipMuted}>Using default content for this slide</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className={styles.editorSections}>
                    <section className={styles.editorSection}>
                      <div className={styles.sectionHead}>
                        <div>
                          <h5 className={styles.sectionTitle}>Copy Content</h5>
                          <p className={styles.sectionText}>
                            This text appears on the left side of the homepage hero.
                          </p>
                        </div>
                      </div>

                      <div className={styles.twoColGrid}>
                        <div className="form-group">
                          <label className="form-label">Accent Label</label>
                          <input
                            type="text"
                            className="form-input"
                            value={activeSlide.accent}
                            onChange={(event) =>
                              updateHeroSlide(activeSlide.id, 'accent', event.target.value)
                            }
                            placeholder="Top Seller"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Main Title</label>
                          <input
                            type="text"
                            className="form-input"
                            value={activeSlide.title}
                            onChange={(event) =>
                              updateHeroSlide(activeSlide.id, 'title', event.target.value)
                            }
                            placeholder="Band Sealer Machine"
                          />
                        </div>
                      </div>

                      <div className="form-group">
                        <label className="form-label">Subtitle</label>
                        <textarea
                          className="form-input form-textarea"
                          rows={3}
                          value={activeSlide.subtitle}
                          onChange={(event) =>
                            updateHeroSlide(activeSlide.id, 'subtitle', event.target.value)
                          }
                          placeholder="Short supporting line below the title"
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea
                          className="form-input form-textarea"
                          rows={5}
                          value={activeSlide.description}
                          onChange={(event) =>
                            updateHeroSlide(activeSlide.id, 'description', event.target.value)
                          }
                          placeholder="Detailed hero paragraph"
                        />
                      </div>
                    </section>

                    <section className={styles.editorSection}>
                      <div className={styles.sectionHead}>
                        <div>
                          <h5 className={styles.sectionTitle}>CTA and Media</h5>
                          <p className={styles.sectionText}>
                            Control where the Get Quote button goes and what image is shown on the slide.
                          </p>
                        </div>
                      </div>

                      <div className={styles.twoColGrid}>
                        <div className="form-group">
                          <label className="form-label">Get Quote Link</label>
                          <input
                            type="text"
                            className="form-input"
                            value={activeSlide.quoteHref}
                            onChange={(event) =>
                              updateHeroSlide(activeSlide.id, 'quoteHref', event.target.value)
                            }
                            placeholder="/products/band-sealer-machine"
                          />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Image Alt Text</label>
                          <input
                            type="text"
                            className="form-input"
                            value={activeSlide.imageAlt}
                            onChange={(event) =>
                              updateHeroSlide(activeSlide.id, 'imageAlt', event.target.value)
                            }
                            placeholder="Describe the hero image"
                          />
                        </div>
                      </div>

                      <ImageUploadField
                        label="Carousel Image"
                        value={activeSlide.image}
                        onChange={(value) => updateHeroSlide(activeSlide.id, 'image', value)}
                        folder="general"
                        hint="Drag and drop a machine image here or click to upload. Recommended wide transparent PNG or WebP."
                      />
                    </section>
                  </div>
                </div>
              </div>

              <div className={styles.footerBar}>
                <div>
                  <p className={styles.footerTitle}>Save once to publish all edited hero slides.</p>
                  <p className={styles.footerText}>
                    Current slide: {activeSlide.categoryName} • {activeSlideChanges.length > 0 ? `${activeSlideChanges.length} custom fields` : 'using defaults'}
                  </p>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary btn-sm"
                  disabled={savingHero || heroSlides.length === 0}
                >
                  <Save size={14} /> {savingHero ? 'Saving...' : 'Save Hero Carousel'}
                </button>
              </div>
            </form>
          ) : (
            <p className={styles.loadingText}>No hero slides available.</p>
          )}
        </div>
      </div>
    </div>
  );
}
