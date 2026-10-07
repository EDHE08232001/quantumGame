// Campaign levels. Each one introduces a new error and the technique that
// counters it, PvZ-style: you unlock a new "plant" every level.
//
// A wave is { spawn: { enemyId: count }, spread, gap, flag }:
//   spread - seconds over which the wave's errors trickle in
//   gap    - seconds until the next wave starts (it starts sooner if the board is cleared)
//   flag   - a "huge wave" with a warning banner

const w = (spawn, gap, opts = {}) => ({ spawn, gap, spread: 6, ...opts })

export const LEVELS = [
  {
    id: 1,
    name: 'Hello, Noise',
    subtitle: 'Stochastic noise & Zero-Noise Extrapolation',
    rows: [1, 2, 3],
    cards: ['sampler', 'zne'],
    startShots: 150,
    prepTime: 20,
    intro: {
      newError: 'depolarizer',
      newUnits: ['sampler', 'zne'],
      text: 'Your qubits sit on the left. Errors march in from the right along each qubit\'s wire. If one reaches a qubit, it knocks down that qubit\'s fidelity (the length of its Bloch vector). If any qubit\'s fidelity hits 0%, the computation fails. Build Samplers to earn Shots, then spend them on ZNE to extrapolate the noise away.',
    },
    waves: [
      w({ depolarizer: 1 }, 22),
      w({ depolarizer: 1 }, 18),
      w({ depolarizer: 2 }, 20),
      w({ depolarizer: 2 }, 18),
      w({ depolarizer: 4 }, 22, { flag: true, spread: 8 }),
      w({ depolarizer: 3 }, 20),
      w({ depolarizer: 7 }, 30, { flag: true, spread: 10 }),
    ],
    quiz: {
      q: 'How does Zero-Noise Extrapolation estimate the noise-free result?',
      options: [
        'It runs the circuit at several amplified noise levels and extrapolates back to zero noise',
        'It cools the qubits down to absolute zero temperature',
        'It throws away every measurement that looks noisy',
        'It encodes each qubit into many physical qubits',
      ],
      answer: 0,
      explain: 'ZNE deliberately amplifies noise (e.g. by gate folding: G → G·G†·G) to measure how the result changes with noise, then extrapolates the curve back to λ = 0.',
    },
  },
  {
    id: 2,
    name: 'Idle Hands',
    subtitle: 'Dephasing & Dynamical Decoupling',
    rows: [0, 1, 2, 3, 4],
    cards: ['sampler', 'zne', 'dd'],
    startShots: 150,
    prepTime: 20,
    intro: {
      newError: 'dephaser',
      newUnits: ['dd'],
      text: 'All five qubits are online now. Dephasers drift in and out of phase, and while out of phase your ZNE bolts pass straight through them. Dynamical Decoupling echo pulses always connect: they refocus Dephasers and slow everything nearby. DD is also cheap and tough, so it makes a good wall in front of your ZNEs.',
    },
    waves: [
      w({ depolarizer: 1 }, 20),
      w({ dephaser: 1 }, 18),
      w({ depolarizer: 1, dephaser: 1 }, 18),
      w({ depolarizer: 1, dephaser: 3 }, 20),
      w({ depolarizer: 2, dephaser: 4 }, 24, { flag: true, spread: 8 }),
      w({ depolarizer: 2, dephaser: 4 }, 20),
      w({ depolarizer: 4, dephaser: 7 }, 30, { flag: true, spread: 10 }),
    ],
    quiz: {
      q: 'Dynamical decoupling protects a qubit mainly during…',
      options: [
        'Classical post-processing of the results',
        'Idle periods, using pulse sequences that multiply to the identity',
        'The final measurement',
        'Fabrication of the chip',
      ],
      answer: 1,
      explain: 'DD inserts sequences like X–X or XY4 into idle windows. They do nothing to the ideal state but echo away slowly varying phase noise and crosstalk.',
    },
  },
  {
    id: 3,
    name: 'Measurement Mayhem',
    subtitle: 'Readout errors & TREX',
    rows: [0, 1, 2, 3, 4],
    cards: ['sampler', 'zne', 'dd', 'trex'],
    startShots: 175,
    prepTime: 20,
    intro: {
      newError: 'gremlin',
      newUnits: ['trex'],
      text: 'Readout Gremlins only strike at measurement, so they ghost straight through ZNE, DD and their bolts. Only TREX can block and bite them. Watch which lanes they come down and get a TREX in front of them.',
    },
    waves: [
      w({ depolarizer: 1 }, 20),
      w({ gremlin: 1 }, 16),
      w({ depolarizer: 2, dephaser: 1 }, 18),
      w({ gremlin: 2, depolarizer: 1 }, 18),
      w({ depolarizer: 3, dephaser: 2, gremlin: 2 }, 24, { flag: true, spread: 8 }),
      w({ depolarizer: 2, dephaser: 2, gremlin: 2 }, 20),
      w({ depolarizer: 4, dephaser: 3, gremlin: 4 }, 30, { flag: true, spread: 10 }),
    ],
    quiz: {
      q: 'What does TREX do right before a measurement?',
      options: [
        'Measures every qubit twice and keeps the majority',
        'Applies a Hadamard gate to every qubit',
        'Randomly applies X gates, then flips those classical bits back afterwards',
        'Turns up the readout pulse power',
      ],
      answer: 2,
      explain: 'Random X flips (undone classically) twirl the readout noise into a single rescaling factor per observable, which a calibration run measures and divides out.',
    },
  },
  {
    id: 4,
    name: 'Coherent Chaos',
    subtitle: 'Coherent errors & Pauli Twirling',
    rows: [0, 1, 2, 3, 4],
    cards: ['sampler', 'zne', 'dd', 'trex', 'twirl'],
    startShots: 200,
    prepTime: 20,
    intro: {
      newError: 'overRotator',
      newUnits: ['twirl'],
      text: 'Over-Rotators wear Coherent Armor that ZNE can barely dent. Pauli Twirling shreds the armor and marks errors as "Twirled", and ZNE deals +50% damage to Twirled errors. This is the real-world combo: twirl the noise into Pauli form, then extrapolate it away.',
    },
    waves: [
      w({ depolarizer: 1 }, 20),
      w({ overRotator: 1 }, 20),
      w({ depolarizer: 2, dephaser: 1 }, 18),
      w({ overRotator: 1, gremlin: 1, depolarizer: 1 }, 20),
      w({ overRotator: 2, depolarizer: 3, dephaser: 1 }, 24, { flag: true, spread: 8 }),
      w({ overRotator: 2, gremlin: 2, dephaser: 2 }, 22),
      w({ overRotator: 4, depolarizer: 4, dephaser: 2, gremlin: 3 }, 30, { flag: true, spread: 12 }),
    ],
    quiz: {
      q: 'What is the main effect of Pauli twirling?',
      options: [
        'It removes all noise from the circuit',
        'It converts coherent errors into stochastic Pauli noise',
        'It makes gates run faster',
        'It corrects errors using ancilla qubits',
      ],
      answer: 1,
      explain: 'Twirling does not remove noise. It reshapes (tailors) it into a stochastic Pauli channel that accumulates gently and predictably, which ZNE and other mitigation methods need.',
    },
  },
  {
    id: 5,
    name: 'Full-Stack Mitigation',
    subtitle: 'Everything at once, plus a correlated boss',
    rows: [0, 1, 2, 3, 4],
    cards: ['sampler', 'zne', 'dd', 'trex', 'twirl'],
    startShots: 250,
    prepTime: 20,
    intro: {
      newError: 'colossus',
      newUnits: [],
      text: 'Real experiments stack these techniques: DD and Pauli Twirling while the circuit runs (suppression), then TREX and ZNE in post-processing (mitigation). The Crosstalk Colossus arrives in the final wave. Strip its armor, and keep DD ready for the Dephasers it spills into neighbouring lanes.',
    },
    waves: [
      w({ depolarizer: 2 }, 18),
      w({ dephaser: 2, gremlin: 1 }, 18),
      w({ overRotator: 2, depolarizer: 1 }, 20),
      w({ depolarizer: 3, dephaser: 2, gremlin: 2 }, 24, { flag: true, spread: 8 }),
      w({ overRotator: 2, gremlin: 2, dephaser: 2 }, 22),
      w({ overRotator: 2, depolarizer: 3, dephaser: 2, gremlin: 2 }, 26),
      w({ colossus: 1, overRotator: 2, depolarizer: 4, dephaser: 2, gremlin: 3 }, 40, { flag: true, spread: 14 }),
    ],
    quiz: {
      q: 'Which pair are error SUPPRESSION techniques (they act while the circuit runs, rather than in post-processing)?',
      options: [
        'ZNE and TREX',
        'TREX and Dynamical Decoupling',
        'Dynamical Decoupling and Pauli Twirling',
        'ZNE and Pauli Twirling',
      ],
      answer: 2,
      explain: 'DD and twirling change the circuit that runs on the hardware (suppression). ZNE and TREX run extra circuits and post-process the results (mitigation).',
    },
  },
]

