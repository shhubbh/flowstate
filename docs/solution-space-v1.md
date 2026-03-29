# Solution Space: The Thinking Map — V1 (Working Draft)

> Historical planning/design document. For the current implementation status and recent reliability fixes, see [`docs/current-status.md`](current-status.md).

## The Paradigm in One Line

A spatial, persistent, agent-co-owned thinking space where the user works through gesture and the agent actively maintains structure — replacing chat's sequential text exchange with a living map of evolving understanding.

---

## Core Paradigm Decisions

### 1. Spatial Model: Living Thinking Map

The workspace is a persistent 2D space representing the user's *thinking*, not the conversation. Dialogue is an input channel into the space — not the space itself.

The space evolves through four phases as thinking matures:

| Phase | State | Spatial character |
|-------|-------|-------------------|
| **Dump** | Raw material enters. No arrangement. Accumulation. | Freeform canvas |
| **Cluster** | Agent or user groups related items. Proximity = relatedness. | Spatial clustering |
| **Crystallize** | Clusters get names, connections become explicit. Graph emerges from soup. | Named nodes + edges |
| **Architecture** | Structure stable enough to reason about as whole. Dependencies, tensions, gaps visible. | System map |

Phase transitions are generally forward but **not strictly linear** — new inputs or discoveries can throw a region back to an earlier phase while the rest of the space stays mature. *(Shelved: detailed mechanics of non-linear phase transitions.)*

**Scaling mechanism:** Above a complexity threshold, the agent compacts the space — collapsing mature regions into summary nodes, preserving detail on drill-down. The space must stay usable at high node counts. Think semantic zoom: forest view shows regions and relationships, tree view shows individual nodes.

### 2. Agent's Relationship to Structure: Co-Owner

The agent is not a suggestion engine. It actively maintains, reorganizes, and evolves the structure of the thinking space. Default behavior is *act*, not *propose*.

- Agent clusters related items
- Agent surfaces connections between nodes
- Agent flags tensions and contradictions
- Agent restructures when the current arrangement stops serving the thinking
- User can override any agent action

**Multi-agent architecture:** A single space can have multiple agents with distinct roles:

- **Chat agent (primary):** Handles direct dialogue with the user. Responds to text-based questions, provides explanations, engages in back-and-forth when the user escalates from gesture to text.
- **Structure agent (background):** Manages the spatial organization. Handles clustering, connecting, restructuring, compaction, and other structural operations. Works during handoff windows and in background between sessions.

This separation prevents a single agent from being overwhelmed and allows each to specialize. The chat agent reasons about *content*. The structure agent reasons about *relationships and arrangement*.

*(Shelved: regions of authority — can the user mark zones as "mine, don't touch"? Override mechanism design. How agents coordinate with each other.)*

### 3. Interaction Grain: Gesture-Primary, Text as Escalation

The primary mode of interaction is **direct manipulation** of the space:

- Drag nodes together → cluster
- Draw a line between nodes → connect
- Drag apart → separate
- Gesture replaces the prompt as the default interaction unit

**Text is the escalation channel**, used when gestures can't carry the intent:

- "Why does this tension exist?"
- "What am I missing in this region?"
- "Expand on this node"
- Questions, not commands

This inverts chat's model. Chat = text-primary, everything through language. This = space-primary, language when needed.

**Implication:** the agent must interpret gestures as structural intent. Dragging two nodes close = "I think these are related." The agent collaborates on the structural move — draws the connection, surfaces why they relate, suggests adjacent nodes.

**Platform constraint:** gesture-primary implies desktop/tablet with pointer input. Not mobile-first. Acceptable for the founder persona.

### 4. Temporal Model: Rhythmic with Explicit Handoff

The user and agent take turns, but at a fundamentally different grain than chat.

- **User works** — gestures, rearranges, adds material, annotates. Agent watches but doesn't interrupt.
- **User hits handoff** — explicit button. "Your turn."
- **Agent processes** — reads the accumulated gestures, does structural work (cluster, connect, restructure, surface insights). May do heavy reorganization.
- **User reviews** — sees what the agent did, reacts, continues working.

**Why explicit handoff:**

- Protects flow state — agent can't interrupt mid-gesture
- User controls rhythm — short bursts or long sessions before handoff
- Co-ownership permission is scoped — agent acts boldly but only in defined windows
- Solves "who moved my stuff" — user knows *when* the agent will act

