import pytest
from backend.app.services.diff_engine import WordLevelDiffEngine

def test_levenshtein_similarity():
    s1 = "Limitation of Liability shall not exceed $1,000,000"
    s2 = "Limitation of Liability shall not exceed $5,000,000"
    sim = WordLevelDiffEngine.levenshtein_similarity(s1, s2)
    assert 0.85 < sim < 1.0

def test_align_tokens_replacement():
    clause_a = "The aggregate liability shall not exceed $1,000,000 or fees paid."
    clause_b = "The aggregate liability shall not exceed $5,000,000 or fees paid."

    aligned = WordLevelDiffEngine.align_tokens(clause_a, clause_b)
    assert len(aligned) > 0

    # Verify replacement token is detected
    replacements = [t for t in aligned if t["op"] == "replace"]
    assert len(replacements) == 1
    assert replacements[0]["removed"] == "$1,000,000"
    assert replacements[0]["added"] == "$5,000,000"

def test_align_tokens_insertion_and_deletion():
    a = "Monthly uptime target is 99.9% availability."
    b = "Monthly core uptime target is 99.99% mission-critical availability."

    aligned = WordLevelDiffEngine.align_tokens(a, b)
    ops = {t["op"] for t in aligned}
    assert "equal" in ops
    assert "replace" in ops or "insert" in ops