// Endless mode: waves are generated on the fly and get steadily nastier.
export const ENDLESS = {
  id: 'endless',
  name: 'Noise Storm',
  subtitle: 'Endless: how many waves can your qubits survive?',
  rows: [0, 1, 2, 3, 4],
  cards: ['sampler', 'zne', 'dd', 'trex', 'twirl'],
  startShots: 250,
  prepTime: 20,
  endless: true,
  intro: {
    newError: null,
    newUnits: [],
    text: 'Endless waves of every error type, growing stronger over time. Every 5th wave is a huge wave, and every 10th brings a Crosstalk Colossus. Your score is the number of waves survived.',
  },
  waves: [],
}

export function endlessWave(i) {
  const n = i + 1
  const spawn = { depolarizer: 1 + Math.floor(n / 2) }
  if (n >= 2) spawn.dephaser = Math.floor((n + 1) / 3)
  if (n >= 3) spawn.gremlin = Math.floor(n / 3)
  if (n >= 4) spawn.overRotator = Math.floor((n - 1) / 3)
  const flag = n % 5 === 0
  if (n % 10 === 0) spawn.colossus = n / 10
  if (flag) for (const k of Object.keys(spawn)) if (k !== 'colossus') spawn[k] = Math.ceil(spawn[k] * 1.5)
  return { spawn, gap: flag ? 30 : 22, spread: flag ? 12 : 8, flag, hpScale: 1 + i * 0.04 }
}

