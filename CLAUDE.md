# Arena — Project North Star

> `arena` is a working title. Renaming is a change to `package.json`, `index.html`, and this file. Do it whenever the real name shows up.
>
> **Live:** https://arena-mu-coral.vercel.app — Vercel redeploys this automatically on every push to `main`.

## What this is

A **high fantasy auto-battler** for the web. You assemble a hero's build from gear, magic, and relics; combat resolves automatically; you take the loot and re-equip. The interesting decisions happen between fights, not during them.

Idle/offline progression is a **planned month-two layer**, not part of v0.1. Do not build toward it yet.

## Design pillars

These are the tiebreakers. When a decision is ambiguous, the option that serves these wins.

1. **The build is the character.** Player identity comes from the combination of items they've assembled, not from a class picker or a level-up screen.
2. **Monsters are puzzles, not stat checks.** Every monster should have a gimmick that invalidates some builds and rewards others — punishes overhealing, scales off the player's crit rate, gets stronger the more gear slots are filled. A fight the player loses should teach them something specific.
3. **Decisions every 30–90 seconds.** Waiting is not gameplay. If a stretch of play has no choice in it, that stretch is a bug.
4. **Legible numbers.** The player should be able to reason about why they won or lost. Prefer a readable system over a deep one.

## Combat model (locked)

**Attack-speed timeline.** Each combatant has a timer set by their attack speed; whoever's fills first swings. This is the axis that makes a greataxe build genuinely different from a dagger build rather than just slower.

**The weapon is the class.** There is no class picker. A two-handed weapon makes you a berserker; daggers make you a duelist. The weapon sets your archetype and your resource. Finding a new weapon type is therefore a build pivot, not a stat upgrade.

**Resources are generation rules, not bars.** What makes an archetype feel different is _how its resource fills_, and each rule relates to the timeline differently:

| Weapon           | Resource | Builds from              | Wants                       |
| ---------------- | -------- | ------------------------ | --------------------------- |
| Two-handed       | Rage     | Taking damage            | The enemy swinging fast     |
| Daggers          | Focus    | Hits landed              | Its own timer fast          |
| Sword and shield | Resolve  | Being attacked, blocking | Long fights (not in v0.1)   |
| Staff            | Mana     | Passive tick             | Neither timer (not in v0.1) |

At threshold a resource spends itself automatically on an empowered attack. This is an auto-battler: decisions happen between fights, not during them.

**Other slots modify the economy, not the numbers.** A ring that slows Rage decay; a cloak that converts overkill damage into Focus. The moment accessories become flat stat sticks, pillar one has quietly failed.

**Leave headroom on the weapon for the items to matter.** A weapon's baseline for anything an accessory can also grant should be low. The Assassin's 10% evasion is deliberate: at 25% the weapon had already spent the entire budget and evasion accessories would have had nothing left to give. A stat the build cannot meaningfully move is not part of the build.

v0.1 ships **two** archetypes, two-handed (Rage) and daggers (Focus), because they are opposites on the timeline. Two is the minimum that demonstrates the pillar; one demonstrates nothing.

## The world

**A source of corruption exists somewhere, and it has been leaking outward for a long time.** Everything in this world is a function of distance to it.

**Corruption escalates in kind, not just degree.** Near the bastion it is a detail — an animal with too many joints, fur the wrong colour, eyes that do not match. Further out the original creature gets harder to read. Near the source it stops being biological at all. This single gradient is the difficulty curve, the art direction, and the reward curve at once. Almost everything hangs off it.

**Something is behind it, and it does not know we exist.** We are incidental to whatever this is. It never speaks, never taunts, never notices. Treat that as a hard rule: no antagonist dialogue, no villain reveal, no monologue, ever. The world explains itself through what the player finds, or it does not explain itself.

**It cannot be beaten, only held back.** There is no win condition and everyone in the fiction knows it. This is what lets the game run forever without lying to the player.

