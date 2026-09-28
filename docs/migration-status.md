# Vercel and Supabase migration — September 28, 2026

The approved Sites version 14 remains the design baseline. Clay confirmed testing of the 3D behavior before migration. Public copy, pricing, artwork, and interactions were preserved.

## Production release

- GitHub: `lowkeycm/RTVAIStudios-Web`, branch `main`.
- Application/asset commit: `1864dc2dcdc23b59dc5f17d71f9ee2b776a3dc9d`.
- Vercel production deployment: `dpl_FtBgUhavk3vBkznjtqyrF9ypXrt4`, status READY.
- Production alias: https://rtvai-studios-web.vercel.app
- All 75 binary files have been transferred, including production assets and editable originals. The transfer checkpoint is complete.
- Next.js production build and TypeScript checks passed. Vercel deployed the same commit successfully.
- Vercel deployment protection remains enabled. No custom domain or DNS change was made.

## Backend

Supabase project `rdgwuhfghcyphleenaek` hosts the eight RTV tables with RLS and server-only access. The previous 37 PopOff tables remain in the private `popoff_archive` rollback schema. The original database had no customer records; its owner was preserved with the original representative code. Existing Auth users and all 28 stored objects remain intact. New media uses the private `rtv-production` bucket.

Production has the public Supabase URL/key, the working `SUPABASE_SECRET_KEY`, and the existing `GOOGLE_CALENDAR_ID`. The secret's validity was verified through live enquiry and intake writes, without reading or exposing it. Preview environment variables have not been verified or configured.

## Deployed verification

- Home, work, studio, pricing, booking, team login, and all four service routes returned HTTP 200.
- All 53 deployed public binary assets matched the approved source SHA exactly.
- All 13 portfolio video URLs returned HTTP 200 with MP4 content types.
- A disposable enquiry was created through the production API, replayed with the same request ID, and produced exactly one lead.
- The original representative attribution and owner assignment were retained.
- Its private intake opened, saved a draft, submitted, and persisted the submitted answers. Three audit entries were present.
- All disposable enquiry, intake, submission, and audit test records were removed after verification.
- Anonymous dashboard requests returned 401; unapproved sign-in returned 403; invalid intake and unknown media returned 404. Foreign-origin submissions and invalid forms were rejected.
- Supabase confirmed all eight application tables have RLS, the new media bucket is private, and an existing Auth account matches the active owner.
- The production home page was checked in the browser and retains the approved cinematic artwork and layout.

Successful owner sign-in, role-specific authenticated workflows, and signed upload/playback still need an authenticated staff session. These have not been represented as completed end-to-end tests. Vercel's runtime-error aggregation tool timed out; direct deployment and API checks succeeded.

## Remaining account and domain steps

1. Sign into the Supabase dashboard in the connected session. The dashboard currently redirects to sign-in. Rename the display name from PopOff to RTVAI Studios; this leaves the project reference and legacy video URLs unchanged.
2. Set Auth Site URL to the final production origin and allow its `/auth/callback`. Add only approved preview callback origins as needed. Configure branded SMTP before wider team email sign-in.
3. Verify owner sign-in and authenticated media upload/playback at `/team-login` and `/desk`.
4. Attach the chosen custom domain in Vercel, apply the exact DNS records Vercel supplies, and verify HTTPS and the canonical hostname. Update Supabase Auth URLs for that hostname.
5. Optional: connect Cloudflare Stream for adaptive delivery and larger uploads; existing Supabase portfolio videos already work. Some originals exceed 500 MB, so Stream is useful before heavier traffic.
6. Optional: connect Google Calendar OAuth for automated scheduling. Until connected, enquiries save successfully and calls can be recorded manually. Lead notification emails are not configured.

Older documents under `docs` describe the historical Sites/D1 build. Their test results are historical; this file and README describe the Vercel migration. The original Sites deployment is retained as a fallback.
