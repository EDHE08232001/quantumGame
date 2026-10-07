import { useEffect, useRef } from 'react'
import { COUNTER_FOR, EFFECTIVE_MULT, ENEMIES, ENEMY_ORDER, ERROR_TYPES, RESISTED_MULT, TYPE_ORDER, UNITS, formatMult } from '../game/data.js'
import { ENDLESS, LEVELS } from '../game/levels.js'
import { drawEnemySprite, drawUnitSprite } from '../game/renderer.js'
import { TypeBadge } from './Almanac.jsx'
import SpriteIcon from './SpriteIcon.jsx'

// A little looping parade of defenders and errors behind the title.
function Backdrop() {
  const ref = useRef(null)
  useEffect(() => {
    const canvas = ref.current
    const ctx = canvas.getContext('2d')
    const W = 900
    const H = 150
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = W * dpr
    canvas.height = H * dpr
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    const units = ['sampler', 'zne', 'dd', 'trex', 'twirl']
    const enemies = ['depolarizer', 'dephaser', 'gremlin', 'overRotator', 'cnotCrusher', 'zzHopper', 'detuner']
    let raf = 0
    const t0 = performance.now()
    const loop = (now) => {
      const t = (now - t0) / 1000
      ctx.clearRect(0, 0, W, H)
      ctx.strokeStyle = 'rgba(120,200,255,0.18)'
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.moveTo(0, 85)
      ctx.lineTo(W, 85)
      ctx.stroke()
      units.forEach((u, i) => drawUnitSprite(ctx, u, 50 + i * 85, 80, t + i))
      enemies.forEach((type, i) => {
        const x = W + 60 - ((t * 28 + i * 105) % 735)
        drawEnemySprite(ctx, type, x, 80, t + i, {
          seed: i * 7,
          armor: 1,
          outOfPhase: Math.sin(t * 2 + i) > 0.6,
          refocusT: 0,
          drift: 0.3,
          buildup: 0.5 + 0.5 * Math.sin(t + i),
          twirledT: 0,
        })
      })
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])
  return <canvas ref={ref} className="backdrop" aria-hidden="true" />
}

export function MainMenu({ onPlay, onAlmanac, onHowTo }) {
  return (
    <div className="menu">
      <div className="title-block">
        <div className="title-kicker">A quantum error mitigation defense game</div>
        <h1 className="title">
          Qubits <span>vs</span> Noise
        </h1>
        <p className="title-sub">
          Protect your qubits from the errors marching down their wires using four real techniques from today&apos;s quantum
          computers: <b>Zero-Noise Extrapolation</b>, <b>Dynamical Decoupling</b>, <b>TREX</b> and <b>Pauli Twirling</b>.
        </p>
      </div>
      <Backdrop />
      <div className="btn-col menu-buttons">
        <button type="button" className="btn primary big" onClick={onPlay} autoFocus>
          Play
        </button>
        <button type="button" className="btn" onClick={onHowTo}>
          How to play
        </button>
        <button type="button" className="btn" onClick={onAlmanac}>
          Quantum Almanac
        </button>
      </div>
    </div>
  )
}

export function LevelSelect({ progress, onPick, onBack }) {
  const campaignDone = progress.unlocked > LEVELS.length
  return (
    <div className="levels screen">
      <header className="screen-head">
        <h2>Choose a level</h2>
        <button type="button" className="btn" onClick={onBack}>
          Back
        </button>
      </header>
      <div className="level-grid">
        {LEVELS.map((l) => {
          const locked = l.id > progress.unlocked
          const stars = progress.stars[l.id] || 0
          return (
            <button
              key={l.id}
              type="button"
              className={`level-card ${locked ? 'locked' : ''}`}
              disabled={locked}
              onClick={() => onPick(l.id)}
            >
              <div className="level-num">Level {l.id}</div>
              <div className="level-title">{l.name}</div>
              <div className="level-sub">{l.subtitle}</div>
              <div className="level-icons">
                {l.intro.newErrors.map((id) => (
                  <SpriteIcon key={id} kind="enemy" type={id} size={46} />
                ))}
                {l.intro.newUnits.map((u) => (
                  <SpriteIcon key={u} kind="unit" type={u} size={46} />
                ))}
              </div>
              <div className="level-stars">
                {locked ? '🔒 Locked' : [1, 2, 3].map((i) => <span key={i} className={i <= stars ? 'on' : ''}>★</span>)}
              </div>
            </button>
          )
        })}
        <button
          type="button"
          className={`level-card endless ${campaignDone ? '' : 'locked'}`}
          disabled={!campaignDone}
          onClick={() => onPick('endless')}
        >
          <div className="level-num">Endless</div>
          <div className="level-title">{ENDLESS.name}</div>
          <div className="level-sub">{ENDLESS.subtitle}</div>
          <div className="level-icons">
            <SpriteIcon kind="enemy" type="colossus" size={46} />
          </div>
          <div className="level-stars">
            {campaignDone ? `Best: wave ${progress.bestEndless || 0}` : `🔒 Beat level ${LEVELS.length}`}
          </div>
        </button>
      </div>
    </div>
  )
}

export function HowTo({ onClose }) {
  return (
    <div className="howto screen">
      <header className="screen-head">
        <h2>How to play</h2>
        <button type="button" className="btn" onClick={onClose}>
          Back
        </button>
      </header>
      <div className="howto-body">
        <section>
          <h3>The idea</h3>
          <p>
            Each lane is a qubit&apos;s wire in a quantum circuit. Your qubits sit on the left, and their Bloch vectors show
            their <b>fidelity</b>. Noise and errors march in from the right. Every error that reaches a qubit shrinks its
            fidelity, and if any qubit drops to 0% the computation is ruined.
          </p>
          <p>
            You can&apos;t build a perfect quantum computer, but you can <b>suppress</b> errors while the circuit runs and{' '}
            <b>mitigate</b> them afterwards. Deploy the right technique against the right error.
          </p>
        </section>
        <section>
          <h3>Controls</h3>
          <ul>
            <li>
              Click a <b>technique card</b> at the top (or press <kbd>1</kbd>–<kbd>5</kbd>), then click a tile to deploy it.
            </li>
            <li>
              Click the glowing <b>⚡ Shot tokens</b> to collect your budget. They come from Samplers and also fall from the top.
            </li>
            <li>
              <kbd>S</kbd> or the ✖ card removes a defender. Right-click or <kbd>Esc</kbd> cancels a selection.
            </li>
            <li>
              <kbd>P</kbd> pauses; the pause menu has the Almanac and an auto-collect option.
            </li>
          </ul>
        </section>
        <section>
          <h3>Error types: pick the right tool</h3>
          <p>
            Every error has a <b>type</b>, shown by the colored badge above it. Each technique is built for one type and
            deals <b>{formatMult(EFFECTIVE_MULT)} damage</b> to it. Against any other type it only deals{' '}
            <b>{formatMult(RESISTED_MULT)}</b>. Watch for the {formatMult(EFFECTIVE_MULT)} and {formatMult(RESISTED_MULT)}{' '}
            pops when your shots land.
          </p>
          <div className="counter-grid">
            {TYPE_ORDER.map((type) => (
              <div key={type} className="counter">
                <div className="counter-errors">
                  {ENEMY_ORDER.filter((id) => ENEMIES[id].errorType === type && !ENEMIES[id].boss).map((id) => (
                    <SpriteIcon key={id} kind="enemy" type={id} size={48} />
                  ))}
                </div>
                <span className="arrow">←</span>
                <SpriteIcon kind="unit" type={COUNTER_FOR[type]} size={56} />
                <div>
                  <TypeBadge type={type} />
                  <br />
                  {ERROR_TYPES[type].text}
                  <br />
                  {formatMult(EFFECTIVE_MULT)} from <b>{UNITS[COUNTER_FOR[type]].name}</b>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section>
          <h3>Scoring</h3>
          <p>
            Clear every wave to complete the level. Finish with an average fidelity of 90%+ for three stars. Answer the
            checkpoint question correctly for +50 Shots in your next level.
          </p>
        </section>
      </div>
    </div>
  )
}
