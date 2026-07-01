# TransitLens Full Audit Report

**Audit date:** 2026-07-01  
**Workspace:** `C:\Users\arach\Documents\Projects\Transitlens_v2`  
**Scope:** `transitlens-platform`, `transitlens-platform/backend`, `transitlens-data-pipeline`, `transitlens-ml-core`  
**Purpose:** Verify the current implementation and identify features still missing, contract gaps, and workflows that are not working properly.

## Executive Summary

The project is much healthier than the previous audit suggested. The frontend, data pipeline, ML core, and platform gateway all have substantial implementations, and their local unit or integration suites pass when run with the right project root and test extras.

The service-boundary defects found during this audit have now been fixed. Gateway
tests use the real upstream request and response shapes for upload, processing,
prediction, health, and model identity. Scientific descriptors also flow from
the pipeline or ML Core into results and reports with explicit provenance.

**Overall status:** The prototype is repository-tested and its known contract
blockers are resolved. A live multi-process browser run remains a release
validation activity, not a known implementation failure.

## Verification Run

### TransitLens Platform Frontend

Result: **Pass**

- `npm.cmd run typecheck`: passed.
- `npm.cmd exec vitest -- run --root C:/Users/arach/Documents/Projects/Transitlens_v2/transitlens-platform`: 25 files passed, 42 tests passed.
- `npm.cmd exec eslint -- . --max-warnings 0 --ignore-pattern **/.pytest_cache/**`: passed.
- `node_modules\.bin\vite.cmd build C:/Users/arach/Documents/Projects/Transitlens_v2/transitlens-platform`: production build passed.

Notes:

- On Windows systems that block the PowerShell script shim, invoke the same
  package scripts through `npm.cmd`.

### TransitLens Platform Gateway

Result: **Pass with real upstream-shaped contract coverage**

- `python -m pytest -q`: 12 tests passed.

Warnings:

- FastAPI/Starlette deprecation warning for the test client.
- Pytest cache warning from an existing `.pytest_cache` path.

### TransitLens Data Pipeline

Result: **Pass**

- `uv run pytest --basetemp ...`: 131 tests passed.
- Coverage: 95.66%, above the 90% gate.
- `uv run ruff check .`: passed.
- `uv run black --check .`: passed.

Warnings:

- Pytest cache warning from an existing `.pytest_cache` path.

### TransitLens ML Core

Result: **Pass**

- `uv run --extra dev python -m pytest --basetemp ...`: 173 tests passed.
- Coverage: 96.27%, above the 90% gate.
- `uv run --extra dev python -m ruff check .`: passed.
- `uv run --extra dev python -m black --check .`: passed.

Warnings:

- Pytest cache warning from an existing `.pytest_cache` path.

## Critical Findings

### F-01 - Gateway upload contract does not match the real data-pipeline upload API

**Severity:** Critical  
**Owner:** `transitlens-platform/backend`  
**Status:** Resolved

The real data pipeline `POST /upload` returns:

- `file_id`
- `media_type`
- `size_bytes`

The gateway expects:

- `upload_id`
- `file_reference`
- `filename`
- `format`
- `size_bytes`

The gateway tests mock the gateway's expected response, so they pass without proving compatibility with the actual pipeline.

**Impact:** A real platform upload will likely fail at gateway validation with `invalid_response`.

**Required fix:** Update gateway `UpstreamUploadResponse` and upload orchestration to consume the real pipeline fields. Map `file_id` into the platform receipt and use it for processing.

### F-02 - Gateway process request does not match the real data-pipeline process API

**Severity:** Critical  
**Owner:** `transitlens-platform/backend`  
**Status:** Resolved

The real data pipeline `POST /process` accepts exactly one of:

- `file_id`
- `fits_path`

The gateway sends:

- `file_reference`
- `mission`

**Impact:** Upload processing and manual processing through the gateway will not work against the real data-pipeline service.

**Required fix:** Send `file_id` when processing uploaded files. Preserve `fits_path` only for legacy cached-path flows if the gateway intentionally supports them.

### F-03 - Gateway prediction contract does not match the real ML Core response

**Severity:** Critical  
**Owner:** `transitlens-platform/backend`  
**Status:** Resolved

The real ML Core `POST /predict` response uses `prediction`. The gateway expects `predicted_class`.

The gateway tests mock `predicted_class`, so they do not catch the drift.

**Impact:** Gateway prediction requests will likely fail validation against real ML Core responses.

**Required fix:** Map ML Core `prediction` to the platform's internal `predicted_class`, or rename the platform contract to match ML Core consistently.

### F-04 - Gateway dashboard checks ML Core at the wrong health route

**Severity:** High  
**Owner:** `transitlens-platform/backend`  
**Status:** Resolved

The real ML Core service exposes:

- `GET /health`
- `GET /model`
- `POST /predict`

The gateway dashboard calls ML Core at `/status`.

**Impact:** The dashboard can report ML Core as offline/degraded even when the real ML service is healthy.

**Required fix:** Change the gateway dashboard ML health check to `/health`, and fetch model identity from `/model` when needed.

## High Findings

### F-05 - Full live end-to-end workflow has not been verified

