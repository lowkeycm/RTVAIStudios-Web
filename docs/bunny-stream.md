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
- **Remaining blocker:** the actual staff upload request reaches the authenticated backend, but Bunny rejects its library API credential. The owner must replace `BUNNY_STREAM_API_KEY` with the full API Key from library 765065's API page (not the read-only, account, embed, or CDN signing key), then redeploy and retry the prepared small upload. The working playback signing key needs no change.
- The test record `rtv-bunny-connection-test` and Bunny video `bdcc51be-17c5-4f84-89c0-f8cfdc026b04` remain private, excluded from the gallery, with link sharing disabled. No legacy video was moved or altered.
