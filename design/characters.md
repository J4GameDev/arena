# Farther — The Characters

Everyone and everything that gets drawn. Written before it is drawn, so that a prompt is a line copied out of this file rather than a thing invented at the keyboard.

**How to read this.** Plain text is decided — it comes from `CLAUDE.md`, from the data files, or from a call the owner has already made. Anything marked **[proposed]** is a suggestion filling a gap, and it is his to keep or strike. Nothing marked that way has been drawn or built.

**Every entry ends with its prompt.** That is the point of the document. The prompt follows the shape that works: subject and stance, then materials, then the palette line, then the lighting line, then "plain and grounded", then the tail. Copy it, run it, judge what came back — never judge the sprite by what the prompt said.

**Standing rules for every figure.**

- 64x64, transparent, faces **right**, stands on **nothing** — no grass, no ground, no shadow. Four of the first eight came back facing left and were flipped on disk.
- **Every idle holds its weapon in both hands or in hand. Nothing rests on a shoulder.** An animator keeps whatever grip frame 0 has and will never invent the second hand.
- The wrongness has to survive 64 pixels. A clouded eye is one pixel and the model ignores it. A whole limb, a broken silhouette, or a color that dominates is what reads.
- Muted earth tones. Soft natural light from the upper left. No magic, no glow — the one exception is the Warlock's crystal, and it is written into that entry.
- Art comes as options. A sheet of candidates, the owner picks a number. Never a one-shot install.

**The order the redraw runs in.** The two base bodies first, because every class is drawn from them. Then the five classes on each body, with the base as the character reference and the weapon icon as the weapon reference. Then Oswald, because the Strayed Hunter is drawn to rhyme with him. Then the animals, then the bandits, then the gate.

---

## The hero

**The hero is anonymous, and stays that way.** No name, no family named on screen, no backstory beyond the morning the game opens. They are the weapon in their hand. The player is one hunter of many and the town does not revolve around them — nothing drawn or written may make the hero singular.

They were born inside the wall. They come of age on the morning the game opens, and today is the first day the gate is open for them. Oswald taught them to set a snare at eight.

### The two base bodies

**`base-male.png`, `base-female.png` · the character reference for all ten class sprites**

A young man and a young woman, just old enough to be let out. Undyed cream linen and wool — the plainest thing in the game, because everything else is drawn on top of it. Nothing on them says hunter yet; they have not been given the weapon.

They are the only two sprites in the game whose job is to be a reference rather than to appear. The player never sees them: the body choice in the opening is made before the rack, and by the time there is a figure on screen it is already carrying a weapon.

> **Prompt:** a young man standing facing right, plain undyed cream linen tunic and wool trousers, simple leather belt, bare hands, worn ankle boots, arms at his sides, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects
>
> …and the same for the woman, drawn from the man as the character reference so the two are the same hand.

### The five classes

The weapon is the class. There is no class picker, no armor progression drawn on the sprite, and no visual level-up: the figure the player picks at the rack is the figure they have all game. So each of the five has to say who that hunter is on the first frame.

**The heights come from `src/view/art.ts` and they differ by class on purpose** — the greataxe stands at 1.85 m and the daggers at 1.75. The kind of person who takes the heaviest thing off the rack is the biggest person in the yard. **[proposed]** Draw the difference: the Berserker is broader through the shoulders than the other four and the Assassin is the slightest, on both bodies.

**Every one of them is poor.** They are sixteen years old on their first morning past the wall, holding a weapon somebody handed them. Nothing they wear was bought. No plate, no matched kit, no insignia, nothing that looks issued.

---

#### Berserker — the greataxe

**1.85 m · `greataxe-male.png`, `greataxe-female.png` · weapon icon `greataxe`**

_Rusted Greataxe. Blows aimed at you fill Rage, and it hardens you as it climbs._

The one who decided armor was not going to save them. The Berserker stands and takes it — evasion zero, block zero — and the sprite has to look like that was a decision rather than an oversight. Least covered of the five: a leather jerkin worn open, forearms bare or wrapped in strap, heavy boots. The toughness is in the person, not the kit.

**The axe is double-bladed**, and that is settled: the icon candidates came back two-bladed and the owner redrew the class to match the icon rather than fight the model. It is rusted, heavy, and older than its owner. **The stance is the ready stance** — axe held low in front, blades toward the ground, **both hands on the handle**. This is the sprite that produced the only clean two-handed chop of 4 Sep 2026. The shoulder carry is dead.

