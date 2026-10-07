# Qubits vs Noise

A *Plants vs. Zombies*-style browser game that teaches **quantum error
suppression and mitigation**. Errors march down each qubit's wire, and you
defend with four real techniques used on today's quantum computers:

| | Technique | Type | Counters |
| --- | --- | --- | --- |
| 📈 | **Zero-Noise Extrapolation (ZNE)** | Mitigation | Stochastic gate noise |
| 🎵 | **Dynamical Decoupling (DD)** | Suppression | Idle dephasing / crosstalk |
| 🦖 | **TREX** (Twirled Readout Error eXtinction) | Mitigation | Measurement (readout) errors |
| 🌀 | **Pauli Twirling** | Suppression | Coherent errors (pairs with ZNE) |

Five campaign levels each introduce a new error and the technique that beats
it. The game also has lesson cards, checkpoint quizzes, a Quantum Almanac and
an endless mode. See **[docs/GAME_DESIGN.md](docs/GAME_DESIGN.md)** for the
full design.

- [Run it on your computer](#run-it-on-your-computer)
- [How to play](#how-to-play)
- [Troubleshooting](#troubleshooting)
- [For developers](#for-developers)

---

## Run it on your computer

The game runs entirely in your web browser. You only need **Node.js** to
start a small local web server, and nothing is sent anywhere.

### 1. Install Node.js (one time)

You need **Node.js 20.19+ or 22.12+**. Installing the current LTS version is
the easiest choice. To see what you already have, open a terminal and run:

```sh
node --version
```

If the command isn't found, or the version is older than v20.19, install Node:

| System | How to install |
| --- | --- |
| **macOS** (Intel or Apple Silicon) | Download the **LTS** macOS installer from [nodejs.org](https://nodejs.org/), or run `brew install node` if you use Homebrew. |
| **Windows** | Download the **LTS** Windows installer (`.msi`) from [nodejs.org](https://nodejs.org/), or run `winget install OpenJS.NodeJS.LTS`. |
| **Linux** | Use [nodejs.org](https://nodejs.org/en/download) or a version manager such as [nvm](https://github.com/nvm-sh/nvm). Distro packages are often too old. |

npm (the package installer) comes with Node. After installing, **close and
reopen your terminal** so it finds the new `node` and `npm` commands.

> **Which terminal?** On macOS, open the **Terminal** app (the default shell
> is zsh). On Windows, use **Command Prompt**, **PowerShell** or **Windows
> Terminal**.

### 2. Get the code

With Git:

```sh
git clone https://github.com/EDHE08232001/quantumGame.git
cd quantumGame
```

Without Git, open the repository on GitHub, click **Code → Download ZIP**,
unzip it, and open a terminal **inside the unzipped folder** (the one that
contains `package.json`).

### 3. Install the dependencies (one time)

```sh
npm install
```

This downloads the build tools into a local `node_modules` folder. It takes
under a minute and needs an internet connection. After that, the game works
offline.

### 4. Start the game

```sh
npm run dev
```

You'll see something like:

```
  VITE v8.x  ready in 300 ms

  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser (Chrome, Edge, Firefox or
Safari). To have the browser open automatically, run
`npm run dev -- --open` instead.

- **To stop the server:** go back to the terminal and press `Ctrl + C`.
- **To play again later:** `cd` into the folder and run `npm run dev`. You
  don't need to run `npm install` again.
- If port 5173 is busy, Vite automatically picks the next free port (5174,
  …). Use whichever URL it prints.

> ⚠️ Don't open `index.html` by double-clicking it. The game has to be served
> by `npm run dev` (or `npm run preview`, below) to load.

### Optional: play on a phone or tablet

On the same Wi-Fi network, start the server with:

```sh
npm run dev -- --host
```

Then open the **Network** URL it prints (for example
`http://192.168.1.23:5173`) on your phone. If your computer's firewall asks,
allow the connection. On touch screens, tap a card, then tap a tile.

### Optional: run the optimized build

```sh
npm run build      # creates the dist/ folder
npm run preview    # serves it at http://localhost:4173
```

The `dist/` folder is a static website. You can host it anywhere that serves
static files, such as GitHub Pages or Netlify.

---

## How to play

### The goal

Each horizontal lane is one **qubit's wire** in a quantum circuit. Your qubits
sit on the left, drawn as Bloch spheres. **Errors** march in from the right.
When one reaches a qubit, that qubit's **fidelity** drops, and you can see its
Bloch vector shrink. **If any qubit reaches 0%, you lose.** Survive every wave
to complete the circuit.

### The screen

```
 SHOTS   TECHNIQUE CARDS                  REMOVE   LEVEL / WAVE BAR / PAUSE·SPEED·SOUND
+------+--------------------------------------------------------------------------+
|  q0  |  .   .   .   .   .   .   .   .   .                     <-- errors enter |
|  q1  |  .   .   .   .   .   .   .   .   .                     <-- from the     |
|  q2  |  .   .   .   .   .   .   .   .   .                     <-- right edge   |
|  q3  |  .   .   .   .   .   .   .   .   .                                      |
|  q4  |  .   .   .   .   .   .   .   .   .                                      |
+------+--------------------------------------------------------------------------+
qubits   9 tiles per lane: place your defenders here
```

- **⚡ Shots**: your budget. Every defender costs Shots, just as real error
  mitigation costs extra circuit runs.
- **Technique cards**: hover over one to see what it does. A card is greyed
  out while it's recharging or when you can't afford it.
- **Wave bar**: progress through the level. ⚑ flags mark big waves.
- **❚❚ / 1× / 🔊**: pause, double speed and sound on or off.

### Controls

| Action | Mouse / touch | Keyboard |
| --- | --- | --- |
| Pick a technique | Click its card | `1`–`5` (card order) |
| Place it | Click an empty tile | n/a |
| Collect Shots | Click the glowing ⚡ tokens | n/a |
| Remove a defender | ✖ **Remove** card, then click the defender | `S`, then click |
| Cancel a selection | Right-click | `Esc` |
| Pause / resume | ❚❚ button | `P` (or `Esc` when nothing is selected) |

The pause menu also opens the **Quantum Almanac** and has an
**Auto-collect Shot tokens** option, if you'd rather not click tokens.

### Your first level, step by step

1. Read the **lesson card**, then press **Start defending!** You have about
   20 seconds before the first error arrives.
2. Place **Samplers** (50 Shots) in the **leftmost column**. Each one makes
   25 Shots every 15 seconds. Shot tokens also drop from the sky about every
   9 seconds.
3. **Click the ⚡ tokens** as they appear. Uncollected tokens fade away
   after about 10 seconds; they blink just before they disappear.
4. Once you have 125 Shots, place a **ZNE** in each lane, a little to the
   right of your Samplers. ZNE fires at any error in its lane.
5. Keep growing your economy and stacking more defenders in busy lanes. Errors
   that reach a defender stop and chew through it (it "decoheres"), so build
   more than one line of defense.

### Who counters whom

Each level adds a new error. Matching the right technique to it is the
whole game:

| Error | What it is physically | Its trick | Best counter (cost) |
| --- | --- | --- | --- |
| 🟣 **Depolarizer** | Random (stochastic) gate noise | None: a plain walker | **ZNE** (125) |
| 👻 **Dephaser** | Phase drift on idle qubits | Drifts out of phase, so shots pass through it. Speeds up over time. | **Dynamical Decoupling** (50): echo pulses refocus it |
| 😈 **Readout Gremlin** | Measurement error (0 ↔ 1) | Walks straight through every other defender | **TREX** (75): the only defender that can bite it |
| 🌀 **Over-Rotator** | Coherent error (θ + ε every time) | **Coherent armor** that ZNE barely dents | **Pauli Twirling** (100) strips the armor; then ZNE finishes it |
| 🔴 **Crosstalk Colossus** (boss) | Correlated multi-qubit error | Huge armored boss that spawns Dephasers in neighbouring lanes | All of the above together |

### Tips

- **Economy first.** In the first 20 seconds, put down Samplers. A strong
  economy early wins the late waves.
- **DD is cheap and tough** (50 Shots, high integrity). It makes a great wall
  in front of your ZNEs, even in lanes without Dephasers, because it slows
  everything it pulses.
- **Watch which lanes Gremlins use** and put a TREX in front of them. Nothing
  else stops them.
- **Twirling + ZNE is a combo.** Twirled errors (marked by three small red/green/blue dots)
  take +50% damage from ZNE. This is the same reason real experiments pair
  twirling with ZNE.
- Lost a level? The defeat screen tells you which error got through and what
  counters it.

### Levels, stars and saving

- **5 campaign levels** unlock in order. Beat Level 5 to unlock **Endless
  mode** (Noise Storm), where your score is the wave you reach.
- **Stars** depend on your final average fidelity: 90%+ earns ★★★ and 65%+
  earns ★★.
- After each win, answer the **checkpoint question** correctly to start your
  next level with **+50 Shots**.
- Progress is saved automatically in your browser (`localStorage`). It's
  separate for each browser, and clearing the site data for `localhost`
  resets it.
- **Shortcut:** open `http://localhost:5173/?unlockAll` to make every level
  playable straight away.

---

## Troubleshooting

| Problem | Fix |
| --- | --- |
| `command not found: npm` (macOS) or `'npm' is not recognized…` (Windows) | Node.js isn't installed or the terminal can't find it yet. Install it ([step 1](#1-install-nodejs-one-time)), then **close and reopen** the terminal. |
| Windows PowerShell: `npm.ps1 cannot be loaded because running scripts is disabled` | Use **Command Prompt** instead, or allow local scripts once with `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned`. |
| `npm warn EBADENGINE`, or Vite crashes on start | Your Node.js is too old. Check `node --version` and install the LTS version (20.19+ or 22.12+). |
| `npm error enoent … package.json` | You're in the wrong folder. `cd` into the folder that contains `package.json`. |
| Blank page or "This site can't be reached" | Make sure `npm run dev` is still running in the terminal, and use the exact URL it printed. Then refresh the page. |
| No sound | Browsers only allow audio after you click the page. Also check the 🔊 button in the game. |
| Want to start the campaign over | Clear the browser's site data for `localhost`, or run `localStorage.removeItem('qubits-vs-noise:v1')` in the browser's developer console, then refresh. |

---

## For developers

```sh
npm run dev        # dev server with hot reload (http://localhost:5173)
npm test           # headless engine tests, including "is every level winnable?"
npm run lint       # oxlint
npm run build      # production build into dist/
npm run preview    # serve the production build (http://localhost:4173)
```

The game is plain React + Vite with no backend:

```
src/game/engine.js     deterministic simulation (no DOM, so it's testable in Node)
src/game/renderer.js   procedural canvas art (no image files)
src/game/data.js       techniques & errors: stats and educational text
src/game/levels.js     waves, lesson cards, quizzes, endless mode
src/components/        React UI: HUD, menus, lessons, Almanac, quiz
tests/                 node:test suite and a bot player used for balance checks
```

See [docs/GAME_DESIGN.md](docs/GAME_DESIGN.md) for the design rationale and
balance testing.
