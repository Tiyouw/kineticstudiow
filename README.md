# Kinetic Studiow — website

Portfolio + premade-mascot shop for **Kinetic Studiow** (Fatwa, retro cartoon mascot illustrator, Jember).
Built by **tiyoouw** (Tiyo). Orders go to WhatsApp with prefilled messages; there is no checkout.

- Live: https://www.kineticstudiow.my.id (the apex `kineticstudiow.my.id` redirects to `www`)
- Editors: https://www.kineticstudiow.my.id/studio (Sanity Studio, Indonesian, with a "Panduan" guide pane)
- Repo: github.com/Tiyouw/kineticstudiow (public). A push to `main` deploys to production on Vercel.

## Stack

- Next.js 15.5 (App Router), React 19, TypeScript, plain CSS
- Sanity 4 as CMS (`next-sanity` 11). **Stay on Sanity 4 while on Next 15**: Sanity 5 needs a newer React than Next 15 bundles and the build breaks.
- Vercel hosting + Web Analytics
- Languages: `/en` (default, the target market) and `/id`. Bare paths redirect to `/en`.

## Develop

```bash
npm install
vercel env pull .env.local   # or copy the Sanity vars from Vercel
npm run dev                  # http://localhost:3000 -> /en
```

The Sanity CLI needs Node 20.19+ / 22 (`npx -y node@22 node_modules/sanity/bin/sanity ...` on older machines).

## Where things are

| Path | What |
|---|---|
| `src/app/[lang]/` | pages: home, work, shop, shop/[slug], custom-order, about, not-found, catch-all 404 |
| `src/app/studio/` | the Sanity Studio route (`/studio`, noindex) |
| `src/app/api/revalidate/` | Sanity webhook target: clears the `sanity` cache tag |
| `src/app/sitemap.ts`, `robots.ts` | SEO endpoints (all pages × both languages, hreflang) |
| `src/app/[lang]/**/opengraph-image.tsx` | share cards (site + one per product) |
| `src/content/index.ts` | data layer: GROQ queries, `getCopy`, `getWa`, price formatting |
| `src/content/data.ts` | the original placeholder content, now only the seed source |
| `src/i18n/` | page copy in EN and ID; the code defaults for the CMS "Teks halaman" docs |
| `src/sanity/` | schemas, Studio structure, the editors' guide (`Guide.tsx`), copy merge helpers |
| `sanity.config.ts`, `sanity.cli.ts` | Studio and CLI config (project `yqf1n0yb`, dataset `production`) |
| `src/lib/site.ts` | `SITE_URL`, social links, contact email, canonical/hreflang helper |
| `src/lib/whatsapp.ts` | default WhatsApp number and templates (the CMS overrides them) |
| `src/lib/img.ts` | srcset helper for the WebP brand art in `public/assets/` |
| `scripts/seed-sanity.ts` | one-time seed of the CMS from `data.ts` (uses `createIfNotExists`) |
| `.github/workflows/sanity-backup.yml` | weekly CMS backup |
| `.github/workflows/schedule.yml` | every 15 min: scheduled Journal posts go live + to Threads (calls `/api/schedule`) |
| `src/sanity/stats/Stats.tsx`, `src/app/api/stats/` | Studio "Statistik" tool: visitors (Cloudflare Web Analytics), WhatsApp/email clicks, Threads insights |
| `src/components/TrackClicks.tsx`, `src/app/api/track/` | counts WhatsApp/email CTA clicks (kind via `data-track`, mascot via `data-slug`) into private `secrets.stats.<day>` docs |
| `src/sanity/agenda/` | Studio "Agenda" tool: list, calendar and kanban, quick add, slots and queue |

## How content flows

1. Fatwa edits in `/studio` and clicks **Publish**.
2. A Sanity webhook calls `POST /api/revalidate` (secret `SANITY_REVALIDATE_SECRET`), which runs `revalidateTag("sanity")`.
3. The site shows the change in a few seconds. Without the webhook, pages still refresh every hour.

Page copy: each `copy_<page>` document in the CMS mirrors a dictionary in `src/i18n/`. A filled CMS field wins;
an empty one falls back to the code. **So after editing a string in code, also change (or clear) it in the CMS**,
or the old CMS value keeps showing. New keys added in code appear in the Studio automatically, empty.

