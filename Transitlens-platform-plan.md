# transitlens-platform — Phased Build Plan

> **Project:** TransitLens — Bharatiya Antariksh Hackathon 2026
> **Problem Statement:** PS7 — AI-enabled Detection of Exoplanets from Noisy Astronomical Light Curves
> **Repo Role:** Streamlit dashboard, API client, diagnostic plots, export engine, and the complete judge-facing demo experience
> **Document Type:** Engineering build plan — no code, phases only
> **Last Updated:** 2026

---

## Table of Contents

1. [Repo Purpose and Boundaries](#1-repo-purpose-and-boundaries)
2. [Folder Structure Reference](#2-folder-structure-reference)
3. [The Five Screens](#3-the-five-screens)
4. [Phase Overview](#4-phase-overview)
5. [Phase 1 — Project Foundation and Config](#5-phase-1--project-foundation-and-config)
6. [Phase 2 — API Client and State Management](#6-phase-2--api-client-and-state-management)
7. [Phase 3 — Demo Page and Offline Mode](#7-phase-3--demo-page-and-offline-mode)
8. [Phase 4 — Results Page and Core Components](#8-phase-4--results-page-and-core-components)
9. [Phase 5 — Remaining Pages](#9-phase-5--remaining-pages)
10. [Phase 6 — Export Engine](#10-phase-6--export-engine)
11. [Phase 7 — Upload Page and Real Data Path](#11-phase-7--upload-page-and-real-data-path)
12. [Phase 8 — Visual Polish and CSS](#12-phase-8--visual-polish-and-css)
13. [Phase 9 — Tests and Documentation](#13-phase-9--tests-and-documentation)
14. [Phase 10 — Stretch Goals](#14-phase-10--stretch-goals)
15. [File-by-File Responsibility Matrix](#15-file-by-file-responsibility-matrix)
16. [Component Specification Reference](#16-component-specification-reference)
17. [API Client Contract](#17-api-client-contract)
18. [Session State Reference](#18-session-state-reference)
19. [Export Format Specifications](#19-export-format-specifications)
20. [Dependencies and Install Plan](#20-dependencies-and-install-plan)
21. [Configuration Reference](#21-configuration-reference)
22. [Judge Demo Script](#22-judge-demo-script)
23. [Risk Register](#23-risk-register)
24. [Hackathon Priority Tiers](#24-hackathon-priority-tiers)
25. [Definition of Done](#25-definition-of-done)

---

## 1. Repo Purpose and Boundaries

### What this repo does

`transitlens-platform` is the **face** of the TransitLens system. It is the only repo that judges and users directly interact with. Its job is to take analysis results from `transitlens-ml-core` and present them in a way that is visually compelling, immediately understandable, and scientifically credible — all within 30 seconds of a judge walking up to the demo station.

It handles:

- A Streamlit multi-page dashboard with navigation between five screens
- An API client that calls ml-core's FastAPI endpoint and gracefully falls back to offline demo mode
- All diagnostic chart rendering (four interactive Plotly charts per analysis)
- A structured result display with confidence badge, parameter cards, feature table, and classification explanation
- An export engine producing a self-contained HTML evidence pack, a CSV, and optionally a PDF summary
- A complete offline demo path using pre-computed results — works even if ml-core is unreachable

### What this repo does NOT do

This repo must never:

- Run BLS detection, feature extraction, or classification logic
- Generate synthetic light curves or load TESS data directly
- Import from `transitlens-ml-core`'s `core/` modules
- Store analysis results in a database or file system beyond the current session
- Handle authentication, user accounts, or multi-tenancy

### The fundamental constraint: demo-first design

Every design decision in this repo must be evaluated against one question: "does this make the demo better?" The platform is not a general-purpose astronomy tool. It is a demonstration vehicle for one specific AI pipeline running on three specific synthetic cases. Every page, component, and interaction must serve that goal.

### Position in the tri-repo system

```
transitlens-data-pipeline  →  transitlens-ml-core  →  transitlens-platform
       (feeds)                    (analyses)                (displays)
                                       ↑
                                  POST /analyze
                                  api_client.py
```

The platform's only programmatic connection to the rest of the system is `app/api_client.py`, which calls ml-core's `POST /analyze` endpoint. Everything else is self-contained.

---

## 2. Folder Structure Reference

```
transitlens-platform/
│
├── main.py                               ← Streamlit entry point, page router, CSS injector
├── README.md
├── CONTRIBUTING.md
├── requirements.txt
├── .gitignore
├── config.yaml                           ← ml-core URL, demo mode flag, timeouts, UI settings
│
├── app/
│   ├── __init__.py
│   ├── api_client.py                     ← analyze() function, health check, fallback logic
│   ├── state.py                          ← session state wrapper (result, page, selection)
│   ├── utils.py                          ← formatting helpers, CSV parser, base64 decode
│   │
│   ├── pages/
│   │   ├── __init__.py
│   │   ├── home.py                       ← hero section, tagline, quick-start CTA
│   │   ├── demo.py                       ← three-button synthetic case selector
│   │   ├── upload.py                     ← CSV file uploader and TIC ID input
│   │   ├── results.py                    ← full result screen (the primary judge-facing page)
│   │   └── about.py                      ← methodology, architecture, team, PS7 context
│   │
│   └── components/
│       ├── __init__.py
│       ├── header.py                     ← TransitLens wordmark, nav links, connection status dot
│       ├── sidebar.py                    ← page navigation, settings, connection config
│       ├── result_card.py                ← class badge + confidence + target name row
│       ├── confidence_badge.py           ← coloured class pill with confidence percentage
│       ├── parameter_panel.py            ← four metric cards: period, depth, duration, SNR
│       ├── plot_raw.py                   ← raw light curve Plotly chart
│       ├── plot_cleaned.py               ← cleaned light curve with transit window overlays
│       ├── plot_periodogram.py           ← BLS power spectrum with peak annotation
│       ├── plot_phase_folded.py          ← phase-folded dip — the primary wow-moment plot
│       └── feature_table.py             ← 11-feature table with mini bar indicators
│
├── export/
│   ├── __init__.py
│   ├── html_report.py                    ← self-contained HTML evidence pack generator
│   ├── csv_export.py                     ← flat CSV of all result fields
│   ├── pdf_summary.py                    ← one-page PDF summary (stretch goal)
│   └── templates/
│       └── report.html.jinja             ← Jinja2 template for HTML evidence pack
│
├── static/
│   ├── logo.svg                          ← TransitLens wordmark SVG
│   ├── style.css                         ← custom Streamlit CSS overrides
│   └── favicon.ico
│
├── demo_data/
│   ├── candidate_a.csv                   ← exoplanet_like synthetic case (copy from data-pipeline)
│   ├── candidate_b.csv                   ← eclipsing_binary_like
│   ├── candidate_c.csv                   ← noise_or_other
│   ├── sample_results.json               ← pre-computed full result dicts for all three cases
│   └── README.md                         ← explains that these are copies, not the source
│
└── tests/
    ├── __init__.py
    ├── conftest.py
    ├── test_api_client.py
    ├── test_export.py
    ├── test_components.py
    └── test_pages.py
```

---

## 3. The Five Screens

The platform has exactly five pages. Each has a single, unambiguous purpose. No page does two things.

| Page | File | Purpose | Primary audience |
|------|------|---------|-----------------|
| Home | `pages/home.py` | First impression, project identity, quick navigation | Judges walking up cold |
| Demo | `pages/demo.py` | Offline-safe, one-click analysis of three synthetic cases | Judges during live demo |
| Upload | `pages/upload.py` | User-provided CSV or TESS TIC ID | Judges asking "can it handle real data?" |
| Results | `pages/results.py` | Full analysis display — the wow moment | Judges evaluating the output |
| About | `pages/about.py` | Methodology, architecture, team, PS7 context | Judges asking deeper technical questions |

Navigation between pages is handled by `main.py` reading `st.session_state.page` and calling the appropriate page render function. The sidebar (`components/sidebar.py`) sets `st.session_state.page` when a navigation link is clicked.

---

## 4. Phase Overview

| Phase | Name | Priority | Estimated Effort | Hackathon Tier |
|-------|------|----------|-----------------|----------------|
| 1 | Foundation and Config | Critical | 1 hour | Must-have |
| 2 | API Client and State | Critical | 1-2 hours | Must-have |
| 3 | Demo Page and Offline Mode | Critical | 2-3 hours | Must-have |
| 4 | Results Page and Core Components | Critical | 3-4 hours | Must-have |
| 5 | Remaining Pages | High | 2-3 hours | Should-have |
| 6 | Export Engine | High | 2-3 hours | Should-have |
| 7 | Upload Page and Real Data Path | Medium | 1-2 hours | Nice-to-have |
| 8 | Visual Polish and CSS | High | 1-2 hours | Should-have |
| 9 | Tests and Documentation | Medium | 1-2 hours | Should-have |
| 10 | Stretch Goals | Low | Open-ended | Future |

**Build order:** Phase 1 → 2 → 3 → 4 → 8 (partial) → 5 → 6 → 7 → 8 (complete) → 9 → 10

**Critical dependency:** `transitlens-ml-core` Tier 1 must be complete before Phase 2 can be tested with live data. However, Phases 1 through 4 can be built entirely using the offline fallback path — the demo_data/ pre-computed results allow building and testing the full platform without ml-core running.

**Parallel work opportunity:** While one team member builds Phases 1-4 of the platform using demo_data/, another can be completing ml-core Phases 1-5. Once both are done, connecting them requires only updating the ml-core URL in `config.yaml`.

---

## 5. Phase 1 — Project Foundation and Config

### Goal

Set up the Streamlit project structure, establish the routing pattern, inject custom CSS, and define all configuration. By the end of this phase, `streamlit run main.py` must launch without errors and show a blank page at minimum.

### Deliverables

- `main.py` — entry point, page router, CSS injector
- `config.yaml` — complete platform configuration
- `app/__init__.py`, `app/pages/__init__.py`, `app/components/__init__.py`
- `static/style.css` — base CSS skeleton
- `.gitignore` — excluding __pycache__, .streamlit/, *.pyc, demo_data/*.fits

### Step 1.1 — Design `main.py`

`main.py` is the only file Streamlit executes directly. It does exactly four things and nothing else:

**Task 1 — Streamlit page config:** Call `st.set_page_config()` as the very first Streamlit call (required by Streamlit — any other st call before this raises an error). Settings: `page_title="TransitLens"`, `page_icon="🔭"`, `layout="wide"`, `initial_sidebar_state="expanded"`.

**Task 2 — CSS injection:** Read `static/style.css` and inject it using `st.markdown(f"<style>{css}</style>", unsafe_allow_html=True)`. This must happen before any component renders.

**Task 3 — Session state initialisation:** Call `state.init()` (defined in `app/state.py`) to set up all session state keys with their defaults if they don't already exist. This ensures session state is always in a known state regardless of how the user navigated to the current page.

**Task 4 — Page routing:** Read `st.session_state.page` and call the corresponding page render function. Default page is `"home"`. The routing table maps string keys to callables: `{"home": home.render, "demo": demo.render, "upload": upload.render, "results": results.render, "about": about.render}`.

`main.py` must not contain any UI rendering logic. It is a pure router.

### Step 1.2 — Design `config.yaml`

```yaml
mlcore:
  base_url: "http://localhost:8000"
  timeout_seconds: 30
  health_check_timeout: 3
  demo_fallback: true          # fall back to demo_data/ if ml-core unreachable

demo:
  default_candidate: "a"
  show_raw_plot: true
  show_cleaned_plot: true
  show_periodogram: true
  show_phase_folded: true
  autorun_on_selection: true   # immediately run analysis when a candidate is selected

ui:
  theme: "dark"                # "dark" | "light"
  primary_color: "#534AB7"     # TransitLens purple
  confidence_colors:
    exoplanet_like: "#3C3489"
    eclipsing_binary_like: "#712B13"
    noise_or_other: "#444441"
  plot_height: 300
  result_card_border_radius: 8

export:
  html_enabled: true
  csv_enabled: true
  pdf_enabled: false           # stretch goal
  output_dir: "exports/"
  include_plots: true

platform:
  version: "0.1.0"
  repo_url: "https://github.com/transitlens/transitlens-platform"
```

### Step 1.3 — Establish `.streamlit/config.toml`

Streamlit's own config file must be created at `.streamlit/config.toml`. Key settings:

- `[server] headless = true` — required for production deployment
- `[browser] gatherUsageStats = false` — avoids telemetry prompts during demo
- `[theme] base = "dark"` — dark theme by default (space theme appropriate for an astronomy project)
- `[theme] primaryColor = "#534AB7"` — TransitLens purple for interactive elements

This file is separate from `config.yaml`. Streamlit reads `.streamlit/config.toml` automatically; `config.yaml` is our application config read by Python code.

### Phase 1 Completion Checklist

- [ ] `streamlit run main.py` launches without errors
- [ ] `.streamlit/config.toml` sets dark theme and TransitLens primary colour
- [ ] `config.yaml` has all sections with sensible defaults
- [ ] `app/__init__.py`, `app/pages/__init__.py`, `app/components/__init__.py` exist
- [ ] `static/style.css` exists (even if empty for now)
- [ ] `.gitignore` excludes `__pycache__/`, `.streamlit/`, `*.pyc`, `exports/`

---

## 6. Phase 2 — API Client and State Management

### Goal

Build the two foundational infrastructure files that everything else depends on: `api_client.py` (the bridge to ml-core) and `state.py` (the session state manager). These must be complete before any page can show real results.

### Deliverables

- `app/api_client.py` — analyze function with fallback
- `app/state.py` — session state manager
- `app/utils.py` — shared helpers
- `demo_data/sample_results.json` — pre-computed results for all three cases

### Step 2.1 — Design `app/api_client.py`

This file has one public function and one private helper:

**`health_check() → bool` (private)**

Calls `GET {base_url}/health` with a short timeout (`health_check_timeout` from config, default 3 seconds). Returns `True` if the response is HTTP 200 with `{"status": "ok"}`, `False` for any other outcome including timeout, connection refused, and non-200 status codes. Never raises an exception to the caller.

**`analyze(time, flux, target_id, metadata=None, config_override=None) → dict` (public)**

This is the only function the rest of the platform ever calls to get analysis results. Its behaviour:

Step 1 — If `demo_fallback` is enabled in config AND a pre-computed result exists in `demo_data/sample_results.json` for this `target_id`: check if ml-core is healthy first. If healthy, proceed to Step 2. If not healthy and fallback is enabled, load and return the pre-computed result immediately.

Step 2 — Build the request payload: `{"time": time.tolist(), "flux": flux.tolist(), "target_id": target_id, "metadata": metadata}`.

Step 3 — Send `POST {base_url}/analyze` with a timeout of `timeout_seconds` from config. If the request succeeds (HTTP 200), parse the JSON response and return it.

Step 4 — If the request fails for any reason (timeout, connection error, HTTP 4xx/5xx): if `demo_fallback` is enabled and a pre-computed result exists, return the pre-computed result and set `st.session_state.using_fallback = True`. If fallback is not available, raise `MLCoreUnavailableError` with a helpful message.

**Why the fallback is critical:** A live hackathon demo with a fragile network connection and an API that might crash is a disaster waiting to happen. The fallback ensures the demo always works — the platform can show the full result experience even if ml-core is completely offline. Judges don't need to know which path was taken.

**Fallback indication:** When the fallback path is used, `state.py` stores `using_fallback = True`. The header component shows a small warning indicator ("using cached results") rather than the green connected dot. This is honest but non-disruptive.

### Step 2.2 — Design `app/state.py`

Streamlit re-runs the entire script from top to bottom on every user interaction. Session state is the only way to persist data between these reruns.

`state.py` is a thin wrapper around `st.session_state` that:
1. Defines all keys and their defaults in one place
2. Provides typed getter/setter functions so the rest of the code never uses raw string keys
3. Initialises all keys in `init()` if they don't already exist (idempotent — safe to call on every rerun)

**The complete session state schema:**

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `page` | str | `"home"` | Current active page |
| `result` | dict or None | `None` | Most recent analysis result from api_client |
| `selected_candidate` | str or None | `None` | Which demo candidate was selected ("a", "b", "c") |
| `analysis_running` | bool | `False` | True while api_client.analyze() is in progress |
| `using_fallback` | bool | `False` | True if the current result came from demo_data fallback |
| `upload_filename` | str or None | `None` | Name of the user-uploaded file if any |
| `mlcore_connected` | bool | `False` | Last known health check result |
| `last_health_check` | float or None | `None` | Unix timestamp of last health check |
| `export_html_ready` | bool | `False` | True if HTML export has been generated for current result |
| `config` | dict | loaded from config.yaml | Platform configuration |

**Typed getters/setters pattern:**

Each key has a corresponding `get_X()` and `set_X()` function. This means the rest of the codebase never writes `st.session_state["result"]` — it writes `state.set_result(result_dict)`. This makes refactoring and testing much easier.

### Step 2.3 — Design `app/utils.py`

Shared utility functions used across pages and components. No state access, no Streamlit calls — pure functions only.

**`format_period(days: float) → str`** — formats a period value for display. Returns `"3.42 days"` for values ≥ 1.0, `"8.2 hours"` for values < 1.0 (converted to hours). This is the format used in the parameter panel.

**`format_depth(depth: float) → str`** — formats a transit depth. Returns `"1.3%"` (multiplied by 100, one decimal place).

**`format_duration(days: float) → str`** — formats a duration. Returns `"3.8 hours"` (converted from days).

**`format_confidence(conf: float) → str`** — returns `"88%"` (multiplied by 100, no decimal).

**`decode_plot(b64_string: str) → PIL.Image`** — decodes a base64 PNG string to a PIL Image object for display in Streamlit via `st.image()`.

**`load_csv(file_or_path) → tuple[np.ndarray, np.ndarray]`** — accepts either a file path string or a Streamlit UploadedFile object. Returns `(time_array, flux_array)` as numpy arrays. Validates that the CSV has `time` and `flux` columns. Raises `InvalidCSVError` if columns are missing or values are not numeric.

**`load_config(path="config.yaml") → dict`** — reads and parses config.yaml. Called once in `main.py` and stored in `state.config`.

**`class_display_name(class_str: str) → str`** — converts `"exoplanet_like"` to `"Exoplanet-like"`, `"eclipsing_binary_like"` to `"Eclipsing Binary-like"`, `"noise_or_other"` to `"Noise / Other"`.

**`class_emoji(class_str: str) → str`** — returns `"🪐"` for exoplanet_like, `"⭐"` for eclipsing_binary_like, `"📊"` for noise_or_other.

### Step 2.4 — Populate `demo_data/sample_results.json`

This file contains the pre-computed analysis results for all three synthetic cases. It is the backbone of the offline demo fallback.

Structure:
```
{
    "candidate_a": { ...full result dict from analyze_light_curve... },
    "candidate_b": { ...full result dict from analyze_light_curve... },
    "candidate_c": { ...full result dict from analyze_light_curve... }
}
```

**How to populate it:** Run `transitlens-ml-core`'s `pipeline.analyze_light_curve()` on each of the three synthetic cases and save the JSON output. This is done once during development, not at runtime. The file should be committed to the repo with actual base64-encoded plot strings so the entire demo experience works offline.

**File size note:** Each result dict contains four base64-encoded PNG plots. At 100 DPI, each plot is roughly 50-100KB encoded. Total file size: approximately 1-2MB. This is within git's comfortable file size range and should not be added to `.gitignore`.

### Phase 2 Completion Checklist

- [ ] `api_client.analyze("candidate_a")` returns a valid result dict (from fallback)
- [ ] `api_client.health_check()` returns `True` when ml-core is running and `False` when not
- [ ] Fallback correctly loads from `demo_data/sample_results.json` when ml-core is unreachable
- [ ] `state.init()` sets all session state keys without overwriting existing values
- [ ] `state.set_result()` and `state.get_result()` work correctly across reruns
- [ ] `utils.format_period(3.42)` returns `"3.42 days"`
- [ ] `utils.format_period(0.46)` returns `"11.0 hours"`
- [ ] `utils.load_csv()` correctly parses all three demo CSVs
- [ ] `sample_results.json` contains valid result dicts for all three candidates

---

## 7. Phase 3 — Demo Page and Offline Mode

### Goal

Build the demo page — the primary entry point for judges during the live presentation. This page must be completely functional in offline mode using `demo_data/`. A judge should be able to click a button and see a full result in under 5 seconds.

### Deliverables

- `app/pages/demo.py` — three-candidate selector with immediate analysis trigger
- `demo_data/` — populated with all three CSVs and pre-computed results

### Step 3.1 — Demo page layout and UX

The demo page has one job: let a judge select one of three candidates and immediately see the analysis run. It should feel fast, decisive, and visually clear.

**Page title and context:** A one-line header "Try TransitLens" and a two-line subtext: "Select a synthetic TESS-like light curve to analyse. Each case represents a different astrophysical signal type." This gives judges enough context without requiring them to read the About page first.

**The three candidate cards:**

Present each candidate as a large, clickable card (not a tiny radio button). Each card contains:

- A large emoji: 🪐 for A, ⭐ for B, 📊 for C
- The candidate name: "Candidate A", "Candidate B", "Candidate C"
- The expected class in smaller text: "Expected: exoplanet-like", "Expected: eclipsing binary-like", "Expected: noise"
- One sentence of physical description:
  - A: "A shallow 1.3% periodic dip every 3.42 days — consistent with a Jupiter-sized planet"
  - B: "A deep 18% V-shaped eclipse every 1.87 days — characteristic of an eclipsing stellar binary"
  - C: "No periodic signal — correlated red noise simulating stellar variability"
- The card border should highlight in the primary purple when hovered

Lay the three cards in a single row using `st.columns(3)`. Each card is a Streamlit `st.button()` styled to look like a card via CSS classes injected through `static/style.css`.

**Analysis trigger flow:**

When a candidate card is clicked:
1. `state.set_selected_candidate("a")` (or b or c)
2. `state.set_analysis_running(True)`
3. Show a progress indicator with descriptive step labels (see Step 3.2)
4. Load the CSV from `demo_data/candidate_{id}.csv` using `utils.load_csv()`
5. Call `api_client.analyze(time, flux, target_id=f"candidate_{id}")` — this either calls ml-core or returns the fallback result
6. `state.set_result(result)`
7. `state.set_analysis_running(False)`
8. `state.set_page("results")`
9. `st.rerun()` to navigate to the results page

The entire flow should complete in under 5 seconds for the fallback path (near-instant) and under 15 seconds for the live ml-core path.

### Step 3.2 — Progress indicator design

While the analysis runs, show a Streamlit progress bar and a series of status messages. This serves two purposes: it keeps the judge engaged during the wait, and it communicates what the system is actually doing (making the AI pipeline feel real rather than magical).

Status messages in sequence:
- "Loading light curve data..." (0-15%)
- "Preprocessing: removing outliers and detrending..." (15-30%)
- "Running BLS period search across 5,000+ period candidates..." (30-55%)
- "Extracting 11 diagnostic features from transit signal..." (55-70%)
- "Classifying signal type..." (70-85%)
- "Generating diagnostic plots..." (85-95%)
- "Building evidence pack..." (95-100%)

For the offline fallback path, all messages complete nearly instantly. For the live ml-core path, the first five stages happen inside ml-core and the platform has no visibility into progress — the progress bar advances on a simulated timer, then jumps to 100% when the API response arrives.

**Important UX note:** Never show a spinning indicator with no text. Judges who can read "Running BLS period search across 5,000+ period candidates" learn something about the system while waiting. This turns waiting time into science communication.

### Step 3.3 — Connection status display

At the top of the demo page, show a small status badge:
- Green dot + "ml-core connected — live analysis" when `state.mlcore_connected == True`
- Orange dot + "using cached results — offline mode" when `state.using_fallback == True`
- Grey dot + "ml-core not reachable — demo mode active" when `state.mlcore_connected == False`

The health check runs once per page load (not on every rerun — cache the result in session state with a 30-second TTL using `state.last_health_check`). This avoids spamming the ml-core server with health checks.

### Phase 3 Completion Checklist

- [ ] Three candidate cards display correctly in a single row
- [ ] Each card shows the correct emoji, name, expected class, and description
- [ ] Clicking any card triggers the analysis flow and navigates to results
- [ ] Progress bar shows all seven step messages in sequence
- [ ] Navigation to results page works after analysis completes
- [ ] Offline fallback loads from sample_results.json in under 1 second
- [ ] Connection status badge shows correctly for all three states (connected, fallback, disconnected)
- [ ] The entire demo flow from click to results display completes in under 5 seconds (fallback path)

---

## 8. Phase 4 — Results Page and Core Components

### Goal

Build the results page and all its component files. This is the highest-priority UI work in the entire repo. The results page is what judges evaluate. Every minute spent here has the highest return on demo quality.

### Deliverables

- `app/pages/results.py` — full result display
- `app/components/result_card.py`
- `app/components/confidence_badge.py`
- `app/components/parameter_panel.py`
- `app/components/plot_raw.py`
- `app/components/plot_cleaned.py`
- `app/components/plot_periodogram.py`
- `app/components/plot_phase_folded.py`
- `app/components/feature_table.py`

### Step 4.1 — Results page layout

The results page renders in this exact order top-to-bottom. The ordering is deliberate — it mirrors how a scientist would read a discovery report: identity → verdict → evidence → details → download.

**Section 1 — Result card (top of page)**

A full-width bar showing: target name on the left, class badge in the centre-left, confidence percentage on the right. This is the first thing a judge sees and must communicate the result in under 2 seconds.

Rendered by `result_card.py`. If `state.get_result()` is None, show a message asking the user to run an analysis first and provide a button to navigate to the demo page.

**Section 2 — Parameter panel**

Four metric cards in a row. Each card shows one key measurement. Uses `parameter_panel.py`.

Card 1 — Orbital Period: large number, "days" below it
Card 2 — Transit Depth: percentage, "flux drop" below it
Card 3 — Duration: hours, "per transit" below it
Card 4 — SNR: number, "sigma" below it

If `candidate_detected == false`, all four cards show "—" instead of values.

**Section 3 — Plot grid (2×2)**

The four Plotly charts arranged in a 2×2 grid using two rows of `st.columns(2)`. Top row: raw light curve (left), cleaned light curve (right). Bottom row: periodogram (left), phase-folded (right). Each chart fills its column. Uses the four plot component files.

**Section 4 — Explanation**

A styled text box (slight background tint, rounded corners, monospace-adjacent font) showing `result["explanation"]`. Title: "Classification Reasoning". This is what differentiates TransitLens from a black-box classifier — the system explains its reasoning in plain language.

**Section 5 — Two-column detail panel**

Left column: feature table (11 features with values and mini bar indicators). Right column: classification path (the sequence of rule checks that led to the verdict, with pass/fail indicators).

Left column uses `feature_table.py`. Right column is rendered directly in `results.py` using the result dict's feature values and the rule thresholds from config.

**Section 6 — Export buttons**

Three buttons in a row: "Download HTML Evidence Pack", "Download CSV Results", "Download PDF Summary". These call the export module and use Streamlit's `st.download_button()`. The PDF button is greyed out if `export.pdf_enabled == false` in config.

### Step 4.2 — `app/components/result_card.py`

**What it renders:** A horizontal bar with the target name, class badge, and confidence score.

**Visual requirements:**
- Target name: left-aligned, 18px, medium weight
- Class badge: coloured pill using the class-specific colour from `config.ui.confidence_colors`. Text is the display name + emoji. Examples: "🪐 Exoplanet-like", "⭐ Eclipsing Binary-like", "📊 Noise / Other"
- Confidence: right-aligned, large number, coloured to match the class badge

**Fallback indicator:** If `state.using_fallback == True`, show a small `(cached)` label in grey next to the target name.

### Step 4.3 — `app/components/confidence_badge.py`

A standalone component that can be used anywhere a class label needs to be displayed. Accepts `predicted_class` and `confidence` and renders a coloured pill.

Colour mapping:
- `exoplanet_like`: deep purple (#3C3489) background, white text
- `eclipsing_binary_like`: dark coral (#712B13) background, white text
- `noise_or_other`: dark grey (#444441) background, white text

The badge uses Streamlit's `st.markdown()` with inline HTML styling since Streamlit's native badge components don't support custom colours.

### Step 4.4 — `app/components/parameter_panel.py`

Four metric cards using Streamlit's `st.metric()` component. Each `st.metric()` call accepts a label, a value string, and an optional delta. For detected candidates, no delta is shown. For noise cases, the value is `"—"`.

The four metrics:
- `st.metric("Orbital Period", utils.format_period(result["period_days"]))`
- `st.metric("Transit Depth", utils.format_depth(result["depth"]))`
- `st.metric("Duration", utils.format_duration(result["duration_days"]))`
- `st.metric("SNR", f'{result["snr"]:.1f}σ' if result["snr"] else "—")`

### Step 4.5 — `app/components/plot_phase_folded.py` — the most important component

The phase-folded plot is the single most important visual in the entire project. When a judge sees a clean, symmetric dip at phase zero — that is the moment they believe the AI found something real.

**Data source:** The plot is generated from the base64 PNG string in `result["plots"]["phase_folded"]`. Decode it using `utils.decode_plot()` and display using `st.image()`.

**Alternative interactive version (if time allows):** Instead of displaying the pre-rendered PNG from ml-core, re-render the plot interactively using Plotly in the platform. This requires the platform to re-compute the phase-folded light curve locally using the detected period from the result dict and the original light curve CSV. Advantages: interactive zooming, hovering on data points, ability to change the period and see the plot update in real time. This is a stretch goal within Phase 4.

**Minimum viable version (required):** Display the pre-rendered PNG from `result["plots"]["phase_folded"]` using `st.image()` with `use_container_width=True`. Add a caption: `f"Phase-folded at P = {result['period_days']:.4f} days"`.

### Step 4.6 — `app/components/feature_table.py`

A two-column table showing all 11 features. Each row: feature name (left), value + mini bar indicator (right).

The mini bar indicator is a horizontal coloured bar whose width is proportional to the feature value normalised to its expected range. This gives a judge an immediate visual sense of whether a feature value is high or low without needing to understand the units.

Bar colour:
- Features where high value → exoplanet: green bar
- Features where high value → eclipsing binary: coral bar
- Features where high value → noise: grey bar

Specific bar colours per feature:

| Feature | High value means | Bar colour |
|---------|-----------------|------------|
| bls_power | Strong detection | Green |
| snr | Strong detection | Green |
| depth | High = EB-like | Coral if > 0.05, Green if < 0.05 |
| odd_even_depth_delta | High = EB-like | Coral |
| v_shape_score | High = EB-like | Coral |
| transit_count | More data = more reliable | Neutral blue |
| local_noise | High = noisy data | Grey |
| depth_to_noise_ratio | High = good detection | Green |
| phase_shape_kurtosis | Context-dependent | Neutral blue |
| period_days | Not directional | Neutral blue |
| duration_days | Not directional | Neutral blue |

### Step 4.7 — The four plot components

All four plot components follow the same pattern:

1. Extract the base64 PNG string from `result["plots"][plot_key]`
2. Decode to PIL Image using `utils.decode_plot()`
3. Display using `st.image(image, use_container_width=True, caption="...")`
4. Optionally wrap in an `st.expander()` if screen space is tight

Each component accepts the full result dict and a title string. It handles the case where the plot key is missing (result from an older ml-core version) by showing a placeholder.

### Phase 4 Completion Checklist

- [ ] Results page renders without errors for all three sample result dicts
- [ ] Result card shows correct class badge colour for each of the three classes
- [ ] Parameter panel shows correct values for candidate_a and shows "—" for candidate_c
- [ ] All four plots render as images for all three candidates
- [ ] Phase-folded plot caption shows the correct period
- [ ] Explanation text box shows the full explanation string
- [ ] Feature table shows all 11 features with correct values
- [ ] Classification path panel shows pass/fail for each rule check
- [ ] Export buttons are present (functionality in Phase 6)
- [ ] Results page shows a helpful message when no result is in session state
- [ ] Clicking the message navigates to the demo page

---

## 9. Phase 5 — Remaining Pages

### Goal

Build the home, about, and navigation infrastructure. These pages support the demo but are not the demo itself.

### Deliverables

- `app/pages/home.py`
- `app/pages/about.py`
- `app/components/header.py`
- `app/components/sidebar.py`

### Step 5.1 — `app/pages/home.py`

The home page is the first thing a judge sees if they open the platform without being guided. It must communicate the project in under 10 seconds.

**Page structure:**

Hero section (full width):
- TransitLens logo (from static/logo.svg, displayed with st.image)
- Tagline: "AI-assisted exoplanet transit detection from TESS light curves"
- Subtagline: "Detect · Classify · Explain · Export"
- One large CTA button: "Try the Demo →" that sets `state.page = "demo"` and triggers `st.rerun()`

Three-column feature overview below the hero:

Column 1 — Science:
- Icon: 🔭
- Title: "BLS Transit Detection"
- Body: "Box Least Squares period search across thousands of candidate periods to find periodic dips in stellar brightness."

Column 2 — AI:
- Icon: 🤖
- Title: "Interpretable Classification"
- Body: "Rule-based + optional ML classifier distinguishes exoplanet transits, eclipsing binaries, and noise with confidence scoring."

Column 3 — Evidence:
- Icon: 📋
- Title: "Full Evidence Pack"
- Body: "Every detection comes with four diagnostic plots, 11 extracted features, and a plain-language explanation. Downloadable as HTML, CSV, or PDF."

Three-column statistics row below the features:
- "3 target classes" | "11 extracted features" | "4 diagnostic plots per analysis"

Footer note: "Bharatiya Antariksh Hackathon 2026 · PS7 · Team TransitLens"

### Step 5.2 — `app/pages/about.py`

The about page serves judges who want technical depth. It must be readable, not exhaustive.

**Page sections:**

**What is PS7?** — A brief explanation of the problem statement in plain language. One paragraph. End with: "TransitLens tackles PS7 by building a complete AI-assisted pipeline from raw TESS light curves to classified, explainable detections."

**System Architecture** — A visual diagram (SVG or markdown table showing the three repos and their connections). Alternatively, display the tri-repo diagram as a static image stored in `static/`.

**The Science** — Three paragraphs: (1) what a transit light curve is and why it matters, (2) how BLS works in one paragraph, (3) what makes exoplanet transits different from eclipsing binaries.

**The AI Pipeline** — A numbered list of the seven pipeline stages with one sentence each. Keep it to bullet points — judges who want more detail can look at the ml-core README.

**Performance** — A small table showing the evaluation results on synthetic data: all three cases classified correctly, period recovery within 1%, processing time under 5 seconds.

**Technology Stack** — A concise list: Python 3.10+, NumPy/SciPy, Astropy (BLS), scikit-learn (RF), Matplotlib (plots), FastAPI (API), Streamlit (UI), Plotly (interactive charts).

**Team** — Team member names if applicable.

### Step 5.3 — `app/components/sidebar.py`

The sidebar appears on every page. It contains:

**Navigation section:**
- 🏠 Home
- 🔭 Demo (highlighted if current page)
- 📤 Upload
- 📊 Results (highlighted if a result is in session state)
- ℹ️ About

Each is a `st.sidebar.button()` that sets `state.page` and calls `st.rerun()`.

**Connection status section (below navigation):**
- Label: "ml-core status"
- Status indicator: same green/orange/grey dot logic as the demo page
- The ml-core URL from config, shown in small grey text

**Current result summary section (if result exists):**
- Shows a mini result card: target name, class badge, confidence
- Button: "View Full Results →" that navigates to results page

### Step 5.4 — `app/components/header.py`

A page header that appears at the top of every page. Contains:

- TransitLens wordmark in the top left (using CSS text styling, not an image, for performance)
- Current page breadcrumb: "TransitLens / Demo", "TransitLens / Results", etc.
- Connection status dot in the top right (same logic as sidebar)

The header is called at the top of every page's `render()` function before any page-specific content.

### Phase 5 Completion Checklist

- [ ] Home page displays hero, three feature columns, and statistics row without errors
- [ ] CTA button navigates to demo page correctly
- [ ] About page renders all six sections
- [ ] Sidebar navigation works for all five pages
- [ ] Sidebar shows mini result card when a result is in session state
- [ ] Header renders correctly on all five pages
- [ ] Active page is highlighted in the sidebar navigation

---

## 10. Phase 6 — Export Engine

### Goal

Build the export module that generates downloadable artefacts from the analysis result. The HTML evidence pack is the priority — it is a key "take-away" artefact that judges can examine offline after the hackathon.

### Deliverables

- `export/html_report.py` — self-contained HTML generator
- `export/csv_export.py` — flat CSV generator
- `export/templates/report.html.jinja` — HTML template
- Integration with results page download buttons

### Step 6.1 — HTML evidence pack (`export/html_report.py`)

**Goal:** A single, self-contained `.html` file that a judge can open on their laptop with no internet connection and no external dependencies. It must look professional — not like a raw data dump.

**What it must contain:**

1. TransitLens header with logo text, version, and generation timestamp
2. Result summary: target ID, class badge, confidence, period, depth, duration, SNR
3. All four diagnostic plots embedded as inline base64 images (`<img src="data:image/png;base64,...">`)
4. Classification explanation text
5. Feature table with all 11 features
6. Classification path (which rules fired)
7. Footer: "Generated by TransitLens · Bharatiya Antariksh Hackathon 2026"

**Template design (`export/templates/report.html.jinja`):**

Use Jinja2 templating. The template file contains the HTML structure with `{{ variable }}` placeholders for all dynamic content. `html_report.py` loads the template using Jinja2's `Environment(loader=FileSystemLoader(...))`, renders it with the result dict, and returns the rendered HTML string as bytes.

**Styling inside the template:** Include all CSS inline in a `<style>` block at the top of the HTML `<head>`. No external stylesheet references — the file must be fully self-contained. Use a clean, scientific report aesthetic: white background, dark text, monospace font for numbers, a thin header bar in TransitLens purple.

**Colour coding:** The class badge in the HTML report uses the same colour scheme as the dashboard: purple for exoplanet_like, coral for eclipsing_binary_like, grey for noise_or_other.

**`generate_html(result: dict) → bytes` function:**

Accepts the full result dict. Loads and renders the Jinja2 template. Returns the rendered HTML as UTF-8 encoded bytes. This is passed directly to Streamlit's `st.download_button(data=bytes, file_name="transitlens_report.html", mime="text/html")`.

### Step 6.2 — CSV export (`export/csv_export.py`)

**Goal:** A flat CSV file containing all scalar fields from the result dict, one result per row. Useful for batch analysis or importing into other tools.

**CSV columns:**

`target_id, candidate_detected, predicted_class, confidence, period_days, duration_days, depth, snr, transit_count, bls_power, odd_even_depth_delta, v_shape_score, local_noise, depth_to_noise_ratio, phase_shape_kurtosis, explanation, processing_time_ms, pipeline_version`

Note: the `plots` dict and `features` sub-dict are flattened into top-level columns. The plot base64 strings are NOT included in the CSV (they would make the file enormous and unreadable).

**`generate_csv(result: dict) → bytes` function:**

Accepts the full result dict. Flattens nested fields. Returns CSV as UTF-8 bytes using `io.StringIO` and `csv.writer`. Passed to `st.download_button(data=bytes, file_name="transitlens_result.csv", mime="text/csv")`.

### Step 6.3 — Integration with results page

The three download buttons in the results page call:

- HTML button: `export.html_report.generate_html(state.get_result())`
- CSV button: `export.csv_export.generate_csv(state.get_result())`
- PDF button: disabled if `config.export.pdf_enabled == false`

Use Streamlit's `st.download_button()` rather than showing a link. This triggers a native browser download dialogue — cleaner UX than opening a new tab.

**Button state:** Only enable the download buttons when `state.get_result() is not None`. Grey them out with a tooltip "Run an analysis first" when no result is available.

### Phase 6 Completion Checklist

- [ ] `generate_html(result)` returns a non-empty bytes object for all three sample results
- [ ] Generated HTML opens correctly in a browser with no external resources
- [ ] All four plots appear as inline images in the HTML report
- [ ] HTML report shows correct class badge colour
- [ ] `generate_csv(result)` returns a valid CSV with all expected column names
- [ ] CSV has the correct values for candidate_a
- [ ] Download buttons in results page trigger a browser download
- [ ] Download buttons are disabled when no result is in session state
- [ ] Jinja2 template renders without errors when any of the nullable fields are None

---

## 11. Phase 7 — Upload Page and Real Data Path

### Goal

Allow users to upload their own CSV file or enter a TESS TIC ID for analysis. This is the "can it handle real data?" answer for judges.

### Deliverables

- `app/pages/upload.py` — complete upload interface

### Step 7.1 — Upload page layout

The upload page has two input modes presented as tabs: "Upload CSV" and "TESS Target".

**Tab 1 — Upload CSV:**

- A `st.file_uploader()` accepting `.csv` files
- Instructions: "Your CSV must have 'time' and 'flux' columns. Time in BTJD, flux normalised to ~1.0."
- An optional text input for a custom target name
- A "Analyse" button that triggers the same flow as the demo page

**Validation before running analysis:**
- Check that the file has `time` and `flux` columns using `utils.load_csv()`
- Check that the arrays have at least 500 points
- Check that the flux is approximately normalised (median between 0.8 and 1.2)
- If validation fails: show a red error message with the specific problem and do not proceed

**Tab 2 — TESS Target:**

- A text input for a TIC ID: "Enter TIC ID (e.g., 25155310)"
- A note: "Requires internet connection. Fetches PDC-SAP flux from MAST via ml-core."
- Three pre-filled quick-select buttons for the three recommended TIC IDs:
  - "TIC 25155310 — WASP-126b (Period: 3.29d)"
  - "TIC 279741377 — TOI-270b (Period: 3.36d)"
  - "TIC 149603524 — LHS 3844b (Period: 0.46d)"
- An "Analyse" button

**TIC ID flow:** Call a dedicated endpoint `GET /demo/tess/{tic_id}` on ml-core (to be implemented in ml-core Phase 7 stretch). If this endpoint is not available, show an informative error: "Real TESS data requires ml-core with TESS support enabled. Use the Demo page for offline analysis."

### Step 7.2 — Error handling in the upload page

The upload page must handle all failure modes gracefully — do not let the demo crash because a user uploaded a malformed CSV.

Error cases and their messages:

| Error condition | User-facing message |
|----------------|---------------------|
| No 'time' column | "CSV must have a 'time' column with BTJD timestamps" |
| No 'flux' column | "CSV must have a 'flux' column with normalised flux values" |
| Fewer than 500 rows | "Light curve must have at least 500 data points for BLS analysis" |
| Flux median not near 1.0 | "Flux values appear unnormalised. Please divide by the median baseline before uploading." |
| ml-core timeout | "Analysis timed out. Try the Demo page for pre-computed results." |
| ml-core error | "ml-core returned an error: {error message}. Try the Demo page for guaranteed results." |

### Phase 7 Completion Checklist

- [ ] Upload CSV tab shows file uploader and analyse button
- [ ] TESS Target tab shows TIC ID input and three quick-select buttons
- [ ] Uploading candidate_a.csv from demo_data/ produces a correct analysis result
- [ ] Uploading a CSV with wrong column names shows a specific error message
- [ ] Uploading a CSV with fewer than 500 rows shows a specific error message
- [ ] Analysis result from upload navigates to results page correctly

---

## 12. Phase 8 — Visual Polish and CSS

### Goal

Make the platform look production-grade rather than default-Streamlit. Judges evaluate visual quality as a proxy for engineering quality. A polished interface signals that the team cares about the product, not just the algorithm.

### Deliverables

- `static/style.css` — complete CSS override file
- `static/logo.svg` — TransitLens wordmark

### Step 8.1 — Streamlit CSS override strategy

Streamlit's default styling is serviceable but generic. Custom CSS injected via `st.markdown("<style>...</style>")` overrides Streamlit's styles. Key elements to customise:

**Page background:** Streamlit dark theme gives a near-black background (#0E1117). Keep this for the astronomy theme — looking at light curve data on a dark background is visually correct and pleasant.

**Primary colour:** Override Streamlit's default red/orange interactive colour with TransitLens purple (#534AB7). This affects button hover states, slider handles, and checkbox ticks.

**Metric cards (parameter panel):** Add a subtle background tint (`background: rgba(83, 74, 183, 0.08)`) and rounded corners (`border-radius: 8px`) to the four metric cards to give them a card appearance. Streamlit's default metric display has no background.

**Demo candidate cards:** The three candidate selector buttons need to look like cards, not form buttons. Use CSS to increase padding, add a border, add a hover effect (border colour change to primary purple), and increase font size. Target Streamlit's button class.

**Progress bar:** Streamlit's progress bar uses the theme primary colour automatically. No override needed.

**Feature table:** Style as a clean data table with alternating row backgrounds, no outer border, and a subtle header row. Use `st.dataframe()` CSS overrides or render the table as HTML.

**Download buttons:** Style differently from navigation buttons — use a secondary colour (darker purple, outlined style) to distinguish them from action buttons.

**Plot containers:** Add a subtle background tint and padding around each plot to give them a "card" appearance and visual separation from the surrounding content.

### Step 8.2 — Typography

Streamlit uses system fonts by default. For the astronomy theme, keep system fonts but increase size and weight selectively:

- Page title: 24px, weight 600
- Section headers: 16px, weight 500
- Body text: 14px, weight 400
- Feature table values: 13px, monospace (`font-family: 'Courier New', monospace`)
- Confidence percentage in result card: 28px, weight 600, coloured to match class

### Step 8.3 — TransitLens logo SVG

Create a simple text-based SVG logo. Design: the word "TransitLens" in a clean sans-serif font, with a small stylised transit dip curve (a horizontal line with a small V-notch) as a graphical element to the left of the text.

The logo SVG is used in:
- `pages/home.py` hero section (large version)
- `components/header.py` (small version)
- `export/templates/report.html.jinja` (medium version as inline SVG)

Keep the logo simple enough to be readable at all three sizes.

### Step 8.4 — Dark theme considerations for astronomy

Dark themes are not just aesthetic for astronomy applications — they are practical. Astronomers read data on dark backgrounds because:
- It reduces eye strain during long observation sessions
- High-contrast white plots on dark backgrounds are easier to read
- The colour scheme aligns with the visual culture of the field

The Matplotlib plots generated by ml-core should use `"seaborn-v0_8-dark"` or a custom dark style to match the platform's dark background. This ensures plots do not look jarring — white-background plots embedded in a dark UI look amateurish.

If ml-core's plots use a light background, add a CSS filter to the plot images in the platform: `filter: invert(5%) brightness(0.95)` to soften the contrast mismatch without fully inverting the image colours.

### Phase 8 Completion Checklist

- [ ] Platform uses dark theme with TransitLens purple as primary colour
- [ ] Demo candidate cards look like cards with hover effects
- [ ] Parameter panel metric cards have background tint and rounded corners
- [ ] Feature table has clean styling with alternating row colours
- [ ] Plot images have card-like container styling
- [ ] Download buttons are visually distinct from navigation buttons
- [ ] TransitLens wordmark SVG is complete and readable at all three sizes
- [ ] No unstyled default Streamlit orange/red interactive elements visible

---

## 13. Phase 9 — Tests and Documentation

### Goal

Write a test suite and complete all documentation. This phase distinguishes a credible submission from a prototype.

### Step 9.1 — `tests/conftest.py`

Shared pytest fixtures:

- `sample_result_a`: loaded from `demo_data/sample_results.json` for candidate_a
- `sample_result_b`: loaded from `demo_data/sample_results.json` for candidate_b
- `sample_result_c`: loaded from `demo_data/sample_results.json` for candidate_c
- `mock_api_client`: a mock version of `api_client.analyze()` that returns sample_result_a without network access
- `candidate_a_csv_path`: path to `demo_data/candidate_a.csv`

### Step 9.2 — `tests/test_api_client.py`

- `analyze()` with `target_id="candidate_a"` returns a dict with all required keys
- `health_check()` returns `False` when given an unreachable URL
- `health_check()` returns `True` when ml-core is running (skip if ml-core not available: `pytest.mark.skipif`)
- Fallback correctly loads from `sample_results.json` when ml-core is unreachable
- `analyze()` raises `MLCoreUnavailableError` when ml-core unreachable and fallback disabled

### Step 9.3 — `tests/test_export.py`

- `generate_html(sample_result_a)` returns a non-empty bytes object
- Generated HTML contains the string "exoplanet_like" (class label present)
- Generated HTML contains "data:image/png;base64" (plots are embedded)
- Generated HTML opens without errors (parse with `html.parser`)
- `generate_csv(sample_result_a)` returns a bytes object that parses as valid CSV
- CSV has all expected column names
- CSV has exactly one data row

### Step 9.4 — `tests/test_components.py`

Use `unittest.mock` to mock `st` calls. Test that:
- `confidence_badge.render("exoplanet_like", 0.88)` calls `st.markdown` with HTML containing "#3C3489"
- `utils.format_period(3.42)` returns `"3.42 days"`
- `utils.format_period(0.46)` returns `"11.0 hours"`
- `utils.format_depth(0.013)` returns `"1.3%"`
- `utils.load_csv(candidate_a_csv_path)` returns two numpy arrays of equal length

### Step 9.5 — Complete `README.md`

The `README.md` must contain:

1. **One-sentence description:** "TransitLens Platform — Streamlit dashboard for visualising and exporting AI-assisted exoplanet transit detections."
2. **Quick start:** How to install and run in under 4 commands
3. **Configuration:** How to point the platform at a running ml-core instance
4. **Demo mode:** Explanation of the offline fallback and how to pre-populate sample_results.json
5. **Architecture diagram:** ASCII diagram of the tri-repo system
6. **Page descriptions:** One sentence per page
7. **Export formats:** What HTML, CSV, and PDF exports contain
8. **Links:** To the other two repos

**Quick start section:**

```
git clone https://github.com/transitlens/transitlens-platform
cd transitlens-platform
pip install -r requirements.txt
streamlit run main.py
```

**Connecting to ml-core:**

```
Edit config.yaml:
  mlcore:
    base_url: "http://localhost:8000"

Start ml-core first:
  cd ../transitlens-ml-core
  uvicorn api.app:app --port 8000

Then run the platform:
  streamlit run main.py
```

### Phase 9 Completion Checklist

- [ ] `pytest tests/` runs with zero failures
- [ ] All three test files have at least 5 tests each
- [ ] `test_api_client.py` tests the fallback path without network access
- [ ] `test_export.py` validates HTML and CSV outputs
- [ ] `README.md` quick-start works in under 4 commands on a fresh machine
- [ ] `CONTRIBUTING.md` explains how to add a new page and how to add a new export format
- [ ] `demo_data/README.md` explains what the files are and how to regenerate sample_results.json

---

## 14. Phase 10 — Stretch Goals

Post-hackathon enhancements that significantly increase platform quality and demo impact.

### 10.1 — Interactive Plotly re-rendering in the platform

Instead of displaying the pre-rendered PNG plots from ml-core, re-render them interactively using Plotly in the platform. Advantages:
- Judges can zoom, pan, and hover on data points
- The period in the phase-folded plot can be adjusted with a slider and the plot updates in real time
- The transit window shading updates dynamically

This requires the platform to load the original light curve CSV alongside the result dict and perform the phase-folding locally using the detected period.

### 10.2 — Period slider on phase-folded plot

A `st.slider()` component below the phase-folded plot that allows adjusting the folding period ±50% around the detected value. As the slider moves, the phase-folded plot regenerates. This is a compelling interactive demonstration that:
- Shows how the dip sharpens at the correct period
- Teaches judges what phase-folding means visually
- Demonstrates that the AI found the uniquely correct period

### 10.3 — Side-by-side comparison view

A new page (or tab within the results page) that shows all three demo candidates simultaneously in a compact grid. Each candidate's phase-folded plot and key metrics appear in one column. This allows a judge to see the contrast between all three signal types at a glance.

### 10.4 — Real-time TESS data integration

Full integration of the upload page's TIC ID path with ml-core's real TESS support. When a judge enters a TIC ID and clicks "Analyse", the platform shows a progress bar while ml-core fetches the data from MAST and runs the analysis. The result should include the actual detected period for comparison against published values.

### 10.5 — Animation of the transit signal

An animated SVG or Plotly animation showing a planet crossing in front of a star (top panel) while the light curve dips in real time (bottom panel). Purely illustrative — not based on the analysis result — but extremely effective for explaining to non-experts what a transit is. Placed on the home page or about page.

### 10.6 — Batch analysis mode

Allow uploading multiple CSVs as a ZIP file. The platform analyses each one and shows a results table with all candidates. A judge can click any row to see the full result. This demonstrates the scalability of the pipeline.

---

## 15. File-by-File Responsibility Matrix

| File | Owned by | Input | Output | Used by |
|------|----------|-------|--------|---------|
| `main.py` | platform root | — | Streamlit app | uvicorn / streamlit run |
| `config.yaml` | platform config | — | configuration dict | state.py, all pages |
| `app/api_client.py` | platform infra | time[], flux[], target_id | result dict | all pages |
| `app/state.py` | platform infra | — | session state access | all pages, components |
| `app/utils.py` | platform infra | raw values | formatted strings, arrays | all pages, components, export |
| `app/pages/home.py` | platform pages | state | Streamlit render | main.py |
| `app/pages/demo.py` | platform pages | state, demo_data | Streamlit render + api_client call | main.py |
| `app/pages/upload.py` | platform pages | state, user file | Streamlit render + api_client call | main.py |
| `app/pages/results.py` | platform pages | state.result | Streamlit render using all components | main.py |
| `app/pages/about.py` | platform pages | state | Streamlit render | main.py |
| `app/components/header.py` | platform components | state | Streamlit render | all pages |
| `app/components/sidebar.py` | platform components | state | Streamlit render | all pages |
| `app/components/result_card.py` | platform components | result dict | Streamlit render | results.py |
| `app/components/confidence_badge.py` | platform components | class, confidence | Streamlit render | result_card, sidebar |
| `app/components/parameter_panel.py` | platform components | result dict | Streamlit render | results.py |
| `app/components/plot_*.py` (x4) | platform components | result dict | Streamlit render | results.py |
| `app/components/feature_table.py` | platform components | result dict | Streamlit render | results.py |
| `export/html_report.py` | platform export | result dict | HTML bytes | results.py download button |
| `export/csv_export.py` | platform export | result dict | CSV bytes | results.py download button |
| `export/pdf_summary.py` | platform export | result dict | PDF bytes | results.py download button |
| `export/templates/report.html.jinja` | platform export | — | Jinja2 template | html_report.py |
| `static/style.css` | platform static | — | CSS string | main.py |
| `static/logo.svg` | platform static | — | SVG markup | home.py, header.py |
| `demo_data/*.csv` | platform data | — | CSV files | demo.py, api_client.py |
| `demo_data/sample_results.json` | platform data | — | pre-computed results | api_client.py fallback |
| `tests/` | platform tests | fixtures | pass/fail | pytest |

---

## 16. Component Specification Reference

### Component interface convention

Every component in `app/components/` follows the same interface pattern:

- One public function named `render(result=None, **kwargs)`
- If the component requires data from the result dict, it accepts the full dict and extracts what it needs internally
- Components never modify session state — they only read it via `state.get_*()` functions
- Components never call `api_client` — they only display data already in session state
- Components never navigate — navigation is handled by pages

### Component size and placement

All components are designed for Streamlit's `layout="wide"` mode. They assume a viewport width of approximately 1200-1400 pixels (laptop screen during presentation). Components that render inside `st.columns()` must be designed to work at ~400-600px width.

---

## 17. API Client Contract

### What the platform sends to ml-core

```
POST /analyze
Content-Type: application/json

{
    "time":      [float, ...],       # list of BTJD timestamps
    "flux":      [float, ...],       # list of normalised flux values
    "target_id": "candidate_a",     # string identifier
    "metadata":  null | { ... },    # optional metadata from data-pipeline
    "config":    null | { ... }     # optional override
}
```

### What the platform expects back

The full result dict as specified in `transitlens-ml-core-PLAN.md` Section 3.

### Timeout strategy

- Health check: 3 second timeout, no retry
- Analysis request: 30 second timeout, 1 retry on timeout (not on HTTP error)
- If both attempts timeout: fall back to demo_data if available, otherwise raise error

### Status codes the platform handles

| Status | Meaning | Platform action |
|--------|---------|----------------|
| 200 | Success | Parse JSON, store in session state |
| 422 | Validation error (bad input) | Show specific validation error message |
| 500 | ml-core internal error | Show error, offer to use demo mode |
| Timeout | Network issue | Retry once, then fall back to demo_data |
| Connection refused | ml-core not running | Fall back to demo_data immediately |

---

## 18. Session State Reference

### Complete session state schema

| Key | Type | Default | Set by | Read by |
|-----|------|---------|--------|---------|
| `page` | str | `"home"` | sidebar, any page nav | main.py router |
| `result` | dict or None | None | api_client (via demo/upload pages) | results.py, sidebar |
| `selected_candidate` | str or None | None | demo.py | demo.py, sidebar |
| `analysis_running` | bool | False | demo.py, upload.py | demo.py, upload.py (progress bar) |
| `using_fallback` | bool | False | api_client.py | header.py, sidebar.py |
| `upload_filename` | str or None | None | upload.py | results.py (display source) |
| `mlcore_connected` | bool | False | api_client.health_check() | header.py, sidebar.py, demo.py |
| `last_health_check` | float or None | None | api_client.health_check() | api_client (TTL check) |
| `export_html_ready` | bool | False | export/html_report.py | results.py (button enable) |
| `config` | dict | from config.yaml | main.py init | all pages, api_client |

### State transitions

The normal flow through session state during a hackathon demo:

```
Initial:        page="home", result=None, selected_candidate=None
↓ (click Demo)
Navigating:     page="demo"
↓ (click Candidate A)
Running:        selected_candidate="a", analysis_running=True
↓ (api_client returns)
Complete:       result={...}, analysis_running=False, page="results"
↓ (click Download HTML)
Exporting:      export_html_ready=True
```

---

## 19. Export Format Specifications

### HTML evidence pack

**File name:** `transitlens_report_{target_id}_{timestamp}.html`

**File size:** Approximately 1.5-3MB (dominated by four embedded base64 plot images)

**Required sections in order:**
1. HTML head with inline CSS
2. Header bar: logo text, "TransitLens Analysis Report", version, timestamp
3. Result summary table: target_id, class, confidence, period, depth, duration, SNR
4. Four plots as inline base64 images in a 2×2 grid
5. Classification explanation text block
6. Feature table (11 rows)
7. Classification path (rule checks with pass/fail)
8. Footer: "Generated by TransitLens · Bharatiya Antariksh Hackathon 2026"

### CSV result file

**File name:** `transitlens_result_{target_id}_{timestamp}.csv`

**File size:** Approximately 2-5KB

**Columns (18 total):**
`target_id, candidate_detected, predicted_class, confidence, period_days, duration_days, depth, snr, transit_count, bls_power, odd_even_depth_delta, v_shape_score, local_noise, depth_to_noise_ratio, phase_shape_kurtosis, explanation, processing_time_ms, pipeline_version`

**Notes:** Boolean values as `true`/`false` strings. Null values as empty strings. Explanation column value is quoted if it contains commas.

---

## 20. Dependencies and Install Plan

### Production dependencies

| Package | Version | Why needed | Phase introduced |
|---------|---------|-----------|-----------------|
| `streamlit` | >= 1.32 | Dashboard framework | Phase 1 |
| `plotly` | >= 5.20 | Interactive charts (stretch) | Phase 10 |
| `pandas` | >= 2.0 | CSV reading, data manipulation | Phase 2 |
| `numpy` | >= 1.24 | Array operations | Phase 2 |
| `requests` | >= 2.31 | HTTP calls to ml-core API | Phase 2 |
| `jinja2` | >= 3.1 | HTML report templating | Phase 6 |
| `pyyaml` | >= 6.0 | Reading config.yaml | Phase 1 |
| `pillow` | >= 10.0 | Decoding base64 PNG plots | Phase 4 |

### Development dependencies

| Package | Version | Why needed |
|---------|---------|-----------|
| `pytest` | >= 7.4 | Test runner |
| `pytest-cov` | >= 4.1 | Coverage |
| `black` | >= 23.0 | Code formatting |

### Install commands

```
pip install streamlit plotly pandas numpy requests jinja2 pyyaml pillow
```

Installs in under 2 minutes. No heavy ML libraries needed — this repo never runs BLS or classifiers.

### Python version

Python 3.10 or higher.

---

## 21. Configuration Reference

### Full `config.yaml` specification

```yaml
mlcore:
  base_url: "http://localhost:8000"
  timeout_seconds: 30
  health_check_timeout: 3
  health_check_ttl_seconds: 30
  demo_fallback: true

demo:
  default_candidate: "a"
  show_raw_plot: true
  show_cleaned_plot: true
  show_periodogram: true
  show_phase_folded: true
  autorun_on_selection: true
  candidates:
    a:
      label: "exoplanet_like"
      emoji: "🪐"
      description: "A shallow 1.3% periodic dip every 3.42 days"
    b:
      label: "eclipsing_binary_like"
      emoji: "⭐"
      description: "A deep 18% V-shaped eclipse every 1.87 days"
    c:
      label: "noise_or_other"
      emoji: "📊"
      description: "No periodic signal — correlated red noise"

ui:
  theme: "dark"
  primary_color: "#534AB7"
  confidence_colors:
    exoplanet_like: "#3C3489"
    eclipsing_binary_like: "#712B13"
    noise_or_other: "#444441"
  plot_height: 300
  result_card_border_radius: 8
  sidebar_width: 240

export:
  html_enabled: true
  csv_enabled: true
  pdf_enabled: false
  output_dir: "exports/"
  include_plots: true
  filename_template: "transitlens_{type}_{target_id}_{timestamp}"

platform:
  version: "0.1.0"
  repo_url: "https://github.com/transitlens/transitlens-platform"
  hackathon: "Bharatiya Antariksh Hackathon 2026"
  problem_statement: "PS7"
```

---

## 22. Judge Demo Script

This is the exact script to follow during the live hackathon presentation. Every word and click is planned. Total duration: 3-4 minutes.

### Opening (15 seconds)

"This is TransitLens — an AI system that detects exoplanet transit signals from noisy TESS telescope data. A transit is when a planet passes in front of its star, causing a tiny, periodic dip in brightness. Finding these dips is hard because the signals are small, noisy, and can be mimicked by other astrophysical phenomena."

### Demo flow (2 minutes 30 seconds)

**Screen 1 — Demo page** (10 seconds)
"We have three test cases — an exoplanet-like signal, an eclipsing binary, and a noise case. Let's start with the most interesting one."

**Click Candidate A** — watch the progress bar

"While it runs, notice the progress: it's preprocessing the light curve, running a BLS period search across over 5,000 candidate periods, extracting 11 diagnostic features, and classifying the signal. All of this happens in a few seconds."

**Screen 2 — Results for Candidate A** (60 seconds)

"The system identified this as an exoplanet-like signal with 88% confidence." (point to class badge and confidence)

"It detected a period of 3.42 days, a transit depth of 1.3%, and a duration of 3.8 hours — consistent with a Jupiter-sized planet." (point to parameter panel)

"Here's the key evidence." (point to phase-folded plot) "When we fold the light curve at the detected period, all transit events stack on top of each other, and we see this clean, symmetric dip at phase zero. That's the planet."

"The system didn't just classify it — it explained why." (read one sentence from explanation box) "It checked the odd/even transit depth consistency, the transit profile shape, and the depth-to-noise ratio. All passed. Exoplanet-like."

**Navigate back, click Candidate B** (30 seconds)

"Now watch what happens with the eclipsing binary." (result appears) "Completely different: 18% depth, V-shaped profile, and if you look at the odd/even delta here — the alternating transits have different depths. That's the secondary star. Our system correctly identifies this as eclipsing binary-like."

**Navigate back, click Candidate C** (15 seconds)

"And for noise — no candidate detected. The periodogram is flat, no significant peak. Correctly classified."

**Export demonstration** (20 seconds)

(Return to Candidate A results, click HTML export) "Every result generates a self-contained evidence pack. I can open this on any laptop with no internet connection — it has all four plots, all 11 features, and the classification reasoning embedded inline."

### Q&A preparation (45 seconds to 1 minute)

Anticipated questions and short answers:

**"How does BLS work?"**
"Box Least Squares searches for a periodic box-shaped dip. For each candidate period, it folds the light curve and measures how consistently a dip appears at the same phase. The period with the highest BLS power is the detected period."

**"Why rule-based and not deep learning?"**
"Interpretability. We can explain every classification decision with specific feature values. A CNN would say 'the model decided' — we say 'the odd/even depth delta was 0.04, below the 0.02 threshold, so this is not an eclipsing binary.' Judges and scientists need to trust the system, not just the output."

**"Does it work on real TESS data?"**
"The pipeline is designed for real TESS data. The synthetic cases we showed were generated to match TESS 2-minute cadence characteristics. With internet access, we can connect to the MAST archive and run on a real confirmed exoplanet like WASP-126b." (if time allows, run the TIC ID demo)

**"What's the accuracy?"**
"On our labeled synthetic dataset, 100% classification accuracy with period recovery within 1% for all transit cases. We're honest that this is synthetic data — real TESS performance would require validation on a larger labeled dataset, which is our next step."

**"Could this scale?"**
"TESS produces light curves for roughly 200,000 stars per sector. The current pipeline processes one in under 5 seconds — that's about 40,000 per day on a single machine. With parallelisation, this could screen an entire TESS sector overnight."

---

## 23. Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|------------|
| ml-core API unreachable during demo | High | High | Offline fallback (demo_data/sample_results.json) handles this completely; demo still works |
| Streamlit crashes on page navigation during demo | Low | High | Test full demo flow 10 times before presenting; have a browser refresh ready |
| Base64 plot images don't render in Streamlit | Medium | High | Test with all three sample results before the hackathon; have PIL fallback decoder |
| HTML export file too large to generate quickly | Low | Medium | Pre-generate HTML files for all three cases and store them; download is instant |
| Judge's laptop can't open HTML export | Low | Low | Bring a USB drive with the HTML files; alternatively show the file opening on the demo laptop |
| CSS injection breaks Streamlit layout | Medium | Medium | Test CSS overrides with `unsafe_allow_html=True` in dev before applying; have a no-CSS fallback |
| sample_results.json has stale plots after ml-core changes | Medium | Medium | Regenerate sample_results.json after any ml-core change; document this step in CONTRIBUTING.md |
| Port 8501 conflict for Streamlit at hackathon venue | Low | Medium | Document `streamlit run main.py --server.port 8502` in README.md |
| Dark theme CSS conflicts with Streamlit updates | Low | Low | Pin Streamlit version in requirements.txt |
| File uploader accepts malformed CSVs and crashes | Medium | Medium | Validate CSV in upload.py before calling api_client; show user-friendly error messages |

---

## 24. Hackathon Priority Tiers

### Tier 1 — Must-have (required for a working demo)

Everything needed for the three-candidate offline demo to run end-to-end:

- `main.py` — routing and CSS injection working
- `config.yaml` — complete with ml-core URL and fallback enabled
- `app/api_client.py` — analyze() returning valid result from fallback
- `app/state.py` — session state initialised correctly
- `app/utils.py` — format helpers working
- `app/pages/demo.py` — three candidate cards, analysis trigger, navigation to results
- `app/pages/results.py` — all six sections rendering
- `app/components/result_card.py` — class badge and confidence visible
- `app/components/parameter_panel.py` — four metrics showing correct values
- `app/components/plot_phase_folded.py` — the money plot visible
- `demo_data/sample_results.json` — all three pre-computed results populated
- `demo_data/candidate_{a,b,c}.csv` — all three synthetic CSVs present

**Estimated effort: 8-10 hours. This is your first milestone.**

### Tier 2 — Should-have (complete before presenting)

Makes the demo professional and the export story credible:

- All four plot components rendering
- `app/components/feature_table.py` — feature table visible
- `app/components/confidence_badge.py` — coloured badges correct
- `app/components/sidebar.py` — navigation working
- `app/components/header.py` — TransitLens branding visible
- `app/pages/home.py` — hero, features, CTA
- `export/html_report.py` — HTML download working
- `export/csv_export.py` — CSV download working
- `static/style.css` — basic colour customisation (dark theme, purple primary)

**Estimated effort: 5-7 hours.**

### Tier 3 — Nice-to-have (polish that judges notice)

- `app/pages/about.py` — methodology page for deep questions
- Full CSS visual polish (candidate cards, metric cards, feature table)
- `app/pages/upload.py` — CSV upload path
- `static/logo.svg` — TransitLens wordmark
- `tests/` — at least test_api_client.py and test_export.py passing

**Estimated effort: 3-4 hours.**

### Tier 4 — Stretch (post-hackathon)

Everything in Phase 10 — interactive Plotly charts, period slider, comparison view, batch analysis, transit animation.

---

## 25. Definition of Done

The `transitlens-platform` repo is considered complete for hackathon submission when:

1. `streamlit run main.py` launches without errors in under 10 seconds
2. All three candidate cards on the demo page are clickable and trigger analysis
3. The results page displays the correct class badge, confidence, and parameters for all three demo cases
4. The phase-folded plot renders as an image for all three demo cases
5. The HTML evidence pack downloads correctly when the download button is clicked
6. The CSV result downloads correctly when the download button is clicked
7. The offline fallback path works when ml-core is not running (demo_data is populated)
8. The connection status badge correctly shows "offline mode" when ml-core is unreachable
9. `pytest tests/` runs with zero failures
10. The `README.md` quick-start works in under 4 commands on a fresh machine
11. No import from `transitlens-ml-core`'s `core/` or `transitlens-data-pipeline` exists in the repo
12. The full demo flow (home → demo → click Candidate A → results → download HTML) completes in under 30 seconds
13. The results page shows a helpful message and navigation CTA when no result is in session state
14. All five pages are navigable from the sidebar without page reload errors
15. The platform installs from scratch using `pip install streamlit pandas numpy requests jinja2 pyyaml pillow` in under 2 minutes

---

*This document covers the complete engineering plan for `transitlens-platform`. No code is included. All UX decisions, component specifications, API client contracts, session state schema, export formats, and the judge demo script are documented here for use during the hackathon build.*

*Previous document: `transitlens-ml-core-PLAN.md`*
*Series complete — all three repo plans are ready for implementation.*