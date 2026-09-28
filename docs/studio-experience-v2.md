# Frameless television correction — 26 September 2026

This revision supersedes the boxed screening-room presentation below. The television itself now sits directly on the page: transparent WebGL background, no room or tabletop geometry, no picture backdrop, no exterior frame, channel header or playback bar. The homepage background no longer uses the room image. Native and Stream player chrome is hidden. Clicking the glass plays/pauses; keyboard left/right seeks ten seconds. The remote remains the main control surface, including fullscreen, and the CRT dials retain their functions.

Browser verification: no exterior chrome, transparent display container, native controls absent, click-to-play and remote mute successful. Fullscreen targets the media surface. GPU rendering remains subject to the inspection browser limitation recorded below.

---

# Studio experience revision — 26 September 2026

## Changes

The homepage camera prop is replaced by a working screening display. Home, Work and service gallery links share product/film selection; Work videos play inside their respective television instead of opening a modal. The internal desk retains its existing review player.

Each product has a purpose-built GLB model: walnut CRT for The Spot, widescreen display for The Impossible, portrait display for Brand Avatar and a console display for Brand Universe. Displays sit in a lit studio setting. Native HTML media is projected to all four screen corners, retaining video proportions and accessible browser controls. Cloudflare Stream uses its embed player SDK. Device playback is never dependent on video-texture CORS.

The remote has channel-format keys, within-channel previous/next, play/pause, volume, mute, power, fullscreen and existing package/booking links. The CRT channel dial advances films, with left/right keyboard navigation; the volume dial toggles mute, with arrow-key volume adjustment. Empty galleries accurately show no published content.

## Assets

Models and matched renders were created in Blender through the asset workspace project `a379ce2a-cf33-4bb1-85a1-d0a012c3a3f5`. Four GLBs total 2.69 MB; WebP fallbacks total approximately 301 KB. Manifest records screen corners, model names and dial coordinates. Existing approved RTV room imagery is retained for the fallback backdrop.

## Verification

- TypeScript check passed.
- Browser checks passed for native in-screen playback, next/previous within a two-film temporary local fixture, play continuation on next film, mute, standby, CRT dials and product selection.
- Desktop and 390px mobile layouts inspected; existing content proportions preserved.
- The inspection browser disables WebGL. Matched image fallback and player interactions were checked there. Live GPU rendering and drag motion still need review on a WebGL-enabled device. GLB assets were independently rendered and inspected in Blender.
- Temporary QA routes and fixture data removed before packaging.

## Existing content limitations

The current public collection contains one Impossible reel and one Brand Avatar reel. Spot and Universe have no published films yet. CH controls enable automatically when a category has at least two films. The landscape Avatar reel is letterboxed inside the portrait display rather than cropped or distorted. Existing content management, leads, bookings and integration settings remain in place. Connected Cloudflare Stream playback requires its original account configuration; native source video playback was verified.
