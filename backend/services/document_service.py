import os
import uuid
import json
from typing import Optional
import chromadb
from chromadb.utils import embedding_functions
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from dotenv import load_dotenv

load_dotenv()

CHROMA_DIR = os.getenv("CHROMA_PERSIST_DIR", "./chroma_db")
UPLOAD_DIR = os.getenv("UPLOAD_DIR", "./uploads")
METADATA_FILE = os.path.join(CHROMA_DIR, "documents.json")

os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(CHROMA_DIR, exist_ok=True)


class DocumentService:
    def __init__(self):
        self.client = chromadb.PersistentClient(path=CHROMA_DIR)
        self.ef = embedding_functions.SentenceTransformerEmbeddingFunction(
            model_name="all-MiniLM-L6-v2"
        )
        self.collection = self.client.get_or_create_collection(
            name="study_documents",
            embedding_function=self.ef,
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
        self._docs_meta: dict = self._load_metadata()

    def _load_metadata(self) -> dict:
        if os.path.exists(METADATA_FILE):
            with open(METADATA_FILE) as f:
                return json.load(f)
        return {}

    def _save_metadata(self):
        with open(METADATA_FILE, "w") as f:
            json.dump(self._docs_meta, f, indent=2)

    async def ingest_document(self, filename: str, content: bytes, ext: str) -> dict:
        doc_id = str(uuid.uuid4())
        save_path = os.path.join(UPLOAD_DIR, f"{doc_id}{ext}")
        with open(save_path, "wb") as f:
            f.write(content)

        pages = self._load_file(save_path, ext)
        chunks = self.splitter.split_documents(pages)

        if not chunks:
            raise ValueError("Could not extract any text from document.")

        ids, texts, metas = [], [], []
        for i, chunk in enumerate(chunks):
            ids.append(f"{doc_id}_chunk_{i}")
            texts.append(chunk.page_content)
            metas.append({
                "doc_id": doc_id,
                "filename": filename,
                "chunk_index": i,
                "page": chunk.metadata.get("page", 0),
            })

        self.collection.add(ids=ids, documents=texts, metadatas=metas)

        char_count = sum(len(t) for t in texts)
        self._docs_meta[doc_id] = {
            "id": doc_id,
            "filename": filename,
            "ext": ext,
            "num_chunks": len(chunks),
            "char_count": char_count,
            "path": save_path,
        }
        self._save_metadata()

        return {
            "id": doc_id,
            "filename": filename,
            "num_chunks": len(chunks),
            "char_count": char_count,
        }

    def _load_file(self, path: str, ext: str):
        if ext == ".pdf":
            loader = PyPDFLoader(path)
        else:
            loader = TextLoader(path, encoding="utf-8")
        return loader.load()

    def query(self, doc_id: str, query_text: str, n_results: int = 5) -> list:
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results,
            where={"doc_id": doc_id},
        )
        if not results["documents"]:
            return []
        return results["documents"][0]

    def get_all_chunks(self, doc_id: str, limit: int = 30) -> list:
        results = self.collection.get(
            where={"doc_id": doc_id},
            limit=limit,
        )
        return results["documents"] if results["documents"] else []

    def list_documents(self) -> list:
        return list(self._docs_meta.values())

    def get_document(self, doc_id: str) -> Optional[dict]:
        return self._docs_meta.get(doc_id)

    def delete_document(self, doc_id: str):
        meta = self._docs_meta.get(doc_id)
        if not meta:
            raise ValueError(f"Document {doc_id} not found")
        results = self.collection.get(where={"doc_id": doc_id})
        if results["ids"]:
            self.collection.delete(ids=results["ids"])
        if os.path.exists(meta["path"]):
            os.remove(meta["path"])
        del self._docs_meta[doc_id]
        self._save_metadata()
