# Continuum: Engineering Memory Platform — Comprehensive Implementation Plan

This document outlines the end-to-end architecture, database migrations, module implementations, integration specs, and required credentials to launch **Continuum** on your Supabase project `DevMind` (ID: `zxxxxfcnzsycidxkkwea`).

---

## 1. Directory Structure Reference

The application is structured as a monorepo containing a TypeScript Express backend and a React Vite frontend:
```text
d:\Vibe\Hackarambh\
├── backend/                  # Node.js + Express + TypeScript Backend
│   ├── src/
│   │   ├── config/           # App configuration & environment vars
│   │   ├── db/               # Supabase database clients, models, and fallback
│   │   ├── routes/           # Express routers (GitHub webhooks, REST API)
│   │   ├── services/         # Business logic
│   │   │   ├── github.ts     # GitHub App interactions, Octokit integration
│   │   │   ├── hindsight.ts  # Memory storage, recall, reflect via Hindsight SDK
│   │   │   ├── routing.ts    # CascadeFlow routing engine configuration
│   │   │   ├── investigator.ts # Incident state machine & fix generator
│   │   │   └── verification.ts # CI status checks & verification orchestration
│   │   └── index.ts          # Server entry point
│   ├── package.json
│   └── tsconfig.json
├── frontend/                 # React + Vite + TypeScript Frontend
│   ├── src/
│   │   ├── components/       # Reusable dashboard widgets
│   │   ├── hooks/            # Custom React hooks (SSE updates, memory search)
│   │   ├── pages/            # Dashboard page
│   │   ├── index.css         # Styling system (Vanilla CSS dark theme)
│   │   └── main.tsx          # Frontend entry point
│   ├── package.json
│   ├── vite.config.ts
│   └── tsconfig.json
├── PRD.md                    # Product Requirements Document
└── implementation_plan.md    # Reference plan
```

---

## 2. Database Schema (Supabase PostgreSQL)

Since the Supabase Management API does not allow direct DDL execution, you will need to execute the following SQL schema inside your **Supabase SQL Editor** to initialize the public schema tables.

### SQL Migration Script
```sql
-- 1. Installations Table
CREATE TABLE IF NOT EXISTS installations (
  id BIGINT PRIMARY KEY, -- GitHub App Installation ID
  account_id BIGINT NOT NULL,
  account_name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Repositories Table
CREATE TABLE IF NOT EXISTS repositories (
  id BIGINT PRIMARY KEY, -- GitHub Repository ID
  installation_id BIGINT REFERENCES installations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  full_name TEXT NOT NULL,
  tracked_branches TEXT[] DEFAULT '{"main", "master"}'::TEXT[] NOT NULL,
  high_risk_patterns TEXT[] DEFAULT '{"auth/", ".github/workflows/"}'::TEXT[] NOT NULL,
  direct_push_mode BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Incidents Table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id BIGINT REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  state TEXT NOT NULL DEFAULT 'detected', -- detected, recall, routing, investigating, fix_proposed, verifying, verified, refuted, escalated
  branch TEXT NOT NULL,
  pull_request_number INTEGER,
  commit_sha TEXT NOT NULL,
  error_signature TEXT NOT NULL,
  error_category TEXT NOT NULL,
  log_summary TEXT,
  proposed_fix_sha TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Routing Decisions Table
CREATE TABLE IF NOT EXISTS routing_decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  tier TEXT NOT NULL, -- cheap, capable
  confidence_score DOUBLE PRECISION NOT NULL,
  explanation TEXT NOT NULL,
  escalated BOOLEAN DEFAULT false NOT NULL,
  escalation_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. Memory Mirrors Table
CREATE TABLE IF NOT EXISTS memory_mirrors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id UUID REFERENCES incidents(id) ON DELETE CASCADE NOT NULL,
  hindsight_doc_id TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'hypothesis', -- hypothesis, verified, refuted, superseded
  similarity_score DOUBLE PRECISION NOT NULL,
  verification_evidence_url TEXT,
  superseded_by UUID REFERENCES memory_mirrors(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  repository_id BIGINT REFERENCES repositories(id) ON DELETE CASCADE NOT NULL,
  incident_id UUID REFERENCES incidents(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- detect_failure, recall_memories, routing_decision, commit_fix, post_badge, verify_success, verify_failure, escalation
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. Trigger to automatically update updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = now();
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_installations_updated_at BEFORE UPDATE
ON installations FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_repositories_updated_at BEFORE UPDATE
ON repositories FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE OR REPLACE TRIGGER update_incidents_updated_at BEFORE UPDATE
ON incidents FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
```

