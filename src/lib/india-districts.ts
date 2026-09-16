import snapshot from './india-districts.json';
import { INDIA_STATE_MARKETS } from './india-markets';
export const DISTRICT_DIRECTORY_DATE = snapshot.retrievedAt;
export const DISTRICT_DIRECTORY_SOURCE = snapshot.source;
export const localitySlug = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const INDIA_DISTRICT_DIRECTORY = INDIA_STATE_MARKETS.map(state => {
  const source = snapshot.states.find(entry => entry.name === state.name);
  if (!source) throw new Error('Missing district directory for ' + state.name);
  return { ...state, source: source.source, districts: source.districts.map(name => ({ name, slug: localitySlug(name) })) };
});
export const findDistrictState = (slug: string) => INDIA_DISTRICT_DIRECTORY.find(state => state.slug === slug);
