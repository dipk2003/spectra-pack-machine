import { Activity } from 'lucide-react';
import styles from './page.module.css';

export default function DeveloperLoading() {
  return (
    <div className={styles.routeState} role="status" aria-live="polite">
      <div className={styles.routeStateCard}>
        <Activity className={styles.routeStateIcon} size={30} aria-hidden="true" />
        <h1>Loading developer operations…</h1>
        <p>Traffic, WhatsApp clicks, leads, meetings, and configuration health are being prepared.</p>
      </div>
    </div>
  );
}
