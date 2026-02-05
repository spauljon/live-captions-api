---
marp: true
theme: default
paginate: true
title: Personal Health Device Metrics Program
---
# Proven FHIR at Scale

## Built, Migrated, and Operated in Production

- Started with HAPI FHIR (DSTU2) in production
- Always-on migration to R4 with no downtime or data loss
- Scaled to **tens of millions** of patient-generated Observations
- Enterprise-grade FHIR service in continuous operation

---

# FHIR at Scale: What Breaks First

### The Reality

- Authorization becomes coarse or excessively complex
- Search collapses under time-series load
- Reprocessing historical data becomes risky
- **Redundant and repeated Observations accumulate over time**
  *(eroding trust in longitudinal analytics)*

---

# What We Built Instead

- RBAC with resource- and row-level FHIR authorization
- Partition-aware, time-series–optimized search
- Versioned FHIR profiling for deterministic replay
- Stable Observation identity and deduplication
- _Extra Credit_: Enriched, authorization-aware OpenAPI

---

# Designed for Replay, Recovery, and Long-Term Evolution

### What We Designed For

- Evolving FHIR profiles and validation rules
- Long-lived, continuously ingested device-generated metrics
- Correction strategies appropriate for streaming pipelines

---

### How We Addressed It

- Versioned FHIR profiling captured at ingestion
- Deterministic replay with historical profile traceability
- Profile auto-injection by resource type
- Rule-driven discovery of sub-resource profiles
- _Corrective replay as the primary data correction mechanism,
  with controlled intervention when necessary_

---

# Trust, Identity, and Longitudinal Integrity

### The Problem

- Device metrics arrive as dense, time-series data
- The same logical measurement may be ingested repeatedly
- Naïve measurement identity models treat each event as independent
- **Analytics lose meaning when measurement identity is unstable**

---

### Our Approach

- Stable Observation identity based on natural keys
- Association of related Observations over time
- Duplicate rejection
- Metric-level merging and coalescing
- Deterministic handling of repetition and re-ingestion

> **Longitudinal analytics that can be trusted — even under replay and correction**

---

# Performance Is a Feature

## When Data Never Stops

- Continuous, streaming, high-volume device data
- Growth is sustained, not bursty or batched
- Search paths dominate cost and latency

---

### How We Designed for Performance

- Partition-aware time-series data model
- Search parameter indexing engineered for scale
- Named queries for prominent access patterns
- Service-level pruning to contain query scope

> **Predictable performance under sustained growth — without sacrificing correctness**

---

# What This Enables for Our Partners

- **Faster Time to Value**
  Always-on migration and replay-safe ingestion
- **Lower Platform Risk**
  Designed-in security, identity, and correction strategies
- **Trusted Longitudinal Analytics**
  Stable identity even under replay and correction
- **Predictable Cost & Performance**
  Scale without runaway compute or search costs

---

# From FHIR Service to Governance & Stewardship

- Scale amplifies ambiguity in access, meaning, and responsibility
- Technical controls alone cannot encode policy
- Governance needs emerge *after* systems succeed

---

## Key Insight

> **Sustainable FHIR platforms require both execution and governance — treated as distinct concerns**

---

# Where We Go Beyond Stock HAPI FHIR

- **Enterprise Authorization Model**
  RBAC with resource- and row-level enforcement
- **Enriched OpenAPI with Interactive FHIR Schema Graphs**
  Endpoint-specific, navigable resource schemas
- **Versioned FHIR Profiling**
  Deterministic ingestion and replay safety
- **Time-Series Search Architecture**
  Live partitioned data model with partition-aware ingest and search
- **Named Query Optimization**
  Explicit tuning for dominant access paths
- **Stable Observation Identity**
  Natural-key association and deduplication