---

## 3. Sponsor Technology Integrations

### Hindsight (Memory Engine)
* **Isolated Memory Banks**: Dedicated memory bank created dynamically for each repository (`repo-${repoId}`).
* **Dispositions Configuration**: Setup with high `skepticism` (4) and `literalism` (4) and low `empathy` (1) for rigorous coding/debugging validation.
* **Recall Strategy**: Combined semantic and metadata filters query Hindsight prior to generating any code fixes.
* **Memory Evolution**: Retained hypotheses are marked `verified` upon CI verification success, or `refuted` upon failure. Previous memories are marked `superseded` and linked to new ones when an updated fix is proven.

### CascadeFlow (Routing Engine)
* **Reasoning Tiers**:
  * **Cheap Tier**: Low-cost, high-speed model (`gpt-4o-mini` or similar) used for high-confidence/strong memory matches.
  * **Capable Tier**: High-power, reasoning-heavy model (`gpt-4o` or similar) reserved for low-confidence, complex logs, or file patterns matching high-risk pathways (e.g. `auth/`, `.github/workflows/`).
* **Cost Tracking**: Logs and displays savings calculation ($0.15 for Capable, $0.01 for Cheap).

---

## 4. Frontend Engineering Dashboard Specs

The dashboard operates a glassmorphic interface built using React + Vite and Vanilla CSS, connecting to the backend via Server-Sent Events (SSE) for zero-latency, real-time feedback.
It contains the following key modules:
* **System Health Banner**: Shows active connection status and simulation mode state.
* **Control Deck**: Allows the user to trigger mock incidents (Standard Demo vs. Self-Healing Demo).
* **Incident Lifecycle Timeline**: Displays current incident state transitions (Detected -> Recall -> Routing -> Proposing -> Verifying -> Resolved/Escalated).
* **Routing Decision Widget**: Visualizes CascadeFlow's tier selection, confidence score, and explainability text.
* **Memory Matches Ledger**: Shows similar incident templates retrieved from Hindsight and their similarity scores.
* **Verification Log Stream**: Outputs live CI testing outputs step-by-step.
* **Metric Counter**: Tallies total cost saved by utilizing cheaper models routed via CascadeFlow.
* **Historical Ledger**: Interactive history of audited incident resolutions and logs.

---

## 5. Required Credentials & Inputs

To fully connect and operate the platform, please provide or configure the following keys:

1. **Supabase Database Credentials** (Done - auto-configured from token):
   * `SUPABASE_URL`: `https://zxxxxfcnzsycidxkkwea.supabase.co`
   * `SUPABASE_KEY`: (Service role or Anon key fetched using access token)
2. **Google Gemini API Key**:
   * Configured as the primary LLM provider for the Continuum self-healing state machine and Hindsight engine.
3. **GitHub App Credentials** (Optional - only if executing live GHA verification; otherwise mock is used):
   * `GITHUB_APP_ID`, `GITHUB_PRIVATE_KEY`, `GITHUB_WEBHOOK_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`.
4. **Hindsight Server URL** (Optional - defaults to auto-started local daemon at `http://127.0.0.1:8888`).

---

## 6. Action Items Checklist (Upon Approval)

* [x] Apply SQL Migration Script to Supabase project `DevMind` (SQL script provided for execution).
* [x] Update `backend/.env` with the new Supabase credentials and Google Gemini API key.
* [x] Start the backend service and Hindsight local daemon.
* [x] Spin up the React Vite development environment.
* [x] Validate the end-to-end incident pipeline execution in simulation mode.
