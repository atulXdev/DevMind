-- Schema definition for Continuum Engineering Memory Platform

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
  action TEXT NOT NULL, -- commit_fix, post_badge, open_pr, routing_escalation, recall_memories, verify_success, verify_failure
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
