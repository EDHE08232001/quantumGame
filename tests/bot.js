import { TICK } from '../src/game/constants.js'
import { GameEngine } from '../src/game/engine.js'

// A reasonable but unspectacular player: economy first, then the right
// counter for whatever is coming down each lane.
export function botAct(g) {
  const rows = g.level.rows
  const has = (t) => g.cards.some((c) => c.type === t)
  const tryPlace = (type, row, col) => g.canPlace(type, row, col).ok && g.place(type, row, col).ok
  const threat = (row, type) => g.enemies.some((e) => e.row === row && e.type === type)

  // React to threats first.
  for (const row of rows) {
    if (has('trex') && threat(row, 'gremlin') && !g.units.some((u) => u.row === row && u.type === 'trex')) {
      if (tryPlace('trex', row, 4)) return
    }
    if (has('twirl') && (threat(row, 'overRotator') || threat(row, 'colossus')) && !g.unitAt(row, 2)) {
      if (tryPlace('twirl', row, 2)) return
    }
    if (has('dd') && threat(row, 'dephaser') && !g.unitAt(row, 5)) {
      if (tryPlace('dd', row, 5)) return
    }
    if (g.enemies.some((e) => e.row === row) && !g.unitAt(row, 1)) {
      if (tryPlace('zne', row, 1)) return
    }
  }

  const plan = []
  for (const row of rows) plan.push(['sampler', row, 0])
  for (const row of rows) plan.push(['zne', row, 1])
  if (has('dd')) for (const row of rows) plan.push(['dd', row, 5])
  if (has('twirl')) for (const row of rows) plan.push(['twirl', row, 2])
  for (const row of rows) plan.push(['zne', row, 3])
  if (has('trex')) for (const row of rows) plan.push(['trex', row, 4])
  for (const row of rows) plan.push(['zne', row, 6])

  for (const [type, row, col] of plan) {
    if (g.unitAt(row, col)) continue
    if (!has(type)) continue
    tryPlace(type, row, col)
    return // wait for this item before moving down the list
  }
}

export function playLevel(level, seed, { bot = true, act = botAct } = {}) {
  const g = new GameEngine(level, { seed, autoCollect: true })
  let ticks = 0
  while (g.state === 'playing' && g.time < 900) {
    g.update(TICK)
    if (bot && ++ticks % 15 === 0) act(g)
  }
  return g
}
