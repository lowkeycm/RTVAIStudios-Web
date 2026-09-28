# Cinematic redesign implementation

September 27, 2026. Implements the approved direction recorded in `cinematic-site-plan.md`.

## Delivered

- A six-screen hero installation with varied depth, architectural lighting and scroll parallax. Selecting a screen enlarges that same surface and plays the film there. Escape closes it and returns keyboard focus. Only two optimized, silent seven-second previews run in the ambient hero.
- Four visible service comparison rows with the original service lead-ins, prices, examples and direct detail links. There are no comparison tabs.
- Distinct featured videos play in place, with a portrait frame for the vertical episode. Staff-managed featured selections remain supported.
- One connected Work gallery, covering the 13 imported films. Shared transport position drives the film-strip surfaces and both reel spools. Next/Previous, keyboard arrows, thumbnails and horizontal touch gestures select films. The reel stops when the selected film settles. Changing a film after playback starts continues playback on the next selected film.
- Custom modeled reel geometry with an animated image fallback for unavailable WebGL. Native video sits on the CSS perspective film-strip surface; the video is not a WebGL texture. The reel spools use Three.js and GLB geometry when supported.
- Type, industry and search filters, a recoverable empty state, disabled transport for a single-film selection, and preserved filters/scroll position when returning from service details.
- The existing dimensional service devices and physical remote remain available on service pages. Home comparisons link back to their originating offer.
- Consistent dark metal controls, lit graphite surfaces, warm/cool architectural lighting, normal page scrolling and motion pause/reduced-motion behavior.

## Copy and commercial facts

Restored the original hero supporting copy, studio invitation/body and closing copy. Retained the user-requested format-selection heading instead of restoring the rejected “What if you went bigger?” heading. Restored all four original service lead-ins. The catalog and pricing facts are unchanged: $500, $1,000, $1,500 and $1,800 for the four one-off offers, and the existing $1,250 monthly entry point. Video imports do not import prices from the original public site.

## Browser verification

- Desktop hero: six screens present; selected film advanced in time and reported ready playback; ambient previews paused while a film played; Escape returned focus; motion pause toggled correctly.
- Featured: Boring to Epic played in place; other full films remained unloaded/paused. Portrait/landscape presentation inspected visually.
- Work: selection advanced with a changed spool transform and shared transport position. Video playback continued after Next. Previous wrapped from first to last. Type/industry filters produced the expected counts; a single-film selection disabled both arrows. Empty search offered recovery. Service navigation and Back retained the prior type/industry query.
- Phone-width layout: tested using a temporary 390px browser iframe. The rendered content width and scroll width both measured 375px, with no horizontal page overflow. All four offers remained visible, service navigation worked, the remote advanced its selected film, and the Work transport advanced its film counter.
- The temporary responsive test page was removed before packaging.

Limits: the inspection browser cannot create a WebGL context. Its animated fallback was exercised; actual GPU-rendered reels/devices still need a hardware browser check. This was responsive browser QA, not a real-phone performance or touch test. Playback sampling does not establish uninterrupted playback of every complete film. The local preview used the existing fallback film catalog because its local database lacked the deployed videos table; no production database schema/data changes were made.

## Assets and performance choices

Custom reel source, model and reference render are preserved in `assets/cinema` and `public/studio/reel`. The new architectural background prompt/provenance is recorded in `assets/cinema`. Reel GLB is approximately 2.8MB and dynamically loaded on Work; rendering is suspended offscreen and only redraws when transport position/size changes. The two short local hero MP4 previews total approximately 1.1MB; full original films load on deliberate playback. The shared image fallback uses the same modeled reel. No new package dependency was introduced.

`cinematic-home.jpg` records the inspected desktop hero. TypeScript validation and production packaging are run by the site publication workflow against the final source state.