**Post-handoff legibility:** agent's actions must be reviewable. User sees what changed and why. Not just the result — the reasoning. *(Shelved: exact format of the agent's "here's what I did" report.)*

**Between sessions:** the structure agent can continue background work — reorganizing, flagging new connections, preparing "since you left..." observations for re-entry.

### 5. Entry Point: Import Mess → Agent's First Take → React

**First session:**

1. User brings fragments — paste notes, import docs, voice dump, drag in screenshots. Raw material. No arrangement required.
2. Agent (structure agent) takes a first pass — creates an initial spatial layout from the imported material. Clusters what seems related. Flags tensions. Names emerging themes.
3. User reacts — "this grouping is wrong," "these two are more related than you think," "what about X?" Gesture-primary from the start.

**Subsequent sessions:**

Space persists. User returns to a living map. Structure agent may have done background work. Chat agent surfaces observations: "Since you left, I noticed a tension between X and Y."

**Key property:** the user's first interaction is **evaluative, not generative.** They don't create from nothing — they respond to the agent's interpretation of their own material. Exploration before specification is baked into the entry point.

### 6. Initiative Distribution

*(Shelved. Not yet designed.)*

Core question: outside of handoff windows, when can the agent act unprompted? What gives permission? How does this evolve over time?

---

## Versioning: SolidWorks-Style Rollback

The space maintains a linear history of states — a timeline of snapshots. Each handoff cycle creates a version point.

- User can **roll back** to any previous state — scrub through the timeline like SolidWorks feature history
- Rolling back doesn't destroy forward states — they remain accessible (branching possible)
- Named checkpoints can be placed manually ("pre-pivot strategy," "before we cut feature X")
- Agent can auto-name significant version points

This directly addresses S4 (return to checkpoint in under 10 seconds) and the "cheap backtracking" requirement (P3).

---

## Negative Knowledge Representation

Rejected paths, failed approaches, and the reasoning behind rejections must persist in the space without active user effort.

This is primarily a **visual design problem**. The spatial persistence means rejected material doesn't scroll away — it lives in the space. The design question is *how* it's visually differentiated from active thinking.

*(To explore: visual treatments — greyed out regions, crossed-out clusters, "graveyard" zones, collapsed rejection nodes with reasoning attached, visual dimming with hover-to-reveal detail. Will require prototyping.)*

The structure agent is responsible for maintaining negative knowledge — when the user rejects or removes something, the agent preserves it in a recoverable, visible-but-non-intrusive form.

---

## Stress Test Against Design Brief

### Goals

| Goal | Verdict | Notes |
|------|---------|-------|
| **G1: Reduce meta-work ratio** | ✅ Strong | Agent co-owns structure. Gesture = cheap structural moves. User stops assembling fragments manually. Open question: how good is the AI at structural reasoning? Capability bet, not paradigm problem. |
| **G2: Eliminate interaction decay** | ✅ Strong | Space persists. Externalized structure. Agent maintains map. Compaction handles scaling. No scrolling-away problem. |
| **G3: Exploration before specification** | ✅ Strong | Entry point = react, not specify. Gesture = tinker before articulating. No blank prompt box moment. |

### Constraints

| Constraint | Verdict | Notes |
|------------|---------|-------|
| **C1: Current LLM architecture** | ⚠️ Feasible but hard | LLM never "sees" canvas directly. Works with structured representation (graph of nodes, edges, positions, contents). Reasons in text. Outputs structural operations rendered spatially. Translation layer is the key engineering challenge. |
| **C2: Buildable today** | ⚠️ Tight but feasible | Canvas tech exists (tldraw, Figma). Graph reasoning by LLMs exists. Multi-agent orchestration exists. Integration is hard. No research breakthroughs needed. |

### Success Criteria

| Criterion | Verdict | Notes |
|-----------|---------|-------|
| **S1: Agent contributes to structure** | ✅ Pass | Co-ownership = definitional. |
| **S2: Negative knowledge persists** | ✅ Pass (in principle) | Spatial persistence + structure agent maintains rejected paths. Visual representation TBD. |
| **S3: User can see work structure** | ✅ Pass | The space IS the structure. Compaction + zoom handles scale. |
| **S4: Return to checkpoint < 10s** | ✅ Pass | Rollback timeline. Named checkpoints. Scrub to any state. |
| **S5: Discovers intent through interaction** | ✅ Pass | React-first entry. Gesture-primary. No pre-formed intent required. |