> **Prompt:** a broad young man standing facing right in a two-handed ready stance, holding a large rusted double-bladed greataxe low in front of him with both hands gripping the handle, open leather jerkin, bare forearms wrapped in strap, heavy worn boots, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

#### Assassin — the twin daggers

**1.75 m · `twin-daggers-male.png`, `twin-daggers-female.png` · weapon icon `dagger`**

_Twin Daggers. Every hit you land fills Focus; the fifth is a finisher._

The slightest of the five, and it has to read as a trade rather than as a weakness — this build gets damage and fifteen percent evasion and pays for it with a body that cannot take many blows. Close-fitting dark wool and leather, sleeves bound at the wrist, soft boots rather than heavy ones, nothing loose enough to catch. No bulk anywhere.

**A dagger in each hand**, held low and forward, weight on the front foot. Both hands are on a weapon, which satisfies the stance rule without any special handling — this is the easiest of the five to animate and should be drawn to stay that way.

> **Prompt:** a slight young man standing facing right in a low ready stance, a plain iron dagger held forward in each hand, close-fitting dark wool and leather, sleeves bound at the wrist, soft worn boots, weight on the front foot, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

#### Warden — the sword and shield

**1.8 m · `sword-and-shield-male.png`, `sword-and-shield-female.png` · weapon icons `sword`, `shield`**

_The shield takes twelve percent off every blow, no luck to it. Five blows taken fills Resolve, and it spends on a bash that staggers._

The most covered of the five and still not armored — **no gleaming plate, ever**. Boiled leather over the chest, iron studs, maybe a short mail sleeve on the shield arm. Everything about this build is "takes a share off every blow with no roll", so the kit should look dependable and dull rather than protective.

**The shield is wood**: planks, an iron boss at the center, an iron rim, and it has been hit. Round, and no larger than a man can actually carry all day. Sword in the right hand, held low; shield on the left arm, up at chest height. Both hands engaged.

> **Prompt:** a young man standing facing right, a plain iron sword held low in his right hand and a round wooden shield with an iron boss raised on his left arm, boiled leather chest piece with iron studs, the shield planks scarred and split, worn boots, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

#### Ranger — the short bow

**1.75 m · `short-bow-male.png`, `short-bow-female.png` · weapon icon `bow`**

_Arrows from a distance, and a snare that takes six seconds to set. Once set, the next arrow springs it and the target loses its next swing._

The only one of the five who is not fighting hand to hand, and the only meter that ignores the timeline entirely. This is the hunter who is most obviously a hunter: the other four look like people who were given a weapon, and the Ranger looks like someone at work.

**The snare has to be on the sprite.** It is the whole payoff — it does not add damage, it takes the enemy's turn away — and a coil of waxed cord at the belt is what tells the player that before the first fight does. **[proposed]** A coil of cord at the hip, and a few stakes or a bundle of snare wire; this is the one class whose gear says what its meter does.

**Bow in the left hand with an arrow nocked and the right hand at the string.** Both hands engaged, drawn at rest rather than at full draw — a full draw is an attack frame, not an idle.

> **Prompt:** a young man standing facing right holding a short wooden bow in his left hand with an arrow nocked and his right hand on the string, a coil of waxed cord and a bundle of snare wire hanging at his belt, quiver at the hip, worn leather and rough wool, hood down, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

#### Warlock — the crystal staff

**1.8 m · `staff-male.png`, `staff-female.png` · weapon icon `staff`**

_Every point of health you lose fills the crystal. At thirty it gives it back as one burst at three and a half times damage. It wants you hurt._

**This is not a mage.** No robes, no cowl, no arcane anything, no cathedral. The Warlock dresses exactly like the other four hunters, because that is what they are — the only difference is the thing in their hands. The moment this sprite reads as a wizard, the fiction has broken.

**The crystal in the head of the staff is a piece of the corruption, held in the hand.** It is the one thing on the player's side that may glow, and it is the only exception in this document to the no-glow rule. It is set into a plain wooden shaft — found, lashed, or wedged, not crafted and not ornamental. The staff should look like a stick with something wrong in the end of it.

**The prompt tail changes for this figure and only this figure.** Do not append "no glow, no glowing effects" here or the crystal will come back as a rock. Say instead that the only light in the image is the crystal.

**How a hunter comes to be carrying such a thing is deliberately unwritten**, per the north star: that fiction gets written after the class has been played, not before. Nothing in this entry should imply an answer.

