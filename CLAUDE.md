# Farther — Project North Star

> **The game is called Farther.** Named on 3 Sep 2026 for the premise: the farther out you go, the stranger and more corrupt it gets, and the more what you bring back is worth. Oswald says it out loud after the first spar. The repo, folder and Vercel project carry the name; the save key `arena.run` in `src/state/storage.ts` does **not** and must not — changing it silently wipes every player's progress.
>
> **Live:** https://farther.vercel.app — Vercel redeploys this automatically on every push to `main`. (If that address ever fails, the project is under the J4GameDev Vercel account; check the dashboard for the current one.)
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

**Leave headroom on the weapon for the items to matter.** A weapon's baseline for anything an accessory can also grant should be low. The Assassin's 15% evasion is deliberate: at 25% the weapon had already spent the entire budget and evasion accessories would have had nothing left to give. (It was 10% until hunts existed; see the tuning notes.) A stat the build cannot meaningfully move is not part of the build.

**The weapon owns the hero's health, and the Assassin's is not higher.** Base health lives on the weapon, both at 100. When the Assassin turned out to die in fight two of a hunt, more health was measured and rejected by the owner: an agile build does not get a bigger pool. The trade this weapon _is_ is damage for fragility, so the daggers got a point of damage (6 to 7) and five points of evasion (10% to 15%) instead. One point of dagger damage was worth more than ten points of evasion over a hunt, because the Assassin's problem is how long it stands in front of things.

**A boss may have a heavy blow, never blanket immunity to a stat.** A monster can be marked so that every Nth swing cannot be evaded — an overhead blow with nowhere to go — while every other swing is dodged as normal. The Strayed Hunter's is every third. The blunt version, _all_ of his swings unavoidable, was built and rejected by the owner in the strongest terms: it deleted the Assassin's defining stat to make a boss fit. **Never remove a class mechanic to make something else work.** Tune the encounter's specific attacks and numbers, and bring the option before building it.

v0.1 ships **two** archetypes, two-handed (Rage) and daggers (Focus), because they are opposites on the timeline. Two is the minimum that demonstrates the pillar; one demonstrates nothing.

## The world

**A source of corruption exists somewhere, and it has been leaking outward for a long time.** Everything in this world is a function of distance to it.

**Corruption escalates in kind, not just degree.** Near the bastion it is a detail — an animal with too many joints, fur the wrong color, eyes that do not match. Further out the original creature gets harder to read. Near the source it stops being biological at all. This single gradient is the difficulty curve, the art direction, and the reward curve at once. Almost everything hangs off it.

**Something is behind it, and it does not know we exist.** We are incidental to whatever this is. It never speaks, never taunts, never notices. Treat that as a hard rule: no antagonist dialogue, no villain reveal, no monologue, ever. The world explains itself through what the player finds, or it does not explain itself.

**It cannot be beaten, only held back.** There is no win condition and everyone in the fiction knows it. This is what lets the game run forever without lying to the player.

**The player is a hunter**, working out of one of the last bastions where clean wildlife survives. They hunt for two reasons that pull against each other: scarce materials, and holding the line. Clean creatures yield dependable materials and are the last of their kind — you are the one depleting them. Corrupted ones are dangerous and strange, and killing them is the only thing slowing the spread.

**You choose a weapon once, at the very start, and every one after that has to be found.** That opening pick is the only identity the game hands out. Weapons come off people — a boar was never carrying a greataxe — so monsters record whether they were an animal or a person, and only people leave a weapon behind. Oswald leaves nothing: he yields rather than dies, and you do not loot your teacher.

**The hero is anonymous by design.** No name, no class, no backstory — they are the weapon in their hand. That is a mechanical decision and a fiction one: the player is one hunter of many, and the town does not revolve around them. Do not write anything that makes the hero singular.

**This game is its own thing.** An early ambition to grow the world into a Realm-of-the-Mad-God-style shared game was dropped on 3 Sep 2026 by the owner. Nothing here is built to serve a later game; anything that would only make sense for one is out of scope.

