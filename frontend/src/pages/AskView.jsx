import { useState, useRef, useEffect } from 'react'
import { askQuestion } from '../api'

export default function AskView({ doc }) {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: `Hi! I've indexed "${doc.filename}". Ask me anything about it! 📚` }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send() {
    const q = input.trim()
    if (!q || loading) return
    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: q }])
    setLoading(true)

    const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }))
    try {
      const res = await askQuestion(doc.id, q, history)
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }])
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ' + (e.response?.data?.detail || 'Something went wrong.') }])
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(26,23,20,0.1)', borderRadius: 12, display: 'flex', flexDirection: 'column', minHeight: 500 }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(26,23,20,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.05rem' }}>💬 Ask a Question</span>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'Chat cleared! Ask me anything 📚' }])} style={{ fontSize: '0.78rem', color: '#a09a94', padding: '4px 10px', borderRadius: 6 }}>Clear</button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', maxHeight: 420 }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flexDirection: m.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0, background: m.role === 'user' ? '#c84b2f' : '#f0ece3', color: m.role === 'user' ? '#fff' : '#6b6560' }}>
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div style={{ maxWidth: '80%', padding: '0.7rem 1rem', borderRadius: m.role === 'user' ? '12px 4px 12px 12px' : '4px 12px 12px 12px', fontSize: '0.85rem', lineHeight: 1.65, whiteSpace: 'pre-wrap', background: m.role === 'user' ? '#c84b2f' : '#f0ece3', color: m.role === 'user' ? '#fff' : '#1a1714' }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, background: '#f0ece3', color: '#6b6560' }}>AI</div>
            <div style={{ padding: '0.7rem 1rem', background: '#f0ece3', borderRadius: '4px 12px 12px 12px' }}>
              <Dots />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div style={{ display: 'flex', gap: 8, padding: '0.85rem 1rem', borderTop: '1px solid rgba(26,23,20,0.06)' }}>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
          placeholder="Ask a question… (Enter to send)"
          rows={2}
          disabled={loading}
          style={{ flex: 1, padding: '8px 14px', border: '1.5px solid rgba(26,23,20,0.1)', borderRadius: 8, fontSize: '0.85rem', background: '#f8f6f1', resize: 'none', outline: 'none', lineHeight: 1.5 }}
        />
        <button onClick={send} disabled={loading || !input.trim()} style={{ padding: '8px 18px', borderRadius: 8, background: '#c84b2f', color: '#fff', fontSize: '0.82rem', fontWeight: 600, alignSelf: 'flex-end', opacity: loading || !input.trim() ? 0.4 : 1, cursor: loading || !input.trim() ? 'not-allowed' : 'pointer' }}>
          Send ↗
        </button>
      </div>
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
