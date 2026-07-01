# TransitLens Platform Completion Gap Audit

**Audit date:** 2026-07-01  
**Repository audited:** `transitlens-platform`  
**Related interfaces reviewed:** `transitlens-data-pipeline`, `transitlens-ml-core`  
**Audit scope:** Remaining work after completion of Phases 1–8 in `TASKS.md`

## Executive Summary

All eight phases explicitly listed in `TASKS.md` are implemented in the frontend. The application is not yet end-to-end complete under the repository `README.md`, `ARCHITECTURE.md`, `CODEX.md`, or Definition of Done.

The primary release blocker is that the frontend consumes a platform-owned FastAPI gateway that is not implemented in this repository. Consequently, Dashboard, upload, processed analysis retrieval, inference, scientific results, and report generation cannot work against a real platform backend. MAST search and download have upstream HTTP routes, but the platform gateway/proxy layer is still absent.

Two required upstream capabilities are also missing:

1. `transitlens-data-pipeline` has no public byte-upload route.
2. `transitlens-ml-core` has a stable Python inference result contract but no HTTP application.

In addition, transit depth, transit duration, and estimated period are required by the platform but are not produced by the current data-pipeline public contract. Settings and About are required pages but have no phases in `TASKS.md` and remain unimplemented.

**Overall assessment:** Phased frontend prototype complete; integrated product incomplete.  
**Release recommendation:** Do not label the platform end-to-end complete until Critical and High findings are resolved and contract-level integration tests pass.

## Audit Method

The audit compared:

- required pages and responsibilities in `README.md`, `ARCHITECTURE.md`, and `CODEX.md`;
- phase acceptance criteria in `TASKS.md`;
- completion claims and declared contracts in `HANDOFF.md`;
- actual frontend routes, navigation, and service calls under `src/`;
- public API routes in `transitlens-data-pipeline`;
- public inference types and HTTP surface in `transitlens-ml-core`.

No scientific algorithms were executed or reimplemented during this audit.

## Findings

### F-01 — Platform FastAPI gateway is absent

**Severity:** Critical  
**Owner:** `transitlens-platform`  
**Status:** Open

The repository owns the Backend API Gateway and specifies FastAPI as its backend stack, but contains no implemented platform backend. The frontend defaults to `http://localhost:8000/api` and calls gateway contracts that exist only as TypeScript consumers and documentation.

Affected contracts:

| Frontend contract | Required behavior |
|---|---|
| `GET /dashboard/summary` | Aggregate pipeline/ML health, model version, downloads, analyses, and jobs |
| `GET /search` | Proxy/orchestrate data-pipeline MAST search |
| `POST /download` | Proxy/orchestrate data-pipeline observation download |
| `POST /uploads` | Accept multipart local files and submit them to the data pipeline |
| `GET /analyses/{id}` | Return processed light-curve arrays and provenance |
| `POST /analyses/{id}/prediction` | Submit the processed record to ML Core |
| `GET /analyses/{id}/results` | Compose scientific metrics, provenance, and prediction |
| `POST /analyses/{id}/reports` | Generate PDF, JSON, or CSV artifacts |

**Impact:** The majority of implemented user workflows resolve to loading/error states without a separately supplied gateway.

**Required remediation:** Implement a FastAPI gateway in this repository using only the public APIs of the data-pipeline and ML-core services. Add request/response validation, timeouts, error translation, secure configuration, and OpenAPI contract tests.

### F-02 — Data Pipeline cannot accept uploaded file bytes

**Severity:** Critical  
**Owner:** `transitlens-data-pipeline` for the upstream API; `transitlens-platform` for orchestration  
**Status:** Open

The data pipeline exposes `/status`, `/search`, `/download`, and `/process`. Its `/process` route accepts a path already inside the pipeline cache. It does not expose a multipart or streamed upload endpoint.

The platform must not use shared-filesystem assumptions or parse FITS/CSV files locally. Therefore, the platform gateway cannot safely fulfill `POST /uploads` using the current upstream public interface.

**Impact:** Local FITS, FIT, and CSV uploads cannot complete the required preprocessing workflow through public APIs.

**Required remediation:** Add an authenticated, size-limited, streamed byte-upload endpoint to `transitlens-data-pipeline`. It should place accepted content in the pipeline-owned cache, validate supported formats, return an opaque file reference, and allow `/process` to consume that reference without exposing arbitrary filesystem paths.

### F-03 — ML Core has no HTTP inference service

**Severity:** Critical  
**Owner:** `transitlens-ml-core`  
**Status:** Open

ML Core defines the stable `PredictionResult` fields:

- probability;
- confidence;
- predicted class;
- model version;
- inference time.

It does not expose a FastAPI/HTTP route. The platform is forbidden from importing or duplicating ML implementation.

**Impact:** `POST /analyses/{id}/prediction` cannot be fulfilled through the required service boundary.

**Required remediation:** Expose a public inference API from `transitlens-ml-core` that accepts the canonical processed-light-curve contract, loads an approved model artifact, and returns the existing stable prediction contract. Include health/model-info endpoints and timeout/error semantics.

### F-04 — Three required scientific metrics have no upstream producer

**Severity:** High  
**Owner:** Scientific metric owner to be assigned; likely `transitlens-data-pipeline`  
**Status:** Open

The data-pipeline feature contract currently provides SNR, observation duration, cadence, and statistical features. It does not provide:

- transit depth;
- transit duration;
- estimated period.

The Results UI correctly displays these as unavailable when values are null and does not estimate them locally.

