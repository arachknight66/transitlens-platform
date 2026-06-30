# HANDOFF.md

# TransitLens Platform Handoff

## Repository Status

Current Phase

Phase 1 — Complete

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

Pending

Dashboard

MAST Explorer

Upload

Analysis

Results

Reports

Settings

About

---

## Phase 1 Verification

Passed

- ESLint with zero warnings
- Vitest: 4 tests
- TypeScript strict type-check
- Vite production build

---

## Configuration

Copy `.env.example` to a local `.env` when overriding defaults.

- `VITE_PLATFORM_API_URL` defaults to `http://localhost:8000/api`
- `VITE_API_TIMEOUT_MS` defaults to `30000`

Credentials are not persisted by the Phase 1 foundation.

---

## Next Authorized Phase

Phase 2 — Dashboard

Home, navigation, status cards, and recent jobs are not yet implemented.

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
