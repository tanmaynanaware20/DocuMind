import difflib
from typing import List, Dict, Any, Tuple

class WordLevelDiffEngine:
    """
    Fine-grained token and word-level alignment engine for contract redlining.
    Calculates exact token insertions, deletions, and replacements.
    """

    @staticmethod
    def levenshtein_similarity(s1: str, s2: str) -> float:
        """Computes normalized similarity ratio between two strings [0.0 - 1.0]."""
        return difflib.SequenceMatcher(None, s1, s2).ratio()

    @classmethod
    def align_tokens(cls, text_a: str, text_b: str) -> List[Dict[str, Any]]:
        """
        Performs word-level token alignment between two clause versions.
        Returns a sequence of diff tokens with operation ('equal', 'insert', 'delete', 'replace').
        """
        words_a = text_a.split()
        words_b = text_b.split()

        matcher = difflib.SequenceMatcher(None, words_a, words_b)
        aligned_tokens = []

        for tag, i1, i2, j1, j2 in matcher.get_opcodes():
            if tag == 'equal':
                aligned_tokens.append({
                    "op": "equal",
                    "text": " ".join(words_a[i1:i2])
                })
            elif tag == 'delete':
                aligned_tokens.append({
                    "op": "delete",
                    "removed": " ".join(words_a[i1:i2])
                })
            elif tag == 'insert':
                aligned_tokens.append({
                    "op": "insert",
                    "added": " ".join(words_b[j1:j2])
                })
            elif tag == 'replace':
                aligned_tokens.append({
                    "op": "replace",
                    "removed": " ".join(words_a[i1:i2]),
                    "added": " ".join(words_b[j1:j2]),
                    "similarity": round(cls.levenshtein_similarity(" ".join(words_a[i1:i2]), " ".join(words_b[j1:j2])), 2)
                })

        return aligned_tokens
