# RTV: cinematic website correction plan

Review date: September 26, 2026. This records the approved design plan and its original audit. Implementation and verification on September 27 are recorded in `cinematic-build.md`. Marketing copy and package facts are protected as described below.

## Basis and findings

Reviewed Marketing-Hub's Website System, design research/router, conversion architecture, copy and claims, editorial calibration, interactive 3D and website QA guidance, plus Scroll Craft's integration and layered-hero guidance. The governing principles are clear customer paths, physical depth with coherent lighting, purposeful interactions, protected copy, and a working prototype before expanding demanding 3D.

Inspected the current rendered homepage, switched format tabs, inspected the Work gallery, read the corresponding components, and compared the first saved redesign (`5e00b4d`) with the current version (`8626fbc`). This is a desktop audit; the proposed experience has not been built or tested on phones.

- The format selector exposes four labels but only one offer's explanation and price. Visitors must switch tabs and remember earlier panels to compare. It also leaves a large quiet column beside a text-heavy panel.
- The hero and featured section reuse the same two films. The source gallery has 13 distinct published films. Native video metadata loaded for all 13 in the original gallery, with no reported media errors; this does not establish uninterrupted playback of every full film.
- The reel is a static PNG behind a separate styled video element. There is no rotating model, film feed, next/previous sequence, or filtered playlist. A hover transform cannot deliver the requested mechanism.
- Existing backgrounds have subtle gradients but lack a coherent physical environment, foreground/background separation, and believable light interacting with the objects.
- Buttons have limited material treatment. The supplied reel reference illustrates an object; it is not an editable 3D asset.
- The original supporting copy, studio invitation, closing line, and service presentation changed during layout edits. Those changes were not required by the navigation requests.

## Recommended direction

A premium projection and editing room, expressed through graphite surfaces, brushed metal, warm projector light and the existing RTV accent colors. Video supplies the color and movement. Scope the richest interactions to the hero and Work reel. Keep navigation, comparison, pricing and booking immediate and familiar.

### 1. UI and scrollability

Homepage sequence: multiscreen introduction → visible comparison of video types → distinct featured work → studio/creative direction → inquiry. Each section has one job; do not ask visitors to choose their format twice.

Replace section 2's tabs with four compact, fully visible comparison rows. Each row contains a real film still/play control, the existing service name and strongest original line, one plain-language use case, the established price, and a direct next step. No click is needed to discover the differences. Desktop aligns these fields for scanning; mobile stacks each row in a consistent reading order with the action immediately after its explanation. Visitors can watch the example there, read service details, or start an inquiry with the service carried forward.

Keep a compact sticky navigation with Work, video types, pricing and the existing inquiry action. Preserve gallery filters and scroll position on return from a service page. Show a visible back link with an understandable destination. Keep normal vertical scrolling; scene interactions must not seize the wheel or require dragging to continue.

The hero uses six varied preview screens with one visually dominant screen, rather than two oversized identical panels. Selecting one brings that actual display forward and plays inside its screen area; closing returns it to its position. It must not produce another player-shaped box around the display. Limit simultaneous decoded previews and use optimized short preview clips/posters; full films load on deliberate play.

Featured videos play where they sit. Curate a different mix from the hero and avoid repeating the same clip throughout the page. Service pages retain the specific 3D devices and provide offer-specific depth instead of repeating the entire Work gallery.

### 2. Movie-themed depth

Design the scene in separate planes: a softly lit architectural background; the multiscreen assembly; readable text and controls; and a restrained foreground edge/light atmosphere. Author their perspective and lighting together. Visible device thickness, recesses, bevels, occlusion, reflections and soft cast shadows make the spatial relationship credible before anything moves.

During a short initial scroll, the rear wall moves slowly, the display assembly shifts slightly faster, and the foreground edge passes sooner. The headline remains readable. The scene settles into the offer comparison without a long pinned interlude. Featured work can use a brief film-strip alignment transition; comparison text remains stable.

Carry the same projector-light direction and material family through section transitions, but vary composition and brightness. Use dark graphite, a lit metal comparison surface, and a warmer studio section to establish rhythm. Restrained grain and light falloff support the scene; avoid looping decorative particles or a glow around every element.

On phones, use a separately composed layered scene with fewer active videos. Reduced motion keeps the complete dimensional composition and uses direct state changes. Stop animation and video decoding offscreen.

### 3. Buttons and controls

Build a consistent family inspired by editing-console transport keys: a visible bevel, slightly recessed base, fine material texture, small edge highlight, and a short physical press. Primary actions receive an illuminated amber/RTV-accent edge; secondary actions use darker metal with clear text. Hover brightens the edge gently; keyboard focus is unmistakable; pressing moves the face into the base. No automatic sound effects.

Use play, pause and next/previous symbols for those actual actions. Keep inquiry and offer labels clear. Reserve film perforations for the gallery and remote styling for device controls. Maintain at least 44px touch targets. The existing remote should have a physical body and recognizable channel/transport controls tied to the active display.

### 4. A reel that actually works

The Work filters create an ordered playlist. Present one functional 3D reel assembly with a curved film strip carrying the selected film and neighboring film previews. The active film plays directly on the aligned strip frame; the reel, strip and picture share one perspective and lighting system.