**The opening is four beats and no speech.** A title card — the game is called _Farther_ — then three short lines about the world (something leaked in long ago and nobody has seen it; far from it the land is still green and nearer the animals stop being animals; you are a hunter and the job is to go out and come back), each one a click, skippable. Then Oswald, in his own few words, hands over the only choice the game makes for you: the weapon. Choosing sends the player straight into the yard to spar with him, and the Hunter's Pack lands at the end of it. There is no camp until you have shown him you can hold the thing. Copy for the opening stays sparse: the world explains itself through what the player finds, or it does not explain itself.

**Oswald** is the first character the player meets: an experienced hunter who spars with them, first to yield. He never tries to kill you, which is why he never crits and why his strikes land in a controlled rhythm — the tutorial's mechanics are explained by who he is rather than excused.

He also rhymes with the boss. The first thing you fight is a hunter; the hardest thing you fight is a hunter who went too far out. The opening and the gate are the same figure at two ends of the same road, and the player is invited to notice without being told.

**Corrupted humans are the worst things out there**, because they were the most dangerous animal to begin with. They are hunters who went too far out and did not come back — which means the hardest enemies in the game are a preview of what happens to the player. Nobody says this out loud. The player works it out when one of them is carrying a weapon they recognize.

**But the first people you meet are only bandits.** Band one's people are not corrupted: they are ordinary men robbing hunters on the way home, because that is easier than hunting. The corruption has touched nobody the player meets until the gate — the Strayed Hunter is the first — and after him the road fills with hunters who fell to it. Bandits can come in variants (bandit, mugger, and so on) as the band needs them. This was the owner's call when the first "strayed" sprites came back looking like ordinary people: rather than fight the art, the fiction moved to meet it.

**Three loot sources, and the split is thematic rather than designed.** Animals yield hide and meat — one of each per kill, no rolling. People yield _gear_, because they are carrying it: a finished item from any slot, and one time in four a weapon you do not yet own. (The specific-weapon version — a Strayed Hunter who swung a greataxe leaves a greataxe — is still the intent and still not modelled.) Oswald yields nothing but the Hunter's Pack, once.

**Areas are corruption bands ordered by distance from the source**, and the player picks an area, never an enemy. Clean and tainted materials remain the natural item axis — dependable versus stronger-but-wrong. Nearer the bastion you hunt animals and fend off bandits; further out you kill people who used to be hunters, so the moral gradient tracks the difficulty gradient.

## Tone and art direction

**Grounded, not heroic.** Leather, iron, wood, bone, worn tools. No archmages, no cathedrals, no gleaming plate, no spell effects. A hunter here looks like someone who works outdoors for a living, because that is what they are.

**Medieval means medieval.** Thatch, wattle and daub, rough timber, shutters with no glass, mud and trodden earth with no roads or cobbles. The first town scenes came back with two-storey half-timbered houses, glazed windows, shingle roofs and paved streets — pretty, and three centuries too late. Say what the buildings are made of, and say what is _not_ there.

This is a deliberate reversal of an earlier call. The world is wildlife, frontier, and an unwinnable holding action, and grandeur fights all three. It also serves the horror: **corruption should be the only thing in a frame that looks wrong, which means everything else has to look right.** Stylised or fantastical baseline art gives the corruption nothing to be wrong against.

**The escalation rule — this generates every creature in the game.** Corruption changes in kind with distance from the source, not just in degree:

- **Near the bastion** — corruption is a _detail_. A recognizable animal with one thing off: too many joints, mismatched eyes, fur the wrong color. The horror is that you can still tell what it used to be.
- **Mid range** — the original species gets harder to read. Proportions wrong, growth where it should not be, movement that does not match the body.
- **Deep** — barely biological. The creature is a scaffold for something else.
- **At the source** — not biological at all. Not in v0.1; nobody has seen it.

When designing any creature, first decide its band, then work outward from a real animal. Never start from a fantasy monster.

**Band one is named "Strange"** — Strange Boar, Strange Elk. It says something is off without saying what. "Turned" was tried and rejected: it reads as undead, which over-commits the fiction before the player has seen anything.

**Palette.** Band one is still a living place: daylight, green, a town that works. A hunter's job is bringing resources back, and if everything out there were already wrong there would be nothing safe to gather. So the creatures go strange before the land does — the environment near the walls stays natural and even bright, and bleakness is earned further out. As distance grows, color goes wrong before shape does — a hue that does not occur in nature, arriving before the anatomy breaks.

