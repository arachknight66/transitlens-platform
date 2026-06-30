# README.md

# TransitLens Platform

## Overview

TransitLens Platform is the user-facing application for the TransitLens ecosystem.

It provides an end-to-end scientific workflow for searching, downloading, processing, analyzing, and detecting exoplanet transit signals from astronomical light curve data.

The platform communicates with:

- transitlens-data-pipeline
- transitlens-ml-core

The platform contains no preprocessing logic and no machine learning implementation.

Its responsibility is orchestration, visualization, and user interaction.

---

# Responsibilities

- Search astronomical observations
- Authenticate with MAST
- Download observations
- Upload FITS files
- Manage analysis jobs
- Visualize light curves
- Display preprocessing stages
- Execute ML inference
- Display predictions
- Generate scientific reports
- Export results

---

# User Workflow

Search Target

↓

Download Observation

↓

Preprocess Light Curve

↓

Visualize Raw Data

↓

Visualize Wavelet Denoising

↓

Run ML Prediction

↓

Display Transit Detection

↓

Generate Report

---

# Platform Features

## Dashboard

Overview of system status.

Recent analyses.

Model version.

Pipeline status.

---

## MAST Explorer

Search by

- Target Name
- TIC ID
- Kepler ID
- Observation ID

Download observations directly.

---

## FITS Upload

Accept

- FITS
- FIT
- CSV

---

## Processing Viewer

Visualize

Raw Light Curve

↓

Normalized Curve

↓

Wavelet Denoised Curve

---

## Detection Viewer

Display

Transit Probability

Confidence

Detected Transit

Prediction Time

---

## Scientific Analysis

Display

Transit Depth

Transit Duration

Estimated Period

Signal-to-Noise Ratio

Observation Metadata

---

## Results

Display

Prediction

Confidence

Inference Time

Model Version

---

## Report Generation

Generate

PDF

JSON

CSV

---

# Technology Stack

Frontend

React

TypeScript

Vite

Plotly

Tailwind CSS

Backend

FastAPI

---

# Non Goals

This repository must not implement

- FITS parsing
- Wavelet preprocessing
- CNN
- Training
- Autoencoders

Those belong to other repositories.