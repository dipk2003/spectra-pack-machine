import type { CSSProperties } from 'react';
import Image from 'next/image';
import styles from './HeroMachineAssembly.module.css';

export interface HeroMachineBuildStage {
  title: string;
  note: string;
}

interface HeroMachineAssemblyProps {
  image: string;
  imageAlt: string;
  buildStages: readonly HeroMachineBuildStage[];
  activeStage: number;
}

const LAYER_CLASSES = [
  'layerBase',
  'layerBody',
  'layerConveyor',
  'layerRoll',
  'layerControls',
] as const;

export default function HeroMachineAssembly({
  image,
  imageAlt,
  buildStages,
  activeStage,
}: HeroMachineAssemblyProps) {
  return (
    <div
      className={styles.scene}
      role="img"
      aria-label={`${imageAlt} assembling in layered 3D build animation.`}
    >
      <div className={styles.sceneGlow} />
      <div className={styles.sceneGrid} />
      <div className={styles.scenePlatform} />
      <div className={styles.sceneShadow} />
      <div className={styles.scanBeam} />

      <div className={styles.shellLayer}>
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 1200px) 78vw, 52vw"
          className={styles.shellImage}
        />
      </div>

      {buildStages.map((stage, index) => (
        <div
          key={stage.title}
          className={`${styles.layer} ${styles[LAYER_CLASSES[index] ?? LAYER_CLASSES[LAYER_CLASSES.length - 1]]} ${
            index <= activeStage ? styles.layerVisible : styles.layerHidden
          }`}
          style={{ '--layer-index': index } as CSSProperties}
        >
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 1200px) 78vw, 52vw"
            className={styles.layerImage}
          />
          <span className={styles.layerTag}>{stage.title}</span>
        </div>
      ))}
    </div>
  );
}
