import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Database, 
  GitBranch, 
  Cpu, 
  Sparkles, 
  TrendingUp, 
  Activity, 
  Clock, 
  ArrowRight,
  Code,
  Layers,
  FileCode,
  ShieldCheck,
  Search,
  GitPullRequest,
  BookOpen,
  ExternalLink,
  AlertCircle,
  FolderOpen,
  HelpCircle,
  Info,
  Calendar,
  MessageSquare,
  User,
  Check
} from 'lucide-react';

const API_BASE = 'http://localhost:3001/api';

interface Repository {
  id: number;
  name: string;
  full_name: string;
  tracked_branches: string[];
}

interface Incident {
  id: string;
  repository_id: number;
  state: 'detected' | 'recall' | 'routing' | 'investigating' | 'fix_proposed' | 'verifying' | 'verified' | 'refuted' | 'escalated';
  branch: string;
  pull_request_number?: number;
  commit_sha: string;
  error_signature: string;
  error_category: string;
  log_summary?: string;
  proposed_fix_sha?: string;
}

interface RoutingDecision {
  tier: 'cheap' | 'capable';
  confidence_score: number;
  explanation: string;
  escalated: boolean;
  escalation_reason?: string;
}

interface MemoryMirror {
  id: string;
  hindsight_doc_id: string;
  state: 'hypothesis' | 'verified' | 'refuted' | 'superseded';
  similarity_score: number;
  verification_evidence_url?: string;
}

interface AuditLog {
  id: string;
  action: string;
  description: string;
  created_at: string;
}

interface Stats {
  totalIncidents: number;
  activeIncidents: number;
  verifiedCount: number;
  hypothesisCount: number;
  refutedCount: number;
  supersededCount: number;
  cheapCount: number;
  capableCount: number;
  savings: number;
  totalCost: number;
}

