import { useState, useEffect } from 'react'
import { listDocuments, deleteDocument } from './api'
import Sidebar from './components/Sidebar'
import SummaryView from './pages/SummaryView'
import AskView from './pages/AskView'
import QuizView from './pages/QuizView'

const TABS = [
  { id: 'summary', label: '📄 Summary' },
  { id: 'ask', label: '💬 Ask' },
  { id: 'quiz', label: '🎯 Quiz' },
]

export default function App() {
  const [docs, setDocs] = useState([])
  const [activeDoc, setActiveDoc] = useState(null)
  const [tab, setTab] = useState('summary')

  useEffect(() => {
    listDocuments().then(r => setDocs(r.data)).catch(() => {})
  }, [])

  function handleUploaded(doc) {
    setDocs(prev => [...prev, doc])
    setActiveDoc(doc)
    setTab('summary')
  }

  async function handleDelete(id) {
    await deleteDocument(id)
    setDocs(prev => prev.filter(d => d.id !== id))
    if (activeDoc?.id === id) setActiveDoc(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* HEADER */}
      <header style={{ background: '#1a1714', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 2rem', height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ fontFamily: 'DM Serif Display, serif', fontSize: '1.3rem' }}>
          Study<span style={{ color: '#e8a87c' }}>AI</span>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              padding: '6px 16px', borderRadius: 20, fontSize: '0.82rem', fontWeight: 500,
              background: tab === t.id ? '#c84b2f' : 'transparent',
              color: tab === t.id ? '#fff' : 'rgba(255,255,255,0.55)',
            }}>{t.label}</button>
          ))}
        </div>
      </header>

      {/* LAYOUT */}
      <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flex: 1, maxWidth: 1280, width: '100%', margin: '0 auto', padding: '1.5rem', gap: '1.5rem' }}>
        <Sidebar docs={docs} activeDoc={activeDoc} onSelect={d => { setActiveDoc(d); setTab('summary') }} onDelete={handleDelete} onUploaded={handleUploaded} />
        <main style={{ display: 'flex', flexDirection: 'column', gap: '1rem', minWidth: 0 }}>
          {!activeDoc ? (
            <Welcome />
          ) : tab === 'summary' ? (
            <SummaryView doc={activeDoc} />
          ) : tab === 'ask' ? (
            <AskView doc={activeDoc} />
          ) : (
            <QuizView doc={activeDoc} />
          )}
        </main>
      </div>
    </div>
  )
}

function Welcome() {
  return (
    <div style={{ background: '#fff', border: '1px solid rgba(26,23,20,0.1)', borderRadius: 12, padding: '4rem 2rem', textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
      <h2 style={{ fontFamily: 'DM Serif Display, serif', fontSize: '2rem', marginBottom: '0.5rem' }}>Welcome to StudyAI</h2>
      <p style={{ color: '#6b6560', fontSize: '0.9rem', maxWidth: 380, margin: '0 auto 2rem', lineHeight: 1.7 }}>
        Upload your lesson materials and let AI help you learn faster with summaries, Q&A, and quizzes.
      </p>
      <p style={{ color: '#a09a94', fontSize: '0.82rem' }}>← Upload a lesson to get started</p>
    </div>
  )
}
