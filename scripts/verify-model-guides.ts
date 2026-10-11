import assert from 'node:assert/strict';
import { loadEnvConfig } from '@next/env';
import { listProducts } from '../src/lib/cms';
import { MODEL_GUIDE_PROFILES, MODEL_GUIDE_TOPICS, modelGuideHref, modelGuideMetadata, isModelGuideTopic } from '../src/lib/model-guides';
import { normalizePin, normalizeTown } from '../src/lib/location-enquiry';

loadEnvConfig(process.cwd());
async function main() {
  const products = await listProducts({ publishedOnly: true });
  assert.ok(products.length > 0);
  const titles = new Set<string>();
  const paths = new Set<string>();
  const focus = new Set<string>();
  for (const product of products) {
    const profile = MODEL_GUIDE_PROFILES[product.slug];
    assert.ok(profile, `Add original guide content before claiming coverage for ${product.slug}`);
    assert.ok(!focus.has(profile.focus), `Repeated model advice: ${product.slug}`);
    focus.add(profile.focus);
    assert.equal(profile.questions.length, 3);
    assert.equal(profile.trial.length, 3);
    for (const topic of MODEL_GUIDE_TOPICS) {
      const metadata = modelGuideMetadata(product, topic);
      const path = modelGuideHref(product.slug, topic);
      assert.ok(!titles.has(metadata.title));
      assert.ok(!paths.has(path));
      titles.add(metadata.title); paths.add(path);
      assert.ok(metadata.description.includes(product.title));
      assert.ok(metadata.keywords.length >= 3);
    }
  }
  assert.equal(isModelGuideTopic('price-cheap-best'), false);
  assert.equal(normalizeTown(['Vasai', 'Mumbai']), '');
  assert.equal(normalizeTown('<script>'), '');
  assert.equal(normalizeTown('x'.repeat(121)), '');
  assert.equal(normalizeTown('  Vasai   East '), 'Vasai East');
  assert.equal(normalizeTown('वसई'), 'वसई');
  assert.equal(normalizePin('401208'), '401208');
  assert.equal(normalizePin('000000'), '');
  assert.equal(normalizePin('401208extra'), '');
  console.log(`Model guide content passed: ${products.length} published models, ${paths.size} distinct supporting pages, unique model advice, location input validation.`);
}
main().catch(error => { console.error(error); process.exitCode = 1; });
