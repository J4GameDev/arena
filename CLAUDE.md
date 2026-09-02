# Arena — Project North Star

> `arena` is a working title. Renaming is a change to `package.json`, `index.html`, and this file. Do it whenever the real name shows up.
>
> **Live:** https://arena-mu-coral.vercel.app — Vercel redeploys this automatically on every push to `main`.
>
> **Project hub:** https://app.notion.com/p/3cebb4f99a0781978c30c4bcfe3a80f0 — Notion page holding the world summary, current state, and the content-idea backlog.

## What this is

A **grounded fantasy auto-battler** for the web. You hunt out of one of the last clean bastions, assemble a build from what you bring back, and combat resolves automatically. The interesting decisions happen between fights, not during them.

Idle/offline progression is a **planned month-two layer**, not part of v0.1. Do not build toward it yet.

## Design pillars

These are the tiebreakers. When a decision is ambiguous, the option that serves these wins.

1. **The build is the character.** Player identity comes from the combination of items they've assembled, not from a class picker or a level-up screen.
2. **Monsters are puzzles, not stat checks.** Every monster should have a gimmick that invalidates some builds and rewards others — punishes overhealing, scales off the player's crit rate, gets stronger the more gear slots are filled. A fight the player loses should teach them something specific.
3. **Decisions every 30–90 seconds.** Waiting is not gameplay. If a stretch of play has no choice in it, that stretch is a bug.
4. **Legible numbers.** The player should be able to reason about why they won or lost. Prefer a readable system over a deep one.

## Combat model (locked)

**Attack-speed timeline.** Each combatant has a timer set by their attack speed; whoever's fills first swings. This is the axis that makes a greataxe build genuinely different from a dagger build rather than just slower.

**The weapon is the class.** There is no class picker. A two-handed weapon makes you a Berserker; daggers make you an Assassin. The weapon sets your archetype and your resource. Finding a new weapon type is therefore a build pivot, not a stat upgrade.

**Resources are generation rules, not bars.** What makes an archetype feel different is _how its resource fills_, and each rule relates to the timeline differently:

| Weapon           | Resource | Builds from              | Wants                       |
| ---------------- | -------- | ------------------------ | --------------------------- |
| Two-handed       | Rage     | Damage swung at you      | The enemy swinging fast     |
| Daggers          | Focus    | Hits landed              | Its own timer fast          |
| Sword and shield | Resolve  | Being attacked, blocking | Long fights (not in v0.1)   |
| Staff            | Mana     | Passive tick             | Neither timer (not in v0.1) |

At threshold a resource spends itself automatically on an empowered attack. This is an auto-battler: decisions happen between fights, not during them.

**Other slots modify the economy, not the numbers.** A ring that makes the meter fill faster; a charm that keeps part of it instead of emptying on the payoff. The moment accessories become flat stat sticks, pillar one has quietly failed.

**Leave headroom on the weapon for the items to matter.** A weapon's baseline for anything an accessory can also grant should be low. The Assassin's 10% evasion is deliberate: at 25% the weapon had already spent the entire budget and evasion accessories would have had nothing left to give. A stat the build cannot meaningfully move is not part of the build.

v0.1 ships **two** archetypes, two-handed (Rage) and daggers (Focus), because they are opposites on the timeline. Two is the minimum that demonstrates the pillar; one demonstrates nothing.

## The world

**A source of corruption exists somewhere, and it has been leaking outward for a long time.** Everything in this world is a function of distance to it.

**Corruption escalates in kind, not just degree.** Near the bastion it is a detail — an animal with too many joints, fur the wrong colour, eyes that do not match. Further out the original creature gets harder to read. Near the source it stops being biological at all. This single gradient is the difficulty curve, the art direction, and the reward curve at once. Almost everything hangs off it.

**Something is behind it, and it does not know we exist.** We are incidental to whatever this is. It never speaks, never taunts, never notices. Treat that as a hard rule: no antagonist dialogue, no villain reveal, no monologue, ever. The world explains itself through what the player finds, or it does not explain itself.

**It cannot be beaten, only held back.** There is no win condition and everyone in the fiction knows it. This is what lets the game run forever without lying to the player.

**The player is a hunter**, working out of one of the last bastions where clean wildlife survives. They hunt for two reasons that pull against each other: scarce materials, and holding the line. Clean creatures yield dependable materials and are the last of their kind — you are the one depleting them. Corrupted ones are dangerous and strange, and killing them is the only thing slowing the spread.

