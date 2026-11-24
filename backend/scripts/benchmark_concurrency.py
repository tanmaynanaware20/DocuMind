import time
import math
from typing import List, Dict, Any

class ConcurrencyBenchmark:
    """
    Performance telemetry and latency distribution benchmark.
    Measures throughput, error rates, and percentile distribution (p50, p90, p95, p99).
    """

    @staticmethod
    def calculate_percentile(latencies: List[float], percentile: float) -> float:
        """Calculates nearest-rank percentile for a list of latency samples."""
        if not latencies:
            return 0.0
        sorted_latencies = sorted(latencies)
        k = (len(sorted_latencies) - 1) * (percentile / 100.0)
        f = math.floor(k)
        c = math.ceil(k)
        if f == c:
            return sorted_latencies[int(k)]
        d0 = sorted_latencies[int(f)] * (c - k)
        d1 = sorted_latencies[int(c)] * (k - f)
        return round(d0 + d1, 4)

    @classmethod
    def aggregate_results(
        cls,
        total_requests: int,
        latencies: List[float],
        failures: int,
        duration_seconds: float
    ) -> Dict[str, Any]:
        """Compiles load test telemetry into an enterprise performance audit report."""
        successes = len(latencies)
        rps = round(total_requests / duration_seconds, 2) if duration_seconds > 0 else 0.0
        avg_latency = round(sum(latencies) / successes, 4) if successes > 0 else 0.0
        min_latency = round(min(latencies), 4) if successes > 0 else 0.0
        max_latency = round(max(latencies), 4) if successes > 0 else 0.0

        return {
            "total_requests": total_requests,
            "successes": successes,
            "failures": failures,
            "duration_seconds": round(duration_seconds, 3),
            "requests_per_second": rps,
            "latency": {
                "min_ms": round(min_latency * 1000, 2),
                "avg_ms": round(avg_latency * 1000, 2),
                "max_ms": round(max_latency * 1000, 2),
                "p50_ms": round(cls.calculate_percentile(latencies, 50.0) * 1000, 2),
                "p90_ms": round(cls.calculate_percentile(latencies, 90.0) * 1000, 2),
                "p95_ms": round(cls.calculate_percentile(latencies, 95.0) * 1000, 2),
                "p99_ms": round(cls.calculate_percentile(latencies, 99.0) * 1000, 2)
            }
        }
