"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useEffect, useRef, type CSSProperties } from "react";
import type { HeroProcessMotionMode } from "./HeroProcessMotion";
import styles from "./HeroProcessMotion.module.css";

gsap.registerPlugin(useGSAP);

type HeroProcessAnimatorProps = {
  slideId: string;
  motionMode: HeroProcessMotionMode;
  className?: string;
  isPaused?: boolean;
};

type MotionGeometry = {
  railLeft: string;
  railTop: string;
  railWidth: string;
  nodePosition: string;
  effectX: string;
  effectY: string;
};

type MotionStyle = CSSProperties & {
  "--process-rail-left": string;
  "--process-rail-top": string;
  "--process-rail-width": string;
  "--process-node-position": string;
  "--process-effect-x": string;
  "--process-effect-y": string;
};

const MODE_GEOMETRY: Record<HeroProcessMotionMode, MotionGeometry> = {
  "conveyor-product-flow": {
    railLeft: "25%",
    railTop: "65%",
    railWidth: "50%",
    nodePosition: "54%",
    effectX: "52%",
    effectY: "58%",
  },
  "tunnel-cycle": {
    railLeft: "22%",
    railTop: "65%",
    railWidth: "56%",
    nodePosition: "58%",
    effectX: "55%",
    effectY: "56%",
  },
  "sealer-pulse": {
    railLeft: "31%",
    railTop: "66%",
    railWidth: "42%",
    nodePosition: "48%",
    effectX: "49%",
    effectY: "58%",
  },
  "filling-cycle": {
    railLeft: "28%",
    railTop: "67%",
    railWidth: "48%",
    nodePosition: "50%",
    effectX: "52%",
    effectY: "49%",
  },
  "labelling-rotation": {
    railLeft: "30%",
    railTop: "67%",
    railWidth: "46%",
    nodePosition: "59%",
    effectX: "57%",
    effectY: "38%",
  },
  "pallet-turntable-orbit": {
    railLeft: "57%",
    railTop: "61%",
    railWidth: "20%",
    nodePosition: "44%",
    effectX: "63%",
    effectY: "58%",
  },
  "vacuum-pulse": {
    railLeft: "43%",
    railTop: "63%",
    railWidth: "30%",
    nodePosition: "42%",
    effectX: "52%",
    effectY: "49%",
  },
};

const SLIDE_GEOMETRY_OVERRIDES: Partial<
  Record<string, Partial<MotionGeometry>>
> = {
  "featured-liquid-filling-line": {
    railLeft: "24%",
    railTop: "65%",
    railWidth: "55%",
  },
  "featured-atta-packaging-line": {
    railLeft: "18%",
    railTop: "66%",
    railWidth: "61%",
    nodePosition: "57%",
  },
  "custom-1775110186198-wma4ln": {
    railLeft: "58%",
    railTop: "63%",
    railWidth: "28%",
    nodePosition: "42%",
    effectX: "68%",
    effectY: "54%",
  },
  "automatic-carton-taping-with-box-strapping": {
    railLeft: "43%",
    railTop: "66%",
    railWidth: "34%",
  },
  "automatic-turntable-machine": {
    railLeft: "54%",
    railTop: "62%",
    railWidth: "23%",
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
    "--process-rail-left": geometry.railLeft,
    "--process-rail-top": geometry.railTop,
    "--process-rail-width": geometry.railWidth,
    "--process-node-position": geometry.nodePosition,
    "--process-effect-x": geometry.effectX,
    "--process-effect-y": geometry.effectY,
  };
};

