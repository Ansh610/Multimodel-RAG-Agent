from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.llm import generate_response
from app.core.embeddings import create_embedding
from app.core.vectorstore import add_texts_with_embeddings, search
from app.core.retriever import rag_answer
from app.api.upload import router as upload_router
from app.core.vectorstore import reset_index, load_index


app = FastAPI(title="Enterprise AI Copilot")


# ✅ SAFE STARTUP (VERY IMPORTANT FOR RENDER)
@app.on_event("startup")
def startup_event():
    try:
        load_index()
        print("✅ Index loaded successfully")
    except Exception as e:
        print("⚠️ Index not found, starting fresh:", e)


# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # later restrict to your Vercel URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ✅ HEALTH CHECK
@app.get("/health")
def health_check():
    return {"status": "ok"}


# ✅ TEST LLM
@app.get("/test-llm")
def test_llm():
    reply = generate_response(
        "Explain Retrieval Augmented Generation (RAG) in AI in simple terms."
    )
    return {"response": reply}


# ✅ TEST VECTOR
@app.get("/test-vector")
def test_vector():

    docs = [
        "RAG stands for Retrieval Augmented Generation in AI.",
        "FastAPI is a modern Python web framework.",
        "FAISS is used for similarity search in vector databases."
    ]

    embeddings = [create_embedding(doc) for doc in docs]

    add_texts_with_embeddings(docs, embeddings)

    query_embedding = create_embedding("What is RAG in AI?")

    results = search(query_embedding)

    return {"results": results}


# ✅ RAG QUERY
@app.get("/rag")
def rag(question: str, provider: str = None):
    return rag_answer(question, provider)


# ✅ FILE UPLOAD ROUTES
app.include_router(upload_router)


# ✅ SIMPLE CHAT
@app.get("/chat")
def chat(question: str, provider: str = None):
    answer = generate_response(question, provider)
    return {"answer": answer}


# ✅ CLEAR VECTOR DB
@app.post("/clear")
def clear_index():
    reset_index()
    return {"message": "Vector index cleared successfully"}