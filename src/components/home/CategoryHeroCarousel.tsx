'use client';

import {
  ArrowRight,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
} from 'lucide-react';
import type { HeroCarouselSlide } from '@/lib/home-hero';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type CSSProperties, type ReactNode } from 'react';
import styles from './CategoryHeroCarousel.module.css';

interface CategoryHeroCarouselProps {
  slides: HeroCarouselSlide[];
}

const AUTO_SLIDE_DELAY_MS = 5500;

const APPLICATION_COMPOSITE_SLIDE_IDS = new Set([
  'custom-1782659629659-jzihz1',
  'custom-1775110186198-wma4ln',
  'custom-1782659627155-kzdzh3',
  'custom-1775110170502-2x1dkv',
  'sealing-machines',
  'pneumatic-impulse-sealing',
  'conveyors',
]);

const TRANSPARENT_CUTOUT_SLIDE_IDS = new Set([
  'shrink-wrapping-machines',
  'automatic-web-sealer-with-shrink-tunnel-machines',
  'semi-automatic-web-sealer-with-shrink-tunnel',
  'automatic-carton-taping-with-box-strapping',
  'l-sealer-with-shrink-tunnel',
  'vacuum-packaging-machines',
  'automatic-web-sealer-with-shrink-tunnel-bottles',
  'heavy-duty-shrink-tunnel-machines',
]);

const HERO_IMAGE_SIGNATURES: Partial<Record<string, readonly string[]>> = {
  'featured-liquid-filling-line': [
    '/images/hero/automatic-liquid-filling-line-cutout.png',
  ],
  'featured-atta-packaging-line': [
    '/images/hero/automatic-atta-packaging-line-cutout.png',
  ],
  'custom-1782659629659-jzihz1': ['78a11c4734de0f4d.png'],
  'custom-1775110186198-wma4ln': ['8b252e5929501304.png'],
  'custom-1782659627155-kzdzh3': ['0588c1f644758342.png'],
  'custom-1775110170502-2x1dkv': ['b4f784d0801b10be.png'],
  'sealing-machines': ['988b2087ff0a6477.png'],
  'pneumatic-impulse-sealing': ['a1fefbfbb0a89c52.png'],
  conveyors: ['cf74bcc711e3cf37.png'],
  'semi-automatic-web-sealer-with-shrink-tunnel': ['db9f9891b36ade32.png'],
  'automatic-carton-taping-with-box-strapping': ['d07d89627cbb0f17.png'],
  'l-sealer-with-shrink-tunnel': ['bf64a0358f09f0e6.png'],
  'vacuum-packaging-machines': [
    '902d985bcd70583e.png',
    'double-door-chamber-vacuum-machine-with-conveyor.png',
  ],
  'automatic-web-sealer-with-shrink-tunnel-bottles': ['2ca814c6d98490f9.png'],
  'heavy-duty-shrink-tunnel-machines': ['e652ad24bdd114eb.png'],
  'shrink-wrapping-machines': ['7bb81d1e9da656da.png'],
  'automatic-web-sealer-with-shrink-tunnel-machines': ['cd6610d3c44af737.png'],
  '6-head-liquid-filling-machine': ['e26d09983ae684f5.png'],
  'auger-filler-machine': ['2d0e31d7017b4d39.png'],
  'automatic-bottle-labeling-machine': ['bdf6494a575c4665.png'],
  'automatic-capping-machine': ['c62ce2b7b803da56.png'],
  'automatic-liquid-filling-line-setup': ['792e262257a34c3f.png'],
  'automatic-turntable-machine': ['9a741145b3e9f600.png'],
  'piston-paste-filling-machine': ['30fb98f2a22d80c4.png'],
  'semi-automatic-volumetric-piston-liquid-filling-machine': [
    '5cfe959822e260f6.png',
  ],
};

