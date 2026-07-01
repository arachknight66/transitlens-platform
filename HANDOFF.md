# HANDOFF.md

# TransitLens Platform Handoff

## 2026-07-01 Gateway Foundation Checkpoint

Implemented the platform-owned FastAPI gateway under `backend/`.

- Public `/api` routes now cover dashboard, search, download, upload (plus the documented `/uploads` compatibility alias), process, analysis retrieval, prediction, results, reports, and secure session settings.
- Pipeline and ML behavior is accessed only through typed HTTP clients. The platform contains no FITS parsing, preprocessing, metric estimation, or inference implementation.
- Requests and upstream responses are validated; upstream authentication, availability, timeout, malformed-response, and validation failures use stable centralized errors.
- Session credentials and runtime service URLs are held in expiring server memory behind an opaque HttpOnly SameSite cookie. Tokens are never returned to the browser or logged.
- PDF, JSON, and CSV reports are generated from validated pipeline and ML outputs and contain observation metadata, prediction, confidence, scientific metrics, model/pipeline versions, and timestamps.
- OpenAPI includes every required public gateway route.

Verification: backend integration suite passes 7 tests covering route schema, search, download, upload, processing, prediction, results, all report formats, invalid upload, missing prediction, secure token response, and unavailable pipeline translation.

Upstream constraints remain explicit: the data-pipeline `/upload` and ML Core `/predict` HTTP endpoints must be supplied by their owning repositories. Missing transit metrics remain nullable and are never calculated by the platform.

## 2026-07-01 Settings and About Checkpoint

- Settings and About are now active lazy routes in desktop and mobile navigation.
- MAST credentials were removed from browser session storage. The MAST Explorer and Settings page now configure an expiring gateway-held token; frontend requests use the opaque HttpOnly session cookie exclusively.
- Runtime Pipeline and ML Core URLs are configured through the gateway. The frontend never uses them as direct request targets.
- Theme, cache, and download-directory preferences are non-secret, session-scoped browser preferences. The UI explicitly notes that browsers retain control of physical download placement.
- About documents the project, system architecture, workflow, missions, repository boundaries, versions, model ownership, limitations, and scientific disclaimer.

Verification: frontend lint and strict typecheck pass; Vitest passes 42 tests across 25 files, including Settings credential handling and About content.

## 2026-07-01 Integrated Verification Checkpoint

- The frontend now targets only the platform gateway, including the canonical `POST /api/upload` route. The plural upload route remains a hidden compatibility alias.
- Upload forwarding is size-limited and streamed from the spooled request file, avoiding a second in-memory copy of large observations.
- Real data-pipeline nested feature/provenance records are composed into the existing frontend results and report contracts; absent upstream transit metrics remain explicitly nullable.
- Search, download, processing, and inference responses are structurally validated at the gateway boundary.
- Failure coverage includes pipeline and ML unavailability, upstream timeouts, authentication rejection, invalid uploads, malformed upstream responses, missing analyses/predictions, and network failures.

Final verification:

- Backend: 11 integration/contract tests pass.
- Frontend: 42 tests across 25 files pass.
- ESLint: zero warnings.
- TypeScript strict typecheck: pass.
- Vite production build: pass.
- OpenAPI required-route contract: pass.

End-to-end execution with live upstream services remains dependent on upstream-owned `/upload` and `/predict` HTTP capabilities. This repository provides complete clients and orchestration for those contracts without duplicating their implementation.

## Repository Status

Current Phase

Phase 8 — Complete

---

## Public Interfaces

Consumes

transitlens-data-pipeline REST API

Consumes

transitlens-ml-core Prediction API

---

## Current Deliverables

Completed

Project foundation

- React 19 with strict TypeScript
- Vite production and development configuration
- Tailwind CSS scientific theme foundation
- Lazy application routing with unknown-route recovery
- React Query provider and defaults
- Typed backend API client with query, JSON, upload body, timeout, and error handling
- Environment-based platform API configuration
- Unit tests for application routing, setup UI, and API communication

Dashboard

- Responsive scientific workstation shell
- Home page with platform workflow overview
- Desktop and mobile navigation with accessible skip link
- Dashboard status cards for system, pipeline, model, and active processing
- Connected-service health and latency display
- Active jobs with accessible progress indicators
- Recent analyses and recent downloads
- Loading, unavailable, empty, and populated dashboard states
- React Query dashboard polling and manual retry

