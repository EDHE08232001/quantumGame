import { useCallback, useEffect, useRef, useState } from 'react'
import { FIELD_H, FIELD_W, TICK, cellAt } from '../game/constants.js'
import { ENEMIES, UNITS } from '../game/data.js'
import { GameEngine } from '../game/engine.js'
import { LEVELS } from '../game/levels.js'
import { renderField } from '../game/renderer.js'
import { play, setMuted } from '../game/sound.js'
import Almanac, { CategoryBadge } from './Almanac.jsx'
import Quiz from './Quiz.jsx'
import SpriteIcon from './SpriteIcon.jsx'

const QUIZ_BONUS = 50

function snapshot(eng) {
  return {
    shots: eng.shots,
    cards: eng.cards.map((c) => ({ type: c.type, cooldown: c.cooldown })),
    progress: eng.progress(),
    fidelity: eng.averageFidelity(),
  }
}

// ------------------------------------------------------------------ HUD

function Card({ type, cooldown, shots, selected, hotkey, onPick }) {
  const def = UNITS[type]
  const affordable = shots >= def.cost
  const ready = cooldown <= 0
  const usable = affordable && ready
  return (
    <button
      type="button"
      className={`card ${selected ? 'selected' : ''} ${usable ? '' : 'disabled'}`}
      onClick={() => onPick(type)}
      aria-label={`${def.name}, ${def.cost} shots`}
    >
      <span className="card-key">{hotkey}</span>
      <SpriteIcon kind="unit" type={type} size={50} />
      <span className="card-name">{def.short}</span>
      <span className={`card-cost ${affordable ? '' : 'short'}`}>⚡{def.cost}</span>
      {!ready && <span className="card-cooldown" style={{ height: `${(cooldown / def.recharge) * 100}%` }} />}
      <span className="card-tip" role="tooltip">
        <b>{def.name}</b>
        <CategoryBadge category={def.category} />
        <span>{def.role}</span>
      </span>
    </button>
  )
}

function ProgressBar({ progress }) {
  if (progress.total === null) {
    return (
      <div className="progress endless">
        <span>Wave {progress.done}</span>
      </div>
    )
  }
  const pct = (progress.done / progress.total) * 100
  return (
    <div className="progress" title={`Wave ${progress.done} of ${progress.total}`}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
      {progress.flags.map((f) => (
        <span key={f} className={`progress-flag ${pct >= f * 100 ? 'passed' : ''}`} style={{ left: `${f * 100}%` }}>
          ⚑
        </span>
      ))}
      <span className="progress-label">
        Wave {progress.done}/{progress.total}
      </span>
    </div>
  )
}

// ------------------------------------------------------------------ overlays

function LessonOverlay({ level, bonus, onStart }) {
  const { intro } = level
  const enemy = intro.newError && ENEMIES[intro.newError]
  const startRef = useRef(null)
  useEffect(() => {
    startRef.current?.focus({ preventScroll: true })
  }, [])
  return (
    <div className="overlay">
      <div className="panel lesson">
        <div className="lesson-kicker">{level.endless ? 'Endless mode' : `Level ${level.id}`}</div>
        <h2>{level.name}</h2>
        <p className="lesson-sub">{level.subtitle}</p>
        <p>{intro.text}</p>
        {enemy && (
          <section className="lesson-card error">
            <SpriteIcon kind="enemy" type={intro.newError} size={80} />
            <div>
              <div className="lesson-tag">New error detected</div>
              <h3>
                {enemy.name} <span className="entry-kind">{enemy.kind}</span>
              </h3>
              <p>{enemy.lesson}</p>
            </div>
          </section>
        )}
        {intro.newUnits.map((id) => (
          <section key={id} className="lesson-card unit">
            <SpriteIcon kind="unit" type={id} size={80} />
            <div>
              <div className="lesson-tag">New {id === 'sampler' ? 'resource' : 'technique'} unlocked</div>
              <h3>
                {UNITS[id].name} <CategoryBadge category={UNITS[id].category} />
              </h3>
              <p>{UNITS[id].lesson}</p>
              <p className="entry-role">
                <b>In the game:</b> {UNITS[id].role}
              </p>
            </div>
          </section>
        ))}
        {bonus > 0 && <p className="bonus-note">Quiz bonus: you start with +{bonus} Shots.</p>}
        <button ref={startRef} type="button" className="btn primary big" onClick={onStart}>
          Start defending!
        </button>
      </div>
    </div>
  )
}

function Stars({ n }) {
  return (
    <div className="stars" aria-label={`${n} of 3 stars`}>
      {[1, 2, 3].map((i) => (
        <span key={i} className={i <= n ? 'on' : ''}>
          ★
        </span>
      ))}
    </div>
  )
}

