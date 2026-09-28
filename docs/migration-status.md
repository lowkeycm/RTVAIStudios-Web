# Vercel and Supabase migration — September 28, 2026

The approved Sites version 14 is the design baseline. Clay confirmed testing of the 3D behavior before this migration.

Completed: Next.js runtime conversion, production build, Supabase schema replacement, private rollback archive of PopOff tables, storage preservation, server-only database access, Supabase staff authentication, signed direct media uploads, and database transaction checks.

Supabase dashboard access is still required to rename the project display name, obtain its server secret key for Vercel, and configure Auth site/redirect URLs and email delivery. The project reference and existing video URLs remain unchanged when the display name is changed.

Do not point the production domain until the server secret is saved and a deployed enquiry/intake flow has been verified. Cloudflare Stream and automated Google Calendar scheduling remain optional connections. Existing portfolio videos remain on Supabase Storage.

Older files under docs describe the historical Sites/D1 review build. Their test results are historical; README.md and this file describe the Vercel migration.

## Transfer checkpoint

The migration source is saved on `migration/vercel-supabase`. Vercel preview deployment `dpl_AHeJb27nfT91rCVNp1peGxm6a2Ag` built successfully from `84f17ebc2017cd0d53c9a9c49dbe5c3eef269079`, but this branch does NOT yet contain the binary artwork, models, or local video previews. Do not merge or promote it yet. The execution workspace disconnected during binary transfer. Recover those unchanged binary files from the original Sites source commit `4326dcaa6eaf7a57762c8e963e1e9665c8f90d9c` in project `appgprj_6ab8116abf188191b0ae8ea4da67b7d7`.

The original live database was checked: it contains no leads, intakes, videos, activities, submissions, or settings. Its single owner member was preserved in Supabase, including the existing representative code. No customer-record migration remains.

Vercel Production has `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, and the previously configured `GOOGLE_CALENDAR_ID`. `SUPABASE_SECRET_KEY` is still missing. Preview environment variables are not set. Supabase's display name is still PopOff. Production GitHub `main`, the existing Sites deployment, and DNS remain unchanged.
