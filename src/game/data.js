// Defenders ("plants") and errors ("zombies"), with both their game stats
// and the physics they stand for. The text here feeds the lesson cards,
// tooltips and the Almanac, so keep it accurate.

export const CATEGORY_INFO = {
  economy: {
    label: 'Budget',
    color: '#ffd84a',
    text: 'Not a technique: it pays for them. Every mitigation method costs extra circuit executions (shots).',
  },
  suppression: {
    label: 'Suppression',
    color: '#b58cff',
    text: 'Error suppression changes how the circuit runs on the hardware, so errors are prevented or reshaped before they happen.',
  },
  mitigation: {
    label: 'Mitigation',
    color: '#3fe0d0',
    text: 'Error mitigation runs extra circuits and uses classical post-processing to estimate what the noise-free result would have been.',
  },
}

export const UNITS = {
  sampler: {
    id: 'sampler',
    name: 'Shot Sampler',
    short: 'Sampler',
    category: 'economy',
    cost: 50,
    recharge: 7.5,
    hp: 250,
    firstProduce: 5,
    produceEvery: 15,
    value: 25,
    role: 'Produces 25 Shots every 15 seconds. Click the glowing tokens to collect them.',
    lesson:
      'Real quantum computers answer questions statistically: you run the same circuit thousands of times ("shots") and average the measurements. Error mitigation is never free. Each technique needs extra shots or extra circuits, so your shot budget is the currency of this game.',
  },
  zne: {
    id: 'zne',
    name: 'Zero-Noise Extrapolation',
    short: 'ZNE',
    category: 'mitigation',
    cost: 125,
    recharge: 7.5,
    hp: 300,
    fireEvery: 1.6,
    dmgMin: 14,
    dmgMax: 34,
    armorMult: 0.15,
    twirledBonus: 1.5,
    projectileSpeed: 330,
    role: 'Fires extrapolation bolts down its lane. Strong against stochastic noise, but damage varies from shot to shot, and it barely scratches Coherent Armor. Deals +50% damage to Twirled errors.',
    lesson:
      "You can't turn the noise down, but you can turn it up. ZNE runs the same circuit at several amplified noise levels (λ = 1, 3, 5), for example by \"gate folding\" (replacing a gate G with G·G†·G, which does the same thing but picks up 3x the noise). It measures how the answer degrades as noise grows, fits a curve, and extrapolates back to λ = 0: the zero-noise answer. The catch: more circuit runs, and the extrapolated estimate has higher variance. It also works best when noise grows smoothly, which coherent errors don't do.",
  },
  dd: {
    id: 'dd',
    name: 'Dynamical Decoupling',
    short: 'DD',
    category: 'suppression',
    cost: 50,
    recharge: 12,
    hp: 650,
    pulseEvery: 2.2,
    range: 2.6, // cells ahead of the unit
    dmg: 12,
    dephaserMult: 3,
    slow: 0.5,
    slowTime: 2,
    refocusTime: 5,
    role: 'Sturdy and cheap. Emits echo pulses that hit every error within ~2.5 tiles: triple damage to Dephasers and "refocuses" them so other shots stop slipping through, and slows everything it touches. Cannot affect Readout Gremlins.',
    lesson:
      'Qubits that sit idle, waiting for other qubits to finish their gates, still pick up phase errors from their environment and from always-on ZZ crosstalk with neighbours. Dynamical decoupling fills those idle windows with pulse sequences such as X–X or XY4 (X–Y–X–Y) that multiply to the identity. Each flip makes the phase picked up in the next interval cancel the phase picked up in the previous one, like a spin echo. It needs no extra circuits, so it is nearly free.',
  },
  trex: {
    id: 'trex',
    name: 'TREX (Twirled Readout Error eXtinction)',
    short: 'TREX',
    category: 'mitigation',
    cost: 75,
    recharge: 10,
    hp: 320,
    biteEvery: 1.0,
    range: 1.6, // cells ahead of the unit
    dmgGremlin: 60,
    role: 'The only defender that can touch Readout Gremlins. It blocks them and bites them at short range. It ignores gate errors entirely (though it still physically blocks them).',
    lesson:
      'Measurement is noisy too: a qubit in |1⟩ is sometimes read as 0 (more often than 0 is read as 1, because the qubit can decay during the readout). TREX randomly applies an X gate right before some measurements and flips those classical bits back afterwards. Averaged over many random flips, this "twirls" the readout noise into a simple form: each expectation value gets shrunk by a single factor. That factor is learned from cheap calibration circuits and divided out. It needs no detailed noise model, and the overhead is modest.',
  },
  twirl: {
    id: 'twirl',
    name: 'Pauli Twirling',
    short: 'Twirl',
    category: 'suppression',
    cost: 100,
    recharge: 10,
    hp: 300,
    fireEvery: 1.4,
    dmg: 8,
    armorMult: 6,
    twirlTime: 6,
    projectileSpeed: 290,
    role: 'Throws random Pauli darts (X, Y, Z). Shreds Coherent Armor (6× damage) and marks errors as Twirled, so ZNE deals +50% to them. Low raw damage: twirling reshapes noise, it does not remove it.',
    lesson:
      'Sandwich each noisy two-qubit gate between randomly chosen Pauli gates (I, X, Y, Z): one set before, and a matching set after that undoes them, so the ideal gate is unchanged. Averaged over many random choices, any noise, including coherent over-rotations that interfere and pile up quadratically, turns into stochastic Pauli noise: X, Y or Z errors that strike with fixed probabilities. Pauli noise builds up slowly and predictably, which is exactly what ZNE needs to extrapolate reliably.',
  },
}

