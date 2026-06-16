import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { uploadDocument } from '../api'

const s = {
  aside: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  panel: { background: '#fff', border: '1px solid rgba(26,23,20,0.1)', borderRadius: 12, overflow: 'hidden' },
  panelHead: { padding: '0.75rem 1rem', borderBottom: '1px solid rgba(26,23,20,0.06)', fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#a09a94', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  badge: { background: '#e3f2fd', color: '#1565c0', fontSize: '0.68rem', fontWeight: 700, padding: '2px 8px', borderRadius: 10 },
  zone: { margin: '1rem', padding: '1.2rem', border: '2px dashed rgba(26,23,20,0.1)', borderRadius: 8, textAlign: 'center', cursor: 'pointer' },
  zoneDrag: { borderColor: '#c84b2f', background: '#fff1ed' },
  strong: { display: 'block', fontSize: '0.85rem', color: '#c84b2f', marginBottom: 4 },
  p: { fontSize: '0.78rem', color: '#a09a94' },
  icon: { fontSize: '1.8rem', display: 'block', marginBottom: 6 },
  docList: { padding: '0.5rem' },
  empty: { textAlign: 'center', padding: '1.5rem 1rem', color: '#a09a94', fontSize: '0.8rem' },
  docItem: { display: 'flex', alignItems: 'center', gap: 10, padding: '0.6rem 0.7rem', borderRadius: 8, cursor: 'pointer' },
  docIcon: { width: 32, height: 32, background: '#f4ede8', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.9rem', flexShrink: 0 },
  docName: { fontSize: '0.82rem', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
  docMeta: { fontSize: '0.7rem', color: '#a09a94' },
  del: { marginLeft: 'auto', color: '#a09a94', fontSize: '0.85rem', padding: '3px 5px', borderRadius: 4, flexShrink: 0 },
  bar: { width: '100%', height: 5, background: '#f0ece3', borderRadius: 3, overflow: 'hidden', marginBottom: 6 },
  fill: { height: '100%', background: '#c84b2f', borderRadius: 3, transition: 'width 0.2s' },
}

function trunc(s, n) { return s.length > n ? s.slice(0, n) + '…' : s }

export default function Sidebar({ docs, activeDoc, onSelect, onDelete, onUploaded }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')

  const onDrop = useCallback(async (files) => {
    if (!files.length) return
    setError(''); setUploading(true); setProgress(0)
    try {
      for (const file of files) {
        const res = await uploadDocument(file, setProgress)
        onUploaded(res.data)
      }
    } catch (e) {
      setError(e.response?.data?.detail || 'Upload failed')
    }
    setUploading(false); setProgress(0)
  }, [onUploaded])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    maxFiles: 5,
    disabled: uploading,
  })

  return (
    <aside style={s.aside}>
      <div style={s.panel}>
        <div style={s.panelHead}>Upload Lessons</div>
        <div style={{ ...s.zone, ...(isDragActive ? s.zoneDrag : {}) }} {...getRootProps()}>
          <input {...getInputProps()} />
          {uploading ? (
            <div>
              <div style={s.bar}><div style={{ ...s.fill, width: progress + '%' }} /></div>
              <span style={{ fontSize: '0.78rem', color: '#a09a94' }}>Indexing… {progress}%</span>
            </div>
          ) : (
            <>
              <span style={s.icon}>📂</span>
              <strong style={s.strong}>{isDragActive ? 'Drop it!' : 'Click or drag to upload'}</strong>
              <p style={s.p}>PDF, TXT, MD · Max 10MB</p>
            </>
          )}
        </div>
        {error && <p style={{ color: '#c84b2f', fontSize: '0.78rem', padding: '0 1rem 0.75rem' }}>{error}</p>}
      </div>

      <div style={s.panel}>
        <div style={s.panelHead}>
          Lessons
          <span style={s.badge}>{docs.length}</span>
        </div>
        <div style={s.docList}>
          {docs.length === 0 ? (
            <div style={s.empty}>Upload a lesson to get started 📖</div>
          ) : docs.map(doc => (
            <div key={doc.id}
              style={{ ...s.docItem, background: activeDoc?.id === doc.id ? '#fff1ed' : 'transparent' }}
              onClick={() => onSelect(doc)}
              onMouseEnter={e => { if (activeDoc?.id !== doc.id) e.currentTarget.style.background = '#f0ece3' }}
              onMouseLeave={e => { if (activeDoc?.id !== doc.id) e.currentTarget.style.background = 'transparent' }}
            >
              <div style={{ ...s.docIcon, background: activeDoc?.id === doc.id ? '#c84b2f' : '#f4ede8' }}>
                {doc.filename.endsWith('.pdf') ? '📕' : '📄'}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={s.docName}>{trunc(doc.filename, 22)}</div>
                <div style={s.docMeta}>{doc.num_chunks} chunks</div>
              </div>
              <button style={s.del} title="Remove" onClick={e => { e.stopPropagation(); onDelete(doc.id) }}>✕</button>
            </div>
          ))}
        </div>
      </div>
    </aside>
  )
}
