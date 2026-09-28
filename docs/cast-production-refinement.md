# Cast and production-page refinement

Implemented September 27, 2026. Existing marketing copy, package facts, film catalog, and prices are preserved.

- The reel's image spools remain until the live renderer confirms nonempty model pixels. A lost WebGL context restores the images. The live reel positions now sit higher behind the film strip. Fallback reels and live reels use the same transport position.
- Pointer dragging advances the film strip and both reels; a drag does not trigger a stray play click. Vertical touch scrolling and native video controls remain available. Arrow buttons and keyboard navigation remain available.
- Six new transparent full-body poses use the supplied cast references. Original generated images and reference images are retained in assets/cast-production; optimized WebPs are in public/studio/cast/poses. Character images total about 806 KB. Prompts and asset validation are in docs/cast-assets.
- Our Studio now has a scroll-driven perspective orbit. Position changes animate transforms without React rendering every frame. It pauses offscreen, respects reduced motion, and includes named character selection and previous/next controls.
- Cast appearances are integrated into Home, Work, Pricing, and all four service pages. Each service page keeps its working display and gains architectural texture, offer-color lighting, scroll reveals, a film selector shelf, and a presenter scene.
- Video types uses a dark, beveled Radix menu with four service destinations and comparison navigation. Keyboard behavior, current-page indication, and mobile navigation are retained.
- Supplied logo art replaces the header/footer placeholder. The white-background version is used for print. Our Studio plays the supplied logo animation once, muted, with a replay button. Optimized logo/video assets are under public/brand; supplied originals are under assets/brand-originals.

## Verification

TypeScript and whitespace checks pass. Browser checks verified dragging from film 1 to 2 without starting playback, Play/Stop-and-rewind, persistent fallback reel visibility, cast changes with scrolling and buttons, pause/resume and named selection, logo playback, and all four service links. Desktop screenshots reviewed the Home cast scene, Studio orbit, service set, and reel controls. A temporary 390px iframe viewport verified the mobile orbit and dropdown; content width and scroll width both measured 375px. The temporary review route was removed.

The review browser does not provide WebGL, so the live GPU reel path cannot be visually verified here. Its visible fallback was verified, and the rendering handoff now checks actual nonempty pixels. Phone-width review establishes responsive layout, not real-device touch or GPU performance.