export function getLevel(id) {
  if (id === 'endless') return ENDLESS
  return LEVELS.find((l) => l.id === id)
}

// Extra questions for the Almanac's practice quiz.
export const BONUS_QUIZ = [
  {
    q: 'Why does Pauli twirling pair so well with ZNE?',
    options: [
      'Twirling makes the circuit shorter, so there is less noise to extrapolate',
      'Stochastic Pauli noise grows smoothly and predictably when amplified, so the extrapolation fits well',
      'ZNE only works on a single qubit',
      'Twirling removes the need to amplify noise',
    ],
    answer: 1,
    explain: 'Coherent errors can interfere and make the noisy result oscillate as noise is amplified. After twirling, the decay is smooth, so the fit to λ = 0 is trustworthy.',
  },
  {
    q: 'What is the main cost of error mitigation methods like ZNE?',
    options: [
      'They need many extra physical qubits',
      'They need extra circuit executions (shots), and the estimate has larger variance',
      'They permanently damage the qubits',
      'They only work on classical computers',
    ],
    answer: 1,
    explain: 'Mitigation trades qubits for time: you pay in sampling overhead. Error correction, by contrast, pays in extra qubits.',
  },
  {
    q: 'Coherent over-rotation errors are especially harmful because…',
    options: [
      'They only happen during measurement',
      'Their amplitudes add up, so the error probability grows quadratically with the number of gates',
      'They cannot be described with quantum mechanics',
      'They only affect idle qubits',
    ],
    answer: 1,
    explain: 'A small angle ε repeated N times gives a rotation Nε, so the error probability goes as (Nε)². Random errors only add up as Nε².',
  },
  {
    q: 'Which error is the main target of TREX?',
    options: ['Gate over-rotations', 'Idle dephasing', 'Measurement (readout) bit-flips', 'Leakage out of the qubit subspace'],
    answer: 2,
    explain: 'TREX = Twirled Readout Error eXtinction. It mitigates errors in the measurement step only.',
  },
  {
    q: 'A dynamical decoupling sequence like XY4 (X–Y–X–Y) applied to an idle qubit…',
    options: [
      'Multiplies to (approximately) the identity, so the ideal state is unchanged',
      'Measures the qubit four times',
      'Rotates the qubit to |1⟩',
      'Entangles the qubit with its neighbours',
    ],
    answer: 0,
    explain: 'XYXY equals the identity (up to a global phase), so the ideal circuit is unchanged. Only the slow noise gets echoed away.',
  },
]
