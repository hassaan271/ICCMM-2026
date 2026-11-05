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

- `src/data/conference.ts`: general content (meta, about, tracks, CFP, fees, committee, supporters).
- `src/data/guests/index.ts`: guests and their programme roles. `src/data/guests/image-sources.ts` holds portrait files and rights status, kept separate from the bios.
- `src/data/schedule.ts`: the Day 1 and Day 2 schedule.
- `src/components/loading/boot-screen.html`: the loading screen. `vite.config.ts` injects it into every page, it shows once per browser session, and its progress bar tracks real milestones (fonts, app start, 3D scene ready on home, window load). It never waits more than 1.6 s after the app starts: the processor builds progressively behind the page (`processor/textures.ts` generates its surface maps in short slices, `Processor.tsx` uploads them and compiles shaders before fading the model in), and a WebGL failure falls back to the static stage backdrop.
- `src/components/guests/`: `Portrait` (4:5 crop with a placeholder plate), `GuestDialog`, role helpers.
- `src/components/hero/`, `processor/`, `sections/`, `navigation/`, `footer/`, `glass/`, `buttons/`, `shared/`: home story, 3D model, home sections, layout, liquid-glass material, buttons, shared UI.
- `src/animations/motion.ts`: smooth scroll, pointer, reveal/tilt/parallax/clip utilities, loader hand-off (`onBootDone`). `story.ts`: the scroll-story state and camera poses.
- `src/styles/`: `base.css` (tokens), `sections.css`, `interface.css`, `glass.css`, `pages.css` (About, Tracks, Guests, Event Flow).
- `docs/content-verification.md`: open questions for the organisers. `docs/guest-image-sources.md`: the portrait source record.

## Still to connect

- `links.registrationForm` in `src/data/conference.ts`: the Google Form URL (none supplied yet). Optionally set `links.registrationFormFields` to the form's pre-fill ids so the Full Name and Mobile Number from the Registration page carry over.
- Committee portraits: only members with a supplied photo show one (2 committee portraits, plus 8 members who are also published guests). The rest show a monogram placeholder until approved photos are supplied.
- Guest consent for portraits, larger originals for the low-resolution ones, and photos for Dr. Abhishek Ranjan and Prof. Krishna Reddy P. (see `docs/guest-image-sources.md`).
- The open items in `docs/content-verification.md`.
- The processor is a procedural model (no external GLB). A licensed GLB can replace `Processor.tsx` if preferred.
