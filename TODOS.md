# TODOS

## Returning-user landing page bypass
- **Severity:** Medium (UX)
- **File:** `client/App.tsx:62`
- **Issue:** App always shows the cinematic landing page, even when the canvas has saved state from a prior session (`persistenceKey: "thinking-map"` persists to localStorage). Returning users should skip the landing page and go straight to their canvas.
- **Fix:** Check localStorage for existing `thinking-map` data on mount. If found, skip landing and render canvas directly.
- **Found by:** /plan-eng-review + Codex outside voice, 2026-03-28
