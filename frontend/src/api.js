import axios from 'axios'

const api = axios.create({ baseURL: '/api' })

export const uploadDocument = (file, onProgress) => {
  const form = new FormData()
  form.append('file', file)
  return api.post('/documents/upload', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => onProgress?.(Math.round((e.loaded / e.total) * 100)),
  })
}

export const listDocuments = () => api.get('/documents')
export const deleteDocument = (id) => api.delete(`/documents/${id}`)
export const summarizeDocument = (document_id) => api.post('/summarize', { document_id })
export const askQuestion = (document_id, question, chat_history = []) => api.post('/ask', { document_id, question, chat_history })
export const generateQuiz = (document_id, num_questions, difficulty) => api.post('/quiz/generate', { document_id, num_questions, difficulty })
