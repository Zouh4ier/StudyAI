# 🎓 StudyAI — Setup Guide

## What you need installed on your PC
- Python 3.10 or 3.11 (NOT 3.13) → https://www.python.org/downloads/release/python-3119/
- Node.js 18+ → https://nodejs.org
- VS Code → https://code.visualstudio.com
- Groq API key (free) → https://console.groq.com

---

## Step 1 — Backend Setup

Open a terminal in VS Code (Ctrl + `) and run these commands ONE BY ONE:

```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

This will take 3-5 minutes. Wait for it to finish.

Then create your .env file:
```
copy .env.example .env
```

Open .env and paste your Groq API key:
```
GROQ_API_KEY=gsk_your_key_here
```

Start the backend:
```
uvicorn main:app --reload --port 8000
```

You should see:
  INFO: Uvicorn running on http://127.0.0.1:8000

---

## Step 2 — Frontend Setup

Open a SECOND terminal (click the + icon in terminal panel):

```
cd frontend
npm install
npm run dev
```

You should see:
  VITE ready
  Local: http://localhost:5173/

---

## Step 3 — Open the app

Go to: http://localhost:5173

---

## Project Structure

studyai/
├── backend/
│   ├── main.py                    FastAPI routes
│   ├── services/
│   │   ├── document_service.py    ChromaDB + PyPDF indexing
│   │   ├── qa_service.py          RAG question answering
│   │   ├── summary_service.py     AI summarization
│   │   └── quiz_service.py        Quiz generation
│   ├── requirements.txt
│   └── .env                       Your API key (create this)
│
└── frontend/
    ├── src/
    │   ├── components/Sidebar.jsx
    │   ├── pages/SummaryView.jsx
    │   ├── pages/AskView.jsx
    │   ├── pages/QuizView.jsx
    │   ├── App.jsx
    │   └── api.js
    └── package.json
