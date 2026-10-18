# BDITEC — WEWEB

Self-service marketing site for BDITEC (Hamburg): services, multilingual content (DE / EN / AR), and online checkout.

Built with **Vite + TypeScript** (MPA). Programmer / Developer / Owner: **Hasan Hamid**.

## Quick start

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
npm run preview
```

## Project structure

```
├── index.html                 # Home entry
├── services/*.html            # Service detail entries
├── public/                    # Static assets (images, robots, sitemap)
├── src/
│   ├── main.ts                # Home page entry
│   ├── service-page.ts        # Service page entry
│   ├── data/                  # Catalogs & priced packages
│   ├── features/
│   │   ├── booking/           # Self-service checkout (service → details → pay)
│   │   ├── hero/              # Hero motion, showcase slider
│   │   ├── shell/             # Header / footer / lang switch
│   │   └── accordion/         # FAQ accordion
│   ├── i18n/                  # DE / EN / AR copy
│   ├── styles/                # Global CSS
│   └── ui/                    # Shared SVG / UI snippets
├── .env.example               # Stripe Payment Links (live pay)
└── .brainum/                  # Brainum project config
```

## Checkout

1. Choose a service  
2. Enter details (receipt)  
3. Pay online  

Live card payments (optional later): copy `.env.example` → `.env` and set Stripe Payment Link URLs. Success redirect: `/?booking=success#booking`. Until then, local/demo checkout works without Stripe.

## Deploy (Vercel)

Project prepared: **bditec-weweb** (team HH7).

```bash
npx vercel login
npx vercel --prod --yes
```

Or deploy from the Vercel dashboard: https://vercel.com/hh-7/bditec-weweb  
Then attach custom domain `bditec.com` when ready.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local server (`127.0.0.1:5173`) |
| `npm run build` | Typecheck + production build |
| `npm run preview` | Serve `dist/` |

## Brainum

Linked profile `marketing-website` (v1.12.0). See `AGENTS.md` and `.brainum/`.
