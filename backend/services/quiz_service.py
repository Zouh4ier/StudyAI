import os
import json
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()


class QuizService:
    def __init__(self, doc_service):
        self.doc_service = doc_service
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY"),
            max_tokens=2000,
        )

    async def generate(self, doc_id: str, num_questions: int, difficulty: str) -> dict:
        doc = self.doc_service.get_document(doc_id)
        if not doc:
            raise ValueError(f"Document {doc_id} not found")

        chunks = self.doc_service.get_all_chunks(doc_id, limit=20)
        if not chunks:
            raise ValueError("No content found for document.")

        content = "\n\n".join(chunks)

        difficulty_guide = {
            "easy": "Ask about basic definitions and main ideas directly stated in the text.",
            "medium": "Ask about relationships between concepts and application of ideas.",
            "hard": "Ask about nuanced distinctions, inference, and analysis across concepts.",
        }.get(difficulty.lower(), "Ask about relationships between concepts.")

        system = f"""You are a quiz generator. Generate exactly {num_questions} multiple-choice questions.
Difficulty: {difficulty.upper()} — {difficulty_guide}

Return ONLY valid JSON, no extra text, no markdown:
{{
  "questions": [
    {{
      "question": "Question text",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correct_index": 0,
      "explanation": "Why this answer is correct"
    }}
  ]
}}

Rules:
- correct_index is 0-based (0=A, 1=B, 2=C, 3=D)
- Make wrong options plausible
- Base ALL questions on the lesson content only"""

        messages = [
            SystemMessage(content=system),
            HumanMessage(content=f"Lesson:\n\n{content[:10000]}\n\nGenerate {num_questions} {difficulty} questions.")
        ]

        response = self.llm.invoke(messages)
        raw = response.content.strip()

        if "```" in raw:
            raw = raw.split("```")[1]
            if raw.startswith("json"):
                raw = raw[4:]
        raw = raw.strip()

        parsed = json.loads(raw)
        return {
            "questions": parsed["questions"],
            "num_questions": len(parsed["questions"]),
            "difficulty": difficulty,
            "filename": doc["filename"],
        }
