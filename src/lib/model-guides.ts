import type { ProductData } from './data';

export const MODEL_GUIDE_TOPICS = ['buying-guide', 'trial-checklist'] as const;
export type ModelGuideTopic = typeof MODEL_GUIDE_TOPICS[number];
type Profile = { family: string; focus: string; questions: string[]; trial: string[] };

// Reviewed model-specific purchasing questions, not promised capabilities.
// New catalogue models need a profile before supporting pages are indexed.
export const MODEL_GUIDE_PROFILES: Record<string, Profile> = {
  'automatic-carton-taping-with-box-strapping': {
    family: 'carton',
    focus: 'Specify taping and strapping as one end-of-line process. Carton flap condition, packed weight and size changes affect both stations; a strong strap does not correct a poorly closed carton.',
    questions: ['Will carton sizes run in batches or arrive mixed?', 'Which tape and PP strap widths are required for each carton?', 'Who supplies transfers, stop signals and accumulation between stations?'],
    trial: ['Run the smallest and largest filled cartons through both stations.', 'Inspect top and bottom tape contact, strap position and corner compression.', 'Introduce a normal downstream stop and confirm controlled restart without carton collisions.'],
  },
  'automatic-turntable-machine': {
    family: 'bottle-handling',
    focus: 'Decide whether the turntable will feed empty bottles or accumulate filled containers. Those jobs create different requirements for bottle stability, guide arrangement and operator access.',
    questions: ['What are the bottle base diameter, height and filled weight?', 'What buffer time is required when the next station stops?', 'Which conveyor height and transfer direction must the table match?'],
    trial: ['Feed the tallest and lightest bottles at the intended line rate.', 'Observe guide transitions and the table exit for tipping or wedging.', 'Pause the downstream station and record the usable accumulation before an operator must intervene.'],
  },
  'automatic-capping-machine': {
    family: 'capping',
    focus: 'Treat the cap, bottle neck and liner as a matched closure system. Adjustable torque alone does not establish that a cap can be fed, seated and tightened consistently.',
    questions: ['What cap drawings, neck finishes and liners will be supplied?', 'How are cap orientation and bottle restraint arranged?', 'What tightening and removal-torque acceptance method is agreed?'],
    trial: ['Run production bottles and caps from representative material batches.', 'Check cap seating, cross-threading and bottle distortion.', 'Record closure checks at start-up and after a planned stop using the agreed torque and leak-test method.'],
  },
  'automatic-bottle-labeling-machine': {
    family: 'labeling',
    focus: 'Select a labeler using both the container geometry and the actual label roll. A round bottle wrap and a shaped bottle front/back application need different positioning checks.',
    questions: ['What are label dimensions, roll direction, core size and gap?', 'Are bottles round, tapered or shaped, and which faces need labels?', 'What label position tolerance and changeover formats are required?'],
    trial: ['Run the actual bottle and label stock after normal filling and handling.', 'Measure label height, skew and overlap against an agreed reference.', 'Change to the second format and record adjustment time and rejected labels before stable output resumes.'],
  },
  'automatic-liquid-filling-line-setup': {
    family: 'liquid-filling',
    focus: 'Buy a balanced filling, capping and labeling line rather than comparing filler speed alone. The slowest station, transfer arrangements and format-change work determine finished-bottle output.',
    questions: ['Which bottle sizes, products and closure formats must the whole line handle?', 'Which station owns line control and fault recovery?', 'Are cleaning, product changeover and utility requirements included in the quotation?'],
    trial: ['Run product through every quoted station and count accepted finished bottles.', 'Record filling, closure and label rejects separately to identify the limiting station.', 'Perform a coordinated stop, restart and bottle-format change with the intended staffing.'],
  },
  'auger-filler-machine': {
    family: 'powder-filling',
    focus: 'Powder behaviour matters as much as nominal fill weight. Bulk density, aeration and flow can change during production, so an auger selection needs the actual material and container.',
    questions: ['What are bulk density, flow behaviour and target net weight?', 'Does the powder bridge, create dust or change with humidity?', 'Which screw, tooling, dust control and cleaning scope are included?'],
    trial: ['Weigh empty containers and record individual net fills with a suitable checked scale.', 'Compare fills at different hopper levels during a continuous run.', 'Inspect dust, bridging, dribble and container-mouth contamination before accepting the dosing arrangement.'],
  },
  '6-head-liquid-filling-machine': {
    family: 'liquid-filling',
    focus: 'Evaluate all six filling heads individually. An acceptable average can hide a consistently high or low nozzle, especially when product temperature or supply conditions change.',
    questions: ['What viscosity, filling temperature and container opening are expected?', 'What per-head fill tolerance and sampling method are required?', 'How are product supply, nozzle shutoff and container indexing configured?'],
    trial: ['Label samples by filling head and measure each head separately.', 'Check foam, drips and fill variation during steady running and restart.', 'Repeat with the smallest and largest requested fills before agreeing on change parts and settings.'],
  },
  'automatic-web-sealer-with-shrink-tunnel-bottles': {
    family: 'shrink',
    focus: 'Start with the bottle bundle pattern and stability at the sealing station. Bottle count, base shape and filled weight influence grouping and tunnel transfer before shrink appearance is assessed.',
    questions: ['Which bottle counts and bundle orientations are required?', 'Will bottles arrive from a line or need separate grouping equipment?', 'What film specification and finished-bundle handling test are required?'],
    trial: ['Run real filled bottles in every requested bundle pattern.', 'Watch grouping and seal formation before the bundle enters the tunnel.', 'Check bottle movement, film punctures and closure condition after cooling and normal handling.'],
  },
  'portable-shrink-tunnel': {
    family: 'shrink',
    focus: 'A movable tunnel still needs a suitable operating position and confirmed utilities. Compare the available passage, conveyor transfer and safe relocation arrangements rather than assuming portability means plug-and-play.',
    questions: ['What maximum pack dimensions and film will be used?', 'Which electrical supply is available at each intended operating position?', 'How will the tunnel be positioned, secured and connected to the sealer?'],
    trial: ['Check the largest pack passes with the supplier-approved clearance.', 'Run film-wrapped samples and inspect underside and corner shrink.', 'Review the documented cooling, isolation and relocation procedure without moving an operating tunnel.'],
  },
  'shrink-tunnel-machine': {
    family: 'shrink',
    focus: 'Match tunnel passage, conveyor support and heat exposure to the wrapped pack. Conveyor speed and heater rating are not a guarantee of acceptable finished packs per minute.',
    questions: ['What is the largest wrapped-pack envelope including loose film?', 'Which film grades and heat-sensitive contents need trials?', 'What upstream sealer output and pack spacing must be supported?'],
    trial: ['Establish settings within supplier guidance using the production film.', 'Change one setting at a time and inspect corners, base and seams.', 'Record accepted packs, rejects and time at sustained loading rather than quoting unloaded conveyor speed.'],
  },
  'l-sealer-with-shrink-tunnel-machine': {
    family: 'shrink',
    focus: 'Check the L-sealing envelope using the product height as well as its footprint. Film allowance and loading access can limit a pack that appears to fit the nominal sealing dimensions.',
    questions: ['What are product length, width, height and sharp-edge conditions?', 'Which centre-fold film width and material are intended?', 'How many operators will load, seal and remove finished packs?'],
    trial: ['Load the tallest and widest products with the intended film allowance.', 'Inspect the L-shaped seam before shrinking and after cooling.', 'Measure good-pack output including manual loading and removal, then repeat the format change.'],
  },
  'sleeve-shrink-wrapping-machine': {
    family: 'shrink',
    focus: 'Define the sleeve as a protective single-pack or multipack wrap and specify the expected open-end finish. Do not assume that a sleeve bundle wrapper also applies printed full-body bottle labels.',
    questions: ['Is the job single-product wrapping or grouped-product bundling?', 'What end opening and film coverage are acceptable?', 'How is the product supported between sleeve sealing and shrinking?'],
    trial: ['Observe the sleeve seam and product support before heating.', 'Check open-end shrink, seam strength and film coverage after cooling.', 'Handle the completed pack as it will be handled in dispatch and record movement or punctures.'],
  },
  'semi-automatic-web-sealer-with-shrink-tunnel': {
    family: 'shrink',
    focus: 'Include the operator in the capacity calculation. Loading a bundle, initiating the seal and clearing the discharge can take longer than the machine cycle shown in a demonstration.',
    questions: ['Who forms and loads each pack or bundle?', 'Which bundle weights and film widths are expected?', 'What working height and discharge space are available?'],
    trial: ['Run with the planned operator count and normal production supply.', 'Separate loading time, sealing time and discharge delays in the trial record.', 'Inspect seal and shrink quality after a pause and film-roll change as well as during steady running.'],
  },
  'pallet-stretch-wrapping': {
    family: 'pallet',
    focus: 'Select the wrapping configuration around the least stable load, not only the heaviest pallet. Rotating a load and rotating a wrapping arm place different demands on the pallet and surrounding floor space.',
    questions: ['What are pallet size, gross weight, height and load stability?', 'Will loading use a forklift or pallet truck?', 'What film specification, top/bottom wraps and containment checks are required?'],
    trial: ['Wrap representative stable and difficult loads using the proposed recipe.', 'Inspect crushed corners, displaced cartons and coverage near the pallet base.', 'Confirm loading clearance and finished-load handling with the customer’s agreed containment assessment.'],
  },
  'double-door-chamber-vacuum-machine-with-conveyor': {
    family: 'vacuum',
    focus: 'Evaluate chamber loading and conveyor transfer as well as evacuation time. A short vacuum cycle does not establish production output when bag arrangement, lid handling and unloading are included.',
    questions: ['What are filled bag dimensions, product temperature and moisture?', 'How many bags fit without contaminating or overlapping seal areas?', 'How do conveyor height, staffing and chamber sequence match the line?'],
    trial: ['Load representative filled bags in the proposed chamber arrangement.', 'Record the full load-to-unload cycle and accepted packs per cycle.', 'Inspect cooled seals and pack condition; validate shelf life separately for the product and storage conditions.'],
  },
  'heavy-duty-roller-conveyor': {
    family: 'conveyor',
    focus: 'Specify how the load contacts the rollers. Gross weight alone is insufficient: pallet feet, carton bases and concentrated contact points determine support needs and transfer behaviour.',
    questions: ['What is the smallest base footprint and largest load weight?', 'Is movement gravity-driven or powered?', 'What roller pitch, transfer height and stopping arrangement are needed?'],
    trial: ['Place the heaviest representative load in its normal orientation.', 'Check the smallest load remains supported across rollers and transfers.', 'Observe stopping, restart and accumulation without allowing uncontrolled rolling.'],
  },
  'flexible-roller-conveyor': {
    family: 'conveyor',
    focus: 'Check performance at the most extended length and tightest intended curve. Support spacing changes as a flexible conveyor opens, which can affect small cartons and uneven-bottom packs.',
    questions: ['What extended length, storage length and curves are needed?', 'What are the smallest carton footprint and base condition?', 'Which floor gradients, height settings and wheel restraints are planned?'],
    trial: ['Run the smallest carton with the conveyor extended to its working length.', 'Test normal curves and height transitions for bridging and tipping.', 'Confirm positioning and restraint before loading, then check controlled flow at the discharge.'],
  },
  'heavy-duty-slat-chain-conveyor': {
    family: 'conveyor',
    focus: 'Describe load distribution and duty cycle before selecting a chain-driven slat conveyor. Repeated starts under load and concentrated contact need explicit engineering review.',
    questions: ['What load is present per unit length and at each contact point?', 'How often must the conveyor start under load?', 'What side guides, transfers and maintenance access are required?'],
    trial: ['Run the representative load distribution rather than one isolated light item.', 'Observe entry and exit transfers for impact and product movement.', 'Check controlled loaded starts and the documented access arrangement for routine maintenance.'],
  },
  'u-type-slat-conveyor': {
    family: 'conveyor',
    focus: 'Confirm what the U-shaped enclosed frame must contain and how material enters and leaves it. Particle size, tendency to bridge and cleaning access should be part of the specification.',
    questions: ['What material size, flow behaviour and feed rate are expected?', 'What inlet, outlet and interface dimensions are available?', 'How will residues be removed without unsafe access to moving parts?'],
    trial: ['Feed representative material at the proposed operating rate.', 'Inspect inlet and outlet for build-up, spillage and interrupted flow.', 'Review isolation and cleaning access with the machine stopped under the approved procedure.'],
  },
  'pvc-belt-conveyor': {
    family: 'conveyor',
    focus: 'Check the actual product base and environment against the proposed PVC belt. A flat belt can support small products, but temperature, residue and transfers still determine suitability.',
    questions: ['What product temperature, oils or cleaning chemicals contact the belt?', 'What belt width and transfer gap fit the smallest product?', 'What speed range and upstream/downstream heights are required?'],
    trial: ['Run the smallest and least stable products over both transfers.', 'Check belt tracking and product slip during a normal start and stop.', 'Review the intended cleaning method and confirm belt compatibility with the supplier.'],
  },
  'modular-belt-conveyor': {
    family: 'conveyor',
    focus: 'Choose the modular belt surface and transfer geometry around the product. Interlocking construction does not by itself establish hygiene suitability, drainage or support for small loose items.',
    questions: ['What belt openings and surface pattern suit the product?', 'What product temperature and cleaning method are expected?', 'How are the smallest products supported at the end transfer?'],
    trial: ['Check the smallest product at belt joints and both transfers.', 'Run representative loading and observe movement on the selected surface.', 'Review access for cleaning and module replacement under the supplier’s isolation procedure.'],
  },
  'horizontal-band-sealer-machine': {
    family: 'band-sealing',
    focus: 'Use the normal horizontal model only after checking that the filled pouch can travel on its side without contaminating the mouth. Upright handling needs should be assessed before selecting orientation.',
    questions: ['Can the filled pouch lie horizontally without leakage or product migration?', 'What pouch length, thickness and fill weight are expected?', 'What sealing width and continuous duty are required?'],
    trial: ['Feed normal filled pouches in the proposed horizontal orientation.', 'Inspect mouth contamination, tracking and support through the sealing bands.', 'Assess cooled seals at sustained loading and compare rejected packs with the agreed criteria.'],
  },
  'horizontal-band-sealer-master-model': {
    family: 'band-sealing',
    focus: 'Request a written comparison between the Master model and the normal horizontal model. The model name alone does not prove a higher load capacity, speed or duty rating.',
    questions: ['Which measurable differences are included in the Master configuration?', 'What filled-pouch weight and supported length must it handle?', 'Which duty cycle, seal width and conveyor adjustments are quoted?'],
    trial: ['Use the heaviest and longest intended pouches during the comparison.', 'Record accepted output with the same material and operators for each proposed model.', 'Check tracking, cooled seal strength and adjustments after sustained operation.'],
  },
  'vertical-band-sealer-machine-indian-model': {
    family: 'band-sealing',
    focus: 'Align the upright pouch mouth with the sealing head while supporting its filled base. Pouch height variation and centre of gravity can matter as much as nominal sealing speed.',
    questions: ['What minimum and maximum filled pouch heights are required?', 'How much clean headspace remains above the product?', 'What conveyor support is needed to keep the pouch upright?'],
    trial: ['Set up the shortest and tallest filled pouches in turn.', 'Watch the mouth enter the bands without folding or spilling contents.', 'Inspect upright stability and cooled seals through stops and restarts.'],
  },
  'automatic-web-sealer-with-shrink-tunnel-box': {
    family: 'shrink',
    focus: 'Assess carton corners, uneven surfaces and pack spacing when specifying an automatic box wrapper. Sharp edges can puncture film even when the initial shrink finish appears acceptable.',
    questions: ['What are the smallest and largest box dimensions and gross weights?', 'Are packs flat, stacked or irregular, and do they have sharp corners?', 'What infeed spacing and tunnel discharge support are required?'],
    trial: ['Run boxes with actual contents and the intended film grade.', 'Inspect sealing, corner coverage and film damage after cooling.', 'Check loaded transfers and normal dispatch handling, then count acceptable finished boxes over a timed run.'],
  },
  'band-sealer-machine': {
    family: 'band-sealing',
    focus: 'Confirm the sealing arrangement and supported pouch before comparing band speed. Seal quality depends on material, contact time, pressure and cooling, not the headline speed alone.',
    questions: ['Which pouch laminates and seal widths need approval?', 'What filled weights and feed orientation are intended?', 'How will output and seal integrity be assessed together?'],
    trial: ['Use the intended pouch laminate and representative fill.', 'Check seals after cooling for continuous bonding and contamination.', 'Measure good pouches per minute with real loading rather than converting belt speed into a theoretical pouch count.'],
  },
  'tube-sealing-machine': {
    family: 'tube-sealing',
    focus: 'Confirm the tube construction and closure method with actual samples. Similar-looking tubes can use different materials, and a clean empty-tube demonstration does not prove filled-tube sealing.',
    questions: ['What tube material, diameter and filled height are required?', 'What seal finish, trim and coding requirements apply?', 'How much product-free space remains at the tube end?'],
    trial: ['Present filled tubes with the intended product and headspace.', 'Check closure appearance and distortion across the tube width.', 'Perform the agreed leak and handling checks after cooling and record rejected closures.'],
  },
  'impulse-sealing-machine': {
    family: 'intermittent-sealing',
    focus: 'Include positioning and cooling time in an intermittent sealing cycle. The time the heater is energised is only one part of the operator’s work with a filled pouch.',
    questions: ['What pouch mouth width and laminate thickness must be sealed?', 'What operator cycle and daily batch size are expected?', 'Which holding, cooling and pack-support arrangement is needed?'],
    trial: ['Seal representative filled pouches using the approved timing procedure.', 'Inspect corners and folds for incomplete bonding after cooling.', 'Time the complete handling cycle and check repeatability through a normal batch.'],
  },
  'dh-sealing-machine': {
    family: 'intermittent-sealing',
    focus: 'Clarify the quoted DH head configuration before selecting the standalone unit. The catalogue name should be supported by confirmed seal dimensions, material compatibility and operating requirements.',
    questions: ['What sealing-head dimensions and control arrangement are quoted?', 'How will the filled bag be supported under the head?', 'What bag materials and shift duty must be demonstrated?'],
    trial: ['Position the filled bag using the intended operator and support.', 'Inspect seal uniformity across the full requested width.', 'Repeat the normal production cycle and record handling delays, alignment problems and rejected seals.'],
  },
  'pneumatic-vertical-sealing-machine-flame-proof': {
    family: 'industrial-sealing',
    focus: 'Treat hazardous-area suitability as a documented engineering requirement. A catalogue description containing “flame proof” is not evidence that the complete machine is approved for a particular site classification.',
    questions: ['What site classification and applicable equipment documentation are required?', 'What compressed-air quality, pressure and connection are available?', 'What bag material, filled height and support arrangement need sealing?'],
    trial: ['Have the site’s responsible engineer review the quoted configuration and relevant documentation before use.', 'Perform material and seal trials in an approved environment using the supplier’s procedure.', 'Record bag support, seal repeatability and control operation without assuming a general-purpose trial validates hazardous-area use.'],
  },
  'mobile-sealer-machine': {
    family: 'intermittent-sealing',
    focus: 'Map where the sealing head must move and how filled bags remain supported. Mobility adds positioning, cable-routing and stability requirements that a fixed station may not have.',
    questions: ['Which bag or liner heights and working positions are required?', 'What floor condition and travel route will the stand use?', 'How will the unit be secured and utilities routed during operation?'],
    trial: ['Position and secure the sealer at each intended working height.', 'Seal representative bags while checking operator reach and pack support.', 'Review the approved isolation and relocation procedure and confirm repeatable alignment after repositioning.'],
  },
};

export const isModelGuideTopic = (value: string): value is ModelGuideTopic =>
  MODEL_GUIDE_TOPICS.some(topic => topic === value);
export const modelGuideHref = (slug: string, topic: ModelGuideTopic) => `/products/${slug}/${topic}`;
export function modelGuideMetadata(product: ProductData, topic: ModelGuideTopic) {
  return topic === 'buying-guide' ? {
    title: `${product.title}: Buying Guide & Quotation Checklist`,
    description: `Buying ${product.title}? Review model selection, quotation questions, configuration choices and delivery planning before requesting a price.`,
    keywords: [`${product.title} buying guide`, `${product.title} price`, `${product.title} quotation`, `${product.title} supplier India`],
  } : {
    title: `${product.title}: Sample Trial & Acceptance Checklist`,
    description: `Plan a ${product.title} sample trial: materials to bring, checks to record, output measurement and acceptance questions before ordering.`,
    keywords: [`${product.title} trial`, `${product.title} demo`, `${product.title} testing checklist`, `${product.title} selection`],
  };
}