**You choose a weapon once, at the very start, and every one after that has to be found.** That opening pick is the only identity the game hands out. Weapons come off people — a boar was never carrying a greataxe — so monsters record whether they were an animal or a person, and only people leave a weapon behind. Oswald leaves nothing: he yields rather than dies, and you do not loot your teacher.

**The hero is anonymous by design.** No name, no class, no backstory — they are the weapon in their hand. That was a mechanical decision, and it happens to be exactly what a persistent shared world needs later. Do not write anything that makes the hero singular.

**Oswald** is the first character the player meets: an experienced hunter who spars with them, first to yield. He never tries to kill you, which is why he never crits and why his strikes land in a controlled rhythm — the tutorial's mechanics are explained by who he is rather than excused.

He also rhymes with the boss. The first thing you fight is a hunter; the hardest thing you fight is a hunter who went too far out. The opening and the gate are the same figure at two ends of the same road, and the player is invited to notice without being told.

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

**Sprites live in `public/sprites/<id>.png`**, looked up by id — `oswald.png` for a monster, `greataxe.png` for the hero wielding that weapon. 64x64, transparent, rendered at 96-128px with `image-rendering: pixelated`. A missing sprite removes itself rather than showing a broken image, so content can land before its art does.

Sprite paths are passed _into_ the view, never stored on a Combatant. The simulation has no idea art exists and should keep it that way.

**Prompt shape that worked**, for consistency: subject and stance, then materials, then "muted earth tones of brown grey and dull green", then "soft natural lighting from upper left", then "plain and grounded", and always end with "no magic, no glow, no glowing effects" — pixel-art models reach for neon and rim-light unless told twice not to.

**Practical.** Art is pixel art via the **PixelLab MCP**. Keep the same palette family, lighting direction, and sprite dimensions within a category. Direction drifts fast when assets are generated one at a time, so look at what already exists before adding to it. Generations are a finite monthly budget — settle a look on cheap single sprites before committing to anything animated.

## Working agreement

**This project is not one-shotted, ever.** That's a deliberate choice by the owner, not a limitation.

- Build **one system at a time**, and ship a way to verify it alongside it (a test, a debug overlay, a console harness).
- **Design decisions belong to the owner.** Balance numbers, monster gimmicks, item identities, what's fun — propose options and reasoning, don't just pick. Implementation details and architecture are fair game to decide.
- When asked for a mechanic, prefer the smallest version that can be played and felt, then iterate from real feedback.
- If a request would take more than a couple of files to implement, say so and propose a breakdown before starting.
- **Run everything yourself.** Tests, scripts, balance runs — execute them and report the results here. Never hand back a command for the owner to run. The only exceptions are steps that genuinely cannot be delegated, such as browser sign-ins and OAuth grants; say plainly why.
- **Explain every number in plain English.** The first time a value appears, say what it measures, what its maximum means, and which file sets it. "Rage 60/60" means nothing on its own. Assume no game-dev or programming vocabulary.
- **Wrap up every session without being asked.** This is a standing instruction, not a request the owner repeats. When a session ends, do all of the following:

  1. **Audit this file line by line — read it, do not grep it.** Grep only finds words you already thought of, which is how a canvas battle scene that never existed, an `assets/` folder that never existed, a reference to an `items.ts` that had been deleted, and a handoff section insisting there was no game all survived a "sweep". Check specifically: the summary paragraph, every table, every named entity, every quoted number and test count, the architecture block, the code conventions (they cite real files), the parking lot (has anything on it shipped?), and the handoff section. A north star that has rotted is worse than none, because it is believed.
  2. **Commit and push everything.** Pushing to `main` is what deploys Vercel, so an unpushed commit means the live build is stale.
  3. **Verify the live build actually loads** and is the current version. A green deploy is not proof.
  4. **Update the Notion hub** — current state, decisions made, open questions, what is next.
  5. **Add this session's content ideas to Notion.** Findings, bugs with a good story, reversals, anything postable. This is a deliverable of every session, not a bonus.
  6. **Update memory** if the session produced durable feedback or preferences.

## Architecture

**The one rule: the simulation never touches the DOM.**

```
src/
  sim/     Pure game logic. Zero DOM, zero rendering, zero I/O. Deterministic.
  data/    Content as data — monsters, weapons, affix pools and magnitudes.
  view/    Presentation. All DOM and CSS, including the battle scene.
  state/   Run state, persistence, save/load.
tests/     Vitest. Primarily targets sim/.
scripts/   Balance harness, outlier hunter, single-fight runner.
public/    Static assets served as-is. Sprites live in public/sprites/.
```

Combat is a **pure function**: `(hero, monster, seed) => CombatEvent[]`. The view is a dumb playback layer that animates that event list. Consequences this buys, all of which matter:

