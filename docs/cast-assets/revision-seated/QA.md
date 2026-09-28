# Cast revision QA

Generated with built-in image_gen, exactly two requests issued concurrently. No site files were changed.

## Truth cutout
- Original PNG: 1024 × 1536, RGBA, 1,641,792 bytes.
- Optimized WebP: 141,792 bytes; decoded alpha is byte-for-byte identical to the generated PNG alpha.
- Inspected against white and dark backgrounds: clean visible extraction, complete head and shoes, no visible floor or detached shadow, original standing pose and wardrobe retained.
- Neutral serious expression, bald scalp, brow, mouth, subtle goatee and necklaces follow the original references. Generated likeness still requires the user's subjective approval; it is not a deterministic extraction of original face pixels.
- Original generated alpha ranges from 0–254. This was preserved unchanged in the WebP, with no thresholding or recoloring.

## Seated reception scene
- Original PNG: 1672 × 941, RGB, 2,067,106 bytes (approximately 16:9).
- Optimized WebP: 253,274 bytes.
- Truth is seated in the central orange chair and Jen in the right orange seat, with bent legs, supported hips/backs, plausible chair occlusion, warm lighting, and table occlusion.
- Two left-side standing strangers removed; the left entrance and floor remain quiet and usable for page copy.
- Room architecture, reception attendant, RTV / AI STUDIOS sign, ceiling lighting, orange furniture, coffee table, and dusk window view retained closely.
- Both faces remain neutral and recognizable to references, but generated photographic likeness is not exact source-pixel preservation.
- Limitation: the generator returned 1672 × 941 despite the requested 2048 × 1152 or higher. The original and optimized deliverables preserve native resolution without synthetic upscaling.

## Deliverables
- truth-washington-faithful.png
- truth-washington-faithful.webp
- reception-truth-jen-seated.png
- reception-truth-jen-seated.webp
- prompt-manifest.json (complete final prompts and input image paths)
- asset-metadata.json
- qa-truth-on-white.jpg and qa-truth-on-dark.jpg (inspection previews only)

