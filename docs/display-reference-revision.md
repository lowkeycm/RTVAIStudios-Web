# CRT and tablet reference revision

Requested September 26, 2026: use the supplied tube-TV and tablet references, remove the tablet stand, and reveal physical side/top surfaces when turning the displays.

## Website behavior

- The player remains the device itself, directly on the page.
- Initial live camera view is about 15 degrees from the right and 10 degrees above.
- Drag range widens to roughly 39 degrees left/right and 26 degrees above, exposing modeled depth.
- Native video stays projected onto the screen corners through camera movement.
- Resize preserves the chosen view angle while fitting the display to its available width.
- Matched transparent renders provide the existing non-WebGL fallback without pretending a rotated flat image is a 3D model.

## Model specifications

The CRT uses a deep tapered cabinet with a silver front, two channel-style dials, speaker grille, top/rear vents and rabbit-ear antennas. Its video aperture is 0.432 × 0.324 m (4:3).

The tablet uses a black bezel and rounded metal body, with a 0.1485 × 0.198 m video aperture (portrait 3:4). There is no stand or pedestal. Impossible and Universe assets are preserved.

## Export checks

The exported CRT measures approximately 0.667 × 0.631 × 0.470 m including antennas. The tablet measures 0.191 × 0.248 × 0.016 m. Both have planar front-facing video meshes. Geometry inspection confirmed no tablet stand or pedestal.

## Review boundary

The inspection browser reports WebGL disabled. Browser checks can verify fallback composition and playback. Angled model renders and geometry bounds must establish depth; live browser rotation still needs verification on a WebGL-capable device.

## Completed review

- Both replacement GLBs and matching 980 × 700 transparent WebP renders are integrated using fresh asset URLs. Render projections use a 15-degree right / 8-degree above camera.
- Visually checked CRT and tablet screen alignment in the managed preview. Both devices sit directly on the page with no outer player frame.
- Tablet video loads at its original 1920 × 1080 aspect ratio, letterboxed within the portrait screen rather than stretched or cropped. Native controls are disabled; the physical remote operates playback.
- Existing empty-channel behavior remains in place for The Spot, which has no published films in the current collection.
