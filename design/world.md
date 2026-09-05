# Farther — The World

The places, the gradient that orders them, and the rules that never bend. Written before it is drawn, so that a prompt is a line copied out of this file.

**How to read this.** Plain text is decided — it comes from `CLAUDE.md`, from the data files, or from a call the owner has already made. Anything marked **[proposed]** is a suggestion filling a gap, and it is his to keep or strike.

---

## The one fact everything hangs off

**A source of corruption exists somewhere, and it has been leaking outward for a long time. Everything in this world is a function of distance to it.**

That single gradient is the difficulty curve, the art direction and the reward curve at once. It is why the game is called _Farther_: the farther out you go, the stranger and more corrupt it gets, and the more what you bring back is worth. Oswald says it out loud after the first spar and nobody says it again.

**Corruption escalates in kind, not just degree.** Near the bastion it is a detail. Further out the original creature gets harder to read. Near the source it stops being biological at all. When designing anything — a creature, a place, an item, a line — decide its band first.

## The rules that never bend

Every one of these has already cost something to learn. They are collected here so a prompt, a sprite or a line of copy can be checked against them in one place.

**About the thing at the source**

1. **It never speaks.** No antagonist dialogue, no taunt, no reveal, no monologue, ever.
2. **It does not know we exist.** We are incidental to it. It never notices, never responds, never targets.
3. **It cannot be beaten, only held back.** There is no win condition and everyone in the fiction knows it. This is what lets the game run forever without lying to the player.
4. **The world explains itself through what the player finds, or it does not explain itself.**

**About the player**

5. **The hero is anonymous.** No name, no class, no backstory, no family named on screen. They are the weapon in their hand. Nothing may make them singular — they are one hunter of many and the town does not revolve around them.
6. **They were born inside the wall.** There is nowhere safe to have arrived from, so nobody arrives.
7. **You choose a weapon once, and every one after that has to be found.** Weapons come off people — a boar was never carrying a greataxe.

**About what is on screen**

8. **Corruption is the only thing in a frame that looks wrong**, which means everything else has to look right. Stylized or fantastical baseline art gives the corruption nothing to be wrong against.
9. **Grounded, not heroic.** Leather, iron, wood, bone, worn tools. No archmages, no cathedrals, no gleaming plate, no spell effects.
10. **Medieval means medieval.** Thatch, wattle and daub, rough timber, shutters with no glass, mud and trodden earth. No roads, no cobbles, no glazed windows, no shingle roofs, no two-storey half-timbering. The first town scenes came back three centuries too late. Say what the buildings are made of, and say what is _not_ there.
11. **The Warlock's crystal is the only thing on the player's side that may glow.** Everything else in the game, on both sides, is lit by daylight and nothing else.

**About the words**

12. **Player-facing copy shows a place and a moment. It never explains the setting.** The first draft of the opening read like a summary of the design document and was rejected: _"it sounds like you're reporting based on our documentation, not introducing a story to a player that's stepping into the world."_
13. **Nobody says the word corruption.** Somebody boils bones.
14. **US spelling everywhere** — armor, color, gray, meter, favor.

---

## The bands

Areas are corruption bands ordered by distance from the source. **The player picks an area, never an enemy.** Nearer the bastion you hunt animals and fend off bandits; further out you kill people who used to be hunters, so the moral gradient tracks the difficulty gradient.

**Three bands and a source.** **[proposed]** The north star names four rungs — near the bastion, mid range, deep, at the source — and the fourth is not a place the player goes. Since the corruption cannot be beaten, the road runs out before the source does: three playable bands, and the source is a design object that keeps the other three consistent. The count is the owner's to set; nothing below breaks if it becomes four.

| Band  | Area                               | Distance           | The corruption is                                      | The people are                               |
| ----- | ---------------------------------- | ------------------ | ------------------------------------------------------ | -------------------------------------------- |
| One   | **Forest Edge**                    | A day out and back | A detail. One thing off.                               | Bandits. Nobody corrupted until the gate.    |
| Two   | **The Sunken Wood** **[proposed]** | Days               | The whole animal at the wrong scale. Color goes wrong. | Hunters who went too far, coming back wrong. |
| Three | **The Quiet** **[proposed]**       | Weeks              | Barely biological. A scaffold for something else.      | Far gone. Carrying weapons you recognize.    |
| —     | The source                         | Never reached      | Not biological at all.                                 | Nobody comes back to say.                    |

**Names are hunters' names and stay plain.** "Forest Edge" is already exactly right: functional, descriptive, unromantic, the kind of thing people who work somewhere actually call it. Nothing out here is named for a hero or a battle. **[proposed]** "The Sunken Wood" for standing water among dead trees; "The Quiet" named for what is missing rather than what is there, because that is how hunters would name a place where nothing sounds.

**The player gets no farther than band three, ever**, and this is not a limitation to be fixed later. It is rule three, drawn as a map.

---

## Band one — the Forest Edge

**`forest-edge.png`, 400x224 · the scene for every fight in band one**

> _The woods nearest the walls. Still green, still quiet, still where the town gets its meat and hide. The animals have started to look at you differently._
> — `src/data/areas.ts`

