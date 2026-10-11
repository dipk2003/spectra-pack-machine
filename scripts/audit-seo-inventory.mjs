import { readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const base = String(process.argv[2] || 'http://127.0.0.1:3100').replace(/\/+$/, '');
const inputPath = resolve('docs/SEO_URL_INVENTORY.csv');
const reportPath = resolve('docs/SEO_FULL_CRAWL_REPORT.md');

function parseCsv(text) {
  const rows = [];
  let row = [], field = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { field += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === ',' && !quoted) { row.push(field); field = ''; }
    else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(field); field = '';
      if (row.some(Boolean)) rows.push(row);
      row = [];
    } else field += char;
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  const [headers, ...records] = rows;
  return records.map(values => Object.fromEntries(headers.map((header, index) => [header, values[index] || ''])));
}

const decode = (value) => value
  .replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;|&#x27;/gi, "'")
  .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&#x([\da-f]+);/gi, (_, hex) => String.fromCodePoint(parseInt(hex, 16)));

const attr = (html, selector) => html.match(selector)?.[1] || '';
const escapeCsv = (value) => `"${String(value ?? '').replace(/"/g, '""')}"`;
const rows = parseCsv(await readFile(inputPath, 'utf8'));
const issues = [];
const results = new Array(rows.length);
let cursor = 0;

async function auditRow(row, index) {
  let requested;
  try {
    const source = new URL(row.url);
    requested = `${base}${source.pathname}${source.search}`;
  } catch {
    issues.push({ type: row.type, url: row.url, issue: 'Invalid inventory URL' });
    results[index] = { ...row, status: 'invalid-url' };
    return;
  }

  try {
    const response = await fetch(requested, { redirect: 'follow', signal: AbortSignal.timeout(45000) });
    const html = await response.text();
    const path = new URL(row.url).pathname;
    const technical = row.type === 'technical-seo';
    const expectedCanonical = new URL(row.canonical || row.url).href.replace(/\/$/, '');
    const title = decode(attr(html, /<title[^>]*>([\s\S]*?)<\/title>/i)).replace(/\s+/g, ' ').trim();
    const description = decode(attr(html, /<meta\s+name="description"\s+content="([^"]*)"/i)).replace(/\s+/g, ' ').trim();
    const canonical = decode(attr(html, /<link\s+rel="canonical"\s+href="([^"]+)"/i)).trim().replace(/\/$/, '');
    const robots = decode(attr(html, /<meta\s+name="robots"\s+content="([^"]+)"/i)).toLowerCase();
    const h1Count = (html.match(/<h1\b/gi) || []).length;
    const indexableExpected = !['technical-seo', 'district-planner-consolidated', 'category-noindex'].includes(row.type);
    const noindexExpected = row.type === 'category-noindex';
    const faults = [];

    if (response.status !== 200) faults.push(`HTTP ${response.status}`);
    if (response.redirected) faults.push(`redirected to ${new URL(response.url).pathname}`);
    if (!technical) {
      if (!title) faults.push('missing title');
      if (!description) faults.push('missing description');
      if (!canonical) faults.push('missing canonical');
      else if (canonical !== expectedCanonical) faults.push(`canonical mismatch: ${canonical}`);
      if (!h1Count) faults.push('missing H1');
      if (indexableExpected && /noindex/.test(robots)) faults.push(`unexpected ${robots}`);
      if (noindexExpected && !/noindex/.test(robots)) faults.push(`expected noindex, got ${robots || 'no robots directive'}`);
      if (indexableExpected && title.split('Spectra Pack Machines').length - 1 !== 1) faults.push('title does not have exactly one standard brand suffix');
      if (description.toLowerCase().includes('spectra pack machines')) faults.push('brand repeated in description');
    }

    const result = { ...row, status: response.status, finalUrl: response.url, title, description, canonical, robots, h1Count, faults: faults.join('; ') };
    results[index] = result;
    for (const fault of faults) issues.push({ type: row.type, url: row.url, issue: fault });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    results[index] = { ...row, status: 'fetch-error', faults: message };
    issues.push({ type: row.type, url: row.url, issue: `Fetch error: ${message}` });
  }
}

await Promise.all(Array.from({ length: 12 }, async () => {
  while (cursor < rows.length) {
    const index = cursor++;
    await auditRow(rows[index], index);
  }
}));

const indexable = results.filter(row => row && !['technical-seo', 'district-planner-consolidated', 'category-noindex'].includes(row.type) && row.status === 200);
for (const key of ['title', 'description']) {
  const seen = new Map();
  for (const item of indexable) {
    const normalized = String(item[key] || '').toLowerCase().replace(/\s+/g, ' ').trim();
    if (!normalized) continue;
    const prior = seen.get(normalized);
    if (prior && prior.canonical !== item.canonical) issues.push({ type: item.type, url: item.url, issue: `Duplicate ${key} with ${prior.url}` });
    else seen.set(normalized, item);
  }
}

const counts = Object.fromEntries([...new Set(rows.map(row => row.type))].sort().map(type => [type, rows.filter(row => row.type === type).length]));
const statusCounts = Object.fromEntries([...new Set(results.map(row => String(row?.status)))].sort().map(status => [status, results.filter(row => String(row?.status) === status).length]));
const csv = [
  ['type', 'url', 'status', 'finalUrl', 'title', 'description', 'canonical', 'robots', 'h1Count', 'faults'].map(escapeCsv).join(','),
  ...results.map(item => [item.type, item.url, item.status, item.finalUrl, item.title, item.description, item.canonical, item.robots, item.h1Count, item.faults].map(escapeCsv).join(',')),
].join('\n') + '\n';
await writeFile(resolve('docs/SEO_FULL_CRAWL_RESULTS.csv'), csv, 'utf8');
const report = [
  '# Full inventory HTTP and metadata crawl', '',
  `Run: ${new Date().toISOString()}`, `Target: ${base}`, `Inventory rows requested: ${rows.length}`,
  `Indexable canonical rows evaluated for unique titles/descriptions: ${indexable.length}`, '',
  '## Inventory counts', '', ...Object.entries(counts).map(([key, value]) => `- ${key}: ${value}`), '',
  '## HTTP status counts', '', ...Object.entries(statusCounts).map(([key, value]) => `- ${key}: ${value}`), '',
  `## Findings: ${issues.length}`, '',
  ...(issues.length ? issues.map(item => `- **${item.type}** ${item.url} — ${item.issue}`) : ['No HTTP, metadata, canonical, robots or duplicate title/description failures found.']), '',
  'Full row-level evidence is in `SEO_FULL_CRAWL_RESULTS.csv`. This crawl checks the local production build. It does not represent Googlebot behavior, Search Console decisions or ranking outcomes.', '',
].join('\n');
await writeFile(reportPath, report, 'utf8');
console.log(JSON.stringify({ target: base, inventoryRows: rows.length, indexableRowsChecked: indexable.length, statusCounts, issueCount: issues.length, reportPath, csvPath: resolve('docs/SEO_FULL_CRAWL_RESULTS.csv') }, null, 2));
