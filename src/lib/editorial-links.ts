import type { ProductData } from './products';

// Names changed in the CMS after the original catalog was created. Resolve
// references only to a currently published equivalent, never to a guessed URL.
const PRODUCT_ALIASES: Record<string, string[]> = {
  'semi-automatic-web-sealer-with-shrink-tunnel-bottles': ['semi-automatic-web-sealer-with-shrink-tunnel'],
  'semi-automatic-web-sealer-with-shrink-tunnel-box': ['semi-automatic-web-sealer-with-shrink-tunnel'],
  'l-sealer-with-shrink-tunnel-machine-indian': ['l-sealer-with-shrink-tunnel-machine'],
  'mini-horizontal-band-sealer': ['horizontal-band-sealer-machine'],
  'master-horizontal-band-sealer': ['horizontal-band-sealer-master-model'],
  'master-vertical-band-sealer': ['vertical-band-sealer-machine-indian-model'],
  'u-type-slate-conveyor': ['u-type-slat-conveyor'],
  'heavy-duty-slate-chain-conveyor': ['heavy-duty-slat-chain-conveyor'],
  'pallet-stretch-wrapping-machine': ['pallet-stretch-wrapping'],
  'pallet-stretch-wrap-machine': ['pallet-stretch-wrapping'],
};

export function resolveGuideProduct(slug: string, products: ProductData[]) {
  const candidates = [slug, ...(PRODUCT_ALIASES[slug] || [])];
  return candidates.map((candidate) => products.find((product) => product.slug === candidate)).find(Boolean) || null;
}

export function resolveGuideHref(href: string, products: ProductData[], serviceSlugs: string[]) {
  const productMatch = href.match(/^\/products\/([^/?#]+)$/);
  if (productMatch) {
    const product = resolveGuideProduct(productMatch[1], products);
    return product ? `/products/${product.slug}` : null;
  }
  const serviceMatch = href.match(/^\/services\/([^/?#]+)$/);
  if (serviceMatch && !serviceSlugs.includes(serviceMatch[1])) return '/services';
  return /^\/(?!\/)[a-z0-9/#?=&%_.-]*$/i.test(href) ? href : null;
}
