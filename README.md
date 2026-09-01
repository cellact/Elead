# Elead

Two Vite apps that share `src/shared`. Vite + React + TypeScript.

| App | Name | Port |
| --- | --- | --- |
| `apps/example` | ExampleProvider | 5173 |
| `apps/console` | Elead Console | 5174 |

The apps do not link to each other.

## Run

```bash
cp apps/example/.env.example apps/example/.env
cp apps/console/.env.example apps/console/.env
npm install
npm run dev:example
npm run dev:console
```

- ExampleProvider home: `/`
- ExampleProvider allotting: `/allotting`
- ExampleProvider contact: `/contact`
- Elead Console: `/`
- Elead Console manage: `/manage`

## Scripts

- `npm run dev:example` — ExampleProvider on port 5173
- `npm run dev:console` — Elead Console on port 5174
- `npm run build` — typecheck and production build both apps
- `npm run preview:example` / `preview:console` — serve a build

Required env vars are listed in each app's `.env.example` and validated at startup in `src/shared/lib/env.ts`.
