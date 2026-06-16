from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
import os
from dotenv import load_dotenv

from services.document_service import DocumentService
from services.qa_service import QAService
from services.quiz_service import QuizService
from services.summary_service import SummaryService

load_dotenv()

app = FastAPI(title="StudyAI API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

doc_service = DocumentService()
qa_service = QAService(doc_service)
quiz_service = QuizService(doc_service)
summary_service = SummaryService(doc_service)


class QuestionRequest(BaseModel):
    document_id: str
    question: str
    chat_history: Optional[List] = []

class SummaryRequest(BaseModel):
    document_id: str

class QuizRequest(BaseModel):
    document_id: str
    num_questions: int = 5
    difficulty: str = "medium"


@app.get("/")
def root():
    return {"status": "StudyAI API is running"}


@app.post("/documents/upload")
async def upload_document(file: UploadFile = File(...)):
    allowed = {".pdf", ".txt", ".md"}
    ext = os.path.splitext(file.filename)[1].lower()
    if ext not in allowed:
        raise HTTPException(400, f"Unsupported file type. Use PDF, TXT, or MD.")
    content = await file.read()
    if len(content) > 10 * 1024 * 1024:
        raise HTTPException(400, "File too large. Max 10MB.")
    result = await doc_service.ingest_document(file.filename, content, ext)
    return result


@app.get("/documents")
def list_documents():
    return doc_service.list_documents()


@app.delete("/documents/{document_id}")
def delete_document(document_id: str):
    doc_service.delete_document(document_id)
    return {"message": "Document deleted"}


@app.post("/summarize")
async def summarize(req: SummaryRequest):
    return await summary_service.summarize(req.document_id)


@app.post("/ask")
async def ask(req: QuestionRequest):
    return await qa_service.answer(req.document_id, req.question, req.chat_history)


@app.post("/quiz/generate")
async def generate_quiz(req: QuizRequest):
    return await quiz_service.generate(req.document_id, req.num_questions, req.difficulty)