**This is a living place, and that is a deliberate, load-bearing decision.** A hunter's job is bringing resources back, and if everything out there were already wrong there would be nothing safe to gather. So **the creatures go strange before the land does.** The environment near the walls stays natural and even bright; bleakness is earned further out.

Five earlier scenes were rejected on sight and the rejections are the specification: **a dusk treeline and a bare timber street were too bleak and lifeless for a safe band; a sunlit flower meadow was a fairytale; two town squares came back top-down.** The target is a middle ground — a living place under real weather.

What is installed and was the owner's pick from four: **a gray autumn clearing among pines, with a fallen log.**

**How to ask for a scene.** The scene model reaches for top-down whenever it hears "square" or "yard", so ask for a view **from ground level** and judge by what came back, same as a sprite. **The ground line sits in the lower third**, because the figures stand on it — there is no card around a combatant, just the sprite in the place with its name and bars above. **[proposed]** Ask for an **empty midground** where the fighters stand: this was named in the north star as the next lever if figures are still hard to read against the painting, and asking for it up front is free.

> **Prompt:** a clearing at the edge of a pine forest seen from ground level at eye height, gray overcast autumn light, a fallen mossy log to one side, bare earth and dead leaves across the open middle of the clearing, distant trees, no people and no animals, muted earth tones of brown gray and dull green, plain and grounded, no magic, no glow, no glowing effects

### What band one yields

**Three loot sources, and the split is thematic rather than designed.**

- **Animals** yield hide and meat, one of each per kill, no rolling. Four hides, each tilting a craft toward two affixes: boar (block, flat reduction), wolf (evasion, initiative), elk (max health, health percent), bear (flat and percent reduction).
- **People** yield _gear_, because they are carrying it — a finished item from any slot, and one time in four a weapon you do not yet own. They never yield hide. They were made, not skinned.
- **Oswald** yields nothing but the Hunter's Pack, once. You do not loot your teacher.

**Crafting is the main way to get armor.** The tanner turns hide into a piece for any armor slot; the material tilts the roll at double weight, so the player steers the loot by choosing what to hunt without ever being able to pick an affix. Names follow one convention for the whole band: **"\<Material\> \<Slot\>"** — Boar-hide Hood, Wolf-pelt Gloves. Two hides for head, hands or feet; three for legs; four for the torso. **A full set is thirteen kills of the player's choosing.**

**Trinkets are not crafted. They come off people** — which is the corruption's own supply line, even when the people are only bandits. They are made of corruption, which is why they are allowed to break the rules armor obeys.

---

## The town

**The town is the hub, and it is a painting, not a menu.** `town.png`, 400x224, and it is both the spar's yard and the town screen.

**One of the last bastions where clean wildlife survives.** That phrasing is doing quiet work: there are others, and _last_ means the number is going down. **[proposed]** The town never discusses this and no screen ever states it. If it surfaces at all it surfaces the way real news does — a road nobody takes any more, a trade that stopped coming.

### What is on the painting

A row of **thatched cottages** on a **dirt track**, a **palisade gate**, the **tanner's drying frame**, a **cookfire**, and an **old oak**. Single storey, wattle and daub, rough timber, shutters with no glass, mud and trodden earth. **No cobbles, no paving, no glazing, no shingle.**

**Four things can be pointed at**, and nothing is labelled: the tanner's frame, the cookfire, Oswald under the oak, and the gate. Hovering runs a gold line one painting pixel wide around the thing itself; clicking opens a panel over the painting. A browser-drawn box, a text label and a brightened copy of the painting were each tried and rejected on sight.

**The hover lines are traced from the painting**, by `scripts/cutouts.py`, from a mask of that thing's pixels — traced shapes for the fire and the gate, and a hand-painted mask under `art/masks/` for the frame, whose hides share their colors with the dirt behind them. **If `town.png` is redrawn, all three lines must be regenerated.** This is the single most easily forgotten consequence of the redraw.

**The player is not drawn in town.**

**The smithy is on the painting and is held.** It promises something, and weapons come off people for now. Do not give it a job to make the painting make sense.

### The name of the town

**[proposed] It is not named on screen, and the doc gives it one anyway.** The hero is anonymous and the game never needs to say where they are, so no screen has to carry a name — but creatures, materials and copy all get easier to write when the place has one.

**Proposed: the Pale.** A pale is literally a fence of stakes — a palisade, which is what is on the painting. It is a real, plain, medieval word for exactly this thing, and _beyond the pale_ means outside the fence, which is the entire game. It is grounded, it is not heroic, and it is not invented fantasy vocabulary.

Alternatives if that reads too clever: **Longwatch**, **Thornwall**, or simply leaving it unnamed, which costs nothing.

> **Prompt:** a row of small single-storey thatched cottages seen from ground level at eye height along a muddy dirt track, wattle and daub walls, rough timber frames, open shutters with no glass, a palisade fence of split stakes with a gate at one end, a large bare oak, a low cookfire with a pot, a wooden drying frame hung with hides, gray daylight, no people, muted earth tones of brown gray and dull green, plain and grounded, no cobbles, no paved road, no glazed windows, no magic, no glow, no glowing effects