const supportsAssetSpecificVisuals = (slide: HeroCarouselSlide) => {
  const signatures = HERO_IMAGE_SIGNATURES[slide.id];

  if (!signatures?.length) {
    return false;
  }

  const normalizedImage = slide.image.toLowerCase();
  return signatures.some((signature) => normalizedImage.includes(signature));
};

type HeroAssetPreset = {
  foreground: string;
  backdrop?: string;
  foregroundIsCutout: boolean;
};

type HeroSamplePreset = {
  src: string;
  alt: string;
};

const HERO_ASSET_PRESETS: Partial<Record<string, HeroAssetPreset>> = {
  'featured-liquid-filling-line': {
    foreground: '/images/hero/automatic-liquid-filling-line-cutout.png',
    foregroundIsCutout: true,
  },
  'featured-atta-packaging-line': {
    foreground: '/images/hero/automatic-atta-packaging-line-cutout.png',
    foregroundIsCutout: true,
  },
  'custom-1782659629659-jzihz1': {
    foreground: '/images/hero/cutouts/automatic-bottle-shrink-wrap-machine.png',
    foregroundIsCutout: true,
  },
  'custom-1775110186198-wma4ln': {
    foreground: '/images/hero/cutouts/automatic-bottle-shrink-wrap-machine.png',
    foregroundIsCutout: true,
  },
  'custom-1782659627155-kzdzh3': {
    foreground: '/images/hero/cutouts/l-sealer-shrink-tunnel-v2.png',
    foregroundIsCutout: true,
  },
  'custom-1775110170502-2x1dkv': {
    foreground: '/images/hero/cutouts/pallet-stretch-wrapper-v2.png',
    foregroundIsCutout: true,
  },
  'sealing-machines': {
    foreground: '/images/hero/cutouts/band-sealer-machine-v2.webp',
    foregroundIsCutout: true,
  },
  'pneumatic-impulse-sealing': {
    foreground: '/images/hero/cutouts/pneumatic-impulse-sealer-v3.png',
    foregroundIsCutout: true,
  },
  conveyors: {
    foreground: '/images/hero/cutouts/conveyor-machine-v2.png',
    foregroundIsCutout: true,
  },
  'shrink-wrapping-machines': {
    foreground: '/images/hero/cutouts/shrink-sleeve-machine-v2.png',
    foregroundIsCutout: true,
  },
  'automatic-web-sealer-with-shrink-tunnel-machines': {
    foreground: '/images/hero/cutouts/automatic-web-sealer-line-v2.png',
    foregroundIsCutout: true,
  },
  'semi-automatic-web-sealer-with-shrink-tunnel': {
    foreground: '/images/hero/cutouts/semi-automatic-web-sealer-v2.png',
    foregroundIsCutout: true,
  },
  'automatic-carton-taping-with-box-strapping': {
    foreground:
      '/images/hero/cutouts/automatic-carton-taping-strapping-v2.png',
    foregroundIsCutout: true,
  },
  'l-sealer-with-shrink-tunnel': {
    foreground: '/images/hero/cutouts/l-sealer-shrink-tunnel-v2.png',
    foregroundIsCutout: true,
  },
  'vacuum-packaging-machines': {
    foreground: '/images/hero/cutouts/double-door-vacuum-line-v3.png',
    foregroundIsCutout: true,
  },
  'automatic-web-sealer-with-shrink-tunnel-bottles': {
    foreground: '/images/hero/cutouts/automatic-bottle-shrink-wrap-machine.png',
    foregroundIsCutout: true,
  },
  'heavy-duty-shrink-tunnel-machines': {
    foreground: '/images/hero/cutouts/heavy-duty-shrink-tunnel-v2.png',
    foregroundIsCutout: true,
  },
  '6-head-liquid-filling-machine': {
    foreground: '/images/hero/cutouts/six-head-liquid-filling-machine.png',
    foregroundIsCutout: true,
  },
  'auger-filler-machine': {
    foreground: '/images/hero/cutouts/auger-filler-machine.png',
    foregroundIsCutout: true,
  },
  'automatic-bottle-labeling-machine': {
    foreground: '/images/hero/cutouts/automatic-bottle-labeling-machine.png',
    foregroundIsCutout: true,
  },
  'automatic-capping-machine': {
    foreground: '/images/hero/cutouts/automatic-capping-machine.png',
    foregroundIsCutout: true,
  },
  'automatic-liquid-filling-line-setup': {
    foreground: '/images/hero/automatic-liquid-filling-line-cutout.png',
    foregroundIsCutout: true,
  },
  'automatic-turntable-machine': {
    foreground: '/images/hero/cutouts/automatic-turntable-machine.png',
    foregroundIsCutout: true,
  },
  'piston-paste-filling-machine': {
    foreground: '/images/hero/cutouts/piston-paste-filling-machine.png',
    foregroundIsCutout: true,
  },
  'semi-automatic-volumetric-piston-liquid-filling-machine': {
    foreground:
      '/images/hero/cutouts/semi-automatic-volumetric-piston-liquid-filling-machine.png',
    foregroundIsCutout: true,
  },
};

