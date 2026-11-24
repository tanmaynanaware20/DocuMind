import pytest
from backend.app.services.vector_cache import VectorCache

def test_vector_cache_exact_lookup():
    cache = VectorCache(capacity=5, ttl_seconds=60)
    query = "What is the limitation of liability?"
    embedding = [0.1, 0.2, 0.3, 0.4]
    results = [{"chunk_id": "chunk-101", "score": 0.95}]

    cache.set(query, embedding, results)
    cached = cache.get(query)
    assert cached is not None
    assert cached[0]["chunk_id"] == "chunk-101"
    assert cache.stats()["hits"] == 1

def test_vector_cache_miss_and_eviction():
    cache = VectorCache(capacity=2, ttl_seconds=60)
    cache.set("query 1", [1.0, 0.0], [{"id": 1}])
    cache.set("query 2", [0.0, 1.0], [{"id": 2}])
    cache.set("query 3", [0.5, 0.5], [{"id": 3}])

    assert cache.stats()["size"] == 2
    assert cache.stats()["evictions"] == 1
    assert cache.get("query 1") is None  # evicted

def test_vector_cache_cosine_similarity():
    cache = VectorCache(capacity=10, ttl_seconds=60)
    cache.set("confidentiality clause", [1.0, 0.0, 0.0], [{"doc": "NDA"}])

    # Query with nearly identical vector (cosine similarity ~0.999)
    near_embedding = [0.999, 0.01, 0.0]
    matched = cache.get_similar(near_embedding, threshold=0.98)
    assert matched is not None
    assert matched[0]["doc"] == "NDA"
