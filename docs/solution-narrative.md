# Solution Narrative: Thinking Map

> Historical planning/design document. For the current implementation status and recent reliability fixes, see [`docs/current-status.md`](current-status.md).

## The One-Liner

A spatial co-thinking tool where an AI agent and a founder jointly build and reshape a living map of strategic decisions — through gesture, not chat.

---

## Why This Exists

Chat is built for execution. The founder's work is discovery.

They dump messy fragments into ChatGPT, get useful pieces back, then manually assemble structure in Notion — alone. The AI generates content. The human does all the structural work: clustering, connecting, tracking what was tried and rejected. **The tool that should help with structuring requires pre-structured input.**

No existing tool combines intelligence + spatial persistence + cheap restructuring. Figma has space, no brain. Chat has brain, no space. The intersection is empty.

---

## What It Does

**Core loop: Import mess → Agent structures → User gestures → Handoff → Agent restructures → Repeat.**

1. **User pastes raw material** — bullet points, brain dumps, copy-pasted notes. Unstructured.

2. **Agent takes first pass** — clusters related fragments, names the clusters, draws connections, flags tensions. A spatial layout materializes from chaos.

3. **User reacts by moving things** — drags nodes apart (disagree with grouping), draws arrows (assert relationship), pulls something out of a cluster (doesn't belong). Gesture as intent. No need to verbalize "please move the mid-market node out of the SMB cluster because I think it deserves separate treatment."

4. **User hits Handoff** — explicit "your turn" signal. Agent reads the gestures as structural decisions, restructures the space, surfaces new connections, flags contradictions.

5. **Text channel for escalation** — when gesture isn't enough ("what's the biggest risk here?"), user types. Agent responds in text AND on the canvas.

The current prototype intentionally starts fresh on each visit while persistent workspaces remain deferred.

---

## Why Not Just a Better Chat

Three structural breaks from chat:

**Gesture replaces articulation.** Dragging two nodes together = "these are related." Takes 1 second. Describing the same intent in chat = 30 seconds of typing + 30 seconds of response. 60x cost reduction per structural move.

**Space replaces thread.** Ideas stay visible, arranged meaningfully. Clusters show what's related. Distance shows what's independent. Connections show dependencies. No scrolling through 40 messages to find "that point where we decided X."

**Agent co-owns structure, not just content.** The AI doesn't just answer questions. It proposes clusters, names them, draws connections, flags tensions, restructures when the arrangement stops working. Structure is co-created, not user-assembled from AI fragments.

---

## What the User Sees

~85% canvas (tldraw). Nodes = thought fragments. Clusters = grouped themes with labels. Arrows = relationships (color-coded: red for tension, blue for dependency). Small agent annotations (⚡❓💡) surface tensions, questions, insights.

Bottom strip: text input bar (collapsed by default) + Handoff button.

That's it. The space IS the interface.

---

## The Key Design Decisions

**Explicit handoff, not real-time.** Agent doesn't interrupt while you think. You signal when you're ready. Respects the user's cognitive flow.

**Canvas as shared workspace.** Both human and agent manipulate the same space. No "passing notes under a door." Pointing at the same thing.

**Gesture as primary input, text as escalation.** Invert chat's assumption. Movement first. Words when needed.

**Agent reads spatial intent.** "User moved X near Y" = structural signal the agent interprets and builds on. Not just layout — meaning.

---

## What This Demonstrates (Hackathon Framing)

Maps directly to the problem space findings:

| Problem Space Finding | How Thinking Map Addresses It |
|---|---|
| Chat forces specification before exploration | Start by dumping fragments. No blank prompt box. |
| No shared workspace ("passing notes under a door") | Canvas is co-owned. Both point at same things. |
| 30x cost mismatch per interaction | Drag = 1s. Full chat round-trip = 60s. |
| Interaction decay over long sessions | Spatial persistence. Structure visible. No scroll death. |
| Agent as servant, not partner | Agent proposes structure, flags tensions, pushes back. |
| Negative knowledge lost | Tensions and contradictions are first-class visual elements. |
| Output ≠ conversation | The map IS the output. No extraction tax. |

---

## Tech Stack

tldraw SDK (canvas) + React/Vite + Tailwind + Claude API (direct fetch). Three custom shapes: ThoughtNode, Cluster, AgentAnnotation. Connections via tldraw's built-in arrows. State lives in the active session only; cross-session browser persistence is currently disabled for stability.

---

## What's Cut (Intentionally)

Multi-agent architecture. Rollback/versioning timeline. Background agent work. Mobile. Voice input. Cross-session cloud persistence. These are real features for a real product — not for a hackathon prototype that proves the interaction paradigm.

---

*The bet: the interaction paradigm matters more than the feature set. If gesture + space + co-owned structure feels right for 5 minutes of demo, the thesis holds.*
