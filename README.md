# 🌀 Continuum: Engineering Memory & Self-Healing Platform

Continuum is a next-generation engineering memory platform that resolves the software industry's costliest repetition: **teams solving the same problems repeatedly because organizational knowledge disappears.**

Continuum acts as a unified engineering memory loop:
1. **Self-Healing Loop (Ops Mode)**: Intercepts production incidents/CI failures, checks them against semantic memory (Hindsight), automatically modifies code, pushes a branch, opens a Pull Request, and verifies the resolution in CI.
2. **Contributor Hub (Dev Mode)**: Optimizes open-source developer workflows by scanning public repositories, indexing their issue/PR history, routing tasks via CascadeFlow, and rendering a step-by-step contribution blueprint.

---

## 📐 Platform Architecture

Continuum orchestrates input telemetry, vector memory retrieval, cost-optimal LLM routing, and automated code deployment in a seamless feedback loop.

```mermaid
graph TD
    subgraph Input Ingestion
        A[Incident CI Failure logs] -->|Ops Mode| C[CascadeFlow Routing Engine]
        B[GitHub URL / Repo Input] -->|Dev Mode| C
    end

    subgraph Memory & Context
        C <-->|Query Semantic Matches| D[(Hindsight Memory Bank)]
        E[Closed PR History] -->|Indexed Vectors| D
    end

    subgraph LLM Tiering
        C -->|Low Risk / Memory Match| F[Cheap Model: Gemini-2.5-Flash]
        C -->|High Risk / Novel Error| G[Capable Model: Gemini-2.5-Pro]
    end

    subgraph Execution & Output
        F & G -->|Propose Code Fix| H[GitHub API: Branch, PR, & CI Polling]
        F & G -->|Propose Blueprint| I[Issue Explorer & Contribution Guidance]
    end

    subgraph Interactive UI
        H & I -->|SSE updates / Dynamic Cards| J[Premium Dashboard UI]
    end
    
    style C fill:#6366f1,stroke:#4f46e5,color:#fff
    style D fill:#10b981,stroke:#059669,color:#fff
    style J fill:#f59e0b,stroke:#d97706,color:#fff
```

---

## 🧠 Core Capabilities

### 1. CascadeFlow Routing Engine
To prevent runaway API bills, **CascadeFlow** acts as an intelligent model routing gateway. 
- When an incident or issue is ingested, CascadeFlow calculates its semantic similarity against the Hindsight vector index.
- **Low-Risk / Known Issue (Similarity > 65%)**: Guided to the **Cheap Model** (Gemini 2.5 Flash) with contextual memory injected, reducing response cost by up to 90%.
- **High-Risk / Novel Issue (Similarity <= 65%)**: Escalated to the **Capable Model** (Gemini 2.5 Pro) for advanced reasoning.

### 2. Hindsight Memory Bank
An active vector database (backed by Supabase pgvector or a local vectorized key-value memory fallback) that indexes closed pull requests, code modifications, and incident histories. This provides a permanent context engine that guarantees Continuum grows smarter with every PR merged.

### 3. Self-Healing Loop (Ops Mode)
- **Telemetry Ingestion**: Monitors CI/CD pipelines and runs.
- **Root Cause Analysis (RCA)**: Pinpoints the specific file, commit, and line of code that triggered the failure.
- **Git Orchestration**: Instantly spins up a temporary fix branch (e.g. `continuum-fix/inc-12345`), performs code repair, and creates a GitHub Pull Request.
- **CI Loop Validation**: Polls the repository's GitHub Actions status to verify if the checks pass.
  - If the check passes, the fix transitions to `Verified` and the solution gets indexed into Hindsight memory.
  - If it fails, the platform automatically escalates to a higher LLM tier for another self-healing iteration.

### 4. Open Source Contributor Hub (Dev Mode)
- **Repository Scanning**: Ingests arbitrary public repositories, parses branches, and validates structure.
- **Blueprint Blueprinting**: Creates an actionable contribution blueprint for developers, detailing matching past PRs, target source files, explicit line-by-line modifications, and local testing instructions.

---

## 🛠️ Technology Stack

### Backend
* **Runtime / Framework**: Node.js, Express, TypeScript
* **Database**: Supabase PostgreSQL with local memory cache backup
* **LLM Engine**: Google Gemini API (Gemini 2.5 Flash & Gemini 2.5 Pro)
* **GitHub Integration**: Octokit REST & Actions client
* **Orchestration**: Server-Sent Events (SSE) stream for real-time frontend updates

### Frontend
* **Core**: React 18, TypeScript, Vite
* **Style System**: Premium custom Vanilla CSS (dark theme, glassmorphism, responsive telemetry widgets, and layout grids)
* **Visuals**: Lucide React Icons

---

## ⚙️ Environment Configuration

Set up the following variables in `backend/.env` to spin up the platform:

```ini
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-key

# GitHub Token for Live API Scans and Ingestion
GITHUB_TOKEN=ghp_yourGitHubPersonalAccessTokenHere

# Hindsight LLM Integration
HINDSIGHT_URL=http://127.0.0.1:8888
HINDSIGHT_LLM_PROVIDER=gemini
HINDSIGHT_LLM_API_KEY=yourGeminiAPIKeyHere
HINDSIGHT_LLM_MODEL=gemini-2.5-flash
CASCADEFLOW_MODE=enforce
CASCADEFLOW_BUDGET=0.50

# Simulation Mode (Set to true to enable manual telemetry incident testing)
SIMULATION_MODE=true
```

---

## 🚀 Quick Start Guide

### Step 1: Database Setup
Apply the schema in `backend/src/db/schema.sql` to your PostgreSQL / Supabase database instance to provision the tables for:
* `repositories`
* `installations`
* `incidents`
* `memories`
* `audit_logs`

### Step 2: Boot Backend
```bash
cd backend
npm install
npm run build
npm run start
```
*The backend server will launch on `http://localhost:3001`.*

### Step 3: Boot Frontend
```bash
cd frontend
npm install
npm run dev
```
*The frontend application will launch on `http://localhost:5173`.*

---

## 💡 Pitch Demo Scenarios

Continuum includes **Demo Presets** that automatically map mock files to live public contexts on `expressjs/express` to showcase production capabilities:

1. **Payments Off-By-One (Line 42)**
   - Maps to `lib/application.js` (Line 20) in `expressjs/express`.
   - Returns real commit lineages, links to active PR `#6464`, and pulls actual comments from live GitHub contributors (`bjohansebas`, `myselfsiddharth`, `danizavtz`) complete with dynamic profile pictures.
2. **Inverted Healthcheck Assertion (Line 14)**
   - Maps to `lib/request.js` (Line 35) in `expressjs/express`.
3. **DB Connection Outage (Line 12)**
   - Maps to `lib/response.js` (Line 50) in `expressjs/express`.

When scanning repositories in **Contributor Hub**:
- Scan `google/deepmind-agent` (a custom mock preset) to preview detailed Blueprints and local testing plans.
- Scan any live public repository (e.g. `facebook/react`, `vercel/next.js`, or custom user repositories) to ingest real-time GitHub issues, vector-index past PR histories into Hindsight, and retrieve dynamic AI Blueprints.
