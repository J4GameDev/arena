# Arena — Project North Star

> `arena` is a working title. Renaming is a change to `package.json`, `index.html`, and this file. Do it whenever the real name shows up.

## What this is

A **high fantasy auto-battler** for the web. You assemble a hero's build from gear, magic, and relics; combat resolves automatically; you take the loot and re-equip. The interesting decisions happen between fights, not during them.

Idle/offline progression is a **planned month-two layer**, not part of v0.1. Do not build toward it yet.

## Design pillars

These are the tiebreakers. When a decision is ambiguous, the option that serves these wins.

1. **The build is the character.** Player identity comes from the combination of items they've assembled, not from a class picker or a level-up screen.
2. **Monsters are puzzles, not stat checks.** Every monster should have a gimmick that invalidates some builds and rewards others — punishes overhealing, scales off the player's crit rate, gets stronger the more gear slots are filled. A fight the player loses should teach them something specific.
3. **Decisions every 30–90 seconds.** Waiting is not gameplay. If a stretch of play has no choice in it, that stretch is a bug.
4. **Legible numbers.** The player should be able to reason about why they won or lost. Prefer a readable system over a deep one.

## Tone and art direction

High/heroic fantasy. Gleaming plate, cathedral light, dragons, archmages, big readable spell effects. Classic D&D energy played straight — not grim, not comedic.

Art is pixel art, generated via the **PixelLab MCP**. Keep prompts consistent: same palette family, same lighting direction, same sprite dimensions per category. Art direction drifts fast when assets are generated one at a time — when adding sprites, look at what already exists first.

## Working agreement

**This project is not one-shotted, ever.** That's a deliberate choice by the owner, not a limitation.

- Build **one system at a time**, and ship a way to verify it alongside it (a test, a debug overlay, a console harness).
- **Design decisions belong to the owner.** Balance numbers, monster gimmicks, item identities, what's fun — propose options and reasoning, don't just pick. Implementation details and architecture are fair game to decide.
- When asked for a mechanic, prefer the smallest version that can be played and felt, then iterate from real feedback.
- If a request would take more than a couple of files to implement, say so and propose a breakdown before starting.

## Architecture

**The one rule: the simulation never touches the DOM.**

```
src/
  sim/     Pure game logic. Zero DOM, zero rendering, zero I/O. Deterministic.
  data/    Content as data — items, monsters, affixes. Adding content = editing here.
  view/    Presentation. DOM/CSS for UI, canvas for the battle scene.
  state/   Run state, persistence, save/load.
tests/     Vitest. Primarily targets sim/.
assets/    Source art (sprites, icons).
```

Combat is a **pure function**: `(hero, monster, seed) => CombatEvent[]`. The view is a dumb playback layer that animates that event list. Consequences this buys, all of which matter:

- **Balance by brute force.** Run 10,000 fights in a second to find broken items instead of guessing.
- **Real tests.** Deterministic sim means a fight either produces the expected events or it doesn't.
- **Reskinnable.** The entire look can change without touching game logic.

Corollaries:
- All randomness goes through the seeded RNG in `src/sim/rng.ts`. Never `Math.random()` inside `sim/`.
- `sim/` must not import from `view/` or `state/`. If it needs to, the design is wrong.
- Content goes in `data/` as plain objects. If adding a monster requires writing new logic in `sim/`, consider whether the gimmick can be expressed as data instead — but don't contort the design to avoid code.

## Stack

TypeScript + Vite. No game engine — this genre is 80% inventory grids and tooltips, which DOM/CSS handles better than a canvas engine would. Battle scene gets a small canvas layer.

```bash
npm run dev      # dev server
npm run build    # production build
npm test         # vitest
```

## v0.1 scope

Finished and deployed, not a prototype. Done means: someone can open a link, play it, and lose.

**In:** one hero · ~3 equipment slots · ~6 items · ~5 gimmick monsters · deterministic combat sim · battle view with HP bars and damage numbers · loot → equip → fight loop · localStorage save.

**Out (defer, do not build):** offline/idle progression · prestige · skill trees · multiple heroes · shops · currencies · meta-progression of any kind.

Scope creep is the primary risk to this project. When a new idea arrives mid-build, write it down and keep going.

## Notes

- Git from the first commit. Commit at working checkpoints, not at the end of the day.
- If this ships to Steam later, AI-generated assets require disclosure at submission — worth confirming current policy well before launch.