const HERO_SAMPLE_PRESETS: Partial<Record<string, HeroSamplePreset>> = {
  'featured-liquid-filling-line': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished liquid bottles',
  },
  'featured-atta-packaging-line': {
    src: '/images/hero/samples/atta-pouch.webp',
    alt: 'Finished atta pouch',
  },
  'custom-1782659629659-jzihz1': {
    src: '/images/hero/samples/bottle-multipack.webp',
    alt: 'Shrink-wrapped bottle multipack',
  },
  'custom-1775110186198-wma4ln': {
    src: '/images/hero/samples/bottle-multipack.webp',
    alt: 'Shrink-wrapped bottle multipack',
  },
  'custom-1782659627155-kzdzh3': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Shrink-ready carton',
  },
  'custom-1775110170502-2x1dkv': {
    src: '/images/hero/samples/stretch-wrapped-pallet.webp',
    alt: 'Stretch-wrapped pallet load',
  },
  'sealing-machines': {
    src: '/images/hero/samples/sealed-grain-pouch.webp',
    alt: 'Finished sealed pouch',
  },
  'band-sealing-machines': {
    src: '/images/hero/samples/sealed-grain-pouch.webp',
    alt: 'Finished sealed pouch',
  },
  'pneumatic-impulse-sealing': {
    src: '/images/hero/samples/sealed-grain-pouch.webp',
    alt: 'Finished sealed pouch',
  },
  conveyors: {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Conveyor-ready carton',
  },
  'conveyor-systems': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Conveyor-ready carton',
  },
  'pallet-stretch-wrapping-machines': {
    src: '/images/hero/samples/stretch-wrapped-pallet.webp',
    alt: 'Stretch-wrapped pallet load',
  },
  'shrink-wrapping-machines': {
    src: '/images/hero/samples/shrink-sleeved-bottle.webp',
    alt: 'Shrink-sleeved bottle',
  },
  'automatic-web-sealer-with-shrink-tunnel-machines': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Shrink-wrapped carton',
  },
  'semi-automatic-web-sealer-with-shrink-tunnel': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Shrink-wrapped carton',
  },
  'automatic-carton-taping-with-box-strapping': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Sealed dispatch carton',
  },
  'l-sealer-with-shrink-tunnel': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Shrink-wrapped carton',
  },
  'vacuum-packaging-machines': {
    src: '/images/hero/samples/vacuum-food-pouch.webp',
    alt: 'Vacuum-packed food pouch',
  },
  'automatic-web-sealer-with-shrink-tunnel-bottles': {
    src: '/images/hero/samples/bottle-multipack.webp',
    alt: 'Shrink-wrapped bottle multipack',
  },
  'heavy-duty-shrink-tunnel-machines': {
    src: '/images/hero/samples/sealed-carton.webp',
    alt: 'Shrink-wrapped carton',
  },
  'end-of-line-packaging': {
    src: '/images/hero/samples/stretch-wrapped-pallet.webp',
    alt: 'Stretch-wrapped pallet load',
  },
  'heavy-duty-top-packaging': {
    src: '/images/hero/samples/vacuum-food-pouch.webp',
    alt: 'Vacuum-packed pouch',
  },
  '6-head-liquid-filling-machine': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished liquid bottles',
  },
  'auger-filler-machine': {
    src: '/images/hero/samples/atta-pouch.webp',
    alt: 'Finished powder pouch',
  },
  'automatic-bottle-labeling-machine': {
    src: '/images/hero/samples/shrink-sleeved-bottle.webp',
    alt: 'Finished labelled bottle',
  },
  'automatic-capping-machine': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished capped bottles',
  },
  'automatic-liquid-filling-line-setup': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished liquid bottles',
  },
  'automatic-turntable-machine': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished liquid bottles',
  },
  'piston-paste-filling-machine': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished paste and liquid containers',
  },
  'semi-automatic-volumetric-piston-liquid-filling-machine': {
    src: '/images/hero/samples/filled-liquid-bottles.webp',
    alt: 'Finished liquid containers',
  },
};

