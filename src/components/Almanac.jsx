import { useState } from 'react'
import { CATEGORY_INFO, ENEMIES, ENEMY_ORDER, MATCHUPS, UNITS, UNIT_ORDER } from '../game/data.js'
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
          {e.name} <span className="entry-kind">{e.kind}</span>
        </h3>
        <p className="entry-meta">
          Strength {e.hp}
          {e.armor ? ` + ${e.armor} coherent armor` : ''} · Fidelity damage {e.fidelityDmg}% · Best counter:{' '}
          <b>{UNITS[e.counter].short}</b>
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
  const techs = ['zne', 'dd', 'trex', 'twirl']
  return (
    <div className="matchups">
      <table>
        <thead>
          <tr>
            <th />
            {ENEMY_ORDER.map((id) => (
              <th key={id}>
                <SpriteIcon kind="enemy" type={id} size={40} />
                <div>{ENEMIES[id].name}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {techs.map((t) => (
            <tr key={t}>
              <th>
                <SpriteIcon kind="unit" type={t} size={40} />
                <div>{UNITS[t].short}</div>
              </th>
              {ENEMY_ORDER.map((id) => {
                const v = MATCHUPS[t][id]
                const cls = /Strong|Strips/.test(v) ? 'good' : /No effect|Misses|Weak|Blocks only/.test(v) ? 'bad' : 'meh'
                return (
                  <td key={id} className={cls}>
                    {v}
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
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
        {tab === 'errors' && ENEMY_ORDER.map((id) => <ErrorEntry key={id} id={id} />)}
        {tab === 'matchups' && <Matchups />}
        {tab === 'quiz' && <PracticeQuiz />}
      </div>
    </div>
  )
}
