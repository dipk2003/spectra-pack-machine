'use client';

import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { useEffect, useRef, type CSSProperties } from 'react';
import type {
  HeroProcessMotionMode,
  HeroProductKind,
} from './HeroProcessMotion';
import styles from './HeroProcessMotion.module.css';

gsap.registerPlugin(useGSAP);

type HeroProcessAnimatorProps = {
  slideId: string;
  motionMode: HeroProcessMotionMode;
  productKind: HeroProductKind;
  className?: string;
  isPaused?: boolean;
};

type MotionGeometry = {
  railLeft: string;
  railTop: string;
  railWidth: string;
  effectX: string;
  effectY: string;
};

type MotionStyle = CSSProperties & {
  '--process-rail-left': string;
  '--process-rail-top': string;
  '--process-rail-width': string;
  '--process-effect-x': string;
  '--process-effect-y': string;
};

const MODE_GEOMETRY: Record<HeroProcessMotionMode, MotionGeometry> = {
  'conveyor-product-flow': {
    railLeft: '25%',
    railTop: '65%',
    railWidth: '50%',
    effectX: '52%',
    effectY: '58%',
  },
  'sealer-pulse': {
    railLeft: '31%',
    railTop: '66%',
    railWidth: '42%',
    effectX: '49%',
    effectY: '58%',
  },
  'filling-cycle': {
    railLeft: '28%',
    railTop: '67%',
    railWidth: '48%',
    effectX: '52%',
    effectY: '49%',
  },
  'labelling-rotation': {
    railLeft: '30%',
    railTop: '67%',
    railWidth: '46%',
    effectX: '57%',
    effectY: '38%',
  },
  'pallet-turntable-orbit': {
    railLeft: '57%',
    railTop: '61%',
    railWidth: '20%',
    effectX: '63%',
    effectY: '58%',
  },
  'vacuum-pulse': {
    railLeft: '43%',
    railTop: '63%',
    railWidth: '30%',
    effectX: '52%',
    effectY: '49%',
  },
};

const SLIDE_GEOMETRY_OVERRIDES: Partial<
  Record<string, Partial<MotionGeometry>>
> = {
  'featured-liquid-filling-line': {
    railLeft: '24%',
    railTop: '65%',
    railWidth: '55%',
  },
  'featured-atta-packaging-line': {
    railLeft: '18%',
    railTop: '66%',
    railWidth: '61%',
  },
  'custom-1775110186198-wma4ln': {
    railLeft: '58%',
    railTop: '63%',
    railWidth: '28%',
    effectX: '68%',
    effectY: '54%',
  },
  'automatic-carton-taping-with-box-strapping': {
    railLeft: '43%',
    railTop: '66%',
    railWidth: '34%',
  },
  'automatic-turntable-machine': {
    railLeft: '54%',
    railTop: '62%',
    railWidth: '23%',
  },
};

const resolveMotionStyle = (
  slideId: string,
  motionMode: HeroProcessMotionMode,
): MotionStyle => {
  const geometry = {
    ...MODE_GEOMETRY[motionMode],
    ...SLIDE_GEOMETRY_OVERRIDES[slideId.trim().toLowerCase()],
  };

  return {
    '--process-rail-left': geometry.railLeft,
    '--process-rail-top': geometry.railTop,
    '--process-rail-width': geometry.railWidth,
    '--process-effect-x': geometry.effectX,
    '--process-effect-y': geometry.effectY,
  };
};

