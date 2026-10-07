# Qubits vs Noise: Game Design

A *Plants vs. Zombies*-style lane-defense game that teaches **quantum error
suppression and mitigation**. You protect your qubits by deploying four real
techniques against the kinds of errors each one is designed to handle.

## Core metaphor

| Plants vs. Zombies | Qubits vs Noise | Physics it stands for |
| --- | --- | --- |
| Lawn lanes | **Qubit wires** (q0–q4) | A qubit's timeline in a circuit diagram |
| The house | **Qubits** on the left, drawn as Bloch spheres | The quantum state you're protecting |
| Zombies | **Errors** marching right → left | Noise processes on real hardware |
| Plants | **Techniques** placed on tiles | Error suppression and mitigation methods |
| Sun | **Shots** ⚡ | Circuit executions: every technique costs extra runs |
| Sunflower | **Shot Sampler** | Your budget of QPU time |
| Lose when a zombie reaches the house | Each error that gets through shrinks that qubit's **fidelity** (the length of its Bloch vector). A qubit at 0% means the computation failed. | Errors that slip through corrupt the result |

The Bloch vector on each qubit gets shorter as its fidelity drops, the same
way a depolarized state shrinks toward the center of the sphere.

## Error types: the damage rule

Every error has one of four **types**, and every technique is built for exactly
one of them. Damage follows a simple type chart (`EFFECTIVE_MULT` and
`RESISTED_MULT` in `src/game/data.js`):

- **Right technique for the error's type: ×2 damage.**
- **Any other technique: ×½ damage.**

| Type | Badge | Physics | ×2 from |
| --- | --- | --- | --- |
| **Gate noise** | G (teal) | Random (stochastic) errors from imperfect gates; grows smoothly with depth | ZNE |
| **Idle noise** | φ (purple) | Phase drift and ZZ crosstalk while a qubit waits | DD |
| **Readout** | M (green) | Bit-flips during the final measurement | TREX |
| **Coherent** | θ (gold) | Systematic mis-rotations that add up quadratically | Pauli Twirling |

Each type's color matches its counter's card, and every card shows its type
badge in the corner, so players can match badge to card. Every error wears its
badge on the battlefield, and hits pop a colored **×2** or a grey **×½** (at
most once per 1.2 s per error, to keep the screen readable).

The challenge comes from reading types under a budget. A wrong-tool hit still
does something, but the right tool is four times as effective. Two errors of
each type with different gimmicks make players read the badge, not the shape.

## The four techniques (defenders)

Each card is tagged **Suppression** (changes how the circuit runs on the
hardware) or **Mitigation** (runs extra circuits and post-processes the
results). This split follows how IBM's Qiskit Runtime groups them. Damage below
is the base value before the ×2 / ×½ type multiplier.

| Technique | Category | Cost | Built for | In-game behaviour | Real-world idea |
| --- | --- | --- | --- | --- | --- |
| **Zero-Noise Extrapolation (ZNE)** | Mitigation | 125 | Gate noise | Long-range bolts with *variable* damage (7–17, variance!). +50% damage vs *Twirled* errors. | Run the circuit at amplified noise λ = 1, 3, 5 (gate folding G → G·G†·G), fit, extrapolate to λ = 0. Costs extra shots and adds variance; struggles with coherent noise. |
| **Dynamical Decoupling (DD)** | Suppression | 50 | Idle noise | Cheap, tough wall. Echo pulses (18 dmg, ~2.5 tiles) hit everything nearby and slow it. Idle errors also get *refocused*: Dephasers stop dodging, ZZ Hoppers can't hop. | X–X / XY4 pulse trains in idle windows multiply to the identity but echo away slow phase noise and ZZ crosstalk. |
| **TREX** | Mitigation | 75 | Readout | Blocks and bites (45 dmg) at short range, Readout errors first. The only defender Readout errors can't slip past. | Twirled Readout Error eXtinction: random X before measurement, flip the bit back classically, so readout noise becomes a single calibratable scale factor. |
| **Pauli Twirling** | Suppression | 100 | Coherent | Random X / Y / Z darts (10 dmg). Marks errors as *Twirled* (ZNE +50%) and resets a Detuner's build-up. | Random Paulis around noisy gates turn coherent errors into stochastic Pauli noise, which is predictable and plays well with ZNE. |
| Shot Sampler | Budget | 50 | | Produces 25 Shots every 15 s. | Not a technique: mitigation is paid for in circuit executions. |

## The errors (attackers)

