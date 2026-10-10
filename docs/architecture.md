# Architecture decisions

## Request path
Browser -> Next.js API -> validate input -> reserve user quota -> enqueue job -> return job ID.
Worker -> script/voice/visual providers -> Remotion/FFmpeg render -> object storage -> mark complete.

## MVP video styles
- `animated_infographic`: icon-like assets, labels, simple transforms
- `whiteboard`: light background, drawn strokes and reveal animations
- `cinematic`: generated stills with pan/zoom, transitions and subtitles
- `minimal_motion`: typography and geometry

These are templates over a shared storyboard contract, not four separate generation systems.

## Job states
`queued -> processing -> completed | failed | cancelled`

Use an idempotency key per generation request. Persist provider request IDs where available. Retry only transient failures, cap attempts, and do not retry validation errors blindly.

## Cost safety
- Estimate credits before enqueueing.
- Reserve credits atomically.
- Enforce max duration, scene count, prompt length, file size and concurrent jobs.
- Cache deterministic script/audio outputs when safe and consented.
- Track estimated and actual cost per provider call.
- Release reserved credits on terminal failure according to documented policy.

## Security
- Authenticate every mutation.
- Verify project ownership server-side.
- Never trust a client-provided owner ID or asset URL.
- Keep service-role and provider keys server-side.
- Use signed URLs for private assets.
- Sanitize captions and never execute model-generated code.
