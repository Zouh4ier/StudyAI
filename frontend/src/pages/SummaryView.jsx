import { useState } from 'react'
import { summarizeDocument } from '../api'

export default function SummaryView({ doc }) {
  const [summary, setSummary] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleSummarize() {
    setLoading(true); setError(''); setSummary('')
    try {
      const res = await summarizeDocument(doc.id)
      setSummary(res.data.summary)
    } catch (e) {
      setError(e.response?.data?.detail || 'Summarization failed. Please try again.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(26,23,20,0.1)', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid rgba(26,23,20,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1rem' }}>
        <div>
          <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.1rem' }}>{doc.filename}</h2>
          <span style={{ fontSize: '0.75rem', color: '#a09a94' }}>{doc.num_chunks} chunks · {(doc.char_count / 1000).toFixed(1)}k chars</span>
        </div>
        <button onClick={handleSummarize} disabled={loading} style={{ padding: '8px 18px', borderRadius: 8, background: '#c84b2f', color: '#fff', border: '1.5px solid #c84b2f', fontSize: '0.82rem', fontWeight: 600, opacity: loading ? 0.5 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
          {loading ? '⏳ Summarizing…' : '✨ Summarize'}
        </button>
      </div>
      <div style={{ padding: '1.25rem', minHeight: 200 }}>
        {loading && <Loader text="Reading document and generating summary…" />}
        {error && <p style={{ color: '#c84b2f', fontSize: '0.85rem' }}>⚠️ {error}</p>}
        {!loading && !error && !summary && <p style={{ color: '#a09a94', fontSize: '0.85rem' }}>Click <strong>Summarize</strong> to generate an AI breakdown of your lesson.</p>}
        {summary && <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'DM Sans, sans-serif', fontSize: '0.88rem', lineHeight: 1.8 }}>{summary}</pre>}
      </div>
    </div>
  )
}

function Loader({ text }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#a09a94', fontSize: '0.84rem', padding: '0.5rem 0' }}>
      <Dots /><span>{text}</span>
    </div>
  )
}

function Dots() {
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {[0, 0.2, 0.4].map((d, i) => (
        <span key={i} style={{ width: 6, height: 6, background: '#c84b2f', borderRadius: '50%', display: 'inline-block', animation: `bounce 1.2s ${d}s infinite` }} />
      ))}
      <style>{`@keyframes bounce { 0%,80%,100%{transform:translateY(0);opacity:0.4} 40%{transform:translateY(-5px);opacity:1} }`}</style>
    </div>
  )
}
