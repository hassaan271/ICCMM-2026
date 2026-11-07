# ICCMM-26 website

React 19 + TypeScript, built with Vite. Motion: GSAP/ScrollTrigger + Lenis. 3D: Three.js via React Three Fiber and drei, lazy-loaded on the homepage only.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ (relative paths, deployable to any folder)
npm run preview  # serve dist/ locally
```

## Pages

Twelve HTML entries, each with its own URL, so direct links, refresh and back/forward work on any static host. Each sets `<body data-page>` and mounts the same React app (`src/main.tsx` → `src/App.tsx`). Routes are in `src/utils/routes.ts`.

| URL | Page | Nav item |
|---|---|---|
| `index.html` | Home: processor story, highlights, speaker and programme previews | Brand / Home |
| `about.html` | About the conference, organisers, key dates | About |
| `tracks.html` | Four technical tracks, their research areas and programme sessions | Tracks |
| `speakers.html` | Keynote speakers. `#guest-<id>` opens a profile. | Speakers |
| `guests.html` | Inaugural guests, IEEE Hyderabad Section, academic representatives (session chairs). `#guest-<id>` opens a profile. | Guests |
| `programme.html` | Event flow for Day 1 and Day 2. `#day-2` or `#<item-id>` deep-links. | Programme |
| `call-for-papers.html`, `events.html` | Call for papers, poster session | Call for Papers |
| `registration.html`, `sponsors.html` | Fees, sponsorship | Registration |
| `committee.html` | Conference and organizing committees | Committee |
| `venue.html` | Venue and contact | Venue |

To add a page: create `<name>.html` (copy an existing one and change `data-page`), add it to `pages` in `vite.config.ts` and to `PageKey`/`pages` in `src/utils/routes.ts`, then map it in `PAGES` in `src/App.tsx`.

## Structure