Images uploaded to Sanity are served through its CDN with `auto=format` (AVIF/WebP) and a width cap, so editors
can upload JPG/PNG as they are.

## Accounts and services

Credentials live in Tiyo's enowX vault (by name) or in Vercel env vars, never in the repo.

| Service | What for | Access |
|---|---|---|
| Vercel (project `kineticstudiow`) | hosting, env vars, analytics | vault `vercel` |
| GitHub `Tiyouw/kineticstudiow` | code, Actions backup (secret `SANITY_READ_TOKEN`) | vault `github` |
| Sanity `kineticstudiow-cms` (`yqf1n0yb`) | CMS. Members: Tiyo, Kinetic's Google account | sanity.io/manage |
| Cloudflare (zone `kineticstudiow.my.id`) | DNS + Email Routing | vault `cloudflare-tiyo` |
| Google Search Console | indexing (verified by DNS TXT) | Tiyo's Google account |

Env vars (Vercel, production + preview): `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`,
`SANITY_API_READ_TOKEN`, `SANITY_API_WRITE_TOKEN`, `SANITY_REVALIDATE_SECRET`, `SANITY_STUDIO_*`, `SANITY_API_*`.
Threads/scheduling: `THREADS_APP_ID`, `THREADS_APP_SECRET`, `CRON_SECRET` (Vercel daily cron), `SCHEDULE_SECRET`
(also a GitHub Actions secret: the 15-minute schedule workflow; Vercel Hobby crons run only daily).
Statistik (visitors): `CLOUDFLARE_ANALYTICS_TOKEN` (Account Analytics: Read), `CLOUDFLARE_ACCOUNT_ID`, `CF_SITE_TAG`
(server, for the GraphQL query) and `NEXT_PUBLIC_CF_BEACON_TOKEN` (the public beacon token from Cloudflare → Web Analytics;
the beacon script loads only when it is set). Without them the Statistik tool shows clicks and Threads only.
Optional: `NEXT_PUBLIC_SITE_URL` (overrides the canonical domain), `NEXT_PUBLIC_GSC_VERIFICATION`.

DNS (Cloudflare, both **DNS only**, not proxied):
`A @ 216.198.79.1` and `CNAME www → <project>.vercel-dns-017.com`, plus Cloudflare Email Routing MX/SPF/DKIM
and the Google verification TXT.

Email: `hello@kineticstudiow.my.id` is a Cloudflare Email Routing rule forwarding to a Gmail inbox
(forward only; replying *as* hello@ needs Gmail "Send mail as" with an SMTP service).

## Backup and restore

Every Monday 03:00 WIB (and on demand: Actions → "Sanity backup" → Run workflow) the CMS is exported
(published documents + images) as a workflow artifact kept 90 days.

Restore: download the artifact, unzip it, then

```bash
SANITY_AUTH_TOKEN=<a write/admin token> npx sanity dataset import kinetic-sanity-<date>.tar.gz production --replace
```

## Moving to a new domain (e.g. .com)

1. Add the domain to the Vercel project; point its DNS at Vercel (DNS only).
2. Set `NEXT_PUBLIC_SITE_URL=https://www.<new>` in Vercel and redeploy (or change the fallback in `src/lib/site.ts`).
3. Make the old `.my.id` domain 301-redirect to the new one (Vercel → Domains → Redirect).
4. Sanity → API → CORS origins: add `https://www.<new>`. Update the Studio URL in sanity.io/manage.
5. Update the hard-coded domain in the share cards (the `opengraph-image.tsx` files), the Studio guide link (`src/sanity/Guide.tsx`) and the email domain in `src/lib/site.ts`, Footer and About, plus Cloudflare Email Routing.
6. Search Console: add the new property and use **Change of address**; submit the new sitemap. Same in Bing Webmaster Tools.

## Gotchas

- Don't call `headers()`/`cookies()` in `src/app/[lang]/not-found.tsx`: Next renders it into every page, so the whole site would turn dynamic. It renders both languages and picks one on the client.
- The 404 for unknown paths is drawn by JavaScript after load (Next 15 sends the layout in the RSC payload only). Status is still 404 and it is noindex. Revisit when upgrading to Next 16.
- Vercel Web Analytics ignores headless/bot visits, so automated checks don't show up there.
- `mix-b` branch / `Kinetic-b` worktree holds the alternative design (Mix B). Keep it.
