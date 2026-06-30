# CODEX.md

# TransitLens Platform Codex Guide

Read this file before implementing code.

---

# Repository Mission

Build a production-quality scientific web platform for exoplanet transit detection.

The platform orchestrates data acquisition, preprocessing, visualization, inference, and reporting.

---

# Scope

Implement

React frontend

FastAPI backend

Routing

Charts

API integration

Settings

Scientific dashboard

Report generation

---

# Do Not Implement

Wavelet preprocessing

CNN

Autoencoder

Training

FITS parsing

Astroquery

Database

These belong to other repositories.

---

# Technology Stack

Frontend

React

TypeScript

Vite

Tailwind CSS

React Query

Plotly

React Hook Form

Backend

FastAPI

---

# UI Principles

Scientific

Minimal

Fast

Responsive

Accessible

Professional

Avoid excessive animations.

Prioritize readability.

---

# Required Pages

Home

Dashboard

MAST Explorer

Upload

Analysis

Results

Reports

Settings

About

---

# Required Components

Navigation

Status Cards

Observation Table

Metadata Panel

Raw Light Curve Plot

Normalized Curve Plot

Wavelet Plot

Prediction Card

Probability Gauge

Scientific Metrics Panel

Report Export Dialog

Loading Overlay

Error Panel

---

# Required Visualizations

Raw Light Curve

Normalized Light Curve

Wavelet Denoised Curve

Transit Probability

Detected Transit Highlight

Prediction Summary

---

# Settings

Allow configuration of

MAST API Token

Pipeline URL

ML Core URL

Download Directory

Theme

---

# API Usage

Only communicate with

transitlens-data-pipeline

transitlens-ml-core

Never implement preprocessing locally.

Never implement ML locally.

---

# Code Quality

Use

TypeScript

Functional Components

Custom Hooks

Reusable Components

Strict typing

No duplicated code.

---

# Performance

Lazy load pages.

Memoize expensive charts.

Virtualize long tables.

Avoid unnecessary re-renders.

---

# Testing

Implement

Component tests

API tests

Integration tests

Target coverage

80%

---

# Files You May Modify

src

tests

public

---

# Files You Must Not Modify

README.md

ARCHITECTURE.md

TASKS.md

HANDOFF.md

CODEX.md

unless explicitly instructed.

---

# Definition of Done

The platform is complete when a user can

Authenticate with MAST

Search observations

Download FITS

Upload local FITS

Visualize preprocessing

Run prediction

View scientific metrics

Generate reports

Export results

without leaving the application.