**[proposed]** The staff is held in **both hands**, angled across the body, rather than the one-handed grip the gear table implies. That mapping in `art.ts` governs which cell the icon sits in, not how the sprite stands, so there is no conflict — and a two-handed grip is what survives the animator.

> **Prompt:** a young man standing facing right holding a plain wooden staff angled across his body with both hands, a rough uncut crystal wedged and lashed into the head of the staff giving off a faint sickly light, worn hunter's leather and rough wool exactly like a woodsman, no robe and no hood, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, the crystal is the only light in the image

---

## The town

### Oswald

**1.75 m · `oswald.png` (the spar), `oswald-idle.png` (under the oak) · portrait `oswald.png`**

The first person the player meets and the only teacher in the game. An experienced hunter who spars with them in the yard on the morning they come of age, and is first to yield. He never tries to kill you — that is why he never crits and why his blows land in a controlled rhythm, one every 0.83 seconds at nine damage. The tutorial's mechanics are explained by who he is rather than excused.

He taught the hero to set a snare at eight. **[proposed]** That puts him at fifty or older: gray well into the beard, weathered, and slower than he was. He is not a warrior and should not be drawn as one — a working hunter at the end of a working life.

**He rhymes with the gate, and this is a drawing instruction, not a note.** The first thing you fight is a hunter; the hardest thing you fight is a hunter who went too far out. Oswald and the Strayed Hunter are the same figure at two ends of the same road, and the player is invited to notice without ever being told. **Draw them as a matched pair: the same silhouette family, the same kit, the same kind of man — and then draw one of them wrong.** If the Strayed Hunter does not look like Oswald could have become him, the rhyme has failed and both sprites are wrong.

**[proposed]** He spars with a **hunting spear, reversed** — the butt toward the hero, because he is not trying to hurt them. It is the plainest way to show a pulled strike, it gives the Strayed Hunter something to carry that echoes it, and it keeps a weapon out of the loot pool: Oswald yields rather than dies and you do not loot your teacher.

After the spar he stands under the oak, **arms crossed, facing the road** — that is `oswald-idle.png`, and the crossed arms are the tell that he is done fighting for good.

**His portrait must be drawn from his sprite, not from this text.** The first four faces were generated from a description and came back as four different men, and the owner said so. The Pro model with the sprite as the character reference gave four that were all him. If the owner prefers the portrait's clothing to the sprite's, the sprite is redrawn from the portrait, never the reverse.

> **Prompt (spar):** an old weathered hunter standing facing right holding a long hunting spear across his body with both hands, the butt end forward, gray beard, worn leather coat and rough wool, patched at the elbows, heavy boots, calm and unhurried, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects
>
> **Prompt (under the oak):** the same man standing facing right with his arms crossed over his chest, no weapon, gray beard, worn leather coat and rough wool patched at the elbows, heavy boots, still and watchful, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects
>
> **Prompt (portrait, 96x96):** a face, three-quarter view, on nothing — run with the chosen sprite as the character reference and no description of the face at all.

### The tanner and the cook

**Currently places, not people.** The town screen points at the tanner's drying frame and the cookfire, and clicking each opens a panel. Neither has a face, a sprite, a portrait or a name.

**Open question for the owner, and a real one.** Two ways to go, and the doc should not pick:

1. **They stay places.** The town is a painting with four things on it, the panels are what those things do, and the only person in town is Oswald. Cheapest, and consistent with a town that does not revolve around the hero.
2. **They become people**, with a portrait each and a line or two when their panel opens. Warmer, and it makes the bastion feel inhabited rather than staffed — but it is two more portraits, two more voices to write, and two more characters to keep consistent.

Nothing else in the design depends on the answer, which is why it can wait. **[proposed]** If they become people: the tanner is a woman who has been doing this longer than Oswald has been hunting and is unsentimental about where hide comes from; the cook is old enough to remember when the elk still ran. Neither ever mentions the corruption. One of them boils bones.

---

## Band one — the animals

**The rule this band exists to obey.** Near the bastion, corruption is a _detail_. A recognizable animal with one thing off. The horror is that you can still tell what it used to be.

**The rule that was learned the hard way.** At 64 pixels a subtle detail does not render. The first pass at these four came back as normal animals with red eyes, because a clouded eye or a patch of wrong fur is one pixel and the model ignores it. Every wrongness below is therefore **a broken silhouette or a whole limb** — something that changes the animal's outline, which is the only thing that survives at this size.