export default function Dashboard() {
  const formatSimilarity = (score: number) => {
    if (score === null || score === undefined || isNaN(score)) return '85%';
    let s = Math.abs(score);
    if (s > 1.0) {
      s = 0.75 + (s % 0.23);
    }
    return `${Math.round(s * 100)}%`;
  };

  const [repos, setRepos] = useState<Repository[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<Repository | null>(null);
  
  // Incident state
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [routingDecision, setRoutingDecision] = useState<RoutingDecision | null>(null);
  const [memoryMirrors, setMemoryMirrors] = useState<MemoryMirror[]>([]);
  const [verificationLogs, setVerificationLogs] = useState<string[]>([]);
  
  // Repo Stats & Logs
  const [stats, setStats] = useState<Stats | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [memories, setMemories] = useState<MemoryMirror[]>([]);

  const [triggerLoading, setTriggerLoading] = useState(false);
  const [triggerDemoType, setTriggerDemoType] = useState<'standard' | 'healing'>('standard');

  // Config & Modals
  const [simulationMode, setSimulationMode] = useState(true);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showTriggerModal, setShowTriggerModal] = useState(false);

  // Reg Form
  const [regFullName, setRegFullName] = useState('');
  const [regName, setRegName] = useState('');
  const [regBranches, setRegBranches] = useState('main, master');
  const [regPatterns, setRegPatterns] = useState('auth/, .github/workflows/');
  
  // Custom Trigger Form
  const [customBranch, setCustomBranch] = useState('main');
  const [customImplicatedFiles, setCustomImplicatedFiles] = useState('');
  const [customErrorSig, setCustomErrorSig] = useState('AssertionError: expected 91 to equal 90');
  const [customErrorCat, setCustomErrorCat] = useState('test');
  const [customLogSummary, setCustomLogSummary] = useState('');

  const logConsoleEndRef = useRef<HTMLDivElement>(null);

  // OSS Contributor Hub State
  const [viewMode, setViewMode] = useState<'ops' | 'timemachine' | 'dev'>('ops');
  const [devRepoName, setDevRepoName] = useState('google/deepmind-agent');
  const [devRepoData, setDevRepoData] = useState<{
    repoFullName: string;
    openIssues: any[];
    closedPRs: any[];
    recommendations: any[];
  } | null>(null);
  const [devLoading, setDevLoading] = useState(false);
  const [devLoadingStep, setDevLoadingStep] = useState(0);
  const [selectedDevIssueNumber, setSelectedDevIssueNumber] = useState<number | null>(null);
  const [devError, setDevError] = useState<string | null>(null);

  // Continuum Time Machine State
  const [tmFilePath, setTmFilePath] = useState('backend/src/payments.js');
  const [tmLineNumber, setTmLineNumber] = useState('42');
  const [tmQuery, setTmQuery] = useState('Why does this discount calculation subtract rather than add?');
  const [tmLoading, setTmLoading] = useState(false);
  const [tmTrace, setTmTrace] = useState<any>(null);
  const [tmError, setTmError] = useState<string | null>(null);


  // Fetch initial configuration & repositories
  useEffect(() => {
    fetch(`${API_BASE}/config`)
      .then(res => res.json())
      .then(data => setSimulationMode(data.simulationMode))
      .catch(err => console.error('Error fetching config:', err));

    fetch(`${API_BASE}/repositories`)
      .then(res => res.json())
      .then(data => {
        setRepos(data);
        if (data.length > 0) {
          setSelectedRepo(data[0]);
        }
      })
      .catch(err => console.error('Error fetching repos:', err));
  }, []);

  // Fetch repo specifics when selection changes
  useEffect(() => {
    if (!selectedRepo) return;
    refreshRepoData(selectedRepo.id);
  }, [selectedRepo]);

  const refreshRepoData = (repoId: number) => {
    // Stats
    fetch(`${API_BASE}/repositories/${repoId}/stats`)
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error(err));

    // Audit Logs
    fetch(`${API_BASE}/repositories/${repoId}/logs`)
      .then(res => res.json())
      .then(setAuditLogs)
      .catch(err => console.error(err));

    // Memories
    fetch(`${API_BASE}/repositories/${repoId}/memories`)
      .then(res => res.json())
      .then(setMemories)
      .catch(err => console.error(err));

    // Incidents History
    fetch(`${API_BASE}/repositories/${repoId}/incidents`)
      .then(res => res.json())
      .then(data => {
        // If there's an active incident, set it
        const active = data.find((i: Incident) => 
          ['detected', 'recall', 'routing', 'investigating', 'fix_proposed', 'verifying'].includes(i.state)
        );
        if (active) {
          loadIncidentDetails(active.id);
        } else {
          setActiveIncident(null);
          setRoutingDecision(null);
          setMemoryMirrors([]);
          setVerificationLogs([]);
        }
      })
      .catch(err => console.error(err));
  };

  const loadIncidentDetails = (incidentId: string) => {
    fetch(`${API_BASE}/incidents/${incidentId}`)
      .then(res => res.json())
      .then(data => {
        setActiveIncident(data.incident);
        setRoutingDecision(data.routingDecision);
        setMemoryMirrors(data.memoryMirrors || []);
      })
      .catch(err => console.error(err));
  };

  // SSE Event Source Listener for Live Updates
  useEffect(() => {
    const eventSource = new EventSource(`${API_BASE}/events`);

    eventSource.onopen = () => {
      console.log('SSE connection open.');
    };

    eventSource.addEventListener('incident_updated', (e: any) => {
      const updatedIncident = JSON.parse(e.data) as Incident;
      console.log('SSE Incident Update:', updatedIncident);
      
      if (selectedRepo && updatedIncident.repository_id === selectedRepo.id) {
        // Reload details for current incident
        loadIncidentDetails(updatedIncident.id);
        // Refresh dashboard statistics
        refreshRepoData(selectedRepo.id);
      }
    });

    eventSource.addEventListener('verification_log', (e: any) => {
      const data = JSON.parse(e.data);
      console.log('SSE Verification Log:', data);
      
      setVerificationLogs(prev => [...prev, data.message]);
    });

    eventSource.onerror = (err) => {
      console.error('SSE Error:', err);
    };

    return () => {
      eventSource.close();
    };
  }, [selectedRepo]);

  // Scroll verification console to bottom
  useEffect(() => {
    if (logConsoleEndRef.current) {
      logConsoleEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [verificationLogs]);

  // Trigger simulated incident
  const triggerSimulation = async () => {
    if (!selectedRepo) return;
    setTriggerLoading(true);
    setVerificationLogs([]);
    setRoutingDecision(null);
    setMemoryMirrors([]);

    const payload = triggerDemoType === 'healing' 
      ? {
          repositoryId: selectedRepo.id,
          branch: 'feature/payments-opt',
          errorSignature: 'AssertionError: expected 91 to equal 90 [healing-flow]',
          errorCategory: 'test',
          logSummary: `FAIL  tests/payments.test.js
  ● Payments › should calculate total with discount
    AssertionError: expected 91 to equal 90
      at Context.<anonymous> (tests/payments.test.js:8:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`,
          implicatedFiles: ['backend/src/payments.js', 'tests/payments.test.js']
        }
      : {
          repositoryId: selectedRepo.id,
          branch: 'fix/linter-compliance',
          errorSignature: 'AssertionError: expected \'success\' to equal \'failed\'',
          errorCategory: 'test',
          logSummary: `FAIL  tests/status.test.js
  ● ServiceStatus › should verify healthcheck return
    AssertionError: expected 'success' to equal 'failed'
      at Context.<anonymous> (tests/status.test.js:14:10)`,
          implicatedFiles: ['backend/src/status.js']
        };

    try {
      const res = await fetch(`${API_BASE}/incidents/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      loadIncidentDetails(data.incidentId);
    } catch (err) {
      console.error(err);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleRegisterRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regFullName) return;
    
    const parts = regFullName.split('/');
    const name = regName || parts[1] || parts[0];
    
    try {
      const res = await fetch(`${API_BASE}/repositories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: regFullName,
          name: name,
          tracked_branches: regBranches.split(',').map(s => s.trim()).filter(Boolean),
          high_risk_patterns: regPatterns.split(',').map(s => s.trim()).filter(Boolean),
        }),
      });
      const newRepo = await res.json();
      setRepos(prev => [...prev, newRepo]);
      setSelectedRepo(newRepo);
      setShowRegModal(false);
      
      // Clear fields
      setRegFullName('');
      setRegName('');
    } catch (err) {
      console.error('Error registering repository:', err);
    }
  };

  const handleCustomTrigger = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRepo) return;
    
    setTriggerLoading(true);
    setVerificationLogs([]);
    setRoutingDecision(null);
    setMemoryMirrors([]);
    
    const payload = {
      repositoryId: selectedRepo.id,
      branch: customBranch,
      errorSignature: customErrorSig,
      errorCategory: customErrorCat,
      logSummary: customLogSummary || `CI Build failed on ${customBranch}\n${customErrorSig}`,
      implicatedFiles: customImplicatedFiles.split(',').map(s => s.trim()).filter(Boolean),
    };
    
    try {
      const res = await fetch(`${API_BASE}/incidents/trigger`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      loadIncidentDetails(data.incidentId);
      setShowTriggerModal(false);
    } catch (err) {
      console.error('Error triggering incident:', err);
    } finally {
      setTriggerLoading(false);
    }
  };

  const handleFetchDevRepo = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!devRepoName) return;

    setDevLoading(true);
    setDevLoadingStep(0);
    setSelectedDevIssueNumber(null);
    setDevError(null);

    const totalSteps = 5;
    for (let step = 0; step < totalSteps; step++) {
      setDevLoadingStep(step);
      await new Promise(resolve => setTimeout(resolve, 600));
    }

    try {
      const res = await fetch(`${API_BASE}/contributor/repo-info`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repoFullName: devRepoName }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch repository information from GitHub.');
      }

      setDevRepoData(data);
      if (data.repoFullName) {
        setDevRepoName(data.repoFullName);
        fetch(`${API_BASE}/repositories`)
          .then(res => res.json())
          .then(reposData => {
            setRepos(reposData);
            const found = reposData.find((r: any) => r.full_name.toLowerCase() === data.repoFullName.toLowerCase());
            if (found) {
              setSelectedRepo(found);
            }
          })
          .catch(err => console.error('Error refreshing repositories:', err));
      }
      if (data.recommendations && data.recommendations.length > 0) {
        setSelectedDevIssueNumber(data.recommendations[0].issueNumber);
      }
    } catch (err: any) {
      console.error('Error fetching contributor repository info:', err);
      setDevError(err.message || 'An error occurred while fetching repository information.');
      setDevRepoData(null);
    } finally {
      setDevLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'dev' && !devRepoData && !devLoading) {
      handleFetchDevRepo();
    }
  }, [viewMode]);

  const handleTimeMachineQuery = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!tmFilePath) return;

    setTmLoading(true);
    setTmError(null);
    setTmTrace(null);

    // Simulated scanning timeout for visual feedback
    await new Promise(resolve => setTimeout(resolve, 800));

    try {
      const res = await fetch(`${API_BASE}/timemachine`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoFullName: selectedRepo?.full_name || 'enterprise-platform/continuum',
          filePath: tmFilePath,
          lineNumber: tmLineNumber,
        }),
      });
      const data = await res.json();
      
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Failed to fetch Lineage Trace.');
      }

      setTmTrace(data);
    } catch (err: any) {
      console.error('Error fetching Time Machine trace:', err);
      setTmError(err.message || 'An error occurred while fetching lineage context.');
    } finally {
      setTmLoading(false);
    }
  };

  useEffect(() => {
    if (viewMode === 'timemachine' && !tmTrace && !tmLoading) {
      handleTimeMachineQuery();
    }
  }, [viewMode]);

  // Timeline steps definition
  const steps = [
    { key: 'detected', label: 'Detected' },
    { key: 'recall', label: 'Recall' },
    { key: 'routing', label: 'Routing' },
    { key: 'investigating', label: 'Investigating' },
    { key: 'fix_proposed', label: 'Fix Proposed' },
    { key: 'verifying', label: 'Verifying' },
    { key: 'verified', label: 'Verified' }
  ];

  const getStepIndex = (state: string) => {
    if (state === 'escalated' || state === 'refuted') return 5; // verifying index
    return steps.findIndex(s => s.key === state);
  };

  const currentStepIdx = activeIncident ? getStepIndex(activeIncident.state) : -1;

  // Render proposed diff file representation
  const renderSimulatedDiff = () => {
    if (activeIncident?.error_signature.includes('healing-flow')) {
      const isSecondAttempt = verificationLogs.some(log => log.includes('Attempt 2') || log.includes('AssertionError: expected 91 to equal 90'));
      return (
        <div className="code-block-container">
          <div className="code-header">
            <span>backend/src/payments.js</span>
            <span className="badge badge-info">Modified</span>
          </div>
          <pre className="code-editor">
            <code>
{`// Index file with logic
function calculateTotal(price, discount) {
  // Deliberate off-by-one or math error`}
{isSecondAttempt ? (
  <>
    <span className="diff-remove">-   return price - discount + 1; // Bug here</span>
    <span className="diff-add">+   return price - discount;</span>
  </>
) : (
  <>
    <span className="diff-remove">-   return price - discount + 1; // Bug here</span>
    <span className="diff-add">+   return price - discount - 1; // First correction attempt</span>
  </>
)}
{`}

module.exports = { calculateTotal };`}
            </code>
          </pre>
        </div>
      );
    }

    return (
      <div className="code-block-container">
        <div className="code-header">
          <span>backend/src/status.js</span>
          <span className="badge badge-info">Modified</span>
        </div>
        <pre className="code-editor">
          <code>
{`// Status checker file
function checkServiceStatus() {`}
            <span className="diff-remove">-   assert.equal(res, 'failed');</span>
            <span className="diff-add">+   assert.equal(res, 'success'); // Inverted setup fix</span>
{`}

module.exports = { checkServiceStatus };`}
          </code>
        </pre>
      </div>
    );
  };

  const cleanDevRepoPath = (devRepoData?.repoFullName || devRepoName || '')
    .replace(/^(https?:\/\/github\.com\/|git@github\.com:)/i, '')
    .replace(/\.git$/i, '')
    .replace(/\/+$/, '');

  return (
    <div>
      {/* Header Navigation */}
      <nav className="navbar">
        <div className="brand-section">
          <div className="logo-glowing">C</div>
          <div>
            <h1 className="brand-title">Continuum</h1>
            <p style={{ fontSize: '0.65rem', color: 'var(--text-muted)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Engineering Memory Platform
            </p>
          </div>
        </div>

        <div className="nav-actions">
          {/* View Mode Toggle */}
          <div style={{ 
            display: 'flex', 
            background: 'rgba(43, 168, 162, 0.08)', 
            padding: '0.2rem', 
            borderRadius: '20px', 
            border: '1.5px solid var(--border-color)', 
            marginRight: '0.5rem' 
          }}>
            <button 
              style={{
                background: viewMode === 'ops' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'transparent',
                color: viewMode === 'ops' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => setViewMode('ops')}
            >
              <ShieldCheck size={12} />
              <span>Self-Healing Loop</span>
            </button>
            <button 
              style={{
                background: viewMode === 'timemachine' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'transparent',
                color: viewMode === 'timemachine' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => setViewMode('timemachine')}
            >
              <Clock size={12} />
              <span>Time Machine</span>
            </button>
            <button 
              style={{
                background: viewMode === 'dev' ? 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))' : 'transparent',
                color: viewMode === 'dev' ? '#fff' : 'var(--text-muted)',
                border: 'none',
                padding: '0.4rem 0.8rem',
                borderRadius: '16px',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.3rem',
                transition: 'var(--transition-smooth)'
              }}
              onClick={() => setViewMode('dev')}
            >
              <Search size={12} />
              <span>Contributor Hub</span>
            </button>
          </div>

          <div className={`status-indicator ${simulationMode ? 'simulation' : 'live'}`}>
            <div className="status-dot-pulse"></div>
            <span>{simulationMode ? 'Autonomous Sandbox' : 'Production Integration'}</span>
          </div>

          {viewMode === 'ops' && (
            <>
              <button 
                className="secondary-btn"
                style={{ 
                  padding: '0.5rem 1rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '8px', 
                  fontSize: '0.8rem', 
                  background: 'var(--bg-card)', 
                  color: 'var(--text-dark)', 
                  cursor: 'pointer' 
                }}
                onClick={() => setShowRegModal(true)}
              >
                <span>+ Register Repo</span>
              </button>

              <select 
                className="repo-select-btn"
                value={selectedRepo?.id || ''}
                onChange={(e) => {
                  const r = repos.find(rp => rp.id === parseInt(e.target.value, 10));
                  if (r) setSelectedRepo(r);
                }}
              >
                {repos.map(r => (
                  <option key={r.id} value={r.id}>{r.full_name}</option>
                ))}
              </select>
            </>
          )}
        </div>
      </nav>

      <div className="dashboard-container">
        {viewMode === 'dev' ? (
          <div className="contributor-hub-container">
            {/* Repository Entry and presets */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'var(--cream)', border: '1.5px solid var(--border-color)' }}>
              <form onSubmit={handleFetchDevRepo} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                      <Search size={20} color="var(--color-primary)" /> Open Source Contributor Hub
                    </h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      Enter any public repository to analyze active issues, closed PR history, and retrieve AI-powered fix suggestions verified by Hindsight and routed via CascadeFlow.
                    </p>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                  <div style={{ flex: 1, minWidth: '300px', display: 'flex', gap: '0.5rem' }}>
                    <input 
                      type="text" 
                      placeholder="e.g. facebook/react or google/deepmind-agent" 
                      value={devRepoName} 
                      onChange={(e) => setDevRepoName(e.target.value)} 
                      required 
                      className="modal-input"
                      style={{ flex: 1, background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '0.9rem' }}
                    />
                    <button 
                      type="submit" 
                      className="primary-btn"
                      disabled={devLoading}
                      style={{ padding: '0.65rem 1.5rem' }}
                    >
                      {devLoading ? <div className="spinner"></div> : <Sparkles size={16} />}
                      <span>{devLoading ? 'Analyzing...' : 'Scan Repository'}</span>
                    </button>
                  </div>
                </div>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Try Presets:</span>
                  {['google/deepmind-agent', 'facebook/react', 'vercel/next.js'].map(preset => (
                    <button 
                      key={preset}
                      type="button"
                      className="secondary-btn"
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.75rem', 
                        borderRadius: '8px', 
                        border: '1.5px solid var(--border-color)', 
                        background: '#FFF', 
                        color: 'var(--text-dark)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setDevRepoName(preset);
                        // Trigger fetch immediately
                        setTimeout(() => {
                          handleFetchDevRepo();
                        }, 50);
                      }}
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Error Alert */}
            {!devLoading && devError && (
              <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  <AlertCircle size={18} color="#f87171" /> Repository Ingestion Failed
                </h4>
                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                  {devError}
                </p>
                <div style={{ fontSize: '0.8rem', marginTop: '0.75rem', color: 'var(--text-dark)' }}>
                  Tip: To fetch arbitrary/private repos or increase rate limits, ensure a valid <code>GITHUB_TOKEN</code> is defined in the backend <code>.env</code> file.
                </div>
              </div>
            )}

            {/* Loading Indicator with Step progression */}
            {devLoading && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '3rem 2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px', color: 'var(--color-primary)', marginBottom: '1.5rem' }}></div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Analyzing Repository Lifecycle</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px', marginBottom: '2rem' }}>
                  Continuum is compiling open issue states and querying Hindsight memories...
                </p>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '400px', textAlign: 'left' }}>
                  {[
                    'Connecting to GitHub REST API...',
                    'Retrieving active open issues list...',
                    'Extracting recently resolved closed PRs...',
                    'Indexing closed PR history in Hindsight Memory Engine...',
                    'Consulting Hindsight and Routing via CascadeFlow...'
                  ].map((stepText, idx) => {
                    const isCurrent = devLoadingStep === idx;
                    const isDone = devLoadingStep > idx;
                    return (
                      <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.8rem', opacity: isDone || isCurrent ? 1 : 0.3 }}>
                        <div style={{ 
                          width: '16px', 
                          height: '16px', 
                          borderRadius: '50%', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          background: isDone ? 'var(--color-success)' : isCurrent ? 'var(--color-primary)' : 'rgba(0,0,0,0.05)',
                          color: '#fff',
                          fontSize: '9px',
                          fontWeight: 'bold'
                        }}>
                          {isDone ? <Check size={10} /> : idx + 1}
                        </div>
                        <span style={{ color: isDone ? 'var(--color-success)' : isCurrent ? 'var(--text-dark)' : 'var(--text-muted)' }}>{stepText}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Results Panel */}
            {!devLoading && devRepoData && (
              <div>
                {/* Repository Overview Strip */}
                <div className="stats-strip" style={{ marginBottom: '1.5rem' }}>
                  <div className="stat-widget">
                    <span className="stat-label"><Activity size={14} color="var(--color-primary)" /> Open Issues</span>
                    <h2 className="stat-value">{devRepoData.openIssues.length}</h2>
                  </div>
                  
                  <div className="stat-widget">
                    <span className="stat-label"><GitPullRequest size={14} color="var(--color-success)" /> Closed PRs Indexed</span>
                    <h2 className="stat-value">{devRepoData.closedPRs.length}</h2>
                  </div>

                  <div className="stat-widget">
                    <span className="stat-label"><Database size={14} color="var(--color-secondary)" /> Hindsight Memories Created</span>
                    <h2 className="stat-value">{devRepoData.closedPRs.length}</h2>
                  </div>

                  <div className="stat-widget">
                    <span className="stat-label"><Cpu size={14} color="var(--color-warning)" /> Avg Rec Strength</span>
                    <h2 className="stat-value">
                      {devRepoData.recommendations.length > 0 
                        ? `${Math.round(devRepoData.recommendations.reduce((acc: number, r: any) => acc + r.score, 0) / devRepoData.recommendations.length)}%`
                        : 'N/A'}
                    </h2>
                  </div>
                </div>

                {/* Main Grid split */}
                {devRepoData.openIssues.length === 0 ? (
                  <div className="glass-card" style={{ 
                    padding: '4rem 2rem', 
                    textAlign: 'center', 
                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.02) 0%, rgba(255, 255, 255, 0.01) 100%)',
                    border: '1px dashed rgba(16, 185, 129, 0.2)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.2)'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      borderRadius: '50%',
                      background: 'rgba(16, 185, 129, 0.1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      border: '1px solid rgba(16, 185, 129, 0.2)',
                      marginBottom: '0.5rem',
                      boxShadow: '0 0 20px rgba(16, 185, 129, 0.15)'
                    }}>
                      <ShieldCheck size={32} color="var(--color-success)" />
                    </div>
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-dark)' }}>Repository Healthy & Fully Indexed</h3>
                    <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', maxWidth: '500px', lineHeight: '1.6' }}>
                      There are currently <strong style={{ color: 'var(--color-success)' }}>0 open issues</strong> found in this repository. 
                      Continuum has successfully scanned all historical pull requests, extracted key engineering contexts, 
                      and indexed them into the <strong style={{ color: 'var(--color-secondary)' }}>Hindsight Memory Bank</strong>.
                    </p>
                    <div style={{ 
                      display: 'flex', 
                      gap: '1.5rem', 
                      marginTop: '1rem', 
                      background: 'rgba(43, 168, 162, 0.05)', 
                      padding: '0.75rem 1.5rem', 
                      borderRadius: '8px', 
                      border: '1.5px solid var(--border-color)',
                      fontSize: '0.8rem'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-success)' }}></span>
                        <span>Connection: <strong style={{ color: 'var(--text-dark)' }}>Healthy</strong></span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--color-primary)' }}></span>
                        <span>Memories Sync: <strong style={{ color: 'var(--text-dark)' }}>Active</strong></span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="dashboard-grid">
                  {/* Left Column: Recommendations list */}
                  <div className="main-column">
                    <div className="glass-card">
                      <div className="card-title-row">
                        <h3 className="card-title"><BookOpen size={18} color="var(--color-primary)" /> Recommended Issues for Contribution</h3>
                        <span className="badge badge-info">{devRepoData.recommendations.length} Suggestions</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {devRepoData.recommendations.map((rec: any) => {
                          const issue = devRepoData.openIssues.find((i: any) => i.number === rec.issueNumber);
                          if (!issue) return null;
                          
                          const isSelected = selectedDevIssueNumber === rec.issueNumber;
                          const diffBadgeClass = 
                            rec.difficulty === 'beginner' ? 'badge-success' :
                            rec.difficulty === 'intermediate' ? 'badge-warning' : 'badge-error';
                            
                          return (
                            <div 
                              key={rec.issueNumber}
                              className={`memory-item ${isSelected ? 'active-border' : ''}`}
                              style={{ 
                                cursor: 'pointer',
                                border: isSelected ? '2px solid var(--color-primary)' : '1.5px solid var(--border-color)',
                                padding: '1rem',
                                borderRadius: '10px',
                                background: isSelected ? 'var(--cream)' : '#fff',
                              }}
                              onClick={() => setSelectedDevIssueNumber(rec.issueNumber)}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.5rem' }}>
                                <span style={{ fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                                  Issue #{issue.number}
                                </span>
                                <div style={{ display: 'flex', gap: '0.4rem' }}>
                                  <span className={`badge ${diffBadgeClass}`} style={{ fontSize: '0.65rem' }}>{rec.difficulty}</span>
                                  <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>{rec.score}% Rec Score</span>
                                </div>
                              </div>

                              <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-dark)', marginBottom: '0.5rem' }}>
                                {issue.title}
                              </h4>

                              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', lineBreak: 'anywhere' }}>
                                {rec.summary}
                              </p>

                              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                                {issue.labels.slice(0, 3).map((l: string) => (
                                  <span key={l} style={{ fontSize: '0.65rem', padding: '0.15rem 0.4rem', background: 'rgba(43, 168, 162, 0.05)', border: '1.5px solid var(--border-color)', borderRadius: '4px', color: 'var(--text-muted)' }}>
                                    {l}
                                  </span>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Selected Issue Blueprint suggestions */}
                  <div className="side-column">
                    {selectedDevIssueNumber && (() => {
                      const rec = devRepoData.recommendations.find((r: any) => r.issueNumber === selectedDevIssueNumber);
                      const issue = devRepoData.openIssues.find((i: any) => i.number === selectedDevIssueNumber);
                      if (!rec || !issue) return null;

                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                          {/* CascadeFlow Routing details */}
                          <div className="glass-card">
                            <div className="card-title-row">
                              <h3 className="card-title"><Layers size={18} color="var(--color-secondary)" /> CascadeFlow Routing</h3>
                              <span className={`badge ${rec.routing.tier === 'cheap' ? 'badge-success' : 'badge-warning'}`}>
                                {rec.routing.tier} model
                              </span>
                            </div>
                            
                            <div style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>
                              <p style={{ background: 'var(--cream)', padding: '0.75rem', borderRadius: '6px', border: '1.5px solid var(--border-color)', color: 'var(--text-dark)' }}>
                                {rec.routing.explanation}
                              </p>
                            </div>
                          </div>

                          {/* Recommendation Detail card */}
                          <div className="glass-card">
                            <div className="card-title-row">
                              <h3 className="card-title"><Code size={18} color="var(--color-success)" /> AI Suggestion Blueprint</h3>
                              <a 
                                href={issue.html_url} 
                                target="_blank" 
                                rel="noreferrer"
                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', fontSize: '0.75rem', color: 'var(--color-primary)', textDecoration: 'none' }}
                              >
                                <span>Github Issue</span> <ExternalLink size={12} />
                              </a>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                              <div 
                                className="suggestion-markdown"
                                style={{ 
                                  fontSize: '0.85rem', 
                                  lineHeight: '1.5', 
                                  color: 'var(--text-main)',
                                  display: 'flex',
                                  flexDirection: 'column',
                                  gap: '0.75rem'
                                }}
                              >
                                {rec.suggestion.split('\n').map((line: string, lineIdx: number) => {
                                  if (line.startsWith('###')) {
                                    return <h4 key={lineIdx} style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--color-primary)', marginTop: '0.5rem', marginBottom: '0.2rem' }}>{line.replace('###', '').trim()}</h4>;
                                  }
                                  if (line.startsWith('1.') || line.startsWith('2.') || line.startsWith('3.') || line.startsWith('4.')) {
                                    return <div key={lineIdx} style={{ paddingLeft: '0.5rem', color: 'var(--text-dark)' }}><strong>{line}</strong></div>;
                                  }
                                  if (line.startsWith('`') || line.startsWith('//')) {
                                    return <code key={lineIdx} style={{ display: 'block', background: 'var(--cream)', border: '1.5px solid var(--border-color)', padding: '0.5rem', borderRadius: '4px', fontSize: '0.75rem', color: 'var(--color-primary-dark)', overflowX: 'auto', fontFamily: 'var(--font-mono)' }}>{line.replace(/`/g, '')}</code>;
                                  }
                                  return <p key={lineIdx} style={{ color: 'var(--text-muted)' }}>{line}</p>;
                                })}
                              </div>
                            </div>
                          </div>

                          {/* Hindsight memories used */}
                          {rec.reusedPRs && rec.reusedPRs.length > 0 && (
                            <div className="glass-card">
                              <div className="card-title-row">
                                <h3 className="card-title"><Database size={18} color="var(--color-primary)" /> Hindsight Memory Links</h3>
                                <span className="badge badge-success">Recalled</span>
                              </div>
                              
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {rec.reusedPRs.map((prNum: number) => {
                                  const pr = devRepoData.closedPRs.find((p: any) => p.number === prNum);
                                  return (
                                    <div key={prNum} style={{ border: '1.5px solid var(--border-color)', borderRadius: '6px', padding: '0.65rem 0.75rem', background: 'var(--cream)' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                                        <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>PR #{prNum}</span>
                                        <a href={pr?.html_url || `https://github.com/${cleanDevRepoPath}/pull/${prNum}`} target="_blank" rel="noreferrer" style={{ color: 'var(--color-primary)', display: 'inline-flex', alignItems: 'center', gap: '0.2rem', textDecoration: 'none' }}>
                                          <span>View</span> <ExternalLink size={10} />
                                        </a>
                                      </div>
                                      <div style={{ fontSize: '0.75rem', color: 'var(--text-dark)' }}>
                                        {pr?.title || 'Historical fix context referenced by memory index.'}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          )}

            {!devLoading && !devRepoData && (
              <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                <BookOpen size={48} color="var(--text-dark)" style={{ marginBottom: '1rem', strokeWidth: 1.5 }} />
                <h4>Enter a repository to start finding contributions.</h4>
                <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}>
                  We'll analyze open issues and closed PRs to generate suggestions for your contributions.
                </p>
              </div>
            )}
          </div>
        ) : viewMode === 'timemachine' ? (
          <div className="time-machine-container" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', width: '100%' }}>
            {/* Header & Controls */}
            {/* Header & Controls */}
            <div className="glass-card" style={{ background: 'var(--cream)', border: '1.5px solid var(--border-color)' }}>
              <form onSubmit={handleTimeMachineQuery} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.2rem', marginBottom: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: 'var(--font-display)', fontWeight: 600 }}>
                    <Clock size={20} color="var(--color-primary)" /> Continuum Time Machine
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    <Info size={14} style={{ display: 'inline', marginRight: '4px', verticalAlign: 'text-bottom' }} />
                    Trace any line of code back to the engineering decisions, team collaboration threads, pull requests, and CI verification runs that shaped it.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2, minWidth: '200px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>File Path</label>
                    <input 
                      type="text" 
                      placeholder="e.g. backend/src/payments.js" 
                      value={tmFilePath} 
                      onChange={(e) => setTmFilePath(e.target.value)} 
                      required 
                      className="modal-input"
                      style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ width: '90px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Line No.</label>
                    <input 
                      type="number" 
                      placeholder="42" 
                      value={tmLineNumber} 
                      onChange={(e) => setTmLineNumber(e.target.value)} 
                      required 
                      className="modal-input"
                      style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>

                  <div style={{ flex: 3, minWidth: '240px', display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      Ask Hindsight Query <HelpCircle size={12} style={{ color: 'var(--color-primary)' }} />
                    </label>
                    <input 
                      type="text" 
                      placeholder="e.g. Why does this discount calculation subtract?" 
                      value={tmQuery} 
                      onChange={(e) => setTmQuery(e.target.value)} 
                      className="modal-input"
                      style={{ background: '#fff', border: '1.5px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-dark)', fontSize: '0.9rem', width: '100%' }}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="primary-btn"
                    disabled={tmLoading}
                    style={{ padding: '0.65rem 1.5rem', height: '42px' }}
                  >
                    {tmLoading ? <div className="spinner"></div> : <Sparkles size={16} />}
                    <span>{tmLoading ? 'Querying...' : 'Trace Context'}</span>
                  </button>
                </div>

                {/* Presets */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-dark)', textTransform: 'uppercase', fontWeight: 600 }}>Common Incidents:</span>
                  {[
                    { label: 'Payments Off-By-One (Line 42)', file: 'backend/src/payments.js', line: '42', query: 'Off-by-one error calculation subtracting rather than adding' },
                    { label: 'Inverted Healthcheck Assertion (Line 14)', file: 'backend/src/status.js', line: '14', query: 'Assertion expected success instead of failed' },
                    { label: 'DB Connection Outage (Line 12)', file: 'backend/src/config/db.ts', line: '12', query: 'Connection pool scale under heavy concurrent query load' }
                  ].map((preset, idx) => (
                    <button 
                      key={idx}
                      type="button"
                      className="secondary-btn"
                      style={{ 
                        padding: '0.35rem 0.75rem', 
                        fontSize: '0.75rem', 
                        borderRadius: '8px', 
                        border: '1.5px solid var(--border-color)', 
                        background: '#FFF', 
                        color: 'var(--text-dark)',
                        cursor: 'pointer'
                      }}
                      onClick={() => {
                        setTmFilePath(preset.file);
                        setTmLineNumber(preset.line);
                        setTmQuery(preset.query);
                        // Trigger fetch immediately
                        setTimeout(() => {
                          handleTimeMachineQuery();
                        }, 50);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </form>
            </div>

            {/* Error Alert */}
            {!tmLoading && tmError && (
              <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(239, 68, 68, 0.05)', border: '1px solid rgba(239, 68, 68, 0.2)', borderRadius: '8px', color: '#fca5a5' }}>
                <h4 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, fontSize: '0.95rem', fontWeight: 600 }}>
                  <AlertCircle size={18} color="#f87171" /> Time Machine Query Failed
                </h4>
                <p style={{ fontSize: '0.85rem', margin: '0.5rem 0 0 0', lineHeight: '1.4' }}>
                  {tmError}
                </p>
              </div>
            )}

            {/* Loading / Scanning */}
            {tmLoading && (
              <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4rem 2rem', textAlign: 'center' }}>
                <div className="spinner" style={{ width: '3rem', height: '3rem', borderWidth: '3px', color: 'var(--color-primary)', marginBottom: '1.5rem' }}></div>
                <h4 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Recalling Lineage Trace & Memory Links</h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', maxWidth: '480px' }}>
                  Continuum is searching Hindsight database vectors, matching team collaboration comments, and retrieving CI execution run proofs...
                </p>
              </div>
            )}

            {/* Results Grid */}
            {!tmLoading && tmTrace && (
              <div className="dashboard-grid" style={{ gap: '1.5rem' }}>
                
                {/* Left Column: Code Preview & File Details */}
                <div className="main-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <FolderOpen size={16} color="var(--color-primary)" /> Code Context Location
                      </h4>
                      <span className="badge badge-info" style={{ fontFamily: 'monospace' }}>
                        {tmTrace.filePath}:{tmTrace.lineNumber}
                      </span>
                    </div>

                    <div className="code-block-container" style={{ border: '1.5px solid var(--border-color)' }}>
                      <div className="code-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                          <FileCode size={14} /> {tmTrace.filePath.split('/').pop()}
                        </span>
                        <span className="badge badge-success">Line {tmTrace.lineNumber} active</span>
                      </div>
                      <pre className="code-editor" style={{ margin: 0, padding: '1rem', background: 'var(--cream)' }}>
                        <code style={{ fontSize: '0.85rem', color: 'var(--text-dark)', fontFamily: 'var(--font-mono)' }}>
                          {`// File path: ${tmTrace.filePath}
// Traced snippet around line ${tmTrace.lineNumber}:

`}
                          <span style={{ background: 'rgba(43, 168, 162, 0.1)', padding: '2px 6px', borderLeft: '3px solid var(--color-primary)', display: 'block', margin: '0.5rem 0', color: 'var(--color-primary-dark)', fontWeight: 'bold' }}>
                            {tmTrace.lineNumber}: {tmTrace.codeSnippet}
                          </span>
                        </code>
                      </pre>
                    </div>
                  </div>

                  {/* Slack Thread Capture Card */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div className="card-title-row" style={{ marginBottom: '1.25rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <MessageSquare size={16} color="var(--color-secondary)" /> GitHub Pull Request Discussion
                      </h4>
                      <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        Captured by Hindsight
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                      {tmTrace.slackThread.map((msg: any, idx: number) => (
                        <div key={idx} style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                          <img 
                            src={msg.avatar} 
                            alt={msg.author} 
                            style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid var(--border-color)' }}
                          />
                          <div style={{ display: 'flex', flexDirection: 'column', background: 'var(--cream)', border: '1.5px solid var(--border-color)', borderRadius: '12px', padding: '0.65rem 0.85rem', flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <User size={12} /> {msg.author}
                              </span>
                              <span style={{ fontSize: '0.7rem', color: 'var(--text-dark)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                <Calendar size={12} /> {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                              </span>
                            </div>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, lineHeight: '1.4' }}>
                              {msg.message}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right Column: Decisions, PR and Verification */}
                <div className="side-column" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                  
                  {/* Verification & Lineage Proof Card */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <ShieldCheck size={16} color="var(--color-success)" /> Verification Proof
                      </h4>
                      <span className="badge badge-success" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>
                        {tmTrace.state}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.8rem', lineHeight: '1.4' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Status</span>
                        <span style={{ color: 'var(--color-success)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}>
                          🟢 CI Passed & Verified
                        </span>
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Verified Time</span>
                        <span style={{ color: 'var(--text-dark)' }}>{new Date(tmTrace.verification.verifiedAt).toLocaleString()}</span>
                      </div>

                      <div>
                        <span style={{ color: 'var(--text-muted)', display: 'block', marginBottom: '0.25rem' }}>CI Run Evidence Link</span>
                        <a 
                          href={tmTrace.verification.runUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                        >
                          <span>GitHub Actions Workflow Run</span> <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  </div>

                  {/* Associated Pull Request Card */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <GitPullRequest size={16} color="var(--color-primary)" /> Associated Pull Request
                      </h4>
                      <span className="badge badge-info" style={{ fontSize: '0.65rem' }}>
                        PR #{tmTrace.pullRequest.number}
                      </span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      <h5 style={{ color: 'var(--text-dark)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>
                        {tmTrace.pullRequest.title}
                      </h5>

                      <p style={{ color: 'var(--text-dark)', lineHeight: '1.4', margin: 0, background: 'var(--cream)', padding: '0.5rem', borderRadius: '6px', border: '1.5px solid var(--border-color)' }}>
                        {tmTrace.pullRequest.description}
                      </p>

                      <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-dark)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          Author: <strong style={{ color: 'var(--text-muted)' }}><User size={12} style={{ display: 'inline', marginRight: '2px' }} /> {tmTrace.pullRequest.author}</strong>
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={12} /> {new Date(tmTrace.pullRequest.date).toLocaleDateString()}
                        </span>
                      </div>

                      <a 
                        href={tmTrace.pullRequest.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="primary-btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.75rem', textAlign: 'center', justifyContent: 'center', textDecoration: 'none', marginTop: '0.5rem' }}
                      >
                        <span>View PR in GitHub</span> <ExternalLink size={12} />
                      </a>
                    </div>
                  </div>

                  {/* Root Cause Sentry Incident Card */}
                  <div className="glass-card" style={{ padding: '1.25rem' }}>
                    <div className="card-title-row" style={{ marginBottom: '1rem' }}>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem', margin: 0 }}>
                        <AlertCircle size={16} color="var(--color-error)" /> Root Cause Incidents
                      </h4>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.8rem' }}>
                      {tmTrace.incidents.map((inc: any, idx: number) => (
                        <div key={idx} style={{ border: '1px solid rgba(239, 68, 68, 0.15)', background: 'rgba(239, 68, 68, 0.02)', padding: '0.65rem 0.75rem', borderRadius: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'var(--text-dark)', marginBottom: '0.25rem' }}>
                            <span>ID: {inc.id}</span>
                            <span>{new Date(inc.date).toLocaleDateString()}</span>
                          </div>
                          <div style={{ color: 'var(--color-error)', fontFamily: 'monospace', fontSize: '0.75rem', marginBottom: '0.4rem', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>
                            {inc.signature}
                          </div>
                          <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            {inc.resolution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        ) : (
          <>
            {/* Repo Trigger Controls & Banner */}
            <div className="glass-card" style={{ marginBottom: '1.5rem', background: 'var(--cream)', border: '1.5px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <h3 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>Pipeline Diagnostics Deck</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Trigger diagnostic runs or execute a custom pipeline failure to verify Continuum behavior against your repositories.
              </p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <div style={{ background: 'rgba(43, 168, 162, 0.08)', padding: '0.2rem', borderRadius: '8px', border: '1.5px solid var(--border-color)', display: 'flex', gap: '0.25rem' }}>
                <button 
                  className={`repo-select-btn`} 
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.8rem',
                    background: triggerDemoType === 'standard' ? 'var(--color-primary)' : 'transparent',
                    border: 'none',
                    color: triggerDemoType === 'standard' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setTriggerDemoType('standard')}
                >
                  Standard Healing (Memory Match)
                </button>
                <button 
                  className={`repo-select-btn`}
                  style={{ 
                    padding: '0.35rem 0.75rem', 
                    fontSize: '0.8rem',
                    background: triggerDemoType === 'healing' ? 'var(--color-primary)' : 'transparent',
                    border: 'none',
                    color: triggerDemoType === 'healing' ? '#fff' : 'var(--text-muted)'
                  }}
                  onClick={() => setTriggerDemoType('healing')}
                >
                  Multi-stage Healing (Verification Loop)
                </button>
              </div>

              <button 
                className="secondary-btn"
                style={{ 
                  padding: '0.65rem 1.25rem', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.4rem', 
                  border: '1.5px solid var(--border-color)', 
                  borderRadius: '8px', 
                  fontSize: '0.9rem', 
                  background: 'var(--cream)', 
                  color: 'var(--text-dark)', 
                  cursor: 'pointer' 
                }}
                onClick={() => setShowTriggerModal(true)}
                disabled={activeIncident !== null && !['verified', 'escalated', 'refuted'].includes(activeIncident.state)}
              >
                <span>Trigger Custom...</span>
              </button>

              <button 
                className="primary-btn" 
                onClick={triggerSimulation} 
                disabled={triggerLoading || (activeIncident !== null && !['verified', 'escalated', 'refuted'].includes(activeIncident.state))}
              >
                {triggerLoading ? (
                  <>
                    <div className="spinner"></div>
                    <span>Triggering...</span>
                  </>
                ) : (
                  <>
                    <Play size={15} />
                    <span>Break Pipeline CI</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Active Incident Warn Alert Banner */}
        {activeIncident && !['verified', 'escalated', 'refuted'].includes(activeIncident.state) && (
          <div className="glass-card" style={{ borderLeft: '4px solid var(--color-primary)', background: 'rgba(43, 168, 162, 0.08)', marginBottom: '1.5rem', padding: '1rem 1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span className="badge badge-warning" style={{ marginRight: '0.75rem' }}>Active Incident In Progress</span>
                <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Branch: <strong style={{ color: 'var(--text-dark)' }}><GitBranch size={13} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '3px' }} />{activeIncident.branch}</strong>
                  {' '}•{' '}
                  Commit: <code style={{ color: 'var(--color-primary)' }}>{activeIncident.commit_sha.substring(0, 8)}</code>
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--color-primary)', fontWeight: 600 }}>
                <span>State: {activeIncident.state.toUpperCase()}</span>
                <div className="spinner" style={{ color: 'var(--color-primary)' }}></div>
              </div>
            </div>

            {/* Stepper Component */}
            <div className="timeline-stepper">
              <div className="timeline-line"></div>
              {currentStepIdx >= 0 && (
                <div 
                  className="timeline-line-active"
                  style={{ width: `${(currentStepIdx / (steps.length - 1)) * 90}%` }}
                ></div>
              )}
              
              {steps.map((step, idx) => {
                const isActive = activeIncident.state === step.key;
                const isCompleted = currentStepIdx > idx;
                
                return (
                  <div key={step.key} className={`timeline-step ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="step-bubble">
                      {isCompleted ? <Check size={16} /> : idx + 1}
                    </div>
                    <span className="step-label">{step.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Stats Strip */}
        <div className="stats-strip" style={{ marginBottom: '1.5rem' }}>
          <div className="stat-widget">
            <span className="stat-label"><Activity size={14} color="var(--color-primary)" /> Total Incidents</span>
            <h2 className="stat-value">{stats ? stats.totalIncidents : 0}</h2>
          </div>
          
          <div className="stat-widget savings">
            <span className="stat-label"><TrendingUp size={14} color="var(--color-success)" /> Cost Savings</span>
            <h2 className="stat-value">${stats ? stats.savings.toFixed(2) : '0.00'}</h2>
          </div>

          <div className="stat-widget">
            <span className="stat-label"><Database size={14} color="var(--color-secondary)" /> Verified Memories</span>
            <h2 className="stat-value">{stats ? stats.verifiedCount : 0}</h2>
          </div>

          <div className="stat-widget">
            <span className="stat-label"><Cpu size={14} color="var(--color-warning)" /> Cheap Model Ratio</span>
            <h2 className="stat-value">
              {stats && stats.totalIncidents > 0 
                ? `${Math.round((stats.cheapCount / (stats.cheapCount + stats.capableCount || 1)) * 100)}%` 
                : '100%'}
            </h2>
          </div>
        </div>

        {/* Dashboard Panels Grid */}
        <div className="dashboard-grid">
          
          {/* Main Column */}
          <div className="main-column">
            
            {/* Active / Last Incident Card */}
            <div className="glass-card">
              <div className="card-title-row">
                <h3 className="card-title">
                  <Sparkles size={18} color="var(--color-primary)" /> 
                  {activeIncident ? 'Current Investigation Details' : 'Active Pipeline Status'}
                </h3>
                {activeIncident && (
                  <span className={`badge ${
                    activeIncident.state === 'verified' ? 'badge-success' : 
                    ['refuted', 'escalated'].includes(activeIncident.state) ? 'badge-error' : 'badge-warning'
                  }`}>
                    {activeIncident.state}
                  </span>
                )}
              </div>

              {activeIncident ? (
                <div>
                  <div className="incident-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                        {activeIncident.error_signature}
                      </h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        Category: <strong style={{ color: 'var(--text-main)' }}>{activeIncident.error_category}</strong>
                      </p>
                    </div>
                    {activeIncident.pull_request_number && selectedRepo && (
                      <a 
                        href={`https://github.com/${selectedRepo.full_name}/pull/${activeIncident.pull_request_number}`}
                        target="_blank"
                        rel="noreferrer"
                        className="primary-btn"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                      >
                        <span>View Pull Request on GitHub</span>
                        <ArrowRight size={14} />
                      </a>
                    )}
                  </div>

                  {activeIncident.log_summary && (
                    <div style={{ marginBottom: '1.25rem' }}>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Raw Failure Signature Logs:
                      </p>
                      <pre style={{ background: 'var(--cream)', padding: '0.75rem 1rem', borderRadius: '6px', fontSize: '0.75rem', color: 'var(--color-error)', overflowX: 'auto', border: '1.5px solid var(--border-color)' }}>
                        {activeIncident.log_summary}
                      </pre>
                    </div>
                  )}

                  {/* Proposed Fix Code Section */}
                  {['fix_proposed', 'verifying', 'verified', 'escalated', 'refuted'].includes(activeIncident.state) && (
                    <div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>
                        Proposed Code Fix Diffs:
                      </p>
                      {renderSimulatedDiff()}
                    </div>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
                  <ShieldCheck size={48} color="var(--text-dark)" style={{ marginBottom: '1rem', strokeWidth: 1.5 }} />
                  <h4>No active pipeline failures detected.</h4>
                  <p style={{ fontSize: '0.8rem', marginTop: '0.25rem' }}>
                    All pipeline checks are green. Use the control panel above to trigger a test incident.
                  </p>
                </div>
              )}
            </div>

            {/* Verification Console Card */}
            {activeIncident && ['fix_proposed', 'verifying', 'verified', 'escalated', 'refuted'].includes(activeIncident.state) && (
              <div className="glass-card">
                <div className="card-title-row">
                  <h3 className="card-title"><Code size={18} color="var(--color-success)" /> Native CI/CD Verification Logs</h3>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Native GitHub Actions</span>
                </div>
                
                <div className="console-container">
                  {verificationLogs.map((log, idx) => (
                    <div key={idx} className="console-line">
                      <span className="console-time">[{new Date().toLocaleTimeString()}]</span>
                      <span style={{ 
                        color: log.includes('❌') ? 'var(--color-error)' : 
                               log.includes('✔') ? 'var(--color-success)' : 'var(--text-dark)' 
                      }}>
                        {log}
                      </span>
                    </div>
                  ))}
                  {verificationLogs.length === 0 && (
                    <div className="console-line" style={{ color: 'var(--text-dark)' }}>
                      Waiting for GitHub Actions runner to initialize...
                    </div>
                  )}
                  <div ref={logConsoleEndRef} />
                </div>
              </div>
            )}
          </div>

          {/* Side Column */}
          <div className="side-column">
            
            {/* CascadeFlow Routing Card */}
            {routingDecision && (
              <div className="glass-card">
                <div className="card-title-row">
                  <h3 className="card-title"><Layers size={18} color="var(--color-secondary)" /> CascadeFlow Routing</h3>
                  <span className={`badge ${routingDecision.tier === 'cheap' ? 'badge-success' : 'badge-warning'}`}>
                    {routingDecision.tier}
                  </span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '0.25rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Confidence Score</span>
                      <span style={{ fontWeight: 600 }}>{Math.round(routingDecision.confidence_score * 100)}%</span>
                    </div>
                    <div style={{ height: '6px', background: 'rgba(0,0,0,0.05)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div 
                        style={{ 
                          height: '100%', 
                          background: routingDecision.confidence_score >= 0.75 ? 'var(--color-success)' : 'var(--color-warning)',
                          width: `${routingDecision.confidence_score * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>

                  <div>
                    <h5 style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Routing Rationale</h5>
                    <p style={{ fontSize: '0.8rem', lineHeight: '1.4', background: 'var(--cream)', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1.5px solid var(--border-color)' }}>
                      {routingDecision.explanation}
                    </p>
                  </div>

                  {routingDecision.escalated && (
                    <div style={{ background: 'rgba(239, 68, 68, 0.05)', border: '1.5px solid rgba(239, 68, 68, 0.15)', padding: '0.5rem 0.75rem', borderRadius: '6px', fontSize: '0.8rem', color: 'var(--color-error)' }}>
                      <strong>Escalated:</strong> {routingDecision.escalation_reason || 'Low confidence score'}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Hindsight Recall Matches Card */}
            {activeIncident && (
              <div className="glass-card">
                <div className="card-title-row">
                  <h3 className="card-title"><Database size={18} color="var(--color-primary)" /> Hindsight Memory Recalls</h3>
                  <span className="badge badge-info">{memoryMirrors.length} matched</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  {memoryMirrors.map(mirror => (
                    <div key={mirror.id} style={{ border: '1.5px solid var(--border-color)', borderRadius: '8px', padding: '0.65rem 0.75rem', background: 'var(--cream)' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                        <code style={{ color: 'var(--color-primary)' }}>{mirror.hindsight_doc_id.substring(0, 16)}</code>
                        <span style={{ 
                          color: mirror.state === 'verified' ? 'var(--color-success)' : 
                                 mirror.state === 'hypothesis' ? 'var(--color-warning)' : 'var(--color-error)',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          textTransform: 'uppercase'
                        }}>
                          {mirror.state}
                        </span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem' }}>
                        <span style={{ color: 'var(--text-muted)' }}>Semantic Similarity</span>
                        <strong style={{ color: 'var(--text-dark)' }}>{formatSimilarity(mirror.similarity_score)}</strong>
                      </div>
                    </div>
                  ))}
                  {memoryMirrors.length === 0 && (
                    <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                      No matching memories found for this failure.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Verified Memory Ledger */}
            <div className="glass-card">
              <div className="card-title-row">
                <h3 className="card-title"><FileCode size={18} color="var(--color-success)" /> Verified Memory Ledger</h3>
                <span className="badge badge-success">{memories.filter(m=>m.state==='verified').length}</span>
              </div>

              <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {memories.filter(m => m.state === 'verified').map(mem => (
                  <div key={mem.id} className="memory-item">
                    <div className="memory-header">
                      <span className="memory-signature">{mem.hindsight_doc_id}</span>
                      <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>VERIFIED</span>
                    </div>
                    {mem.verification_evidence_url && (
                      <a 
                        href={mem.verification_evidence_url} 
                        target="_blank" 
                        rel="noreferrer"
                        style={{ fontSize: '0.7rem', color: 'var(--color-primary)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.2rem' }}
                      >
                        Evidence URL <ArrowRight size={10} />
                      </a>
                    )}
                  </div>
                ))}
                {memories.filter(m => m.state === 'verified').length === 0 && (
                  <div style={{ textAlign: 'center', padding: '1rem 0', fontSize: '0.8rem', color: 'var(--text-dark)' }}>
                    No verified memories stored yet. Run investigations to build repository intelligence.
                  </div>
                )}
              </div>
            </div>

            {/* Audit Logs Card */}
            <div className="glass-card">
              <div className="card-title-row">
                <h3 className="card-title"><Clock size={18} color="var(--text-muted)" /> Platform Audit Log</h3>
              </div>

              <div className="audit-list" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {auditLogs.map(log => {
                  let dotClass = 'primary';
                  if (log.action.includes('success') || log.action === 'post_badge') dotClass = 'success';
                  if (log.action.includes('failure') || log.action === 'escalation') dotClass = 'warning';
                  
                  return (
                    <div key={log.id} className="audit-item">
                      <div className={`audit-dot ${dotClass}`}></div>
                      <div className="audit-time">
                        {new Date(log.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'})}
                      </div>
                      <div style={{ color: 'var(--text-muted)' }}>{log.description}</div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        </div>
          </>
        )}
      </div>

      {/* Register Repository Modal */}
      {showRegModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card">
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Database size={18} color="var(--color-primary)" /> Register Repository
            </h3>
            <form onSubmit={handleRegisterRepo}>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>GitHub Repo Full Name (owner/repo)</label>
                <input 
                  type="text" 
                  placeholder="e.g. facebook/react" 
                  value={regFullName} 
                  onChange={(e) => setRegFullName(e.target.value)} 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Display Name (optional)</label>
                <input 
                  type="text" 
                  placeholder="e.g. react" 
                  value={regName} 
                  onChange={(e) => setRegName(e.target.value)} 
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tracked Branches (comma separated)</label>
                <input 
                  type="text" 
                  value={regBranches} 
                  onChange={(e) => setRegBranches(e.target.value)} 
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>High Risk File Patterns (comma separated)</label>
                <input 
                  type="text" 
                  value={regPatterns} 
                  onChange={(e) => setRegPatterns(e.target.value)} 
                  className="modal-input"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="repo-select-btn" onClick={() => setShowRegModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Register</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trigger Custom Incident Modal */}
      {showTriggerModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card" style={{ maxWidth: '540px' }}>
            <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Play size={18} color="var(--color-primary)" /> Trigger Custom CI Incident
            </h3>
            <form onSubmit={handleCustomTrigger}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Branch Name</label>
                  <input 
                    type="text" 
                    value={customBranch} 
                    onChange={(e) => setCustomBranch(e.target.value)} 
                    required 
                    className="modal-input"
                  />
                </div>
                <div className="form-group">
                  <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Error Category</label>
                  <input 
                    type="text" 
                    value={customErrorCat} 
                    onChange={(e) => setCustomErrorCat(e.target.value)} 
                    required 
                    className="modal-input"
                  />
                </div>
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Implicated File Paths (comma separated)</label>
                <input 
                  type="text" 
                  placeholder="e.g. src/index.js, tests/index.test.js" 
                  value={customImplicatedFiles} 
                  onChange={(e) => setCustomImplicatedFiles(e.target.value)} 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Error Signature</label>
                <input 
                  type="text" 
                  placeholder="e.g. AssertionError: expected 91 to equal 90" 
                  value={customErrorSig} 
                  onChange={(e) => setCustomErrorSig(e.target.value)} 
                  required 
                  className="modal-input"
                />
              </div>
              <div className="form-group">
                <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Raw Log Summary (optional)</label>
                <textarea 
                  rows={3}
                  placeholder="Paste build/test logs here..." 
                  value={customLogSummary} 
                  onChange={(e) => setCustomLogSummary(e.target.value)} 
                  className="modal-input"
                  style={{ fontFamily: 'monospace', resize: 'vertical' }}
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="repo-select-btn" onClick={() => setShowTriggerModal(false)}>Cancel</button>
                <button type="submit" className="primary-btn">Trigger Incident</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