const getHeroAssetPreset = (slide: HeroCarouselSlide) =>
  supportsAssetSpecificVisuals(slide)
    ? HERO_ASSET_PRESETS[slide.id]
    : undefined;

type HeroVisualPreset = {
  desktopScale: number;
  tabletScale: number;
  mobileScale: number;
  focus: string;
  shiftX?: string;
};

const HERO_VISUAL_PRESETS: Partial<Record<string, HeroVisualPreset>> = {
  'featured-liquid-filling-line': {
    desktopScale: 1,
    tabletScale: 0.98,
    mobileScale: 0.94,
    focus: '50% 52%',
  },
  'featured-atta-packaging-line': {
    desktopScale: 1,
    tabletScale: 0.98,
    mobileScale: 0.94,
    focus: '50% 52%',
  },
  'custom-1782659629659-jzihz1': {
    desktopScale: 1,
    tabletScale: 0.98,
    mobileScale: 0.94,
    focus: '50% 52%',
  },
  'custom-1775110186198-wma4ln': {
    desktopScale: 0.88,
    tabletScale: 0.86,
    mobileScale: 0.82,
    focus: '50% 52%',
    shiftX: '-1%',
  },
  'custom-1782659627155-kzdzh3': {
    desktopScale: 1.3,
    tabletScale: 1.22,
    mobileScale: 1.12,
    focus: '50% 50%',
    shiftX: '-3%',
  },
  'sealing-machines': {
    desktopScale: 0.98,
    tabletScale: 0.96,
    mobileScale: 0.92,
    focus: '50% 52%',
  },
  'semi-automatic-web-sealer-with-shrink-tunnel': {
    desktopScale: 1.32,
    tabletScale: 1.2,
    mobileScale: 1.1,
    focus: '45% 56%',
    shiftX: '0%',
  },
  'automatic-carton-taping-with-box-strapping': {
    desktopScale: 1.55,
    tabletScale: 1.5,
    mobileScale: 1.65,
    focus: '56% 53%',
    shiftX: '0%',
  },
  'l-sealer-with-shrink-tunnel': {
    desktopScale: 1.28,
    tabletScale: 1.18,
    mobileScale: 1.08,
    focus: '50% 46%',
    shiftX: '0%',
  },
  'pneumatic-impulse-sealing': {
    desktopScale: 0.9,
    tabletScale: 0.86,
    mobileScale: 0.82,
    focus: '50% 50%',
  },
  conveyors: {
    desktopScale: 1.04,
    tabletScale: 1,
    mobileScale: 0.96,
    focus: '50% 52%',
  },
  'vacuum-packaging-machines': {
    desktopScale: 0.96,
    tabletScale: 0.92,
    mobileScale: 0.88,
    focus: '50% 52%',
    shiftX: '0%',
  },
  'custom-1775110170502-2x1dkv': {
    desktopScale: 1,
    tabletScale: 0.98,
    mobileScale: 0.94,
    focus: '50% 52%',
  },
  'automatic-web-sealer-with-shrink-tunnel-machines': {
    desktopScale: 1.42,
    tabletScale: 1.32,
    mobileScale: 1.2,
    focus: '50% 52%',
  },
  'heavy-duty-shrink-tunnel-machines': {
    desktopScale: 1.2,
    tabletScale: 1.14,
    mobileScale: 1.06,
    focus: '50% 50%',
  },
  '6-head-liquid-filling-machine': {
    desktopScale: 1.12,
    tabletScale: 1.08,
    mobileScale: 1.02,
    focus: '50% 53%',
  },
  'auger-filler-machine': {
    desktopScale: 1.2,
    tabletScale: 1.15,
    mobileScale: 1.08,
    focus: '50% 51%',
  },
  'automatic-bottle-labeling-machine': {
    desktopScale: 1.13,
    tabletScale: 1.08,
    mobileScale: 1.02,
    focus: '50% 52%',
  },
  'automatic-capping-machine': {
    desktopScale: 1.14,
    tabletScale: 1.09,
    mobileScale: 1.02,
    focus: '50% 52%',
  },
  'automatic-liquid-filling-line-setup': {
    desktopScale: 0.96,
    tabletScale: 0.94,
    mobileScale: 0.9,
    focus: '50% 53%',
  },
  'automatic-turntable-machine': {
    desktopScale: 1.22,
    tabletScale: 1.16,
    mobileScale: 1.08,
    focus: '50% 52%',
  },
  'piston-paste-filling-machine': {
    desktopScale: 1.12,
    tabletScale: 1.08,
    mobileScale: 1.02,
    focus: '50% 52%',
  },
  'semi-automatic-volumetric-piston-liquid-filling-machine': {
    desktopScale: 1.28,
    tabletScale: 1.2,
    mobileScale: 1.12,
    focus: '50% 52%',
  },
};

