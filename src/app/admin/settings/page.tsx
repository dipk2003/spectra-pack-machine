'use client';

import Image from 'next/image';
import ImageUploadField from '@/components/admin/ImageUploadField';
import {
  buildCategoryCards,
  buildHeroSlides,
  parseHeroCarouselSettings,
  type HeroCarouselOverrideFields,
  type HeroCarouselSettings,
  type HeroCarouselSlide,
} from '@/lib/home-hero';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import { groupProductsByCategory } from '@/lib/data';
import type { CategoryRecord } from '@/lib/cms';
import {
  ArrowDown,
  ArrowUp,
  Download,
  ExternalLink,
  Plus,
  RotateCcw,
  Save,
  Sparkles,
  Trash2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

type DefaultField = 'accent' | 'title' | 'subtitle' | 'description' | 'image' | 'imageAlt' | 'quoteHref';
type HeroField = DefaultField | 'categoryName' | 'detailHref' | 'detailLabel';

const FIELD_LABELS: Record<DefaultField, string> = {
  accent: 'Accent',
  title: 'Title',
  subtitle: 'Subtitle',
  description: 'Description',
  image: 'Image',
  imageAlt: 'Alt text',
  quoteHref: 'Quote link',
};

const buildOverridePayload = (currentSlides: HeroCarouselSlide[], defaultSlides: HeroCarouselSlide[]) => {
  const defaultsById = new Map(defaultSlides.map((slide) => [slide.id, slide]));

  return currentSlides.reduce<Record<string, HeroCarouselOverrideFields>>((acc, slide) => {
    if (slide.sourceType !== 'default') return acc;
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

    if (Object.keys(override).length > 0) acc[slide.id] = override;
    return acc;
  }, {});
};

const buildHeroSettingsPayload = (currentSlides: HeroCarouselSlide[], defaultSlides: HeroCarouselSlide[]): HeroCarouselSettings => {
  const visibleIds = new Set(currentSlides.map((slide) => slide.id));

  return {
    overrides: buildOverridePayload(currentSlides, defaultSlides),
    orderedIds: currentSlides.map((slide) => slide.id),
    hiddenIds: defaultSlides.filter((slide) => !visibleIds.has(slide.id)).map((slide) => slide.id),
    customSlides: currentSlides
      .filter((slide) => slide.sourceType === 'custom')
      .map((slide) => ({
        id: slide.id,
        accent: slide.accent,
        categoryName: slide.categoryName,
        title: slide.title,
        subtitle: slide.subtitle,
        description: slide.description,
        image: slide.image,
        imageAlt: slide.imageAlt,
        quoteHref: slide.quoteHref,
        detailHref: slide.detailHref,
        detailLabel: slide.detailLabel,
      })),
  };
};

const getChangedFields = (slide: HeroCarouselSlide, defaultSlide?: HeroCarouselSlide | null) => {
  if (!defaultSlide || slide.sourceType !== 'default') return [] as DefaultField[];
  const changed: DefaultField[] = [];
  (Object.keys(FIELD_LABELS) as DefaultField[]).forEach((field) => {
    if (slide[field].trim() !== defaultSlide[field].trim()) changed.push(field);
  });
  return changed;
};

const getShortLinkLabel = (href: string) => {
  const cleaned = href.trim().replace(/^https?:\/\//, '').replace(/^www\./, '');
  if (!cleaned) return 'Not set';
  return cleaned.length <= 34 ? cleaned : `${cleaned.slice(0, 31)}...`;
};

const createCustomSlide = (): HeroCarouselSlide => ({
  id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
  accent: 'Custom Slide',
  categoryName: 'Custom Campaign',
  title: 'New Hero Slide',
  subtitle: '',
  description: 'Add custom copy, CTA, and image for this homepage slide.',
  image: '',
  imageAlt: '',
  machineCount: 0,
  detailHref: '/contact',
  detailLabel: 'View Details',
  quoteHref: '/contact',
  highlights: [],
  sourceType: 'custom',
});

const moveItem = <T,>(items: T[], fromIndex: number, toIndex: number) => {
  const next = [...items];
  const [item] = next.splice(fromIndex, 1);
  next.splice(toIndex, 0, item);
  return next;
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
    setActiveSlideId((current) => (heroSlides.some((slide) => slide.id === current) ? current : heroSlides[0].id));
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
      const heroSettings = parseHeroCarouselSettings(settingsData?.heroCarouselSettings ?? settingsData?.heroCarouselOverrides);
      const productGroups = groupProductsByCategory(products);
      const categoryCards = buildCategoryCards(productGroups, categories);
      const defaults = buildHeroSlides(productGroups, categoryCards);
      const resolved = buildHeroSlides(productGroups, categoryCards, heroSettings);

      setCatalogPath(typeof settingsData?.catalogPath === 'string' ? settingsData.catalogPath : '');
      setDefaultHeroSlides(defaults);
      setHeroSlides(resolved);
    } catch {
      toast.error('Failed to load site settings');
    } finally {
      setLoadingHero(false);
    }
  };

  const updateHeroSlide = (slideId: string, field: HeroField, value: string) => {
    setHeroSlides((current) => current.map((slide) => (slide.id === slideId ? { ...slide, [field]: value } : slide)));
  };

  const addCustomHeroSlide = () => {
    const slide = createCustomSlide();
    setHeroSlides((current) => [...current, slide]);
    setActiveSlideId(slide.id);
  };

  const moveHeroSlide = (slideId: string, direction: -1 | 1) => {
    setHeroSlides((current) => {
      const index = current.findIndex((slide) => slide.id === slideId);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= current.length) return current;
      return moveItem(current, index, target);
    });
  };

  const deleteHeroSlide = (slideId: string) => {
    setHeroSlides((current) => current.filter((slide) => slide.id !== slideId));
  };

  const restoreDefaultSlide = (slideId: string) => {
    const defaultSlide = defaultHeroSlides.find((slide) => slide.id === slideId);
    if (!defaultSlide) return;
    setHeroSlides((current) => (current.some((slide) => slide.id === slideId) ? current : [...current, { ...defaultSlide }]));
    setActiveSlideId(slideId);
  };

  const resetHeroSlide = (slideId: string) => {
    const defaultSlide = defaultHeroSlides.find((slide) => slide.id === slideId);
    if (!defaultSlide) return;
    setHeroSlides((current) => current.map((slide) => (slide.id === slideId ? { ...defaultSlide } : slide)));
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
      const payload = buildHeroSettingsPayload(heroSlides, defaultHeroSlides);
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'hero_carousel_overrides',
          value: '',
          jsonValue: payload,
          label: 'Hero Carousel Settings',
          description: 'Homepage hero carousel order, overrides, hidden slides, and custom slides managed from admin.',
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

  const activeSlide = heroSlides.find((slide) => slide.id === activeSlideId) || heroSlides[0] || null;
  const activeDefaultSlide = activeSlide?.sourceType === 'default' ? defaultHeroSlides.find((slide) => slide.id === activeSlide.id) || null : null;
  const activeSlideChanges = activeSlide ? getChangedFields(activeSlide, activeDefaultSlide) : [];
  const activeSlideIndex = activeSlide ? heroSlides.findIndex((slide) => slide.id === activeSlide.id) : -1;
  const customSlideCount = heroSlides.filter((slide) => slide.sourceType === 'custom').length;
  const hiddenDefaultSlides = defaultHeroSlides.filter((slide) => !heroSlides.some((item) => item.id === slide.id));
  const customizedSlideCount = heroSlides.reduce((count, slide) => {
    if (slide.sourceType !== 'default') return count;
    const defaultSlide = defaultHeroSlides.find((item) => item.id === slide.id);
    return count + (getChangedFields(slide, defaultSlide).length > 0 ? 1 : 0);
  }, 0);

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Site Settings</h1>
          <p className={styles.pageSubtitle}>Manage the catalog link and homepage hero carousel.</p>
        </div>
      </div>

      <div className={styles.settingsGrid}>
        <div className={styles.card}>
          <div className={styles.cardTop}>
            <div className={styles.iconWrap}><Download size={22} /></div>
            <div>
              <h3 className={styles.cardTitle}>Public Catalog Link</h3>
              <p className={styles.cardDesc}>Use a public file path or full external URL.</p>
            </div>
          </div>

          <form onSubmit={handleCatalogSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label">Catalog Path / URL *</label>
              <input type="text" className="form-input" required value={catalogPath} onChange={(event) => setCatalogPath(event.target.value)} placeholder="/catalog/spectra-pack-machines-catalog.pdf" />
            </div>

            <div className={styles.actions}>
              <a href={catalogPath || '#'} target="_blank" rel="noopener noreferrer" className="btn btn-sm btn-outline">
                <ExternalLink size={14} /> Preview
              </a>
              <button type="submit" className="btn btn-primary btn-sm" disabled={savingCatalog}>
                <Save size={14} /> {savingCatalog ? 'Saving...' : 'Save Catalog'}
              </button>
            </div>
          </form>
        </div>

        <div className={`${styles.card} ${styles.heroCard}`}>
          <div className={styles.cardTop}>
            <div className={styles.iconWrap}><Sparkles size={22} /></div>
            <div>
              <h3 className={styles.cardTitle}>Homepage Hero Carousel</h3>
              <p className={styles.cardDesc}>Reorder, add, delete, restore, and edit slides here.</p>
            </div>
          </div>

          <div className={styles.heroInfoBar}>
            <div className={styles.heroInfoStats}>
              <span className={styles.statChip}>{heroSlides.length} Visible</span>
              <span className={styles.statChip}>{customizedSlideCount} Customized</span>
              <span className={styles.statChip}>{customSlideCount} Custom</span>
              <span className={styles.statChip}>{hiddenDefaultSlides.length} Hidden</span>
            </div>

            <button type="button" className="btn btn-sm btn-outline" onClick={resetAllHeroSlides} disabled={loadingHero || savingHero || defaultHeroSlides.length === 0}>
              <RotateCcw size={14} /> Reset All
            </button>
          </div>

          {loadingHero ? (
            <p className={styles.loadingText}>Loading hero carousel settings...</p>
          ) : (
            <form onSubmit={handleHeroSubmit} className={styles.heroForm}>
              <div className={styles.heroLayout}>
                <aside className={styles.heroSidebar}>
                  <div className={styles.heroSidebarTop}>
                    <p className={styles.sidebarKicker}>Slide List</p>
                    <h4 className={styles.sidebarTitle}>Order and visibility</h4>
                    <p className={styles.sidebarText}>Default slides can be hidden. Custom slides can be added anytime.</p>
                  </div>

                  <div className={styles.sidebarActions}>
                    <button type="button" className="btn btn-sm btn-primary" onClick={addCustomHeroSlide}>
                      <Plus size={14} /> Add Custom Slide
                    </button>
                  </div>

                  <div className={styles.slideTabList}>
                    {heroSlides.length > 0 ? heroSlides.map((slide, index) => {
                      const defaultSlide = defaultHeroSlides.find((item) => item.id === slide.id);
                      const changedFields = getChangedFields(slide, defaultSlide);
                      const statusClass =
                        slide.sourceType === 'custom'
                          ? styles.slideTabStatusCustomSlide
                          : changedFields.length > 0
                            ? styles.slideTabStatusCustom
                            : styles.slideTabStatusDefault;
                      const statusLabel =
                        slide.sourceType === 'custom'
                          ? 'Custom'
                          : changedFields.length > 0
                            ? `${changedFields.length} custom`
                            : 'Default';

                      return (
                        <button key={slide.id} type="button" className={`${styles.slideTab} ${slide.id === activeSlide?.id ? styles.slideTabActive : ''}`} onClick={() => setActiveSlideId(slide.id)}>
                          <div className={styles.slideTabMedia}>
                            {slide.image ? (
                              <Image src={slide.image} alt={slide.imageAlt} fill sizes="72px" unoptimized={shouldBypassNextImageOptimization(slide.image)} className={styles.slideTabImage} />
                            ) : (
                              <div className={styles.mediaPlaceholder}>No image</div>
                            )}
                          </div>
                          <div className={styles.slideTabBody}>
                            <div className={styles.slideTabTop}>
                              <span className={styles.slideTabIndex}>{String(index + 1).padStart(2, '0')}</span>
                              <span className={`${styles.slideTabStatus} ${statusClass}`}>{statusLabel}</span>
                            </div>
                            <p className={styles.slideTabCategory}>{slide.categoryName}</p>
                            <h5 className={styles.slideTabTitle}>{slide.title}</h5>
                            <p className={styles.slideTabLink}>Quote: {getShortLinkLabel(slide.quoteHref)}</p>
                          </div>
                        </button>
                      );
                    }) : <p className={styles.loadingText}>No visible slides.</p>}
                  </div>

                  {hiddenDefaultSlides.length > 0 ? (
                    <div className={styles.restoreSection}>
                      <p className={styles.restoreTitle}>Restore hidden slides</p>
                      <div className={styles.restoreList}>
                        {hiddenDefaultSlides.map((slide) => (
                          <button key={slide.id} type="button" className={styles.restoreButton} onClick={() => restoreDefaultSlide(slide.id)}>
                            <Plus size={14} /> {slide.categoryName}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </aside>

                {activeSlide ? (
                  <div className={styles.heroEditor}>
                    <div className={styles.editorHeader}>
                      <div>
                        <p className={styles.editorKicker}>Slide {String(activeSlideIndex + 1).padStart(2, '0')} of {String(heroSlides.length).padStart(2, '0')}</p>
                        <h4 className={styles.editorTitle}>{activeSlide.categoryName}</h4>
                        <p className={styles.editorSubtitle}>{activeSlide.sourceType === 'custom' ? 'Custom slide managed from admin.' : 'Category-backed slide with override controls.'}</p>
                      </div>

                      <div className={styles.editorActions}>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => moveHeroSlide(activeSlide.id, -1)} disabled={activeSlideIndex <= 0}>
                          <ArrowUp size={14} /> Up
                        </button>
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => moveHeroSlide(activeSlide.id, 1)} disabled={activeSlideIndex === heroSlides.length - 1}>
                          <ArrowDown size={14} /> Down
                        </button>
                        {activeSlide.sourceType === 'default' ? (
                          <button type="button" className="btn btn-sm btn-outline" onClick={() => resetHeroSlide(activeSlide.id)}>
                            <RotateCcw size={14} /> Reset
                          </button>
                        ) : null}
                        <button type="button" className="btn btn-sm btn-outline" onClick={() => deleteHeroSlide(activeSlide.id)}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </div>

                    <div className={styles.previewCard}>
                      <div className={styles.previewMedia}>
                        {activeSlide.image ? (
                          <Image src={activeSlide.image} alt={activeSlide.imageAlt} fill sizes="(max-width: 900px) 100vw, 320px" unoptimized={shouldBypassNextImageOptimization(activeSlide.image)} className={styles.previewImage} />
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
                          <span className={styles.previewMetaChip}>{activeSlide.sourceType === 'custom' ? 'Custom slide' : `${activeSlide.machineCount} ${activeSlide.machineCount === 1 ? 'Machine' : 'Machines'}`}</span>
                          <span className={styles.previewMetaChip}>Quote: {getShortLinkLabel(activeSlide.quoteHref)}</span>
                          <span className={styles.previewMetaChip}>Detail: {getShortLinkLabel(activeSlide.detailHref)}</span>
                        </div>
                        <div className={styles.changeList}>
                          {activeSlide.sourceType === 'custom' ? (
                            <span className={styles.changeChip}>Custom slide</span>
                          ) : activeSlideChanges.length > 0 ? (
                            activeSlideChanges.map((field) => <span key={field} className={styles.changeChip}>{FIELD_LABELS[field]}</span>)
                          ) : (
                            <span className={styles.changeChipMuted}>Using default content for this slide</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className={styles.editorSections}>
                      <section className={styles.editorSection}>
                        <div className={styles.sectionHead}>
                          <h5 className={styles.sectionTitle}>Copy</h5>
                          <p className={styles.sectionText}>Main text shown in the hero.</p>
                        </div>

                        <div className={styles.twoColGrid}>
                          <div className="form-group">
                            <label className="form-label">Accent (max 24 characters)</label>
                            <input type="text" className="form-input" maxLength={24} value={activeSlide.accent} onChange={(event) => updateHeroSlide(activeSlide.id, 'accent', event.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Title (max 42 characters)</label>
                            <input type="text" className="form-input" maxLength={42} value={activeSlide.title} onChange={(event) => updateHeroSlide(activeSlide.id, 'title', event.target.value)} />
                          </div>
                        </div>

                        {activeSlide.sourceType === 'custom' ? (
                          <div className="form-group">
                            <label className="form-label">Category Label (max 45 characters)</label>
                            <input type="text" className="form-input" maxLength={45} value={activeSlide.categoryName} onChange={(event) => updateHeroSlide(activeSlide.id, 'categoryName', event.target.value)} />
                          </div>
                        ) : null}

                        <div className="form-group">
                          <label className="form-label">Subtitle (max 90 characters)</label>
                          <textarea className="form-input form-textarea" rows={3} maxLength={90} value={activeSlide.subtitle} onChange={(event) => updateHeroSlide(activeSlide.id, 'subtitle', event.target.value)} />
                        </div>

                        <div className="form-group">
                          <label className="form-label">Description (max 180 characters)</label>
                          <textarea className="form-input form-textarea" rows={5} maxLength={180} value={activeSlide.description} onChange={(event) => updateHeroSlide(activeSlide.id, 'description', event.target.value)} />
                        </div>
                      </section>

                      <section className={styles.editorSection}>
                        <div className={styles.sectionHead}>
                          <h5 className={styles.sectionTitle}>CTA and Image</h5>
                          <p className={styles.sectionText}>Links and visual for this slide.</p>
                        </div>

                        <div className={styles.twoColGrid}>
                          <div className="form-group">
                            <label className="form-label">Quote Link</label>
                            <input type="text" className="form-input" value={activeSlide.quoteHref} onChange={(event) => updateHeroSlide(activeSlide.id, 'quoteHref', event.target.value)} />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Image Alt Text</label>
                            <input type="text" className="form-input" value={activeSlide.imageAlt} onChange={(event) => updateHeroSlide(activeSlide.id, 'imageAlt', event.target.value)} />
                          </div>
                        </div>

                        {activeSlide.sourceType === 'custom' ? (
                          <div className={styles.twoColGrid}>
                            <div className="form-group">
                              <label className="form-label">Detail Link</label>
                              <input type="text" className="form-input" value={activeSlide.detailHref} onChange={(event) => updateHeroSlide(activeSlide.id, 'detailHref', event.target.value)} />
                            </div>
                            <div className="form-group">
                              <label className="form-label">Detail Button Label</label>
                              <input type="text" className="form-input" value={activeSlide.detailLabel} onChange={(event) => updateHeroSlide(activeSlide.id, 'detailLabel', event.target.value)} />
                            </div>
                          </div>
                        ) : null}

                        <ImageUploadField label="Carousel Image" value={activeSlide.image} onChange={(value) => updateHeroSlide(activeSlide.id, 'image', value)} folder="general" hint="Wide PNG or WebP works best." />
                      </section>
                    </div>
                  </div>
                ) : (
                  <div className={styles.emptyEditor}>
                    <h4 className={styles.editorTitle}>No visible slides</h4>
                    <p className={styles.editorSubtitle}>Add a custom slide or restore a hidden default slide.</p>
                  </div>
                )}
              </div>

              <div className={styles.footerBar}>
                <div>
                  <p className={styles.footerTitle}>Save to publish the current hero setup.</p>
                  <p className={styles.footerText}>
                    {activeSlide ? `Current: ${activeSlide.categoryName} • ${activeSlide.sourceType === 'custom' ? 'custom slide' : activeSlideChanges.length > 0 ? `${activeSlideChanges.length} custom fields` : 'using defaults'}` : 'No slide selected'}
                  </p>
                </div>

                <button type="submit" className="btn btn-primary btn-sm" disabled={savingHero}>
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
