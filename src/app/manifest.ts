import type { MetadataRoute } from 'next';
import { COMPANY_INFO } from '@/lib/data';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: COMPANY_INFO.name,
    short_name: 'Spectra Pack',
    description: 'Packaging machine manufacturer for shrink wrapping, sealing, vacuum packing, conveyors and pallet wrapping.',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#063c32',
    icons: [
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/favicon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  };
}