MAST Explorer

- Search by target name, TIC ID, Kepler ID, or observation ID
- Mission filtering for TESS, Kepler, and K2
- Identifier normalization at the API orchestration boundary
- Optional MAST token held only in browser session storage
- Responsive observation metadata table with mission, product, and BJD range
- Preferred FITS download requests delegated to the data pipeline
- Per-observation download progress and cache-aware completion feedback
- Search validation, loading, empty, authentication, API error, and download error states

Upload

- Drag-and-drop and accessible file-picker workflow
- FITS, FIT, and CSV extension validation
- Empty-file and 250 MB size-limit validation
- Selected-file format and size review
- Multipart gateway upload with byte-level progress
- Upload cancellation, retry, and error handling
- Typed processed-upload receipt with analysis reference
- Explicit UI notice that parsing and preprocessing are data-pipeline responsibilities

Analysis

- Analysis-reference loading with query-string deep links
- Latest uploaded analysis retained in session storage
- Raw, normalized, and wavelet-denoised light curves
- Three vertically aligned Plotly WebGL traces on one synchronized time axis
- Zoom, pan, scroll zoom, reset-view, hover, and PNG export controls
- Memoized chart model and lazy Analysis route
- Source, target, and sample-count context
- Loading, unavailable, empty, and malformed-pipeline-data states
- Validation for empty, misaligned, and non-finite pipeline arrays
- Custom Plotly bundle registering only the required scattergl trace

Prediction

- Gateway-orchestrated ML Core inference from a valid processed analysis
- Run, pending, retry, error, malformed-response, success, and repeat-run states
- Transit probability and decision confidence gauges
- Prediction class and human-readable detection outcome
- Model version, inference time, and generation timestamp
- Accessible meter semantics for probability and confidence
- Structural validation of ML Core result ranges and identifiers
- No local thresholding, confidence calculation, or model behavior

Scientific Results

- Dedicated Results route with latest-analysis handoff and deep links
- Transit depth, transit duration, estimated period, and SNR presentation
- Explicit units and data-pipeline provenance for every scientific metric
- Honest unavailable states for metrics absent from upstream services
- Mission, target, observation, source-column, duration, and cadence metadata
- Pipeline/schema versions, preprocessing configuration, and sample accounting
- Associated ML Core prediction summary when available
- Loading, gateway-error, empty, missing-prediction, and malformed-result states
- No client-side scientific metric estimation or recalculation

Reports

- Dedicated Reports route with latest-analysis handoff and deep links
- Gateway-generated PDF, JSON, and CSV scientific exports
- Accessible export-format dialog with pending, error, and completion states
- Required report-content review before generation
- Observation, prediction, scientific metrics, model version, and timestamp coverage
- Prediction requirement enforced before export
- Binary response handling with safe filenames and browser URL cleanup
- Abort/timeout handling and gateway error details
- No client-side scientific report synthesis or metric recalculation

Pending

Settings

About

---

## Phase 8 Verification

Passed

- ESLint with zero warnings
- Vitest: 41 tests
- TypeScript strict type-check
- Vite production build
- Browser verification of Reports navigation, accessible reference/empty state, runtime health, and horizontal overflow
- PDF, JSON, CSV, dialog, and binary download behavior verified through component/service tests

---

## Configuration

Copy `.env.example` to a local `.env` when overriding defaults.

- `VITE_PLATFORM_API_URL` defaults to `http://localhost:8000/api`
- `VITE_API_TIMEOUT_MS` defaults to `30000`

Credentials are not persisted by the Phase 1 foundation.

---

## Task Plan Status

All phases defined in `TASKS.md` are complete.

Settings and About remain required pages but are not assigned a phase in `TASKS.md`; they were not implemented automatically.

---

## Report Gateway Contract

The Reports page sends `POST /analyses/{analysis_id}/reports` to the configured platform gateway with `{ "format": "pdf" | "json" | "csv" }`.

The gateway returns the generated artifact as a binary response with an appropriate content type and attachment filename. Every format must include:

- observation information
- ML Core prediction and confidence
- scientific metrics
- model version and inference timing
- report timestamp

The frontend requires an associated prediction before enabling export. It handles transport and download only; report content is generated by the platform gateway from existing pipeline and ML Core outputs.

---

## Scientific Results Gateway Contract

The Results page consumes `GET /analyses/{analysis_id}/results` from the configured platform gateway.