const addModeEffects = (
  timeline: gsap.core.Timeline,
  motionMode: HeroProcessMotionMode,
  primaryEffect: HTMLElement,
  secondaryEffect: HTMLElement,
) => {
  switch (motionMode) {
    case "sealer-pulse":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, scaleX: 0.5, scaleY: 0.72 },
          {
            autoAlpha: 0.82,
            scaleX: 1,
            scaleY: 1.28,
            duration: 0.38,
            ease: "power2.out",
          },
          1.08,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0, scaleX: 0.9, scaleY: 0.76, duration: 0.32 },
          1.56,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, scale: 0.68 },
          { autoAlpha: 0.34, scale: 1.06, duration: 0.62, ease: "sine.out" },
          1.14,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0, scale: 1.16, duration: 0.3 },
          1.72,
        );
      break;

    case "tunnel-cycle":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, xPercent: -160, scaleY: 0.72 },
          {
            autoAlpha: 0.68,
            xPercent: 70,
            scaleY: 1,
            duration: 1.28,
            ease: "power1.inOut",
          },
          0.92,
        )
        .to(primaryEffect, { autoAlpha: 0, xPercent: 160, duration: 0.54 }, 2.2)
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0.08, scaleX: 0.72, scaleY: 0.82 },
          {
            autoAlpha: 0.42,
            scaleX: 1.08,
            scaleY: 1,
            duration: 0.78,
            ease: "sine.inOut",
          },
          1.06,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0.08, scaleX: 0.88, scaleY: 0.92, duration: 0.72 },
          1.84,
        );
      break;

    case "filling-cycle":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, scaleY: 0.06 },
          { autoAlpha: 0.72, scaleY: 1, duration: 0.3, ease: "power1.out" },
          0.92,
        )
        .to(primaryEffect, { autoAlpha: 0, scaleY: 0.16, duration: 0.28 }, 1.56)
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, scale: 0.48 },
          { autoAlpha: 0.48, scale: 1, duration: 0.3, ease: "sine.out" },
          1.12,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0, scale: 1.3, duration: 0.34 },
          1.42,
        );
      break;

    case "labelling-rotation":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.16, rotation: 0 },
          { autoAlpha: 0.58, rotation: 360, duration: 3.35, ease: "none" },
          0.26,
        )
        .to(primaryEffect, { autoAlpha: 0.16, duration: 0.24 }, 3.62)
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0, xPercent: -55 },
          {
            autoAlpha: 0.56,
            xPercent: 38,
            duration: 0.62,
            ease: "power1.inOut",
          },
          1.14,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0, xPercent: 78, duration: 0.24 },
          1.76,
        );
      break;

    case "pallet-turntable-orbit":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.12, scale: 0.92 },
          { autoAlpha: 0.42, scale: 1, duration: 1.72, ease: "sine.inOut" },
          0.22,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0.14, scale: 0.94, duration: 1.72, ease: "sine.inOut" },
          1.94,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0.16, rotation: 0 },
          { autoAlpha: 0.68, rotation: 360, duration: 3.55, ease: "none" },
          0.22,
        )
        .to(secondaryEffect, { autoAlpha: 0.14, duration: 0.2 }, 3.74);
      break;

    case "vacuum-pulse":
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0.1, scaleX: 1.06, scaleY: 1.08 },
          {
            autoAlpha: 0.44,
            scaleX: 0.82,
            scaleY: 0.72,
            duration: 1.28,
            ease: "sine.inOut",
          },
          0.72,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0.1, scaleX: 1.02, scaleY: 1.04, duration: 1.02 },
          2,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0.18, rotation: -38, scale: 0.86 },
          { autoAlpha: 0.58, rotation: 34, scale: 1, duration: 1.12 },
          0.86,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0.16, rotation: -26, scale: 0.9, duration: 0.88 },
          2.06,
        );
      break;

    case "conveyor-product-flow":
    default:
      timeline
        .fromTo(
          primaryEffect,
          { autoAlpha: 0, scaleY: 0.58 },
          { autoAlpha: 0.46, scaleY: 1, duration: 0.52, ease: "power1.out" },
          1.02,
        )
        .to(
          primaryEffect,
          { autoAlpha: 0.1, scaleY: 0.82, duration: 0.58 },
          1.58,
        )
        .fromTo(
          secondaryEffect,
          { autoAlpha: 0.08, rotation: 0, scale: 0.9 },
          {
            autoAlpha: 0.48,
            rotation: 180,
            scale: 1,
            duration: 1.2,
            ease: "none",
          },
          0.96,
        )
        .to(
          secondaryEffect,
          { autoAlpha: 0.08, rotation: 360, duration: 1.2 },
          2.16,
        );
      break;
  }
};

