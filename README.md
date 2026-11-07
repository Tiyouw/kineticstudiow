# Kinetic Studiow — website

Portfolio + premade-mascot shop for **Kinetic Studiow** (retro cartoon mascot illustrator, Jember).
A collab with **tiyoouw** (website). Orders go to WhatsApp with prefilled messages; no checkout.

- Next.js 15 (App Router) + React 19 + TypeScript, deployed on Vercel
- Bilingual: `/id` (default) and `/en`
- Design source: enowX canvas "Kinetic Mix A — Sablon Varsity"

## Develop

```bash
npm install
npm run dev     # http://localhost:3000 -> /id
npm run build
```

## Where things are

| Path | What |
|---|---|
| `src/app/[lang]/` | pages: home, work, shop, shop/[slug], custom-order, about |
| `src/content/` | products, projects, client marks, testimonials (typed; a CMS will replace `data.ts`) |
| `src/i18n/` | copy in ID and EN (`common.ts` shared, `pages/*` per page) |
| `src/lib/whatsapp.ts` | WhatsApp number and message templates |
| `src/styles/kinetic.css` | design CSS ported from the canvas (`scripts/port-css.py`) |
| `src/styles/site.css` | real-browser adjustments (responsive, fixed overlays) |
| `public/assets/` | brand assets (placeholders for real work/product images) |
| `public/tiyoouw-mark.js` | tiyoouw logo web component (loader + footer credit) |
