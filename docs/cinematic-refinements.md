# Cinematic refinement and cast integration

September 26, 2026, New York time. Follows the user's review of the first cinematic build.

## Changes

- Hero screen buttons cover their complete display surface. The shared 3D hit-test context is flattened while each screen retains its perspective and authored placement. Decorative media cannot intercept pointer events. Selecting a screen stops that opening click from reaching the new click-away listener. Clicking outside the selected screen closes it; native controls inside remain usable. Escape, the visible close control and focus restoration are retained.
- The reel stage now reserves space in proportion to its width instead of using a capped height. The active native video fills a definite screen rectangle, including its controls. An external Play/Pause control and a separate Stop-and-rewind control remain visible beneath the reel. Stream embeds use Stop rather than claiming a pause capability unavailable through their iframe. Reel transport remains separate from playback.
- The homepage's separate featured-video section is removed. A compact Browse all films link connects the comparison section to Work. The hero retains support for staff-selected featured films as well as the curated default installation.
- Shared lit, textured studio surfaces, an embossed RTV wordmark, restrained parallax and reveal-on-entry motion extend to the comparison, closing, Work support area, studio and pricing. All four comparison rows and their content remain intact. Motion pause/reduced-motion paths retain visible content and disable these transforms.
- Public pricing cards use their existing service colors across borders, backgrounds, titles and controls. Monthly programs use the matching service color. Catalog facts, copy and terms are unchanged; the embedded staff rate sheet retains its prior layout treatment and print support is preserved.
- A compact cast preview links from the homepage studio invitation to a six-character cast section on Our Studio. The supplied cast is explicitly identified as fictional. Names, portraits and short personality introductions come from the uploaded deck. Detailed personal backstories, relationship notes and unapproved draft canon are not published. The cast section links to Brand Universe without claiming that the supplied cast is included in every offer.

## Asset provenance

The six headshots were extracted directly from the embedded JPEGs in the supplied `rtv_cast_deck (1).html`. They are stored under `public/studio/cast`. The uploaded deck itself was not modified or copied into the public site. No replacement likenesses were generated. The existing architectural background is reused for the surface system.

## Validation and limits

Source review covered click propagation, pointer targets, playback state and stop behavior, observer/listener cleanup, reduced motion, filtering compatibility, copy protection and print styles. TypeScript and the production build are run against the final source state by the publication workflow. No dependency, database, offer or sharing changes are required.

Fresh browser QA could not run: the managed preview reported running, but browser navigation returned `ERR_BLOCKED_BY_CLIENT`; the recovery attempt was rejected by browser security policy. No alternate browser route was used. Consequently this revision does not claim verified live hit-testing, responsive screenshots, or WebGL rendering. The earlier build's browser checks and screenshot are historical evidence only, not verification of this revision.
