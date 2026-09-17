-- 30 complete illustrated machine articles, SEO metadata and relationships.
-- Run in the Supabase SQL editor after existing application tables exist.
-- Transactional and rerunnable. The 30 managed slugs are synchronized to this
-- version so image, SEO and relationship updates apply on repeat deployments.
-- Image files are shipped with the website under /images; deploy them with code.
BEGIN;

ALTER TABLE public.blogs
  ADD COLUMN IF NOT EXISTS seo_keywords text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS product_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS service_slugs text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS related_blog_slugs text[] NOT NULL DEFAULT '{}';

WITH articles AS (
  SELECT * FROM jsonb_to_recordset($machine_blogs$
[
  {
    "slug": "shrink-tunnel-machine-sizing-and-price-guide",
    "title": "Shrink Tunnel Machine: Sizing and Quotation Guide",
    "excerpt": "Compare tunnel opening, film compatibility, usable conveyor space and quotation scope before buying a shrink tunnel for your packaging line.",
    "content": "{\"body\":\"A shrink tunnel quotation is useful only when it describes the packs you intend to run. Two machines with similar external dimensions can offer different usable openings, conveyors and heating arrangements. Begin with the pack requirement, then compare equipment against the same acceptance trial.\\n\\nHow do you choose the tunnel size?\\nMeasure the complete wrapped pack at its widest, tallest and longest points. Include trays, projections and loose film. Send the range of sizes to the supplier and ask for the working clearance needed around the pack. Do not choose an opening that merely matches the product dimensions; airflow and transfer clearance also need consideration.\\nCompare the [shrink tunnel machine](/products/shrink-tunnel-machine) with a [portable shrink tunnel](/products/portable-shrink-tunnel) using actual pack weight and stability. Confirm the conveyor surface, loading height and support at the entry and exit. An unsupported transfer can damage a pack even when it fits inside the tunnel.\\n\\nWhat changes the quoted price?\\nUsable opening, heating arrangement, conveyor design, controls and line interfaces change the supply scope. Request the installed electrical load and site connection requirements for the proposed model. Installed load is not a promise of average electricity consumption; ask how consumption will be measured during a representative run.\\nRecord which sealing equipment, stands, cooling section and integration work are included. Compare freight, installation and training as separate scope items where appropriate. A lower machine-only price can leave essential handling equipment outside the order.\\n\\nWhat should the supplier demonstrate?\\n- Your smallest and largest production packs with the intended film.\\n- Sustained acceptable output, including loading and unloading time.\\n- Seam integrity, corner finish and product condition after cooling.\\n- A normal changeover and restart using documented settings.\\n\\nHow do you move from enquiry to an order?\\nUse [machine selection consultation](/services/consultation) to agree the configuration and acceptance record. Send your delivery location, line drawing and product photographs. Review the companion [shrink defect guide](/blog/shrink-tunnel-loose-film-burn-holes-guide) to define the visible defects your trial should check.\",\"leftImage\":\"/images/blog/shrink-tunnel-machine-sizing-and-price-guide.webp\",\"leftImageAlt\":\"Shrink Tunnel Machine: Sizing and Quotation Guide technical illustration\",\"rightImage\":\"/images/products/portable-shrink-tunnel.png\",\"rightImageAlt\":\"Portable Shrink Tunnel by Spectra Pack Machines\"}",
    "image": "/images/blog/shrink-tunnel-machine-sizing-and-price-guide.webp",
    "seo_title": "Shrink Tunnel Machine: Sizing and Quotation Guide",
    "seo_desc": "Compare tunnel opening, film compatibility, usable conveyor space and quotation scope before buying a shrink tunnel for your packaging line.",
    "seo_keywords": [
      "Shrink tunnel",
      "shrink tunnel machine",
      "portable shrink tunnel",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "shrink-tunnel-machine",
      "portable-shrink-tunnel"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "shrink-tunnel-loose-film-burn-holes-guide"
    ]
  },
  {
    "slug": "shrink-tunnel-loose-film-burn-holes-guide",
    "title": "Shrink Tunnel Defects: Loose Film, Holes and Distortion",
    "excerpt": "Use a controlled film and pack trial to investigate loose shrink wrap, holes and product distortion without changing every setting at once.",
    "content": "{\"body\":\"Loose film and burn holes can appear on the same line for different reasons. A useful investigation starts with the last accepted pack and asks what changed: film batch, product geometry, loading pattern, sealing or tunnel settings. Avoid treating the temperature controller as the only cause of every wrapping defect.\\n\\nWhat should you record before adjusting settings?\\nKeep defective and acceptable samples labelled by time and product. Record the film supplier, grade, thickness, pack dimensions and orientation. Compare the actual setup with the approved recipe for the [shrink tunnel machine](/products/shrink-tunnel-machine). Check whether the film has been stored and handled according to its supplier's instructions.\\nInspect the seal before shrinking. A weak or incomplete seal entering the tunnel can open during exposure and resemble a shrinking problem. Film quantity matters too: excess material around a small pack can leave folds that a temperature change alone will not resolve.\\n\\nHow should you run a controlled comparison?\\nUse one product and film batch, allow the equipment to stabilize and change only one approved operating parameter at a time. Keep pack spacing consistent and inspect the finished pack after cooling. Record both the improvement and any new defect so the preferred setting reflects the whole pack.\\nWork within the equipment and material suppliers' operating limits. If the product warps, labels move or film contacts heated surfaces unexpectedly, stop and ask for application support. Do not reach into the tunnel or remove guarding to observe a moving pack.\\n\\nWhich observations help the service team?\\n- Whether defects occur at the same corner, seam or conveyor position.\\n- Whether the first packs differ from steady production.\\n- Photographs of the wrap before and after shrinking.\\n- Changes in film, loading interval or product temperature.\\n\\nWhen should the setup be re-approved?\\nA new film specification or substantially different product deserves a fresh documented trial. Ask [after-sales support](/services/after-sales) to review persistent defects and update the approved recipe after the cause is confirmed. The [tunnel sizing guide](/blog/shrink-tunnel-machine-sizing-and-price-guide) helps identify when the application needs a different configuration.\",\"leftImage\":\"/images/blog/shrink-tunnel-loose-film-burn-holes-guide.webp\",\"leftImageAlt\":\"Shrink Tunnel Defects: Loose Film, Holes and Distortion technical illustration\",\"rightImage\":\"/images/products/portable-shrink-tunnel.png\",\"rightImageAlt\":\"Portable Shrink Tunnel by Spectra Pack Machines\"}",
    "image": "/images/blog/shrink-tunnel-loose-film-burn-holes-guide.webp",
    "seo_title": "Shrink Tunnel Defects: Loose Film, Holes and Distortion",
    "seo_desc": "Use a controlled film and pack trial to investigate loose shrink wrap, holes and product distortion without changing every setting at once.",
    "seo_keywords": [
      "Shrink tunnel",
      "shrink tunnel machine",
      "portable shrink tunnel",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "shrink-tunnel-machine",
      "portable-shrink-tunnel"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "shrink-tunnel-machine-sizing-and-price-guide"
    ]
  },
  {
    "slug": "automatic-bottle-web-sealer-bundle-pattern-selection",
    "title": "Automatic Bottle Web Sealer: Choose Your Bundle Pattern",
    "excerpt": "Plan bottle grouping, bundle dimensions and line transfers before specifying an automatic web sealer with shrink tunnel.",
    "content": "{\"body\":\"A bottle wrapping line must turn individual bottles into a repeatable transportable group. The required grouping pattern affects the machine arrangement as much as bottle height or line speed. Prepare the bundle specification before requesting an [automatic bottle web sealer with shrink tunnel](/products/automatic-web-sealer-with-shrink-tunnel-bottles).\\n\\nWhich bottle and bundle details matter?\\nList every bottle format with diameter, height, filled weight, closure and label type. Photograph the intended group from above and from the side. Identify whether bottles stand directly on the conveyor or use a tray or pad. Include formats with narrow bases or unusual shoulders because they may behave differently during grouping.\\nState the number of bottles per group and the required bundles per minute. For example, a bottle rate of 120 per minute divided into twelve-bottle bundles creates a theoretical ten bundles per minute before losses. That arithmetic does not establish machine capacity; grouping interruptions and rejected packs must be measured.\\n\\nWhat is included in automatic operation?\\nAsk the supplier to identify bottle accumulation, lane division, counting, grouping, film feed, sealing and tunnel transfer in the proposed layout. Confirm which stages require operator intervention. An automatic sealer may still depend on an upstream grouping arrangement supplied separately.\\nReview transfer height, available straight conveyor length and access for film replacement. A drawing should show operator positions and the route for finished bundles to leave the line without blocking the tunnel exit.\\n\\nHow do you compare alternative offers?\\n- Use identical bottle samples, film and group patterns.\\n- Measure accepted bundles over an agreed run duration.\\n- Time format changes and normal film replacement.\\n- Inspect bottle stability, label condition and cooled-pack handling.\\n\\nWhat should be confirmed before manufacture?\\nAgree the supply boundary, utilities and acceptance record through [machine consultation](/services/consultation). Include the smallest and least stable bottle in the trial. Then use the [bottle-line acceptance checklist](/blog/bottle-shrink-line-factory-acceptance-checklist) to make sure the final demonstration matches your daily production, including routine stops and restarts.\",\"leftImage\":\"/images/blog/automatic-bottle-web-sealer-bundle-pattern-selection.webp\",\"leftImageAlt\":\"Automatic Bottle Web Sealer: Choose Your Bundle Pattern technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/automatic-bottle-web-sealer-bundle-pattern-selection.webp",
    "seo_title": "Automatic Bottle Web Sealer: Choose Your Bundle Pattern",
    "seo_desc": "Plan bottle grouping, bundle dimensions and line transfers before specifying an automatic web sealer with shrink tunnel.",
    "seo_keywords": [
      "Automatic bottle web sealer",
      "automatic web sealer with shrink tunnel bottles",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-web-sealer-with-shrink-tunnel-bottles"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "bottle-shrink-line-factory-acceptance-checklist"
    ]
  },
  {
    "slug": "bottle-shrink-line-factory-acceptance-checklist",
    "title": "Bottle Shrink Line: Factory Acceptance Checklist",
    "excerpt": "Check grouping accuracy, seals, cooled bundles, normal stops and format changes before accepting a bottle shrink wrapping line.",
    "content": "{\"body\":\"A factory trial should answer whether your bottle line can make the required pack repeatedly. A short video of one attractive bundle is useful for orientation, but it cannot show sustained output, changeover work or reject handling. Agree a written trial plan for the [automatic bottle web sealer](/products/automatic-web-sealer-with-shrink-tunnel-bottles) before the demonstration.\\n\\nWhich samples should be used?\\nProvide production bottles, caps, labels, filled weights and film. If water is substituted for another liquid, document the difference because fill weight and handling may change. Include more than the easiest bottle size: test the format most likely to tip, distort or require adjustment.\\nState the bundle pattern and finished-pack acceptance criteria. Check that bottle count, orientation and seal position are correct. Define unacceptable outcomes such as separated groups, punctures, moved labels or damaged closures rather than relying only on a general description of good appearance.\\n\\nHow should performance be measured?\\nRecord elapsed running time, good bundles, rejected bundles and stoppages. Note who loaded the line and whether an operator performed work that is expected to be automatic. Keep the incoming bottle supply representative; an artificially smooth hand-fed demonstration can hide accumulation problems.\\nInclude a planned stop, restart and format change using the supplier's approved operating procedure. Record the adjustments and the number of packs needed to restore an acceptable result. Guarding and access procedures should remain in their intended production configuration throughout the demonstration.\\n\\nWhat belongs in the handover record?\\n- Confirmed machine model, options and conveyor interfaces.\\n- Film specification and approved product recipes.\\n- Sample photographs and measured production results.\\n- Outstanding items with responsibilities and agreed next actions.\\n\\nHow is the factory result repeated on site?\\nShare the site utility and layout details with the [installation team](/services/installation). Repeat the agreed checks after delivery using production materials. Use the [bundle selection guide](/blog/automatic-bottle-web-sealer-bundle-pattern-selection) if a new bottle group is introduced; acceptance of one configuration does not prove performance for every future format.\",\"leftImage\":\"/images/blog/bottle-shrink-line-factory-acceptance-checklist.webp\",\"leftImageAlt\":\"Bottle Shrink Line: Factory Acceptance Checklist technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/bottle-shrink-line-factory-acceptance-checklist.webp",
    "seo_title": "Bottle Shrink Line: Factory Acceptance Checklist",
    "seo_desc": "Check grouping accuracy, seals, cooled bundles, normal stops and format changes before accepting a bottle shrink wrapping line.",
    "seo_keywords": [
      "Automatic bottle web sealer",
      "automatic web sealer with shrink tunnel bottles",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-web-sealer-with-shrink-tunnel-bottles"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "automatic-bottle-web-sealer-bundle-pattern-selection"
    ]
  },
  {
    "slug": "semi-automatic-web-sealer-output-and-staffing",
    "title": "Semi-Automatic Web Sealer: Output and Staffing Guide",
    "excerpt": "Estimate realistic output from loading, sealing and unloading work before selecting a semi-automatic shrink wrapping system.",
    "content": "{\"body\":\"Semi-automatic wrapping can suit changing batch sizes and operator-prepared groups. Its practical capacity depends on the entire work cycle, including preparing the next pack and removing the last one. Evaluate the [semi-automatic web sealer](/products/semi-automatic-web-sealer-with-shrink-tunnel-bottles) as a workstation rather than an isolated sealing mechanism.\\n\\nHow should you estimate hourly production?\\nTime the full cycle with your actual bundle, including arranging products, positioning the pack, operating the approved controls and clearing the discharge area. Record several consecutive cycles and the longer interruptions caused by film changes or replenishing products. Use accepted packs per hour as the comparison measure.\\nA demonstration with pre-arranged bundles may exclude work your operator will do during production. State whether loading, group preparation and unloading are separate jobs or performed by one person. The answer can change the achievable output without any change to the sealer itself.\\n\\nWhich product details affect handling?\\nFilled bottle weight, carton grip and bundle stability affect how easily an operator can present the pack. For [box wrapping applications](/products/semi-automatic-web-sealer-with-shrink-tunnel-box), include the weakest or most awkward carton in the trial. Review table height and transfer distances with the people who will operate the workstation.\\nProvide space for incoming products, film rolls and cooled finished packs. Avoid a layout that requires operators to reach across hot surfaces or moving equipment. Have the supplier confirm the intended loading sequence and protective controls.\\n\\nWhat should you include in the buying brief?\\n- Pack size, weight and number of products per group.\\n- Normal batch size and changeover frequency.\\n- Available operators and the work assigned to each.\\n- Required good packs per shift and planned working hours.\\n\\nWhen is automation worth reviewing?\\nIf repeated loading or grouping is the measured bottleneck, ask for [line consultation](/services/consultation). Compare the complete supply scope and staffing needs of each proposal. The companion [changeover guide](/blog/semi-automatic-web-sealer-film-changeover-guide) explains how to test the interruptions that can otherwise disappear from a headline capacity figure.\",\"leftImage\":\"/images/blog/semi-automatic-web-sealer-output-and-staffing.webp\",\"leftImageAlt\":\"Semi-Automatic Web Sealer: Output and Staffing Guide technical illustration\",\"rightImage\":\"/images/products/semi-automatic-web-sealer-with-shrink-tunnel-box.png\",\"rightImageAlt\":\"Semi-Automatic Web Sealer with Shrink Tunnel - Box by Spectra Pack Machines\"}",
    "image": "/images/blog/semi-automatic-web-sealer-output-and-staffing.webp",
    "seo_title": "Semi-Automatic Web Sealer: Output and Staffing Guide",
    "seo_desc": "Estimate realistic output from loading, sealing and unloading work before selecting a semi-automatic shrink wrapping system.",
    "seo_keywords": [
      "Semi-automatic web sealer",
      "semi automatic web sealer with shrink tunnel bottles",
      "semi automatic web sealer with shrink tunnel box",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "semi-automatic-web-sealer-with-shrink-tunnel-bottles",
      "semi-automatic-web-sealer-with-shrink-tunnel",
      "semi-automatic-web-sealer-with-shrink-tunnel-box"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "semi-automatic-web-sealer-film-changeover-guide"
    ]
  },
  {
    "slug": "semi-automatic-web-sealer-film-changeover-guide",
    "title": "Semi-Automatic Web Sealer: Film and Pack Changeovers",
    "excerpt": "Organize film replacement and pack-size changes around approved recipes, operator access and first-pack inspection.",
    "content": "{\"body\":\"Frequent pack changes can consume more production time than the sealing cycle itself. A useful changeover method gives operators a clear approved sequence and a way to confirm that the first new pack is acceptable. Start with the instructions for the installed [semi-automatic web sealer](/products/semi-automatic-web-sealer-with-shrink-tunnel-bottles).\\n\\nWhat should a changeover sheet contain?\\nIdentify the outgoing and incoming product, bundle pattern, film specification and approved settings. Include photographs of the correct film path and finished pack where the supplier permits them. List the adjustments that operators may make and those reserved for trained maintenance personnel.\\nPrepare the next product and film before the stop. Check roll dimensions and handling requirements against the supplied machine, and use the prescribed shutdown and isolation method before any task that requires access to heated or moving parts. Never treat a paused conveyor as proof that the whole machine is isolated.\\n\\nHow is the first pack approved?\\nInspect group stability and film positioning before sealing. After shrinking and cooling, check the seam, film coverage and product condition. Use the actual [box pack](/products/semi-automatic-web-sealer-with-shrink-tunnel-box) or bottle group being introduced, not a leftover sample from the previous setup.\\nRecord whether the initial result met the approved standard. If changes are required, change only permitted settings and document the result. Repeated trial-and-error on every changeover suggests the recipe or mechanical adjustment instructions need clarification.\\n\\nWhich times should you measure?\\n- Last acceptable old-format pack to the planned stop.\\n- Time spent replacing film and adjusting the workstation.\\n- Restart to the first acceptable new-format pack.\\n- Total rejected or reworked packs during the transition.\\n\\nHow should the method improve over time?\\nReview logs with operators and [after-sales support](/services/after-sales). Update the written sequence when a verified improvement is approved, and make sure all shifts use the same version. Compare the result with your [output and staffing estimate](/blog/semi-automatic-web-sealer-output-and-staffing); faster running between long changeovers may not improve the final shift output.\",\"leftImage\":\"/images/blog/semi-automatic-web-sealer-film-changeover-guide.webp\",\"leftImageAlt\":\"Semi-Automatic Web Sealer: Film and Pack Changeovers technical illustration\",\"rightImage\":\"/images/products/semi-automatic-web-sealer-with-shrink-tunnel-box.png\",\"rightImageAlt\":\"Semi-Automatic Web Sealer with Shrink Tunnel - Box by Spectra Pack Machines\"}",
    "image": "/images/blog/semi-automatic-web-sealer-film-changeover-guide.webp",
    "seo_title": "Semi-Automatic Web Sealer: Film and Pack Changeovers",
    "seo_desc": "Organize film replacement and pack-size changes around approved recipes, operator access and first-pack inspection.",
    "seo_keywords": [
      "Semi-automatic web sealer",
      "semi automatic web sealer with shrink tunnel bottles",
      "semi automatic web sealer with shrink tunnel box",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "semi-automatic-web-sealer-with-shrink-tunnel-bottles",
      "semi-automatic-web-sealer-with-shrink-tunnel",
      "semi-automatic-web-sealer-with-shrink-tunnel-box"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "semi-automatic-web-sealer-output-and-staffing"
    ]
  },
  {
    "slug": "carton-shrink-wrapping-vs-taping-strapping",
    "title": "Carton Shrink Wrapping vs Taping and Strapping",
    "excerpt": "Choose carton closure, grouping and transport restraint as separate packaging tasks when planning your dispatch line.",
    "content": "{\"body\":\"Shrink wrapping, taping and strapping solve different problems on a carton line. A closed carton may still need grouping, and a shrink-wrapped group may still need an appropriate pallet restraint system. Define the purpose of each packaging stage before comparing machines.\\n\\nWhen is carton shrink wrapping useful?\\nAn [automatic box web sealer](/products/automatic-web-sealer-with-shrink-tunnel-box) is a machine to assess when film is used to group cartons or protect their outer surfaces. Trial the actual board, print finish, contents and group arrangement. Check whether heat and film tension affect corners, panels or the product inside.\\nThe resulting film package should be evaluated after cooling and normal handling. A neat appearance does not by itself demonstrate stacking strength or transport performance. Include the warehouse and dispatch sequence in the agreed acceptance criteria.\\n\\nWhen do you need carton taping and strapping?\\nAn [automatic carton taping and strapping machine](/products/automatic-carton-taping-with-box-strapping) addresses flap closure and the application of a strap. Ask whether flap folding, size adjustment and carton presentation are included in the quoted arrangement or remain operator tasks.\\nSend the smallest and largest carton dimensions, filled weights, board condition, tape and strap specification. Inspect tape adhesion, fold length and strap position. Excessive strap tension can damage weak board, so assess carton condition and tension together during the supplier's trial.\\n\\nHow should a combined line be specified?\\n- Draw the order of closing, grouping and palletizing operations.\\n- Identify transfer heights and the handling required between machines.\\n- Measure output at the slowest complete stage.\\n- Define acceptance criteria for both package appearance and handling.\\n\\nWhat information supports a useful quotation?\\nShare the carton range and your dispatch workflow through [line consultation](/services/consultation). Ask for an itemized supply boundary and test plan. The companion [carton-line transfer guide](/blog/carton-packing-line-transfer-and-size-change-guide) helps evaluate the interface work that can otherwise be missed when machines are quoted individually.\",\"leftImage\":\"/images/blog/carton-shrink-wrapping-vs-taping-strapping.webp\",\"leftImageAlt\":\"Carton Shrink Wrapping vs Taping and Strapping technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/carton-shrink-wrapping-vs-taping-strapping.webp",
    "seo_title": "Carton Shrink Wrapping vs Taping and Strapping",
    "seo_desc": "Choose carton closure, grouping and transport restraint as separate packaging tasks when planning your dispatch line.",
    "seo_keywords": [
      "Box wrapping and carton packing",
      "automatic web sealer with shrink tunnel box",
      "automatic carton taping with box strapping",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-web-sealer-with-shrink-tunnel-box",
      "automatic-carton-taping-with-box-strapping"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "carton-packing-line-transfer-and-size-change-guide"
    ]
  },
  {
    "slug": "carton-packing-line-transfer-and-size-change-guide",
    "title": "Carton Packing Lines: Transfers and Size Changes",
    "excerpt": "Check carton support, transfer gaps, guides and changeover work when linking wrapping, taping and strapping equipment.",
    "content": "{\"body\":\"A carton line can fail at the transfer between machines even when each machine performs correctly on its own. Short cartons can catch at a gap, tall cartons can lean, and damaged board can behave differently under a guide. Plan transfers using the actual range of filled cartons.\\n\\nWhat should the layout drawing show?\\nRecord conveyor heights, direction of travel, usable widths and the distance between discharge and infeed points. Show where operators replenish tape, strap or film and where they remove a rejected carton. Access for routine work belongs in the footprint, alongside the equipment itself.\\nFor the [box web sealer](/products/automatic-web-sealer-with-shrink-tunnel-box), confirm the carton presentation needed before grouping and sealing. For [taping and strapping equipment](/products/automatic-carton-taping-with-box-strapping), confirm whether cartons arrive with flaps prepared and how they are centred.\\n\\nHow should size changes be tested?\\nRun the smallest and largest cartons using the same staffing arrangement expected on site. Time adjustments to guides, working height and consumable positions where applicable. Ask which settings are stored and which require a physical adjustment or change part.\\nInspect the first cartons after restart. Check tape placement, strap position, squareness and transfer stability. Record the time between the last acceptable carton of one size and the first acceptable carton of the next. That measurement is more useful for production planning than an isolated adjustment time.\\n\\nWhat happens when downstream equipment stops?\\nAsk the supplier to describe the intended stop and accumulation sequence. Confirm which signals and interlocks are included in the integration scope. Do not assume that separate machines will coordinate automatically because they have similar conveyor speeds.\\n- Review carton queue limits and safe restart procedures.\\n- Identify who supplies interface wiring and controls.\\n- Include a representative stop-start demonstration.\\n\\nWho should agree the final arrangement?\\nUse [custom machine design](/services/custom-design) for unusual interfaces and [installation support](/services/installation) for site handover. Refer to the [wrapping versus taping guide](/blog/carton-shrink-wrapping-vs-taping-strapping) to keep each packaging stage tied to its intended purpose.\",\"leftImage\":\"/images/blog/carton-packing-line-transfer-and-size-change-guide.webp\",\"leftImageAlt\":\"Carton Packing Lines: Transfers and Size Changes technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/carton-packing-line-transfer-and-size-change-guide.webp",
    "seo_title": "Carton Packing Lines: Transfers and Size Changes",
    "seo_desc": "Check carton support, transfer gaps, guides and changeover work when linking wrapping, taping and strapping equipment.",
    "seo_keywords": [
      "Box wrapping and carton packing",
      "automatic web sealer with shrink tunnel box",
      "automatic carton taping with box strapping",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-web-sealer-with-shrink-tunnel-box",
      "automatic-carton-taping-with-box-strapping"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales",
      "custom-design"
    ],
    "related_blog_slugs": [
      "carton-shrink-wrapping-vs-taping-strapping"
    ]
  },
  {
    "slug": "l-sealer-machine-film-size-product-clearance",
    "title": "L-Sealer Machine: Film Size and Product Clearance",
    "excerpt": "Prepare product dimensions, film requirements and clearance checks before choosing an L-sealer and shrink tunnel.",
    "content": "{\"body\":\"An L-sealer forms a film enclosure before the pack passes through a shrink tunnel. Choosing a machine starts with the space needed for the product, film and sealing action together. The nominal sealing dimensions alone do not describe every product that can be packed successfully.\\n\\nWhich dimensions should be supplied?\\nMeasure the smallest and largest product, including projections, uneven surfaces and any supporting tray. State how the product is oriented during wrapping. Ask the supplier to confirm working clearance and the film arrangement for each format rather than using a guessed film-width formula.\\nCompare the [L-sealer with shrink tunnel](/products/l-sealer-with-shrink-tunnel-machine-indian) and [fully automatic L-sealer](/products/fully-automatic-l-sealer-with-shrink-tunnel-machine) using identical products. Explain whether items arrive individually, in irregular spacing or in batches that an operator will prepare.\\n\\nHow should film compatibility be checked?\\nProvide the intended film grade and supplier guidance. Ask for confirmation of sealability and shrink performance on the complete system. Product heat tolerance, printed surfaces and sharp corners deserve specific checks. A film that forms a seam may still give an unacceptable result in the tunnel.\\nRun enough samples to inspect the seal around the full package, including corners and the base. Compare the result after cooling and handling. Record the film specification used in the approved trial so future material substitutions can be evaluated against a known reference.\\n\\nWhat affects the automation decision?\\n- Product spacing and orientation at the infeed.\\n- Operator loading work and replenishment time.\\n- Format changes and any required change parts.\\n- Downstream tunnel and unloading capacity.\\n\\nWhat should the quotation define?\\nInclude sealing equipment, tunnel, conveyor interfaces, film handling and training in the supply discussion. Ask [machine consultation](/services/consultation) to confirm the complete configuration. Use the companion [L-sealer trial guide](/blog/l-sealer-seam-quality-production-trial) to turn the dimensional shortlist into a practical acceptance test before ordering.\",\"leftImage\":\"/images/blog/l-sealer-machine-film-size-product-clearance.webp\",\"leftImageAlt\":\"L-Sealer Machine: Film Size and Product Clearance technical illustration\",\"rightImage\":\"/images/products/fully-automatic-l-sealer-with-shrink-tunnel-machine-updated.png\",\"rightImageAlt\":\"Fully automatic L-sealer with shrink tunnel machine by Spectra Pack Machines\"}",
    "image": "/images/blog/l-sealer-machine-film-size-product-clearance.webp",
    "seo_title": "L-Sealer Machine: Film Size and Product Clearance",
    "seo_desc": "Prepare product dimensions, film requirements and clearance checks before choosing an L-sealer and shrink tunnel.",
    "seo_keywords": [
      "L-sealer with shrink tunnel",
      "l sealer with shrink tunnel machine indian",
      "fully automatic l sealer with shrink tunnel machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "l-sealer-with-shrink-tunnel-machine-indian",
      "l-sealer-with-shrink-tunnel-machine",
      "fully-automatic-l-sealer-with-shrink-tunnel-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "l-sealer-seam-quality-production-trial"
    ]
  },
  {
    "slug": "l-sealer-seam-quality-production-trial",
    "title": "L-Sealer Trials: Seam Quality and Repeatable Output",
    "excerpt": "Evaluate L-sealer seams, product presentation and stop-start performance with an agreed production trial.",
    "content": "{\"body\":\"A useful L-sealer demonstration checks repeatability as well as appearance. Pack shape, film positioning and presentation at the sealing area can change over a production run. Define a trial that uses normal products and includes the interruptions your operators will encounter.\\n\\nWhat makes a representative sample set?\\nInclude the lightest, tallest and least stable regular products. Use production film and any tray or insert used in the final pack. Identify the intended orientation so a successful demonstration does not depend on presenting the product differently from your actual line.\\nFor an [operator-assisted L-sealer](/products/l-sealer-with-shrink-tunnel-machine-indian), observe the complete loading cycle. For a [fully automatic L-sealer](/products/fully-automatic-l-sealer-with-shrink-tunnel-machine), check the intended infeed arrangement and whether the line maintains the required spacing without manual correction.\\n\\nWhere should seams be inspected?\\nInspect the enclosure before shrinking and the final package after cooling. Look at corners, the junction of seams and areas near product projections. Record open seams, cut-through film and excessive loose material using agreed photographs or descriptions of acceptable and rejected packs.\\nDo not attempt to solve every seam issue with a hotter setting. Film grade, alignment, product position and the approved sealing sequence can all affect the result. Keep changes within supplier instructions and request support where a consistent result cannot be achieved.\\n\\nHow do you measure realistic output?\\nCount acceptable finished packs over an agreed duration, recording rejects and interruptions separately. Include at least one normal stop, restart and format change. Note whether an extra operator helps during the demonstration; that work must be reflected in the production plan.\\n- Keep the product and film specification with the trial record.\\n- Record the approved recipe and changeover steps.\\n- List any unresolved items before dispatch acceptance.\\n\\nWhat follows the factory trial?\\nRepeat the agreed checks during [installation and commissioning](/services/installation). Use the [film and clearance guide](/blog/l-sealer-machine-film-size-product-clearance) when adding a new product, rather than assuming every size that physically fits has already been validated.\",\"leftImage\":\"/images/blog/l-sealer-seam-quality-production-trial.webp\",\"leftImageAlt\":\"L-Sealer Trials: Seam Quality and Repeatable Output technical illustration\",\"rightImage\":\"/images/products/fully-automatic-l-sealer-with-shrink-tunnel-machine-updated.png\",\"rightImageAlt\":\"Fully automatic L-sealer with shrink tunnel machine by Spectra Pack Machines\"}",
    "image": "/images/blog/l-sealer-seam-quality-production-trial.webp",
    "seo_title": "L-Sealer Trials: Seam Quality and Repeatable Output",
    "seo_desc": "Evaluate L-sealer seams, product presentation and stop-start performance with an agreed production trial.",
    "seo_keywords": [
      "L-sealer with shrink tunnel",
      "l sealer with shrink tunnel machine indian",
      "fully automatic l sealer with shrink tunnel machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "l-sealer-with-shrink-tunnel-machine-indian",
      "l-sealer-with-shrink-tunnel-machine",
      "fully-automatic-l-sealer-with-shrink-tunnel-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "l-sealer-machine-film-size-product-clearance"
    ]
  },
  {
    "slug": "shrink-sleeve-applicator-bottle-label-compatibility",
    "title": "Shrink Sleeve Applicator: Bottle and Label Compatibility",
    "excerpt": "Check sleeve dimensions, container shape and shrink finish when preparing an applicator enquiry.",
    "content": "{\"body\":\"A shrink sleeve has to fit the container before it can shrink to its final shape. Container geometry, sleeve material, print layout and the shrinking process work together. Prepare samples of the complete bottle and sleeve combination before selecting a [sleeve shrink wrapping machine](/products/sleeve-shrink-wrapping-machine).\\n\\nWhat information should come from the label supplier?\\nProvide the sleeve material, thickness, lay-flat width, cut length and recommended processing conditions. Include the printed artwork and seam position. Ask the label supplier to identify areas where distortion could affect important text or visual alignment on the container.\\nSend the actual filled container with its closure. Shoulder shape, base diameter, recesses and changes in cross-section can affect sleeve placement and final appearance. If several containers share one printed sleeve design, test each combination explicitly.\\n\\nWhat should the machine supplier confirm?\\nClarify which tasks the proposed system performs: sleeve feeding, cutting, application, positioning and shrinking. Confirm the type of shrinking equipment included and its utility requirements. Do not assume that every applicator package contains the same heat source or handling arrangement.\\nDiscuss bottle arrival, conveyor height and product spacing. Empty lightweight containers may handle differently from filled ones. The enquiry should describe the state in which containers actually reach the applicator during production.\\n\\nWhat does a useful trial inspect?\\n- Sleeve placement before shrinking and repeatability over a run.\\n- Artwork alignment, seam appearance and wrinkling after cooling.\\n- Closure, bottle and product condition after the process.\\n- A normal restart and change between container formats.\\n\\nHow should the project be approved?\\nUse [application consultation](/services/consultation) to agree the bottle, label and machine combination. Keep approved samples with the purchase specification. The [sleeve changeover guide](/blog/shrink-sleeve-machine-wrinkles-changeovers) helps define the setup records needed to reproduce the accepted appearance when operators, material batches or bottle formats change.\",\"leftImage\":\"/images/blog/shrink-sleeve-applicator-bottle-label-compatibility.webp\",\"leftImageAlt\":\"Shrink Sleeve Applicator: Bottle and Label Compatibility technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/shrink-sleeve-applicator-bottle-label-compatibility.webp",
    "seo_title": "Shrink Sleeve Applicator: Bottle and Label Compatibility",
    "seo_desc": "Check sleeve dimensions, container shape and shrink finish when preparing an applicator enquiry.",
    "seo_keywords": [
      "Shrink sleeve applicator",
      "sleeve shrink wrapping machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "sleeve-shrink-wrapping-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "shrink-sleeve-machine-wrinkles-changeovers"
    ]
  },
  {
    "slug": "shrink-sleeve-machine-wrinkles-changeovers",
    "title": "Shrink Sleeve Machines: Wrinkles and Format Changes",
    "excerpt": "Investigate sleeve placement and wrinkle patterns using bottle, label and setup records from an approved trial.",
    "content": "{\"body\":\"Wrinkles or tilted sleeves are symptoms to investigate, not a reason to change all machine settings at once. Compare the defective pack with the approved sample and look for changes in bottle geometry, sleeve material, positioning or the shrinking stage. Keep the applicator and heat process in the same investigation.\\n\\nWhat should be checked before changing a recipe?\\nConfirm the container code, sleeve specification and print version. Record whether the sleeve sits correctly before it enters the shrinking stage. A placement error that exists before heating may need a different response from a sleeve that shifts only during shrinking.\\nReview the approved setup for the [sleeve shrink wrapping machine](/products/sleeve-shrink-wrapping-machine). Check whether the defect affects every container or appears intermittently. Differences between startup and steady operation can help the supplier identify which part of the sequence needs closer inspection.\\n\\nHow do you describe the defect clearly?\\nPhotograph the front, back, seam, shoulder and base of cooled samples. Mark the direction of travel and note whether the wrinkle repeats at the same position. Include the bottle's filled weight and the time the defect occurred. Avoid assuming the label or machine is responsible before comparing the evidence.\\nUse only supplier-approved operating adjustments. Access to cutting, moving or heated components requires the prescribed shutdown and maintenance procedure. Production pressure is not a reason to remove guards or hand-correct a sleeve inside operating equipment.\\n\\nWhat belongs in the format-change record?\\n- Bottle and sleeve identifiers with reference photographs.\\n- Approved settings and required change parts.\\n- First-pack inspection steps and rejection examples.\\n- Changeover time and the number of trial packs used.\\n\\nWhen is a new trial needed?\\nA new container shape, material or sleeve specification should be reviewed with [after-sales support](/services/after-sales) and the label supplier. Use the [compatibility guide](/blog/shrink-sleeve-applicator-bottle-label-compatibility) to prepare the information. Keep the accepted recipe tied to the specific bottle and sleeve combination rather than treating it as a universal setting.\",\"leftImage\":\"/images/blog/shrink-sleeve-machine-wrinkles-changeovers.webp\",\"leftImageAlt\":\"Shrink Sleeve Machines: Wrinkles and Format Changes technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/shrink-sleeve-machine-wrinkles-changeovers.webp",
    "seo_title": "Shrink Sleeve Machines: Wrinkles and Format Changes",
    "seo_desc": "Investigate sleeve placement and wrinkle patterns using bottle, label and setup records from an approved trial.",
    "seo_keywords": [
      "Shrink sleeve applicator",
      "sleeve shrink wrapping machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "sleeve-shrink-wrapping-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "shrink-sleeve-applicator-bottle-label-compatibility"
    ]
  },
  {
    "slug": "horizontal-vertical-band-sealer-pouch-selection",
    "title": "Horizontal vs Vertical Band Sealer: Choose by Pouch",
    "excerpt": "Match pouch orientation, filled weight and seal presentation to the correct band-sealer configuration.",
    "content": "{\"body\":\"A horizontal or vertical band sealer should be selected around how the filled pouch behaves. Product movement, available headspace and the ability to present a clean pouch mouth matter more than the orientation label alone. Prepare filled samples before requesting a recommendation.\\n\\nWhen should horizontal handling be considered?\\nA [horizontal band sealer](/products/mini-horizontal-band-sealer) is a format to discuss when the filled pouch can travel in the intended horizontal presentation without contaminating the seal area. Check product movement and support along the conveyor using real filled weights.\\nFor larger duty requirements, compare the [master horizontal band sealer](/products/master-horizontal-band-sealer) by its confirmed model specification and trial results. Do not assume that a larger frame automatically accepts every heavier or wider pouch.\\n\\nWhen does a vertical arrangement help?\\nA [vertical band sealer](/products/master-vertical-band-sealer) can be assessed where the pouch needs to remain upright. Confirm the supported pouch height, conveyor load and adjustment range with the supplier. The seal mouth must reach the sealing path consistently without the operator pulling or tilting a heavy pouch.\\nProvide the pouch material structure and its sealing guidance. Pouch width, filled height and headspace should be recorded separately. The same nominal bag size can behave differently at a different fill weight or with another product.\\n\\nWhat should the trial include?\\n- The actual filled pouch and production material batch.\\n- Consistent feeding by the expected operator.\\n- Seal appearance and agreed seal-integrity checks after cooling.\\n- Stop-start operation and changes between regular pouch sizes.\\n\\nHow do you compare quotations?\\nAsk which conveyor, coding arrangement and adjustments are included, if applicable. State the required acceptable pouches per hour rather than only a conveyor speed. Use [machine consultation](/services/consultation) to confirm the configuration and the [band-seal investigation guide](/blog/band-sealer-weak-seals-material-and-feeding) to define the defect examples that should be checked during acceptance.\",\"leftImage\":\"/images/blog/horizontal-vertical-band-sealer-pouch-selection.webp\",\"leftImageAlt\":\"Horizontal vs Vertical Band Sealer: Choose by Pouch technical illustration\",\"rightImage\":\"/images/products/master-horizontal-band-sealer-updated.avif\",\"rightImageAlt\":\"Master horizontal band sealer by Spectra Pack Machines\"}",
    "image": "/images/blog/horizontal-vertical-band-sealer-pouch-selection.webp",
    "seo_title": "Horizontal vs Vertical Band Sealer: Choose by Pouch",
    "seo_desc": "Match pouch orientation, filled weight and seal presentation to the correct band-sealer configuration.",
    "seo_keywords": [
      "Band sealer",
      "mini horizontal band sealer",
      "master horizontal band sealer",
      "master vertical band sealer",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "mini-horizontal-band-sealer",
      "horizontal-band-sealer-machine",
      "master-horizontal-band-sealer",
      "horizontal-band-sealer-master-model",
      "master-vertical-band-sealer",
      "vertical-band-sealer-machine-indian-model"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "band-sealer-weak-seals-material-and-feeding"
    ]
  },
  {
    "slug": "band-sealer-weak-seals-material-and-feeding",
    "title": "Band Sealer Weak Seals: Material and Feeding Checks",
    "excerpt": "Investigate inconsistent pouch seals by checking material changes, seal contamination and product presentation.",
    "content": "{\"body\":\"A weak pouch seal can result from a material problem, an operating change or a machine condition. Start with labelled samples and a record of when the fault appeared. Describing the observed defect is more useful than ordering a replacement part based only on a guess.\\n\\nWhich material details should be compared?\\nRecord the pouch supplier, material structure, batch and recommended sealing conditions. Compare a pouch from the last accepted batch with the current one. Note changes in thickness, print, gussets or the number of material layers at the seal.\\nCheck whether powder, oil or product has entered the intended seal area. A clean empty pouch test may help the supplier compare material response, but it does not replace a trial with the actual filled product. Keep the final acceptance based on production conditions.\\n\\nHow can presentation cause inconsistent results?\\nObserve whether operators present the pouch mouth straight and at a repeatable height. For a [horizontal band sealer](/products/master-horizontal-band-sealer), check whether the pack is supported as intended. For a [vertical band sealer](/products/master-vertical-band-sealer), confirm that filled weight is carried by the support arrangement rather than the sealing path.\\nUse the installed machine's operating instructions for permitted adjustments. Do not touch sealing bands, heated parts or moving mechanisms while the equipment runs. Wear-part inspection and replacement belong in the prescribed shutdown and isolation procedure.\\n\\nWhat should be recorded for technical support?\\n- Photographs of the full pouch and the defective seal.\\n- Whether the problem occurs from startup or after continued running.\\n- Material identifiers and approved settings.\\n- Any recent maintenance, material or product changes.\\n\\nHow should a correction be accepted?\\nRun a documented batch and perform the agreed seal-integrity check after cooling. Appearance alone does not establish a reliable seal. Ask [after-sales support](/services/after-sales) to review recurring defects. The [orientation selection guide](/blog/horizontal-vertical-band-sealer-pouch-selection) helps determine whether the handling arrangement itself should be reconsidered.\",\"leftImage\":\"/images/blog/band-sealer-weak-seals-material-and-feeding.webp\",\"leftImageAlt\":\"Band Sealer Weak Seals: Material and Feeding Checks technical illustration\",\"rightImage\":\"/images/products/master-horizontal-band-sealer-updated.avif\",\"rightImageAlt\":\"Master horizontal band sealer by Spectra Pack Machines\"}",
    "image": "/images/blog/band-sealer-weak-seals-material-and-feeding.webp",
    "seo_title": "Band Sealer Weak Seals: Material and Feeding Checks",
    "seo_desc": "Investigate inconsistent pouch seals by checking material changes, seal contamination and product presentation.",
    "seo_keywords": [
      "Band sealer",
      "mini horizontal band sealer",
      "master horizontal band sealer",
      "master vertical band sealer",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "mini-horizontal-band-sealer",
      "horizontal-band-sealer-machine",
      "master-horizontal-band-sealer",
      "horizontal-band-sealer-master-model",
      "master-vertical-band-sealer",
      "vertical-band-sealer-machine-indian-model"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "horizontal-vertical-band-sealer-pouch-selection"
    ]
  },
  {
    "slug": "foot-impulse-tube-sealing-machine-selection",
    "title": "Foot, Impulse and Tube Sealers: Selection Checklist",
    "excerpt": "Compare sealing format, material, operator work and product support before selecting a compact sealing machine.",
    "content": "{\"body\":\"Compact sealing machines cover different pack formats and operating methods. A foot-operated machine, impulse sealer and tube sealer should not be treated as interchangeable because all create a seal. Match the material, seal geometry and loading task to the exact proposed model.\\n\\nWhich packaging sample should you send?\\nProvide filled bags or tubes in every regular size, together with the material supplier's information. Record seal width, pouch mouth width, filled weight and headspace where relevant. For a [tube sealing machine](/products/tube-sealing-machine), identify the tube material, dimensions and the condition in which it reaches the sealing station.\\nAsk the supplier to explain the intended application of the quoted [impulse sealer](/products/impulse-sealing-machine), [DH sealing machine](/products/dh-sealing-machine) or [foot sealing equipment](/products/band-sealer-machine). Product names in catalogues are not a substitute for confirming the actual heating method and operating cycle.\\n\\nHow does the workstation affect production?\\nObserve the complete operator task: picking up the pack, presenting the seal area, activating the controls, waiting for the approved cycle and removing the pack. Include support for heavier bags and space for finished packs. Check whether two operators are being used in a demonstration of a station you expect one person to run.\\nFor large or awkward packs, discuss the [mobile sealer](/products/mobile-sealer-machine) and the physical arrangement needed around it. Mobility does not remove the need for a stable working position, suitable utilities and safe access.\\n\\nWhat requires special confirmation?\\n- Material compatibility and seal quality using your samples.\\n- Working dimensions, cycle and cooling requirements.\\n- Pouch or tube support and normal changeovers.\\n- Documentation for any application-specific equipment requirements.\\n\\nHow should you choose the final model?\\nA [pneumatic vertical sealer](/products/pneumatic-vertical-sealing-machine-flame-proof) needs its exact configuration checked against the site application. Use [technical consultation](/services/consultation) to settle the scope, and the [seal repeatability guide](/blog/foot-impulse-sealer-repeatable-seals-checklist) for acceptance checks.\",\"leftImage\":\"/images/blog/foot-impulse-tube-sealing-machine-selection.webp\",\"leftImageAlt\":\"Foot, Impulse and Tube Sealers: Selection Checklist technical illustration\",\"rightImage\":\"/images/products/tube-sealing-machine.png\",\"rightImageAlt\":\"Tube Sealing Machine by Spectra Pack Machines\"}",
    "image": "/images/blog/foot-impulse-tube-sealing-machine-selection.webp",
    "seo_title": "Foot, Impulse and Tube Sealers: Selection Checklist",
    "seo_desc": "Compare sealing format, material, operator work and product support before selecting a compact sealing machine.",
    "seo_keywords": [
      "Foot and impulse sealing machines",
      "band sealer machine",
      "tube sealing machine",
      "impulse sealing machine",
      "dh sealing machine",
      "pneumatic vertical sealing machine flame proof",
      "mobile sealer machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "band-sealer-machine",
      "tube-sealing-machine",
      "impulse-sealing-machine",
      "dh-sealing-machine",
      "pneumatic-vertical-sealing-machine-flame-proof",
      "mobile-sealer-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "foot-impulse-sealer-repeatable-seals-checklist"
    ]
  },
  {
    "slug": "foot-impulse-sealer-repeatable-seals-checklist",
    "title": "Foot and Impulse Sealers: Repeatable Seal Checklist",
    "excerpt": "Build a consistent loading and inspection routine for bags and tubes using the installed machine instructions.",
    "content": "{\"body\":\"A compact sealing station depends on repeatable product preparation as well as the machine cycle. If operators present different amounts of material or release a pack before the approved cycle finishes, results can vary even when the controls have not changed. Use a written procedure tied to the installed model.\\n\\nWhat should the loading routine define?\\nIdentify the pack material, fill level and intended seal position. Keep product away from the sealing area and use the supplier's method for supporting the filled pack. Specify which checks an operator performs before starting a cycle on the [impulse sealer](/products/impulse-sealing-machine) or [DH sealer](/products/dh-sealing-machine).\\nFor [tube sealing](/products/tube-sealing-machine), record the tube orientation and the condition of the open end before sealing. Compare samples after the full prescribed cycle. Do not transfer a setup from a bag sealer to a tube machine simply because the materials look similar.\\n\\nHow should seal quality be judged?\\nAgree a visible standard and an appropriate integrity test for the actual package. Inspect cooled samples, including the corners and any multilayer or gusset area. Record folds, contamination, openings and inconsistent seal positions as separate defects.\\nIf results change, compare the material batch, product preparation and approved recipe before adjusting settings. Operators should make only the changes allowed in the manual. Repairs, cleaning inside the sealing area and wear-part replacement require the prescribed safe isolation procedure.\\n\\nWhich observations help prevent repeated rejects?\\n- Product and material identifiers for each batch.\\n- The first accepted sample after setup or changeover.\\n- Defects occurring at startup versus later in a shift.\\n- Approved maintenance and replacement-part records.\\n\\nWhen should you request a review?\\nContact [after-sales support](/services/after-sales) when acceptable seals cannot be reproduced using the approved procedure. Include pack photographs and the machine model. The [compact sealer selection guide](/blog/foot-impulse-tube-sealing-machine-selection) helps identify whether changes in pack size, material or operator handling need a different configuration rather than another setting adjustment.\",\"leftImage\":\"/images/blog/foot-impulse-sealer-repeatable-seals-checklist.webp\",\"leftImageAlt\":\"Foot and Impulse Sealers: Repeatable Seal Checklist technical illustration\",\"rightImage\":\"/images/products/tube-sealing-machine.png\",\"rightImageAlt\":\"Tube Sealing Machine by Spectra Pack Machines\"}",
    "image": "/images/blog/foot-impulse-sealer-repeatable-seals-checklist.webp",
    "seo_title": "Foot and Impulse Sealers: Repeatable Seal Checklist",
    "seo_desc": "Build a consistent loading and inspection routine for bags and tubes using the installed machine instructions.",
    "seo_keywords": [
      "Foot and impulse sealing machines",
      "band sealer machine",
      "tube sealing machine",
      "impulse sealing machine",
      "dh sealing machine",
      "pneumatic vertical sealing machine flame proof",
      "mobile sealer machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "band-sealer-machine",
      "tube-sealing-machine",
      "impulse-sealing-machine",
      "dh-sealing-machine",
      "pneumatic-vertical-sealing-machine-flame-proof",
      "mobile-sealer-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "foot-impulse-tube-sealing-machine-selection"
    ]
  },
  {
    "slug": "pallet-stretch-wrapper-load-size-film-selection",
    "title": "Pallet Stretch Wrapper: Load and Film Selection",
    "excerpt": "Specify pallet dimensions, load stability, film and loading method before choosing a stretch wrapping machine.",
    "content": "{\"body\":\"A pallet wrapper should be selected around the complete unit load, including the pallet, stacked goods and any overhang. The correct machine configuration depends on how the load enters the workstation and how it responds to wrapping forces. Film selection is part of that decision.\\n\\nWhich load details should be measured?\\nProvide pallet length and width, maximum overall height and the weight of the complete load. Photograph the least stable stack and identify sharp corners, light cartons or uneven surfaces. Ask the supplier to confirm the capacity and usable dimensions of the proposed [pallet stretch wrapping machine](/products/pallet-stretch-wrapping-machine).\\nDescribe the loading method and available handling equipment. Confirm approach space, ramp or floor arrangement where applicable, and access for film replacement. The installation footprint must include the movement needed to place and remove the pallet safely.\\n\\nHow should film be specified?\\nSupply the film grade, roll dimensions and supplier guidance. Discuss the film delivery arrangement fitted to the quoted machine rather than assuming that all wrappers use the same tension or pre-stretch method. A film-saving claim should be checked against the same accepted load and handling criteria.\\nMeasure film used per accepted pallet during a representative trial. Compare load condition after wrapping and after the agreed handling sequence. Lower material consumption is useful only if the package continues to meet the required containment standard.\\n\\nWhat should a quotation include?\\n- Confirmed load dimensions, weight and machine configuration.\\n- Film handling arrangement and approved roll specification.\\n- Loading accessories, site utilities and operator access.\\n- Trial criteria, training and installation responsibilities.\\n\\nHow do you decide whether the setup works?\\nTest the difficult loads, including light or irregular stacks, and keep the approved wrapping record. Use [application consultation](/services/consultation) to confirm the model. The companion [load stability guide](/blog/pallet-wrapper-unstable-load-trial-guide) explains why a neat outer wrap alone should not be used as the acceptance criterion.\",\"leftImage\":\"/images/blog/pallet-stretch-wrapper-load-size-film-selection.webp\",\"leftImageAlt\":\"Pallet Stretch Wrapper: Load and Film Selection technical illustration\",\"rightImage\":\"/images/products/pallet-stretch-wrapping-machine-updated.jpg\",\"rightImageAlt\":\"Pallet stretch wrap machine securing pallet loads\"}",
    "image": "/images/blog/pallet-stretch-wrapper-load-size-film-selection.webp",
    "seo_title": "Pallet Stretch Wrapper: Load and Film Selection",
    "seo_desc": "Specify pallet dimensions, load stability, film and loading method before choosing a stretch wrapping machine.",
    "seo_keywords": [
      "Pallet stretch wrapper",
      "pallet stretch wrapping machine",
      "pallet stretch wrap machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "pallet-stretch-wrapping-machine",
      "pallet-stretch-wrapping",
      "pallet-stretch-wrap-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "pallet-wrapper-unstable-load-trial-guide"
    ]
  },
  {
    "slug": "pallet-wrapper-unstable-load-trial-guide",
    "title": "Pallet Wrapper Trials: Check Unstable and Mixed Loads",
    "excerpt": "Evaluate stack condition, film application and handling together when accepting a pallet wrapping setup.",
    "content": "{\"body\":\"An unstable pallet may need changes to stacking or packaging as well as its wrapping recipe. A wrapper cannot be assumed to correct every weak carton, poor pallet or unsupported overhang. Begin with a representative unit load and a written definition of the handling it must tolerate.\\n\\nWhat should be checked before wrapping?\\nInspect pallet condition and the way cartons or products are stacked. Record overhang, gaps, mixed carton sizes and weak layers. Photograph the load from several sides. If the stack is already leaning, ask the responsible packaging and handling teams to review it before running the trial.\\nConfirm that the load fits the specified [pallet stretch wrapper](/products/pallet-stretch-wrap-machine) and that its weight is within the confirmed machine limits. Use the prescribed loading and exclusion procedures. Operators should not steady an unstable load by hand while the equipment moves.\\n\\nHow should the wrapping trial be compared?\\nUse the same load pattern and film specification when comparing recipes. Record the approved settings and film used. Inspect carton compression, corner damage, film tearing and movement of the load relative to the pallet after wrapping.\\nPerform the agreed handling check using the site's approved method and suitable personnel. A short movement on a smooth floor does not prove performance under every transport condition. Define the actual test boundary and record what has and has not been demonstrated.\\n\\nWhat belongs in the load recipe?\\n- Pallet and product identifiers with stacking photographs.\\n- Film specification and approved wrapping settings.\\n- Measured film use and the accepted finished appearance.\\n- Handling observations and examples of rejected loads.\\n\\nWhen should the recipe change?\\nReview new carton strengths, mixed-load patterns or film specifications with [after-sales support](/services/after-sales). Reassess the complete package when failures recur instead of repeatedly increasing film tension. The [wrapper selection guide](/blog/pallet-stretch-wrapper-load-size-film-selection) provides the machine and material information needed for that review.\",\"leftImage\":\"/images/blog/pallet-wrapper-unstable-load-trial-guide.webp\",\"leftImageAlt\":\"Pallet Wrapper Trials: Check Unstable and Mixed Loads technical illustration\",\"rightImage\":\"/images/products/pallet-stretch-wrapping-machine-updated.jpg\",\"rightImageAlt\":\"Pallet stretch wrap machine securing pallet loads\"}",
    "image": "/images/blog/pallet-wrapper-unstable-load-trial-guide.webp",
    "seo_title": "Pallet Wrapper Trials: Check Unstable and Mixed Loads",
    "seo_desc": "Evaluate stack condition, film application and handling together when accepting a pallet wrapping setup.",
    "seo_keywords": [
      "Pallet stretch wrapper",
      "pallet stretch wrapping machine",
      "pallet stretch wrap machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "pallet-stretch-wrapping-machine",
      "pallet-stretch-wrapping",
      "pallet-stretch-wrap-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "pallet-stretch-wrapper-load-size-film-selection"
    ]
  },
  {
    "slug": "vacuum-packaging-machine-chamber-and-bag-selection",
    "title": "Vacuum Packaging Machines: Chamber and Bag Selection",
    "excerpt": "Compare chamber clearance, bag material and complete loading cycles before selecting vacuum packaging equipment.",
    "content": "{\"body\":\"A vacuum packaging machine must accommodate the filled bag, not just the product without packaging. Chamber space, sealing position and the product's behaviour under vacuum affect the usable arrangement. Prepare samples and an application brief before deciding on the chamber format.\\n\\nWhich measurements should be supplied?\\nRecord product dimensions and weight, filled-bag dimensions, intended seal position and the number of bags per cycle. Include products that vary in shape or have sharp edges. Confirm the usable chamber clearance and seal-bar arrangement with the supplier rather than relying only on an external machine dimension.\\nCompare a [tabletop vacuum packaging machine](/products/heavy-duty-table-top-vacuum-packaging-machines) with a [double-door chamber machine with conveyor](/products/double-door-chamber-vacuum-machine-with-conveyor) using the same product and bag. Ask how loading, evacuation, sealing and unloading are handled in each quoted configuration.\\n\\nHow do you select the packaging material?\\nProvide the intended bag structure and supplier information. The bag must suit the product, sealing method and intended storage conditions. Ask the packaging supplier and your product-quality team to confirm those requirements; the machine name does not establish the correct barrier properties or storage life.\\nFor food applications, packaging trials do not replace a validated food-safety and shelf-life process. Keep product-specific storage and shelf-life claims outside the machine acceptance unless they have been separately established by the responsible specialists.\\n\\nWhat should the output trial measure?\\n- Accepted packs over the complete loading and unloading cycle.\\n- Seal integrity after cooling using an agreed test.\\n- Bag damage, product deformation and pack appearance.\\n- Changeovers and cleaning access appropriate to the application.\\n\\nHow should the enquiry be completed?\\nSend product and bag samples through [machine consultation](/services/consultation), including the delivery location and available utilities. The [vacuum trial checklist](/blog/vacuum-packaging-machine-seal-and-cycle-trial) helps define the practical evidence needed before accepting a chamber layout or production-capacity claim.\",\"leftImage\":\"/images/blog/vacuum-packaging-machine-chamber-and-bag-selection.webp\",\"leftImageAlt\":\"Vacuum Packaging Machines: Chamber and Bag Selection technical illustration\",\"rightImage\":\"/images/products/heavy-duty-table-top-vacuum-packaging-machines.png\",\"rightImageAlt\":\"Heavy Duty Table Top Vacuum Packaging Machines by Spectra Pack Machines\"}",
    "image": "/images/blog/vacuum-packaging-machine-chamber-and-bag-selection.webp",
    "seo_title": "Vacuum Packaging Machines: Chamber and Bag Selection",
    "seo_desc": "Compare chamber clearance, bag material and complete loading cycles before selecting vacuum packaging equipment.",
    "seo_keywords": [
      "Vacuum packaging machine",
      "double door chamber vacuum machine with conveyor",
      "heavy duty table top vacuum packaging machines",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "double-door-chamber-vacuum-machine-with-conveyor",
      "heavy-duty-table-top-vacuum-packaging-machines"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "vacuum-packaging-machine-seal-and-cycle-trial"
    ]
  },
  {
    "slug": "vacuum-packaging-machine-seal-and-cycle-trial",
    "title": "Vacuum Packaging Trials: Seals, Cycles and Handling",
    "excerpt": "Document loading, seal quality and product condition during a representative vacuum packaging machine trial.",
    "content": "{\"body\":\"A vacuum trial should evaluate the finished package and the work needed to produce it. Watching a chamber cycle does not show whether operators can load it consistently or whether the sealed package remains acceptable after handling. Agree the trial materials and inspection method in advance.\\n\\nHow should bags be loaded for the trial?\\nUse the supplier's instructions to position filled bags and keep the intended seal area clean. Record the number and arrangement of bags in the chamber. A demonstration with lightly filled bags may not represent production if your normal packs are larger, wetter or less uniform.\\nOn a [double-door vacuum machine with conveyor](/products/double-door-chamber-vacuum-machine-with-conveyor), clarify which transfers are included and which require operator work. On a [tabletop machine](/products/heavy-duty-table-top-vacuum-packaging-machines), time loading and removal alongside the machine cycle.\\n\\nWhat should be inspected after sealing?\\nInspect the entire seal after the prescribed cooling period. Look for contamination, folds, uneven sealing and bag damage near sharp product features. Apply the agreed package-integrity test; visual tightness around a product is not proof that every seal is sound.\\nRecord changes in product shape or appearance and involve the responsible product-quality team where necessary. Do not use a successful machine run to infer an untested shelf life or storage condition. Those are separate product-validation questions.\\n\\nWhich production figures are useful?\\nCount accepted packs, rejected packs and elapsed trial time. Record any interruption for bag preparation, chamber cleaning or product replenishment. Include a normal restart and a change between common pack formats using the approved procedure.\\n- Keep the bag specification with the setup record.\\n- Identify the machine configuration and approved settings.\\n- Record open items before factory acceptance.\\n\\nHow should ongoing issues be reported?\\nSend [after-sales support](/services/after-sales) the machine model, bag details and labelled pack photographs. The [chamber selection guide](/blog/vacuum-packaging-machine-chamber-and-bag-selection) helps distinguish a setup issue from a changed product or bag requirement that needs a new application review.\",\"leftImage\":\"/images/blog/vacuum-packaging-machine-seal-and-cycle-trial.webp\",\"leftImageAlt\":\"Vacuum Packaging Trials: Seals, Cycles and Handling technical illustration\",\"rightImage\":\"/images/products/heavy-duty-table-top-vacuum-packaging-machines.png\",\"rightImageAlt\":\"Heavy Duty Table Top Vacuum Packaging Machines by Spectra Pack Machines\"}",
    "image": "/images/blog/vacuum-packaging-machine-seal-and-cycle-trial.webp",
    "seo_title": "Vacuum Packaging Trials: Seals, Cycles and Handling",
    "seo_desc": "Document loading, seal quality and product condition during a representative vacuum packaging machine trial.",
    "seo_keywords": [
      "Vacuum packaging machine",
      "double door chamber vacuum machine with conveyor",
      "heavy duty table top vacuum packaging machines",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "double-door-chamber-vacuum-machine-with-conveyor",
      "heavy-duty-table-top-vacuum-packaging-machines"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "vacuum-packaging-machine-chamber-and-bag-selection"
    ]
  },
  {
    "slug": "packaging-conveyor-belt-slat-roller-selection",
    "title": "Packaging Conveyors: Belt, Slat and Roller Selection",
    "excerpt": "Choose conveyor surfaces and transfers around the product base, load, route and cleaning requirements.",
    "content": "{\"body\":\"A packaging conveyor is part of the handling process, not simply a moving length of equipment. The product base, weight, stability and destination determine which surface and route should be considered. Start with the complete flow between machines and workstations.\\n\\nWhen should belt conveyors be considered?\\nA [PVC belt conveyor](/products/pvc-belt-conveyor) or [modular belt conveyor](/products/modular-belt-conveyor) should be assessed against the pack's base, dimensions and support needs. Supply the lightest and smallest products as well as the heaviest. Ask the supplier to confirm surface suitability and cleaning requirements for the actual application.\\nDo not assume that a material name alone establishes suitability for direct food contact, washdown or every chemical. Specify the operating environment and request confirmation for the quoted belt, frame and components.\\n\\nWhen are slat or roller formats relevant?\\nDiscuss a [slat-chain conveyor](/products/heavy-duty-slate-chain-conveyor) or [U-type conveyor](/products/u-type-slate-conveyor) where the proposed route and product handling call for those arrangements. Confirm bend geometry, transfer conditions and any accumulation requirements with samples.\\nA [flexible roller conveyor](/products/flexible-roller-conveyor) or [heavy-duty roller conveyor](/products/heavy-duty-roller-conveyor) needs a compatible load base and enough support across the roller arrangement. A soft bag or short carton can behave differently from a rigid tote of the same weight.\\n\\nWhat belongs in the enquiry drawing?\\n- Product dimensions, weight and photographs of the underside.\\n- Travel direction, route length and transfer heights.\\n- Required rate, spacing and stop or accumulation behaviour.\\n- Operator access, cleaning needs and available floor space.\\n\\nHow is the choice verified?\\nUse representative packs to demonstrate transfers and normal stops. Ask [custom design support](/services/custom-design) to confirm unusual routes or interfaces. The [conveyor commissioning checklist](/blog/packaging-conveyor-transfer-commissioning-checklist) turns the selected layout into a practical site acceptance record.\",\"leftImage\":\"/images/blog/packaging-conveyor-belt-slat-roller-selection.webp\",\"leftImageAlt\":\"Packaging Conveyors: Belt, Slat and Roller Selection technical illustration\",\"rightImage\":\"/images/products/pvc-belt-conveyor.png\",\"rightImageAlt\":\"PVC Belt Conveyor by Spectra Pack Machines\"}",
    "image": "/images/blog/packaging-conveyor-belt-slat-roller-selection.webp",
    "seo_title": "Packaging Conveyors: Belt, Slat and Roller Selection",
    "seo_desc": "Choose conveyor surfaces and transfers around the product base, load, route and cleaning requirements.",
    "seo_keywords": [
      "Conveyor systems",
      "modular belt conveyor",
      "pvc belt conveyor",
      "u type slate conveyor",
      "heavy duty slate chain conveyor",
      "flexible roller conveyor",
      "heavy duty roller conveyor",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "modular-belt-conveyor",
      "pvc-belt-conveyor",
      "u-type-slate-conveyor",
      "u-type-slat-conveyor",
      "heavy-duty-slate-chain-conveyor",
      "heavy-duty-slat-chain-conveyor",
      "flexible-roller-conveyor",
      "heavy-duty-roller-conveyor"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales",
      "custom-design"
    ],
    "related_blog_slugs": [
      "packaging-conveyor-transfer-commissioning-checklist"
    ]
  },
  {
    "slug": "packaging-conveyor-transfer-commissioning-checklist",
    "title": "Conveyor Commissioning: Transfers and Product Stability",
    "excerpt": "Check short packs, uneven loads and coordinated stops when commissioning a packaging conveyor system.",
    "content": "{\"body\":\"Commissioning a conveyor system means checking how products move through the whole route. A successful empty run cannot reveal every unstable pack, transfer problem or accumulation issue. Use the actual product range and the agreed site layout during acceptance.\\n\\nWhich packs should be tested first?\\nInclude short cartons, tall containers, light packs and the heaviest regular loads. Photograph the base and record the centre of the load where its distribution is uneven. Verify the approved capacity and loading arrangement before the test; do not overload the conveyor to find its limit.\\nFor a [roller conveyor](/products/heavy-duty-roller-conveyor), observe support at transfers and changes in direction. For a [PVC belt](/products/pvc-belt-conveyor) or [modular belt conveyor](/products/modular-belt-conveyor), inspect product stability and the transition into downstream equipment.\\n\\nWhat should the transfer checks cover?\\nCheck the smallest pack crossing every interface, including the discharge of the upstream machine. Confirm the transfer height and gap against the design. Record tipping, snagging, scuffing and changes in orientation. A manual push that repeatedly rescues a pack indicates an unresolved interface problem.\\nWhere a [U-type slat route](/products/u-type-slate-conveyor) or [flexible roller section](/products/flexible-roller-conveyor) changes the line direction, test the intended working arrangement. Keep access and guarding in the configuration required for production throughout the demonstration.\\n\\nHow should coordinated stopping be reviewed?\\nAsk the supplier to demonstrate the approved response to a downstream stop and the subsequent restart. Confirm who supplies sensors, control interfaces and integration work. Operators should not reach into moving equipment to clear an accumulation during a test.\\n- Record acceptable product spacing and queue behaviour.\\n- Document interface responsibilities and open issues.\\n- Keep the final layout with the handover record.\\n\\nWhat happens after installation?\\nReview early production observations with [installation support](/services/installation). Revisit the [conveyor selection guide](/blog/packaging-conveyor-belt-slat-roller-selection) when product bases, weights or routes change, because a successful trial applies to the tested handling conditions.\",\"leftImage\":\"/images/blog/packaging-conveyor-transfer-commissioning-checklist.webp\",\"leftImageAlt\":\"Conveyor Commissioning: Transfers and Product Stability technical illustration\",\"rightImage\":\"/images/products/pvc-belt-conveyor.png\",\"rightImageAlt\":\"PVC Belt Conveyor by Spectra Pack Machines\"}",
    "image": "/images/blog/packaging-conveyor-transfer-commissioning-checklist.webp",
    "seo_title": "Conveyor Commissioning: Transfers and Product Stability",
    "seo_desc": "Check short packs, uneven loads and coordinated stops when commissioning a packaging conveyor system.",
    "seo_keywords": [
      "Conveyor systems",
      "modular belt conveyor",
      "pvc belt conveyor",
      "u type slate conveyor",
      "heavy duty slate chain conveyor",
      "flexible roller conveyor",
      "heavy duty roller conveyor",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "modular-belt-conveyor",
      "pvc-belt-conveyor",
      "u-type-slate-conveyor",
      "u-type-slat-conveyor",
      "heavy-duty-slate-chain-conveyor",
      "heavy-duty-slat-chain-conveyor",
      "flexible-roller-conveyor",
      "heavy-duty-roller-conveyor"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "packaging-conveyor-belt-slat-roller-selection"
    ]
  },
  {
    "slug": "liquid-filling-machine-product-bottle-selection",
    "title": "Liquid Filling Machines: Product and Bottle Checklist",
    "excerpt": "Prepare viscosity, foaming, bottle and fill-range details before choosing a liquid filling machine or integrated line.",
    "content": "{\"body\":\"A liquid filling machine should be chosen around the actual liquid and container together. A system that handles one free-flowing product may need a different configuration for a foaming, viscous or particulate product. Describe the product accurately before comparing machine offers.\\n\\nWhich liquid properties affect the enquiry?\\nProvide the product name, its behaviour at the intended filling temperature and whether it foams, drips or contains particles. Where available, share the relevant product and cleaning information with the supplier. Do not assume material compatibility or a particular filling principle from the machine's appearance.\\nFor a [six-head liquid filling machine](/products/6-head-liquid-filling-machine), ask which product types and fill ranges the quoted model supports. The number of heads alone does not define accuracy, usable output or the cleaning process.\\n\\nWhat container information is needed?\\nSupply minimum and maximum bottle dimensions, neck opening, material and target fill quantity. Include the lightest or least stable container. Explain whether containers arrive empty on a conveyor, are manually placed or form part of an [automatic liquid filling line](/products/automatic-liquid-filling-line-setup).\\nAsk about bottle positioning, nozzle arrangement, missing-bottle handling and drip management in the actual proposal. Clarify which functions and line interfaces are included instead of treating the word automatic as a complete scope description.\\n\\nHow should accuracy and capacity be compared?\\n- Agree a measurement method suitable for the product.\\n- Test each filling position with production bottles and liquid.\\n- Record accepted bottles, rejects and elapsed running time.\\n- Include replenishment, routine stops and format changes.\\n\\nWhat should be settled before purchase?\\nConfirm contact materials, cleaning method, utilities and the full supply boundary with [technical consultation](/services/consultation). Use the companion [fill consistency guide](/blog/liquid-filler-fill-variation-and-changeover-guide) to plan how settings and results will be documented. Any performance figure should be tied to the product, fill range and trial conditions under which it was demonstrated.\",\"leftImage\":\"/images/blog/liquid-filling-machine-product-bottle-selection.webp\",\"leftImageAlt\":\"Liquid Filling Machines: Product and Bottle Checklist technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/liquid-filling-machine-product-bottle-selection.webp",
    "seo_title": "Liquid Filling Machines: Product and Bottle Checklist",
    "seo_desc": "Prepare viscosity, foaming, bottle and fill-range details before choosing a liquid filling machine or integrated line.",
    "seo_keywords": [
      "Liquid filling systems",
      "automatic liquid filling line setup",
      "6 head liquid filling machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-liquid-filling-line-setup",
      "6-head-liquid-filling-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "liquid-filler-fill-variation-and-changeover-guide"
    ]
  },
  {
    "slug": "liquid-filler-fill-variation-and-changeover-guide",
    "title": "Liquid Fillers: Fill Variation and Product Changeovers",
    "excerpt": "Investigate fill variation using head-by-head measurements, product conditions and an approved changeover routine.",
    "content": "{\"body\":\"Fill variation is easier to investigate when results are recorded by filling position and time. A single average can hide one position that behaves differently from the others. Begin with a verified measurement method and the product conditions from the accepted trial.\\n\\nHow should fill results be recorded?\\nIdentify each filling position and take samples using the agreed sampling plan. Record the bottle, target quantity, product batch and relevant process conditions. If weighing is used, account for empty-container weight and use appropriate verified measuring equipment.\\nFor a [six-head filler](/products/6-head-liquid-filling-machine), compare positions individually as well as across the complete run. Note whether variation appears from startup, after a stop or as the product supply condition changes. This gives the supplier more useful evidence than a general report that the machine is inaccurate.\\n\\nWhat changes deserve attention?\\nCompare product temperature, foaming, viscosity and the supply arrangement with the approved setup. Check whether bottle dimensions or neck openings changed. Do not adjust every filling position to compensate for an unconfirmed measurement or product-supply issue.\\nUse only operator checks permitted by the installed manual. Access to moving mechanisms, pressurized components or electrical parts requires the prescribed shutdown and service procedure. Send the observed symptoms to [after-sales support](/services/after-sales) before replacing parts by guesswork.\\n\\nHow should product changeovers be planned?\\nUse an approved cleaning and changeover method matched to the product and machine. State who verifies cleaning, which parts are handled and how the first filled bottles are accepted. For an [integrated filling line](/products/automatic-liquid-filling-line-setup), include the downstream cap and label format in the changeover record.\\n- Record product and bottle identifiers.\\n- Preserve approved settings and inspection results.\\n- Track time to the first acceptable new-product bottle.\\n\\nWhen is a new application trial needed?\\nA materially different liquid or container may need supplier review. Use the [filler selection checklist](/blog/liquid-filling-machine-product-bottle-selection) to prepare the new brief instead of assuming that a previous recipe applies across the entire product range.\",\"leftImage\":\"/images/blog/liquid-filler-fill-variation-and-changeover-guide.webp\",\"leftImageAlt\":\"Liquid Fillers: Fill Variation and Product Changeovers technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/liquid-filler-fill-variation-and-changeover-guide.webp",
    "seo_title": "Liquid Fillers: Fill Variation and Product Changeovers",
    "seo_desc": "Investigate fill variation using head-by-head measurements, product conditions and an approved changeover routine.",
    "seo_keywords": [
      "Liquid filling systems",
      "automatic liquid filling line setup",
      "6 head liquid filling machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-liquid-filling-line-setup",
      "6-head-liquid-filling-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "liquid-filling-machine-product-bottle-selection"
    ]
  },
  {
    "slug": "auger-filler-powder-selection-and-quotation",
    "title": "Auger Filler Machines: Powder Selection and Quotation",
    "excerpt": "Describe powder flow, bulk-density variation, target weight and container format before requesting an auger filler quote.",
    "content": "{\"body\":\"An auger filler enquiry needs more detail than the name of the powder. Products that look similar can flow, aerate or settle differently, which affects dosing and handling. Prepare a representative sample and explain the normal condition in which material reaches the filling station.\\n\\nWhich powder information should you provide?\\nRecord the product, intended fill weight, particle characteristics and whether it tends to bridge, cling or create dust. Share relevant handling information with the supplier. If the product varies between batches, describe that variation and include samples where practical.\\nAsk how the proposed [auger filler machine](/products/auger-filler-machine) handles the application and which dosing components are included. Do not assume that one auger or one setup covers every powder and weight range in your catalogue.\\n\\nWhat should be specified about the package?\\nSupply the pouch, jar or container dimensions and opening size. State how the package is presented and supported during filling. Describe the upstream material feed and downstream sealing operation so the supplier can identify interfaces that need separate equipment or controls.\\nClarify which tasks remain manual. Weighing, container positioning, material replenishment and removal may affect practical output even when the dosing action is automated. Time the full work cycle during the trial.\\n\\nHow should performance be demonstrated?\\n- Use your actual powder and intended packaging.\\n- Agree the weighing method and sampling plan.\\n- Record variation over a representative run and after refilling.\\n- Inspect dust, spillage and contamination of the seal area.\\n\\nWhat should the quotation include?\\nConfirm the filling range, contact materials, change parts, cleaning access and product-handling provisions appropriate to the application. Ask [machine consultation](/services/consultation) to document the scope and trial criteria. The [auger filling consistency guide](/blog/auger-filler-weight-variation-powder-handling) explains which process observations help reproduce the approved result after the machine reaches your factory.\",\"leftImage\":\"/images/blog/auger-filler-powder-selection-and-quotation.webp\",\"leftImageAlt\":\"Auger Filler Machines: Powder Selection and Quotation technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/auger-filler-powder-selection-and-quotation.webp",
    "seo_title": "Auger Filler Machines: Powder Selection and Quotation",
    "seo_desc": "Describe powder flow, bulk-density variation, target weight and container format before requesting an auger filler quote.",
    "seo_keywords": [
      "Auger filler",
      "auger filler machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "auger-filler-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "auger-filler-weight-variation-powder-handling"
    ]
  },
  {
    "slug": "auger-filler-weight-variation-powder-handling",
    "title": "Auger Fillers: Weight Variation and Powder Handling",
    "excerpt": "Track powder condition, refill events and measured fill results when investigating auger filler variation.",
    "content": "{\"body\":\"Powder filling consistency depends on the material condition and the dosing arrangement together. When fill weights change, start by comparing the product and process with the accepted trial. A settings change may hide a material-feeding issue without resolving it.\\n\\nWhat should be recorded during a run?\\nUse a suitable verified weighing method and record individual samples according to the agreed plan. Note target weight, actual result, product batch and sampling time. Mark material-refill events and normal stops so variation can be compared with changes in the process.\\nFor the [auger filler](/products/auger-filler-machine), keep the installed dosing configuration and approved settings with the record. If a powder settles or aerates during handling, tell the supplier how it was stored and transferred before filling. Avoid describing a variable product simply as the same powder as last time.\\n\\nWhich observations help identify the cause?\\nNote bridging, irregular feed, clinging material or dust around the filling area. Record whether variation is random, develops gradually or follows a refill. Provide safe external photographs and the resulting pack weights. Do not reach into a hopper or moving dosing mechanism to inspect product behaviour.\\nCompare package presentation too. A narrow opening or poorly supported pouch can cause spillage, making the final pack weight appear low even when the dosing sequence is unchanged. Inspect the seal area for deposited powder before the package moves downstream.\\n\\nHow should a correction be evaluated?\\n- Change only supplier-approved operating parameters.\\n- Keep product and packaging conditions consistent during comparison.\\n- Repeat the agreed sampling plan after the change.\\n- Record rejects, spillage and complete workstation output.\\n\\nWhen should the supplier review the application?\\nAsk [after-sales support](/services/after-sales) to review persistent variation or a new powder. Use the [auger selection guide](/blog/auger-filler-powder-selection-and-quotation) to prepare product, package and cleaning requirements. A successful setup for one material should not be presented as proof of performance for every future powder.\",\"leftImage\":\"/images/blog/auger-filler-weight-variation-powder-handling.webp\",\"leftImageAlt\":\"Auger Fillers: Weight Variation and Powder Handling technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/auger-filler-weight-variation-powder-handling.webp",
    "seo_title": "Auger Fillers: Weight Variation and Powder Handling",
    "seo_desc": "Track powder condition, refill events and measured fill results when investigating auger filler variation.",
    "seo_keywords": [
      "Auger filler",
      "auger filler machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "auger-filler-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "auger-filler-powder-selection-and-quotation"
    ]
  },
  {
    "slug": "automatic-capping-machine-cap-bottle-compatibility",
    "title": "Automatic Capping Machines: Cap and Bottle Compatibility",
    "excerpt": "Match closure geometry, bottle support and cap presentation to the exact capping configuration being quoted.",
    "content": "{\"body\":\"A capping machine must handle the cap and bottle as a matched system. Closure dimensions, thread design, bottle stiffness and presentation affect the application. Send production samples of both parts before selecting an [automatic capping machine](/products/automatic-capping-machine).\\n\\nWhich closure details should be supplied?\\nProvide the cap type, dimensions, material and any liner or tamper-evident feature. Include the matching bottle finish and closure supplier's application guidance. Ask the machine supplier to confirm the capping method and tooling proposed for that exact combination.\\nDo not assume that all screw caps, press-on closures or trigger assemblies use the same machine arrangement. If you need several closure types, list each one separately and ask which change parts or alternative equipment are required.\\n\\nWhat is included in automatic capping?\\nClarify cap storage, orientation, feeding, placement and tightening in the supply scope. Ask which tasks remain operator responsibilities and how missing or incorrectly presented caps are handled in the quoted model. The machine title alone does not establish every included function.\\nProvide bottle height, diameter, filled weight and conveyor details. Lightweight or flexible bottles may need a different support arrangement from rigid containers. Test the least stable bottle and the closure combination most likely to challenge the line.\\n\\nWhat should the acceptance trial inspect?\\n- Cap seating, alignment and visible damage.\\n- Closure performance using the closure supplier's agreed method.\\n- Bottle stability and surface marking during handling.\\n- Normal replenishment, stops and format changes.\\n\\nHow should an order be specified?\\nAgree the exact cap-bottle combinations, tooling, line interfaces and measurement method through [technical consultation](/services/consultation). Keep accepted samples and written settings with the handover record. Use the [capping quality checklist](/blog/capping-machine-loose-caps-cross-threading-checklist) to define the defects to investigate during production instead of relying on appearance or hand feel alone.\",\"leftImage\":\"/images/blog/automatic-capping-machine-cap-bottle-compatibility.webp\",\"leftImageAlt\":\"Automatic Capping Machines: Cap and Bottle Compatibility technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/automatic-capping-machine-cap-bottle-compatibility.webp",
    "seo_title": "Automatic Capping Machines: Cap and Bottle Compatibility",
    "seo_desc": "Match closure geometry, bottle support and cap presentation to the exact capping configuration being quoted.",
    "seo_keywords": [
      "Automatic capping machine",
      "automatic capping machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-capping-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "capping-machine-loose-caps-cross-threading-checklist"
    ]
  },
  {
    "slug": "capping-machine-loose-caps-cross-threading-checklist",
    "title": "Capping Quality: Loose Caps and Cross-Threading Checks",
    "excerpt": "Investigate capping defects using matched bottle and closure samples, presentation records and an agreed inspection method.",
    "content": "{\"body\":\"Loose, tilted or damaged caps should be recorded as distinct defects. The cause may involve component dimensions, cap presentation, bottle support or the capping setup. Compare evidence from accepted and defective packs before changing the machine configuration.\\n\\nWhat should be checked about the components?\\nRecord cap and bottle suppliers, component codes and batch identifiers. Retain unused examples from the affected batches. Compare the bottle finish, closure thread and liner condition where applicable using the responsible quality team's inspection method.\\nA change in closure material or bottle dimensions may affect performance even when the marketing name is unchanged. Ask the closure supplier to confirm the application and inspection requirements for the specific combination used on the [automatic capping machine](/products/automatic-capping-machine).\\n\\nWhat should operators observe safely?\\nNote whether the cap is already tilted before tightening, whether the bottle moves unexpectedly and whether the defect repeats at a particular point in the run. Record startup, refill and restart conditions. Use safe external observation; do not hand-correct closures inside moving machinery.\\nKeep adjustments within the installed machine instructions. Access to tooling and driven components requires the prescribed shutdown and isolation method. Do not use repeated tightening adjustments as a substitute for checking cap placement and component compatibility.\\n\\nHow is a successful correction confirmed?\\n- Apply the agreed closure inspection or measurement method.\\n- Check visual condition and evidence of bottle or cap damage.\\n- Run representative production after normal replenishment.\\n- Record rejected packs and the conditions of the accepted setup.\\n\\nWhat should be sent to support?\\nShare labelled component samples, pack photographs, machine details and measured results with [after-sales support](/services/after-sales). The [cap compatibility guide](/blog/automatic-capping-machine-cap-bottle-compatibility) helps prepare the review when changing bottle sizes or closure types. Keep the final recipe tied to the tested components and retain the approval record for future production comparisons.\",\"leftImage\":\"/images/blog/capping-machine-loose-caps-cross-threading-checklist.webp\",\"leftImageAlt\":\"Capping Quality: Loose Caps and Cross-Threading Checks technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/capping-machine-loose-caps-cross-threading-checklist.webp",
    "seo_title": "Capping Quality: Loose Caps and Cross-Threading Checks",
    "seo_desc": "Investigate capping defects using matched bottle and closure samples, presentation records and an agreed inspection method.",
    "seo_keywords": [
      "Automatic capping machine",
      "automatic capping machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-capping-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "automatic-capping-machine-cap-bottle-compatibility"
    ]
  },
  {
    "slug": "bottle-labeling-machine-label-container-selection",
    "title": "Bottle Labeling Machines: Label and Container Selection",
    "excerpt": "Prepare container shape, label format, placement tolerances and infeed details before specifying a bottle labeling machine.",
    "content": "{\"body\":\"A labeling machine should be specified around the container surface and the label that must be applied. Bottle shape, surface condition and label presentation affect the finished result. Prepare the actual production components before comparing an [automatic bottle labeling machine](/products/automatic-bottle-labeling-machine).\\n\\nWhat container details matter?\\nProvide the bottle dimensions, material, filled weight and photographs of the intended label area. Identify tapers, recesses, seams and changes in cross-section. Explain whether the bottle arrives dry and clean or may carry condensation or product residue.\\nInclude the smallest and least stable container. A successful run with a large rigid bottle does not establish performance with every lightweight or shaped format. Ask the supplier which container geometries the proposed machine configuration supports.\\n\\nWhat should come from the label supplier?\\nSupply label dimensions, material, adhesive information and the roll or feed specification required by the proposed system. State the intended label position and acceptable alignment tolerance. Include variable print or code placement requirements where they affect the application.\\nConfirm the labeling method in the quotation rather than assuming that all bottle labelers use the same format. Container and label samples should be reviewed together so a mismatch is found before manufacture.\\n\\nHow does bottle handling affect the result?\\nDiscuss spacing, orientation and the transfer from upstream equipment. If an [automatic turntable](/products/automatic-turntable-machine) is part of the line, confirm its loading or accumulation role and the interface to the labeler. A turntable is not automatically a guarantee of controlled spacing at every downstream machine.\\n- Test label position over a representative run.\\n- Inspect bubbles, creases and edge lift after the agreed observation period.\\n- Include normal stops and bottle-format changes.\\n\\nWhat should the enquiry conclude?\\nUse [machine consultation](/services/consultation) to agree the complete supply scope. The [labeling and turntable changeover guide](/blog/bottle-labeler-turntable-spacing-changeover-guide) helps translate component compatibility into repeatable site operation.\",\"leftImage\":\"/images/blog/bottle-labeling-machine-label-container-selection.webp\",\"leftImageAlt\":\"Bottle Labeling Machines: Label and Container Selection technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/bottle-labeling-machine-label-container-selection.webp",
    "seo_title": "Bottle Labeling Machines: Label and Container Selection",
    "seo_desc": "Prepare container shape, label format, placement tolerances and infeed details before specifying a bottle labeling machine.",
    "seo_keywords": [
      "Bottle labeling and turntable handling",
      "automatic bottle labeling machine",
      "automatic turntable machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-bottle-labeling-machine",
      "automatic-turntable-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "bottle-labeler-turntable-spacing-changeover-guide"
    ]
  },
  {
    "slug": "bottle-labeler-turntable-spacing-changeover-guide",
    "title": "Bottle Labelers and Turntables: Spacing and Changeovers",
    "excerpt": "Check bottle presentation, accumulation and first-label approval when changing formats on a labeling line.",
    "content": "{\"body\":\"A labeling line needs stable bottle presentation through starts, stops and changes in demand. Problems that look like labeler faults can begin at the upstream transfer or accumulation area. Observe the bottle before label application as well as the finished label.\\n\\nWhat should be reviewed at the infeed?\\nRecord bottle spacing, orientation and stability as containers approach the [automatic bottle labeler](/products/automatic-bottle-labeling-machine). Note whether defects appear only when supply becomes irregular or after a downstream stop. Compare the actual conveyor arrangement with the accepted layout.\\nWhere an [automatic turntable machine](/products/automatic-turntable-machine) feeds or collects bottles, confirm its intended role and operating arrangement with the supplier. Ask how bottles transfer at the guide and conveyor interface and what happens when the next stage stops. Do not assume that an accumulation device also performs every spacing or sorting task.\\n\\nHow should a bottle and label changeover be recorded?\\nIdentify the new bottle and label codes, approved recipe and permitted guide adjustments. Use the supplier's safe changeover sequence for label replacement and any tooling work. Keep hands away from moving transfers and applicator mechanisms while the equipment operates.\\nInspect the first labelled bottles for height, alignment, wrinkles and adhesion using the agreed method. Confirm that printed information remains visible and correctly positioned. Time the change from the last accepted old-format bottle to the first accepted new-format bottle, including rejected trial labels.\\n\\nWhich issues should be logged separately?\\n- Bottles tipping, scuffing or arriving at uneven spacing.\\n- Labels skewed at application versus lifting afterward.\\n- Defects linked to startup, refill or a particular material batch.\\n- Extra operator intervention needed to keep production moving.\\n\\nWhen should the line be reviewed?\\nAsk [installation support](/services/installation) or [after-sales support](/services/after-sales) to review recurring interface problems. The [label and container selection guide](/blog/bottle-labeling-machine-label-container-selection) helps assess changed components. Keep approved settings and reference samples with the production record so later troubleshooting starts from a known setup.\",\"leftImage\":\"/images/blog/bottle-labeler-turntable-spacing-changeover-guide.webp\",\"leftImageAlt\":\"Bottle Labelers and Turntables: Spacing and Changeovers technical illustration\",\"rightImage\":\"\",\"rightImageAlt\":\"\"}",
    "image": "/images/blog/bottle-labeler-turntable-spacing-changeover-guide.webp",
    "seo_title": "Bottle Labelers and Turntables: Spacing and Changeovers",
    "seo_desc": "Check bottle presentation, accumulation and first-label approval when changing formats on a labeling line.",
    "seo_keywords": [
      "Bottle labeling and turntable handling",
      "automatic bottle labeling machine",
      "automatic turntable machine",
      "packaging machine guide",
      "Spectra Pack Machines"
    ],
    "product_slugs": [
      "automatic-bottle-labeling-machine",
      "automatic-turntable-machine"
    ],
    "service_slugs": [
      "consultation",
      "installation",
      "after-sales"
    ],
    "related_blog_slugs": [
      "bottle-labeling-machine-label-container-selection"
    ]
  }
]
$machine_blogs$::jsonb) AS article(
    slug text, title text, excerpt text, content text, image text,
    seo_title text, seo_desc text, seo_keywords text[],
    product_slugs text[], service_slugs text[], related_blog_slugs text[]
  )
)
INSERT INTO public.blogs (
  slug, title, excerpt, content, image, seo_title, seo_desc, seo_keywords,
  product_slugs, service_slugs, related_blog_slugs,
  featured_product_id, category_id, published, created_at, updated_at
)
SELECT a.slug, a.title, a.excerpt, a.content, a.image, a.seo_title, a.seo_desc,
  a.seo_keywords, a.product_slugs, a.service_slugs, a.related_blog_slugs,
  p.id, p.category_id, true, now(), now()
