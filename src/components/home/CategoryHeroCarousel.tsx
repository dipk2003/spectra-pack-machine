'use client';

import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import styles from './CategoryHeroCarousel.module.css';

export type HeroCarouselSlide = {
  id: string;
  accent: string;
  categoryName: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  imageAlt: string;
  machineCount: number;
  detailHref: string;
  detailLabel: string;
  quoteHref: string;
  highlights: string[];
};

interface CategoryHeroCarouselProps {
  slides: HeroCarouselSlide[];
}

export default function CategoryHeroCarousel({ slides }: CategoryHeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    if (!slides.length) return undefined;

    setActiveIndex((current) => (current >= slides.length ? 0 : current));

    if (slides.length === 1) return undefined;

    const autoplay = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 5200);

    return () => window.clearInterval(autoplay);
  }, [slides.length]);

  if (!slides.length) {
    return null;
  }

  const goToSlide = (index: number) => {
    setActiveIndex(index);
  };

  const goToPrev = () => {
    setActiveIndex((current) => (current - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setActiveIndex((current) => (current + 1) % slides.length);
  };

  return (
    <section className={styles.hero}>
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
            const isActive = index === activeIndex;

            return (
              <article
                key={slide.id}
                className={`${styles.slide} ${isActive ? styles.slideActive : ''}`}
                aria-hidden={!isActive}
              >
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

                  <div className={styles.actions}>
                    <Link href={slide.quoteHref} className={styles.quoteButton}>
                      Get Quote
                    </Link>
                    <Link href={slide.detailHref} className={styles.detailLink}>
                      {slide.detailLabel} <ArrowRight size={16} />
                    </Link>
                  </div>
                </div>

                <div className={styles.visualColumn}>
                  <div className={styles.visualGlow} />
                  <div className={styles.machineStage}>
                    <div className={styles.machineShadow} />
                    <div className={styles.machineMotion}>
                      <Image
                        src={slide.image}
                        alt={slide.imageAlt}
                        fill
                        priority={index === 0}
                        sizes="(max-width: 768px) 92vw, (max-width: 1280px) 56vw, 920px"
                        className={styles.machineImage}
                      />
                    </div>
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
              className={`${styles.paginationDot} ${index === activeIndex ? styles.paginationDotActive : ''}`}
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