**The player is a hunter**, working out of one of the last bastions where clean wildlife survives. They hunt for two reasons that pull against each other: scarce materials, and holding the line. Clean creatures yield dependable materials and are the last of their kind — you are the one depleting them. Corrupted ones are dangerous and strange, and killing them is the only thing slowing the spread.

**The hero is anonymous by design.** No name, no class, no backstory — they are the weapon in their hand. That was a mechanical decision, and it happens to be exactly what a persistent shared world needs later. Do not write anything that makes the hero singular.

**Corrupted humans are the worst things out there**, because they were the most dangerous animal to begin with. They are hunters who went too far out and did not come back — which means the hardest enemies in the game are a preview of what happens to the player. Nobody says this out loud. The player works it out when one of them is carrying a weapon they recognise.

**Two loot sources, and the split is thematic rather than designed.** Animals yield materials — hide, bone, whatever grew through them. Corrupted hunters yield _gear_, because they are still carrying it, and since a weapon defines an archetype, killing one that swung a greataxe drops a greataxe.

**Implied, not yet decided:** regions are corruption bands ordered by distance from the source. Clean and tainted materials are the natural item axis — dependable versus stronger-but-wrong. Nearer the bastion you hunt animals; further out you kill people, so the moral gradient tracks the difficulty gradient.

## Tone and art direction

**Grounded, not heroic.** Leather, iron, wood, bone, worn tools. No archmages, no cathedrals, no gleaming plate, no spell effects. A hunter here looks like someone who works outdoors for a living, because that is what they are.

This is a deliberate reversal of an earlier call. The world is wildlife, frontier, and an unwinnable holding action, and grandeur fights all three. It also serves the horror: **corruption should be the only thing in a frame that looks wrong, which means everything else has to look right.** Stylised or fantastical baseline art gives the corruption nothing to be wrong against.

**The escalation rule — this generates every creature in the game.** Corruption changes in kind with distance from the source, not just in degree:

- **Near the bastion** — corruption is a _detail_. A recognisable animal with one thing off: too many joints, mismatched eyes, fur the wrong colour. The horror is that you can still tell what it used to be.
- **Mid range** — the original species gets harder to read. Proportions wrong, growth where it should not be, movement that does not match the body.
- **Deep** — barely biological. The creature is a scaffold for something else.
- **At the source** — not biological at all. Not in v0.1; nobody has seen it.

When designing any creature, first decide its band, then work outward from a real animal. Never start from a fantasy monster.

**Palette.** Muted and natural near the bastion. As distance grows, colour goes wrong before shape does — a hue that does not occur in nature, arriving before the anatomy breaks.

**Practical.** Art is pixel art via the **PixelLab MCP**. Keep the same palette family, lighting direction, and sprite dimensions within a category. Direction drifts fast when assets are generated one at a time, so look at what already exists before adding to it. Generations are a finite monthly budget — settle a look on cheap single sprites before committing to anything animated.

## Working agreement

**This project is not one-shotted, ever.** That's a deliberate choice by the owner, not a limitation.

- Build **one system at a time**, and ship a way to verify it alongside it (a test, a debug overlay, a console harness).
- **Design decisions belong to the owner.** Balance numbers, monster gimmicks, item identities, what's fun — propose options and reasoning, don't just pick. Implementation details and architecture are fair game to decide.
- When asked for a mechanic, prefer the smallest version that can be played and felt, then iterate from real feedback.
- If a request would take more than a couple of files to implement, say so and propose a breakdown before starting.
- **Run everything yourself.** Tests, scripts, balance runs — execute them and report the results here. Never hand back a command for the owner to run. The only exceptions are steps that genuinely cannot be delegated, such as browser sign-ins and OAuth grants; say plainly why.
- **Explain every number in plain English.** The first time a value appears, say what it measures, what its maximum means, and which file sets it. "Rage 60/60" means nothing on its own. Assume no game-dev or programming vocabulary.

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