**Severity:** High  
**Owner:** All repositories  
**Status:** Validation pending

The local suites verify each repository mostly in isolation. I did not find evidence from this run that the actual services were started together and exercised through the browser or gateway using real HTTP calls.

The workflow still needs live proof for:

- Search MAST through gateway.
- Download FITS through gateway.
- Upload FITS/CSV through gateway to data pipeline.
- Process by opaque uploaded file ID.
- Fetch analysis from gateway memory/store.
- Predict through real ML Core.
- View results.
- Export PDF, JSON, and CSV reports.

**Required fix:** Add a cross-service integration suite or Playwright workflow that starts the data pipeline, ML Core, gateway, and frontend together.

### F-06 - Gateway state is in-memory only

**Severity:** High for production, acceptable for prototype  
**Owner:** `transitlens-platform/backend`  
**Status:** Documented prototype limitation

Analyses, predictions, downloads, and session data are stored in server memory. Restarting the gateway loses active analysis references and prediction/report state.

**Impact:** The app can work for a single prototype session but is not durable.

**Required fix:** For production, add persistent storage for analyses, reports, predictions, session metadata, and job history. For prototype, document this as an intentional limitation in user-facing docs.

### F-07 - Scientific metrics remain nullable unless produced upstream

**Severity:** High for scientific completeness  
**Owner:** Data/science contract owner  
**Status:** Resolved for nullable prototype contract

The gateway and reports can surface `transit_depth`, `transit_duration`, `estimated_period`, and `signal_to_noise_ratio`. ML Core can echo scientific descriptors from processed metadata when present. The data pipeline currently guarantees SNR and general statistics, but transit depth, duration, and period are not clearly guaranteed as authoritative pipeline outputs.

**Impact:** Results and reports may display unavailable values for required scientific metrics.

**Required fix:** Decide the authoritative owner for these metrics, define units and nullability, and add contract tests from pipeline/ML output through gateway results and reports.

## Medium Findings

### F-08 - Deferred product features are still not implemented

**Severity:** Medium  
**Owner:** Product roadmap  
**Status:** Deferred

The following are still listed as future/deferred work across the task and handoff files:

- Realtime monitoring.
- Multi-user authentication.
- Observation history sync.
- Cloud deployment.
- Notifications.
- Auto dataset retraining.
- Background workers and schedulers.
- Distributed processing/training.
- Multiple archive providers.
- Advanced explainability.
- Autoencoder, attention, feature fusion, ensembles, quantization, and multi-class classification.
- Multiple model selection and comparison.

These are not blockers for the current prototype unless the release target includes them.

### F-09 - Environment/tooling commands need documented Windows-safe forms

**Severity:** Medium  
**Owner:** Developer experience  
**Status:** Resolved

Several plain commands failed because of Windows PowerShell policy, sandbox path resolution, or inaccessible temp/cache directories. Working forms were found, but they should be documented.

Recommended documentation:

- Use `npm.cmd` on Windows when PowerShell blocks `npm.ps1`.
- For Vitest, pass the real platform root when running inside Codex/sandboxed environments.
- For Vite 8, use `vite build <root>`, not `vite --root <root> build`.
- For Python tests, set a writable pytest base temp in restricted environments.
- Use `uv run --extra dev python -m pytest` or `uv run --extra test python -m pytest` so extras are installed and script-shim permission issues are avoided.

## Working Features Confirmed By Tests

### Platform Frontend

- Routes for Home, Dashboard, MAST Explorer, Upload, Analysis, Results, Reports, Settings, and About.
- TypeScript typecheck.
- Component/service tests for the core user flows.
- Production build.
- Lint with zero warnings when cache folders are excluded.

### Platform Gateway

- Public `/api` route surface exists.
- Settings session route avoids returning raw MAST token.
- Mocked search, download, upload, process, prediction, results, and report flow passes.
- Error translation tests cover invalid upload, missing prediction, unavailable pipeline, ML failures, authentication failure, and malformed search response.

### Data Pipeline

- MAST search/download abstractions.
- FITS/FIT and CSV upload validation.
- Opaque `file_id` processing.
- FITS reading and validation.
- Preprocessing and feature generation.
- NumPy/Parquet export.
- REST integration and performance tests.
- Coverage above required threshold.

### ML Core

- Dataset loading and splitting.
- CNN model, classifier, training, evaluation, checkpointing, ONNX export, and inference.
- Public FastAPI inference service with `/health`, `/model`, and `/predict`.
- Prediction schema and validation.
- Coverage above required threshold.

## Remaining Release Work

1. Run the four services together with production-like model and FITS fixtures,
   then execute the browser workflow as release validation.
2. Add durable storage before production or multi-instance deployment.
3. Implement F-08 items only when they enter the agreed product scope.

## Final Audit Opinion

TransitLens is no longer missing the broad feature surface called out in the old
audit, and the service-boundary drift found in this audit has been corrected.
The remaining risk is operational validation with all real processes and model
artifacts running together.

The correct status is:

> Repository-level implementation and tests are strong; known gateway contract
> defects are fixed, while a production-like live orchestration run remains to
> be completed before release.
