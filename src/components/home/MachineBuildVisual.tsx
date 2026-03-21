import type { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './MachineBuildVisual.module.css';

const MACHINE_LAYERS = [
  { key: 'base', label: 'Frame Base', className: 'layerBase' },
  { key: 'tunnel', label: 'Shrink Tunnel', className: 'layerTunnel' },
  { key: 'conveyor', label: 'Sealing Bridge', className: 'layerConveyor' },
  { key: 'control', label: 'Control & Film', className: 'layerControl' },
] as const;

interface MachineBuildVisualProps {
  activeStage: number;
  variant?: 'hero' | 'section';
}

export default function MachineBuildVisual({
  activeStage,
  variant = 'section',
}: MachineBuildVisualProps) {
  return (
    <div
      className={`${styles.scene} ${
        variant === 'hero' ? styles.heroScene : styles.sectionScene
      }`}
      role="img"
      aria-label="L-sealer machine revealing part by part with a layered 3D build effect."
    >
      <div className={styles.sceneGlow} />
      <div className={styles.sceneGrid} />
      <div className={styles.scenePlatform} />
      <div className={styles.sceneShadow} />

      {MACHINE_LAYERS.map((layer, index) => (
        <div
          key={layer.key}
          className={`${styles.layer} ${styles[layer.className]} ${
            index <= activeStage ? styles.layerVisible : styles.layerHidden
          }`}
          style={{ '--layer-index': index } as CSSProperties}
        >
          <Image
            src="/images/showcase/machine-build-l-sealer.png"
            alt=""
            fill
            sizes={
              variant === 'hero'
                ? '(max-width: 1200px) 100vw, 42vw'
                : '(max-width: 1200px) 100vw, 48vw'
            }
            priority={variant === 'hero'}
            className={styles.layerImage}
          />
          <span className={styles.layerTag}>{layer.label}</span>
        </div>
      ))}

      <div className={styles.sceneAccent} />
    </div>
  );
}
