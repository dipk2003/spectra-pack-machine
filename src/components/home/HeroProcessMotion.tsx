"use client";

import dynamic from "next/dynamic";

const HeroProcessAnimator = dynamic(() => import("./HeroProcessAnimator"), {
  ssr: false,
});

export type HeroProcessMotionMode =
  | "conveyor-product-flow"
  | "tunnel-cycle"
  | "sealer-pulse"
  | "filling-cycle"
  | "labelling-rotation"
  | "pallet-turntable-orbit"
  | "vacuum-pulse";

const HERO_PROCESS_MOTION_BY_SLIDE_ID: Partial<
  Record<string, HeroProcessMotionMode>
> = {
  "featured-liquid-filling-line": "filling-cycle",
  "featured-atta-packaging-line": "tunnel-cycle",
  "custom-1782659629659-jzihz1": "tunnel-cycle",
  "custom-1775110186198-wma4ln": "tunnel-cycle",
  "custom-1782659627155-kzdzh3": "sealer-pulse",
  "custom-1775110170502-2x1dkv": "pallet-turntable-orbit",
  "sealing-machines": "sealer-pulse",
  "band-sealing-machines": "sealer-pulse",
  "pneumatic-impulse-sealing": "sealer-pulse",
  conveyors: "conveyor-product-flow",
  "conveyor-systems": "conveyor-product-flow",
  "pallet-stretch-wrapping-machines": "pallet-turntable-orbit",
  "shrink-wrapping-machines": "tunnel-cycle",
  "automatic-web-sealer-with-shrink-tunnel-machines": "tunnel-cycle",
  "semi-automatic-web-sealer-with-shrink-tunnel": "sealer-pulse",
  "automatic-carton-taping-with-box-strapping": "conveyor-product-flow",
  "l-sealer-with-shrink-tunnel": "tunnel-cycle",
  "vacuum-packaging-machines": "vacuum-pulse",
  "automatic-web-sealer-with-shrink-tunnel-bottles": "tunnel-cycle",
  "heavy-duty-shrink-tunnel-machines": "tunnel-cycle",
  "6-head-liquid-filling-machine": "filling-cycle",
  "auger-filler-machine": "filling-cycle",
  "automatic-bottle-labeling-machine": "labelling-rotation",
  "automatic-capping-machine": "filling-cycle",
  "automatic-liquid-filling-line-setup": "filling-cycle",
  "automatic-turntable-machine": "pallet-turntable-orbit",
  "piston-paste-filling-machine": "filling-cycle",
  "semi-automatic-volumetric-piston-liquid-filling-machine": "filling-cycle",
  "end-of-line-packaging": "pallet-turntable-orbit",
  "heavy-duty-top-packaging": "vacuum-pulse",
};

/**
 * Resolves a restrained, process-appropriate visual cue from a stable slide ID.
 * Explicit mappings cover the curated collection while keyword fallbacks keep
 * administrator-created category IDs useful without coupling motion to an image.
 */
export function resolveHeroProcessMotionMode(
  slideId: string,
): HeroProcessMotionMode | null {
  const normalizedId = slideId.trim().toLowerCase();

  if (!normalizedId) {
    return null;
  }

  const configuredMode = HERO_PROCESS_MOTION_BY_SLIDE_ID[normalizedId];

  if (configuredMode) {
    return configuredMode;
  }

  if (normalizedId.includes("filling") || normalizedId.includes("filler")) {
    return "filling-cycle";
  }

  if (
    normalizedId.includes("labelling") ||
    normalizedId.includes("labeling") ||
    normalizedId.includes("labeler") ||
    normalizedId.includes("labeller")
  ) {
    return "labelling-rotation";
  }

  if (
    normalizedId.includes("pallet") ||
    normalizedId.includes("stretch-wrap")
  ) {
    return "pallet-turntable-orbit";
  }

  if (normalizedId.includes("vacuum")) {
    return "vacuum-pulse";
  }

  if (normalizedId.includes("shrink") || normalizedId.includes("tunnel")) {
    return "tunnel-cycle";
  }

  if (
    normalizedId.includes("conveyor") ||
    normalizedId.includes("taping") ||
    normalizedId.includes("carton")
  ) {
    return "conveyor-product-flow";
  }

  if (normalizedId.includes("sealer") || normalizedId.includes("sealing")) {
    return "sealer-pulse";
  }

  return null;
}

type HeroProcessMotionProps = {
  slideId: string;
  motionMode?: HeroProcessMotionMode | null;
  className?: string;
  isPaused?: boolean;
};

/**
 * Decorative machine-operation motion for the hero stage. The overlay uses
 * feed paths, conveyor movement and process-zone cues only; it never inserts
 * floating sample products that can compete with the actual machine image.
 */
export default function HeroProcessMotion({
  slideId,
  motionMode,
  className,
  isPaused = false,
}: HeroProcessMotionProps) {
  const resolvedMode =
    motionMode === undefined
      ? resolveHeroProcessMotionMode(slideId)
      : motionMode;

  if (!resolvedMode) {
    return null;
  }

  return (
    <HeroProcessAnimator
      slideId={slideId}
      motionMode={resolvedMode}
      className={className}
      isPaused={isPaused}
    />
  );
}