export const UNIT_ORDER = ['sampler', 'zne', 'dd', 'trex', 'twirl']

export const ENEMIES = {
  depolarizer: {
    id: 'depolarizer',
    name: 'Depolarizer',
    kind: 'Stochastic (depolarizing) gate noise',
    hp: 110,
    speed: 16,
    dps: 25,
    fidelityDmg: 25,
    radius: 26,
    counter: 'zne',
    lesson:
      "After each gate, a random Pauli error (X, Y or Z) strikes with some small probability. On the Bloch sphere, this shrinks the qubit's state vector toward the center (the maximally mixed state). This is the everyday noise of every quantum chip, and it grows smoothly with circuit depth, which makes it the ideal target for extrapolation.",
    tip: 'Depolarizers are stochastic noise. Line their lanes with ZNE; it extrapolates smooth, random noise away best.',
  },
  dephaser: {
    id: 'dephaser',
    name: 'Dephaser',
    kind: 'Idle dephasing & ZZ crosstalk',
    hp: 130,
    speed: 17,
    dps: 20,
    fidelityDmg: 25,
    radius: 24,
    phasePeriod: 3,
    outOfPhaseFrac: 0.6,
    driftTime: 18, // seconds without refocusing until it moves at double speed
    counter: 'dd',
    lesson:
      "While a qubit waits for others to finish, slow environmental noise and crosstalk with neighbours make its phase drift. On the Bloch sphere, the state vector precesses around the equator. In the game it drifts in and out of phase: while out of phase, bolts and darts pass right through it. The longer it goes without being refocused, the more phase it accumulates and the faster it moves. Only DD's echo pulses always connect, and they refocus it so everything else can hit it again.",
    tip: 'Dephasers drift out of phase, dodge projectiles and speed up as their phase drift builds. Dynamical Decoupling echo pulses refocus them (and deal triple damage).',
  },
  overRotator: {
    id: 'overRotator',
    name: 'Over-Rotator',
    kind: 'Coherent error (systematic over-rotation)',
    hp: 110,
    armor: 300,
    speed: 13,
    dps: 40,
    fidelityDmg: 40,
    radius: 27,
    counter: 'twirl',
    lesson:
      'A miscalibrated gate that rotates by θ + ε instead of θ, every single time. Because the error is the same each time, the small amplitudes add up coherently: after N gates the error probability grows like (Nε)², much faster than random noise (Nε²). It wears Coherent Armor that ZNE barely scratches, because coherent errors don\'t degrade smoothly when amplified, so the extrapolation fit goes wrong.',
    tip: "Over-Rotators wear Coherent Armor. Pauli Twirling shreds it, turning them into ordinary stochastic noise that ZNE can finish off.",
  },
  gremlin: {
    id: 'gremlin',
    name: 'Readout Gremlin',
    kind: 'Measurement (readout) error',
    hp: 60,
    speed: 30,
    dps: 30,
    fidelityDmg: 25,
    radius: 18,
    ghost: true,
    counter: 'trex',
    lesson:
      'It strikes at the very end of the circuit: when you measure, a 1 gets recorded as a 0 or vice versa. Gate-level defenses cannot touch it, so it ghosts straight through ZNE, DD and Twirling. Only a readout technique stops it.',
    tip: 'Readout Gremlins slip through every gate-level defense. Only TREX can bite them; place it in their lane.',
  },
  colossus: {
    id: 'colossus',
    name: 'Crosstalk Colossus',
    kind: 'Correlated multi-qubit error (boss)',
    hp: 1500,
    armor: 500,
    speed: 6,
    dps: 80,
    fidelityDmg: 100,
    radius: 46,
    boss: true,
    spawnEvery: 7,
    counter: 'twirl',
    lesson:
      'Some errors are correlated: driving one qubit disturbs its neighbours. The Colossus is a heavily armored coherent error that keeps spilling Dephasers into the lanes above and below it. Strip its armor with Twirling, refocus the spill-over with DD, and pour on ZNE.',
    tip: 'The Colossus needs teamwork: Pauli Twirling to strip its coherent armor, ZNE for damage, and DD in neighbouring lanes for the Dephasers it spawns.',
  },
}

export const ENEMY_ORDER = ['depolarizer', 'dephaser', 'gremlin', 'overRotator', 'colossus']

// Effectiveness grid shown in the Almanac. Values are descriptive strings.
export const MATCHUPS = {
  zne: { depolarizer: 'Strong', dephaser: 'Misses out of phase', gremlin: 'No effect', overRotator: 'Weak vs armor', colossus: 'Damage (after armor)' },
  dd: { depolarizer: 'Slows', dephaser: 'Strong + refocus', gremlin: 'No effect', overRotator: 'Slows', colossus: 'Slows' },
  trex: { depolarizer: 'Blocks only', dephaser: 'Blocks only', gremlin: 'Strong', overRotator: 'Blocks only', colossus: 'Blocks only' },
  twirl: { depolarizer: 'Marks (+50% ZNE)', dephaser: 'Misses out of phase', gremlin: 'No effect', overRotator: 'Strips armor', colossus: 'Strips armor' },
}
