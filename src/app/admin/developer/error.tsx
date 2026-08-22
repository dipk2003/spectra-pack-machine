'use client';

import { RotateCw, TriangleAlert } from 'lucide-react';
import styles from './page.module.css';

export default function DeveloperError({ reset }: { reset: () => void }) {
  return (
    <div className={styles.routeState} role="alert">
      <div className={styles.routeStateCard}>
        <TriangleAlert className={styles.routeStateIcon} size={30} aria-hidden="true" />
        <h1>Developer data could not load</h1>
        <p>The secure page remains protected. Retry the diagnostics request when ready.</p>
        <button type="button" className={styles.retryButton} onClick={reset}>
          <RotateCw size={15} aria-hidden="true" /> Retry
        </button>
      </div>
    </div>
  );
}
