# Vercel and Supabase migration — September 28, 2026

The approved Sites version 14 remains the design baseline. Clay confirmed testing of the 3D behavior before migration. Public copy, pricing, artwork, and interactions were preserved.

## Production release

- GitHub: `lowkeycm/RTVAIStudios-Web`, branch `main`.
- Current application commit (including password recovery): `b31df4b84df97243c4a027ed9c64c460c0dcb823`.
- Vercel production deployment: `dpl_4ayu3GicRcU1YxFkdMw1r7fRpXH5`, status READY.
- Canonical production URL: https://www.rtvaistudios.com. The apex domain redirects to `www`; HTTPS and approved content were verified on both hostnames.
- Vercel alias: https://rtvai-studios-web.vercel.app
- All 75 binary files have been transferred, including production assets and editable originals. The transfer checkpoint is complete.
- Next.js production build and TypeScript checks passed. Vercel deployed the same commit successfully.
- Vercel deployment protection remains enabled for non-custom domains. The custom domain was already attached when inspected; no DNS edits were made during the recovery work.

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

Supabase dashboard sign-in succeeded, the project display name was changed to **RTVAI Studios**, and the project API confirmed the name and ACTIVE_HEALTHY status. The project reference and existing video URLs are unchanged. The custom domain is now live. Auth Site URL is `https://www.rtvaistudios.com`, with these four exact redirect URLs verified in the saved settings:

- `https://www.rtvaistudios.com/auth/callback`
- `https://www.rtvaistudios.com/auth/recovery`
- `https://rtvai-studios-web.vercel.app/auth/callback`
- `https://rtvai-studios-web.vercel.app/auth/recovery`

No wildcard preview redirects were added.

1. Verify a real password-recovery email and owner reset. Resend custom SMTP was configured at approximately 18:39 EDT: sender `RTVAI Studios <noreply@support.rtvaistudios.com>`, host `smtp.resend.com`, port `465`, username `resend`, and 60-second per-user interval. Resend shows the sending domain as Verified. The user entered the API key directly into Supabase; it was not read or recorded. A dashboard reload confirmed custom SMTP enabled and a stored password. Resend subsequently confirmed a delivered sign-in email to the owner; see the follow-up below. Request recovery from the user's own browser and open the email link in that same browser for PKCE.
2. A Supabase PAT was reported saved in Vercel, but it was not read or used. The dashboard session provided the access needed for the project name and Auth settings.
3. Verify owner sign-in and authenticated media upload/playback at `/team-login` and `/desk`.
4. Optional: connect Cloudflare Stream for adaptive delivery and larger uploads; existing Supabase portfolio videos already work. Some originals exceed 500 MB, so Stream is useful before heavier traffic.
5. Optional: connect Google Calendar OAuth for automated scheduling. Until connected, enquiries save successfully and calls can be recorded manually. Lead notification emails are not configured.

Older documents under `docs` describe the historical Sites/D1 build. Their test results are historical; this file and README describe the Vercel migration. The original Sites deployment is retained as a fallback.

## Owner password recovery follow-up

The reported login failures reached Supabase Auth and returned `invalid_credentials`. The owner member is active with the admin role; the matching Auth user is confirmed, has a password set, and is not banned. No password was inspected or changed.

Added and deployed a `Forgot password?` link, `/forgot-password` request page, `/auth/recovery` PKCE callback, and `/reset-password` form backed by an authenticated, rate-limited API. The exact production `/auth/recovery` URLs were added to Supabase's redirect allowlist. The production build and TypeScript checks passed. The recovery page was visually verified at the custom domain.

All eight deployed recovery checks passed: both recovery pages returned 200; missing and invalid callback codes redirected to the invalid-link message; anonymous password changes returned 401; foreign-origin recovery requests returned 403; malformed requests returned 400; and a non-team address received a generic 200 acknowledgement without sending mail.

The original blocker was Supabase's built-in mail service, which would not deliver to the owner's Yahoo address because it is not the organization's team email. Resend custom SMTP is now configured and persisted. No account emails, permissions, or owner passwords were changed to bypass recovery. Sign-in email delivery and owner dashboard access are confirmed below. Owner password change and authenticated staff/upload workflow checks remain pending.

## Sign-in link clarification

At approximately 18:46 EDT, Resend showed the owner email as Delivered with subject `Your Magic Link`. Supabase logs recorded a successful `/otp` request, `/verify` redirect, and token exchange; the owner confirmed landing in the dashboard. This was the regular sign-in flow, not the separate password-recovery request. The earlier guidance incorrectly treated that email as a reset link.

The login UI had asked for a numeric code even though the configured email supplies a link. Removed that misleading code form, clarified the separate reset option, and added `Change password` to the active member's workspace header. Existing authenticated password-change access remains restricted to verified, active members; no permissions or recovery checks were relaxed. The owner can visit `/reset-password` directly in their signed-in browser.
