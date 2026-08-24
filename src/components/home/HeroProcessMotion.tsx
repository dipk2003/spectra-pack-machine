'use client';

import styles from './HeroProcessMotion.module.css';

export type HeroProcessMotionMode =
  | 'conveyor-product-flow'
  | 'sealer-pulse'
  | 'filling-cycle'
  | 'labelling-rotation'
  | 'pallet-turntable-orbit'
  | 'vacuum-pulse';

export type HeroProductKind =
  | 'atta-bag'
  | 'bottle'
  | 'bottle-pack'
  | 'carton'
  | 'jar'
  | 'pallet'
  | 'pouch'
  | 'vacuum-pack';

const HERO_PROCESS_MOTION_BY_SLIDE_ID: Partial<
  Record<string, HeroProcessMotionMode>
> = {
  'featured-liquid-filling-line': 'filling-cycle',
  'featured-atta-packaging-line': 'conveyor-product-flow',
  'custom-1782659629659-jzihz1': 'conveyor-product-flow',
  'custom-1775110186198-wma4ln': 'conveyor-product-flow',
  'custom-1782659627155-kzdzh3': 'sealer-pulse',
  'custom-1775110170502-2x1dkv': 'pallet-turntable-orbit',
  'sealing-machines': 'sealer-pulse',
  'band-sealing-machines': 'sealer-pulse',
  'pneumatic-impulse-sealing': 'sealer-pulse',
  conveyors: 'conveyor-product-flow',
  'conveyor-systems': 'conveyor-product-flow',
  'pallet-stretch-wrapping-machines': 'pallet-turntable-orbit',
  'shrink-wrapping-machines': 'conveyor-product-flow',
  'automatic-web-sealer-with-shrink-tunnel-machines':
    'conveyor-product-flow',
  'semi-automatic-web-sealer-with-shrink-tunnel': 'sealer-pulse',
  'automatic-carton-taping-with-box-strapping': 'conveyor-product-flow',
  'l-sealer-with-shrink-tunnel': 'sealer-pulse',
  'vacuum-packaging-machines': 'vacuum-pulse',
  'automatic-web-sealer-with-shrink-tunnel-bottles':
    'conveyor-product-flow',
  'heavy-duty-shrink-tunnel-machines': 'conveyor-product-flow',
  '6-head-liquid-filling-machine': 'filling-cycle',
  'auger-filler-machine': 'filling-cycle',
  'automatic-bottle-labeling-machine': 'labelling-rotation',
  'automatic-capping-machine': 'filling-cycle',
  'automatic-liquid-filling-line-setup': 'filling-cycle',
  'automatic-turntable-machine': 'pallet-turntable-orbit',
  'piston-paste-filling-machine': 'filling-cycle',
  'semi-automatic-volumetric-piston-liquid-filling-machine': 'filling-cycle',
  'end-of-line-packaging': 'pallet-turntable-orbit',
  'heavy-duty-top-packaging': 'vacuum-pulse',
};