- **Balance by brute force.** Run 10,000 fights in a second to find broken items instead of guessing.
- **Real tests.** Deterministic sim means a fight either produces the expected events or it doesn't.
- **Reskinnable.** The entire look can change without touching game logic.

Corollaries:

- All randomness goes through the seeded RNG in `src/sim/rng.ts`. Never `Math.random()` inside `sim/`.
- `sim/` must not import from `view/` or `state/`. If it needs to, the design is wrong.
- Content goes in `data/` as plain objects. If adding a monster requires writing new logic in `sim/`, consider whether the gimmick can be expressed as data instead — but don't contort the design to avoid code.

## Gear framework

**Three categories, three jobs.**

- **Armour** (head, torso, legs, feet, hands) — defensive only. It keeps you standing. A leather vest has no business making you drain blood.
- **Weapons** — offensive. The weapon's archetype and resource rule are what the weapon _is_ and are never affixes; offensive affixes roll on top.
- **Trinkets** (two rings, necklace) — offensive, and the **only** source of direct resource affixes. They are made of corruption, which is why they get to break the rules armour obeys.

**Two exceptions, both deliberate.** Hands may carry attack speed and damage despite being armour, because they are the only armour touching the weapon. Initiative is feet-only — one affix that comes from exactly one slot, which gives boots a reason to exist beyond weighting.

**Direct versus indirect is the whole distinction.** Trinkets alone may carry affixes that _say_ "resource." Anything that affects a resource as a downstream consequence is normal and expected everywhere — attack speed accelerates Focus because Focus builds from hits landed, and that is one mechanic touching another, not a resource affix leaking onto gloves. The rule governs what an affix says, not what it ends up influencing.

**No guaranteed primary affix on any slot.** Slots are thematically _weighted_, never forced. A player should never be steered toward a build by their equipment.

**Weighting has real zeros, and they follow from the framework.** Lifesteal cannot appear on boots — not because it is unlikely, but because it is not what boots are. Zeros that come from a principle are ones a player accepts instantly; arbitrary ones just read as bad luck.

**Parked:** corrupted armour and weapons that deliberately break these restraints. Tainted gear that grants what its category should not is a natural late-game hook and fits the clean-versus-tainted material split. Not a v0.1 concern, and the framework above is the baseline it would deviate _from_.

## Progression and tuning targets

**The loop, repeated per corruption band:** grind the band's regular enemies for gear, then use that gear to beat the band's boss, which opens the next band. The grind has to be long enough to matter and short enough not to bore.

**Gear is an edge, not a doubling.** A full set is worth roughly a third more power. Affix magnitudes are deliberately small — eight slots of three affixes add up fast, and an item that looks exciting alone will be broken in a set.

**Bosses are gates, and they are tuned as gates.** The target for a band boss:

- **Bare: near 0%.** Not a hard fight, an impossible one. This is what forces the grind.
- **Geared at p90: roughly 80%.** Read the 90th percentile, never the median. A player keeps good drops and bins bad ones, so they converge on the top of the distribution — tuning the median tunes a loadout nobody keeps.
- **Both archetypes within about 5 points of each other at p90.** Different routes, same ceiling. A gap at the _median_ is fine and even characterful: it means one archetype is more gear-dependent than the other.

That spread is wide on purpose. Gear being a modest stat change _and_ the difference between 0% and 80% is not a contradiction: the fight is tuned around having it.

**Slow weapons have breakpoints, fast weapons do not.** The Berserker's win rate against the boss falls from 87% to 29% over twenty points of boss health, because twenty health can mean one more swing, which costs 1.5 seconds and another blow taken. The Assassin barely notices the same change. Keep this — it means greataxe builds care about damage thresholds in a way dagger builds never will. It also means retuning a boss's health is far more dangerous than it looks.

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

- `data/` files should read like a design spreadsheet. Plain objects, one entry per line group, aligned and scannable. The owner should be able to open `monsters.ts`, change a `damage: 38` to `damage: 34`, and see the effect without touching logic.
- Content entries get a short comment naming their _design role_ — what build this exists to enable, or what it's meant to counter.

**Types**

- Model the domain so illegal states can't be represented. Prefer a union of specific shapes over one wide type with optional fields everywhere.
- Throw on programmer error rather than silently defaulting. A crash during development is cheaper than a wrong number the owner has to reverse-engineer later.

**Formatting** is Prettier's job, never a discussion. Run `npm run format`.

## Stack

TypeScript + Vite. No game engine — this genre is 80% inventory grids and tooltips, which DOM/CSS handles better than a canvas engine would. The battle scene is DOM too: bars, sprites and floating numbers did not need a canvas, and adding one should wait until something genuinely needs pixels.

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

