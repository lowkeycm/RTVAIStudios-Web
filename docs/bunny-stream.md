# Bunny Stream and share pages

## Connection

- Library: RTVAI Studios, ID `765065`.
- CDN hostname: `vz-a8ba0ca7-360.b-cdn.net`; pull zone `6708527`.
- Vercel production configuration: `BUNNY_STREAM_LIBRARY_ID`, `BUNNY_STREAM_CDN_HOST`.
- Required server secrets: `BUNNY_STREAM_API_KEY` (library API key, not the account key) and `BUNNY_STREAM_TOKEN_KEY` (CDN pull zone URL token authentication key, not the Stream embed key).
- Never prefix secrets with NEXT_PUBLIC, commit them, or expose them in upload responses. Redeploy after environment changes.

## Library controls configured September 29, 2026 UTC

Free encoding, H.264, 240/360/480/720/1080p; 1440p and 2160p off. Frankfurt storage only. Original copies, MP4 fallback, multi-audio, paid encoding options, and content tagging off. CDN token authentication enabled. Only rtvaistudios.com and www.rtvaistudios.com are allowed referrers; direct requests without a referrer are blocked. Signed HLS requests preserve a directory token for variant playlists and segments.

Initial monthly bandwidth limit: 100 GB. Bunny disables this CDN zone if the limit is reached. This is a bandwidth guardrail, not an all-services dollar cap. Auto-recharge is off. The account currently has a 14-day trial with $20 credit; billing details and a manual recharge will be needed to continue after the trial. No purchase was made during setup.

## Staff workflow

1. Sign into /desk with an active administrator or production account.
2. Production library → choose an MP4, WebM, or MOV up to 5 GB, supply the title and category, and upload. TUS supports retries and resumable uploads; upload tickets expire after six hours and are renewed by the authenticated app.
3. Wait for Ready. Processing is polled while the production library is open; Refresh is also available. An interrupted upload stays private.
4. Enable Share by link for an unlisted branded watch page, or publish with confirmed portfolio permission. Publishing and link sharing are independent.
5. Copy share link. Public films are also available in the Share films tab for sales, with optional representative attribution.
6. Disable Share by link to revoke its watch URL. The token rotates so re-enabling creates a new URL. Existing issued CDN URLs may continue until their one-hour expiry; downloaded copies cannot be recalled.

Anyone possessing an enabled unlisted URL can watch it. These links are not password-protected client portals. Watch pages use noindex and an origin-only referrer policy. Sales cannot access private production records or mint private playback URLs.

## Playback and compatibility

Bunny streams use native HLS on supported browsers and lazy-loaded hls.js elsewhere. Stream authorization and video segments are requested after play. hls.js limits its buffer and stops loading on pause; video playback pauses offscreen or when the tab is hidden. Bunny ambient tiles use posters. Existing short local motion previews and existing Supabase videos remain intact.

The database migration adds share controls without modifying legacy objects or URLs. New uploads prefer Bunny when all four variables are present; the existing fallback remains available before setup is complete.

## Verification

