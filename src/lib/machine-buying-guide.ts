import type { ProductData } from './data';

// Selection advice is deliberately separate from rated product specifications.
// It must not imply that an untested material or application is supported.
export function machineBuyingGuide(product: ProductData) {
  const name = product.title;
  const title = name.toLowerCase();
  let checks = ['Product dimensions and weight', 'Required good packs per hour', 'Available floor space and utilities'];
  let trial = 'Run representative production samples and record accepted output, rejects, stoppages and changeover time.';
  let terms = [product.category];

  if (/vacuum/.test(title)) {
    terms = ['vacuum packing machine', 'vacuum packaging machine'];
    checks = ['Filled bag dimensions and chamber clearance', 'Bag material and sealing requirements', 'Product temperature, moisture and target cycle time'];
    trial = 'Test filled bags for chamber fit, seal contamination and repeatable evacuation. Shelf life requires separate product and packaging validation.';
  } else if (/stretch|pallet/.test(title)) {
    terms = ['pallet wrapping machine', 'stretch wrapping machine'];
    checks = ['Pallet dimensions, height and gross weight', 'Load stability and film specification', 'Loading method, floor access and wrapping pattern'];
    trial = 'Wrap a representative load and check film coverage, load movement, corner damage and unloading access before accepting the configuration.';
  } else if (/conveyor/.test(title)) {
    terms = ['material handling conveyor', 'packaging line conveyor'];
    checks = ['Product footprint, weight and base shape', 'Transfer height, conveyor length and line speed', 'Accumulation, cleaning and upstream/downstream interfaces'];
    trial = 'Test transfers with the smallest and largest products, including planned stops and restarts. Check tipping, gaps and accumulation at the next machine.';
  } else if (/band.*seal/.test(title)) {
    terms = ['continuous band sealing machine', 'pouch sealing machine'];
    checks = ['Pouch material, thickness and seal width', 'Filled pouch weight and orientation', 'Conveyor support and sealing speed'];
    trial = 'Use filled production pouches to check seal integrity at the intended speed. For liquids or powders, assess how the pouch mouth stays clean during feeding.';
  } else if (/tube.*seal/.test(title)) {
    terms = ['tube sealing machine'];
    checks = ['Tube material, diameter and filled height', 'Seal style and coding requirement', 'Product residue near the sealing area'];
    trial = 'Confirm tube compatibility with a sample trial and inspect the closure for leaks, distortion and consistent finish.';
  } else if (/sleeve/.test(title)) {
    terms = ['shrink sleeve wrapping machine'];
    checks = ['Container dimensions and sleeve material', 'Sleeve placement and heat sensitivity', 'Required throughput and conveyor interface'];
    trial = 'Trial the actual container and sleeve together. Check wrinkles, alignment and heat effects on the container, closure and printed decoration.';
  } else if (/shrink|web sealer|l-sealer/.test(title)) {
    terms = ['shrink wrapping machine', 'shrink packaging machine'];
    checks = ['Pack or bundle dimensions and orientation', 'Film type, thickness and heat sensitivity', 'Sealing clearance, tunnel opening and line speed'];
    trial = 'Trial the complete pack with the intended film. Check seal strength, shrink finish and product condition while measuring sustained output.';
  } else if (/seal/.test(title)) {
    terms = ['bag sealing machine', 'packaging sealing machine'];
    checks = ['Bag material, thickness and mouth width', 'Required seal length and filled pack weight', 'Operator handling and expected sealing cycles'];
    trial = 'Check seal continuity and strength on the actual packaging material, including samples with the intended fill level.';
  } else if (/filling|filler/.test(title)) {
    terms = ['filling machine'];
    checks = ['Product viscosity and filling temperature', 'Container opening and target fill quantity', 'Accuracy, cleaning and output requirements'];
  }

  return {
    terms,
    checks,
    trial,
    price: `${name} pricing depends on the selected configuration, capacity, controls and line integration. Request a quotation with your product sample, pack dimensions, output target and delivery location. Ask for freight, taxes, installation and optional equipment to be listed separately.`,
  };
}