**In:** one hero · 8 equipment slots · a rolled item pool · ~5 monsters plus a gate boss · deterministic combat sim · battle view with HP bars and damage numbers · loot → equip → fight loop · localStorage save.

**Out (defer, do not build):** offline/idle progression · prestige · skill trees · multiple heroes · shops · currencies · meta-progression of any kind.

Scope creep is the primary risk to this project. When a new idea arrives mid-build, write it down and keep going.

## Parking lot

Good ideas that are not v0.1. Written down so they stop taking up room.

- **Gambit conditions.** Let the player set _when_ a resource spends: "only below 40% health," "only when the enemy is enraged." Turns spending into a second build axis on top of gear.
- **Resolve and Mana archetypes** — sword-and-shield and staff, once Rage and Focus are proven.
- **Unavoidable attacks.** A monster property that ignores evasion entirely — "you cannot sidestep a mountain." Turns a boss into a puzzle that disables the thing you were relying on. Good fit for the Strayed Hunter when mid-tier monsters get designed.
- **Conditional affixes.** Effects with a trigger — gain resource on evade, bonus damage while the meter is full, the first hit of a fight empowered. Agreed as a later pass after the flat affixes were proven; these are what players build _around_ rather than merely accumulate.
- **Levels and class abilities.** Both will move every balance number, which is why gear is tuned to roughly-right rather than precisely. Levels need a job that gear does not already do, and abilities need to come from the weapon rather than a skill tree, or pillar one quietly dies.

## Where we left off

**It is playable.** Choose a weapon, hunt, watch the fight resolve, take the loot, wear it, go again. Progress saves to the browser.

**Built and tested — 52 tests:** the combat simulation (attack-speed timeline, Rage and Focus, crit on both sides, block, evasion, lifesteal, initiative, resource retention), two archetypes both reachable in game, three monsters, eight equipment slots, 19 affix kinds, weighted affix pools and the item roller, run state and saving, the fight view, and five sprites. Three harnesses: `npm run fight`, `npm run balance`, `npm run outliers`.

**Balance, against the gear the game actually drops.** `npm run balance` rolls real loadouts rather than equipping a fixed set, and reports geared results as a distribution. **Read p90, not the median** — a player keeps good drops and bins bad ones, so they converge on the top of the distribution. The median describes a loadout nobody keeps.

| Weapon    | Monster        | Bare  | Geared p50 | Geared p90 | Big hits bare (fewest) |
| --------- | -------------- | ----- | ---------- | ---------- | ---------------------- |
| Berserker | Oswald         | 100%  | 100%       | 100%       | 1                      |
| Berserker | Turned Boar    | 100%  | 100%       | 100%       | 1                      |
| Berserker | Strayed Hunter | 0.7%  | 60.0%      | **84.0%**  | 1                      |
| Assassin  | Oswald         | 100%  | 100%       | 100%       | 2                      |
| Assassin  | Turned Boar    | 99.8% | 100%       | 100%       | 2                      |
| Assassin  | Strayed Hunter | 2.5%  | 35.3%      | **76.7%**  | 2                      |

The gate target is p90 near 80%. Both archetypes are in the band, seven points apart against a five-point target. Bare is correctly hopeless and the teaching guarantee still holds. This was reached with `MAGNITUDE_SCALE = 0.7` in `src/data/affixes.ts` — measured, not chosen; halving overshot to 64% and 39%. Retune that constant before touching individual ranges.

**The archetype gap is consistency, not ceiling.** At the median the Berserker is far ahead (60% against 35%), but at p90 they are seven points apart. The Assassin is not weaker — it is more gear-dependent, which suits a fragile build needing the right kit. Worth keeping rather than flattening.

**Next, in order:**

1. **Content between the Turned Boar and the Strayed Hunter.** There is currently a tutorial, one animal, and a wall.
2. **Item icons and a fight background.** The pack is still text.

**Known and deliberately unfixed:**

- **Wasted Rage meters.** 629 of 830 geared Berserker losses to the boss end holding a full meter. Now judgeable, since the UI shows the bar — decide whether it reads as a berserker dying mid-fury or as a payoff being stolen.
- **The Turned Boar wants a retune.** It inherited Oswald's teaching numbers and no longer needs guarantees.
- **No levels, no abilities, no item icons, no background art.** Items in the pack are still text.

## Notes

- Git from the first commit. Commit at working checkpoints, not at the end of the day.
- If this ships to Steam later, AI-generated assets require disclosure at submission — worth confirming current policy well before launch.