type HeroVisualStyle = CSSProperties & {
  '--machine-scale-desktop'?: number;
  '--machine-scale-tablet'?: number;
  '--machine-scale-mobile'?: number;
  '--machine-focus'?: string;
  '--machine-shift-desktop'?: string;
};

const getHeroVisualStyle = (slideId: string): HeroVisualStyle | undefined => {
  const preset = HERO_VISUAL_PRESETS[slideId];

  if (!preset) {
    return undefined;
  }

  return {
    '--machine-scale-desktop': preset.desktopScale,
    '--machine-scale-tablet': preset.tabletScale,
    '--machine-scale-mobile': preset.mobileScale,
    '--machine-focus': preset.focus,
    '--machine-shift-desktop': preset.shiftX ?? '0%',
  };
};

const isExternalHref = (href: string) =>
  href.startsWith('http://') || href.startsWith('https://');

const getPreferredInitialIndex = (slides: HeroCarouselSlide[]) => {
  const firstSlideWithImage = slides.findIndex((slide) => slide.image.trim());
  return firstSlideWithImage >= 0 ? firstSlideWithImage : 0;
};

const getResolvedSlideIndex = (
  currentIndex: number | null,
  slides: HeroCarouselSlide[],
) =>
  currentIndex !== null && currentIndex < slides.length
    ? currentIndex
    : getPreferredInitialIndex(slides);

const getTitleSizeClass = (title: string) => {
  const normalizedTitle = title.trim();

  if (normalizedTitle.length >= 84) {
    return styles.titleCompact;
  }

  if (normalizedTitle.length >= 54) {
    return styles.titleMedium;
  }

  return '';
};

const HERO_IMAGE_SIZES =
  '(max-width: 900px) 100vw, (max-width: 1280px) 64vw, 1080px';
