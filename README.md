# Big-Sam Auditions — Frontend (Next.js 15)

Public event site + React admin, built on the ThemeWagon "Symposium" base (Next.js 15, React 19, Tailwind).
It is a **pure client of the PHP backend API** — no server secrets here.

## Setup

```bash
npm install
```

Configure `.env.local` (already created for local dev):

```
NEXT_PUBLIC_API_URL=http://127.0.0.1:8080      # backend base URL
NEXT_PUBLIC_SITE_NAME=Big-Sam Vocal Auditions
```

For production, set `NEXT_PUBLIC_API_URL` to the backend's public **HTTPS** URL, and make sure the backend's
`FRONTEND_URL` env matches this app's origin (CORS).

## Develop / build

```bash
npm run dev      # http://localhost:3000
npm run build    # static export to ./out (output: "export")
```

The app is configured for **static export** (`next.config.mjs`), so it deploys to any static host / CDN
(Netlify, Vercel static, S3+CloudFront, Nginx). All data is fetched client-side at runtime from the API.

> Note: `NEXT_PUBLIC_API_URL` is inlined at **build time**. Rebuild after changing it.

## Pages

| Route | Purpose |
|---|---|
| `/` | Landing: hero + countdown, prizes podium, how-to-enter, about, sponsor strip, FAQ, CTA |
| `/apply` | Application form → M-Pesa STK push → live status polling → success/retry |
| `/status` | Check application status by reference + phone; retry payment |
| `/sponsors` | Sponsorship tiers + inquiry form |
| `/admin/login` | Admin sign-in (bearer token stored in `localStorage`) |
| `/admin` | Dashboard (stats, capacity, recent) |
| `/admin/applications` | List, filter, paginate, bulk SMS, detail drawer, shortlisting, CSV export |
| `/admin/payments` | Reconciliation, manual confirm, Daraja status query, CSV export |
| `/admin/sponsors` | Inquiries + logo management |
| `/admin/content` | CMS: content blocks (JSON-driven) + FAQs |
| `/admin/settings` | Site settings + admin users (admin role only) |

## Key files

```
src/
  lib/
    api.ts            fetch client (base URL, bearer token, error shape)
    types.ts          shared types
    useSiteContent.ts cached /api/content loader for the public site
    adminAuth.ts      admin guard hook + logout
  components/
    BigSam/           public site sections (Hero, Countdown, Sections, WhatsAppButton)
    Admin/            AdminShell (sidebar/guard) + ui helpers (badges, cards, toast)
    Layout/           Header, Footer, ConditionalChrome (hides public chrome on /admin)
  app/
    page.tsx, apply/, status/, sponsors/, admin/*
```

## Content management

Everything editable lives in the backend and is served via `/api/content`:
- **Settings** (fee, deadline, cap, event details, prizes, WhatsApp) → Admin → Settings.
- **Content blocks** (hero, about, how_to_enter, prizes, sponsor_tiers) → Admin → CMS Content. The structured `data`
  field is JSON and drives lists (podium, steps, tiers).
- **FAQs** and **sponsor logos** → Admin.

No code changes are needed to update event copy.
