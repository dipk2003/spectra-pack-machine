// Read public HTML/assets only. Does not submit enquiries or send conversions.
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const origin = 'https://spectrapackmachines.com';
const config = JSON.parse(await readFile('vercel.json', 'utf8'));
const expectedId = config.build?.env?.NEXT_PUBLIC_GOOGLE_ADS_ID;
const expectedLabel = config.build?.env?.NEXT_PUBLIC_GOOGLE_ADS_LEAD_LABEL;
assert.ok(expectedId && expectedLabel, 'Expected public Ads destination missing from build configuration');
const response = await fetch(origin + '/contact', { signal: AbortSignal.timeout(30000) });
assert.equal(response.status, 200);
const html = await response.text();
const paths = [...new Set([...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map(match => match[1]))]
  .filter(path => path.startsWith('/_next/static/'));
const assets = await Promise.all(paths.map(async path => {
  const asset = await fetch(origin + path, { signal: AbortSignal.timeout(30000) });
  assert.equal(asset.status, 200);
  return { path, text: await asset.text() };
}));
const matching = assets.filter(asset => asset.text.includes(expectedId) && asset.text.includes(expectedLabel));
assert.ok(matching.length, 'Configured Ads ID and lead label not found together in live bundles');
console.log(JSON.stringify({
  checkedAt: new Date().toISOString(), page: origin + '/contact', httpStatus: response.status,
  publicConversionDestination: `${expectedId}/${expectedLabel}`,
  matchingAssets: matching.map(asset => asset.path),
  transactionIdLogicPresent: matching.some(asset => asset.text.includes('transaction_id')),
  leadEventPresent: matching.some(asset => asset.text.includes('generate_lead')),
  limitation: 'Static deployed configuration only; does not establish tag execution, account ownership, primary goal selection, Google receipt or attributed conversions.',
}, null, 2));