The response includes:

- four scientific metric records with value, unit, and `transitlens-data-pipeline` provenance
- observation mission, target, observation ID, source filename, source columns, duration, and cadence
- pipeline/schema versions, preprocessing configuration, and sample accounting
- the associated ML Core prediction when available
- result generation timestamp

Metric values may be `null` when the owning scientific service has not produced them. The UI displays those values as unavailable rather than estimating them.

The current data-pipeline contract provides SNR, observation duration, cadence, metadata, and provenance. It does not currently expose transit depth, transit duration, or estimated period. The gateway contract preserves that gap explicitly; no scientific algorithm was added to this repository.

---

## Prediction Gateway Contract

The Analysis workspace triggers `POST /analyses/{analysis_id}/prediction` on the configured platform gateway.

The response preserves ML Core's stable platform-facing output and adds platform identity:

- `prediction_id` and `analysis_id`
- `probability` in `[0, 1]`
- `confidence` in `[0, 1]`
- binary `predicted_class`
- non-empty `model_version`
- non-negative `inference_time` in milliseconds
- `created_at` timestamp

The frontend maps `predicted_class` directly to its display label. It does not derive the class from probability, estimate confidence, load a model, or execute inference.

The current transitlens-ml-core repository exposes this result as a stable Python inference contract but does not expose an HTTP application. The platform gateway contract isolates that transport gap; ML code was not imported or duplicated here.

---

## Analysis Gateway Contract

The Analysis page consumes `GET /analyses/{analysis_id}` from the configured platform gateway.

The response wraps the transitlens-data-pipeline `/process` output with platform identity and source context:

- `analysis_id` and `status: "processed"`
- `source` with filename and optional target/mission
- aligned `time`, `flux`, `normalized_flux`, `median_filtered_flux`, and `wavelet_flux` arrays
- optional `quality` array
- pipeline `metadata` and `features`

The frontend verifies only structural chart safety: samples exist, displayed arrays align, and values are finite. It performs no normalization, denoising, parsing, feature generation, or other scientific processing.

---

## Upload Gateway Contract

The Upload page sends `multipart/form-data` to `POST /uploads` on the configured platform gateway. The multipart field is named `file`.

The gateway response contains:

- `upload_id`
- `analysis_id`
- `filename`
- `format` (`fits` or `csv`)
- `size_bytes`
- `status` (`accepted`, `processing`, or `processed`)

The platform gateway owns transport orchestration. It must hand accepted content to transitlens-data-pipeline through a public API and return its processing state. The frontend does not parse FITS/CSV content, preprocess light curves, or rely on a shared pipeline filesystem.

The current transitlens-data-pipeline public API does not expose a byte-upload route. The gateway contract intentionally isolates that service gap; no scientific behavior was duplicated in this repository.

---

## MAST API Contract

The explorer consumes the data-pipeline public interface through the configured platform gateway:

- `GET /search` with `target`, repeated `missions`, `radius_deg`, and `limit`
- `POST /download` with `{ "mast_id": "..." }`

TIC identifiers are normalized to `TIC <id>` and Kepler identifiers to `KIC <id>` before search. Target names and observation IDs are passed unchanged. The gateway receives an optional session credential through the `Authorization` header; credentials are never placed in URLs or persistent browser storage.

The download response identifies the preferred FITS product cached by transitlens-data-pipeline. The platform does not inspect products, parse FITS, or duplicate MAST logic.

---

## Dashboard Gateway Contract

The dashboard consumes `GET /dashboard/summary` from the configured platform gateway.

The response contains:

- system and pipeline service states
- active model version
- connected services and optional latency
- recent analyses
- recent downloads
- active processing jobs
- gateway generation timestamp

This Phase 2 contract is frontend orchestration only. It does not duplicate health checks, processing, or inference logic owned by the data-pipeline and ML-core services.

---

## Interface Contracts

Input

Observation

Prediction

Metadata

Output

Interactive Dashboard

Scientific Report

Prediction Summary

---

## Known Risks

Large FITS uploads

Slow network

Pipeline unavailable

Prediction timeout

Large datasets

---

## Future Features

Observation comparison

Multiple model selection

Mission support

Advanced explainability

Live monitoring

---

## Definition of Complete

The platform is complete when a user can

Search MAST

Download an observation

Upload FITS

Run preprocessing

Visualize every stage

Run prediction

View scientific metrics

Export results
