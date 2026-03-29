# Flowstate

A spatial co-thinking tool where an AI agent and a founder jointly build and reshape a living map of strategic decisions — through gesture, not chat.

---

## The Starting Question

> *Every AI Agent application is essentially just a chat interface. Is this the best way, or can you design something better?*

Surface reading: a UX question. Actual question: why did an entire industry converge on one paradigm, is that convergence optimal, and what would you build if you started from first principles?

We spent weeks in the problem space before writing a line of code. What we found changed what we built.

---

## The Problem

Chat looks like one thing. It isn't. It's seven bundled design decisions — text as input, blank prompt box, strict turn-taking, linear thread, ephemeral context, language as control, single-channel output — shipped together because the technology suggested them, not because users needed them. The interface mirrors the technology's shape, not the user's needs.

The deepest issue is epistemological. Chat assumes you know what you want before you start: know, articulate, receive, evaluate. But real work — the kind that matters — runs the opposite direction: tinker, react, adjust, discover, refine, crystallize. **Intent is an output of thinking, not an input.** Chat demands specification before exploration, when exploration is how you arrive at specification.

Place any task on a spectrum from fully specified ("convert this PNG to JPG") to fully ambiguous ("help me figure out what to build"). Chat works on the left. It breaks moving right. Most valuable human work lives on the right.

And the failure isn't static — it's progressive. Work complexity grows quadratically as ideas accumulate and form relationships. The medium's capacity is fixed: linear text, one message at a time. The problems amplify each other. You can't show, so you describe — a gesture that would take one second becomes a sixty-second round trip. The agent doesn't volunteer reasoning, so you can't see why it chose a direction, so you can't efficiently redirect. You need to explore to find your intent, but exploration in chat requires the articulation you haven't found yet. Deadlock.

People start new conversations not because the task is done — because the conversation has decayed past usefulness. The user pays either way: stay and fight decay, or leave and lose everything.

---

## The Gap

The people who most need AI — founders structuring strategy, researchers in synthesis, product thinkers mapping a problem space — are the ones whose work is converting ambiguity into structure. They live on the right side of the spectrum full-time. Chat fails them most catastrophically, and their workarounds degrade precisely when the work is hardest.

No existing tool fills this space. Figma has space but no intelligence. Chat has intelligence but no space. Miro has spatial persistence but no agent. The intersection of intelligent agent, spatial persistence, and cheap restructuring is empty.

---

## What We Built

**Core loop: paste mess → agent structures → you gesture → handoff → agent restructures → repeat.**

You paste raw material — bullet points, brain dumps, half-formed strategy fragments. No need to organize first. The agent takes a first pass: clusters related fragments, names the clusters, draws connections, flags tensions. A spatial layout materializes from chaos.

You react by moving things. Drag two nodes together — "these are related." Pull something out of a cluster — "this doesn't belong here." Draw an arrow — "these are connected." Gesture as intent. No need to type "please move the mid-market node out of the SMB cluster because I think it deserves separate treatment."

When you're ready, you hit Handoff — an explicit "your turn" signal. The agent reads your spatial moves as structural decisions and restructures the space. When gesture isn't enough ("what's the biggest risk here?"), a text channel is there for escalation. The current prototype intentionally starts fresh on each visit while browser persistence stays disabled for startup stability.

Three structural breaks from chat:

**Gesture replaces articulation.** Dragging two nodes together takes one second. Describing the same intent in chat takes sixty. That's not a convenience improvement — it's a 60x cost reduction per structural move.

**Space replaces thread.** Ideas stay visible, arranged meaningfully. Clusters show what's related. Distance shows what's independent. Connections show dependencies. No scrolling through forty messages to find "that point where we decided X."

**Agent co-owns structure, not just content.** The AI doesn't just answer questions. It proposes clusters, names them, draws connections, flags tensions, restructures when the arrangement stops working. Structure is co-created, not assembled by the human from AI fragments.

The space IS the interface.

---

## Current Prototype Status

- Local-dev-first thinking map prototype. AI features currently run through the local Vite dev server.
- Browser persistence is intentionally disabled for stability right now, so each visit starts fresh.
- The bottom bar exposes the working loop: **Load Demo**, **Handoff**, text channel, **Undo**, and **Last diff**.
- If the default Anthropic provider is not configured, the app shows an AI readiness banner instead of pretending handoff worked.
- The agent currently draws its handoff output with standard tldraw primitives: grey `geo` cluster frames, `text` labels and annotations, and `arrow` connections and tensions.

---

## Quick Start

Requires [Node.js](https://nodejs.org/) `20.19+` or `22.12+`.

```bash
git clone https://github.com/shhubbh/flowstate.git
cd flowstate
npm install
echo "ANTHROPIC_API_KEY=xxxx" > .env.local
npm run dev
```

- Open [localhost:3000](http://localhost:3000).
- Hit **Load Demo** to populate the canvas with strategic fragments.
- Drag thought nodes around to restructure the map.
- Hit **Handoff** to let the agent regroup, connect, and annotate the canvas.
- Use the text channel (pencil icon) when gesture is not enough.
- Use **Undo** to roll back the last handoff and **Last diff** to reopen the latest change summary.

Optional provider setup:

- `ANTHROPIC_API_KEY` is required for the default model.
- `OPENAI_API_KEY` and `GOOGLE_API_KEY` are optional, only needed for non-default provider work.
- `.env.example` is available if you want a fuller template, but the one-line `.env.local` command above is the fastest path for a fresh clone.

---

## Recent Reliability Fix

The biggest recent handoff bug is fixed.

The failure looked fake-successful: the cursor moved, the agent animation ran, and then nothing changed on the canvas. The root cause was an SSE transport bug in `/api/stream`. The server treated the POST request as dead as soon as the request body finished, so the response stream stopped before the first `data:` event reached the browser.

That path now uses response-close lifecycle handling, request abort propagation, and regression tests. The result: `/api/stream` now emits real streamed actions again, and handoff resumes producing visible canvas mutations. Full write-up: [docs/current-status.md](docs/current-status.md).

---

## Built With

[tldraw](https://tldraw.dev) canvas SDK, React, Vite, and AI SDK provider integrations with Anthropic as the default local model path. `ThoughtNode` remains the main custom shape the user works with directly. Current agent handoff output is rendered with standard tldraw `geo`, `text`, and `arrow` artifacts tagged by note metadata. Legacy `ClusterShape` and `AgentAnnotation` files still exist in the repo, but they are not the primary handoff artifact path today. The visual identity is called Dark Observatory: dark canvas, glass-morphism nodes, grain texture, and semantic color that only appears when it carries meaning.

---

## Go Deeper

| Document | What it covers |
|----------|---------------|
| [Current implementation status](docs/current-status.md) | Current product behavior, runtime setup, and the handoff streaming fix history |
| [Problem Space — narrative](docs/problem-space-narrative.md) | The readable version of how chat fails, and why |
| [Problem Space — full analysis](docs/problem-space-final.md) | Five failure lenses, eight required properties, three personas, design brief |
| [Solution — narrative](docs/solution-narrative.md) | Historical narrative / pitch doc for the original hackathon framing |
| [Solution — V1 design](docs/solution-space-v1.md) | Historical design doc for the early interaction model |
| [Implementation plan](docs/implementation-plan.md) | Historical implementation plan from the earlier prototype phase |
| [DESIGN.md](DESIGN.md) | Full visual design system (Dark Observatory) |