**And the rule that makes them worth drawing at all: a creature's wrongness and its mechanic are the same fact.** Each of these four already has a design role in `src/data/monsters.ts` — a thing it does to a build. The wrongness proposed here is not decoration bolted onto that role; it is the _reason_ for it. The elk will not run because of what has grown over its eyes. The wolf hunts alone because of what its legs do. If a creature's look and its numbers need separate explanations, the creature is not finished.

Every one of them is judged by a **blind test**: show the sheet to a fresh reader and ask what is wrong with the animal. If they cannot say, the sprite failed, whatever the prompt claimed.

### Strange Boar

**1.0 m at the shoulder · `strange-boar.png` · drops boar hide · 100 health, 12 damage, charges**

_The first real hunt — the first thing you fight that is actually trying to hurt you._ Recognizably a boar. Thick, low, fast in a straight line, and it commits to everything.

**[proposed] The wrongness: too many tusks.** A second and a third pair growing out of the jaw at angles that were never going to work, crowding the head and breaking its outline. It reads instantly at 64px because a boar's head _is_ its silhouette, and it explains the fight: this animal charges because charging is the only thing the head is still good for.

Boar hide favors block chance and flat damage reduction — thick and stubborn, turns a blow aside as often as it soaks one.

> **Prompt:** a wild boar seen from the side facing right, thick bristled hide, head lowered to charge, too many tusks growing from its jaw in several mismatched pairs at wrong angles, crowding and breaking the shape of its head, otherwise an ordinary boar, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

### Strange Elk

**2.3 m · `strange-elk.png` · drops elk hide · 200 health, 5 damage at 0.4 a second**

_The Berserker-punisher._ Huge health, almost no offense. It does not flee and it barely fights back. It just stands there and will not die — which starves Rage completely, because Rage fills from damage swung at you.

**[proposed] The wrongness: the antlers have grown the wrong way.** Down and forward over the face, and back into the shoulders, until the head sits inside a cage of its own bone. The antlers are already the elk's silhouette, so corrupting them is the largest possible change to the outline — this is the one creature in band one whose wrongness could be read at half the size.

And it is the whole fight. **The elk has stopped being afraid because it can no longer see you.** It does not run, it does not charge, it takes an enormous amount of killing, and none of that needs explaining once the sprite is on screen. Prey that has stopped being prey.

Elk hide favors max health and health percent — there is a great deal of it, armor with room to bleed in.

> **Prompt:** a large elk standing side on facing right, tall at the shoulder, its antlers grown the wrong way, curling down and forward across its face and back into its shoulders so the head is enclosed in a cage of its own bone, standing still and unbothered, otherwise an ordinary elk, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

### Strange Wolf

**0.85 m · `strange-wolf.png` · drops wolf pelt · 110 health, 4 damage at 2.0 a second**

_Fast chip._ A steady drip of small bites that keeps Rage climbing and gets through the Assassin by sheer volume. **Hunts alone, with no interest in a pack** — which is written in its design role and has never been explained.

**[proposed] The wrongness: an extra joint in every leg.** "Too many joints" is the canonical band-one detail in the north star and this is the creature to spend it on. One more bend in each leg than a wolf has, so it stands too low and too folded, and its outline is wrong from any distance.

It explains the isolation without a word of text: **the pack drove it out.** Nothing else needs to be said about why a wolf is alone.

Wolf pelt favors evasion and initiative — light and quick, you move like the thing it came off.

> **Prompt:** a lean gray wolf standing side on facing right, each of its legs bent with one joint too many so it stands too low and too folded, head lowered, otherwise an ordinary wolf, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

### Strange Bear

**1.2 m at the hump · `strange-bear.png` · drops bear hide · 130 health, 12 damage at 0.5 a second, armor 3**

_The Assassin-punisher, and the hardest regular hunt — still a regular, not a gate._ Three armor is a rounding error to a 22-damage greataxe and half of a 6-damage dagger, so the same fight is quick for one build and a long grind for the other.

**The wrongness is already written, in the code.** `monsters.ts` says it plainly: _thick hide in patches where hide should not grow._ Plates of it over the shoulders, the back and the skull, layered like callus or bark, where a bear has only fur. That is the armor stat, drawn — and it is the cleanest example in the game of a look and a number being the same fact.

