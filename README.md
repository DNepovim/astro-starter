# Astro Starter — Recurring Event Website

A production-ready starter template for recurring annual events (festivals, gatherings, meetups). Built with Astro, Tailwind CSS v4, and deployed on Vercel.

## Stack

- **[Astro 5](https://astro.build)** — Static site generator with MDX content collections
- **[Tailwind CSS v4](https://tailwindcss.com)** + **[tailwindcss-motion](https://rombo.co/tailwind/)** — Styling and animations
- **[@vercel/og](https://vercel.com/docs/functions/og-image-generation)** — Dynamic OG image generation
- **[Swup](https://swup.js.org)** — Smooth page transitions
- **[Vercel](https://vercel.com)** — Hosting with Web Analytics
- **[Umami](https://umami.is)** — Optional privacy-friendly analytics
- TypeScript, ESLint, Prettier, knip

## Project Structure

```
src/
├── components/         # Reusable Astro components
│   ├── Cover.astro     # Hero image with scroll-blur effect
│   ├── Gallery.astro   # Masonry photo grid with lightbox
│   ├── Lightbox.astro  # Full-screen image viewer (vanilla JS)
│   ├── EventSchema.astro # JSON-LD structured data
│   ├── ItemsLine.astro # Horizontal names display
│   ├── SeasonTile.astro # Edition card for footer/navigation
│   └── Seasons.astro   # "Previous editions" section
├── content/
│   └── events/         # MDX files — one per edition (e.g. 2023.mdx)
├── layouts/
│   └── Layout.astro    # Main layout with analytics
├── pages/
│   ├── index.astro     # Home — shows the latest edition
│   ├── event/[id]/     # Edition detail + gallery pages
│   └── og/[id].jpg.ts  # Dynamic OG images
└── utils/
    └── schema.ts       # JSON-LD schema builders
```

## Getting Started

### 1. Set up environment variables

Copy `.env.example` to `.env` and fill in:

```env
SITE_URL=https://your-site.com
ENV_NAME=production
UMAMI_SITE_ID=your_umami_id   # optional
```

### 2. Add your images

Place images in the `public/images/` directory, organised by year:

```
public/
└── images/
    ├── 2023/
    │   ├── cover.jpg
    │   ├── 01.jpg
    │   └── ...
    ├── 2024/
    │   └── ...
    └── ...
```

### 3. Add your content

Edit or add MDX files in `src/content/events/`. Each file maps to one edition:

```yaml
---
startDate: 2026-07-18T18:00:00
endDate: 2026-07-18T23:59:00
cover: /images/2026/cover.jpg
claim: "A short, evocative tagline for this edition."
externalLink: https://facebook.com/your-event  # optional
images:
  - /images/2026/01.jpg
  - /images/2026/02.jpg
performers:
  - name: Band Name
    genre: indie rock
schedule:
  - name: Gates open
    startDate: 2026-07-18T17:00:00
    location: Main entrance
---

## Your content here (MDX)
```

### 4. Customize

- **Site name / tagline**: `src/layouts/Layout.astro`, `src/components/MetaTags.astro`, page files
- **Contact / location**: `src/components/Footer.astro`
- **Organizer info for SEO**: `src/utils/schema.ts`
- **Fonts**: `src/styles/global.css` (currently using Google Fonts: Playfair Display + Inter)

## Commands

```sh
pnpm install      # Install dependencies
pnpm dev          # Start dev server at localhost:4321
pnpm build        # Build for production
pnpm preview      # Preview production build
pnpm typecheck    # TypeScript check
pnpm lint:check   # ESLint
pnpm format:write # Prettier
```
