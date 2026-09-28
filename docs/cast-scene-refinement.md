# Cast interaction and seated scene

September 27, 2026. Replaces the scroll-controlled cast sequence introduced in the prior revision.

- Truth's portrait was regenerated from the supplied full-body and face references, retaining the original expression, stance, black clothing, jewelry and white shoes. The new URL is versioned so previously cached imagery cannot hide the correction.
- The homepage's two overlaid figures are removed. One generated photograph integrates Truth and Jen into the existing lounge chairs with matching room lighting, seated perspective and furniture occlusion. The room's left side remains available for copy. Desktop and mobile use the same scene with responsive framing.
- The Our Studio cast stage now responds to horizontal mouse/pointer drags, touch swipes, arrow buttons, direct character selection and keyboard arrows/Home/End. It has no page-scroll event listener, sticky panel or multi-viewport scroll spacer. Vertical touch gestures retain native page scrolling. Reduced motion retains immediate selection.
- Removed the animated logo from Our Studio and its unused component. Supplied original files remain archived.
- The navigation's Let's talk link now uses a bright cyan face, dark lettering, raised edge and visible keyboard focus.
- Existing marketing copy, package facts, pricing, and other video/player behavior remain unchanged. Only the cast's interaction instruction changed.

## Review

Browser checks verified a mouse drag advancing Truth to Jen, with subsequent vertical scrolling leaving Jen selected and bringing the next section into view. The same was checked in a 390px iframe viewport. Its content and scroll widths both measured 375px. The corrected portrait loaded with clean transparency. Our Studio had no logo video. The brighter CTA and integrated lounge image were visually inspected. This is responsive browser review, not a physical phone test. The temporary review route was removed.

The two requested assets were created using built-in image generation. Optimized site assets: `public/studio/cast/poses/truth-washington-faithful.webp` and `public/studio/reception-truth-jen-seated.webp`. Original outputs are retained under `assets/cast-production/revision-seated/`. Exact prompts, reference roles, metadata and image QA are in `docs/cast-assets/revision-seated/prompt-manifest.json`, `asset-metadata.json`, and `QA.md`. The native lounge output is 1672×941; it was not artificially upscaled. The review screenshot is `docs/seated-lounge-review.jpg`.
