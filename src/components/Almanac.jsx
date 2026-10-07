import { useState } from 'react'
import {
  CATEGORY_INFO,
  COUNTER_FOR,
  EFFECTIVE_MULT,
  ENEMIES,
  ENEMY_ORDER,
  ERROR_TYPES,
  RESISTED_MULT,
  SPECIAL_RULES,
  TECHNIQUES,
  TYPE_ORDER,
  UNITS,
  UNIT_ORDER,
  formatMult,
  matchup,
} from '../game/data.js'
import { BONUS_QUIZ, LEVELS } from '../game/levels.js'
import Quiz from './Quiz.jsx'
import SpriteIcon from './SpriteIcon.jsx'

const TABS = [
  ['techniques', 'Techniques'],
  ['errors', 'Errors'],
  ['matchups', 'Matchups'],
  ['quiz', 'Practice quiz'],
]

export function CategoryBadge({ category }) {
  const info = CATEGORY_INFO[category]
  return (
    <span className="badge" style={{ '--badge': info.color }}>
      {info.label}
    </span>
  )
}

// An error type, e.g. "(G) Gate noise", in the type's color. `glyphOnly` drops the label.
export function TypeBadge({ type, glyphOnly = false }) {
  const info = ERROR_TYPES[type]
  return (
    <span className={`type-badge ${glyphOnly ? 'glyph-only' : ''}`} style={{ '--type': info.color }} title={info.label}>
      <span className="type-glyph">{info.glyph}</span>
      {!glyphOnly && info.label}
    </span>
  )
}

// "×2 vs Gate noise · ×½ vs everything else" for a technique.
export function StrongVs({ unit }) {
  const type = UNITS[unit].strongVs
  if (!type) return null
  return (
    <span className="strong-vs">
      <b>{formatMult(EFFECTIVE_MULT)}</b> vs <TypeBadge type={type} /> · {formatMult(RESISTED_MULT)} vs everything else
    </span>
  )
}

function TechniqueEntry({ id }) {
  const u = UNITS[id]
  return (
    <article className="entry">
      <SpriteIcon kind="unit" type={id} size={72} />
      <div>
        <h3>
          {u.name} <CategoryBadge category={u.category} />
        </h3>
        <p className="entry-meta">
          Cost <b>{u.cost}</b> Shots · Recharge {u.recharge}s · Integrity {u.hp}
        </p>
        {u.strongVs && (
          <p>
            <StrongVs unit={id} />
          </p>
        )}
        <p>{u.lesson}</p>
        <p className="entry-role">
          <b>In the game:</b> {u.role}
        </p>
      </div>
    </article>
  )
}

function ErrorEntry({ id }) {
  const e = ENEMIES[id]
  return (
    <article className="entry">
      <SpriteIcon kind="enemy" type={id} size={72} />
      <div>
        <h3>
          {e.name} <TypeBadge type={e.errorType} /> <span className="entry-kind">{e.kind}</span>
        </h3>
        <p className="entry-meta">
          Strength {e.hp}
          {e.armor ? ` + ${e.armor} coherent armor` : ''} · Fidelity damage {e.fidelityDmg}% · Best counter:{' '}
          <b>{UNITS[COUNTER_FOR[e.errorType]].short}</b>
          {e.decaysTo && (
            <>
              {' '}
              (then <b>{UNITS[COUNTER_FOR[e.decaysTo]].short}</b> once its armor breaks)
            </>
          )}
        </p>
        <p>{e.lesson}</p>
        <p className="entry-role">
          <b>Tip:</b> {e.tip}
        </p>
      </div>
    </article>
  )
}

