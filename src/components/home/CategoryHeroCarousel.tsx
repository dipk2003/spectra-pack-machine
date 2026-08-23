'use client';

import { ArrowRight, BadgeCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroCarouselSlide } from '@/lib/home-hero';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import styles from './CategoryHeroCarousel.module.css';

interface CategoryHeroCarouselProps {
  slides: HeroCarouselSlide[];
}

const AUTO_SLIDE_DELAY_MS = 5500;

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

export default function CategoryHeroCarousel({ slides }: CategoryHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

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

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) {
      return undefined;
    }

    const intervalId = window.setInterval(() => {
      setActiveIndex(
        (current) => (getResolvedSlideIndex(current, slides) + 1) % slides.length,
      );
    }, AUTO_SLIDE_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoPaused, slides]);

  if (!slides.length) {
    return null;
  }

  const displayedIndex = getResolvedSlideIndex(activeIndex, slides);

  const goToPrev = () => {
    setActiveIndex(
      (current) =>
        (getResolvedSlideIndex(current, slides) - 1 + slides.length) % slides.length,
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
      <Link href={href} className={className} tabIndex={isActive ? undefined : -1}>
        {children}
      </Link>
    );
  };

  return (
    <section
      className={styles.hero}
      aria-label="Featured packaging machine lines"
      onMouseEnter={() => setIsAutoPaused(true)}
      onMouseLeave={() => setIsAutoPaused(false)}
      onFocusCapture={() => setIsAutoPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsAutoPaused(false);
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
          {slides.map((slide, index) => {
            const isActive = index === displayedIndex;
            const HeadingTag = isActive ? 'h1' : 'h2';
            const usesTransparentCutout = slide.image.includes('-cutout.png');

            return (
              <article
                key={slide.id}
                className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
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

                <div className={styles.visualColumn}>
                  <div className={styles.visualSerial} aria-hidden="true">
                    <span>SPM engineered line</span>
                    <strong>{String(index + 1).padStart(2, '0')}</strong>
                  </div>

                  <div className={styles.machineStage}>
                    <div className={styles.machineEnergy} aria-hidden="true" />
                    {slide.image ? (
                      <div className={styles.machineMotion}>
                        <Image
                          src={slide.image}
                          alt={slide.imageAlt}
                          fill
                          priority={index === 0}
                          sizes="(max-width: 900px) 94vw, (max-width: 1280px) 58vw, 920px"
                          unoptimized={shouldBypassNextImageOptimization(slide.image)}
                          className={`${styles.machineImage} ${
                            usesTransparentCutout ? styles.machineImageCutout : ''
                          }`}
                        />
                      </div>
                    ) : (
                      <div className={styles.machinePlaceholder}>
                        Image managed from admin
                      </div>
                    )}
                  </div>

                  <div className={styles.visualLabel}>
                    <span className={styles.visualLabelDot} aria-hidden="true" />
                    <span className={styles.visualLabelCopy}>
                      <span>Integrated packaging solution</span>
                      <strong>{slide.categoryName}</strong>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {slides.length > 1 ? (
          <div className={styles.pagination} aria-label="Featured machine line progress">
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
                style={{ width: `${((displayedIndex + 1) / slides.length) * 100}%` }}
              />
            </span>
            <span className={styles.paginationValue} aria-hidden="true">
              {String(displayedIndex + 1).padStart(2, '0')}
              <span> / {String(slides.length).padStart(2, '0')}</span>
            </span>
          </div>
        ) : null}
      </div>
    </section>
  );
}