FROM articles a
LEFT JOIN LATERAL (
  SELECT product.id, product.category_id FROM public.products product
  WHERE product.published = true AND product.slug = ANY(a.product_slugs)
  ORDER BY array_position(a.product_slugs, product.slug)
  LIMIT 1
) p ON true
ON CONFLICT (slug) DO UPDATE SET
  title = EXCLUDED.title,
  excerpt = EXCLUDED.excerpt,
  content = EXCLUDED.content,
  image = EXCLUDED.image,
  seo_title = EXCLUDED.seo_title,
  seo_desc = EXCLUDED.seo_desc,
  seo_keywords = EXCLUDED.seo_keywords,
  product_slugs = EXCLUDED.product_slugs,
  service_slugs = EXCLUDED.service_slugs,
  related_blog_slugs = EXCLUDED.related_blog_slugs,
  featured_product_id = EXCLUDED.featured_product_id,
  category_id = EXCLUDED.category_id,
  published = EXCLUDED.published,
  updated_at = now();

-- Fill missing metadata only; preserve deliberate CMS wording.
UPDATE public.products
SET seo_title = COALESCE(NULLIF(btrim(seo_title), ''), title),
    seo_desc = COALESCE(NULLIF(btrim(seo_desc), ''), left(short_desc, 160))
