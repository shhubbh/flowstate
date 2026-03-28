# Thinking Map

A spatial co-thinking tool where an AI agent and a founder jointly build and reshape a living map of strategic decisions — through gesture, not chat.

## The Problem

Chat forces specification before exploration. Founders whose work is structuring the unstructured have no tool combining intelligence + spatial persistence + cheap branching. See [docs/problem-space-narrative.md](docs/problem-space-narrative.md).

## The Solution

A persistent 2D canvas where thought fragments become draggable nodes. The user arranges, connects, and moves nodes to express spatial intent. An AI agent reads the spatial arrangement and structures it — creating clusters, drawing connections, flagging tensions. See [docs/solution-narrative.md](docs/solution-narrative.md).

## Quick Start

```bash
cp .dev.vars.example .dev.vars
# Add your ANTHROPIC_API_KEY to .dev.vars
npm install
npm run dev
```

Open `localhost:5173`. Paste some text (messy strategic fragments). Move nodes around. Hit **Handoff**.

## Architecture

Built on the [tldraw Agent Starter Kit](https://tldraw.dev/starter-kits/agent).

```
client/              → React frontend
  shapes/            → Custom tldraw shapes (ThoughtNode, Cluster, AgentAnnotation)
  components/        → UI components (BottomBar, HandoffButton, TextChannel, DiffToast, UndoButton, DemoLoader)
  prompts/           → AI system prompt for structural reasoning
  hooks/             → Paste handler
  agent/             → tldraw agent integration (from starter kit)
  lib/               → Utilities (undo-manager, diff-utils)
  data/              → Demo scenario data
worker/              → Cloudflare Worker backend (AI provider proxy)
shared/              → Shared types and schemas
docs/                → Design documents and plans
```

## Custom Shapes

- **ThoughtNode**: Draggable text card (white, hairline border, Inter font)
- **ClusterShape**: Named group container (dashed border, uppercase label)
- **AgentAnnotation**: Small badge — question (?), tension (!), or insight (●)

## Design: Architect's Desk

Warm canvas (#f8f7f4), dotted grid, hairline-bordered white cards, muted annotation colors, JetBrains Mono for metadata. See [.context/designs/approved.json](.context/designs/) for full token spec.

## Docs

| Document | What it covers |
|----------|---------------|
| [Problem Space (full)](docs/problem-space-final.md) | 5 lenses on chat failure, 8 required properties, 3 personas, design brief |
| [Problem Space (narrative)](docs/problem-space-narrative.md) | Readable summary of the problem |
| [Solution V1](docs/solution-space-v1.md) | Paradigm design: spatial model, agent co-ownership, handoff, versioning |
| [Solution (narrative)](docs/solution-narrative.md) | Hackathon-scoped pitch |
| [Implementation Plan](docs/implementation-plan.md) | CEO + Eng reviewed plan, phased build, architecture, schemas |

## Phase 2 Features

- **Undo**: Snapshots canvas before each handoff; "Undo" button reverts to pre-handoff state (up to 3 levels)
- **Diff Toast**: Floating card after handoff showing what the agent changed (clusters created, nodes moved, etc.), auto-dismisses after 10s
- **Demo Mode**: "Load Demo" button with 10 pre-loaded GTM strategy fragments containing natural tensions
- **Tension Visualization**: Red dashed arrows with pulse animation for conflicts; paired with tension annotation badges
- **Animation Polish**: Fade-in animation for newly created thought nodes

## Status

Phase 1 (core loop) and Phase 2 (cherry-picks) built.