**Sprites live in `public/sprites/<id>.png`**, looked up by id — `oswald.png` for a monster, `greataxe.png` for the hero wielding that weapon. 64x64, transparent, rendered at 96-128px with `image-rendering: pixelated`. A missing sprite removes itself rather than showing a broken image, so content can land before its art does.

**Every sprite faces right, and stands on nothing.** The hero is drawn on the left of the scene and the foe on the right, mirrored by CSS, so a right-facing sprite is the only one that ends up looking at its opponent — four of the first eight came back facing left and were flipped on disk. A sprite must not carry its own ground: the first Berserker came with a tuft of grass under his boots that followed him into every scene. Ask for "no ground, no grass, no shadow" and check what came back.

Sprite paths are passed _into_ the view, never stored on a Combatant. The simulation has no idea art exists and should keep it that way.

**Scenes live in `public/scenes/<name>.png`**, 400x224, stretched to fill the fight panel. Every scene keeps its ground line in the lower third, because the figures stand on it: there is no card around a combatant, just the sprite in the place with its name and bars hanging above. `bastion.png` is a row of thatched cottages on a dirt track, with a well and an old oak, for the spar; `forest-edge.png` is a gray autumn clearing among pines with a fallen log, for everything in band one. Both were the owner's pick from a set of four — art is offered as options, never installed as a one-shot. The view picks by defeat style. Five earlier scenes were rejected on sight: a dusk treeline and a bare timber street as too bleak and lifeless for a safe band, a sunlit flower meadow as a fairytale, and two town squares that came back top-down. The scene model reaches for top-down whenever it hears "square" or "yard", so ask for a view "from ground level" and judge by what came back, same as a sprite. The target is a middle ground: a living place under real weather.

**Readability in the scene.** Figures and text on a painting blend into it. The fix chosen from four mocked options: the painting sits on its own layer at three-quarter brightness and color, every figure gets a dark outline one sprite-pixel wide, and each stands on a soft dark pad at the same baseline (sprites are shifted on disk so their feet sit on the bottom row). No plates behind the bars and no HUD strip — those were the rejected options. Figures are drawn as a share of the scene's width, not in fixed pixels: a two-meter figure is about a quarter of the scene wide at any window size, and the Berserker stands 46% of the scene's height whether the window is a narrow pane or a full screen. (They were fixed pixels at first, which looked right in the pane and tiny in a full window; the owner caught it in the first screenshot.) If it is still hard to read, the next lever is prompting scenes for an empty midground where the fighters stand.

**Item icons live in `public/icons/<slot>.png`**, 32x32, one per slot. Every item in a slot shares a name, so it shares a picture. Weapons reuse their sprites. Each slot also has `<slot>-empty.png`, the same picture as a dim gray silhouette, derived from the icon rather than drawn: an empty slot reads as "a hood goes here", a filled one as the hood.

**The camp is four tabs**, by the owner's design: **Gear** (slots laid out in the shape of a body, the way the old MMOs did it — head on top, weapon in the left hand, necklace and rings down the right, hands and feet at the bottom — showing the empty icon or the item, with a picker under it listing what you own for whichever slot you click; the weapon cell shows the character sprite as a placeholder until weapon sprites exist, which come with the next classes), **Go out** (provisions, how far, the areas and the two chosen fights), **Craft** (cookfire and tanner, using the same slot icons), and **Inventory** (rations, meat, hides with their sources, and the pack). Stats and portrait stay in the header on every tab. Nothing is on display that was not asked for.

**64 pixels cannot carry a subtle detail.** A clouded eye, a missing ear, a patch of discolored fur — each is one or two pixels at this size and the model mostly ignores them. What actually rendered on the first band-one animals was red eyes. Either the wrongness has to be large enough to read at 64px (a whole limb, a silhouette that is off, a color that dominates) or the sprite has to be bigger. Do not describe a sprite by its prompt; describe it by what came back.

**Prompt shape that worked**, for consistency: subject and stance, then materials, then "muted earth tones of brown gray and dull green", then "soft natural lighting from upper left", then "plain and grounded", and always end with "no magic, no glow, no glowing effects" — pixel-art models reach for neon and rim-light unless told twice not to.

