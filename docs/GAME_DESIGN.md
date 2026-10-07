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

## The four techniques (defenders)

Each card is tagged **Suppression** (changes how the circuit runs on the
hardware) or **Mitigation** (runs extra circuits and post-processes the
results). This split follows how IBM's Qiskit Runtime groups them.

| Technique | Type | Cost | In-game behaviour | Real-world idea |
| --- | --- | --- | --- | --- |
| **Zero-Noise Extrapolation (ZNE)** | Mitigation | 125 | Main damage dealer. Fires bolts with *variable* damage (variance!). Only does 15% damage to coherent armor. +50% damage vs *Twirled* errors. | Run the circuit at amplified noise λ = 1, 3, 5 (gate folding G → G·G†·G), fit, extrapolate to λ = 0. Costs extra shots and adds variance; struggles with coherent noise. |
| **Dynamical Decoupling (DD)** | Suppression | 50 | Cheap, tough wall. Emits echo pulses (~2.5 tiles) that slow all errors, deal 3× damage to Dephasers and *refocus* them (they stop dodging). Can't touch readout errors. | X–X / XY4 pulse trains in idle windows multiply to the identity but echo away slow phase noise and ZZ crosstalk. |
| **TREX** | Mitigation | 75 | The only defender that can hit Readout Gremlins: blocks and bites them at short range. Ignores gate errors (but still physically blocks them). | Twirled Readout Error eXtinction: random X before measurement, flip the bit back classically, so readout noise becomes a single calibratable scale factor. |
| **Pauli Twirling** | Suppression | 100 | Throws random X / Y / Z darts. Low raw damage, but 6× damage to coherent armor, and marks errors as *Twirled* (ZNE +50%). | Random Paulis around noisy gates turn coherent errors into stochastic Pauli noise, which is predictable and plays well with ZNE. |
| Shot Sampler | Budget | 50 | Produces 25 Shots every 15 s. | Not a technique: mitigation is paid for in circuit executions. |

## The errors (attackers)

| Error | Physics | Gimmick | Best counter |
| --- | --- | --- | --- |
| **Depolarizer** | Stochastic Pauli (depolarizing) gate noise | Basic walker | ZNE |
| **Dephaser** | Idle dephasing / ZZ crosstalk | Drifts *out of phase* ~60% of the time; projectiles pass through it. Speeds up (up to 2×) as phase drift accumulates, until an echo pulse refocuses it. | DD |
| **Readout Gremlin** | Measurement bit-flip (0 ↔ 1) | Ghost: ignores and walks through every gate-level defender | TREX |
| **Over-Rotator** | Coherent error (θ + ε every time) | Wears **Coherent Armor**: ZNE barely scratches it. When the armor breaks, it becomes ordinary stochastic noise ("coherent → stochastic!"). Hits qubits hard (errors add up quadratically). | Pauli Twirling, then ZNE |
| **Crosstalk Colossus** (boss) | Correlated multi-qubit error | Huge armored boss that spawns Dephasers into the lanes above and below it | Everything together |

## Teaching loop

1. **Lesson card** before each level: the new error, the new technique, and
   what it does physically.
2. **Play**: the matchups make the lesson concrete. ZNE bolts visibly
   "phase slip" through Dephasers, Gremlins walk straight past ZNE, and
   Over-Rotators shrug off ZNE until a Twirler shreds their armor.
3. **Failure feedback**: when you lose, the game names the error that got
   through and the technique that counters it.
4. **Checkpoint quiz** after each win (+50 Shots next level if correct).
5. **Quantum Almanac** (menu or pause screen): full entries, a matchup
   table and a practice quiz.

## Campaign

| Level | Name | New error | New technique | Lanes |
| --- | --- | --- | --- | --- |
| 1 | Hello, Noise | Depolarizer | Sampler, ZNE | 3 |
| 2 | Idle Hands | Dephaser | DD | 5 |
| 3 | Measurement Mayhem | Readout Gremlin | TREX | 5 |
| 4 | Coherent Chaos | Over-Rotator | Pauli Twirling | 5 |
| 5 | Full-Stack Mitigation | Crosstalk Colossus (boss) | (all) | 5 |
| ∞ | Noise Storm | Endless, escalating waves | (all) | 5 |

Each level has 7 waves; flagged waves ("A burst of noise is approaching!")
are bigger. Stars come from the final average fidelity (90%+ = 3 stars,
65%+ = 2 stars).

## Balance checks

`tests/engine.test.js` runs the engine headlessly with a simple bot player:

- every campaign level is **lost** with no defense, and
- **won** by a reasonable bot using the right counters.

During tuning, the same bot was also run with techniques removed:

- A ZNE-only bot loses (or barely survives at ~45% fidelity) Levels 3 to 5,
  because Gremlins and Over-Rotators get through.
- In Level 5, removing *any one* of DD, TREX or Twirling makes the bot lose.
- Level 2 can still be brute-forced with lots of ZNE. DD is the cheap, efficient
  answer there rather than the only one, so it is the easiest level to tune
  harder if needed.

## Code map

```
src/game/constants.js  grid geometry
src/game/data.js       techniques & errors: stats + educational text
src/game/levels.js     campaign waves, lesson intros, quizzes, endless generator
src/game/engine.js     deterministic simulation (no DOM; testable in Node)
src/game/renderer.js   procedural canvas drawing (no image assets)
src/game/sound.js      tiny WebAudio sound effects
src/components/        React UI: HUD, menus, lessons, Almanac, quiz
tests/                 node:test suite + bot player
```
