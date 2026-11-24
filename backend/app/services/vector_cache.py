import time
import math
import hashlib
from typing import List, Dict, Any, Optional
from collections import OrderedDict

class VectorCache:
    """
    High-performance in-memory cache for query embeddings and semantic retrieval results.
    Provides O(1) exact query caching and near-duplicate cosine similarity matching.
    """

    def __init__(self, capacity: int = 500, ttl_seconds: int = 3600):
        self.capacity = capacity
        self.ttl = ttl_seconds
        # key: hash -> {"query": str, "embedding": List[float], "results": List[Dict], "timestamp": float}
        self._cache: OrderedDict[str, Dict[str, Any]] = OrderedDict()
        self.hits = 0
        self.misses = 0
        self.evictions = 0

    @staticmethod
    def _hash_query(query: str) -> str:
        return hashlib.sha256(query.strip().lower().encode("utf-8")).hexdigest()

    @staticmethod
    def _cosine_similarity(vec1: List[float], vec2: List[float]) -> float:
        if not vec1 or not vec2 or len(vec1) != len(vec2):
            return 0.0
        dot = sum(a * b for a, b in zip(vec1, vec2))
        norm1 = math.sqrt(sum(a * a for a in vec1))
        norm2 = math.sqrt(sum(b * b for b in vec2))
        if norm1 == 0.0 or norm2 == 0.0:
            return 0.0
        return dot / (norm1 * norm2)

    def get(self, query: str) -> Optional[List[Dict[str, Any]]]:
        """Lookup cached retrieval results for an exact query match."""
        key = self._hash_query(query)
        entry = self._cache.get(key)
        if not entry:
            self.misses += 1
            return None

        # Check TTL
        if time.time() - entry["timestamp"] > self.ttl:
            del self._cache[key]
            self.misses += 1
            return None

        # Move to end for LRU
        self._cache.move_to_end(key)
        self.hits += 1
        return entry["results"]

    def get_similar(self, query_embedding: List[float], threshold: float = 0.98) -> Optional[List[Dict[str, Any]]]:
        """
        Lookup semantic neighbor results using cosine similarity against cached query embeddings.
        Avoids redundant vector database lookups for near-identical user queries.
        """
        now = time.time()
        for key, entry in reversed(self._cache.items()):
            if now - entry["timestamp"] > self.ttl:
                continue
            sim = self._cosine_similarity(query_embedding, entry["embedding"])
            if sim >= threshold:
                self.hits += 1
                self._cache.move_to_end(key)
                return entry["results"]

        self.misses += 1
        return None

    def set(self, query: str, embedding: List[float], results: List[Dict[str, Any]]) -> None:
        """Store query embedding and search results with LRU eviction."""
        key = self._hash_query(query)
        if key in self._cache:
            self._cache.move_to_end(key)
        elif len(self._cache) >= self.capacity:
            self._cache.popitem(last=False)
            self.evictions += 1

        self._cache[key] = {
            "query": query,
            "embedding": embedding,
            "results": results,
            "timestamp": time.time()
        }

    def stats(self) -> Dict[str, Any]:
        """Retrieve telemetry metrics for cache performance."""
        total = self.hits + self.misses
        hit_rate = (self.hits / total) if total > 0 else 0.0
        return {
            "size": len(self._cache),
            "capacity": self.capacity,
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 4),
            "evictions": self.evictions
        }

    def clear(self) -> None:
        """Flushes the cache."""
        self._cache.clear()
        self.hits = 0
        self.misses = 0
        self.evictions = 0
