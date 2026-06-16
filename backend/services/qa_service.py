import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()


class QAService:
    def __init__(self, doc_service):
        self.doc_service = doc_service
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY"),
            max_tokens=1024,
        )

    async def answer(self, doc_id: str, question: str, chat_history: list) -> dict:
        doc = self.doc_service.get_document(doc_id)
        if not doc:
            raise ValueError(f"Document {doc_id} not found")

        chunks = self.doc_service.query(doc_id, question, n_results=5)
        if not chunks:
            return {"answer": "I couldn't find relevant content in the document for your question."}

        context = "\n\n---\n\n".join(chunks)

        messages = [
            SystemMessage(content=f"""You are a helpful study assistant. Answer questions based ONLY on the lesson content below.
If the answer is not in the content, say so clearly. Be concise and student-friendly.

LESSON CONTENT:
{context}""")
        ]

        for turn in chat_history[-6:]:
            role = turn.get("role", "")
            content = turn.get("content", "")
            if role == "user":
                messages.append(HumanMessage(content=content))
            elif role == "assistant":
                messages.append(AIMessage(content=content))

        messages.append(HumanMessage(content=question))

        response = self.llm.invoke(messages)
        return {"answer": response.content, "sources": len(chunks)}
