# Video-first site structure — September 26, 2026

This revision replaces the repeated TV/channel layout across the homepage and Work page with three distinct jobs.

- **Homepage:** a perspective multiscreen video wall; clicking a screen expands and plays that film in the hero. A goal-based format selector changes in place. Featured films play directly in their cards. The studio introduction stays secondary.
- **The Work:** a physical reel treatment using the supplied film-reel reference, with playable filmstrip cards. Video type, industry and text search combine. Options derive from published film records; no invented industry work or sample clients. Empty filters can be cleared in one action. Query-string filters render correctly on arrival.
- **Service pages:** the real GLB display models and their aligned video apertures now live here. Package-specific inclusions, prices, scope, timing, and booking links have a purpose separate from browsing the film library. A return link, breadcrumb, and persistent main navigation provide a way back. The chosen format is retained when returning to the homepage selector.

## Motion and playback

- Muted video previews animate the hero only while visible. Selecting a film pauses background previews.
- Hero screens lift with perspective and scroll. Featured films have staggered scroll movement; the studio image has restrained parallax. Reel film frames level out on hover/focus and while selected.
- Manual Pause motion and system reduced-motion preferences stop ambient previews and decorative movement. Interaction controls remain usable.
- Starting another inline film pauses the previous native video. Offscreen inline videos pause. Stream embeds are mounted only when selected and removed when another player starts or the embed leaves the viewport.
- No homepage or Work action routes a visitor elsewhere just to play a film.
- The remote is scoped to service pages, with functioning screen controls. Its format keys navigate to the corresponding service; they do not silently change the package being described.

## Checks

Verified in the managed browser: hero expand/play/close, ambient pause, featured inline play, pausing a previous film, type and industry filters together, empty results/reset, reel inline playback, service tablet playback, and service-to-gallery and service-to-format return paths. Phone-width checks covered hero playback with motion paused, format selection, navigation, gallery filters/playback, and horizontal overflow. A temporary iframe review route was used for a real 390px layout viewport and removed before publication.

The browser disables WebGL; this revision reuses the previously checked model exports and their transparent fallback renders. Live GPU rotation remains outside that browser's verification capability. The existing CRM, pricing commitments, consent/publishing rules, and lead workflows are preserved.