**Practical.** Art is pixel art via the **PixelLab MCP**. Keep the same palette family, lighting direction, and sprite dimensions within a category. Direction drifts fast when assets are generated one at a time, so look at what already exists before adding to it. Generations are a finite monthly budget — settle a look on cheap single sprites before committing to anything animated.

## Working agreement

- **Never remove a class mechanic to make something else work.** If a lever would zero out something a build is built around, it is the wrong lever. Tune the encounter's specific attacks and numbers, and bring the option before building it.

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
  data/    Content as data — monsters, weapons, resource rules, affix pools and magnitudes.
  view/    Presentation. All DOM and CSS, including the battle scene.
  state/   Run state, persistence, save/load.
tests/     Vitest. Primarily targets sim/.
scripts/   Balance harness, hunt harness, outlier hunter, single-fight runner, screenshot tool.
content/   Screenshots for posts, made by `npm run shot`. Not committed.
public/    Static assets served as-is. Sprites live in public/sprites/.
```

Combat is a **pure function**: `(hero, monsters, seed) => FightResult`, one hero against one or more monsters. A hunt is another pure function on top of it, `sim/hunt.ts`: it rolls encounters from an area's table, chains the fights with health carried forward, and reports what came home. The view is a dumb playback layer that animates the event lists. Consequences this buys, all of which matter:

- **Balance by brute force.** Run 10,000 fights in a second to find broken items instead of guessing.
- **Real tests.** Deterministic sim means a fight either produces the expected events or it doesn't.
- **Reskinnable.** The entire look can change without touching game logic.

Corollaries:

- All randomness goes through the seeded RNG in `src/sim/rng.ts`. Never `Math.random()` inside `sim/`.
- `sim/` must not import from `view/` or `state/`. If it needs to, the design is wrong.
- Content goes in `data/` as plain objects. If adding a monster requires writing new logic in `sim/`, consider whether the gimmick can be expressed as data instead — but don't contort the design to avoid code.

## Gear framework

**Three categories, three jobs.**

- **Armor** (head, torso, legs, feet, hands) — defensive only. It keeps you standing. A leather vest has no business making you drain blood.
- **Weapons** — offensive. The weapon's archetype and resource rule are what the weapon _is_ and are never affixes; offensive affixes roll on top.
- **Trinkets** (two rings, necklace) — offensive, and the **only** source of direct resource affixes. They are made of corruption, which is why they get to break the rules armor obeys.

**Two exceptions, both deliberate.** Hands may carry attack speed and damage despite being armor, because they are the only armor touching the weapon. Initiative is feet-only — one affix that comes from exactly one slot, which gives boots a reason to exist beyond weighting.

**Direct versus indirect is the whole distinction.** Trinkets alone may carry affixes that _say_ "resource." Anything that affects a resource as a downstream consequence is normal and expected everywhere — attack speed accelerates Focus because Focus builds from hits landed, and that is one mechanic touching another, not a resource affix leaking onto gloves. The rule governs what an affix says, not what it ends up influencing.

**No guaranteed primary affix on any slot.** Slots are thematically _weighted_, never forced. A player should never be steered toward a build by their equipment.

**Weighting has real zeros, and they follow from the framework.** Lifesteal cannot appear on boots — not because it is unlikely, but because it is not what boots are. Zeros that come from a principle are ones a player accepts instantly; arbitrary ones just read as bad luck.

**Crafting is the main way to get armor.** Animals leave hide; the tanner at the bastion turns hide into a piece for any armor slot. The material tilts the roll — each hide favors two affixes from the armor pool, drawn at double weight — so the player steers the loot by choosing what to hunt without ever being able to pick an affix. Names follow one convention for the whole first band, "<Material> <Slot>": Boar-hide Hood, Wolf-pelt Gloves. Costs are two hides for head, hands or feet, three for legs, four for the torso; a full set is thirteen kills of the player's choosing. Trinkets are not crafted: they come off people, which is the corruption's own supply line even when the people are only bandits. What deeper bands yield and what it is called is a bridge to cross when we get there.

**Parked:** corrupted armor and weapons that deliberately break these restraints. Tainted gear that grants what its category should not is a natural late-game hook and fits the clean-versus-tainted material split. Not a v0.1 concern, and the framework above is the baseline it would deviate _from_.

## Progression and tuning targets

**The loop, repeated per corruption band:** go out into the band's area, come back with hide, meat and the odd piece taken off a bandit, cook and craft, go out further, and eventually take the band's gate, which opens the next band. The grind has to be long enough to matter and short enough not to bore.

**A hunt is several fights, not one.** The player picks an area and how far to go — 3, 5 or 10 fights — and the hunt rolls straight through without them: animals most of the time, a person one time in seven, an ambush of two or three animals one time in eight. Health carries from fight to fight; the meter empties between. Rations are eaten by a standing rule: after any fight that leaves you under half health with another fight to come, you eat one and get forty back. Fall, and the hunt ends with half of everything gathered lost (rounded in the player's favor; weapons are never lost). The lengths exist so the player assesses risk _before_ leaving, which is the decision the loop is built around.

**Hunt targets, bare with the Hunter's Pack (six rations):** three fights should get home most of the time, five sometimes, ten rarely. **Crafted at p90:** three near-certain, five most of the time, ten more often than not. Measured with `npm run hunts`, which also reports which fight the falls happen in — read that histogram before touching any monster.

**Gear is an edge, not a doubling.** A full set is worth roughly a third more power. Affix magnitudes are deliberately small — eight slots of three affixes add up fast, and an item that looks exciting alone will be broken in a set.

**Regular enemies are the grind, and they are tuned as the grind.** Winnable bare by every build most of the time. Each one favors a build _slightly_ — a different kind of fight, not a different outcome — and none of them is a wall. A regular that a bare build loses nine times in ten is a gate wearing the wrong label. Only the gate is allowed to be impossible.

**Bosses are gates, and they are tuned as gates.** The target for a band boss:

- **Bare: near 0%.** Not a hard fight, an impossible one. This is what forces the grind.
- **Geared at p90: roughly 80%.** Read the 90th percentile, never the median. A player keeps good drops and bins bad ones, so they converge on the top of the distribution — tuning the median tunes a loadout nobody keeps.
- **Both archetypes within about 5 points of each other at p90.** Different routes, same ceiling. A gap at the _median_ is fine and even characterful: it means one archetype is more gear-dependent than the other.

That spread is wide on purpose. Gear being a modest stat change _and_ the difference between 0% and 80% is not a contradiction: the fight is tuned around having it.

**Slow weapons have breakpoints, fast weapons do not.** The Berserker's win rate against the boss falls from 87% to 29% over twenty points of boss health, because twenty health can mean one more swing, which costs 1.5 seconds and another blow taken. The Assassin barely notices the same change. Keep this — it means greataxe builds care about damage thresholds in a way dagger builds never will. It also means retuning a boss's health is far more dangerous than it looks.

## Code conventions

- **US spelling everywhere** — armor, color, gray, meter, favor — in code, comments, this document and on screen. The owner's call; the first sessions drifted British and were swept.

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

**Grown on 3 Sep 2026, by the owner's decision, after the original list was met:** areas instead of chosen enemies · hunts of 3, 5 or 10 fights with health carried · ambushes · bandits · hide and meat · the tanner and the cookfire · the Hunter's Pack. Written here so nobody mistakes it for creep — it was a deliberate reshaping of the loop, not an accretion.

**Out (defer, do not build):** offline/idle progression · prestige · skill trees · multiple heroes · shops · currencies · meta-progression of any kind.

Scope creep is the primary risk to this project. When a new idea arrives mid-build, write it down and keep going.

## Parking lot

Good ideas that are not v0.1. Written down so they stop taking up room.

- **Gambit conditions.** Let the player set _when_ a resource spends: "only below 40% health," "only when the enemy is enraged." Turns spending into a second build axis on top of gear. The eating rule (eat under half health) is the first gambit, currently fixed; a slider for it is the natural first step.
- **Bandit variants and the road after the gate.** More kinds of bandit for band one, and corrupted hunters appearing in the tables once the Strayed Hunter is beaten.
- **Specific weapons off specific people.** A Strayed Hunter who swung a greataxe leaves a greataxe.
- **Resolve and Mana archetypes** — sword-and-shield and staff, once Rage and Focus are proven.
- **Conditional affixes.** Effects with a trigger — gain resource on evade, bonus damage while the meter is full, the first hit of a fight empowered. Agreed as a later pass after the flat affixes were proven; these are what players build _around_ rather than merely accumulate.
- **Levels and class abilities.** Both will move every balance number, which is why gear is tuned to roughly-right rather than precisely. Levels need a job that gear does not already do, and abilities need to come from the weapon rather than a skill tree, or pillar one quietly dies.

## Where we left off

**The loop is the one the owner asked for.** Pick a weapon, spar with Oswald and take his pack, pick how far to go, go out, meet what the forest sends, eat when it goes badly, come home with hide and meat, cook, craft, go again. Progress saves to the browser. The old "pick an enemy" loop is gone.

**Built and tested — 77 tests:** the combat simulation (attack-speed timeline, Rage and Focus, crit on both sides, block, evasion, lifesteal, initiative, resource retention, several monsters at once), hunts (encounter tables, ambushes, carried health, rations, the fall tax), two archetypes both reachable in game, nine monsters (a teacher, four band-one animals, two bandits, a gate), eight equipment slots, 19 affix kinds, weighted and tilted rolls, crafting, the cookfire, the Hunter's Pack, run state and saving, the fight view with several foes, ten sprites, seven slot icons, and two scenes. Four harnesses: `npm run fight`, `npm run balance`, `npm run hunts`, `npm run outliers`. And one content tool: `npm run shot` drives a headless Chromium against the live build, hunts until the fight you name comes up, freezes it a few blows in and saves the scene — every build is a shareable picture as well as a link.

**Hunts, measured.** `npm run hunts` — 400 hunts per cell bare, 30 crafted sets of five tanner pieces plus three trinkets, everyone carrying six rations. "Home" is the share of hunts that get back to the walls. Read p90 for crafted, as ever.

| Weapon    | Length | Bare home | Crafted p50 | Crafted p90 | Where bare falls       |
| --------- | ------ | --------- | ----------- | ----------- | ---------------------- |
| Berserker | 3      | 57%       | 83%         | **87%**     | mostly fight 3         |
| Berserker | 5      | 19%       | 75%         | **84%**     | fights 3–5             |
| Berserker | 10     | 0%        | 49%         | **66%**     | spread over fights 3–9 |
| Assassin  | 3      | 45%       | 79%         | **85%**     | fights 2–3             |
| Assassin  | 5      | 18%       | 70%         | **78%**     | fights 2–4             |
| Assassin  | 10     | 0%        | 46%         | **60%**     | spread over fights 2–9 |

**The Berserker meets the hunt targets.** Three fights bare gets home a little over half the time, five sometimes, ten never; crafted p90 is near-certain at three, most of the time at five, and two in three at ten. Those are the targets as written.

**The Assassin now meets them too, after a tuning pass.** It was dying in fight two: same hundred health, no damage reduction, ten percent evasion. Measured levers, bare at 3 / 5 / 10 and crafted p90 at 3 / 5 / 10: health 130 gave 39 / 7 / 0 and 91 / 84 / 67 and was rejected on principle; evasion 20% alone 33 / 7 / 0 and 88 / 80 / 63; damage 7 alone 38 / 13 / 0 and 87 / 81 / 63; Focus carrying between fights 24 / 5 / 0 and 83 / 76 / 56, reverted as not worth its code. **Chosen: damage 7 and evasion 15%**, the table above. Crafted, the two builds are now within a few points at every length; bare, the Assassin trails by about ten at three fights, which is the fragile-but-deadly shape intended.

**Single fights, for reference.** `npm run balance`, 2000 bare fights and 60 rolled loadouts x 150 fights per matchup, after the daggers change and the gate retune. Every regular is winnable bare by both builds; the bandits slot in as regulars.

| Weapon    | Monster        | Bare  | Bare avg | Geared p50 | Geared p90 | Big hits bare (fewest) |
| --------- | -------------- | ----- | -------- | ---------- | ---------- | ---------------------- |
| Berserker | Oswald         | 100%  | 6.3s     | 100%       | 100%       | 1                      |
| Berserker | Strange Boar   | 100%  | 6.1s     | 100%       | 100%       | 1                      |
| Berserker | Strange Elk    | 100%  | 16.1s    | 100%       | 100%       | **0**                  |
| Berserker | Strange Wolf   | 100%  | 7.8s     | 100%       | 100%       | 0                      |
| Berserker | Strange Bear   | 100%  | 10.9s    | 100%       | 100%       | 0                      |
| Berserker | Bandit         | 100%  | 6.2s     | 100%       | 100%       | 0                      |
| Berserker | Mugger         | 100%  | 8.2s     | 100%       | 100%       | 1                      |
| Berserker | Strayed Hunter | 0.1%  | 8.6s     | 57.3%      | **80.0%**  | 1                      |
| Assassin  | Oswald         | 100%  | 7.1s     | 100%       | 100%       | 2                      |
| Assassin  | Strange Boar   | 100%  | 6.4s     | 100%       | 100%       | 2                      |
| Assassin  | Strange Elk    | 100%  | 13.4s    | 100%       | 100%       | **5**                  |
| Assassin  | Strange Wolf   | 100%  | 7.1s     | 100%       | 100%       | 2                      |
| Assassin  | Strange Bear   | 100%  | 12.8s    | 100%       | 100%       | 4                      |
| Assassin  | Bandit         | 100%  | 5.4s     | 100%       | 100%       | 1                      |
| Assassin  | Mugger         | 99.9% | 8.7s     | 100%       | 100%       | 3                      |
| Assassin  | Strayed Hunter | 5.1%  | 9.3s     | 57.3%      | **83.3%**  | 2                      |

The Elk still starves Rage (fewest big hits **0**) while Focus fires five times; the Bear is still the sharpest Assassin-punisher, now a longer fight rather than a lost one. `MAGNITUDE_SCALE = 0.7` in `src/data/affixes.ts` is unchanged; retune that constant before touching individual ranges.

**The gate, after the daggers change.** Seven damage sent the Assassin to p90 93% and bare 10% against a target of 80% and near zero. Measured levers on the Strayed Hunter, Berserker / Assassin at p90: armor 1 / 2 / 3 gave 71 / 87, 55 / 62, 38 / 42; health 210 / 220 gave 63 / 84, 43 / 82 — both punish the greataxe's swing breakpoints far harder than the daggers. Making every swing unavoidable gave 79 / 87 and was rejected on principle (above). A heavy blow every 2 / 3 / 4 swings gave 84 / 91, 83 / 91, 83 / 92 — a puzzle, not a lever, because evasion was never most of what kept the Assassin alive. Swing rate 0.4 gave 29 / 67. Damage 40 / 42 gave 73 / 73, 61 / 45. **Chosen: 39 damage and a heavy blow every third swing: Berserker 80%, Assassin 83%, bare 0.1% and 5.1%.** On target, three points apart. One point of boss damage moved the Assassin eight points and the Berserker three, so this number is not to be nudged casually.

**Next, in order:**

1. **Band-one sprites that actually read as strange.** At 64px the one-detail wrongness did not render; what came back was normal animals with red eyes. Acceptable for now. When revisited: lead the prompt with a wrongness big enough to survive 64px, or use a larger canvas.
2. **A third weapon**, before any animation. The owner's order: settle the character sprites and add classes first, then animate. Attack animation is designed for — the figures stand free in the scene — and not built.

**Known and deliberately unfixed:**

- **Wasted Rage meters — decided: leave it.** Most geared Berserker losses to the boss end holding a full meter, because Rage fills from one boss swing in two hits and the greataxe swings every 1.5 seconds. The owner played it and ruled on 3 Sep 2026: the Berserker is fine as it is, and he will change it later if he wants to. Do not reopen it; do not propose fixes.
- **The hunt harness's crafted set is a random mix of hides.** A real player picks. The p90 partly covers this, but a "best material per slot" set would sit higher than the table says.
- **No levels, no abilities, no attack animation.** Figures stand still while numbers fly.

## Notes

- Git from the first commit. Commit at working checkpoints, not at the end of the day.
- If this ships to Steam later, AI-generated assets require disclosure at submission — worth confirming current policy well before launch.
