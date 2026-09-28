# RTV AI Studios

- Preserve the approved public page copy, pricing, artwork, and 3D interactions unless Clay requests changes.
- Production: Vercel project `rtvai-studios-web`, GitHub repository `lowkeycm/RTVAIStudios-Web`.
- Backend: Supabase project `rdgwuhfghcyphleenaek` (formerly PopOff). Never remove the existing storage buckets or rewrite legacy video URLs as part of database maintenance.
- Keep secrets in environment variables. The Supabase server secret must never enter client components or public source control.
- `/desk` access requires verified Supabase authentication and an active `members` record. Sales see their assigned/originated leads; production sees won clients; administrators manage all records.
- Use SQL migrations for schema changes. The `popoff_archive` schema is a private rollback archive, not application data. Do not expose it through the API.
- Run `npm run build` before publishing. Verify backend changes with meaningful transaction and access-control checks.