- Content is edited in the admin panel at `/admin` (see below). `src/content/types.ts` describes it, `src/content/schema.ts` defines the admin forms and validation, and `src/content/seed.ts` holds the content as migrated from the original data files (the fallback whenever the content service can't be reached).
- `src/data/conference.ts`, `src/data/guests/index.ts`, `src/data/guests/image-sources.ts`, `src/data/schedule.ts`: read the live content (`src/content/store.ts`) and keep the helpers the pages use. Each guest's `photo` holds the portrait files and source/licence notes.
- `src/components/loading/boot-screen.html`: the loading screen (IEEE Hyderabad Section logo, conference name, a thin progress bar). `vite.config.ts` injects it into every page; the bar tracks real milestones (fonts, app start, window load) and it never waits more than 1.2 s after the app starts. The 3D processor builds progressively behind the page after it lifts (`processor/textures.ts`, `Processor.tsx`), and a WebGL failure falls back to the static stage backdrop.
- `docs/source/ICCMM-26-track-schedule.pdf`: the organisers' full track schedule (not published on the site). Session rooms and chairs come from it via `src/data/schedule.ts`; paper lists and session in-charges are kept in the data but not shown.
- `src/components/guests/`: `Portrait` (4:5 crop with a placeholder plate), `GuestDialog`, role helpers.
- `src/components/hero/`, `processor/`, `sections/`, `navigation/`, `footer/`, `glass/`, `buttons/`, `shared/`: home story, 3D model, home sections, layout, liquid-glass material, buttons, shared UI.
- `src/animations/motion.ts`: smooth scroll, pointer, reveal/tilt/parallax/clip utilities, loader hand-off (`onBootDone`). `story.ts`: the scroll-story state and camera poses.
- `src/styles/`: `base.css` (tokens), `sections.css`, `interface.css`, `glass.css`, `pages.css` (About, Tracks, Guests, Event Flow).
- `docs/content-verification.md`: open questions for the organisers. `docs/guest-image-sources.md`: the portrait source record.

## Admin panel (CMS)

Go to **`/admin`** (for example `https://ieeeiccmm2026.vercel.app/admin`) and sign in. From there you can add, edit, reorder and delete everything shown on the site: guests and speakers (with photos and placeholders), keynote list, committees, the programme (days, items, lanes, chairs, papers), tracks, call for papers and author guidelines, poster session, important and poster dates, fees, sponsorship tiers, supporter logos, organiser text, the photo gallery, posters, downloadable PDFs, contact details, links (registration Google Form, CMT) and every page heading. Saved changes appear on the public site within about a minute (the page header button **View site** always shows the latest).

Uploaded images are converted on the server to WebP in the sizes the site uses (guest portraits 720×900 + 360 px, gallery 640 + 1200 px, posters full + 560 px, committee photos 256 px square, logos up to 1200 px). Uploads are limited to 4 MB (large photos are reduced in the browser first). The **Media library** lists every uploaded file and where it is used; a file can only be deleted once nothing uses it. **Dashboard → Download a backup** saves all content as JSON.

### How it works

- `api/cms.ts` is one Vercel serverless function (code in `server/`). `vercel.json` sends every `/api/*` request to it and `/admin` to `admin.html`.
- Public pages fetch `GET /api/content` before rendering (cached at Vercel's edge for 10 s). If it fails or takes over 2.5 s, the page uses the bundled `src/content/seed.ts`, so the site never breaks.
- Content is stored in **Firebase Firestore** (`cms_content`, one document per section, with a version number to stop two people overwriting each other). Uploaded files are stored in Firestore (`cms_files`, chunked) or, if `FIREBASE_STORAGE_BUCKET` is set, in Cloud Storage; either way they are served from `/api/media/<file>` with long-term caching. Nothing is written to Firestore until the first save; until then each section shows its original content.
- Security: one admin account from environment variables; the password is stored only as an scrypt hash; sessions are HMAC-signed HttpOnly, `SameSite=Strict` cookies scoped to `/api/admin` that last 8 hours; every change needs a CSRF token and a same-origin request; 6 wrong passwords lock an address out for 15 minutes; every save is validated on the server against `src/content/schema.ts` (types, lengths, safe links only, uploaded-file paths only); every upload is decoded and re-encoded (SVG and scripts are rejected). Firestore needs no client access, so its security rules can deny everything.

### Setup (once)

1. **Firebase**: in the [Firebase console](https://console.firebase.google.com) create a project (or use an existing one) and add **Firestore Database** (production mode, any region). Then *Project settings → Service accounts → Generate new private key*, which downloads a JSON file. Keep it secret.
2. **Admin password**: on your computer, in this folder, run `npm run admin:password` and type a password (10+ characters). It prints `ADMIN_PASSWORD_HASH=…` and `SESSION_SECRET=…`.
3. **Vercel → Project → Settings → Environment Variables** (Production), add:

| Variable | Value |
|---|---|
| `ADMIN_USERNAME` | The sign-in name, e.g. your email address |
| `ADMIN_PASSWORD_HASH` | From step 2 (starts with `scrypt:`) |
| `SESSION_SECRET` | From step 2 (changing it signs everyone out) |
| `FIREBASE_SERVICE_ACCOUNT` | The whole service-account JSON from step 1 (pasted as is, or base64-encoded) |
| `FIREBASE_STORAGE_BUCKET` | Optional. e.g. `your-project.appspot.com`, to keep uploads in Cloud Storage instead of Firestore (needs the Blaze plan) |

Instead of `FIREBASE_SERVICE_ACCOUNT` you can set `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL` and `FIREBASE_PRIVATE_KEY` separately. To change the password later, run step 2 again and replace `ADMIN_PASSWORD_HASH` (and `SESSION_SECRET` to sign out existing sessions), then redeploy.

4. Redeploy, open `/admin` and sign in.

### Running it locally

```bash
npm run admin:dev-env   # once: writes a git-ignored .env.local with a test login (password inside the file)
npm run dev             # site at http://localhost:5173, admin at http://localhost:5173/admin
```

Without Firebase variables, local development stores content and uploads in the git-ignored `.cms-data/` folder (`CMS_STORAGE=local`). Add the Firebase variables to `.env.local` to work against the real database. `npm run typecheck` checks both the site and the server code. `node scripts/cms-selftest.mjs` confirms every section of the seed passes the admin validation unchanged.

## Still to connect

- Committee portraits: 30 members have a photo (2 supplied, 20 from mjcollege.ac.in, see `docs/committee-photo-sources.md`, and 8 reused guest portraits). Members from other institutions show a monogram placeholder until approved photos are supplied.
- Guest consent for portraits, larger originals for the low-resolution ones (see `docs/guest-image-sources.md`).
- The open items in `docs/content-verification.md`.
- The processor is a procedural model (no external GLB). A licensed GLB can replace `Processor.tsx` if preferred.
