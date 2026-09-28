# RTV AI Studios

Approved cinematic website migrated from ChatGPT Sites to Next.js on Vercel.

## Run

Node 24, `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`.
`npm run build` performs the production build and TypeScript checks.

## Hosting

- Repository: lowkeycm/RTVAIStudios-Web
- Vercel project: rtvai-studios-web / Pride Family Realty
- Supabase project reference: rdgwuhfghcyphleenaek
- Original approved source: Sites version 14, commit 4326dcaa6eaf7a57762c8e963e1e9665c8f90d9c

Vercel uses `vercel.json` and the npm lockfile. Set the two public Supabase variables and `SUPABASE_SECRET_KEY` in Vercel. Use a Supabase secret key or legacy service_role key for that server-only value. No database password is required.

## Database and storage

The migration creates members, leads, intakes, activities, videos, settings, submissions and throttle. All tables have RLS enabled with no direct browser grants. Only server routes using the server secret access them, after validation and role checks. Transaction functions are executable only by service_role. Enquiries are idempotent, duplicate contacts keep original attribution, and private intake tokens are hashed.

The previous 37 PopOff tables are preserved in `popoff_archive`, with browser and application access revoked. Its old auth-profile trigger was removed. Existing auth users and all 28 stored objects were preserved. The original `videos` bucket remains public at its existing URLs. Old broad authenticated write policies were removed. New media goes to the private `rtv-production` bucket using signed direct uploads (MP4/WebM, up to 50 MB). Playback is checked by the server and uses five-minute signed URLs. Already issued playback URLs can remain usable for those five minutes after unpublishing.

The verified owner was provisioned separately in `members`. No first-public-user admin bootstrap exists. Staff sign in at `/team-login`. Existing Supabase users can use their password. For email links, set the Supabase Auth Site URL to the production origin and allow `/auth/callback` and `/auth/recovery` there and on approved preview origins. Configure branded SMTP before relying on email sign-in or password recovery. Adding someone to `members` does not send an email automatically.

Password recovery starts at `/forgot-password`. Active staff receive a Supabase PKCE recovery link, opened in the same browser, which returns through `/auth/recovery` to `/reset-password`. Password changes require a verified active staff session and at least 12 characters; successful changes request global sign-out. Recovery requests are rate-limited and return a generic acknowledgement for non-team addresses. Tokens and passwords are never written to application logs. Supabase's built-in mail service only delivers to organization team email addresses; the migrated owner's Yahoo address therefore needs custom SMTP before recovery can be completed.

## Optional connections

Cloudflare Stream is optional for larger resumable uploads and adaptive playback. Set the account ID and scoped Stream token to enable it. Existing Supabase videos work without Stream.

Google Calendar scheduling requires the client ID, client secret, refresh token, and confirmed shared calendar ID. Until connected, enquiries are saved and staff can record manually scheduled calls. Lead notification emails are not configured.

## Migration verification

The database transaction checks covered enquiry creation, replay without duplicate creation, representative attribution, intake submission, and audit entries. Anonymous table and RPC access was checked separately.

Production is deployed at https://rtvai-studios-web.vercel.app from GitHub `main`. The server secret is working: a deployed enquiry was saved, replayed without duplication, attributed to the existing owner, and completed through the private intake flow. Temporary test records were removed. All ten marketing/login routes returned successfully; anonymous dashboard access and unapproved sign-in were rejected. All 53 deployed binary assets matched the approved source byte for byte, and all 13 portfolio video URLs returned MP4 responses. The production build and TypeScript checks passed.

Vercel deployment protection is still enabled. Supabase is now named RTVAI Studios. Its Auth Site URL is the Vercel production origin, with exact `/auth/callback` and `/auth/recovery` redirects allowed. Custom SMTP and authenticated staff upload/login checks remain account steps. See `docs/migration-status.md` for the exact release and remaining connections.
