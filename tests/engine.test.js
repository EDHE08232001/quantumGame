import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { TICK, cellCenter } from '../src/game/constants.js'
import { UNITS } from '../src/game/data.js'
import { GameEngine } from '../src/game/engine.js'
import { ENDLESS, LEVELS, getLevel } from '../src/game/levels.js'
import { playLevel } from './bot.js'

function step(g, seconds) {
  const n = Math.round(seconds / TICK)
  for (let i = 0; i < n && g.state === 'playing'; i++) g.update(TICK)
}

// A sandbox level with no waves, so mechanics can be tested in isolation.
function sandbox(cards = ['sampler', 'zne', 'dd', 'trex', 'twirl']) {
  return { id: 'test', rows: [0, 1, 2, 3, 4], cards, startShots: 10000, prepTime: 9999, waves: [{ spawn: {}, gap: 9999, spread: 0 }] }
}

describe('placement', () => {
  it('charges cost, starts recharge and rejects occupied tiles', () => {
    const g = new GameEngine(sandbox(), { seed: 1 })
    const before = g.shots
    assert.equal(g.place('zne', 2, 3).ok, true)
    assert.equal(g.shots, before - UNITS.zne.cost)
    assert.equal(g.canPlace('zne', 2, 4).reason, 'Recharging…')
    step(g, UNITS.zne.recharge + 0.1)
    assert.equal(g.canPlace('zne', 2, 3).reason, 'Tile occupied')
    assert.equal(g.canPlace('zne', 2, 4).ok, true)
  })

  it('refuses offline rows, unaffordable units and cards not in the level', () => {
    const level = { ...sandbox(['sampler', 'zne']), rows: [1, 2, 3], startShots: 60 }
    const g = new GameEngine(level, { seed: 1 })
    assert.equal(g.canPlace('sampler', 0, 0).reason, 'That qubit is offline')
    assert.equal(g.canPlace('zne', 1, 0).reason, 'Not enough Shots')
    assert.equal(g.canPlace('dd', 1, 0).reason, 'Not available in this level')
    assert.equal(g.canPlace('sampler', 1, 0).ok, true)
  })

  it('shovel removes a unit', () => {
    const g = new GameEngine(sandbox(), { seed: 1 })
    g.place('dd', 0, 0)
    assert.equal(g.remove(0, 0), true)
    assert.equal(g.unitAt(0, 0), null)
  })
})

describe('economy', () => {
  it('samplers drop tokens that can be clicked for shots', () => {
    const g = new GameEngine(sandbox(), { seed: 2 })
    g.place('sampler', 1, 1)
    const shots = g.shots
    step(g, UNITS.sampler.firstProduce + 1.5)
    const token = g.tokens.find((t) => t.source === 'sampler')
    assert.ok(token, 'sampler produced a token')
    assert.equal(g.collectAt(token.x + 5, token.y - 5), true)
    assert.equal(g.shots, shots + UNITS.sampler.value)
    assert.equal(g.collectAt(token.x, token.y), false, 'cannot collect twice')
  })

  it('sky tokens fall even without samplers', () => {
    const g = new GameEngine(sandbox(), { seed: 3 })
    step(g, 4)
    assert.ok(g.tokens.some((t) => t.source === 'sky'))
  })
})

