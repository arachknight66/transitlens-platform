# Phase 9 UI Audit Note - TransitLens Platform

Audit date: 2026-06-27  
Scope: `transitlens-platform` Streamlit Dashboard UI

---

## 1. Current Frontend Architecture

- **Framework**: Streamlit (Python-based SPA framework).
- **Routing**: Single-page application router in [main.py](file:///c:/Users/arach/Documents/Projects/Transitlens/transitlens-platform/main.py) driven by `st.session_state.page`.
- **State Management**: Centralized in [app/state.py](file:///c:/Users/arach/Documents/Projects/Transitlens/transitlens-platform/app/state.py) using typed session state getters and setters.
- **API Client**: [app/api_client.py](file:///c:/Users/arach/Documents/Projects/Transitlens/transitlens-platform/app/api_client.py) connecting to the FastAPI `ml-core` server with offline fallback capabilities loading from `demo_data/sample_results.json`.
- **Visuals & Charts**: Streamlit native plots, `plotly`, and precomputed Matplotlib images decoded from base64 strings returned by the backend.
- **Pages**:
  - `home.py` (Current: static marketing landing page)
  - `demo.py` (Current: interactive candidate cards running simulated progress and calling backend `/analyze`)
  - `upload.py` (Current: CSV upload and TESS target fetching)
  - `results.py` (Current: tabbed scientific diagnostic results panel)
  - `about.py` (Current: project metadata and information)

---

## 2. Identified UI & Scientific Gaps

### 2.1 Navigation & Workspace Gaps
- **Landing Page Constraint**: The default home view is currently a marketing overview rather than the actual working workbench. The evaluator must immediately see the analysis interface.
- **Fragmented Workspace**: Bundle selection, file upload, and TESS fetching exist on separate pages (`demo.py` vs `upload.py`). They should be unified in a single **Analysis Workspace**.
- **Missing Explorers & History**:
  - No **Candidate Explorer** exists to sort, filter, and search through multiple evaluation targets.
  - No **Evaluation Dashboard** to visualize Phase 8 metric tables and confusion matrices.
  - No **Runs History** page to view previous run configurations, timings, and checksums.

### 2.2 Visualization & Scientific Clarity Gaps
- **Uncertainty Presentation**: Missing visual representations of asymmetric uncertainties (need standard notation format: e.g. $P \pm \sigma$).
- **Tooltips & Glossaries**: Confidence percentage values lack definition tooltips separating classifier probability from detection significance or SNR.
- **No Event Inspection Stack**: Individual transit cycles are folded together but there is no cycle-by-cycle scroll/pagination view for specific outlier analysis.
- **Offline / Fallback Notice**: While offline fallback works, the notice indicating that cached data is used instead of a live run is basic.

---

## 3. Plan of Action

We will restructure the Streamlit application to meet the hackathon definition of done:

1. **Analysis Workspace (Homepage)**: Replace the current `home.py` with a functional workspace containing target selection (bundled, file upload, or TIC ID), analysis mode (Quick, Standard, Rigorous), collapsible advanced settings, stage-by-stage real pipeline progress, and immediate results overview.
2. **Navigation Updates**:
   - **Analyze** (Workspace)
   - **Candidates** (Explorer: sorting, filtering, searching targets)
   - **Evaluation** (Dashboard: Phase 8 metrics, confusion matrix, injection-recovery details)
   - **Runs** (Runs list, resolved configs, artifact list)
   - **Method** (Scientific contract, terminology glossary)
3. **Parameter Uncertainty rendering**: Implement symmetric and asymmetric uncertainty formatting using tabular numerals.
4. **Plot enhancements**: Display raw data, detrending trends, binned phase folds, and MCMC corner plots.
5. **Quality warnings panel**: Add warnings categorized by severity level (Info, Caution, Warning, Failure) on the results page.
