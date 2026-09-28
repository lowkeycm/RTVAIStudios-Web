# Vercel and Supabase migration — September 28, 2026

The approved Sites version 14 is the design baseline. Clay confirmed testing of the 3D behavior before this migration.

Completed: Next.js runtime conversion, production build, Supabase schema replacement, private rollback archive of PopOff tables, storage preservation, server-only database access, Supabase staff authentication, signed direct media uploads, and database transaction checks.

Supabase dashboard access is still required to rename the project display name, obtain its server secret key for Vercel, and configure Auth site/redirect URLs and email delivery. The project reference and existing video URLs remain unchanged when the display name is changed.

Do not point the production domain until the server secret is saved and a deployed enquiry/intake flow has been verified. Cloudflare Stream and automated Google Calendar scheduling remain optional connections. Existing portfolio videos remain on Supabase Storage.

Older files under docs describe the historical Sites/D1 review build. Their test results are historical; README.md and this file describe the Vercel migration.
