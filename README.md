# Noor & Hassan — 3D wedding invitation

Component-based Next.js App Router / TypeScript project, Tailwind CSS 4, React Three Fiber and GSAP ScrollTrigger. Includes local Blender GLBs and a hinged procedural envelope for the opening animation.

## Run

Install Node.js 22 LTS (or a supported Node version >=20.9). Open a terminal **inside this folder**:

```sh
npm install
npm run dev
```

Open `http://localhost:3000/?guest=Muhammad+Ikram`. The query string is decoded by `useSearchParams`, normalized and displayed as escaped React text. The same name prefills the editable RSVP field. Without a guest parameter the invitation addresses family and friends.

```sh
npm test
npm run typecheck
npm run build
npm start
```

Use `npm ci` for repeatable installations once the included lockfile is present. No database, API keys, CDN fonts, remote HDR or paid service is needed. Google Maps itself requires internet access.

## Files and responsibilities

```text
src/app/page.tsx                    Suspense boundary for URL parameters
src/app/layout.tsx                  Metadata and global styles
src/app/globals.css                 Responsive design and Tailwind import
src/components/Invitation.tsx       Guest name, sections and reveal animations
src/components/Hero.tsx             GSAP ScrollTrigger progress and motion controls
src/components/three/EnvelopeScene.tsx  R3F hinge, card, floating rings and wreath
src/components/RSVPForm.tsx         Accessible form, loading, success and error states
src/lib/wedding.ts                  Names, date, timings, venue and Maps/calendar URLs
src/lib/rsvp-validation.ts          Shared input validation
src/lib/rsvp-store.ts               Locked, atomic JSON persistence
src/app/api/rsvp/route.ts           POST /api/rsvp (Node runtime)
src/app/guests/page.tsx             Password-protected guest list for the hosts
src/lib/admin-auth.ts               Guest list password and session cookie
src/lib/calendar.ts                 RFC 5545 calendar creation
src/app/api/calendar/route.ts       Downloadable .ics calendar
data/rsvps.json                     Private RSVP log, initially []
public/models/                     Included wedding GLBs
tests/                             Concurrency, corruption, validation, API and calendar tests
```

## RSVP storage

The form posts:

```json
{ "guestName": "Muhammad Ikram", "status": "Attending" }
```

Allowed status values are exactly `Attending` and `Not Attending`. Each successful response appends an entry:

```json
{
  "guestName": "Muhammad Ikram",
  "status": "Attending",
  "id": "server-generated-uuid",
  "submittedAt": "2026-10-17T12:00:00.000Z"
}
```

An inter-process lock serializes read/modify/write; a unique temporary file is written and synced, then renamed over the old file. Corrupt existing JSON causes a 503 without replacing the original. Requests are limited to 4 KB even without a Content-Length header. Names are validated on the server. The API never exposes the guest list; GET is not implemented. Browser requests from a different origin are refused.

This is an **append-only response history**: a correction is a new entry, and the host reviews the latest response. Names are not unique identities and are never used as filenames or overwrite keys. A request interrupted after the write may be retried and create a duplicate. The file lock protects concurrent local writers; it is not a distributed database or a guarantee against all disk/power failures. Back up the data folder.

## Deploy with a persistent Node server

Use a VPS, local Node server, or a Node container with a persistent writable disk. This exact JSON design **does not persist on Vercel/serverless functions, Cloudflare Workers, static export, ephemeral containers or separate replicas with separate disks**. Run one application instance (local workers may share the same filesystem); do not place the data in `public/` or commit live guest data.

Copy `.env.example` to `.env.local` and set the actual public origin with no trailing slash, especially behind a reverse proxy:

```dotenv
APP_ORIGIN=https://wedding.example.com
RSVP_DATA_DIR=/var/lib/wedding-invitation
```

`RSVP_DATA_DIR` is optional; default is `<project>/data`. Give only your application user filesystem access to the folder (use OS permissions/ACLs on Windows). Keep it outside deploy/release folders or mount a persistent volume so updates do not replace it. Use HTTPS and configure the reverse proxy to forward requests to `next start`. This is a simple public RSVP form, not an authenticated guest portal; URL names can be edited. If publicly advertised, apply request rate limits at your hosting proxy.

## Link preview card

`public/og-image.png` (1200×630) is the card WhatsApp, Facebook, X and others show when the link is shared. It uses Cormorant Garamond and Jost (SIL Open Font License). WhatsApp needs a full `https://` image URL, so **set `APP_ORIGIN` to your real domain before `npm run build`**. Otherwise the preview points at `localhost` and no image shows. Apps cache previews, so if you change the image, rename the file (for example `og-image-v2.png`) and update `src/app/layout.tsx`.

## Background music

The included track is "Slightly Shehnai" by Musical Meanderings (Julian Overall), from Free Music Archive under CC BY-NC 4.0: free for non-commercial use with credit, which is shown in the footer. Keep that credit, and do not use the track for anything sold or paid. To change the music, replace `public/music/background.mp3` and update the footer credit. Browsers don't allow sound before the guest interacts with the page, so the music starts on their first tap, click or key press. It loops at 45% volume, pauses when the tab is hidden, and the round button at the bottom right mutes or unmutes it. A muted choice is remembered on that device. If the file is missing, the button is hidden. Use music you are allowed to share, and keep the file small (about 2–4 MB) so phones load it quickly.

## Guest list for the hosts

Open `/guests` (for example `http://localhost:3000/guests`) and sign in with the password set as `ADMIN_PASSWORD` in `.env.local`. Restart the server after setting it. Without a password the page stays disabled. The page shows totals for Attending, Not attending and Total responses, then each guest once with their latest answer (names are matched ignoring capital letters). Sign-in is remembered for 400 days (the longest browsers allow) until you sign out; changing the password signs everyone out. Every wrong password is delayed by one second. Use a long password and HTTPS. The raw history is still in `data/rsvps.json`.

## Content, animation and accessibility

- All supplied names, family names, address and schedule live in `src/lib/wedding.ts`.
- Date: **4 November 2026**. Barat 9 PM, Khana 10 PM, Rukhsati 11 PM, all Karachi time.
- Calendar start is 9 PM PKT / 16:00 UTC. Calendar end is **assumed 11:30 PM PKT** because no end time was provided; change `endUTC` if needed.
- Add to calendar downloads an `.ics` file for Apple/Outlook/etc.; Google Calendar opens its event editor. Neither silently writes to an account.
- Maps searches the supplied venue/address rather than claiming a verified precise pin. Verify the result before sharing invitations; replace the URL with the venue's confirmed Maps link if necessary.
- Desktop uses a sticky hero with scroll-scrubbed opening. Mobile uses normal document flow with the same scroll progress. No forced scroll interception.
- Pointer movement subtly tilts the envelope. A motion control and `prefers-reduced-motion` show the fully open static scene and disable floating. Text remains accessible outside the decorative canvas.
- WebGL/load failure shows the envelope PNG. The rest of the invitation and RSVP remain available. DPR is capped at 1.6.
- All ScrollTriggers are cleaned up when their component unmounts. Environment lighting is generated locally.
- The earlier open-envelope GLB is included for reuse. The hero uses separate procedural paper panels because the exported GLB is a single joined mesh and has no animated flap pivot.

## Documentation

- [Next.js useSearchParams and Suspense](https://nextjs.org/docs/app/api-reference/functions/use-search-params)
- [React Three Fiber installation and React version pairing](https://r3f.docs.pmnd.rs/getting-started/installation)
- [GSAP ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/)
- [Tailwind with Next.js](https://tailwindcss.com/docs/installation/framework-guides/nextjs)
