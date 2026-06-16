import { useState } from 'react'
import { generateQuiz } from '../api'

const LETTERS = ['A', 'B', 'C', 'D']

export default function QuizView({ doc }) {
  const [numQ, setNumQ] = useState(5)
  const [difficulty, setDifficulty] = useState('medium')
  const [loading, setLoading] = useState(false)
  const [questions, setQuestions] = useState([])
  const [index, setIndex] = useState(0)
  const [score, setScore] = useState(0)
  const [chosen, setChosen] = useState(null)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function generate() {
    setLoading(true); setError(''); setQuestions([]); setIndex(0); setScore(0); setChosen(null); setDone(false)
    try {
      const res = await generateQuiz(doc.id, numQ, difficulty)
      setQuestions(res.data.questions)
    } catch (e) {
      setError(e.response?.data?.detail || 'Quiz generation failed.')
    }
    setLoading(false)
  }

  function pick(i) {
    if (chosen !== null) return
    setChosen(i)
    if (i === questions[index].correct_index) setScore(s => s + 1)
  }

  function next() {
    if (index + 1 >= questions.length) { setDone(true); return }
    setIndex(i => i + 1); setChosen(null)
  }

  const card = { background: '#fff', border: '1px solid rgba(26,23,20,0.1)', borderRadius: 12, overflow: 'hidden', marginBottom: '1rem' }
  const btn = (active) => ({ padding: '8px 18px', borderRadius: 8, background: active ? '#c84b2f' : 'transparent', color: active ? '#fff' : '#c84b2f', border: '1.5px solid #c84b2f', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer' })
  const sel = { padding: '7px 12px', border: '1.5px solid rgba(26,23,20,0.1)', borderRadius: 8, background: '#f8f6f1', fontSize: '0.85rem' }

  if (done) {
    const pct = Math.round(score / questions.length * 100)
    const color = pct >= 80 ? '#2e7d32' : pct >= 50 ? '#e65100' : '#c62828'
    const bg = pct >= 80 ? '#e8f5e9' : pct >= 50 ? '#fff3e0' : '#ffebee'
    const msg = pct >= 80 ? 'Excellent work! 🎉' : pct >= 50 ? 'Good effort! Keep studying 📖' : 'Keep going — practice makes perfect! 💪'
    return (
      <div style={card}>
        <div style={{ textAlign: 'center', padding: '3rem 2rem' }}>
          <div style={{ width: 100, height: 100, borderRadius: '50%', background: bg, color, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', fontFamily: 'DM Serif Display, serif', fontSize: '2rem', fontWeight: 700 }}>{pct}%</div>
          <h3 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.5rem', marginBottom: '0.5rem' }}>{score} / {questions.length} Correct</h3>
          <p style={{ color: '#6b6560', marginBottom: '1.5rem' }}>{msg}</p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button style={btn(false)} onClick={() => { setIndex(0); setScore(0); setChosen(null); setDone(false) }}>🔁 Retry</button>
            <button style={btn(true)} onClick={() => { setQuestions([]); setDone(false) }}>🎲 New Quiz</button>
          </div>
        </div>
      </div>
    )
  }

  const q = questions[index]
  const pct = questions.length ? Math.round((index + (chosen !== null ? 1 : 0)) / questions.length * 100) : 0

  return (
    <div>
      {/* Setup */}
      <div style={card}>
        <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(26,23,20,0.06)' }}>
          <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem' }}>🎯 Generate Quiz</span>
        </div>
        <div style={{ padding: '1rem 1.25rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a09a94', display: 'flex', flexDirection: 'column', gap: 5 }}>
            Questions
            <select style={sel} value={numQ} onChange={e => setNumQ(+e.target.value)} disabled={loading}>
              {[3, 5, 8, 10].map(n => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: '#a09a94', display: 'flex', flexDirection: 'column', gap: 5 }}>
            Difficulty
            <select style={sel} value={difficulty} onChange={e => setDifficulty(e.target.value)} disabled={loading}>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </label>
          <button style={{ ...btn(true), opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }} onClick={generate} disabled={loading}>
            {loading ? '⏳ Generating…' : '🎲 Generate Quiz'}
          </button>
        </div>
        {error && <p style={{ color: '#c84b2f', fontSize: '0.82rem', padding: '0 1.25rem 1rem' }}>⚠️ {error}</p>}
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ ...card, padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a09a94', fontSize: '0.84rem' }}>
            <Dots />
            <span>Building {numQ} {difficulty} questions…</span>
          </div>
        </div>
      )}

      {/* Question */}
      {q && !loading && (
        <div style={card}>
          <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(26,23,20,0.06)', display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem' }}>Quiz Time!</span>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ flex: 1, height: 5, background: '#f0ece3', borderRadius: 3, overflow: 'hidden' }}>
                <div style={{ height: '100%', background: '#c84b2f', borderRadius: 3, width: pct + '%', transition: 'width 0.35s' }} />
              </div>
              <span style={{ fontSize: '0.72rem', color: '#a09a94', fontWeight: 600, whiteSpace: 'nowrap' }}>{index + 1} / {questions.length}</span>
            </div>
          </div>
          <div style={{ padding: '1.25rem' }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: '#c84b2f', marginBottom: '0.5rem' }}>Question {index + 1}</div>
            <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.15rem', lineHeight: 1.4, marginBottom: '1.25rem' }}>{q.question}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {q.options.map((opt, i) => {
                let bg = '#fff', border = 'rgba(26,23,20,0.1)', color = '#1a1714'
                if (chosen !== null) {
                  if (i === q.correct_index) { bg = '#e8f5e9'; border = '#2e7d32'; color = '#1b5e20' }
                  else if (i === chosen) { bg = '#ffebee'; border = '#c62828'; color = '#b71c1c' }
                }
                return (
                  <button key={i} disabled={chosen !== null} onClick={() => pick(i)}
                    style={{ padding: '0.75rem 1rem', borderRadius: 8, border: `1.5px solid ${border}`, background: bg, color, textAlign: 'left', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 10, cursor: chosen !== null ? 'default' : 'pointer' }}>
                    <span style={{ width: 26, height: 26, borderRadius: '50%', background: i === q.correct_index && chosen !== null ? '#2e7d32' : i === chosen && chosen !== null ? '#c62828' : '#f0ece3', color: (i === q.correct_index || i === chosen) && chosen !== null ? '#fff' : '#6b6560', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>
                      {LETTERS[i]}
                    </span>
                    {opt}
                  </button>
                )
              })}
            </div>
            {chosen !== null && (
              <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: 8, background: '#f0f4ff', borderLeft: '3px solid #3b5bdb', fontSize: '0.82rem', lineHeight: 1.6, color: '#1a1f5e' }}>
                {chosen === q.correct_index ? '✅ Correct! ' : '❌ Incorrect. '}{q.explanation}
              </div>
            )}
            {chosen !== null && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button style={btn(true)} onClick={next}>
                  {index + 1 < questions.length ? 'Next Question →' : 'See Results'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function Dots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <span key={i} style={{ width: 6, height: 6, background: '#c84b2f', borderRadius: '50%', display: 'inline-block', animation: `bounce 1.2s ${d}s infinite` }} />
      ))}
      <style>{`@keyframes bounce{0%,80%,100%{transform:translateY(0);opacity:0.4}40%{transform:translateY(-5px);opacity:1}}`}</style>
    </div>
  )
}
