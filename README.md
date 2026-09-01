# Elead

Two-sided frontend for clients and service providers. Vite + React + TypeScript.

## Run

```bash
cp .env.example .env
npm install
npm run dev
```

- Client studio: `/user`
- Contact / private line: `/user/contact`
- Provider studio: `/provider`
- Provider manage: `/provider/manage`

## Scripts

- `npm run dev` — Vite dev server
- `npm run build` — typecheck and production build
- `npm run preview` — serve the build

Required env vars are listed in `.env.example` and validated at startup in `src/shared/lib/env.ts`.