import { useState } from 'react'

export default function Quiz({ quiz, onAnswer }) {
  const [picked, setPicked] = useState(null)
  const answered = picked !== null
  const correct = picked === quiz.answer

  const choose = (i) => {
    if (answered) return
    setPicked(i)
    onAnswer?.(i === quiz.answer)
  }

  return (
    <div className="quiz">
      <div className="quiz-q">{quiz.q}</div>
      <div className="quiz-options">
        {quiz.options.map((opt, i) => {
          let cls = 'quiz-option'
          if (answered && i === quiz.answer) cls += ' correct'
          else if (answered && i === picked) cls += ' wrong'
          return (
            <button key={i} type="button" className={cls} onClick={() => choose(i)} disabled={answered}>
              <span className="quiz-letter">{'ABCD'[i]}</span>
              {opt}
            </button>
          )
        })}
      </div>
      {answered && (
        <div className={`quiz-feedback ${correct ? 'good' : 'bad'}`}>
          <strong>{correct ? 'Correct!' : 'Not quite.'}</strong> {quiz.explain}
        </div>
      )}
    </div>
  )
}
