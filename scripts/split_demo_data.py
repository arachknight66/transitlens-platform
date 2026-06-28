"""
One-time migration script.
Run from the transitlens-platform/ directory:
    python scripts/split_demo_data.py

Reads:
    demo_data/sample_results.json

Writes:
    demo_data/sample_metadata.json          (everything except plots, all candidates)
    demo_data/candidate_a_plots.json        (plots dict for candidate_a only)
    demo_data/candidate_b_plots.json
    demo_data/candidate_c_plots.json
"""
import json
import os

BASE = os.path.join(os.path.dirname(__file__), "..", "demo_data")

with open(os.path.join(BASE, "sample_results.json"), "r", encoding="utf-8") as f:
    all_results: dict = json.load(f)

metadata = {}
for tid, result in all_results.items():
    plots = result.pop("plots", {})
    metadata[tid] = result
    with open(os.path.join(BASE, f"{tid}_plots.json"), "w", encoding="utf-8") as pf:
        json.dump(plots, pf)

with open(os.path.join(BASE, "sample_metadata.json"), "w", encoding="utf-8") as mf:
    json.dump(metadata, mf, indent=2)

print(f"Written: sample_metadata.json + {len(all_results)} plot files")