WHERE NULLIF(btrim(seo_title), '') IS NULL OR NULLIF(btrim(seo_desc), '') IS NULL;

COMMIT;

-- Confirm the migration's 30 slugs are present (existing matching rows included).
SELECT slug, published, seo_title, image,
  cardinality(product_slugs) AS related_machines,
  cardinality(service_slugs) AS related_services
FROM public.blogs
WHERE slug IN ('shrink-tunnel-machine-sizing-and-price-guide',
  'shrink-tunnel-loose-film-burn-holes-guide',
  'automatic-bottle-web-sealer-bundle-pattern-selection',
  'bottle-shrink-line-factory-acceptance-checklist',
  'semi-automatic-web-sealer-output-and-staffing',
  'semi-automatic-web-sealer-film-changeover-guide',
  'carton-shrink-wrapping-vs-taping-strapping',
  'carton-packing-line-transfer-and-size-change-guide',
  'l-sealer-machine-film-size-product-clearance',
  'l-sealer-seam-quality-production-trial',
  'shrink-sleeve-applicator-bottle-label-compatibility',
  'shrink-sleeve-machine-wrinkles-changeovers',
  'horizontal-vertical-band-sealer-pouch-selection',
  'band-sealer-weak-seals-material-and-feeding',
  'foot-impulse-tube-sealing-machine-selection',
  'foot-impulse-sealer-repeatable-seals-checklist',
  'pallet-stretch-wrapper-load-size-film-selection',
  'pallet-wrapper-unstable-load-trial-guide',
  'vacuum-packaging-machine-chamber-and-bag-selection',
  'vacuum-packaging-machine-seal-and-cycle-trial',
  'packaging-conveyor-belt-slat-roller-selection',
  'packaging-conveyor-transfer-commissioning-checklist',
  'liquid-filling-machine-product-bottle-selection',
  'liquid-filler-fill-variation-and-changeover-guide',
  'auger-filler-powder-selection-and-quotation',
  'auger-filler-weight-variation-powder-handling',
  'automatic-capping-machine-cap-bottle-compatibility',
  'capping-machine-loose-caps-cross-threading-checklist',
  'bottle-labeling-machine-label-container-selection',
  'bottle-labeler-turntable-spacing-changeover-guide')
ORDER BY slug;