const HERO_PRODUCT_BY_SLIDE_ID: Partial<Record<string, HeroProductKind>> = {
  'featured-liquid-filling-line': 'bottle',
  'featured-atta-packaging-line': 'atta-bag',
  'custom-1782659629659-jzihz1': 'bottle-pack',
  'custom-1775110186198-wma4ln': 'bottle-pack',
  'custom-1782659627155-kzdzh3': 'carton',
  'custom-1775110170502-2x1dkv': 'pallet',
  'sealing-machines': 'pouch',
  'band-sealing-machines': 'pouch',
  'pneumatic-impulse-sealing': 'pouch',
  conveyors: 'carton',
  'conveyor-systems': 'carton',
  'pallet-stretch-wrapping-machines': 'pallet',
  'shrink-wrapping-machines': 'bottle-pack',
  'automatic-web-sealer-with-shrink-tunnel-machines': 'carton',
  'semi-automatic-web-sealer-with-shrink-tunnel': 'carton',
  'automatic-carton-taping-with-box-strapping': 'carton',
  'l-sealer-with-shrink-tunnel': 'carton',
  'vacuum-packaging-machines': 'vacuum-pack',
  'automatic-web-sealer-with-shrink-tunnel-bottles': 'bottle-pack',
  'heavy-duty-shrink-tunnel-machines': 'carton',
  '6-head-liquid-filling-machine': 'bottle',
  'auger-filler-machine': 'pouch',
  'automatic-bottle-labeling-machine': 'bottle',
  'automatic-capping-machine': 'bottle',
  'automatic-liquid-filling-line-setup': 'bottle',
  'automatic-turntable-machine': 'bottle',
  'piston-paste-filling-machine': 'jar',
  'semi-automatic-volumetric-piston-liquid-filling-machine': 'bottle',
  'end-of-line-packaging': 'pallet',
  'heavy-duty-top-packaging': 'vacuum-pack',
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

  if (normalizedId.includes('filling') || normalizedId.includes('filler')) {
    return 'filling-cycle';
  }

  if (
    normalizedId.includes('labelling') ||
    normalizedId.includes('labeling') ||
    normalizedId.includes('labeler') ||
    normalizedId.includes('labeller')
  ) {
    return 'labelling-rotation';
  }

  if (normalizedId.includes('pallet') || normalizedId.includes('stretch-wrap')) {
    return 'pallet-turntable-orbit';
  }

  if (normalizedId.includes('vacuum')) {
    return 'vacuum-pulse';
  }

  if (
    normalizedId.includes('conveyor') ||
    normalizedId.includes('taping') ||
    normalizedId.includes('carton') ||
    normalizedId.includes('shrink') ||
    normalizedId.includes('tunnel')
  ) {
    return 'conveyor-product-flow';
  }

  if (normalizedId.includes('sealer') || normalizedId.includes('sealing')) {
    return 'sealer-pulse';
  }

  return null;
}

export function resolveHeroProductKind(slideId: string): HeroProductKind {
  const normalizedId = slideId.trim().toLowerCase();
  const configuredProduct = HERO_PRODUCT_BY_SLIDE_ID[normalizedId];

  if (configuredProduct) {
    return configuredProduct;
  }

  if (normalizedId.includes('atta') || normalizedId.includes('flour')) {
    return 'atta-bag';
  }

  if (normalizedId.includes('pallet') || normalizedId.includes('stretch-wrap')) {
    return 'pallet';
  }

  if (normalizedId.includes('vacuum')) {
    return 'vacuum-pack';
  }

  if (normalizedId.includes('pouch') || normalizedId.includes('sealer')) {
    return 'pouch';
  }

  if (normalizedId.includes('carton') || normalizedId.includes('box')) {
    return 'carton';
  }

  if (normalizedId.includes('paste') || normalizedId.includes('jar')) {
    return 'jar';
  }

  if (normalizedId.includes('bottle') || normalizedId.includes('filling')) {
    return 'bottle';
  }

  return 'carton';
}

type HeroProcessMotionProps = {
  slideId: string;
  motionMode?: HeroProcessMotionMode | null;
  className?: string;
};

/**
 * Decorative process motion for the machine stage. It deliberately animates
 * production cues rather than the hero machine itself.
 */
export default function HeroProcessMotion({
  slideId,
  motionMode,
  className,
}: HeroProcessMotionProps) {
  const resolvedMode =
    motionMode === undefined
      ? resolveHeroProcessMotionMode(slideId)
      : motionMode;

  if (!resolvedMode) {
    return null;
  }

  const productKind = resolveHeroProductKind(slideId);
  const productLabel = productKind === 'atta-bag' ? 'ATTA' : undefined;

  return (
    <div
      aria-hidden="true"
      className={[styles.motion, className].filter(Boolean).join(' ')}
      data-motion-mode={resolvedMode}
      data-product-kind={productKind}
      data-slide-id={slideId}
    >
      <span className={`${styles.layer} ${styles.primary}`} />
      <span className={`${styles.layer} ${styles.secondary}`} />
      <span className={styles.productRail}>
        <span
          className={`${styles.productToken} ${styles.productOne}`}
          data-label={productLabel}
        >
          <span />
        </span>
        <span
          className={`${styles.productToken} ${styles.productTwo}`}
          data-label={productLabel}
        >
          <span />
        </span>
        <span
          className={`${styles.productToken} ${styles.productThree}`}
          data-label={productLabel}
        >
          <span />
        </span>
      </span>
    </div>
  );
}
