# SketchSnap Booth

A production-ready, privacy-first browser photo booth built with Next.js, TypeScript, Tailwind CSS, Framer Motion, the MediaDevices API, and the Canvas API. Photos stay in browser memory and are never uploaded.

## Run locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). `localhost` is treated as a secure camera context by modern browsers.

## Commands

```bash
npm run lint
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm start
```

Install Playwright's browser once before the first end-to-end run:

```bash
npx playwright install chromium
```

## Deploy to Cloudflare Pages

This project is exported as a static Next.js site because every camera, image, and Canvas operation runs locally in the browser. Cloudflare Pages serves the generated `out/` directory from its global network; no Worker or server-side runtime is required.

```bash
# Sign in once
npx wrangler login

# Build and deploy the production branch
npm run deploy
```

The production URL defaults to `https://sketchsnap-booth.pages.dev`. Override `NEXT_PUBLIC_SITE_URL` before building if the Pages project receives a different subdomain or a custom domain. The checked-in `public/_headers` file adds immutable caching for Next.js bundles and restricts camera permission to the site itself.

To preview the exported site through Wrangler:

```bash
npm run build
npm run preview
```

## Browser support and camera behavior

Current Chrome, Edge, Safari, and Firefox are supported. Camera access requires HTTPS in production and begins only after the user presses **Allow camera**. The app distinguishes denied, unavailable, busy, unsupported, and insecure-context failures and always offers uploads as a recovery route. Camera switching appears when multiple video inputs are available. Web Share file support varies; unsupported browsers copy a share message and retain normal downloads.

## Privacy architecture

- No API routes, database, analytics, image logging, or photo network requests.
- Camera frames become in-memory blobs and object URLs.
- Uploaded files are decoded locally.
- Object URLs are revoked and camera tracks stop on exit/unmount.
- Canvas produces all previews and exports in the browser.

## Project structure

- `app/` — App Router entry, metadata, SEO routes, and global styles
- `components/booth/` — original booth SVG
- `components/camera/` — permission and four-shot camera sequence
- `components/upload/` — validated four-image workflow
- `components/editor/` — frame/filter controls and Canvas preview
- `components/printing/` — printer animation and opt-in sound
- `components/result/` — download, share, and scissors experience
- `lib/` — camera, crop, Canvas, validation, download, and sharing utilities
- `config/brand.ts` — replaceable brand copy
- `tests/` — Vitest unit tests and Playwright journeys

## Customize the product

Change the brand name and messaging only in `config/brand.ts`.

To add a filter, extend `FilterId` in `types/photo.ts`, then add a Canvas-compatible filter definition in `lib/filters.ts`. Because preview and export share the same renderer, the new filter automatically affects both.

To add a frame, extend `FrameId`, add its palette in `lib/canvas.ts`, and add its swatch in `components/editor/StripEditor.tsx`.

The visible reference study and implementation checklist are in `docs/reference-analysis.md`.
