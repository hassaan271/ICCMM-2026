# ICCMM-26 website

React 19 + TypeScript, built with Vite. Motion: GSAP/ScrollTrigger + Lenis. 3D: Three.js via React Three Fiber and drei, lazy-loaded on the homepage only.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static output in dist/ (relative paths, deployable to any folder)
```

## Pages

Seven HTML entries keep their URLs (`index.html`, `call-for-papers.html`, `registration.html`, `committee.html`, `events.html`, `sponsors.html`, `venue.html`). Each sets `<body data-page>` and mounts the same React app (`src/main.tsx` → `src/App.tsx`).

## Structure

- `src/data/conference.ts`: all content, including `speakers`, `programme`, `portraits`, `supporters`. Edit this, not the components.
- `src/lib/motion.ts`: smooth scroll, shared pointer, reveal/tilt/parallax/clip utilities.
- `src/lib/story.ts`: scroll-story state and the camera/explode poses (one per chapter).
- `src/components/three/`: `ProcessorScene` (canvas, studio lighting, camera rig), `Processor` (layered package model), `textures.ts` (procedural die, substrate, lid and interconnect maps).
- `src/components/home/`: `ArchitectureStory` (pinned stage, hero, five chapters), `HomeSections` (highlights, speakers, programme, registration, venue, supporters).
- `src/components/layout/`: navigation, footer, floating register pill, SVG filters.
- `src/components/ui/`: `LiquidButton`, `GlassPanel`, `Accordion`, `Segmented`, page header, timeline.
- `src/pages/`: one component per page.

## Still to connect

- `links.registrationForm` in `src/data/conference.ts` (no registration URL supplied yet).
- `speakers` and `programme` entries once announced.
- The processor is a procedural model (no external GLB). A licensed GLB can replace `Processor.tsx` if preferred.
