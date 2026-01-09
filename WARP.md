# WARP.md

This file provides guidance to WARP (warp.dev) when working with code in this repository.

## Commands

- Install dependencies: `npm install`
- Start the development server (Next.js on http://localhost:3000): `npm run dev`
- Create a production build: `npm run build`
- Start the production server (after `npm run build`): `npm run start`
- Lint the entire project with ESLint/Next.js config: `npm run lint`
- Lint specific files (pass paths after `--`): `npm run lint -- app/page.tsx lib/mongodb.ts components/EventCard.tsx`

Tests are not currently configured (there is no `test` script in `package.json`). If you add a test runner, also add an npm script so future agents can run tests via `npm test`.

## High-level architecture

### Framework and tooling

- Next.js 16 App Router using TypeScript and React 19 (`next`, `react`, `react-dom` in `package.json`).
- Styling is handled by Tailwind CSS 4 with PostCSS (`@tailwindcss/postcss`, `tailwindcss`) plus a small amount of custom CSS.
- Linting uses ESLint 9 with the flat config from `eslint.config.mjs`, layering `eslint-config-next/core-web-vitals` and `eslint-config-next/typescript`.
- TypeScript configuration in `tsconfig.json` enables strict type checking and sets up the `@/*` path alias to the repository root.

### Routing and top-level layout

- Next.js App Router structure lives under the `app/` directory.
- `app/layout.tsx` is the root layout:
  - Imports global styles from `app/globals.css`.
  - Loads Google fonts (`Schibsted_Grotesk`, `Martian_Mono`) via `next/font` and exposes them as CSS variables used in the Tailwind theme.
  - Renders the persistent `Navbar` and the animated `LightRays` background effect around the `children` route content.
  - Exposes page-level metadata (`title`, `description`) via `export const metadata`.
- `app/page.tsx` is the main landing page:
  - Renders the hero heading and subheading.
  - Uses `ExploreBtn` for in-page navigation.
  - Renders the featured events list by mapping over `events` from `lib/constants` and delegating item rendering to `EventCard`.

### Components

All React components live under `components/` and are intended for reuse across pages:

- `Navbar.tsx`
  - Global navigation bar rendered in the root layout.
  - Uses `next/link` for navigation and `next/image` for the logo.
  - Navigation items currently include `Home`, `Events`, and `Create Events`.

- `EventCard.tsx`
  - Presentational card used to display a single event from `lib/constants`.
  - Uses `next/image` for the event poster and small iconography (location, date, time).
  - Wraps the card in a `next/link` to `/events/[slug]` based on the `slug` property of each event.

- `ExploreBtn.tsx`
  - Client component (`"use client"`) that renders a styled button linking to the events section via an in-page anchor (`#events`).
  - Uses `next/image` for the arrow icon.

- `LightRays.jsx`
  - Client-only component that renders an animated WebGL background using `ogl`.
  - Uses a `Renderer`, `Program`, `Triangle`, and `Mesh` to draw a full-screen fragment shader.
  - React hooks are used to manage:
    - IntersectionObserver (only animates when visible).
    - WebGL renderer and mesh lifecycle (creation, resize handling, cleanup including `WEBGL_lose_context`).
    - Mouse tracking with smoothing when `followMouse` is enabled.
  - Visual parameters (origin, color, speed, length, noise, distortion, mouse influence, etc.) are driven by props and written into shader uniforms.
  - Container-specific styling is in `components/LightRays.css`.

### Styling and design system

- Global styles live in `app/globals.css` and are built on Tailwind CSS 4 utilities:
  - Tailwind and the `tw-animate-css` plugin are imported at the top.
  - A set of CSS custom properties (`--color-*`, `--radius`, `--background`, etc.) define the design tokens (colors, radii, layout tokens).
  - `@theme inline` maps these tokens into Tailwind-friendly variables (e.g., `--color-primary`, `--font-schibsted-grotesk`).
  - Utility macros like `flex-center`, `text-gradient`, `glass`, and `card-shadow` encapsulate frequently used patterns.
  - `@layer base` defines base styles for `body`, `main`, headings, and lists.
  - `@layer components` defines higher-level component styles, including:
    - Layout and appearance for `header`/`nav` and the sticky glass navbar.
    - The `#explore-btn` button and its internal layout.
    - The `.events` grid and `#event-card` structure for event listings.
    - A richer layout for an `#event` page (header, details, booking, agenda, pills, booking form), even though the corresponding page file is not yet present in `app/`.
- PostCSS configuration (`postcss.config.mjs`) wires in `@tailwindcss/postcss` as the sole plugin.

### Data and utilities

- `lib/constants.ts`
  - Exports a typed `EventItem` and an `events` array containing static event metadata.
  - Each event includes an imported image, title, slug, location, date, and time.
  - This data currently powers the featured events list on the landing page.

- `lib/utils.ts`
  - Defines a single `cn` helper that composes class names using `clsx` and merges them with `tailwind-merge` to avoid conflicting Tailwind classes.
  - This utility should be used for any conditional or merged class name logic in new components.

- `lib/mongodb.ts`
  - Provides a shared MongoDB connection helper built on `mongoose`.
  - Caches the connection in `global.mongoose` to survive hot reloads in development while still behaving correctly in serverless environments.
  - Requires the `MONGODB_URI` environment variable; throws an error at module initialization time if it is missing.
  - Not currently imported by any route or component; it is the intended entry point if you add database-backed features.

### Configuration

- `next.config.ts`
  - Enables the React Compiler (`reactCompiler: true`).
  - Enables `experimental.turbopackFileSystemCacheForDev` to speed up dev builds when using Turbopack.

- `eslint.config.mjs`
  - Uses ESLint flat config via `defineConfig`.
  - Spreads the Next.js core-web-vitals and TypeScript presets from `eslint-config-next`.
  - Overrides default ignores using `globalIgnores` to skip `.next/**`, `out/**`, `build/**`, and `next-env.d.ts`.

- `tsconfig.json`
  - Enables `strict` mode and common Next.js TypeScript options (`noEmit`, `isolatedModules`, `moduleResolution: "bundler"`, etc.).
  - Defines a path alias `@/*` that maps to the repository root, used throughout the codebase (`@/components/...`, `@/lib/...`).
  - Includes `.next` type-generation directories for improved type safety with Next.js.

## Notes for future agents

- Prefer the `@/*` import alias for any new modules under `app/`, `components/`, or `lib/` to keep imports consistent.
- When adding new UI, reuse the design tokens and utilities defined in `app/globals.css` (e.g., `glass`, `text-gradient`, Tailwind theme variables) rather than introducing ad-hoc styles.
- If you introduce automated tests, add an explicit npm script (e.g., `"test": "<runner>"`) so tests can be run via `npm test` or `npm run test` and document any test runner-specific CLI in this file.