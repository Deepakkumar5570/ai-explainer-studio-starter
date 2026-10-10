# AI Explainer Studio — MVP starter

A Hindi-first script-to-video starter for 30–60 second explainer videos.

## What this starter includes
- Next.js App Router + TypeScript UI for topic, style, duration and aspect ratio.
- A validated storyboard schema using Zod.
- A provider-neutral script generation route with a deterministic demo fallback.
- A queue/job contract and worker skeleton.
- Remotion composition starter and FFmpeg rendering notes.
- Supabase/Drizzle integration points, environment template, and cost/safety checklist.

## Important status
This is a **starter scaffold**, not a deployed service. The script route works in demo mode without an API key. Real LLM/TTS/image provider calls, authentication, database persistence, queue infrastructure and production rendering still need to be configured.

## Requirements
- Node.js 20+
- pnpm 9+
- An OpenAI API key (optional for demo; required for live script generation)

## Run locally
```bash
pnpm install
cp .env.example .env.local
pnpm dev
```
Open http://localhost:3000.

## Project layout
- `apps/web`: Next.js application
- `apps/worker`: worker contract and processing skeleton
- `packages/shared`: Zod schema and shared types
- `packages/video-engine`: Remotion starter composition

## Suggested implementation order
1. Make script generation real and validate output against the schema.
2. Add Hindi TTS provider adapter and store audio assets.
3. Add Supabase Auth/Storage and Drizzle schema.
4. Add Redis-backed queue and idempotent job creation.
5. Add Remotion render worker and MP4 storage.
6. Add provider cost tracking, quotas, retry limits and observability.

## Environment variables
See `.env.example`. Never expose provider secrets with `NEXT_PUBLIC_` prefixes.

## Production cautions
- Keep render jobs outside Vercel request handlers.
- Add authentication and project ownership checks before exposing paid generation endpoints.
- Apply per-user rate limits and daily credits before calling providers.
- Do not trust model output; validate all JSON and limit scene count, text length, duration and asset URLs.
- Confirm current provider pricing, Hindi quality, commercial terms and Remotion licensing before launch.
