'use client';

import { useEffect, useState } from 'react';
import { Download, ExternalLink, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import styles from './page.module.css';

export default function AdminSettingsPage() {
  const [catalogPath, setCatalogPath] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/site-settings');
      const data = await res.json();

      if (typeof data?.catalogPath === 'string') {
        setCatalogPath(data.catalogPath);
      }
    } catch {
      toast.error('Failed to load catalog setting');
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);

    try {
      const res = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          key: 'catalog_path',
          value: catalogPath,
          label: 'Catalog PDF',
          description: 'Public PDF path or full URL used for Download Catalog links.',
        }),
      });

      if (!res.ok) {
        throw new Error('save');
      }

      toast.success('Catalog updated');
      void fetchSettings();
    } catch {
      toast.error('Failed to update catalog');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <div>
          <h1 className={styles.pageTitle}>Catalog</h1>
          <p className={styles.pageSubtitle}>
            Update the public catalog path used in hero buttons, navbar, footer, and category pages.
          </p>
        </div>
      </div>

      <div className={styles.card}>
        <div className={styles.cardTop}>
          <div className={styles.iconWrap}>
            <Download size={22} />
          </div>
          <div>
            <h3 className={styles.cardTitle}>Public Catalog Link</h3>
            <p className={styles.cardDesc}>
              Use a local public path like `/catalog/file.pdf` or a full external URL.
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className="form-group">
            <label className="form-label">Catalog Path / URL *</label>
            <input
              type="text"
              className="form-input"
              required
              value={catalogPath}
              onChange={(event) => setCatalogPath(event.target.value)}
              placeholder="/catalog/spectra-pack-machines-catalog.pdf"
            />
          </div>

          <div className={styles.actions}>
            <a
              href={catalogPath || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-sm btn-outline"
            >
              <ExternalLink size={14} /> Preview
            </a>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              <Save size={14} /> {saving ? 'Saving...' : 'Save Catalog'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
