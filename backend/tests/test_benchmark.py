import pytest
from backend.scripts.benchmark_concurrency import ConcurrencyBenchmark

def test_calculate_percentiles():
    # 100 sample latencies from 0.01s to 1.00s
    latencies = [i * 0.01 for i in range(1, 101)]

    p50 = ConcurrencyBenchmark.calculate_percentile(latencies, 50.0)
    p90 = ConcurrencyBenchmark.calculate_percentile(latencies, 90.0)
    p99 = ConcurrencyBenchmark.calculate_percentile(latencies, 99.0)

    assert abs(p50 - 0.50) <= 0.02
    assert abs(p90 - 0.90) <= 0.02
    assert abs(p99 - 0.99) <= 0.02

def test_aggregate_results():
    latencies = [0.05, 0.10, 0.15, 0.20]
    report = ConcurrencyBenchmark.aggregate_results(
        total_requests=5,
        latencies=latencies,
        failures=1,
        duration_seconds=2.0
    )

    assert report["total_requests"] == 5
    assert report["successes"] == 4
    assert report["failures"] == 1
    assert report["requests_per_second"] == 2.5
    assert report["latency"]["min_ms"] == 50.0
    assert report["latency"]["max_ms"] == 200.0
