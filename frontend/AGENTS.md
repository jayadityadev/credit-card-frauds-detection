# Frontend Agent Notes

This frontend uses Next.js App Router with TypeScript and Tailwind. Treat [../.github/copilot-instructions.md](../.github/copilot-instructions.md) as the repo-wide source of truth, then apply the frontend rules below.

## What matters here

- App code lives in [app/](app/) and components live in [app/components/](app/components/). There is no `src/` directory.
- Client-side inference goes through [lib/api.ts](lib/api.ts). Do not add Next.js API routes for prediction.
- The main UX is CSV-row paste and parse, not a manual 30-field form.
- The backend response includes an Isolation Forest anomaly score plus LR, RF, and consensus verdicts. Keep the TypeScript contract aligned with that shape.
- `NEXT_PUBLIC_API_URL` should come from [.env.local](.env.local) and default to `http://localhost:8000`.

## Editing rules

- Prefer small, focused UI changes that preserve the current layout language.
- If you touch Next-specific behavior, verify against the installed Next docs in `node_modules/next/dist/docs/` because the project is on Next 16.2.4, not the older App Router examples most models know.
- Keep frontend behavior consistent with the backend contract: no SSR prediction calls, no direct model logic in the UI, and no assumptions that Isolation Forest returns a binary fraud label.
