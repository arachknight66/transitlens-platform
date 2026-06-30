# ARCHITECTURE.md

# TransitLens Platform Architecture

## High-Level Architecture

User

↓

Platform

↓

Data Pipeline

↓

ML Core

↓

Results

---

# Directory Structure

src/

pages/

components/

layouts/

hooks/

services/

api/

store/

types/

utils/

assets/

tests/

---

# Core Pages

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

# Dashboard

Displays

Recent analyses

Pipeline status

Connected services

Model version

Recent downloads

---

# MAST Explorer

Functions

Search

Authenticate

Download

Preview metadata

Queue analysis

---

# Upload

Supports

FITS

CSV

Drag and Drop

Validation

---

# Analysis

Display

Raw Light Curve

↓

Normalized Curve

↓

Wavelet Denoised Curve

↓

CNN Prediction

↓

Transit Probability

---

# Results

Display

Prediction

Confidence

Probability

Transit Depth

Transit Duration

Estimated Period

Model Version

Inference Time

---

# Reports

Export

PDF

CSV

JSON

---

# Settings

Configure

MAST API Token

Pipeline URL

ML Core URL

Theme

Caching

---

# Services

Pipeline Service

Responsible for

Search

Download

Processing

ML Service

Responsible for

Prediction

Confidence

Model Information

---

# API Flow

Frontend

↓

Platform Backend

↓

Data Pipeline

↓

ML Core

↓

Frontend

---

# State Management

Maintain

Current Observation

Analysis State

Prediction

Reports

User Settings

---

# Dependencies

Depends on

transitlens-data-pipeline

transitlens-ml-core

No repository depends on platform.