const addModeEffects = (
  timeline: gsap.core.Timeline,
  motionMode: HeroProcessMotionMode,
  primaryEffect: HTMLElement,
  secondaryEffect: HTMLElement,
) => {
  switch (motionMode) {
    case 'sealer-pulse':
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, scaleX: 0.56, scaleY: 0.7 },
          {
            autoAlpha: 0.78,
            scaleX: 1,
            scaleY: 1.35,
            duration: 0.42,
            ease: 'power2.out',
          },
          1.05,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0, scaleX: 0.88, scaleY: 0.72, duration: 0.34 },
          1.58,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, scale: 0.62 },
          { autoAlpha: 0.32, scale: 1.08, duration: 0.68, ease: 'sine.out' },
          1.12,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0, scale: 1.2, duration: 0.34 },
          1.76,
        );
      break;

    case 'filling-cycle':
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, scaleY: 0.08 },
          { autoAlpha: 0.7, scaleY: 1, duration: 0.34, ease: 'power1.out' },
          0.92,
        )
        .to(primaryEffect, { autoAlpha: 0, scaleY: 0.18, duration: 0.3 }, 1.6)
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, scale: 0.45 },
          { autoAlpha: 0.5, scale: 1, duration: 0.34, ease: 'sine.out' },
          1.18,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0, scale: 1.35, duration: 0.38 },
          1.48,
        );
      break;

    case 'labelling-rotation':
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.2, rotation: 0 },
          { autoAlpha: 0.55, rotation: 360, duration: 3.5, ease: 'none' },
          0.3,
        )
        .to(primaryEffect, { autoAlpha: 0.18, duration: 0.3 }, 3.8)
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, x: -8 },
          { autoAlpha: 0.55, x: 8, duration: 0.68, ease: 'power1.inOut' },
          1.2,
        )
        .to(secondaryEffect, { autoAlpha: 0, x: 16, duration: 0.28 }, 1.86);
      break;

    case 'pallet-turntable-orbit':
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.15, scale: 0.92 },
          { autoAlpha: 0.42, scale: 1, duration: 1.8, ease: 'sine.inOut' },
          0.2,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0.15, scale: 0.94, duration: 1.8, ease: 'sine.inOut' },
          2,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0.18, rotation: 0 },
          { autoAlpha: 0.7, rotation: 360, duration: 3.7, ease: 'none' },
          0.2,
        )
        .to(secondaryEffect, { autoAlpha: 0.16, duration: 0.24 }, 3.85);
      break;

    case 'vacuum-pulse':
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.12, scaleX: 1.05, scaleY: 1.08 },
          {
            autoAlpha: 0.44,
            scaleX: 0.86,
            scaleY: 0.76,
            duration: 1.4,
            ease: 'sine.inOut',
          },
          0.7,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0.12, scaleX: 1.02, scaleY: 1.04, duration: 1.1 },
          2.1,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, y: 14, scale: 0.65 },
          { autoAlpha: 0.55, y: -10, scale: 0.9, duration: 0.72 },
          1.45,
        )
        .to(secondaryEffect, { autoAlpha: 0, y: -30, duration: 0.58 }, 2.14);
      break;

    case 'conveyor-product-flow':
    default:
      break;
  }
};

