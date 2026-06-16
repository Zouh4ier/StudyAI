import os
from langchain_groq import ChatGroq
from langchain_core.messages import HumanMessage, SystemMessage
from dotenv import load_dotenv

load_dotenv()


class SummaryService:
    def __init__(self, doc_service):
        self.doc_service = doc_service
        self.llm = ChatGroq(
            model="llama-3.3-70b-versatile",
            groq_api_key=os.getenv("GROQ_API_KEY"),
            max_tokens=1500,
        )

    async def summarize(self, doc_id: str) -> dict:
        doc = self.doc_service.get_document(doc_id)
        if not doc:
            raise ValueError(f"Document {doc_id} not found")

        chunks = self.doc_service.get_all_chunks(doc_id, limit=25)
        if not chunks:
            raise ValueError("No content found for document.")

        if len(chunks) > 12:
            summary = await self._map_reduce(chunks)
        else:
            summary = await self._direct(chunks)

        return {"summary": summary, "filename": doc["filename"]}

    async def _direct(self, chunks: list) -> str:
        content = "\n\n".join(chunks)
        messages = [
            SystemMessage(content="""You are an expert study assistant. Summarize the lesson with:

1. OVERVIEW (2-3 sentences)
2. KEY CONCEPTS (5-7 bullet points with short explanations)
3. IMPORTANT TERMS (definitions as a list)
4. MAIN TAKEAWAYS (3 bullet points)

Be clear and student-friendly. Use plain text only."""),
            HumanMessage(content=f"Lesson:\n\n{content[:12000]}")
        ]
        response = self.llm.invoke(messages)
        return response.content

    async def _map_reduce(self, chunks: list) -> str:
        batch_size = 6
        batches = [chunks[i:i+batch_size] for i in range(0, len(chunks), batch_size)]
        partials = []

        for batch in batches:
            text = "\n\n".join(batch)
            msgs = [
                SystemMessage(content="Summarize this lesson section in 3-5 sentences. Focus on key ideas only."),
                HumanMessage(content=text[:6000])
            ]
            res = self.llm.invoke(msgs)
            partials.append(res.content)

        combined = "\n\n".join(partials)
        msgs = [
            SystemMessage(content="""Write a cohesive summary from these partial summaries with:
1. OVERVIEW (2-3 sentences)
2. KEY CONCEPTS (5-7 bullet points)
3. IMPORTANT TERMS
4. MAIN TAKEAWAYS
Use plain text only."""),
            HumanMessage(content=combined)
        ]
        res = self.llm.invoke(msgs)
        return res.content
