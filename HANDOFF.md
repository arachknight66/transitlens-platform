# HANDOFF.md

# TransitLens Platform Handoff

## Repository Status

Current Phase

Phase 2 — Complete

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

Pending

MAST Explorer

Upload

Analysis

Results

Reports

Settings

About

---

## Phase 2 Verification

Passed

- ESLint with zero warnings
- Vitest: 5 tests
- TypeScript strict type-check
- Vite production build
- Browser verification of Home, navigation, Dashboard unavailable state, and horizontal overflow

---

## Configuration

Copy `.env.example` to a local `.env` when overriding defaults.

- `VITE_PLATFORM_API_URL` defaults to `http://localhost:8000/api`
- `VITE_API_TIMEOUT_MS` defaults to `30000`

Credentials are not persisted by the Phase 1 foundation.

---

## Next Authorized Phase

Phase 3 — MAST Explorer

Authentication, search, observation listing, and downloads are not yet implemented.

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