Bear hide favors flat and percent damage reduction — the thickest thing in the woods, heavy and worth it.

> **Prompt:** a large brown bear on all fours seen from the side facing right, thick plates of hardened hide grown in overlapping patches across its shoulders back and skull like bark or callus where there should only be fur, heavy and slow, otherwise an ordinary bear, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

---

## Band one — the people

**Nobody the player meets is corrupted until the gate.** The people of band one are ordinary men robbing hunters on the way home, because that is easier than hunting. This was the owner's call when the first "strayed" sprites came back looking like ordinary people: rather than fight the art, the fiction moved to meet it. It is a good rule and it holds — the first corrupted person in the game should land like a shock, and it cannot if the player has been killing them all week.

They drop **finished gear** rather than hide, because they are carrying it, and one time in four a weapon the player does not own yet. They were made, not skinned.

### Bandit

**1.75 m · `bandit.png` · 80 health, 7 damage at 1.5 a second**

_Quick shallow cuts._ The Berserker shrugs them off; the Assassin trades blow for blow with something as fast as it is. The first person in the game you can loot.

An ordinary man with a knife and no plan beyond today. Nothing uniform, nothing matched, nothing that suggests an organization — whatever he is wearing, he was wearing before he started doing this. **Not menacing, and not a fantasy bandit**: no masks, no skulls, no black leather. He should look like he could have been in the town.

> **Prompt:** an ordinary man standing facing right holding a short knife low in one hand, mismatched patched wool and worn leather, no armor, a scarf at his neck, unshaven, wary rather than fierce, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

### Mugger

**1.9 m · `mugger.png` · 140 health, 18 damage at 0.55 a second**

_The other bandit: bigger, slower, swinging something meant for trees._ A preview of the gate in miniature — slow enormous swings that feed the greataxe and threaten the daggers — **from a man who is only greedy, not yet wrong.** That last clause is the entire brief for this sprite.

He is the largest ordinary man in the game at 1.9 m, and he is still just a man. **He carries a woodcutter's axe**, single-bladed and made for timber, which is the tell: this is somebody who had a trade.

> **Prompt:** a big heavy-set man standing facing right holding a single-bladed woodcutter's axe low in front of him with both hands, rough homespun wool and a leather apron, sleeves pushed up, heavy boots, unshaven, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

---

## The gate of band one

### Strayed Hunter

**2.0 m · `strayed-hunter.png` · 200 health, 39 damage at 0.35 a second, heavy blow every third swing**

_The wall, and the warning._ A hunter who went too far out and came back wrong. Unwinnable bare, roughly eighty percent winnable in good gear — this is the fight that forces the grind.

**He is the first corrupted person the player ever meets**, and every person before him has been an ordinary bandit. That contrast is doing all the work. He is also **the same figure the player sparred with in the opening, at the other end of the road** — and the player is never told this. They work it out.

**Tallest figure in the game at 2.0 m, and swollen with it.** This is the wrongness, and it is the right kind for 64 pixels: he is a person whose silhouette is no longer a person's. Too big through the shoulders and the arms, too heavy, the proportions of something that kept growing after it should have stopped. Nothing glows, nothing is skeletal, nothing is undead — he is _swollen_, not rotted.

**Every third swing is an overhead blow with nowhere to go**, which is a puzzle rather than a stat check: the other two swings can be slipped as normal, so the Assassin keeps its evasion and still has to eat one in three. The blunt version — every swing unavoidable — was built and rejected in the strongest terms, because it deleted a class's defining stat to make a boss fit. **[proposed]** Draw the arms long enough that the overhead blow is believable before it happens.

**Drawn to rhyme with Oswald.** Same kit family, same worn leather coat, same kind of man — and then everything about him larger and wrong. If the two sprites do not read as the same man at two ends of a road, both are wrong. **[proposed]** He still carries a hunting spear, the same one Oswald sparred with, which is what puts the recognition in the player's hands rather than in a line of text.

**Parked, and still the intent:** a Strayed Hunter who swung a greataxe leaves a greataxe. Not modelled yet.

> **Prompt:** an enormous swollen man standing facing right, a head taller and half again as broad as a normal man, arms too long and too thick, holding a long hunting spear in both hands, wearing a hunter's worn leather coat and rough wool stretched and split over a body far too large for it, head low, muted earth tones of brown gray and dull green, soft natural lighting from upper left, plain and grounded, no ground, no grass, no shadow, no magic, no glow, no glowing effects

