# TransitLens Platform

> **Streamlit dashboard for visualising and exporting AI-assisted exoplanet transit detections.**

TransitLens Platform is the front-end of the TransitLens system, built for the Bharatiya Antariksh Hackathon 2026 (PS7). It takes analysis results from `transitlens-ml-core` and presents them in a visually compelling, immediately understandable, and scientifically credible interface.

## Quick Start

```bash
git clone https://github.com/arachknight66/transitlens-platform.git
cd transitlens-platform
pip install -r requirements.txt
streamlit run main.py
```

The platform launches in offline demo mode by default — no other services required.

## Configuration

### Pointing to ml-core

Edit `config.yaml`:

```yaml
mlcore:
  base_url: "http://localhost:8000"
```

Start ml-core first:

```bash
cd ../transitlens-ml-core
uvicorn api.app:app --port 8000
```

Then run the platform:

```bash
streamlit run main.py
```

### Port conflicts

```bash
streamlit run main.py --server.port 8502
```

## Demo Mode

The platform includes a complete offline fallback. Pre-computed results in `demo_data/sample_results.json` allow the full demo experience to work without ml-core running. This ensures the hackathon demo never fails due to network issues.

When in fallback mode, the interface shows an orange indicator: "using cached results — offline mode".

## Architecture

```
transitlens-data-pipeline  →  transitlens-ml-core  →  transitlens-platform
       (feeds)                    (analyses)                (displays)
                                       ↑
                                  POST /analyze
                                  api_client.py
```

The platform's only connection to ml-core is `app/api_client.py`, which calls the `POST /analyze` endpoint.

## Pages

| Page | Purpose |
|------|---------|
| **Home** | Project identity, quick navigation, feature overview |
| **Demo** | One-click analysis of three synthetic cases (offline-safe) |
| **Upload** | User-provided CSV or TESS TIC ID analysis |
| **Results** | Full analysis display — class badge, parameters, plots, features, explanation |
| **About** | Methodology, architecture, team, PS7 context |

## Export Formats

- **HTML Evidence Pack** — Self-contained HTML file with all plots, features, and explanation. Opens offline in any browser.
- **CSV Results** — Flat CSV with all 18 scalar fields for batch analysis.
- **PDF Summary** — One-page summary (stretch goal, not yet implemented).

## Technology Stack

Python 3.10+, Streamlit, Plotly, Pandas, NumPy, Requests, Jinja2, PyYAML, Pillow

## Links

- [transitlens-ml-core](https://github.com/transitlens/transitlens-ml-core) — AI pipeline and FastAPI backend
- [transitlens-data-pipeline](https://github.com/transitlens/transitlens-data-pipeline) — Data generation and preprocessing

---

*Bharatiya Antariksh Hackathon 2026 · PS7 · Team TransitLens*
