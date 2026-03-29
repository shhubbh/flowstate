# Thinking Map — AI Coding Guidelines

## Design System
Always read DESIGN.md before making any visual or UI decisions.
All font choices, colors, spacing, and aesthetic direction are defined there.
Do not deviate without explicit user approval.
In QA mode, flag any code that doesn't match DESIGN.md.

Key principle: **Color only has meaning.** Never add decorative color to UI chrome.
The only color on screen comes from semantic annotations (tension/insight/question)
and system states (error/warning/focus). If you're tempted to add a colored button
or accent, use warm grayscale instead.

**Exception:** The landing page (`client/components/landing/`) uses a white/black
cinematic aesthetic intentionally different from the warm design system. It is a
brand intro, not product UI. Do not apply DESIGN.md tokens to it.

## Testing
Run tests: `npx vitest run` | Test directory: `test/` | See TESTING.md for details.

- 100% test coverage is the goal — tests make vibe coding safe
- When writing new functions, write a corresponding test
- When fixing a bug, write a regression test
- When adding error handling, write a test that triggers the error
- When adding a conditional (if/else, switch), write tests for BOTH paths
- Never commit code that makes existing tests fail

## Handoff transport guardrails
- If you touch `/api/stream`, `scripts/vite-api-plugin.ts`, or `worker/do/AgentService.ts`, run `npx vitest run test/api-stream-handler.test.ts test/agent-service-stream.test.ts`.
- Do not use request-body lifecycle flags like `req.destroyed` as the SSE liveness signal. Use response-close and abort propagation instead.
- The current handoff loop depends on `/api/status`, `/api/stream`, and the standard artifact notes:
  - `artifact:cluster-frame`
  - `artifact:cluster-label`
  - `artifact:annotation`
  - `artifact:connection`
  - `artifact:tension`