Next/previous, a horizontal swipe, or selecting a thumbnail advances the same mechanism: pause the old film, rotate the reel, feed the strip forward one position, bring the next frame into the readable position, update the title/counter, and allow playback there. Aim for a short transition around half a second, tuned in the prototype. Do not replace the image while leaving the reel stationary. Never advance merely because someone scrolls the webpage.

Visible thumbnails and a “3 of 8” position let customers jump directly to a film. Filters rebuild the playlist and show the number of results. With one film, next is disabled; with no films, show a useful reset. Previous reverses the same motion. Keyboard controls and ordinary labeled buttons provide the same functionality as dragging. Watching a film must not be interrupted by an automatic carousel.

Use actual modeled reel depth and separate rotating parts, a curved film-strip mesh, and the project's existing 3D renderer. The reference PNG is an art-direction reference only. The video and transport controls remain functional when 3D cannot run; that fallback is explicitly a simpler gallery.

Prove this first with three actual films and the real target assets. Inspect forward/backward, rapid repeated input, filtering mid-transition, video play/pause, navigation away/back, loading failure, unavailable graphics, phone layout and reduced motion. A static screenshot or a successful build does not prove this interaction.

## Copy protection

Use the earliest saved redesign as the comparison baseline, subject to the user's later corrections. Preserve current approved commercial facts separately: the original public site has different package prices and durations, so importing its videos does not import its offers.

| Location | Earlier saved wording | Current wording | Proposed handling |
|---|---|---|---|
| Hero headline | Your brand. Impossible to ignore. | Retained | Lock |
| Hero supporting copy | AI-powered commercials, characters, and worlds. Built around what makes your business different. | Commercials. Spokespeople. Original series. Your story, made for the screen. | Restore earlier wording in the design revision |
| Service lead-ins | Stop the scroll. / Think beyond the shoot. / Give your brand a face. / Build a world worth following. | Replaced in selector by generic format titles | Bring original lines back beside clear format labels |
| Studio invitation | A little unexpected. Entirely your brand. | Your business. Our creative obsession. | Restore earlier wording |
| Studio body | Technology opens the door. Creative direction makes it worth walking through. We bring the idea, the production, and the attention to detail. | We shape the concept, build the production, and refine the details with you. | Restore earlier wording |
| Closing | Let's make some noise. / Tell us about your business. We'll find the story. | Let's make your next video. / Tell us what you want people to know, feel, or do. | Restore earlier wording |
| Format section heading | What if you went bigger? | What does your video need to do? | Preserve the user's correction toward selecting the needed video; do not restore the rejected heading |

Separate content from layout before implementation. Review every copy diff against this table and the preserved baseline. Permit necessary navigation/playback labels; do not rewrite headlines, body copy, offers or claims as an incidental styling change. Flag any proposed substantive copy change explicitly.

## Research evidence and limits

This is a focused correction plan with an already selected movie theme, so the research sample is deliberately narrow. Inspection date: September 26, 2026.

| Reference | Evidence inspected | Useful adaptation / limitation |
|---|---|---|
| https://www.umifilms.it/ | Rendered desktop hero and page DOM | Warm practical-light perspective creates cinema atmosphere while readable navigation and two clear actions remain visible. Adapt coherent light and depth to RTV's own studio environment. Deeper scroll interaction was not verified after a browser gesture timeout. |
| https://21st.dev/@cult-ui/components/texture-button | Rendered component preview and enabled primary-button interaction | Bevels, inset shadows and edge highlights make buttons feel tactile. Adapt the material construction to a restrained production-console family; do not copy the multicolor set. Hover/focus/pressed visual states still need RTV-specific QA. |
| https://unseen.co/ | DOM and loading-state screenshot | The runtime remained at its intro during inspection. Do not cite its 3D behavior as verified evidence; use the delay as a reminder to keep RTV's content/actions immediately usable. |
| Awwwards / Godly discovery | Awwwards search found IL CAPO Production, but opening the entry timed out. Godly's Unseen entry redirected to Recent. | Neither was treated as a verified live interaction reference. |

## Production order and acceptance

1. Import the 11 additional existing gallery films and retain their original title/source pairings. Generate real frame posters. Document inferred format tags; do not claim these were source-gallery classifications.
2. Preserve the earlier copy baseline and reconcile any commercial facts only with the existing approved catalog.
3. Build the functional reel prototype with three real videos and final-quality geometry/materials. Resolve its interaction before styling the rest of the gallery around it.
4. Rebuild section 2 as a visible comparison, including direct play, service context and return navigation.
5. Apply the coherent cinema environment, short hero scroll choreography and tactile controls; distinguish hero, featured work and service demonstrations.
6. Review the complete customer journey at desktop and phone sizes: identify an offer, watch an example, filter work, return from a service and reach the inquiry flow. Check copy diffs, controls, load behavior and failure states. Test on a real phone before claiming mobile 3D performance.

Suggested prototype budgets, to be measured rather than claimed: readable content/poster within 2.5 seconds on a representative mobile connection; interaction response within 100ms before the authored transition; one audible video at a time; no 4K originals autoplaying in the hero; no horizontal page overflow or wheel trapping. Use a compressed model and measured asset budget after the first representative prototype.

The design revision is complete only when all four offers can be compared without opening tabs, videos play in their intended surfaces, the reel visibly advances the selected film, the background has observable spatial layers, and the protected copy matches the agreed baseline.