**Impact:** A complete scientific summary and complete reports cannot be produced from current upstream outputs.

**Required remediation:** Define the authoritative algorithm owner and add these values to a versioned public scientific-results contract. Document units, nullability, method/version provenance, and validation ranges. Do not calculate them in the platform.

### F-05 — Settings page is missing

**Severity:** High  
**Owner:** `transitlens-platform`  
**Status:** Open

Settings is required by `ARCHITECTURE.md` and `CODEX.md`, but no `/settings` route exists and navigation marks it disabled.

Required settings:

- MAST API token;
- Pipeline API URL;
- ML Core API URL;
- default download location;
- theme;
- cache settings.

**Impact:** Users cannot configure the service topology required by the Definition of Done. The build-time `VITE_PLATFORM_API_URL` alone is insufficient for the required settings experience.

**Required remediation:** Implement the Settings page and define which values are runtime-session settings versus server-managed environment configuration. Credentials must never enter local storage, logs, URLs, or source-controlled files.

### F-06 — About page is missing

**Severity:** Medium  
**Owner:** `transitlens-platform`  
**Status:** Open

About is a required page, but no `/about` route exists and navigation marks it disabled.

**Impact:** The application lacks a required user-facing explanation of purpose, workflow, service ownership, software/model versions, limitations, and scientific-use disclaimer.

**Required remediation:** Implement an About page based strictly on repository documentation and live version metadata where available.

### F-07 — Tests validate mocked contracts, not real service compatibility

**Severity:** High  
**Owner:** `transitlens-platform`, with upstream repositories participating  
**Status:** Open

The frontend suite verifies routing, UI states, structural validation, and mocked network requests. It does not prove that a real platform gateway, data pipeline, and ML Core service agree on paths, payloads, errors, CORS, upload behavior, timeouts, or report downloads.

**Impact:** Contract drift may remain undetected despite all frontend tests passing.

**Required remediation:** Add:

- OpenAPI schema compatibility tests;
- gateway-to-pipeline integration tests;
- gateway-to-ML integration tests;
- browser-level search → download/upload → process → predict → results → report tests;
- failure-path tests for unavailable services, large uploads, malformed outputs, and timeouts.

### F-08 — Session/configuration behavior is only partially implemented

**Severity:** Medium  
**Owner:** `transitlens-platform`  
**Status:** Open

The frontend retains a MAST token and current analysis reference in browser session storage. There is no backend session model, secure server-side credential handling, cache policy, or runtime configuration lifecycle.

**Impact:** Session continuity, credential ownership, and multi-request orchestration are not fully defined.

**Required remediation:** Define a minimal single-user prototype session contract. Keep credentials server-side or ephemeral, return opaque session identifiers, document expiry, and avoid persisting secrets in browser or application logs.

## Definition-of-Done Audit

| Required outcome | Frontend | Real backend/upstream path | Audit result |
|---|---:|---:|---|
| Configure MAST credentials | Partial | Missing gateway/session handling | Not complete |
| Search observations | Implemented | Pipeline route exists; gateway absent | Not integrated |
| Download FITS | Implemented | Pipeline route exists; gateway absent | Not integrated |
| Upload local FITS/CSV | Implemented | Upstream upload route absent | Blocked |
| Trigger preprocessing | UI contract implemented | Upload-to-process bridge absent | Blocked |
| Visualize preprocessing stages | Implemented | Requires gateway analysis record | Not integrated |
| Run inference | Implemented | ML HTTP API absent | Blocked |
| View scientific metrics | Implemented | Three required metrics absent upstream | Partial |
| Generate reports | Implemented | Gateway report generator absent | Not integrated |
| Export results | Implemented | Gateway binary artifacts absent | Not integrated |

## Recommended Remediation Order

1. **Freeze versioned contracts.** Define OpenAPI schemas for pipeline upload, ML inference, platform analysis/results, and report generation.
2. **Add the data-pipeline upload API.** Resolve the local-file ingestion blocker without shared filesystem coupling.
3. **Add the ML Core inference API.** Expose the existing stable predictor contract over HTTP.
4. **Implement the platform FastAPI gateway.** Orchestrate only; do not import scientific implementations.
5. **Assign and implement missing scientific metrics upstream.** Include units and provenance.
6. **Implement Settings and About.** Complete the required route set and secure configuration flow.
7. **Add cross-repository integration tests.** Test real services and the complete browser workflow.
8. **Run a final release audit.** Recheck accessibility, responsive layouts, security, error states, performance, and the full Definition of Done.

## Acceptance Criteria for Closing This Audit

This audit can be closed when:

- Settings and About are routable and tested;
- every frontend gateway contract has a matching implemented FastAPI route;
- pipeline upload and ML inference are available through public APIs;
- transit depth, transit duration, and estimated period have an authoritative upstream producer or an approved documented nullable policy;
- all service contracts are versioned and tested against live implementations;
- the complete workflow succeeds without mocks;
- credentials are handled securely;
- PDF, JSON, and CSV artifacts contain the required information and pass format validation;
- `HANDOFF.md` records the integrated verification evidence.

## Final Audit Opinion

The repository accurately represents a strong, production-oriented frontend prototype across all eight planned phases. Calling the phases complete is justified against `TASKS.md`. Calling the overall TransitLens platform complete is not yet justified because the owned backend gateway and several required upstream public capabilities are missing.

The correct project status is:

> **Frontend phase plan complete; end-to-end platform integration blocked by gateway and upstream API gaps.**
