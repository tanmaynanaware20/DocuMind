import pytest
from backend.app.services.rag_service import RAGService

def test_embedding_generation_consistency():
    text_a = "Master Subscription Agreement limitation of liability"
    text_b = "Master Subscription Agreement limitation of liability"
    text_c = "Completely unrelated text about gardening and botany"

    emb_a = RAGService.compute_embedding(text_a)
    emb_b = RAGService.compute_embedding(text_b)
    emb_c = RAGService.compute_embedding(text_c)

    assert len(emb_a) == 128
    assert emb_a == emb_b

    sim_identical = RAGService.cosine_similarity(emb_a, emb_b)
    sim_different = RAGService.cosine_similarity(emb_a, emb_c)

    assert sim_identical >= 0.99
    assert sim_different < sim_identical

def test_search_chunks_hybrid():
    chunks = [
        {"document_id": "doc_1", "document_title": "MSA v1", "page_number": 4, "content": "The aggregate limitation of liability shall not exceed $1,000,000."},
        {"document_id": "doc_2", "document_title": "Security Framework", "page_number": 2, "content": "Data is encrypted at rest using AES-256 BYOK keys."},
        {"document_id": "doc_3", "document_title": "Investor Filing", "page_number": 8, "content": "Quarterly revenue grew by 84% year-over-year."}
    ]

    results = RAGService.search_chunks(chunks, "What is the liability cap?", search_type="hybrid", top_k=2)
    assert len(results) > 0
    top_chunk, score = results[0]
    assert top_chunk["document_id"] == "doc_1"
    assert "liability" in top_chunk["content"].lower()

def test_synthesize_grounded_answer():
    retrieved = [
        ({"document_id": "doc_1", "document_title": "MSA v1", "page_number": 4, "content": "The aggregate limitation of liability shall not exceed $1,000,000."}, 0.95)
    ]
    docs = []
    answer = RAGService.synthesize_answer("liability cap", retrieved, docs)

    assert answer.content is not None
    assert len(answer.citations) > 0
    citation = answer.citations[0]
    assert citation.documentId == "doc_1"
    assert citation.page == 4
    assert citation.matchScore > 0.5

def test_tunable_rrf_parameters():
    chunks = [
        {"document_id": "doc_1", "document_title": "Doc 1", "content": "limitation of liability clause details"},
        {"document_id": "doc_2", "document_title": "Doc 2", "content": "general services terms"}
    ]
    # Dense-heavy search
    res_dense = RAGService.search_chunks(chunks, "liability", dense_weight=0.9, sparse_weight=0.1, rrf_k=30)
    assert len(res_dense) > 0
    assert res_dense[0][0]["document_id"] == "doc_1"

    # Sparse-heavy search
    res_sparse = RAGService.search_chunks(chunks, "liability", dense_weight=0.1, sparse_weight=0.9, rrf_k=100)
    assert len(res_sparse) > 0
    assert res_sparse[0][0]["document_id"] == "doc_1"
