import pytest
from backend.app.services.chunk_deduplicator import ChunkDeduplicator

def test_identical_text_has_zero_hamming_distance():
    text = "The Contractor shall maintain comprehensive general liability insurance during the entire term."
    fp1 = ChunkDeduplicator.compute_simhash(text)
    fp2 = ChunkDeduplicator.compute_simhash(text)
    assert fp1 == fp2
    assert ChunkDeduplicator.hamming_distance(fp1, fp2) == 0

def test_near_duplicate_detection():
    dedup = ChunkDeduplicator(hamming_threshold=8)
    original = "The Contractor shall maintain comprehensive general liability insurance of at least two million dollars."
    variation = "The Contractor shall maintain comprehensive general liability insurance of at least five million dollars."

    is_dup1, _, _ = dedup.is_duplicate(original, chunk_id="chunk-1", doc_id="doc-A")
    assert is_dup1 is False  # first time seeing it

    is_dup2, matched, dist = dedup.is_duplicate(variation, chunk_id="chunk-2", doc_id="doc-B")
    assert is_dup2 is True
    assert matched["chunk_id"] == "chunk-1"
    assert dist <= 8

def test_distinct_content_is_not_duplicate():
    dedup = ChunkDeduplicator(hamming_threshold=3)
    text1 = "Quarterly EBITDA financial earnings report revenue and dividends distribution."
    text2 = "Kubernetes container deployment pod autoscaling ingress network policy."

    dedup.is_duplicate(text1, chunk_id="c1", doc_id="d1")
    is_dup, _, dist = dedup.is_duplicate(text2, chunk_id="c2", doc_id="d2")

    assert is_dup is False
    assert dist > 10
