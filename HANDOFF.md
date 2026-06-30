# HANDOFF.md

# TransitLens Platform Handoff

## Repository Status

Current Phase

Phase 3 — Complete

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

Pending

Upload

Analysis

Results

Reports

Settings

About

---

## Phase 3 Verification

Passed

- ESLint with zero warnings
- Vitest: 10 tests
- TypeScript strict type-check
- Vite production build
- Browser verification of MAST navigation, form accessibility, identifier switching, validation, and console state

---

## Configuration

Copy `.env.example` to a local `.env` when overriding defaults.

- `VITE_PLATFORM_API_URL` defaults to `http://localhost:8000/api`
- `VITE_API_TIMEOUT_MS` defaults to `30000`

Credentials are not persisted by the Phase 1 foundation.

---

## Next Authorized Phase

Phase 4 — Upload

FITS and CSV upload, validation, progress, and processing submission are not yet implemented.

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
