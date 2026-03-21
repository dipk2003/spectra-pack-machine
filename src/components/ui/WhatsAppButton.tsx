'use client';

import { COMPANY_INFO } from '@/lib/data';
import styles from './WhatsAppButton.module.css';

export default function WhatsAppButton() {
  const message = encodeURIComponent("Hi, I'm interested in your packaging machines. Can you provide more details?");
  const url = `https://wa.me/${COMPANY_INFO.whatsapp}?text=${message}`;

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={styles.whatsapp} aria-label="Chat on WhatsApp" id="whatsapp-button">
      <svg viewBox="0 0 32 32" width="28" height="28" fill="#fff">
        <path d="M16.004 0h-.008C7.174 0 0 7.176 0 16c0 3.5 1.128 6.744 3.046 9.378L1.054 31.29l6.118-1.96A15.91 15.91 0 0016.004 32C24.826 32 32 24.822 32 16S24.826 0 16.004 0zm9.342 22.616c-.39 1.1-2.278 2.106-3.146 2.166-.794.054-1.764.076-2.846-.362-1.082-.44-2.476-1.024-4.264-2.006-3.764-2.064-6.228-5.842-6.414-6.114-.186-.272-1.52-2.02-1.52-3.854 0-1.832.962-2.732 1.304-3.108.342-.376.746-.47.996-.47h.718c.228 0 .536-.088.84.64.342.816 1.162 2.84 1.264 3.046.102.208.17.45.034.722-.136.272-.204.442-.408.68-.204.238-.428.532-.612.714-.204.204-.416.424-.178.832.238.408 1.058 1.748 2.272 2.832 1.562 1.394 2.878 1.826 3.286 2.03.408.204.646.17.884-.102.238-.272 1.02-1.19 1.292-1.6.272-.408.544-.34.916-.204.374.136 2.372 1.12 2.78 1.322.408.204.68.306.78.476.102.17.102.986-.288 2.086z"/>
      </svg>
      <span className={styles.pulse}></span>
    </a>
  );
}
