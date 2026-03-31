'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { HeroCarouselSlide } from '@/lib/home-hero';
import { shouldBypassNextImageOptimization } from '@/lib/image-utils';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState, type ReactNode } from 'react';
import styles from './CategoryHeroCarousel.module.css';

interface CategoryHeroCarouselProps {
  slides: HeroCarouselSlide[];
}

const AUTO_SLIDE_DELAY_MS = 3000;

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

export default function CategoryHeroCarousel({ slides }: CategoryHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [isAutoPaused, setIsAutoPaused] = useState(false);

  useEffect(() => {
    if (!slides.length) return undefined;

    setActiveIndex((current) => (current !== null && current < slides.length ? current : null));
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
      setActiveIndex((current) => (getResolvedSlideIndex(current, slides) + 1) % slides.length);
    }, AUTO_SLIDE_DELAY_MS);

    return () => window.clearInterval(intervalId);
  }, [isAutoPaused, slides]);

  if (!slides.length) {
    return null;
  }

  const displayedIndex = getResolvedSlideIndex(activeIndex, slides);

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setActiveIndex((current) => (getResolvedSlideIndex(current, slides) - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (getResolvedSlideIndex(current, slides) + 1) % slides.length);
  };

  const renderActionLink = (
    href: string,
    className: string,
    children: ReactNode,
  ) => {
    if (isExternalHref(href)) {
      return (
        <a href={href} className={className} target="_blank" rel="noopener noreferrer">
          {children}
        </a>
      );
    }

    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <section
      className={styles.hero}
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
        aria-label="Show previous machine category"
      >
        <ChevronLeft size={30} />
      </button>

      <button
        className={`${styles.control} ${styles.controlNext}`}
        onClick={goToNext}
        type="button"
        aria-label="Show next machine category"
      >
        <ChevronRight size={30} />
      </button>

      <div className="container">
        <div className={styles.viewport}>
          {slides.map((slide, index) => {
            const isActive = index === displayedIndex;

            return (
              <article
                key={slide.id}
                className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
                aria-hidden={!isActive}
              >
                {slide.image ? (
                  <div className={styles.machineBackdropGhost} aria-hidden="true">
                    <Image
                      src={slide.image}
                      alt=""
                      fill
                      sizes="(max-width: 900px) 0px, 44vw"
                      unoptimized={shouldBypassNextImageOptimization(slide.image)}
                      className={styles.machineBackdropGhostImage}
                    />
                  </div>
                ) : null}

                <div className={styles.copyColumn}>
                  <div className={styles.kickerRow}>
                    <span className={styles.kicker}>{slide.accent}</span>
                    <span className={styles.slideCount}>
                      {String(index + 1).padStart(2, '0')} / {String(slides.length).padStart(2, '0')}
                    </span>
                  </div>

                  <p className={styles.categoryLabel}>{slide.categoryName}</p>
                  <h1 className={styles.title}>{slide.title}</h1>
                  <p className={styles.subtitle}>{slide.subtitle}</p>

                  <div className={styles.copyDivider} />
                  <p className={styles.description}>{slide.description}</p>
                  <div className={styles.copyDivider} />

                  <div className={styles.actions}>
                    {renderActionLink(slide.quoteHref, styles.quoteButton, 'Get Quote')}
                    <Link href={slide.detailHref} className={styles.detailLink}>
                      {slide.detailLabel} <ArrowRight size={16} />
                    </Link>
                  </div>

                  <div className={styles.metaRow}>
                    <span className={styles.metaPill}>
                      {slide.machineCount > 0
                        ? `${slide.machineCount} ${slide.machineCount === 1 ? 'Machine' : 'Machines'}`
                        : 'Machine Family'}
                    </span>
                    <span className={styles.metaPill}>Made by Spectra Pack</span>
                  </div>

                  <div className={styles.highlightList}>
                    {slide.highlights.map((highlight) => (
                      <div key={`${slide.id}-${highlight}`} className={styles.highlightItem}>
                        <span className={styles.highlightBar} />
                        <span>{highlight}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className={styles.visualColumn}>
                  <div className={styles.visualGlow} />
                  <div className={styles.machineStage}>
                    <div className={styles.machineShadow} />
                    {slide.image ? (
                      <div className={styles.machineMotion}>
                        <Image
                          src={slide.image}
                          alt={slide.imageAlt}
                          fill
                          priority={index === displayedIndex}
                          sizes="(max-width: 768px) 92vw, (max-width: 1280px) 56vw, 920px"
                          unoptimized={shouldBypassNextImageOptimization(slide.image)}
                          className={styles.machineImage}
                        />
                      </div>
                    ) : (
                      <div className={styles.machinePlaceholder}>Image managed from admin</div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        <div className={styles.pagination}>
          {slides.map((slide, index) => (
            <button
              key={`${slide.id}-dot`}
              className={`${styles.paginationDot} ${index === displayedIndex ? styles.paginationDotActive : ''}`}
              onClick={() => goToSlide(index)}
              type="button"
              aria-label={`Show ${slide.title}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