- Production build and TypeScript pass.
- Six Node tests cover private/public/unlisted access, revocation, processing status, scoped CDN signatures, and signed upload authorization. Run `node --test tests/video-access.test.mjs`.
- Supabase transaction assertions verify defaults, the Ready-only sharing constraint, and token rotation, with all fixtures rolled back. RLS remains enabled and anonymous/authenticated database reads remain denied.
- New integration files pass focused ESLint. Repository-wide lint still contains pre-existing errors.
- The two production server secrets were entered by the owner and deployed in `dpl_CFyH8T26QyRJs66wQKbs8yZC852M`. The upload diagnostic release is `b09973300882e4f3e2fd84083c0a854324f2e8ac`.
- A seven-second existing preview was imported through Bunny, finished transcoding, and played to completion on its branded watch page. The playback endpoint returned an authenticated HLS playlist from Bunny. Private requests returned 404. Revoked watch, stream-authorization, and thumbnail routes all returned 404.
- Owner staff sign-in succeeded. The production dashboard identifies the Bunny configuration, and its real Tags & visibility controls successfully enable and revoke an unlisted link while leaving the film out of the public gallery.
- The owner replaced the library API key and production redeployment `dpl_4ZZZ689z7gWsWmUaKJ18U9tGwxn3` activated it. The real staff upload completed through the website: asset creation and upload-ticket endpoints returned 200, TUS reached 100%, and Bunny processing reached Ready. No credential values were inspected during verification.
- The uploaded film played on its branded watch page, the Copy share link control confirmed success, and disabling sharing invalidated its previous watch, playback, and poster routes (all 404). Anonymous playback using the private record ID also returned 404.
- The staff-uploaded verification record `7e2f1bb0-7632-4f57-96fa-dc940d536ae0` uses Bunny video `2d00daaa-e2aa-49a7-a43c-be181df60195`. It remains Ready and private, with placement none, publication and portfolio consent off, sharing disabled, and its contact CTA off. The seven-second source was the existing local impossible preview; no client footage was used.
- The test record `rtv-bunny-connection-test` and Bunny video `bdcc51be-17c5-4f84-89c0-f8cfdc026b04` remain private, excluded from the gallery, with link sharing disabled. No legacy video was moved or altered.

## Catalog migration and placement management

The Site placements tab (administrator/production roles) assigns the six homepage hero screens, one homepage example and one opening film per video type, and the gallery order. Assignments use stable film IDs. Explicitly assigned unpublished/missing films are excluded at render time; automatic slots use eligible public films. Gallery filters preserve the saved order. Saves compare the previous settings value to prevent overwriting another editor's changes. Drafts survive switching workspace tabs.

The original catalog is imported through administrator-only `/api/desk/catalog-import/*` actions. The prepare action seeds editable records with the original IDs and URLs. The start action accepts only IDs from the fixed existing catalog; it never accepts an arbitrary fetch URL. Each provider request is claimed once in `video_imports`, and ambiguous responses are reconciled by a deterministic Bunny title rather than creating another asset. Original delivery remains active during encoding. Activation requires Finished status, encoded resolutions, a valid signed HLS master and variant, and a nonempty first segment. A database transaction switches delivery and marks the import complete without changing publication or permission settings. Original Supabase storage objects and the legacy catalog source URLs are retained for rollback.

Validation: 12 focused Node tests cover video access, signing, placement selection, filtering order, invalid assignments, and legacy override behavior. Production build and TypeScript pass. SQL transaction assertions verify migration tracking permissions, asset matching, atomic activation, duplicate activation rejection, and preservation of private visibility. Focused lint has no errors (only native image guidance warnings).

## Completed migration verification — September 29, 2026

- All 13 original public films finished encoding and passed signed HLS master, variant, and first-segment delivery checks before activation. All 13 public playback endpoints now return Bunny HLS successfully. The two verification films remain private; no imports are pending. Original Supabase objects and catalog source URLs remain intact.
- The production browser played the longer Laced Function film and played/paused a migrated film inside the 3D Spot TV. Existing branded watch URLs continue to resolve through the stable film IDs.
- Live placement saves were verified on the homepage hero, homepage video-type example, video-type opening film, and The Work gallery. An unsaved draft survived switching workspace tabs. Both arrow reordering and mouse dragging with the explicit grip were verified. The grip also handles touch pointer events; no separate physical mobile-device test was performed.
- Temporary verification assignments were reset and saved. The original six hero films, channel examples/openers, and 13-film gallery order are restored.
- Unauthenticated placement saves and catalog-import starts return 401. Public eligibility checks remain enforced; private films do not enter placement choices.
- Functional release: `65835540744cc0c0e46e1dc51b2faeec3ad4a20a`, production deployment `dpl_2boHRUvPmUHM1Wxkn64Y8CHX4WM9`.
