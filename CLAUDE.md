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