---

## The bands beyond

**Nothing here is built, and writing it does not move the v0.1 scope by a single monster.** It exists so band one is drawn knowing what it is the shallow end of. The land these things live in is in `world.md`; this is what walks in it.

Everything in this section is **[proposed]**.

### The naming decays with the bands

This is the structural idea and the rest follows from it. **Band one's creatures are named by hunters who still recognize the animal.** "Strange Boar" — an adjective and a species. As the bands go out, the naming breaks down in exactly the way the creature does, because a name is a record of somebody looking at a thing and coming back.

| Band                  | Naming                                                      | Example      | Why it is named that way                                                             |
| --------------------- | ----------------------------------------------------------- | ------------ | ------------------------------------------------------------------------------------ |
| One — the Forest Edge | Adjective plus species                                      | Strange Boar | You can still tell what it was. "Strange" says something is off without saying what. |
| Two — the Sunken Wood | Adjective plus species, but the adjective is about the body | Fouled Elk   | You can still name the animal, but not politely.                                     |
| Three — the Quiet     | The species drops out. A plain noun and a definite article  | the Kneeler  | Nobody can say what it was, so it is named for its one readable shape.               |
| The source            | Nothing has a name                                          | —            | Naming requires somebody coming back.                                                |

"Turned" was tried for band one and rejected: it reads as undead, which over-commits the fiction. Any band-two word has to clear the same bar — **"Fouled"** is proposed because it is a real, plain, working word (tangled, dirtied, spoiled) that a hunter would actually use, and it carries no supernatural freight.

### Band two — the creatures

_The original species gets harder to read. Proportions wrong, growth where it should not be, movement that does not match the body._

Where band one is **one thing off**, band two is **the whole animal at the wrong scale**. The clearest way to keep the two bands distinct at 64 pixels: band one breaks the outline in one place, band two gets the outline _right_ and everything inside it wrong — limbs of unequal length, a body too long for its legs, a head too small, growth in the joints. The player should be able to name the species and be unable to say what is wrong with it.

**The tell that separates the bands is color.** Per the palette rule, color goes wrong before shape does: band two is where a hue that does not occur in nature first appears on a living thing.

### Band three — the creatures

_Barely biological. The creature is a scaffold for something else._

The animal is gone. What is left is a frame — a set of limbs and a spine doing something that is no longer eating, hunting or fleeing. These are named for their shape by whoever last saw one: **the Kneeler**, **the Wader**, **the Sheaf**.

**The hardest thing to hold at this band is the grounding rule.** "Grounded, not heroic" and "no fantasy monsters" still apply here, and band three is where a model will reach hardest for a demon. The discipline that keeps it honest is the same one as band one: **start from a real animal and take things away**, rather than starting from a monster and adding. A band-three creature should still have a species somewhere underneath it that a very good hunter could argue for.

### The corrupted hunters

**The worst things out there, at every band past the first.** They were the most dangerous animal to begin with. They are hunters who went too far out and did not come back — which means the hardest enemies in the game are a preview of what happens to the player.

**Nobody ever says this out loud.** The player works it out when one of them is carrying a weapon they recognize. That is the entire delivery mechanism for the game's central idea, and it is a loot table, not a line of dialogue.

The Strayed Hunter is the first. Past the gate, they belong in the tables at every band, and each band's version is further gone than the last — the same escalation as the animals, run on a person.

### The thing at the source

**It is designed so that what leaks out of it stays consistent. It is never drawn, never named, never reached and never revealed.**

The hard rules, which nothing in any later session may soften:

- **It never speaks.** No dialogue, no taunt, no monologue, ever.
- **It does not know we exist.** We are incidental. It never notices, never responds, never targets.
- **It cannot be beaten, only held back.** There is no win condition, and everyone in the fiction knows it.
- **The world explains itself through what the player finds, or it does not explain itself.** No lore dump, no reveal, no ending that says what this was.

Designing it means answering, for our own use only, one question: **what is it doing?** Not what it wants — it does not want. **[proposed]** It is not spreading, attacking, or consuming. It is _present_, and proximity to it is the whole effect: matter near it stops holding its shape the way distance from it allows. That is why the gradient is smooth, why it has no front line, why it cannot be fought, and why nothing it produces has intent. Everything the player kills is a side effect.

If that answer is ever visible in the game, we have broken the rule. It exists to keep three hundred creature designs consistent, and for nothing else.
