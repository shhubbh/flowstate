# TODOS

## Returning-user landing page bypass
- **Status:** Obsolete
- **Reason:** The app now intentionally starts fresh on every visit while local browser persistence is disabled for startup stability. There is no saved canvas state to route around.
- **Closed:** 2026-03-29

## Handoff idle / no-op transport failure
- **Status:** Closed
- **Reason:** `/api/stream` stopped streaming after the POST body completed because the SSE lifecycle relied on request destruction instead of response liveness. The fix now lives in `handleAgentStreamRequest` and is documented in `docs/current-status.md`.
- **Closed:** 2026-03-29
