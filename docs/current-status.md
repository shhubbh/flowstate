# Current Implementation Status

## Stage

Flowstate is currently a working, local-dev-first thinking-map prototype.

The product loop is real and usable, but it is still optimized for local development. AI features run through the local Vite server, and browser persistence is intentionally disabled for stability right now. Each visit starts fresh.

## Current Product Loop

1. Paste thoughts onto the canvas or hit **Load Demo**.
2. Rearrange `thought-node` cards to express structure spatially.
3. Hit **Handoff** when you want the agent to take a turn.
4. The agent restructures the map on the canvas itself.
5. Use the text channel when gesture is not enough.
6. Use **Undo** to restore the pre-handoff state and **Last diff** to inspect what changed.

### Current bottom-bar controls

- **Load Demo** loads the built-in founder strategy scenario and warns before clearing a non-empty canvas.
- **Text channel** is the escalation path for direct questions.
- **Handoff** runs the structural reasoning loop.
- **Undo** restores the last committed handoff snapshot.
- **Last diff** reopens the latest handoff summary.
- **AI readiness banner** appears when the local AI backend is not configured or not reachable.

## Current Canvas Model

### User-authored content

User-authored content is primarily the custom `thought-node` shape. That is the core object the user manipulates directly.

### Agent-authored content

The current handoff path renders agent output with standard tldraw primitives, not custom cluster/annotation shapes:

- Grey `geo` rectangles for cluster frames
- `text` for cluster labels and inline annotations
- `arrow` for relationships and tensions

These shapes are tagged with note metadata so the app can classify them, diff them, and clear previous agent scaffolding before a new handoff:

- `artifact:cluster-frame`
- `artifact:cluster-label`
- `artifact:annotation`
- `artifact:connection`
- `artifact:tension`

### Legacy custom shapes

Legacy `ClusterShape` and `AgentAnnotation` files still exist in the repo. They remain part of the historical prototype exploration, but they are **not** the current primary handoff artifact path.

## AI Runtime Behavior

### Required local setup

The default model is still pinned to `claude-sonnet-4-6`.

For a local clone, the minimum working setup is:

```bash
echo "ANTHROPIC_API_KEY=xxxx" > .env.local
npm run dev
```

Optional provider keys:

- `OPENAI_API_KEY`
- `GOOGLE_API_KEY`

Those are optional and only matter if the app is later extended to use non-default providers.

### Runtime endpoints

- `/api/status` checks whether the configured local backend is ready for the selected model/provider.
- `/api/stream` is the streaming handoff endpoint used by the agent request pipeline.

### Behavior when AI is not configured

If the backend is not ready:

- the readiness banner appears
- `Handoff` is disabled
- the text channel is disabled
- `Load Demo` remains available

This prevents the old fake-success behavior where the UI looked busy even though the AI path could not run.

## Recent Fix: Handoff Stream Transport Bug

### Symptom

The failure looked like a ghost handoff:

- the cursor moved
- the handoff animation ran
- nothing changed on the canvas
- later the user got a no-op warning

The model itself was not the blocker. Direct calls to `AgentService.stream()` produced real actions after the initial `think`, including `move` operations.

### Root cause

The bug lived in the dev SSE transport.

`scripts/vite-api-plugin.ts` used `req.destroyed` inside the `/api/stream` response loop as if it represented response liveness. In Node, a POST request can be marked destroyed immediately after the request body is consumed, even while the response stream is still open and writable.

That meant `/api/stream` stopped before the first `data:` frame ever reached the client.

### Fix

The stream path now uses response-close based lifecycle handling:

- extracted handler: `handleAgentStreamRequest`
- `AbortController` to cancel provider work when the client disconnects
- `req.on('aborted', ...)` and `res.on('close', ...)`
- `res.flushHeaders?.()` so SSE headers are pushed immediately
- guarded writes using response state, not request-body lifecycle
- `AgentService.stream(..., { abortSignal })` so the worker can be aborted cleanly
- regression tests around SSE delivery and abort behavior

### Validation

The fix was validated three ways:

1. `curl` against `/api/stream` now receives real `data:` frames
2. handoff resumes producing visible `move` / `create` canvas operations
3. automated validation passes:
   - `npx vitest run`
   - `npm run build`

## Known Constraints

- No browser persistence yet. Each visit starts fresh.
- AI features require the local dev server to be running.
- `ANTHROPIC_API_KEY` is required for the default model path.
- Demo mode clears the current canvas after confirmation.
- The current repo still contains some historical prototype code paths and shape files alongside the active handoff path.

## Historical Docs Map

Use the repo docs like this:

- `README.md` for fresh-clone onboarding
- `docs/current-status.md` for current product behavior and operational truth
- `docs/solution-narrative.md` for the original hackathon narrative
- `docs/solution-space-v1.md` for the original design framing
- `docs/implementation-plan.md` for the earlier implementation plan
- `docs/problem-space-final.md` and `docs/problem-space-narrative.md` for the underlying product thesis

The historical docs are still useful context, but they are not the current operational source of truth.