describe('techniques vs errors', () => {
  it('ZNE bolts destroy a depolarizer', () => {
    const g = new GameEngine(sandbox(), { seed: 4 })
    g.place('zne', 2, 0)
    const e = g.spawnEnemy('depolarizer', 2, 1, cellCenter(2, 8).x)
    step(g, 20)
    assert.equal(e.dead, true)
    assert.equal(g.qubits[2].fidelity, 100)
  })

  it('readout gremlins ghost through ZNE, DD and Twirl and hit the qubit', () => {
    const g = new GameEngine(sandbox(), { seed: 5 })
    g.place('zne', 2, 1)
    g.cards.forEach((c) => (c.cooldown = 0))
    g.place('dd', 2, 3)
    g.place('twirl', 2, 5)
    const e = g.spawnEnemy('gremlin', 2, 1, cellCenter(2, 8).x)
    step(g, 40)
    assert.equal(e.dead, true)
    assert.equal(g.stats.leaks.gremlin, 1)
    assert.ok(g.qubits[2].fidelity < 100)
    assert.equal(g.units.length, 3, 'gremlin did not attack gate-level defenders')
  })

  it('TREX blocks and bites readout gremlins but ignores gate errors', () => {
    const g = new GameEngine(sandbox(), { seed: 6 })
    g.place('trex', 1, 2)
    const gremlin = g.spawnEnemy('gremlin', 1, 1, cellCenter(1, 6).x)
    step(g, 15)
    assert.equal(gremlin.dead, true)
    assert.equal(g.stats.kills.gremlin, 1)
    assert.equal(g.qubits[1].fidelity, 100)

    const dep = g.spawnEnemy('depolarizer', 1, 1, cellCenter(1, 4).x)
    step(g, 10)
    assert.equal(dep.hp, dep.maxHp, 'TREX does not damage gate errors')
    assert.ok(dep.attacking, 'but it still blocks them')
  })

  it('Pauli twirling strips coherent armor far faster than ZNE', () => {
    const timeToStrip = (type) => {
      const g = new GameEngine(sandbox(), { seed: 7 })
      g.place(type, 3, 0)
      const e = g.spawnEnemy('overRotator', 3, 1, cellCenter(3, 8).x)
      let t = 0
      while (e.armor > 0 && t < 120 && !e.dead) {
        e.x = cellCenter(3, 7).x // pin it in place
        g.update(TICK)
        t += TICK
      }
      return t
    }
    const twirl = timeToStrip('twirl')
    const zne = timeToStrip('zne')
    assert.ok(twirl * 3 < zne, `twirl ${twirl.toFixed(1)}s vs zne ${zne.toFixed(1)}s`)
  })

  it('armor break marks the error as twirled and ZNE gets a bonus', () => {
    const g = new GameEngine(sandbox(), { seed: 8 })
    const e = g.spawnEnemy('overRotator', 0, 1, 600)
    g.damage(e, 1000, 'twirl')
    assert.equal(e.armor, 0)
    assert.ok(e.twirledT > 0)
    const hp = e.hp
    g.damage(e, 20, 'zne')
    assert.equal(hp - e.hp, 20 * UNITS.zne.twirledBonus)
  })

  it('DD echo pulses refocus dephasers so bolts stop slipping through', () => {
    const g = new GameEngine(sandbox(), { seed: 9 })
    g.place('dd', 4, 4)
    const e = g.spawnEnemy('dephaser', 4, 1, cellCenter(4, 6).x)
    step(g, 0.5)
    assert.ok(e.refocusT > 0, 'dephaser refocused')
    assert.equal(e.outOfPhase, false)
    assert.ok(e.slowT > 0, 'and slowed')
    assert.ok(e.hp < e.maxHp)
  })

  it('out-of-phase dephasers dodge projectiles', () => {
    const g = new GameEngine(sandbox(), { seed: 10 })
    const e = g.spawnEnemy('dephaser', 0, 1, 500)
    e.outOfPhase = true
    g.projectiles.push({ id: 999, kind: 'zne', row: 0, x: 495, y: 50, speed: 0, dmg: 50, passed: new Set(), spin: 0 })
    g.updateProjectiles(TICK)
    assert.equal(e.hp, e.maxHp)
    assert.equal(g.projectiles.length, 1, 'bolt kept flying')
  })

  it('the colossus spills dephasers into neighbouring lanes', () => {
    const g = new GameEngine(sandbox(), { seed: 11 })
    g.spawnEnemy('colossus', 2, 1, cellCenter(2, 7).x)
    step(g, 8)
    const rows = new Set(g.enemies.filter((e) => e.type === 'dephaser').map((e) => e.row))
    assert.deepEqual([...rows].sort(), [1, 3])
  })
})

describe('levels', () => {
  it('every campaign level is lost with no defense', () => {
    for (const level of LEVELS) {
      const g = playLevel(level, 123, { bot: false })
      assert.equal(g.state, 'lost', `level ${level.id}`)
    }
  })

  for (const level of LEVELS) {
    it(`level ${level.id} (${level.name}) is winnable by a simple bot`, () => {
      let wins = 0
      const seeds = [1, 2, 3, 4, 5]
      for (const seed of seeds) {
        const g = playLevel(level, seed)
        if (g.state === 'won') wins++
      }
      assert.ok(wins >= 4, `won ${wins}/${seeds.length}`)
    })
  }

  it('endless mode keeps generating waves', () => {
    const g = playLevel(ENDLESS, 42)
    assert.equal(g.state, 'lost')
    assert.ok(g.waveIndex >= 8, `survived ${g.waveIndex} waves`)
  })

  it('getLevel resolves ids', () => {
    assert.equal(getLevel(3).name, 'Measurement Mayhem')
    assert.equal(getLevel('endless'), ENDLESS)
  })
})