### Two meanings of "gate", and they collide

Worth knowing before writing any copy:

- **The town's gate** is the thing on the painting where hunts start.
- **A band's gate** is its boss — the fight that opens the next band. The Strayed Hunter is band one's gate.

The words are already in use both ways in the code and the north star. **[proposed]** Keep both, but never let a player-facing line use the second meaning: to the player, a gate is a gate in a fence, and the Strayed Hunter is a man on a road.

---

## The bands beyond

**Nothing here is built.** Writing a band is not building one, and the v0.1 scope does not move by a single monster. This exists so band one is drawn knowing what it is the shallow end of. What walks in these places is in `characters.md`.

Everything in this section is **[proposed]**.

### Band two — the Sunken Wood

**Where the land itself first goes wrong, and it goes wrong by color before it goes wrong by shape.** That ordering is the palette rule and it is what keeps band two from simply looking like band one at night.

Standing water where there was forest floor. The pines are still upright and no longer alive — a dead wood that has not fallen down yet, which is a more unsettling image than a ruin, because ruins have finished happening. No birds. The quiet is not yet total, which is what band three is for.

**The color.** Somewhere in this scene there is a hue that does not occur in nature — in the standing water, or in the lichen, or in the sap. **Not neon and not a spell effect**: a wrong, flat, sourceless color, the more disturbing for being pale. This is the first place in the game the player sees one, and it should arrive before any anatomy has broken.

**Why a hunter goes there.** The materials are better and there is nothing left worth taking at the Forest Edge. **[proposed]** Band one's animals are the last of their kind and the player is the one depleting them — the pressure to go out farther should be at least partly the player's own fault.

### Band three — the Quiet

**Named for what is missing.** No birds, no insects, no wind in anything, no water moving. Growth has stopped being plants without stopping being growth.

**This is where the grounding rule is hardest to hold**, because a model will reach for a wasteland or a hellscape the moment it is given room. The discipline is the same one that governs the creatures: **start from a real place and take things away**, rather than starting from a fantasy and adding. Band three should read as a real forest, or a real fen, that something has been subtracted from — not as another world.

**Nobody lives here and nobody has for a long time.** Anything the player finds was dropped, not built.

### What deeper bands yield — an open systems question

**This one is flagged, not answered, because it changes mechanics rather than fiction.**

Band one's economy is clean: animals give hide, the tanner turns hide into armor, people give gear. Band two's creatures are barely animals and band three's are not animals at all — so **what does a tanner do with what comes back?**

Three ways to go, all with real consequences:

1. **The convention holds and the names get uglier.** A tanner still works it, and the material name carries the wrongness. Cheapest, keeps one crafting system for the whole game.
2. **The convention breaks at band two**, and deep materials go somewhere other than the tanner — which is a job for the held smithy, and the first honest reason to open it.
3. **Deep bands stop yielding materials entirely** and become a pure gear-off-people economy, which pushes the player toward corrupted hunters and makes the moral gradient bite.

The north star already parks **corrupted armor and weapons that deliberately break the gear framework's restraints** as a natural late-game hook, and it fits the clean-versus-tainted split. Whichever of the three is chosen, that is the shape the reward curve wants.

**Recommendation if one is wanted: option 2.** It gives the smithy a job it has been waiting for, it makes crossing a band feel like a change in kind rather than in degree, and it keeps the tanner as band one's own.

---

## The source

**It is designed, never drawn, never named, never reached, never revealed.** The four rules at the top of this file govern it and nothing later may soften them.

**[proposed] What it is doing, for our use only:** nothing. It does not spread, attack or consume. It is _present_, and proximity is the whole effect — matter near it stops holding its shape the way distance allows. That is why the gradient is smooth, why there is no front line, why it cannot be fought, and why nothing it produces has intent. Everything the player kills is a side effect of something that has not noticed them.

**If that answer is ever visible in the game, the rule has been broken.** It exists to keep hundreds of creature and place designs consistent with each other, and for nothing else.

---

## Appendix — the technical shape of a scene

Kept here so a scene prompt and a scene file do not drift apart.

- **`public/scenes/<name>.png`, 400x224**, stretched to fill the fight panel.
- **The ground line sits in the lower third.** Figures stand on it; there is no card around a combatant.
- **The painting sits on its own layer at three-quarter brightness and color** so figures and text read against it. Every figure gets a dark outline half a sprite pixel wide — a full pixel read heavy — and stands on a soft dark pad at the same baseline. No plates behind the bars and no HUD strip; both were tried and rejected.
- **Figures are drawn to real height.** Every figure has a height in meters and a measured pixel height on its canvas, in the table in `src/view/art.ts`, and the scene has one pixels-per-meter scale. A boar stands lower than an elk and the hero is the same height in every scene. **A sprite whose feet move on disk needs its pixel height re-measured** — which every sprite in the redraw will.
- **A missing sprite removes itself** rather than showing a broken image, so content can land before its art does.
- **Sprite paths are passed into the view, never stored on a combatant.** The simulation has no idea art exists and should keep it that way.
