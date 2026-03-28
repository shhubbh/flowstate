# Thinking Map-

A spatial co-thinking tool where an AI agent and a founder jointly build and reshape a living map of strategic decisions — through gesture, not chat.

## The Problem

Chat forces specification before exploration. Founders whose work is structuring the unstructured have no tool combining intelligence + spatial persistence + cheap branching. See [docs/problem-space-narrative.md](docs/problem-space-narrative.md).

## The Solution

A persistent 2d canvas where thought fragments become draggable nodes. The user arranges, connects, and moves nodes to express spatial intent. An AI agent reads the spatial arrangement and structures it — creating clusters, drawing connections, flagging tensions. See [docs/solution-narrative.md](docs/solution-narrative.md).

## Quick Start

```bash
cp .dev.vars.example .dev.vars
# Add your ANTHROPIC_API_KEY to .dev.vars
npm install
npm run dev
```

Open `localhost:5173`. You'll see a cinematic landing page — click the logo, watch the flow video, then hit **DEMO** to enter the canvas. Paste some text (messy strategic fragments). Move nodes around. Hit **Handoff**.

## Architecture

Built on the [tldraw Agent Starter Kit](https://tldraw.dev/starter-kits/agent).

```
client/              → React frontend
  components/
    landing/         → Cinematic landing page (logo → video → demo CTA)
    thinking-map/    → UI components (BottomBar, HandoffButton, TextChannel, DiffToast,
                       UndoButton, DemoLoader, PersonaSelector, GhostCursor, EmptyCanvasPrompt)
  shapes/            → Custom tldraw shapes (ThoughtNode, Cluster, AgentAnnotation)
  prompts/           → AI system prompt for structural reasoning
  hooks/             → Paste handler
  agent/             → tldraw agent integration (from starter kit)
  lib/               → Utilities (undo-manager, diff-utils, tension-heartbeat)
  data/              → Demo scenario data, agent personas
api/                 → Vercel serverless functions (AI streaming)
public/landing/      → Landing page media assets (logo, video)
worker/              → Worker backend (prompt building, model routing)
shared/              → Shared types, schemas, and icons
docs/                → Design documents and plans
```

## Custom Shapes

- **ThoughtNode**: Draggable text card (glass-morphism, translucent fill with backdrop blur, Inter font)
- **ClusterShape**: Named group container (glass-morphism, dashed border, Instrument Serif label)
- **AgentAnnotation**: Small badge — question (?), tension (!), or insight (●) — with semantic glow on dark canvas

## Design: Dark Observatory

Dark canvas (#1E1D1B), grain texture, glass-morphism nodes, glowing semantic annotations, JetBrains Mono for metadata. See [DESIGN.md](DESIGN.md) for the full design system.

## Docs

| Document | What it covers |
|----------|---------------|
| [Problem Space (full)](docs/problem-space-final.md) | 5 lenses on chat failure, 8 required properties, 3 personas, design brief |
| [Problem Space (narrative)](docs/problem-space-narrative.md) | Readable summary of the problem |
| [Solution V1](docs/solution-space-v1.md) | Paradigm design: spatial model, agent co-ownership, handoff, versioning |
| [Solution (narrative)](docs/solution-narrative.md) | Hackathon-scoped pitch |
| [Implementation Plan](docs/implementation-plan.md) | CEO + Eng reviewed plan, phased build, architecture, schemas |

## Features

- **Undo**: Snapshots canvas before each handoff; "Undo" button reverts to pre-handoff state (up to 3 levels)
- **Diff Toast**: Floating card after handoff showing what the agent changed (clusters created, nodes moved, etc.), auto-dismisses after 10s
- **Demo Mode**: "Load Demo" button with 10 pre-loaded GTM strategy fragments containing natural tensions
- **Tension Visualization**: Red dashed arrows with pulse animation for conflicts; paired with tension annotation badges
- **Animation Polish**: Fade-in animation for newly created thought nodes
- **Dark Observatory**: Complete visual identity — dark canvas, glass-morphism nodes, grain texture, annotation glow
- **Agent Personas**: Segmented pill selector for Strategist / Devil's Advocate / VC Lens modes
- **Ghost Cursor**: Animated AI cursor overlay during handoff that glides across nodes being analyzed
- **Tension Heartbeat**: Nodes connected by tension arrows pulse red glow, speed scales with tension count

## Landing Page

Cinematic entry experience: logo with flow-line animation → full-screen brand video → DEMO button that transitions into the canvas app. The landing page uses its own white/black aesthetic (intentionally distinct from the Dark Observatory design system). Media assets live in `public/landing/`.

## Status

Phase 1 (core loop), Phase 2 (undo, diff, demo, tension viz), and Phase 3 (dark observatory, agent personas, ghost cursor, tension heartbeat) shipped. Landing page integrated. Deployed on Vercel.
