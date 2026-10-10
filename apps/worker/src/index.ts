/**
 * Background worker skeleton.
 *
 * Next implementation:
 * 1. Consume a Redis-backed queue.
 * 2. Load the job and verify its status/idempotency key.
 * 3. Generate missing assets only.
 * 4. Render a Remotion composition in an isolated worker.
 * 5. Upload MP4 and update status.
 * 6. Record provider usage and cost.
 *
 * Do not execute paid provider calls until per-user quotas and job idempotency exist.
 */
console.log("AI Explainer Studio worker scaffold ready. Queue adapter is not configured yet.");