| Error | Type | Physics | Gimmick |
| --- | --- | --- | --- |
| **Depolarizer** | Gate | Stochastic Pauli (depolarizing) gate noise | Basic walker |
| **CNOT Crusher** | Gate | Two-qubit gate error (~10× a single-qubit gate) | Big, slow, very tough, hits defenders hard |
| **Dephaser** | Idle | Idle dephasing | Drifts *out of phase* ~60% of the time; projectiles pass through it. Speeds up (up to 2×) as phase drift accumulates, until an echo pulse refocuses it. |
| **ZZ Hopper** | Idle | Always-on ZZ crosstalk | Hops to a neighbouring active lane every 5 s, unless DD has refocused it |
| **Readout Gremlin** | Readout | Measurement bit-flip (0 ↔ 1) | Fast; slips past every defender except TREX (it can still be shot, at ×½) |
| **Flip Flock** | Readout | Correlated readout errors (readout crosstalk) | One spawn = a bird in its lane and in each neighbouring lane |
| **Over-Rotator** | Coherent | Coherent error (θ + ε every time) | Wears **Coherent Armor**. When it breaks, the error turns into **Gate noise** ("coherent → stochastic!"), so ZNE takes over at ×2. Hits qubits hard (errors add up quadratically). |
| **Detuner** | Coherent | Miscalibrated qubit frequency (extra Z rotation every gate) | Coherent **build-up**: over 18 s on the board it speeds up and its qubit damage grows to 3×. Twirl hits reset it. |
| **Crosstalk Colossus** (boss) | Coherent → Gate | Correlated multi-qubit error | Huge boss with Coherent Armor that spawns Dephasers into the lanes above and below it |

## Teaching loop

1. **Lesson card** before each level: the new error, the new technique, and
   what it does physically.
2. **Play**: the matchups make the lesson concrete. ×2 / ×½ pops show every
   matchup as it happens, ZNE bolts visibly "phase slip" through Dephasers,
   Gremlins walk straight past ZNE, and an Over-Rotator's badge flips from θ to
   G when a Twirler shreds its armor.
3. **Result feedback**: when you lose, the game names the error that got
   through, its type and the technique that counters it. Both result screens
   show how much of your damage came from the right technique.
4. **Checkpoint quiz** after each win (+50 Shots next level if correct).
5. **Quantum Almanac** (menu or pause screen): full entries, a matchup
   table and a practice quiz.

## Campaign

| Level | Name | New errors | New technique | Lanes |
| --- | --- | --- | --- | --- |
| 1 | Hello, Noise | Depolarizer (and the type rule) | Sampler, ZNE | 3 |
| 2 | Idle Hands | Dephaser | DD | 5 |
| 3 | Measurement Mayhem | Readout Gremlin | TREX | 5 |
| 4 | Coherent Chaos | Over-Rotator | Pauli Twirling | 5 |
| 5 | Heavy Gates | CNOT Crusher, Detuner | (all) | 5 |
| 6 | Crosstalk Alley | ZZ Hopper, Flip Flock | (all) | 5 |
| 7 | Full-Stack Mitigation | Crosstalk Colossus (boss) | (all) | 5 |
| ∞ | Noise Storm | Endless, escalating waves | (all) | 5 |

Each lesson card also lists every error in the level, with its type badge.

Each level has 7 waves; flagged waves ("A burst of noise is approaching!")
are bigger. Stars come from the final average fidelity (90%+ = 3 stars,
65%+ = 2 stars).

## Balance checks

`tests/engine.test.js` runs the engine headlessly with bot players
(`tests/bot.js`):

- every campaign level is **lost** with no defense,
- every level is **won** by a bot that answers each error type with its
  counter,
- a **type-blind ZNE-only** bot loses every level after the first, and
- a bot that answers each error type with the **wrong** technique ends with
  lower fidelity than the right-tool bot on every level after the first.

During tuning (8 seeds per level), the right-tool bot won 8/8 everywhere,
mostly at 90–100% fidelity, with Levels 5 and 7 the hardest (77–100%). The
ZNE-only bot won 0/8 on Levels 2–7. Removing one technique from the right-tool
bot showed which levels depend on which tool:

- Level 3 without TREX: 2/8 wins.
- Level 4 without DD: 4/8 wins; without Twirling: 6/8 at ~81% fidelity.
- Level 5 without Twirling: 1/8 wins (Detuners build up unchecked).
- Level 7 without DD: 1/8 wins (the Colossus's Dephaser spill-over).
- Level 6 is the most forgiving if one technique is missing. Its challenge is
  covering neighbouring lanes against Hoppers and Flocks.

## Code map

```
src/game/constants.js  grid geometry
src/game/data.js       techniques, errors & the ×2 / ×½ type chart: stats + educational text
src/game/levels.js     campaign waves, lesson intros, quizzes, endless generator
src/game/engine.js     deterministic simulation (no DOM; testable in Node)
src/game/renderer.js   procedural canvas drawing (no image assets)
src/game/sound.js      tiny WebAudio sound effects
src/components/        React UI: HUD, menus, lessons, Almanac, quiz
tests/                 node:test suite + bot player
```
