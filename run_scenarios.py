#!/usr/bin/env python3
"""
run_scenarios.py — Execute Scenario A & B against the Globis Edge API.

This script:
1. Loads scenario JSON files
2. Calls the running API endpoints
3. Captures latency and response shape
4. Writes results to results/ dir for notebook integration

Usage:
    python run_scenarios.py --api-host http://127.0.0.1 --api-port 8080 --output results/
"""

import json
import sys
import time
import argparse
from pathlib import Path
from typing import Dict, Any, Optional
from datetime import datetime, timezone

try:
    import requests
except ImportError:
    print("ERROR: requests library not found. Install with: pip install requests")
    sys.exit(1)


def load_scenario(scenario_path: str) -> Dict[str, Any]:
    """Load a scenario JSON file."""
    with open(scenario_path, "r", encoding="utf-8") as f:
        return json.load(f)


def call_api_commit(
    api_base_url: str,
    payload: Dict[str, Any],
    timeout: int = 30,
) -> Dict[str, Any]:
    """
    Call the /commit endpoint.

    Returns a dict with:
    - status_code: HTTP status code
    - latency_ms: Round-trip time in milliseconds
    - response: JSON response body
    - error: Optional error message if request failed
    """
    start = time.time()
    try:
        response = requests.post(
            f"{api_base_url}/commit",
            json=payload,
            timeout=timeout,
        )
        latency_ms = (time.time() - start) * 1000

        return {
            "status_code": response.status_code,
            "latency_ms": round(latency_ms, 2),
            "response": response.json(),
            "error": None,
        }
    except requests.exceptions.RequestException as e:
        latency_ms = (time.time() - start) * 1000
        return {
            "status_code": None,
            "latency_ms": round(latency_ms, 2),
            "response": None,
            "error": str(e),
        }


def call_api_system_status(api_base_url: str) -> Dict[str, Any]:
    """Call the /system/status endpoint to verify API is running."""
    try:
        response = requests.get(f"{api_base_url}/system/status", timeout=5)
        return {
            "status_code": response.status_code,
            "response": response.json(),
            "error": None,
        }
    except requests.exceptions.RequestException as e:
        return {
            "status_code": None,
            "response": None,
            "error": str(e),
        }