function Matchups() {
  return (
    <div className="matchups">
      <p className="note">
        Every error has a <b>type</b>, shown by the colored badge above it on the battlefield. Every technique is built for
        one type: it deals <b>{formatMult(EFFECTIVE_MULT)} damage</b> to errors of that type and only{' '}
        <b>{formatMult(RESISTED_MULT)}</b> to everything else.
      </p>
      <table>
        <thead>
          <tr>
            <th />
            {TYPE_ORDER.map((type) => (
              <th key={type}>
                <TypeBadge type={type} />
                <div className="type-members">
                  {ENEMY_ORDER.filter((id) => ENEMIES[id].errorType === type).map((id) => (
                    <SpriteIcon key={id} kind="enemy" type={id} size={34} />
                  ))}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {TECHNIQUES.map((t) => (
            <tr key={t}>
              <th>
                <SpriteIcon kind="unit" type={t} size={40} />
                <div>{UNITS[t].short}</div>
              </th>
              {TYPE_ORDER.map((type) => {
                const good = matchup(t, type) === 'effective'
                return (
                  <td key={type} className={good ? 'good' : 'bad'}>
                    {good ? `${formatMult(EFFECTIVE_MULT)} Strong` : `${formatMult(RESISTED_MULT)} Weak`}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <h3 className="rules-head">Special rules</h3>
      <ul className="rules">
        {SPECIAL_RULES.map((r) => (
          <li key={r.unit}>
            <b>{UNITS[r.unit].short}:</b> {r.text}
          </li>
        ))}
      </ul>
      <p className="note">
        The big idea: no single technique handles every error. Real experiments stack them, with <b>suppression</b> (DD,
        twirling) shaping the noise while the circuit runs and <b>mitigation</b> (TREX, ZNE) cleaning up the results
        afterwards.
      </p>
    </div>
  )
}

function PracticeQuiz() {
  const all = [...LEVELS.map((l) => l.quiz), ...BONUS_QUIZ]
  const [i, setI] = useState(0)
  const [score, setScore] = useState(0)
  const [answered, setAnswered] = useState(0)
  const done = i >= all.length
  if (done) {
    return (
      <div className="practice-done">
        <h3>
          You scored {score} / {all.length}
        </h3>
        <button
          type="button"
          className="btn"
          onClick={() => {
            setI(0)
            setScore(0)
            setAnswered(0)
          }}
        >
          Try again
        </button>
      </div>
    )
  }
  return (
    <div>
      <p className="entry-meta">
        Question {i + 1} of {all.length} · Score {score}/{answered}
      </p>
      <Quiz
        key={i}
        quiz={all[i]}
        onAnswer={(ok) => {
          setAnswered((a) => a + 1)
          if (ok) setScore((s) => s + 1)
        }}
      />
      {answered > i && (
        <button type="button" className="btn primary" onClick={() => setI(i + 1)}>
          {i + 1 < all.length ? 'Next question' : 'See score'}
        </button>
      )}
    </div>
  )
}

export default function Almanac({ onClose, embedded = false }) {
  const [tab, setTab] = useState('techniques')
  return (
    <div className={`almanac ${embedded ? 'embedded' : 'screen'}`}>
      <header className="almanac-head">
        <h2>Quantum Almanac</h2>
        <nav className="tabs">
          {TABS.map(([id, label]) => (
            <button key={id} type="button" className={tab === id ? 'active' : ''} onClick={() => setTab(id)}>
              {label}
            </button>
          ))}
        </nav>
        <button type="button" className="btn" onClick={onClose}>
          {embedded ? 'Back' : 'Close'}
        </button>
      </header>
      <div className="almanac-body">
        {tab === 'techniques' && (
          <>
            <div className="callout">
              <p>
                <CategoryBadge category="suppression" /> {CATEGORY_INFO.suppression.text}
              </p>
              <p>
                <CategoryBadge category="mitigation" /> {CATEGORY_INFO.mitigation.text}
              </p>
            </div>
            {UNIT_ORDER.map((id) => (
              <TechniqueEntry key={id} id={id} />
            ))}
          </>
        )}
        {tab === 'errors' &&
          TYPE_ORDER.map((type) => (
            <section key={type} className="type-group">
              <h3 className="type-group-head">
                <TypeBadge type={type} /> <span>{ERROR_TYPES[type].text}</span>
              </h3>
              {ENEMY_ORDER.filter((id) => ENEMIES[id].errorType === type).map((id) => (
                <ErrorEntry key={id} id={id} />
              ))}
            </section>
          ))}
        {tab === 'matchups' && <Matchups />}
        {tab === 'quiz' && <PracticeQuiz />}
      </div>
    </div>
  )
}