---

## Architecture Sketch (Conceptual)

```
┌─────────────────────────────────────────────┐
│                THINKING SPACE                │
│                                             │
│  ┌──────┐    ┌──────┐         ┌──────┐      │
│  │ Node │────│ Node │    ┌────│ Node │      │
│  └──────┘    └──────┘    │    └──────┘      │
│       ╲         │        │                  │
│        ╲   ┌──────┐   ┌──────┐              │
│         ╲──│ Node │───│ Node │              │
│            └──────┘   └──────┘              │
│                                             │
│  [greyed: rejected cluster]                 │
│                                             │
├─────────────────────────────────────────────┤
│  TEXT CHANNEL (escalation)          [HANDOFF]│
├─────────────────────────────────────────────┤
│  ◀━━━━━━━━━━ VERSION TIMELINE ━━━━━━━━━━━▶  │
└─────────────────────────────────────────────┘

          ┌─────────────┐   ┌──────────────────┐
          │  CHAT AGENT  │   │ STRUCTURE AGENT   │
          │  (dialogue)  │   │ (spatial ops)     │
          └──────┬───────┘   └────────┬──────────┘
                 │                    │
                 └────────┬───────────┘
                          │
                 ┌────────▼─────────┐
                 │  SPACE STATE     │
                 │  (graph + spatial│
                 │   representation)│
                 └──────────────────┘
```

---

## Key Properties Achieved (Mapped to P1-P8)

| Property | How it's addressed |
|----------|--------------------|
| **P1: Spatial persistence** | The space IS persistent spatial arrangement. Core of the paradigm. |
| **P2: Variable granularity** | Gesture = fine grain. Text = coarse grain. User chooses. |
| **P3: Cheap branching/backtracking** | Rollback timeline. Named checkpoints. |
| **P4: Shared reference** | Both user and agents see and manipulate the same space. |
| **P5: Non-blocking parallelism** | Structure agent works between sessions. During sessions, handoff model creates structured concurrency. |
| **P6: Multi-modal input** | Gesture + text + import (docs, voice, screenshots). |
| **P7: Externalized structure** | The space IS the externalized structure. Agent co-maintains it. |
| **P8: Graduated initiative** | *(Shelved — initiative distribution not yet designed.)* |

---

## Shelved Questions

| Item | Status | Why shelved |
|------|--------|-------------|
| **Initiative distribution** | Deferred | Full axis unexplored. When can agents act unprompted outside handoff? |
| **Non-linear phase transitions** | Noted | Regions can regress to earlier phases. Mechanics TBD. |
| **Regions of authority** | Noted | Can user mark zones as "don't touch"? |
| **Override mechanism** | Noted | How does user reverse agent actions cheaply? Needs to be cheaper than the action itself. |
| **Agent coordination** | Noted | How do chat agent and structure agent stay coherent? Conflict resolution? |
| **Post-handoff reporting** | Noted | Format of "here's what I did and why" from agents. |
| **Negative knowledge visual treatment** | Noted | Visual design problem. Needs prototyping. |
| **P5 × P7 tension** | Carried from problem space | Parallelism + externalized structure could create chaos without interaction protocols. |
| **Trust/autonomy development** | Carried from problem space | How should agent-user relationship evolve over time? |

---

## Open Risks

**1. AI capability bet.** The paradigm assumes the structure agent can reason well about spatial relationships, clustering, and structural reorganization given a graph representation. Current LLMs can do this to *some* degree. Whether they can do it well enough to feel like a co-owner vs. a clumsy assistant is unproven.

**2. Translation layer complexity.** Every gesture must be translated to a structured representation the LLM can reason about. Every LLM output must be translated back to spatial operations. This is a non-trivial engineering layer with latency implications.

**3. Learnability.** Chat has zero learning curve (everyone knows messaging). A spatial thinking tool with gesture-primary interaction, handoff mechanics, and multi-agent architecture has a real learning curve. The founder persona is likely willing to invest — but it's a barrier.

**4. The compaction problem.** "Agent compacts the space above a threshold" sounds clean but is hard. What gets compacted? What stays expanded? How does the user control this? Wrong compaction = losing the user's mental map.

---

*Working draft V1 — March 28, 2026*
*Status: Paradigm defined. Six axes decided (one shelved). Stress-tested against design brief. Gaps identified and tracked.*