const HERO_PRELOAD_WIDTHS = [640, 750, 828, 1080, 1200, 1920, 2048, 3840];

const getHeroPreloadSource = (source: string, width = 1080) => {
  const normalizedSource = source.trim();

  if (shouldBypassNextImageOptimization(normalizedSource)) {
    return normalizedSource;
  }

  if (
    !normalizedSource.startsWith('/') &&
    !normalizedSource.startsWith('https://')
  ) {
    return normalizedSource;
  }

  return `/_next/image?url=${encodeURIComponent(normalizedSource)}&w=${width}&q=86`;
};

export default function CategoryHeroCarousel({
  slides,
}: CategoryHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isInteractionPaused, setIsInteractionPaused] = useState(false);
  const [isUserPaused, setIsUserPaused] = useState(false);
  const isAutoPaused = isInteractionPaused || isUserPaused;

  useEffect(() => {
    if (!slides.length) return undefined;

    setActiveIndex((current) =>
      current !== null && current < slides.length ? current : null,
    );
  }, [slides]);

  useEffect(() => {
    if (slides.length <= 1 || isAutoPaused) {
      return undefined;
    }

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)',
    );
    if (prefersReducedMotion.matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex(
        (current) =>
          (getResolvedSlideIndex(current, slides) + 1) % slides.length,
      );
    }, AUTO_SLIDE_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoPaused, slides]);

  useEffect(() => {
    if (slides.length <= 1) return;

    const currentIndex = getResolvedSlideIndex(activeIndex, slides);
    const nextSlide = slides[(currentIndex + 1) % slides.length];
    if (!nextSlide) return;

    const nextAssetPreset = getHeroAssetPreset(nextSlide);
    const imageSources = new Set(
      [nextAssetPreset?.foreground ?? nextSlide.image]
        .filter((source): source is string => Boolean(source?.trim()))
        .map((source) => source.trim()),
    );
    const preloadedImages: HTMLImageElement[] = [];

    const preloadTimer = window.setTimeout(() => {
      imageSources.forEach((source) => {
        const preloadedImage = new window.Image();
        preloadedImage.decoding = 'async';

        if (!shouldBypassNextImageOptimization(source)) {
          preloadedImage.sizes = HERO_IMAGE_SIZES;
          preloadedImage.srcset = HERO_PRELOAD_WIDTHS.map(
            (width) => `${getHeroPreloadSource(source, width)} ${width}w`,
          ).join(', ');
        }

        preloadedImage.src = getHeroPreloadSource(source);
        preloadedImages.push(preloadedImage);
      });
    }, 180);

    return () => {
      window.clearTimeout(preloadTimer);
      preloadedImages.length = 0;
    };
  }, [activeIndex, slides]);

  if (!slides.length) {
    return null;
  }

  const displayedIndex = getResolvedSlideIndex(activeIndex, slides);

  const goToPrev = () => {
    setActiveIndex(
      (current) =>
        (getResolvedSlideIndex(current, slides) - 1 + slides.length) %
        slides.length,
    );
  };

  const goToNext = () => {
    setActiveIndex(
      (current) => (getResolvedSlideIndex(current, slides) + 1) % slides.length,
    );
  };

  const renderActionLink = (
    href: string,
    className: string,
    children: ReactNode,
    isActive: boolean,
  ) => {
    if (isExternalHref(href)) {
      return (
        <a
          href={href}
          className={className}
          target="_blank"
          rel="noopener noreferrer"
          tabIndex={isActive ? undefined : -1}
        >
          {children}
        </a>
      );
    }

    return (
      <Link
        href={href}
        className={className}
        prefetch={isActive}
        tabIndex={isActive ? undefined : -1}
      >
        {children}
      </Link>
    );
  };

  return (
    <section
      className={styles.hero}
      role="region"
      aria-roledescription="carousel"
      aria-label="Featured packaging machine lines"
      data-auto-paused={isAutoPaused ? 'true' : undefined}
      data-motion-paused={isUserPaused ? 'true' : undefined}
      onMouseEnter={() => setIsInteractionPaused(true)}
      onMouseLeave={() => setIsInteractionPaused(false)}
      onFocusCapture={() => setIsInteractionPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsInteractionPaused(false);
        }
      }}
    >
      <button
        className={`${styles.control} ${styles.controlPrev}`}
        onClick={goToPrev}
        type="button"
        aria-label="Show previous featured machine line"
      >
        <ChevronLeft aria-hidden="true" size={28} />
      </button>

      <button
        className={`${styles.control} ${styles.controlNext}`}
        onClick={goToNext}
        type="button"
        aria-label="Show next featured machine line"
      >
        <ChevronRight aria-hidden="true" size={28} />
      </button>

      <div className="container">
        <div className={styles.viewport}>
          {slides
            .filter((_, slideIndex) => slideIndex === displayedIndex)
            .map((slide, indexWithinActiveSlides) => {
              const index = displayedIndex + indexWithinActiveSlides;
              const isActive = index === displayedIndex;
              const HeadingTag = isActive ? 'h1' : 'h2';
              const supportsVisualPreset = supportsAssetSpecificVisuals(slide);
              const assetPreset = getHeroAssetPreset(slide);
              const samplePreset = HERO_SAMPLE_PRESETS[slide.id];
              const hasCompositeSource =
                supportsVisualPreset &&
                APPLICATION_COMPOSITE_SLIDE_IDS.has(slide.id);
              const machineImageSrc = assetPreset?.foreground ?? slide.image;
              const backdropImageSrc =
                assetPreset?.backdrop ?? assetPreset?.foreground ?? slide.image;
              const usesTransparentCutout =
                assetPreset !== undefined
                  ? assetPreset.foregroundIsCutout
                  : machineImageSrc.includes('-cutout.png') ||
                    (supportsVisualPreset &&
                      TRANSPARENT_CUTOUT_SLIDE_IDS.has(slide.id));
              const usesApplicationComposite =
                !assetPreset?.foreground && hasCompositeSource;
              const visualStyle = supportsVisualPreset
                ? getHeroVisualStyle(slide.id)
                : undefined;
              const machineImageClassName = `${styles.machineImage} ${
                usesTransparentCutout ? styles.machineImageCutout : ''
              } ${
                usesApplicationComposite ? styles.machineImageComposite : ''
              }`;

              return (
                <article
                  key={slide.id}
                  className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
                  role="group"
                  aria-roledescription="slide"
                  aria-label={`${slide.title}, ${index + 1} of ${slides.length}`}
                  aria-hidden={!isActive}
                >
                  <div className={styles.copyColumn}>
                    <div className={styles.eyebrowRow}>
                      <span className={styles.eyebrow}>{slide.accent}</span>
                      <span className={styles.slideCount}>
                        {String(index + 1).padStart(2, '0')}
                        <span aria-hidden="true"> / </span>
                        {String(slides.length).padStart(2, '0')}
                      </span>
                    </div>

                    <p className={styles.categoryLabel}>{slide.categoryName}</p>
                    <HeadingTag
                      className={`${styles.title} ${getTitleSizeClass(slide.title)}`}
                    >
                      {slide.title}
                    </HeadingTag>
                    <p className={styles.subtitle}>{slide.subtitle}</p>

                    <div className={styles.copyDivider} aria-hidden="true" />
                    <p className={styles.description}>{slide.description}</p>

                    <div className={styles.actions}>
                      {renderActionLink(
                        slide.quoteHref,
                        styles.quoteButton,
                        'Get Quote',
                        isActive,
                      )}
                      {renderActionLink(
                        slide.detailHref,
                        styles.detailLink,
                        <>
                          {slide.detailLabel}
                          <ArrowRight aria-hidden="true" size={17} />
                        </>,
                        isActive,
                      )}
                    </div>

                    <div className={styles.assuranceRow}>
                      <span>
                        <BadgeCheck aria-hidden="true" size={17} />
                        Made by Spectra Pack
                      </span>
                      <span>Configured for your production line</span>
                    </div>
                  </div>

                  <div className={styles.visualColumn} style={visualStyle}>
                    {isActive && backdropImageSrc ? (
                      <div className={styles.visualBackdrop} aria-hidden="true">
                        <Image
                          src={backdropImageSrc}
                          alt=""
                          fill
                          quality={86}
                          sizes={HERO_IMAGE_SIZES}
                          unoptimized={shouldBypassNextImageOptimization(
                            backdropImageSrc,
                          )}
                          className={styles.backdropImage}
                        />
                      </div>
                    ) : null}

                    <div className={styles.visualSerial} aria-hidden="true">
                      <span>SPM engineered line</span>
                      <strong>{String(index + 1).padStart(2, '0')}</strong>
                    </div>

                    <div className={styles.machineStage}>
                      {isActive ? (
                        machineImageSrc ? (
                          <div className={styles.machineMotion}>
                            <div
                              className={`${styles.machineAssembly} ${
                                usesTransparentCutout
                                  ? styles.machineAssemblyCutout
                                  : ''
                              } ${
                                usesApplicationComposite
                                  ? styles.machineAssemblyComposite
                                  : ''
                              }`}
                            >
                              <Image
                                src={machineImageSrc}
                                alt={slide.imageAlt}
                                fill
                                quality={86}
                                priority={isActive}
                                sizes={HERO_IMAGE_SIZES}
                                unoptimized={shouldBypassNextImageOptimization(
                                  machineImageSrc,
                                )}
                                className={machineImageClassName}
                              />
                            </div>
                          </div>
                        ) : (
                          <div className={styles.machinePlaceholder}>
                            Image managed from admin
                          </div>
                        )
                      ) : null}

                      {isActive && samplePreset ? (
                        <div className={styles.sampleProduct}>
                          <span className={styles.sampleProductLabel}>
                            {samplePreset.alt}
                          </span>
                          <div className={styles.sampleProductMedia}>
                            <Image
                              src={samplePreset.src}
                              alt={samplePreset.alt}
                              fill
                              quality={78}
                              sizes="(max-width: 560px) 58px, (max-width: 900px) 68px, 88px"
                              className={styles.sampleProductImage}
                            />
                          </div>
                        </div>
                      ) : null}
                    </div>

                  </div>
                </article>
              );
            })}
        </div>

        {slides.length > 1 ? (
          <div
            className={styles.pagination}
            aria-label="Featured machine line progress"
          >
            <span className={styles.paginationLabel}>Machine collection</span>
            <span
              className={styles.paginationTrack}
              role="progressbar"
              aria-valuemin={1}
              aria-valuemax={slides.length}
              aria-valuenow={displayedIndex + 1}
              aria-valuetext={`${slides[displayedIndex].title}, slide ${displayedIndex + 1} of ${slides.length}`}
            >
              <span
                className={styles.paginationFill}
                style={{
                  width: `${((displayedIndex + 1) / slides.length) * 100}%`,
                }}
              />
            </span>
            <span className={styles.paginationValue} aria-hidden="true">
              {String(displayedIndex + 1).padStart(2, '0')}
              <span> / {String(slides.length).padStart(2, '0')}</span>
            </span>
            <button
              type="button"
              className={styles.pauseButton}
              onClick={() => setIsUserPaused((current) => !current)}
              aria-label={
                isUserPaused
                  ? 'Play automatic hero carousel'
                  : 'Pause automatic hero carousel'
              }
              aria-pressed={isUserPaused}
            >
              {isUserPaused ? (
                <Play aria-hidden="true" size={13} />
              ) : (
                <Pause aria-hidden="true" size={13} />
              )}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
