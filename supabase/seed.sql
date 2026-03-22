-- Seed current Spectra Pack website data into Supabase.
-- Run this after supabase/schema.sql
begin;

-- products
insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Shrink Tunnel Machine', 'shrink-tunnel-machine', 'SPST-101', 'Shrink Wrapping Machines', 'Semi-automatic shrink tunnel with integrated cooling section for bottles, cartons, and sleeve-wrapped packs.', 'The SPST-101 shrink tunnel machine in the Spectra Pack catalog is a semi-automatic electric unit with integrated cooling. It is built in mild steel or SS 304 and supports roller rod, mesh, or belt conveyor arrangements for consistent shrink finishing.', '["Integrated cooling section for stable pack finishing","Suitable for sleeve and shrink applications across multiple pack formats","Supports roller rod, mesh, or belt conveyor layouts","Built for continuous industrial use with three-phase operation"]'::jsonb, '{"Model No.":"SPST-101","Automation Grade":"Semi-Auto","Driven Type":"Electric","Material":"Mild Steel / SS 304","Phase":"Three Phase","Heater Configuration":"12-14 heaters","Power Consumption":"9-10 kW","Temperature Range":"0-300 C","Cooling Chamber":"Integrated cooling section","Conveyor System":"Roller rod / mesh / belt conveyors","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/shrink-tunnel-machine.png', 'Shrink Tunnel Machine by Spectra Pack Machines', '["/images/products/shrink-tunnel-machine.png"]'::jsonb, 'Shrink Tunnel Machine | Spectra Pack Machines', 'Semi-automatic shrink tunnel with integrated cooling section for bottles, cartons, and sleeve-wrapped packs.', true, 0)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Automatic Web Sealer with Shrink Tunnel - Bottles', 'automatic-web-sealer-with-shrink-tunnel-bottles', 'SPAWSST-201', 'Shrink Wrapping Machines', 'Automatic bottle wrapping line with sealing and shrink tunnel stages for high-throughput grouped packs.', 'The catalog lists the SPAWSST-201 as an automatic web sealer with shrink tunnel for bottle packs. It is designed around 1 litre bottle applications and is available in 60, 90, 120, and 200 bottle-per-minute variants.', '["Integrated web sealing and shrink tunnel workflow","Configured for grouped bottle packs and bottle bundles","Available in multiple output variants up to 200 bottles per minute","Built in mild steel or stainless steel for industrial packaging lines"]'::jsonb, '{"Model No.":"SPAWSST-201","Capacity":"120 bottles per minute for 1 litre pack","Available Variants":"60 / 90 / 120 / 200 bottles per minute","Voltage":"3 Phase, 440 V","MOC":"Mild Steel / Stainless Steel","Driven Type":"Electric","Frequency":"50 Hz","Size":"18 ft x 4.5 ft x 5.5 ft","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/automatic-web-sealer-with-shrink-tunnel-bottles.png', 'Automatic Web Sealer with Shrink Tunnel - Bottles by Spectra Pack Machines', '["/images/products/automatic-web-sealer-with-shrink-tunnel-bottles.png"]'::jsonb, 'Automatic Web Sealer with Shrink Tunnel - Bottles | Spectra Pack Machines', 'Automatic bottle wrapping line with sealing and shrink tunnel stages for high-throughput grouped packs.', true, 1)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Semi-Automatic Web Sealer with Shrink Tunnel - Bottles', 'semi-automatic-web-sealer-with-shrink-tunnel-bottles', 'SPSAWST-203', 'Shrink Wrapping Machines', 'Semi-automatic bottle shrink wrapping machine for grouped packs where operator-assisted loading is preferred.', 'The SPSAWST-203 is shown in the Spectra Pack catalog as a semi-automatic bottle web sealer with shrink tunnel. It is suited to plants that need grouped bottle wrapping without a fully automatic end-to-end line.', '["Semi-automatic workflow for moderate bottle output requirements","Integrated shrink tunnel for clean bundle wrapping","Useful where operator loading is part of the packaging process","Compact footprint compared with higher-throughput automatic lines"]'::jsonb, '{"Model No.":"SPSAWST-203","Capacity":"30-40 bottles per minute","Voltage":"12 kV","Material":"Mild Steel","Driven Type":"Electric","Frequency":"50 Hz","Size":"12 ft x 5 ft x 5.5 ft","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/semi-automatic-web-sealer-with-shrink-tunnel-bottles.png', 'Semi-Automatic Web Sealer with Shrink Tunnel - Bottles by Spectra Pack Machines', '["/images/products/semi-automatic-web-sealer-with-shrink-tunnel-bottles.png"]'::jsonb, 'Semi-Automatic Web Sealer with Shrink Tunnel - Bottles | Spectra Pack Machines', 'Semi-automatic bottle shrink wrapping machine for grouped packs where operator-assisted loading is preferred.', true, 2)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Automatic Web Sealer with Shrink Tunnel - Box', 'automatic-web-sealer-with-shrink-tunnel-box', 'SPAWST-202', 'Shrink Wrapping Machines', 'Automatic shrink wrapping system for boxes, aata bags, batteries, bearings, and similar rigid packs.', 'The SPAWST-202 automatic web sealer with shrink tunnel is presented in the catalog for box and industrial pack applications. It is built for higher-volume grouped wrapping where cartons or similar rigid products move through a continuous sealing and shrinking process.', '["Automatic sealing and shrinking for box-style products","Suitable for cartons, aata bags, bearings, and battery packs","Continuous production format for dispatch-ready shrink wrapping","Available in mild steel or stainless steel construction"]'::jsonb, '{"Model No.":"SPAWST-202","Capacity":"10-12 boxes per minute","Voltage":"15 kV","MOC":"Mild Steel / Stainless Steel","Driven Type":"Electric","Frequency":"50 Hz","Size":"14 ft x 4.5 ft x 5.5 ft","Applications":"Boxes / aata bags / battery / bearings","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/automatic-web-sealer-with-shrink-tunnel-box.png', 'Automatic Web Sealer with Shrink Tunnel - Box by Spectra Pack Machines', '["/images/products/automatic-web-sealer-with-shrink-tunnel-box.png"]'::jsonb, 'Automatic Web Sealer with Shrink Tunnel - Box | Spectra Pack Machines', 'Automatic shrink wrapping system for boxes, aata bags, batteries, bearings, and similar rigid packs.', true, 3)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Semi-Automatic Web Sealer with Shrink Tunnel - Box', 'semi-automatic-web-sealer-with-shrink-tunnel-box', 'SPSAWST-204', 'Shrink Wrapping Machines', 'Semi-automatic shrink wrapping setup for box and bundle applications with controlled operator handling.', 'The SPSAWST-204 catalog model is a semi-automatic web sealer with shrink tunnel for boxes and grouped industrial products. It is suited to plants that need flexible loading and lower line speeds without giving up a complete wrap-and-shrink process.', '["Semi-automatic operation for flexible box handling","Useful for cartons, aata bags, battery packs, and similar products","Integrated shrink tunnel for finished pack appearance","Built for practical medium-throughput packaging operations"]'::jsonb, '{"Model No.":"SPSAWST-204","Capacity":"5 boxes per minute","Voltage":"10-12 kV","Material":"Mild Steel","Driven Type":"Electric","Frequency":"50 Hz","Size":"12 ft x 5 ft x 5.5 ft","Applications":"Boxes / aata bags / battery / bearings","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/semi-automatic-web-sealer-with-shrink-tunnel-box.png', 'Semi-Automatic Web Sealer with Shrink Tunnel - Box by Spectra Pack Machines', '["/images/products/semi-automatic-web-sealer-with-shrink-tunnel-box.png"]'::jsonb, 'Semi-Automatic Web Sealer with Shrink Tunnel - Box | Spectra Pack Machines', 'Semi-automatic shrink wrapping setup for box and bundle applications with controlled operator handling.', true, 4)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Chamber Shrink Tunnel', 'chamber-shrink-tunnel', 'SPSC-301', 'Shrink Wrapping Machines', 'Manual chamber-style shrink machine for compact retail packs, printed cartons, and short-run jobs.', 'The SPSC-301 chamber shrink tunnel is listed as a manual electric model in the Spectra Pack catalog. It is a compact option for smaller shrink wrapping jobs where clean presentation and simple operator control matter more than very high throughput.', '["Manual operation for flexible short-run packing jobs","Compact chamber format for limited floor space","Suitable for regular retail packs and cartons","Simple load, seal, and shrink workflow"]'::jsonb, '{"Model No.":"SPSC-301","Automation Grade":"Manual","Driven Type":"Electric","Material":"Mild Steel","Machine Format":"Chamber shrink tunnel","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/chamber-shrink-tunnel.png', 'Chamber Shrink Tunnel by Spectra Pack Machines', '["/images/products/chamber-shrink-tunnel.png"]'::jsonb, 'Chamber Shrink Tunnel | Spectra Pack Machines', 'Manual chamber-style shrink machine for compact retail packs, printed cartons, and short-run jobs.', true, 5)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('L-Sealer with Shrink Tunnel Machine - Indian', 'l-sealer-with-shrink-tunnel-machine-indian', 'SPLST-302', 'Shrink Wrapping Machines', 'Semi-automatic L-sealer and shrink tunnel combination for cartons, printed packs, and retail-ready wrapping.', 'The SPLST-302 is shown in the catalog as an Indian L-sealer with shrink tunnel machine. It is a semi-automatic electric system meant for regular-shaped products that need neat edge sealing and a clean final shrink wrap finish.', '["L-sealer format for neat edge sealing","Semi-automatic control for product-by-product handling","Suitable for cartons, boxes, and retail-ready packs","Three-phase build for production use"]'::jsonb, '{"Model No.":"SPLST-302","Automation Grade":"Semi-Auto","Driven Type":"Electric","Material":"Mild Steel","Phase":"Three Phase","Machine Format":"L-sealer with shrink tunnel","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png', 'L-Sealer with Shrink Tunnel Machine - Indian by Spectra Pack Machines', '["/images/products/l-sealer-with-shrink-tunnel-machine-indian.png"]'::jsonb, 'L-Sealer with Shrink Tunnel Machine - Indian | Spectra Pack Machines', 'Semi-automatic L-sealer and shrink tunnel combination for cartons, printed packs, and retail-ready wrapping.', true, 6)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Fully Automatic L-Sealer with Shrink Tunnel Machine', 'fully-automatic-l-sealer-with-shrink-tunnel-machine', 'SPALST-303', 'Shrink Wrapping Machines', 'Automatic L-sealer and tunnel line for regular-shaped products needing continuous shrink wrapping.', 'The SPALST-303 fully automatic L-sealer with shrink tunnel is cataloged for higher-throughput shrink wrapping. It reduces operator handling and is intended for regular production environments where repeatable sealing and shrink results are required.', '["Fully automatic seal-and-shrink cycle","Well suited to regular-shaped products and cartons","Supports continuous production with reduced manual intervention","Three-phase electric build for industrial operation"]'::jsonb, '{"Model No.":"SPALST-303","Automation Grade":"Automatic","Driven Type":"Electric","Material":"Mild Steel","Phase":"Three Phase","Machine Format":"Fully automatic L-sealer with shrink tunnel","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/fully-automatic-l-sealer-with-shrink-tunnel-machine.png', 'Fully Automatic L-Sealer with Shrink Tunnel Machine by Spectra Pack Machines', '["/images/products/fully-automatic-l-sealer-with-shrink-tunnel-machine.png"]'::jsonb, 'Fully Automatic L-Sealer with Shrink Tunnel Machine | Spectra Pack Machines', 'Automatic L-sealer and tunnel line for regular-shaped products needing continuous shrink wrapping.', true, 7)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Portable Shrink Tunnel', 'portable-shrink-tunnel', 'SPST-102', 'Shrink Wrapping Machines', 'Portable shrink tunnel for water bottle packing and flexible line-side shrink operations.', 'The SPST-102 portable shrink tunnel is shown in the catalog as a semi-auto electric machine for water bottle packing. Its portable format makes it useful where the shrink unit needs to be moved between packaging points or used in compact layouts.', '["Portable tunnel layout for flexible deployment","Semi-automatic operation for practical shop-floor use","Three-phase electric build for bottle shrink work","Useful for compact layouts and line-side shrink support"]'::jsonb, '{"Model No.":"SPST-102","Automation Grade":"Semi-Auto","Driven Type":"Electric","Material":"Mild Steel","Phase":"Three Phase","Usage / Application":"Water bottle packing","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/portable-shrink-tunnel.png', 'Portable Shrink Tunnel by Spectra Pack Machines', '["/images/products/portable-shrink-tunnel.png"]'::jsonb, 'Portable Shrink Tunnel | Spectra Pack Machines', 'Portable shrink tunnel for water bottle packing and flexible line-side shrink operations.', true, 8)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Sleeve Shrink Wrapping Machine', 'sleeve-shrink-wrapping-machine', 'SPAST-601', 'Shrink Wrapping Machines', 'Automatic sleeve shrink wrapping machine for water bottle bundles and grouped container packs.', 'The SPAST-601 sleeve shrink wrapping machine is listed in the Spectra Pack catalog for water bottle packing applications. It is designed for grouped container wrapping where a clean sleeve pack and automatic operation are required.', '["Automatic sleeve shrink process for grouped containers","Built for water bottle packing applications","Three-phase electric machine format","Made for bottle bundle wrapping lines"]'::jsonb, '{"Model No.":"SPAST-601","Automation Grade":"Automatic","Driven Type":"Electric","Material":"Mild Steel","Phase":"Three Phase","Usage / Application":"Water bottle packing","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/sleeve-shrink-wrapping-machine.png', 'Sleeve Shrink Wrapping Machine by Spectra Pack Machines', '["/images/products/sleeve-shrink-wrapping-machine.png"]'::jsonb, 'Sleeve Shrink Wrapping Machine | Spectra Pack Machines', 'Automatic sleeve shrink wrapping machine for water bottle bundles and grouped container packs.', true, 9)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Band Sealer Machine', 'band-sealer-machine', 'SPVBS-S401', 'Sealing Machines', 'Continuous band sealer for pouch and bag sealing with selectable sealing widths and forced-air cooling.', 'The SPVBS-S401 band sealer machine is listed in the Spectra Pack catalog as a continuous sealing system for pouch lines. It supports multiple sealing widths, forced-air cooling, and a conveyor-based workflow for steady production output.', '["Continuous sealing format for pouches and bags","Available sealing width options from 6 to 12 mm","Forced-air cooling for stable seal quality","Conveyor-supported operation for production use"]'::jsonb, '{"Model No.":"SPVBS-S401","Sealing Width":"6 / 8 / 10 / 12 mm","Sealing Speed":"100 m/min","Heater":"500 W x 2 - 115 V","Cooling":"Forced air cooling","Power Consumption":"3 phase 400 V, 1.5 kW","Conveyor Size":"Width 200 mm, Length 1570 mm","Dimensions":"Length 1570 mm, Width 620 mm","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/band-sealer-machine.png', 'Band Sealer Machine by Spectra Pack Machines', '["/images/products/band-sealer-machine.png"]'::jsonb, 'Band Sealer Machine | Spectra Pack Machines', 'Continuous band sealer for pouch and bag sealing with selectable sealing widths and forced-air cooling.', true, 10)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Tube Sealing Machine', 'tube-sealing-machine', 'SPTS', 'Sealing Machines', 'Pedestal-mounted tube sealing machine for tube-packed creams, gels, pastes, and similar products.', 'The Spectra Pack catalog lists the SPTS tube sealing machine in its sealing equipment range. It is intended for tube-closing operations where a compact dedicated sealing station is required on the production floor.', '["Dedicated tube sealing station for tube-packed products","Compact pedestal-mounted format for line-side use","Suited to consistent end-sealing on repeat jobs","Useful for cosmetic, personal care, and paste tube applications"]'::jsonb, '{"Model No.":"SPTS","Machine Type":"Tube Sealing Machine","Mounting":"Pedestal stand","Application":"Tube-packed products","Catalog Section":"Sealing Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/tube-sealing-machine.png', 'Tube Sealing Machine by Spectra Pack Machines', '["/images/products/tube-sealing-machine.png"]'::jsonb, 'Tube Sealing Machine | Spectra Pack Machines', 'Pedestal-mounted tube sealing machine for tube-packed creams, gels, pastes, and similar products.', true, 11)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Impulse Sealing Machine', 'impulse-sealing-machine', 'SPFIS', 'Sealing Machines', 'Compact impulse sealing machine for intermittent pouch sealing where quick manual control is required.', 'Model SPFIS is shown in the Spectra Pack catalog as an impulse sealing machine. It is suited to pouch sealing jobs where controlled intermittent sealing is preferred over a continuous band system.', '["Impulse sealing format for controlled heat application","Compact freestanding layout for packing counters and line support","Useful for low-to-medium volume pouch sealing","Designed for repeatable manual sealing tasks"]'::jsonb, '{"Model No.":"SPFIS","Machine Type":"Impulse Sealing Machine","Mounting":"Pedestal stand","Application":"Intermittent pouch sealing","Catalog Section":"Sealing Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/impulse-sealing-machine.png', 'Impulse Sealing Machine by Spectra Pack Machines', '["/images/products/impulse-sealing-machine.png"]'::jsonb, 'Impulse Sealing Machine | Spectra Pack Machines', 'Compact impulse sealing machine for intermittent pouch sealing where quick manual control is required.', true, 12)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('DH Sealing Machine', 'dh-sealing-machine', 'SPDHFS', 'Sealing Machines', 'DH sealing machine for pouch and bag sealing where a stable standalone sealing head is preferred.', 'The SPDHFS model appears in the Spectra Pack catalog under the sealing machine range. It is a dedicated standing sealing station suited to plants that need reliable manual bag sealing with a fixed working height.', '["Standalone sealing station for bag and pouch packing","Stable work height for repetitive sealing jobs","Compact layout for line-side or dispatch use","Suitable for manual sealing tasks that need better operator control"]'::jsonb, '{"Model No.":"SPDHFS","Machine Type":"DH Sealing Machine","Mounting":"Pedestal stand","Application":"Bag and pouch sealing","Catalog Section":"Sealing Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/dh-sealing-machine.png', 'DH Sealing Machine by Spectra Pack Machines', '["/images/products/dh-sealing-machine.png"]'::jsonb, 'DH Sealing Machine | Spectra Pack Machines', 'DH sealing machine for pouch and bag sealing where a stable standalone sealing head is preferred.', true, 13)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Mini Horizontal Band Sealer', 'mini-horizontal-band-sealer', 'SPHBS-S402', 'Sealing Machines', 'Compact horizontal continuous band sealer for smaller pouches and line-side sealing jobs.', 'The SPHBS-S402 mini horizontal band sealer is part of the Spectra Pack band sealer range. It offers a compact horizontal sealing format for pouch applications that need continuous sealing in a smaller machine footprint.', '["Compact horizontal continuous sealing format","Suitable for smaller pouch sizes and lighter packs","Useful where floor space is limited","Part of the Spectra Pack continuous band sealer range"]'::jsonb, '{"Model No.":"SPHBS-S402","Machine Type":"Mini Horizontal Band Sealer","Orientation":"Horizontal","Sealing Width":"6 / 8 / 10 / 12 mm","Sealing Speed":"Up to 100 m/min","Cooling":"Forced air cooling","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/mini-horizontal-band-sealer.png', 'Mini Horizontal Band Sealer by Spectra Pack Machines', '["/images/products/mini-horizontal-band-sealer.png"]'::jsonb, 'Mini Horizontal Band Sealer | Spectra Pack Machines', 'Compact horizontal continuous band sealer for smaller pouches and line-side sealing jobs.', true, 14)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Master Horizontal Band Sealer', 'master-horizontal-band-sealer', 'SPHBS-M403', 'Sealing Machines', 'Horizontal master band sealer for continuous pouch sealing on medium-duty packaging lines.', 'The SPHBS-M403 master horizontal band sealer is shown in the catalog as part of the Spectra Pack continuous sealing range. It is built for steady pouch sealing where a horizontal feed format is preferred.', '["Continuous sealing for repeat pouch output","Horizontal feed format for flat or supported packs","Useful for medium-duty packaging line integration","Designed for reliable production sealing"]'::jsonb, '{"Model No.":"SPHBS-M403","Machine Type":"Master Horizontal Band Sealer","Orientation":"Horizontal","Sealing Width":"6 / 8 / 10 / 12 mm","Sealing Speed":"Up to 100 m/min","Cooling":"Forced air cooling","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/master-horizontal-band-sealer.png', 'Master Horizontal Band Sealer by Spectra Pack Machines', '["/images/products/master-horizontal-band-sealer.png"]'::jsonb, 'Master Horizontal Band Sealer | Spectra Pack Machines', 'Horizontal master band sealer for continuous pouch sealing on medium-duty packaging lines.', true, 15)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Master Vertical Band Sealer', 'master-vertical-band-sealer', 'SPVBS-M404', 'Sealing Machines', 'Vertical continuous band sealer for taller pouches and bag formats requiring upright handling.', 'The SPVBS-M404 master vertical band sealer appears in the Spectra Pack catalog as a vertical continuous sealing machine. It is suited to pouch formats that are easier to seal upright, including filled bags and heavier packs.', '["Vertical pouch handling for filled bag applications","Continuous sealing for steady production flow","Useful where upright pack stability matters","Industrial frame suited to shop-floor sealing work"]'::jsonb, '{"Model No.":"SPVBS-M404","Machine Type":"Master Vertical Band Sealer","Orientation":"Vertical","Sealing Width":"6 / 8 / 10 / 12 mm","Sealing Speed":"Up to 100 m/min","Cooling":"Forced air cooling","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/master-vertical-band-sealer.png', 'Master Vertical Band Sealer by Spectra Pack Machines', '["/images/products/master-vertical-band-sealer.png"]'::jsonb, 'Master Vertical Band Sealer | Spectra Pack Machines', 'Vertical continuous band sealer for taller pouches and bag formats requiring upright handling.', true, 16)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Pneumatic Vertical Sealing Machine - Flame Proof', 'pneumatic-vertical-sealing-machine-flame-proof', 'SPPFS', 'Sealing Machines', 'Flame-proof pneumatic vertical sealer for industrial bag sealing where controlled pressure is required.', 'The SPPFS pneumatic vertical sealing machine is listed in the Spectra Pack catalog in a flame-proof configuration. It is intended for industrial bag sealing tasks that need a vertical format and pneumatic sealing pressure.', '["Pneumatic sealing action for repeatable pressure","Vertical sealing format for larger bags and liners","Flame-proof configuration for sensitive operating environments","Industrial structure for heavier sealing duty"]'::jsonb, '{"Model No.":"SPPFS","Machine Type":"Pneumatic Vertical Sealing Machine","Operation":"Pneumatic","Orientation":"Vertical","Safety Format":"Flame proof","Application":"Industrial bag sealing","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/pneumatic-vertical-sealing-machine-flame-proof.png', 'Pneumatic Vertical Sealing Machine - Flame Proof by Spectra Pack Machines', '["/images/products/pneumatic-vertical-sealing-machine-flame-proof.png"]'::jsonb, 'Pneumatic Vertical Sealing Machine - Flame Proof | Spectra Pack Machines', 'Flame-proof pneumatic vertical sealer for industrial bag sealing where controlled pressure is required.', true, 17)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Mobile Sealer Machine', 'mobile-sealer-machine', 'SPMS', 'Sealing Machines', 'Mobile sealing machine for on-site bag sealing where the sealing head needs to move around the shop floor.', 'The SPMS mobile sealer machine is shown in the Spectra Pack catalog as part of the sealing machine range. Its movable stand and adjustable head make it useful for larger bags or sealing jobs that are easier to handle in place.', '["Mobile stand for flexible shop-floor positioning","Useful for larger bags and awkward pack sizes","Good fit for on-site sealing instead of fixed workstation sealing","Simple industrial layout for practical daily use"]'::jsonb, '{"Model No.":"SPMS","Machine Type":"Mobile Sealer Machine","Mounting":"Mobile pedestal stand","Application":"Bag and liner sealing","Catalog Section":"Sealing Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/mobile-sealer-machine.png', 'Mobile Sealer Machine by Spectra Pack Machines', '["/images/products/mobile-sealer-machine.png"]'::jsonb, 'Mobile Sealer Machine | Spectra Pack Machines', 'Mobile sealing machine for on-site bag sealing where the sealing head needs to move around the shop floor.', true, 18)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Heavy Duty Table Top Vacuum Packaging Machines', 'heavy-duty-table-top-vacuum-packaging-machines', 'SPVP-501 / SPVP-502 / SPVP-503 / SPVP-504 / SPVP-505 / SPVP-506', 'Vacuum Packaging Machines', 'Table top vacuum packaging machine range for food, industrial components, and shelf-life-focused pouch packing.', 'The Spectra Pack catalog presents a heavy duty table top vacuum packaging machine range covering models SPVP-501 through SPVP-506. These chamber-style systems are meant for vacuum sealing jobs where compact installation and dependable vacuum packing are important.', '["Table top chamber vacuum format for compact installation","Multiple model options within the SPVP range","Useful for food, industrial, and retail pouch packing","Designed for cleaner packs, better protection, and shelf-life support"]'::jsonb, '{"Model Range":"SPVP-501 / 502 / 503 / 504 / 505 / 506","Machine Type":"Heavy duty table top vacuum packaging machines","Format":"Table top chamber vacuum system","Application":"Vacuum pouch packing","Catalog Section":"Vacuum Packaging Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/heavy-duty-table-top-vacuum-packaging-machines.png', 'Heavy Duty Table Top Vacuum Packaging Machines by Spectra Pack Machines', '["/images/products/heavy-duty-table-top-vacuum-packaging-machines.png"]'::jsonb, 'Heavy Duty Table Top Vacuum Packaging Machines | Spectra Pack Machines', 'Table top vacuum packaging machine range for food, industrial components, and shelf-life-focused pouch packing.', true, 19)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Double Door Chamber Vacuum Machine with Conveyor', 'double-door-chamber-vacuum-machine-with-conveyor', 'SPCVP-506', 'Vacuum Packaging Machines', 'Conveyor-supported double door chamber vacuum machine for larger or repeat-cycle vacuum packaging work.', 'The SPCVP-506 double door chamber vacuum machine with conveyor is shown in the Spectra Pack catalog for higher-duty vacuum packaging. Its conveyor-assisted layout is suited to repeat-cycle packing lines where larger packs or heavier product movement need more support.', '["Double door chamber format for higher-duty vacuum packing","Integrated conveyor support for product movement","Useful for repeat-cycle or bulk vacuum jobs","Designed for production environments needing stable pack handling"]'::jsonb, '{"Model No.":"SPCVP-506","Machine Type":"Double door chamber vacuum machine with conveyor","Format":"Double chamber / conveyor supported","Application":"Higher-duty vacuum pouch packing","Catalog Section":"Vacuum Packaging Machines","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/double-door-chamber-vacuum-machine-with-conveyor.png', 'Double Door Chamber Vacuum Machine with Conveyor by Spectra Pack Machines', '["/images/products/double-door-chamber-vacuum-machine-with-conveyor.png"]'::jsonb, 'Double Door Chamber Vacuum Machine with Conveyor | Spectra Pack Machines', 'Conveyor-supported double door chamber vacuum machine for larger or repeat-cycle vacuum packaging work.', true, 20)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Modular Belt Conveyor', 'modular-belt-conveyor', 'Catalog Range', 'Conveyor Systems', 'Modular belt conveyor for continuous product transfer between processing, packing, and dispatch stations.', 'The modular belt conveyor is part of the Spectra Pack conveyor range shown in the catalog. It is suited to production lines that need stable product movement, easy maintenance access, and practical line integration.', '["Modular belt surface for stable product movement","Useful between filling, sealing, and dispatch stages","Industrial frame for production floor use","Catalog-listed as part of the Spectra Pack conveyor range"]'::jsonb, '{"Machine Type":"Modular Belt Conveyor","Layout":"Straight modular belt transfer","Application":"Continuous product movement","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/modular-belt-conveyor.png', 'Modular Belt Conveyor by Spectra Pack Machines', '["/images/products/modular-belt-conveyor.png"]'::jsonb, 'Modular Belt Conveyor | Spectra Pack Machines', 'Modular belt conveyor for continuous product transfer between processing, packing, and dispatch stations.', true, 21)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('PVC Belt Conveyor', 'pvc-belt-conveyor', 'Catalog Range', 'Conveyor Systems', 'PVC belt conveyor for straight product transfer across packaging and material handling lines.', 'The PVC belt conveyor is listed in the Spectra Pack catalog as part of the conveyor product range. It is intended for controlled straight-line movement of products through packaging, inspection, or dispatch areas.', '["PVC belt surface for straight product transfer","Suitable for packaging and line balancing applications","Supports consistent movement between workstations","Practical fit for general manufacturing environments"]'::jsonb, '{"Machine Type":"PVC Belt Conveyor","Layout":"Straight belt transfer","Application":"Packaging and material movement lines","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/pvc-belt-conveyor.png', 'PVC Belt Conveyor by Spectra Pack Machines', '["/images/products/pvc-belt-conveyor.png"]'::jsonb, 'PVC Belt Conveyor | Spectra Pack Machines', 'PVC belt conveyor for straight product transfer across packaging and material handling lines.', true, 22)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('U Type Slate Conveyor', 'u-type-slate-conveyor', 'Catalog Range', 'Conveyor Systems', 'Curved U type slate conveyor for guided product flow around turns and constrained layouts.', 'The U type slate conveyor shown in the Spectra Pack catalog is meant for layouts where the product path needs to turn while staying guided and stable. It is a practical solution for packaging lines with constrained floor plans or directional flow requirements.', '["Curved slate format for directional product movement","Useful where line layouts need guided turns","Supports stable transfer of regular packaged products","Industrial structure built for factory handling"]'::jsonb, '{"Machine Type":"U Type Slate Conveyor","Layout":"Curved slate conveyor","Application":"Directional transfer in constrained layouts","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/u-type-slate-conveyor.png', 'U Type Slate Conveyor by Spectra Pack Machines', '["/images/products/u-type-slate-conveyor.png"]'::jsonb, 'U Type Slate Conveyor | Spectra Pack Machines', 'Curved U type slate conveyor for guided product flow around turns and constrained layouts.', true, 23)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Heavy Duty Slate Chain Conveyor', 'heavy-duty-slate-chain-conveyor', 'Catalog Range', 'Conveyor Systems', 'Heavy duty slate chain conveyor for rugged product transfer and industrial line support.', 'The heavy duty slate chain conveyor appears in the Spectra Pack catalog for more demanding material movement duties. It is suited to industrial lines that need stronger conveying surfaces and dependable product handling.', '["Heavy duty chain-driven conveying format","Suitable for rugged industrial handling","Built for steady movement of heavier or tougher products","Useful on packaging, inspection, and dispatch lines"]'::jsonb, '{"Machine Type":"Heavy Duty Slate Chain Conveyor","Layout":"Straight slate chain transfer","Application":"Heavy-duty industrial product movement","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/heavy-duty-slate-chain-conveyor.png', 'Heavy Duty Slate Chain Conveyor by Spectra Pack Machines', '["/images/products/heavy-duty-slate-chain-conveyor.png"]'::jsonb, 'Heavy Duty Slate Chain Conveyor | Spectra Pack Machines', 'Heavy duty slate chain conveyor for rugged product transfer and industrial line support.', true, 24)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Flexible Roller Conveyor', 'flexible-roller-conveyor', 'Catalog Range', 'Conveyor Systems', 'Flexible roller conveyor for adjustable carton transfer, staging, and dispatch movement.', 'The flexible roller conveyor is shown in the Spectra Pack catalog as an extendable transfer solution. It is a useful option for staging, loading, and dispatch areas where the conveyor path needs to be adjusted to the available space.', '["Flexible layout for adjustable transfer paths","Useful in loading, unloading, and staging areas","Well suited to carton and box movement","Helps adapt material flow to changing floor layouts"]'::jsonb, '{"Machine Type":"Flexible Roller Conveyor","Layout":"Adjustable roller transfer","Application":"Dispatch and staging movement","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/flexible-roller-conveyor.png', 'Flexible Roller Conveyor by Spectra Pack Machines', '["/images/products/flexible-roller-conveyor.png"]'::jsonb, 'Flexible Roller Conveyor | Spectra Pack Machines', 'Flexible roller conveyor for adjustable carton transfer, staging, and dispatch movement.', true, 25)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Heavy Duty Roller Conveyor', 'heavy-duty-roller-conveyor', 'Catalog Range', 'Conveyor Systems', 'Heavy duty roller conveyor for industrial cartons, components, and dispatch-ready packs.', 'The heavy duty roller conveyor appears in the Spectra Pack catalog as part of the material movement range. It is intended for plants that need reliable roller-based transfer for boxes, components, or heavier packaged goods.', '["Roller conveying format for cartons and rigid packs","Heavy-duty build for industrial handling","Useful in production, staging, and dispatch zones","Supports consistent straight-line product movement"]'::jsonb, '{"Machine Type":"Heavy Duty Roller Conveyor","Layout":"Straight roller transfer","Application":"Industrial cartons and component handling","Catalog Section":"Conveyor Systems","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/heavy-duty-roller-conveyor.png', 'Heavy Duty Roller Conveyor by Spectra Pack Machines', '["/images/products/heavy-duty-roller-conveyor.png"]'::jsonb, 'Heavy Duty Roller Conveyor | Spectra Pack Machines', 'Heavy duty roller conveyor for industrial cartons, components, and dispatch-ready packs.', true, 26)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.products (title, slug, model_no, category, short_desc, description, features, specs, faqs, image, image_alt, gallery, seo_title, seo_desc, published, sort_order)
values ('Pallet Stretch Wrap Machine', 'pallet-stretch-wrap-machine', 'SPPSW', 'End-of-Line Packaging', 'Semi-automatic pallet stretch wrapping machine for load stabilization before dispatch and storage.', 'The SPPSW pallet stretch wrap machine is listed in the Spectra Pack catalog for end-of-line load wrapping. It is meant for stabilizing palletized goods before dispatch, handling, or warehousing.', '["Semi-automatic pallet load wrapping format","Useful for dispatch and warehouse load stabilization","Frequency speed control based system","Built to improve pack containment and handling confidence"]'::jsonb, '{"Model No.":"SPPSW","Color":"Green","Material":"Stainless Steel","Computerized":"Yes","Automatic Grade":"Semi-Automatic","Control System":"Frequency speed control","Selection Mode":"Automatic","Weight":"250 kg","Brand":"Spectra Pack Machines","Origin":"Made in India"}'::jsonb, '[{"q":"Can this machine be matched to my product and pack size?","a":"Yes. Spectra Pack reviews the product size, pack style, output target, and available floor space before recommending the right machine configuration."},{"q":"Do you support installation and after-sales service?","a":"Yes. Spectra Pack supports machine installation, commissioning, operator handover, and post-dispatch technical coordination."}]'::jsonb, '/images/products/pallet-stretch-wrap-machine.png', 'Pallet Stretch Wrap Machine by Spectra Pack Machines', '["/images/products/pallet-stretch-wrap-machine.png"]'::jsonb, 'Pallet Stretch Wrap Machine | Spectra Pack Machines', 'Semi-automatic pallet stretch wrapping machine for load stabilization before dispatch and storage.', true, 27)
on conflict (slug) do update set
  title = excluded.title,
  model_no = excluded.model_no,
  category = excluded.category,
  short_desc = excluded.short_desc,
  description = excluded.description,
  features = excluded.features,
  specs = excluded.specs,
  faqs = excluded.faqs,
  image = excluded.image,
  image_alt = excluded.image_alt,
  gallery = excluded.gallery,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- product categories
insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('Shrink Wrapping Machines', 'shrink-wrapping-machines', 'L-sealers, web sealers, chamber units, and shrink tunnels for retail, cartons, and grouped packs.', 'Shrink Build', '/images/products/l-sealer-with-shrink-tunnel-machine-indian.png', true, 0)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('Sealing Machines', 'sealing-machines', 'Band sealers and industrial sealing formats for pouches, bags, and continuous packaging lines.', 'Seal Range', '/images/products/band-sealer-machine.png', true, 1)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('Pallet Stretch Wrapping Machines', 'pallet-stretch-wrapping-machines', 'Turntable pallet stretch wrapping machines for stable dispatch loads and warehouse movement.', 'Dispatch Wrap', '/images/products/pallet-stretch-wrap-machine.png', true, 2)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('Vacuum Packaging Machines', 'vacuum-packaging-machines', 'Vacuum packing systems for food, pharma, and shelf-life-driven packaging applications.', 'Vacuum Range', '/images/products/heavy-duty-table-top-vacuum-packaging-machines.png', true, 3)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('Conveyor Systems', 'conveyor-systems', 'PVC, modular, roller, and chain conveyors built for steady product flow and line integration.', 'Flow Systems', '/images/products/pvc-belt-conveyor.png', true, 4)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.product_categories (name, slug, description, accent, image, published, sort_order)
values ('End-of-Line Packaging', 'end-of-line-packaging', 'End-of-line packaging support for pallet handling, stabilization, and dispatch-ready output.', 'Line Finish', '/images/products/pallet-stretch-wrap-machine.png', true, 5)
on conflict (slug) do update set
  name = excluded.name,
  description = excluded.description,
  accent = excluded.accent,
  image = excluded.image,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- services
insert into public.services (title, slug, description, content, icon, published, sort_order)
values ('Machine Manufacturing', 'manufacturing', 'Packaging machines built in India for bottle, box, pouch, vacuum, and conveyor applications.', 'We manufacture shrink wrapping machines, sealing machines, vacuum packaging machines, conveyor systems, and end-of-line packaging equipment from our Vasai-Palghar setup. Every machine is matched to the intended product flow and packaging format.', 'factory', true, 0)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  icon = excluded.icon,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (title, slug, description, content, icon, published, sort_order)
values ('Machine Selection & Line Consultation', 'consultation', 'Application-based guidance to match the right machine format to your production requirement.', 'If you are comparing bottle wrapping, pouch sealing, vacuum packaging, or conveyor movement options, our team helps shortlist the right machine based on output, pack style, available space, and operating preference.', 'pencil-ruler', true, 1)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  icon = excluded.icon,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (title, slug, description, content, icon, published, sort_order)
values ('Custom Machine Design', 'custom-design', 'Machine configurations adapted to your product size, pack count, and line layout.', 'Many packaging lines need modifications in conveyor width, machine dimensions, sealing format, or loading method. We support application-specific customization so the machine fits the actual job instead of forcing your production around a standard frame.', 'pencil-ruler', true, 2)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  icon = excluded.icon,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (title, slug, description, content, icon, published, sort_order)
values ('Installation & Commissioning', 'installation', 'On-site setup, trial support, and operator handover for new machine installations.', 'We assist with machine installation, commissioning, and initial trial runs so your team can move from delivery to production with less friction. This includes practical guidance on use, adjustments, and routine operating checks.', 'wrench', true, 3)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  icon = excluded.icon,
  published = excluded.published,
  sort_order = excluded.sort_order;

insert into public.services (title, slug, description, content, icon, published, sort_order)
values ('After-Sales Support & Spares', 'after-sales', 'Ongoing technical support, service coordination, and spare-part assistance after dispatch.', 'Support does not stop at machine delivery. We help with troubleshooting, consumable or spare requirements, and service coordination so your packaging operation keeps moving with minimal downtime.', 'headphones', true, 4)
on conflict (slug) do update set
  title = excluded.title,
  description = excluded.description,
  content = excluded.content,
  icon = excluded.icon,
  published = excluded.published,
  sort_order = excluded.sort_order;

-- blogs
insert into public.blogs (title, slug, excerpt, content, image, seo_title, seo_desc, published)
values ('How to Choose the Right Packaging Machine for Your Business', 'choose-right-packaging-machine', 'A comprehensive guide to help you select the perfect packaging machine based on your product type, volume, and budget.', 'Choosing the right packaging machine is critical for your production efficiency. Consider factors like product type (solid, liquid, powder), production volume, packaging material, and your budget. Our team at Spectra Pack Machines can help you evaluate your needs and recommend the best solution.', '/images/brand/spectra-pack-logo.png', 'How to Choose the Right Packaging Machine | Spectra Pack Machines', 'Learn how to select the perfect packaging machine for your business needs.', true)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image = excluded.image,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published;

insert into public.blogs (title, slug, excerpt, content, image, seo_title, seo_desc, published)
values ('The Benefits of Shrink Wrapping for Product Packaging', 'benefits-shrink-wrapping', 'Discover why shrink wrapping is one of the most popular and versatile packaging methods in modern industry.', 'Shrink wrapping offers numerous benefits: tamper evidence, product protection, cost-effectiveness, and professional appearance. Whether you are packaging food items, cosmetics, or industrial products, shrink wrapping provides a reliable and attractive packaging solution.', '/images/brand/spectra-pack-logo.png', 'Benefits of Shrink Wrapping | Spectra Pack Machines', 'Explore the advantages of shrink wrapping for your product packaging needs.', true)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image = excluded.image,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published;

insert into public.blogs (title, slug, excerpt, content, image, seo_title, seo_desc, published)
values ('Understanding Different Types of Sealing Machines', 'types-of-sealing-machines', 'A detailed overview of band sealers, impulse sealers, and continuous sealers to help you make an informed decision.', 'Sealing machines come in various types, each suited for different applications. Band sealers are great for continuous operations, impulse sealers for intermittent use, and vacuum sealers for extending shelf life. Learn which type best suits your packaging requirements.', '/images/brand/spectra-pack-logo.png', 'Types of Sealing Machines Explained | Spectra Pack Machines', 'Understand the differences between band sealers, impulse sealers, and more.', true)
on conflict (slug) do update set
  title = excluded.title,
  excerpt = excluded.excerpt,
  content = excluded.content,
  image = excluded.image,
  seo_title = excluded.seo_title,
  seo_desc = excluded.seo_desc,
  published = excluded.published;

-- site settings
insert into public.site_settings (key, value, label, description)
values ('catalog_path', '/catalog/spectra-pack-machines-catalog.pdf', 'Catalog PDF', 'Public PDF path or full URL used for Download Catalog links.')
on conflict (key) do update set
  value = excluded.value,
  label = excluded.label,
  description = excluded.description;

commit;