def run_scenario_a(api_base_url: str, scenario: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run Scenario A: Hawa and the Reconstructed Dossier.

    Expected: Human review required (birth year conflict) → commit blocked.
    """
    print("\n" + "=" * 70)
    print("SCENARIO A: Hawa and the Reconstructed Dossier")
    print("=" * 70)

    payload = scenario["intake_payload_for_api"]
    print(f"\nSubmitting commit request for household: {payload['household_id']}")

    result = call_api_commit(api_base_url, payload)

    print(f"Status: {result['status_code']}")
    print(f"Latency: {result['latency_ms']} ms")
    if result["error"]:
        print(f"Error: {result['error']}")
    else:
        print(f"Response: {json.dumps(result['response'], indent=2)}")

    return {
        "scenario_id": scenario["scenario_id"],
        "scenario_name": scenario["scenario_name"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "api_call": {
            "endpoint": "/commit",
            "payload_household_id": payload["household_id"],
            "payload_session_id": payload["session_id"],
        },
        "result": result,
        "expected_outcome": scenario["expected_outcome"],
    }


def run_scenario_b(api_base_url: str, scenario: Dict[str, Any]) -> Dict[str, Any]:
    """
    Run Scenario B: Tobias and the Blocked Field.

    Expected: Ethnicity field blocked → commit forbidden with protection-concern chip.
    """
    print("\n" + "=" * 70)
    print("SCENARIO B: Tobias and the Blocked Field")
    print("=" * 70)

    payload = scenario["intake_payload_for_api"]
    print(f"\nSubmitting commit request for household: {payload['household_id']}")

    result = call_api_commit(api_base_url, payload)

    print(f"Status: {result['status_code']}")
    print(f"Latency: {result['latency_ms']} ms")
    if result["error"]:
        print(f"Error: {result['error']}")
    else:
        print(f"Response: {json.dumps(result['response'], indent=2)}")

    return {
        "scenario_id": scenario["scenario_id"],
        "scenario_name": scenario["scenario_name"],
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "api_call": {
            "endpoint": "/commit",
            "payload_household_id": payload["household_id"],
            "payload_session_id": payload["session_id"],
        },
        "result": result,
        "expected_outcome": scenario["expected_outcome"],
    }


def write_results(results: Dict[str, Any], output_dir: str) -> None:
    """Write results to output directory."""
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)

    # Write combined results
    combined_path = output_path / "scenarios_results.json"
    with open(combined_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    print(f"\n✓ Written combined results to: {combined_path}")

    # Write per-scenario results
    for scenario_id, scenario_result in results.get("scenarios", {}).items():
        scenario_path = output_path / f"{scenario_id}_result.json"
        with open(scenario_path, "w", encoding="utf-8") as f:
            json.dump(scenario_result, f, indent=2, ensure_ascii=False)
        print(f"✓ Written scenario result to: {scenario_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Run Globis Edge Scenario A & B against the API."
    )
    parser.add_argument(
        "--api-host",
        default="http://127.0.0.1",
        help="API host (default: http://127.0.0.1)",
    )
    parser.add_argument(
        "--api-port",
        type=int,
        default=80,
        help="API port (default: 80, nginx proxy)",
    )
    parser.add_argument(
        "--output-dir",
        default="results/",
        help="Output directory for results (default: results/)",
    )
    parser.add_argument(
        "--scenario-a-path",
        default="synthetic_cases/aisha/case_scenario_a.json",
        help="Path to Scenario A JSON",
    )
    parser.add_argument(
        "--scenario-b-path",
        default="synthetic_cases/yusuf/case_scenario_b.json",
        help="Path to Scenario B JSON",
    )

    args = parser.parse_args()

    api_base_url = f"{args.api_host}:{args.api_port}"

    print("=" * 70)
    print("GLOBIS EDGE 2.0 — SCENARIO RUNNER")
    print("=" * 70)
    print(f"\nAPI Base URL: {api_base_url}")
    print(f"Output Dir: {args.output_dir}")

    # Check API is running
    print("\nChecking API health...")
    health = call_api_system_status(api_base_url)
    if health["error"]:
        print(f"ERROR: Could not reach API: {health['error']}")
        print(f"  Is the API running on {api_base_url}?")
        sys.exit(1)
    print(f"✓ API is running: {health['response']}")

    # Load scenarios
    print(f"\nLoading scenarios...")
    try:
        scenario_a = load_scenario(args.scenario_a_path)
        print(f"✓ Loaded Scenario A: {scenario_a['scenario_name']}")

        scenario_b = load_scenario(args.scenario_b_path)
        print(f"✓ Loaded Scenario B: {scenario_b['scenario_name']}")
    except FileNotFoundError as e:
        print(f"ERROR: Could not load scenario file: {e}")
        sys.exit(1)

    # Run scenarios
    result_a = run_scenario_a(api_base_url, scenario_a)
    result_b = run_scenario_b(api_base_url, scenario_b)

    # Aggregate results
    combined_results = {
        "run_timestamp": datetime.now(timezone.utc).isoformat(),
        "api_base_url": api_base_url,
        "scenarios": {
            "scenario_a": result_a,
            "scenario_b": result_b,
        },
        "summary": {
            "scenario_a_status": result_a["result"]["status_code"],
            "scenario_a_latency_ms": result_a["result"]["latency_ms"],
            "scenario_b_status": result_b["result"]["status_code"],
            "scenario_b_latency_ms": result_b["result"]["latency_ms"],
        },
    }

    # Write results
    write_results(combined_results, args.output_dir)

    print("\n" + "=" * 70)
    print("SCENARIO RUN COMPLETE")
    print("=" * 70)


if __name__ == "__main__":
    main()
