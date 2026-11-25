import re
import hashlib
from typing import List, Dict, Optional, Tuple

class ChunkDeduplicator:
    """
    64-bit Locality-Sensitive Hashing (SimHash) for semantic chunk deduplication.
    Identifies near-duplicate text chunks and boilerplate clauses across documents.
    """

    def __init__(self, hamming_threshold: int = 8):
        self.hamming_threshold = hamming_threshold
        # Stores mapping of fingerprint (int) -> chunk metadata
        self._index: Dict[int, Dict[str, str]] = {}

    @staticmethod
    def _tokenize(text: str) -> List[str]:
        """Extracts alphanumeric word tokens normalized to lowercase."""
        return re.findall(r'\b\w+\b', text.lower())

    @classmethod
    def compute_simhash(cls, text: str) -> int:
        """Computes a 64-bit SimHash integer fingerprint for given text."""
        tokens = cls._tokenize(text)
        if not tokens:
            return 0

        # Vector of 64 dimensions
        v = [0] * 64
        for token in tokens:
            # 64-bit hash of token
            h = int(hashlib.md5(token.encode('utf-8')).hexdigest()[:16], 16)
            for i in range(64):
                bit = (h >> i) & 1
                v[i] += 1 if bit == 1 else -1

        # Build fingerprint
        fingerprint = 0
        for i in range(64):
            if v[i] > 0:
                fingerprint |= (1 << i)
        return fingerprint

    @staticmethod
    def hamming_distance(f1: int, f2: int) -> int:
        """Counts the number of differing bits between two 64-bit integers."""
        x = f1 ^ f2
        return bin(x).count('1')

    def is_duplicate(self, text: str, chunk_id: str, doc_id: str) -> Tuple[bool, Optional[Dict[str, str]], int]:
        """
        Checks if text chunk is a duplicate of an already indexed chunk.
        Returns: (is_dup, matching_metadata, distance)
        """
        fp = self.compute_simhash(text)
        if fp == 0:
            return False, None, 64

        min_dist = 64
        closest_match = None

        for indexed_fp, meta in self._index.items():
            dist = self.hamming_distance(fp, indexed_fp)
            if dist < min_dist:
                min_dist = dist
                closest_match = meta
            if dist <= self.hamming_threshold:
                return True, meta, dist

        # Not duplicate within threshold; register into index
        self._index[fp] = {"chunk_id": chunk_id, "doc_id": doc_id}
        return False, closest_match, min_dist

    def clear(self) -> None:
        """Clears the deduplication index."""
        self._index.clear()
