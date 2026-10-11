import { NextRequest, NextResponse } from 'next/server';
import { findDistrictState } from '@/lib/india-districts';
import { listProducts } from '@/lib/cms';
import { normalizePin, normalizeTown } from '@/lib/location-enquiry';

export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams;
  const state = findDistrictState(input.get('state') || '');
  const district = state?.districts.find(item => item.slug === input.get('district'));
  const town = normalizeTown(input.get('town'));
  const pin = normalizePin(input.get('pin'));
  if (!state || !district || (input.get('town')?.trim() && !town) || (input.get('pin')?.trim() && !pin)) {
    return NextResponse.json({ error: 'Select a valid state and district, and check your town and six-digit PIN.' }, { status: 400, headers: { 'X-Robots-Tag': 'noindex' } });
  }
  const destination = new URL(`/packaging-machines/india/${state.slug}/${district.slug}`, request.url);
  if (town) destination.searchParams.set('town', town);
  if (pin) destination.searchParams.set('pin', pin);
  const product = input.get('product');
  if (product) {
    const products = await listProducts({ publishedOnly: true });
    if (products.some(item => item.slug === product)) destination.searchParams.set('product', product);
  }
  // A relative Location preserves the visitor's origin behind reverse proxies
  // and local previews, where request.url can contain an internal hostname.
  return new NextResponse(null, { status: 303, headers: {
    Location: destination.pathname + destination.search,
    'X-Robots-Tag': 'noindex',
  } });
}