function ResultOverlay({ result, level, onRetry, onNext, onExit, onQuiz }) {
  const [quizDone, setQuizDone] = useState(false)
  if (result.won) {
    const next = LEVELS.find((l) => l.id === level.id + 1)
    return (
      <div className="overlay">
        <div className="panel result win">
          <h2>Circuit complete!</h2>
          <Stars n={result.stars} />
          <p>
            Average qubit fidelity: <b>{Math.round(result.fidelity)}%</b>
            {result.stars < 3 && ' (finish with 90% or more for 3 stars)'}
          </p>
          {level.quiz && (
            <div className="result-quiz">
              <h3>Checkpoint question</h3>
              <Quiz
                quiz={level.quiz}
                onAnswer={(ok) => {
                  setQuizDone(true)
                  onQuiz(ok)
                }}
              />
              {quizDone && result.bonusEarned !== null && (
                <p className="bonus-note">
                  {result.bonusEarned ? `+${QUIZ_BONUS} bonus Shots for your next level!` : 'Check the Almanac to brush up.'}
                </p>
              )}
            </div>
          )}
          <div className="btn-row">
            {next && (
              <button type="button" className="btn primary" onClick={onNext}>
                Next: {next.name} →
              </button>
            )}
            {!next && (
              <button type="button" className="btn primary" onClick={onExit}>
                You beat the campaign! Try Endless mode
              </button>
            )}
            <button type="button" className="btn" onClick={onRetry}>
              Replay
            </button>
            <button type="button" className="btn" onClick={onExit}>
              Level select
            </button>
          </div>
        </div>
      </div>
    )
  }
  const enemy = ENEMIES[result.lostTo]
  return (
    <div className="overlay">
      <div className="panel result lose">
        <h2>Decoherence!</h2>
        {level.endless && (
          <p className="endless-score">
            You reached <b>wave {result.wave}</b>
            {result.best ? ` (best: ${result.best})` : ''}
          </p>
        )}
        {enemy && (
          <section className="lesson-card error">
            <SpriteIcon kind="enemy" type={result.lostTo} size={72} />
            <div>
              <div className="lesson-tag">The final blow: {enemy.name}</div>
              <p>{enemy.tip}</p>
            </div>
          </section>
        )}
        <div className="btn-row">
          <button type="button" className="btn primary" onClick={onRetry} autoFocus>
            Try again
          </button>
          <button type="button" className="btn" onClick={onExit}>
            Level select
          </button>
        </div>
      </div>
    </div>
  )
}

function PauseOverlay({ onResume, onRestart, onExit, autoCollect, onToggleAuto }) {
  const [almanac, setAlmanac] = useState(false)
  if (almanac) {
    return (
      <div className="overlay">
        <div className="panel wide">
          <Almanac embedded onClose={() => setAlmanac(false)} />
        </div>
      </div>
    )
  }
  return (
    <div className="overlay">
      <div className="panel pause">
        <h2>Paused</h2>
        <div className="btn-col">
          <button type="button" className="btn primary" onClick={onResume} autoFocus>
            Resume
          </button>
          <button type="button" className="btn" onClick={() => setAlmanac(true)}>
            Quantum Almanac
          </button>
          <button type="button" className="btn" onClick={onRestart}>
            Restart level
          </button>
          <button type="button" className="btn" onClick={onExit}>
            Quit to level select
          </button>
          <label className="toggle">
            <input type="checkbox" checked={autoCollect} onChange={(e) => onToggleAuto(e.target.checked)} />
            Auto-collect Shot tokens
          </label>
        </div>
      </div>
    </div>
  )
}

// ------------------------------------------------------------------ screen

function newRun(level, progress) {
  const bonus = progress.bonusShots || 0
  return { engine: new GameEngine(level, { bonusShots: bonus, autoCollect: progress.autoCollect }), bonus }
}

