# RTV Studio — private review build

Built from scratch, September 26, 2026. This is a private review deployment. The rtvaistudios.com domain has not been switched.

## Included

- Public homepage, four product pages, studio story, screening room, pricing/printable rate sheet, enquiry form, private resumable intake and privacy page.
- Original Three.js monitor/cinema-camera scene, channel switching, optional motion, keyboard rotation/reset and a studio-image fallback. Screening room includes a separate four-monitor 3D channel wall, plus standard accessible filters/cards.
- Two existing RTV reels are played from their original public storage. Local poster frames were extracted from those actual videos. Brand.mp4 is provisionally tagged Brand Avatar based on its spokesperson-led creative; no client identity, performance result or new portfolio project was invented.
- Managed database: leads, immutable original rep, assignable owner, stage, source/campaign, next action/date, notes, intake, activity history, video metadata, team roles and publication settings.
- Real object storage uploads (MP4/WebM under 95 MB before Stream connection), private playback, byte-range public playback after publication, tags, placement, portfolio permission and visibility control.
- Server authorization: administrators see all records; sales see leads they own or originated; production sees won-client handoffs and the media library. The private review uses ChatGPT sign-in plus an explicit team allowlist.
- Initial owner setup is enabled only for the owner-private deployment. Open /desk and claim the owner account. Only an empty members table can accept setup. Add teammates by their actual sign-in email. No invitation emails are sent automatically.

## Remaining live connections and launch gates

1. Owner setup must be completed, then remove SETUP_ENABLED before broadening site access. Platform access remains owner-private until intentionally changed. Decide whether the operational portal should keep ChatGPT sign-in or use RTV Google business accounts before staff rollout.
2. Verify the exact calendar address supplied by the owner: **rtvaidstudios@gmail.com**. Individual business addresses were described as **rtvaistudio.com**. Do not silently normalize either spelling.
3. Connect the Google Calendar API account and free/busy sharing for each host. GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET and GOOGLE_REFRESH_TOKEN are server secrets. GOOGLE_CALENDAR_ID defaults to the supplied Gmail. The adapter checks shared-calendar and host availability, creates a 30-minute event with a deterministic lead-based ID and sends invitations only after a signed-in team member chooses that explicit action. Until connected, the site captures requests; team members can record a real, manually confirmed Calendar/Meet link. Calendar cancellations/rescheduling are managed in Google and reflected manually in the lead record in this release. Availability check and insert are not a cross-calendar atomic lock; real-account concurrency testing remains required.
4. Connect Cloudflare Stream using a scoped Stream API token and account ID. These stay server-side. The integration uses resumable tus direct uploads and requires signed playback by default, with visibility changes coordinated with Stream. An authorized production user checks processing readiness. Live-account upload, token playback and publication tests remain required. Keep master/source files in separate storage; Stream is the delivery layer.
5. Verify the 3D scenes on a WebGL-enabled desktop and phone. The available review browser explicitly disables WebGL, so only the fallback, channel switching and normal gallery could be validated visually. GPU frame rate, visual finish of the rendered 3D models, camera framing and touch rotation remain unverified. The code compiles, but that is not a 3D visual sign-off.
6. Review real portfolio examples for all four product lines, product tagging, permission and captions before launch. The two legacy reels can be hidden together in Team & connections. New media has individual visibility controls. Individual legacy-media editing/migration awaits Stream onboarding.
7. Confirm all public copy, proposal terms and privacy copy, then route rtvaistudios.com and set canonical/SEO metadata for the live domain. No live DNS, paid service plan, billing, real email/calendar invitation, or public access policy has been changed by this build.
8. Basic abuse limits are present. Live traffic controls, operational email notifications, backups, payment collection, automated proposal generation/e-signature, commissioning rules and calendar event sync are not part of this first review build.

## Validation evidence

- Production Worker build and TypeScript checks passed during development; final source is checked again when packaged.
- 29 local integration assertions passed. See api-verification.json and scripts/qa/check-flows.py. Coverage includes role isolation, duplicate contacts, immutable original attribution after reassignment, enquiry idempotency, private intake rotation and persistence, required answers, video storage/range playback, consent gating, unpublication, blocked unauthenticated access, unconnected-calendar errors and cross-origin rejection.
- Browser enquiry submission produced a saved intake link. Draft text survived a reload. Actual persisted row was confirmed in the local database.
- Desktop and three 390px iframe viewports (375px content width with scrollbar) inspected for home, pricing and enquiry. All three reported scrollWidth equal to clientWidth. Mobile menu opened. This validates responsive layout, not mobile device hardware/touch performance.
- Gallery product filter produced the correct empty state; all-productions restored the actual reels; real-video modal playback reached readyState 4, advanced beyond 13 seconds, had no media error and was not paused. Keyboard activation worked; pointer hit areas were corrected and rechecked.
- WebMCP filter registration is implemented, but the review context reported no available tools; structured invocation validation is unavailable. No claim of a passing WebMCP test.
- Browser limitations: WebGL disabled; sign-in/owner-claim and full protected workspace browser journey require the private deployment. API role behavior was exercised with local-only test identities, never live account impersonation.

## Development

Use the committed lockfile and the Sites build helper. D1 schema is in db/schema.ts; generated migrations are committed under drizzle/. Apply local migrations as described in README.md. Hosted deployment applies schema migrations; local runtime rows and uploaded test media are not source assets and do not get deployed. Never copy test identities to the live database.

Desktop evidence: docs/homepage-review.jpg captures the reviewed fallback composition. It is a review screenshot, not a generated scene or proof of GPU rendering. Mobile evidence was inspected in the browser at 390px-wide same-origin frames; no mobile screenshot was added to the product itself.
