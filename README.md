# Qubits vs Noise

A *Plants vs. Zombies*-style browser game that teaches **quantum error
suppression and mitigation**. Errors march down each qubit's wire; you
defend with four real techniques:

| | Technique | Type | Counters |
| --- | --- | --- | --- |
| 📈 | **Zero-Noise Extrapolation (ZNE)** | Mitigation | Stochastic gate noise |
| 🎵 | **Dynamical Decoupling (DD)** | Suppression | Idle dephasing / crosstalk |
| 🦖 | **TREX** (Twirled Readout Error eXtinction) | Mitigation | Measurement (readout) errors |
| 🌀 | **Pauli Twirling** | Suppression | Coherent errors (pairs with ZNE) |

Five campaign levels each introduce a new error and the technique that beats
it, with lesson cards, checkpoint quizzes, a Quantum Almanac and an endless
mode. See **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)** for the full design.

## Run it

Requires Node.js 20+.

```sh
npm install
npm run dev        # then open the URL it prints (http://localhost:5173)
```

Other scripts:

```sh
npm test           # headless engine tests, including "is every level winnable?"
npm run lint       # oxlint
npm run build      # production build into dist/
npm run preview    # serve the production build
```

Tip: add `?unlockAll` to the URL to skip straight to any level.

## How to play

- Click a technique card (or press `1`–`5`), then click a tile to deploy it.
- Click the glowing ⚡ tokens to collect **Shots**, your budget. Samplers
  produce them, and they also fall from above.
- `S` removes a defender, right-click or `Esc` cancels, and `P` pauses.
- If an error reaches a qubit, that qubit loses fidelity. If any qubit hits
  0%, you lose.