export default function HeroProcessAnimator({
  slideId,
  motionMode,
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

      const machineForeground = root.closest<HTMLElement>(
        "[data-hero-machine-foreground]",
      );
      const rail = root.querySelector<HTMLElement>("[data-process-rail]");
      const railGuide = root.querySelector<HTMLElement>("[data-process-guide]");
      const beltStrip = root.querySelector<HTMLElement>("[data-process-belt]");
      const feedPulse = root.querySelector<HTMLElement>("[data-process-feed]");
      const outputPulse = root.querySelector<HTMLElement>(
        "[data-process-output]",
      );
      const processNode = root.querySelector<HTMLElement>(
        "[data-process-node]",
      );
      const primaryEffect = root.querySelector<HTMLElement>(
        '[data-process-effect="primary"]',
      );
      const secondaryEffect = root.querySelector<HTMLElement>(
        '[data-process-effect="secondary"]',
      );

      if (
        !rail ||
        !railGuide ||
        !beltStrip ||
        !feedPulse ||
        !outputPulse ||
        !processNode ||
        !primaryEffect ||
        !secondaryEffect
      ) {
        return undefined;
      }

      const media = gsap.matchMedia();
      media.add(
        {
          reduceMotion: "(prefers-reduced-motion: reduce)",
          noPreference: "(prefers-reduced-motion: no-preference)",
        },
        (context) => {
          const conditions = context.conditions as
            | { reduceMotion: boolean; noPreference: boolean }
            | undefined;
          const reduceMotion = Boolean(conditions?.reduceMotion);

          gsap.set(
            [railGuide, beltStrip, feedPulse, outputPulse, processNode],
            { autoAlpha: 0 },
          );
          gsap.set([primaryEffect, secondaryEffect], {
            autoAlpha: 0,
            xPercent: -50,
            yPercent: -50,
          });

          if (reduceMotion) {
            gsap.set(railGuide, { autoAlpha: 0.2, scaleX: 1 });
            gsap.set(processNode, { autoAlpha: 0.28 });
            if (machineForeground)
              gsap.set(machineForeground, { clearProps: "transform" });
            introTimelineRef.current = null;
            processTimelineRef.current = null;
            machineTimelineRef.current = null;
            return undefined;
          }

          const introTimeline = gsap.timeline({
            defaults: { ease: "power2.out" },
            paused: pausedRef.current,
          });
          introTimeline
            .fromTo(
              railGuide,
              { autoAlpha: 0, scaleX: 0.24 },
              { autoAlpha: 0.36, scaleX: 1, duration: 0.46 },
            )
            .fromTo(
              processNode,
              { autoAlpha: 0, scale: 0.72 },
              { autoAlpha: 0.42, scale: 1, duration: 0.38 },
              0.24,
            )
            .to(beltStrip, { autoAlpha: 0.3, duration: 0.32 }, 0.22);

          if (machineForeground) {
            introTimeline.fromTo(
              machineForeground,
              { xPercent: -4, yPercent: 0.3, scale: 0.96 },
              {
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                duration: 1.05,
                ease: "power3.out",
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
                xPercent: 0.7,
                yPercent: -0.2,
                scale: 1.008,
                duration: 4.6,
                ease: "sine.inOut",
              })
              .to(machineForeground, {
                xPercent: -0.7,
                yPercent: 0.18,
                scale: 1.003,
                duration: 4.8,
                ease: "sine.inOut",
              })
              .to(machineForeground, {
                xPercent: 0,
                yPercent: 0,
                scale: 1,
                duration: 2.6,
                ease: "sine.inOut",
              });
            machineTimelineRef.current = machineTimeline;
          }

          const processTimeline = gsap.timeline({
            delay: 0.28,
            paused: pausedRef.current,
            repeat: -1,
            repeatDelay: 0.18,
          });
          processTimeline
            .fromTo(
              beltStrip,
              { xPercent: -7 },
              { xPercent: 0, duration: 0.72, repeat: 4, ease: "none" },
              0,
            )
            .fromTo(
              feedPulse,
              { autoAlpha: 0, x: 0, scaleX: 0.58 },
              { autoAlpha: 0.82, duration: 0.18, ease: "power1.out" },
              0.16,
            )
            .to(
              feedPulse,
              {
                x: () => Math.max(0, rail.clientWidth * 0.48),
                scaleX: 1,
                duration: 1.08,
                ease: "none",
              },
              0.16,
            )
            .to(feedPulse, { autoAlpha: 0, duration: 0.2 }, 1.08)
            .fromTo(
              processNode,
              { autoAlpha: 0.22, scale: 0.82 },
              {
                autoAlpha: 0.72,
                scale: 1.16,
                duration: 0.28,
                ease: "power2.out",
              },
              1.02,
            )
            .to(
              processNode,
              { autoAlpha: 0.28, scale: 1, duration: 0.42, ease: "sine.inOut" },
              1.3,
            )
            .fromTo(
              outputPulse,
              {
                autoAlpha: 0,
                x: () => Math.max(0, rail.clientWidth * 0.52),
                scaleX: 0.62,
              },
              { autoAlpha: 0.86, duration: 0.18, ease: "power1.out" },
              1.58,
            )
            .to(
              outputPulse,
              {
                x: () =>
                  Math.max(0, rail.clientWidth - outputPulse.offsetWidth),
                scaleX: 1,
                duration: 1.28,
                ease: "none",
              },
              1.58,
            )
            .to(outputPulse, { autoAlpha: 0, duration: 0.2 }, 2.68);

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
      dependencies: [slideId, motionMode],
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

  const motionStyle = resolveMotionStyle(slideId, motionMode);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className={[styles.motion, className].filter(Boolean).join(" ")}
      data-motion-mode={motionMode}
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
      <span className={styles.operationRail} data-process-rail>
        <span className={styles.railGuide} data-process-guide />
        <span className={styles.beltViewport}>
          <span className={styles.beltStrip} data-process-belt />
        </span>
        <span className={styles.feedPulse} data-process-feed />
        <span className={styles.processNode} data-process-node />
        <span className={styles.outputPulse} data-process-output />
      </span>
    </div>
  );
}
