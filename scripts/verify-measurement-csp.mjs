import assert from 'node:assert/strict';
const base = process.argv[2] || 'https://spectrapackmachines.com';
const results = [];
for (const path of ['/', '/contact', '/products/l-sealer-with-shrink-tunnel-machine']) {
  const response = await fetch(new URL(path, base), { signal: AbortSignal.timeout(30000), cache: 'no-store' });
  assert.equal(response.status, 200, path);
  const policy = response.headers.get('content-security-policy');
  assert.ok(policy, `${path}: missing CSP`);
  const directives = Object.fromEntries(policy.split(';').map(item => {
    const [directive, ...values] = item.trim().split(/\s+/);
    return [directive, values];
  }));
  assert.ok(directives['connect-src'].includes('https://stats.g.doubleclick.net'), `${path}: GA measurement endpoint blocked`);
  assert.ok(directives['connect-src'].includes('https://googleads.g.doubleclick.net'), `${path}: Ads endpoint blocked`);
  assert.ok(!directives['connect-src'].includes('*'), `${path}: unrestricted connections`);
  assert.deepEqual(directives['object-src'], ["'none'"]);
  assert.deepEqual(directives['frame-ancestors'], ["'none'"]);
  results.push({ path, status: response.status, measurementEndpointAllowed: true });
  await response.body?.cancel();
}
console.log(JSON.stringify({ checkedAt: new Date().toISOString(), base, results,
  limitation: 'Verifies live CSP and page availability, not successful enquiry conversion receipt in Google Ads.' }, null, 2));