export default function HeroProcessAnimator({
  slideId,
  motionMode,
  productKind,
  className,
  isPaused = false,
}: HeroProcessAnimatorProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const introTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const processTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const machineTimelineRef = useRef<gsap.core.Timeline | null>(null);
  const pausedRef = useRef(isPaused);
  pausedRef.current = isPaused;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return undefined;

      const machineForeground = root.parentElement?.querySelector<HTMLElement>(
        '[data-hero-machine-foreground]',
      );
      const rail = root.querySelector<HTMLElement>('[data-process-rail]');
      const railGuide = root.querySelector<HTMLElement>('[data-process-guide]');
      const primaryEffect = root.querySelector<HTMLElement>(
        '[data-process-effect="primary"]',
      );
      const secondaryEffect = root.querySelector<HTMLElement>(
        '[data-process-effect="secondary"]',
      );
      const tokens = Array.from(
        root.querySelectorAll<HTMLElement>('[data-process-token]'),
      );

      if (
        !rail ||
        !railGuide ||
        !primaryEffect ||
        !secondaryEffect ||
        !tokens.length
      ) {
        return undefined;
      }

      const media = gsap.matchMedia();

      media.add(
        {
          isDesktop: '(min-width: 641px)',
          isMobile: '(max-width: 640px)',
          reduceMotion: '(prefers-reduced-motion: reduce)',
        },
        (context) => {
          const conditions = context.conditions as
            | { isDesktop: boolean; isMobile: boolean; reduceMotion: boolean }
            | undefined;
          const isMobile = Boolean(conditions?.isMobile);
          const reduceMotion = Boolean(conditions?.reduceMotion);
          const activeTokens = tokens.slice(0, isMobile ? 1 : 2);

          gsap.set([railGuide, ...tokens], { autoAlpha: 0 });
          gsap.set([primaryEffect, secondaryEffect], {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
          });

          if (reduceMotion) {
            if (machineForeground) {
              gsap.set(machineForeground, { clearProps: 'transform' });
            }
            introTimelineRef.current = null;
            processTimelineRef.current = null;
            machineTimelineRef.current = null;
            return undefined;
          }

          const introTimeline = gsap.timeline({
            defaults: { ease: 'power2.out' },
            paused: pausedRef.current,
          });
          introTimeline.fromTo(
            railGuide,
            { autoAlpha: 0, scaleX: 0.35 },
            { autoAlpha: 0.46, scaleX: 1, duration: 0.42 },
          );

          if (machineForeground) {
            introTimeline.fromTo(
              machineForeground,
              { xPercent: -2.4, yPercent: 0.35, scale: 0.965 },
              {
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                duration: 1.05,
                ease: 'power3.out',
              },
              0,
            );
          }
          introTimelineRef.current = introTimeline;

          if (machineForeground) {
            const machineTimeline = gsap.timeline({
              delay: 1.25,
              paused: pausedRef.current,
              repeat: -1,
            });
            machineTimeline
              .to(machineForeground, {
                xPercent: 1.1,
                yPercent: -0.3,
                scale: 1.014,
                duration: 4.6,
                ease: 'sine.inOut',
              })
              .to(machineForeground, {
                xPercent: -0.9,
                yPercent: 0.22,
                scale: 1.004,
                duration: 4.8,
                ease: 'sine.inOut',
              });
            machineTimelineRef.current = machineTimeline;
          }

          const processTimeline = gsap.timeline({
            delay: 0.28,
            paused: pausedRef.current,
            repeat: -1,
            repeatRefresh: true,
          });

          activeTokens.forEach((token, index) => {
            const startAt = index * 1.62;
            const travelDuration = 3.05;

            processTimeline
              .set(
                token,
                {
                  autoAlpha: 0,
                  x: 0,
                  yPercent: -50,
                  scale: 0.84,
                },
                startAt,
              )
              .to(
                token,
                { autoAlpha: 0.94, duration: 0.22, ease: 'power1.out' },
                startAt,
              )
              .to(
                token,
                {
                  x: () => Math.max(0, rail.clientWidth - token.offsetWidth),
                  scale: 1,
                  duration: travelDuration,
                  ease: 'none',
                },
                startAt,
              )
              .to(
                token,
                { autoAlpha: 0, duration: 0.26, ease: 'power1.in' },
                startAt + travelDuration - 0.26,
              );
          });

          addModeEffects(
            processTimeline,
            motionMode,
            primaryEffect,
            secondaryEffect,
          );

          processTimelineRef.current = processTimeline;

          return () => {
            introTimelineRef.current = null;
            processTimelineRef.current = null;
            machineTimelineRef.current = null;
          };
        },
        root,
      );

      return () => {
        introTimelineRef.current = null;
        processTimelineRef.current = null;
        machineTimelineRef.current = null;
        media.revert();
      };
    },
    {
      scope: rootRef,
      dependencies: [slideId, motionMode, productKind],
      revertOnUpdate: true,
    },
  );

  useEffect(() => {
    const timelines = [
      introTimelineRef.current,
      processTimelineRef.current,
      machineTimelineRef.current,
    ].filter((timeline): timeline is gsap.core.Timeline => timeline !== null);
    if (!timelines.length) return;

    if (isPaused) {
      timelines.forEach((timeline) => timeline.pause());
      return;
    }

    timelines.forEach((timeline) => timeline.resume());
  }, [isPaused]);

  const productLabel = productKind === 'atta-bag' ? 'ATTA' : undefined;
  const motionStyle = resolveMotionStyle(slideId, motionMode);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={[styles.motion, className].filter(Boolean).join(' ')}
      data-motion-mode={motionMode}
      data-product-kind={productKind}
      data-slide-id={slideId}
      style={motionStyle}
    >
      <span
        className={`${styles.effect} ${styles.primaryEffect}`}
        data-process-effect="primary"
      />
      <span
        className={`${styles.effect} ${styles.secondaryEffect}`}
        data-process-effect="secondary"
      />
      <span className={styles.productRail} data-process-rail>
        <span className={styles.railGuide} data-process-guide />
        <span
          className={`${styles.productToken} ${styles.productOne}`}
          data-label={productLabel}
          data-process-token
        >
          <span />
        </span>
        <span
          className={`${styles.productToken} ${styles.productTwo}`}
          data-label={productLabel}
          data-process-token
        >
          <span />
        </span>
      </span>
    </div>
  );
}