export default function GameScreen({ level, progress, updateProgress, onExit, onNext }) {
  const canvasRef = useRef(null)
  const uiRef = useRef({ hover: null, selected: null, shovel: false })
  const phaseRef = useRef('intro')
  const speedRef = useRef(1)
  const [phase, setPhaseState] = useState('intro')
  const [selected, setSelected] = useState(null)
  const [shovel, setShovel] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [toast, setToast] = useState(null)
  const [result, setResult] = useState(null)
  const [run, setRun] = useState(() => newRun(level, progress))
  const engine = run.engine
  const [hud, setHud] = useState(null)
  const view = hud ?? snapshot(engine)

  const setPhase = useCallback((p) => {
    phaseRef.current = p
    setPhaseState(p)
  }, [])

  useEffect(() => {
    uiRef.current.selected = selected
    uiRef.current.shovel = shovel
  }, [selected, shovel])

  useEffect(() => {
    speedRef.current = speed
  }, [speed])

  useEffect(() => {
    setMuted(progress.muted)
  }, [progress.muted])

  useEffect(() => {
    engine.setAutoCollect(progress.autoCollect)
  }, [engine, progress.autoCollect])

  const showToast = useCallback((text) => {
    setToast({ text, id: Math.random() })
  }, [])

  useEffect(() => {
    if (!toast) return
    const id = setTimeout(() => setToast(null), 1400)
    return () => clearTimeout(id)
  }, [toast])

  const finish = useCallback(
    (won) => {
      const eng = engine
      if (won) {
        const stars = eng.stars()
        const prevStars = progress.stars[level.id] || 0
        updateProgress({
          unlocked: Math.max(progress.unlocked, level.id + 1),
          stars: { ...progress.stars, [level.id]: Math.max(prevStars, stars) },
        })
        setResult({ won: true, stars, fidelity: eng.averageFidelity(), bonusEarned: null })
        play('won')
      } else {
        const best = level.endless ? Math.max(progress.bestEndless || 0, eng.waveIndex) : 0
        if (level.endless) updateProgress({ bestEndless: best })
        setResult({ won: false, lostTo: eng.lostTo, wave: eng.waveIndex, best })
        play('lost')
      }
      setPhase(won ? 'won' : 'lost')
    },
    [engine, level, progress, updateProgress, setPhase],
  )
  const finishRef = useRef(finish)
  useEffect(() => {
    finishRef.current = finish
  }, [finish])

  // Main loop: fixed-step simulation, render every animation frame.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf = 0
    let last = performance.now()
    let acc = 0
    let hudT = 0
    let endTimer = null

    const resize = () => {
      const dpr = Math.min(2, window.devicePixelRatio || 1)
      canvas.width = FIELD_W * dpr
      canvas.height = FIELD_H * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    window.addEventListener('resize', resize)

    const eng = engine
    const loop = (now) => {
      const dt = Math.min(0.1, (now - last) / 1000)
      last = now
      {
        if (phaseRef.current === 'playing' || ((phaseRef.current === 'ending') && eng.state !== 'playing')) {
          acc += dt * speedRef.current
          while (acc >= TICK) {
            eng.update(TICK)
            acc -= TICK
          }
        }
        for (const ev of eng.drainEvents()) {
          if (ev.type === 'won' || ev.type === 'lost') {
            phaseRef.current = 'ending'
            const won = ev.type === 'won'
            endTimer = setTimeout(() => finishRef.current(won), 1800)
          } else {
            play(ev.type)
          }
        }
        renderField(ctx, eng, uiRef.current)
        hudT += dt
        if (hudT > 0.1) {
          hudT = 0
          setHud(snapshot(eng))
        }
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(endTimer)
      window.removeEventListener('resize', resize)
    }
  }, [engine])

  // ------------------------------------------------------------ input

  const toField = (ev) => {
    const rect = canvasRef.current.getBoundingClientRect()
    return {
      x: ((ev.clientX - rect.left) * FIELD_W) / rect.width,
      y: ((ev.clientY - rect.top) * FIELD_H) / rect.height,
    }
  }

  const onPointerMove = (ev) => {
    const { x, y } = toField(ev)
    uiRef.current.hover = cellAt(x, y)
    const overToken = engine.tokens.some((t) => !t.collected && Math.hypot(t.x - x, t.y - y) < 34)
    canvasRef.current.style.cursor = overToken || selected || shovel ? 'pointer' : 'default'
  }

  const onPointerLeave = () => {
    uiRef.current.hover = null
  }

  const onPointerDown = (ev) => {
    if (phaseRef.current !== 'playing') return
    if (ev.button === 2) return
    const { x, y } = toField(ev)
    if (engine.collectAt(x, y)) return
    const cell = cellAt(x, y)
    if (!cell) return
    if (selected) {
      const res = engine.place(selected, cell.row, cell.col)
      if (res.ok) setSelected(null)
      else {
        showToast(res.reason)
        play('error')
      }
    } else if (shovel) {
      if (engine.remove(cell.row, cell.col)) setShovel(false)
    }
  }

  const cancelSelection = useCallback(() => {
    setSelected(null)
    setShovel(false)
  }, [])

  const pickCard = useCallback(
    (type) => {
      if (phaseRef.current !== 'playing') return
      const card = engine.cards.find((c) => c.type === type)
      if (!card) return
      if (selected === type) {
        setSelected(null)
        return
      }
      if (card.cooldown > 0) {
        showToast('Recharging…')
        play('error')
        return
      }
      if (engine.shots < UNITS[type].cost) {
        showToast('Not enough Shots')
        play('error')
        return
      }
      play('click')
      setShovel(false)
      setSelected(type)
    },
    [engine, selected, showToast],
  )

  const togglePause = useCallback(() => {
    if (phaseRef.current === 'playing') setPhase('paused')
    else if (phaseRef.current === 'paused') setPhase('playing')
  }, [setPhase])

  useEffect(() => {
    const onKey = (ev) => {
      if (ev.target instanceof HTMLInputElement) return
      if (ev.key === 'Escape') {
        if (selected || shovel) cancelSelection()
        else togglePause()
      } else if (ev.key === 'p' || ev.key === 'P') togglePause()
      else if (ev.key === 's' || ev.key === 'S') {
        if (phaseRef.current === 'playing') {
          setSelected(null)
          setShovel((s) => !s)
        }
      } else if (/^[1-9]$/.test(ev.key)) {
        const card = engine.cards[Number(ev.key) - 1]
        if (card) pickCard(card.type)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [engine, selected, shovel, cancelSelection, togglePause, pickCard])

  const start = () => {
    if (run.bonus) updateProgress({ bonusShots: 0 })
    setPhase('playing')
    play('click')
  }

  const restart = () => {
    setRun(newRun(level, progress))
    setHud(null)
    setSelected(null)
    setShovel(false)
    setResult(null)
    setPhase('intro')
  }

  const onQuiz = (ok) => {
    if (ok) updateProgress({ bonusShots: QUIZ_BONUS })
    setResult((r) => ({ ...r, bonusEarned: ok }))
  }

  return (
    <div className="game">
      <div className="hud">
        <div className="shots" title="Shots: your circuit-execution budget">
          <span className="shots-icon">⚡</span>
          <span className="shots-value">{Math.floor(view.shots)}</span>
          <span className="shots-label">Shots</span>
        </div>
        <div className="cards">
          {view.cards.map((c, i) => (
            <Card
              key={c.type}
              type={c.type}
              cooldown={c.cooldown}
              shots={view.shots}
              selected={selected === c.type}
              hotkey={i + 1}
              onPick={pickCard}
            />
          ))}
          <button
            type="button"
            className={`card shovel ${shovel ? 'selected' : ''}`}
            onClick={() => {
              setSelected(null)
              setShovel((s) => !s)
            }}
            aria-label="Remove a defender"
          >
            <span className="card-key">S</span>
            <span className="shovel-icon">✖</span>
            <span className="card-name">Remove</span>
            <span className="card-tip" role="tooltip">
              <b>Remove</b>
              <span>Clear a tile to make room for a different technique. No refund.</span>
            </span>
          </button>
        </div>
        <div className="hud-right">
          <div className="level-name">
            {level.endless ? level.name : `L${level.id}: ${level.name}`}
            <span className="fid">avg fidelity {Math.round(view.fidelity)}%</span>
          </div>
          <ProgressBar progress={view.progress} />
          <div className="hud-buttons">
            <button type="button" className="icon-btn" onClick={togglePause} title="Pause (P)" aria-label="Pause">
              ❚❚
            </button>
            <button
              type="button"
              className={`icon-btn ${speed > 1 ? 'on' : ''}`}
              onClick={() => setSpeed((s) => (s === 1 ? 2 : 1))}
              title="Game speed"
            >
              {speed}×
            </button>
            <button
              type="button"
              className="icon-btn"
              onClick={() => updateProgress({ muted: !progress.muted })}
              title={progress.muted ? 'Unmute' : 'Mute'}
              aria-label={progress.muted ? 'Unmute' : 'Mute'}
            >
              {progress.muted ? '🔇' : '🔊'}
            </button>
          </div>
        </div>
      </div>

      <div className="field-wrap">
        <canvas
          ref={canvasRef}
          className="field"
          onPointerMove={onPointerMove}
          onPointerLeave={onPointerLeave}
          onPointerDown={onPointerDown}
          onContextMenu={(e) => {
            e.preventDefault()
            cancelSelection()
          }}
        />
        {toast && (
          <div key={toast.id} className="toast">
            {toast.text}
          </div>
        )}
        {phase === 'intro' && <LessonOverlay level={level} bonus={run.bonus} onStart={start} />}
        {phase === 'paused' && (
          <PauseOverlay
            onResume={togglePause}
            onRestart={restart}
            onExit={onExit}
            autoCollect={progress.autoCollect}
            onToggleAuto={(v) => updateProgress({ autoCollect: v })}
          />
        )}
        {(phase === 'won' || phase === 'lost') && result && (
          <ResultOverlay result={result} level={level} onRetry={restart} onNext={onNext} onExit={onExit} onQuiz={onQuiz} />
        )}
      </div>
      <p className="hint">
        Click a card (or press 1–{view.cards.length}), then a tile to deploy · Click ⚡ tokens to collect Shots ·
        Right-click / Esc to cancel · P to pause
      </p>
    </div>
  )
}