## Code conventions

The owner reads this code but does not write it. That makes **legibility of intent** the goal — not brevity, not cleverness, not idiomatic-TypeScript points. Someone should be able to open any file and follow what the game is doing.

**Naming**

- Use the vocabulary from the design, not programmer shorthand: `attackTimer`, not `atkT`. `remainingHealth`, not `hp2`. If a name needs a comment to explain it, rename it.
- Booleans read as assertions: `isStunned`, `hasShield`, `canCrit`.
- Types and interfaces are `PascalCase`; functions, variables, and properties are `camelCase`; true constants are `SCREAMING_SNAKE`. File names are lowercase, hyphenated when multi-word (`combat-log.ts`).

**Comments**

- Code explains _what_. Comments explain **why** — especially design and balance intent. `// 2.0x, not 2.5x — 2.5 made daggers dominant at every tier` is the most valuable kind of comment in this repo.
- Don't narrate obvious code. A comment restating the line below it is noise.

**Structure**

- One concept per file. If a file passes ~200 lines, it's probably two files.
- Functions in `sim/` are pure where possible: take state, return new state or events. Side effects live at the edges, in `view/` and `state/`.
- No magic numbers in `sim/`. Every tunable number is either a named constant or lives in `data/`.

**Data**

- `data/` files should read like a design spreadsheet. Plain objects, one entry per line group, aligned and scannable. The owner should be able to open `items.ts`, change a `damage: 12` to `damage: 14`, and see the effect without touching logic.
- Content entries get a short comment naming their _design role_ — what build this exists to enable, or what it's meant to counter.

**Types**

- Model the domain so illegal states can't be represented. Prefer a union of specific shapes over one wide type with optional fields everywhere.
- Throw on programmer error rather than silently defaulting. A crash during development is cheaper than a wrong number the owner has to reverse-engineer later.

**Formatting** is Prettier's job, never a discussion. Run `npm run format`.

## Stack

TypeScript + Vite. No game engine — this genre is 80% inventory grids and tooltips, which DOM/CSS handles better than a canvas engine would. Battle scene gets a small canvas layer.

TypeScript runs in `strict` mode with `noUncheckedIndexedAccess`. Do not loosen these to make an error go away — the error is the point.

```bash
npm run dev        # dev server
npm run build      # production build
npm test           # vitest
npm run typecheck  # tsc, no emit
npm run format     # prettier --write
npm run check      # typecheck + format check + tests — run before every commit
```

## v0.1 scope

Finished and deployed, not a prototype. Done means: someone can open a link, play it, and lose.

**In:** one hero · ~3 equipment slots · ~6 items · ~5 gimmick monsters · deterministic combat sim · battle view with HP bars and damage numbers · loot → equip → fight loop · localStorage save.

**Out (defer, do not build):** offline/idle progression · prestige · skill trees · multiple heroes · shops · currencies · meta-progression of any kind.

Scope creep is the primary risk to this project. When a new idea arrives mid-build, write it down and keep going.

## Parking lot

Good ideas that are not v0.1. Written down so they stop taking up room.

- **Gambit conditions.** Let the player set _when_ a resource spends: "only below 40% health," "only when the enemy is enraged." Turns spending into a second build axis on top of gear.
- **Resolve and Mana archetypes** — sword-and-shield and staff, once Rage and Focus are proven.
- **Unavoidable attacks.** A monster property that ignores evasion entirely — "you cannot sidestep a mountain." Turns a boss into a puzzle that disables the thing you were relying on. Good fit for the Sentinel when mid-tier monsters get designed.
- **An evasion ceiling.** Once accessories can add evasion, stacking runs toward 100% and immortality. Needs either a hard cap or diminishing returns before the first evasion item ships.

## Notes

- Git from the first commit. Commit at working checkpoints, not at the end of the day.
- If this ships to Steam later, AI-generated assets require disclosure at submission — worth confirming current policy well before launch.
