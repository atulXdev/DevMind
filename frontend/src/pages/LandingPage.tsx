import { useState } from 'react';
import { 
  GitPullRequest, 
  Shield, 
  Clock, 
  Search, 
  ArrowRight, 
  Cpu, 
  Database, 
  CheckCircle2, 
  Lock,
  Workflow,
  Sparkles
} from 'lucide-react';

interface LandingPageProps {
  onLaunch: () => void;
}

export default function LandingPage({ onLaunch }: LandingPageProps) {
  const [activeFeature, setActiveFeature] = useState<'healing' | 'timemachine' | 'contributor'>('healing');

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-main)',
      fontFamily: 'var(--font-sans)',
      overflowX: 'hidden',
      position: 'relative',
      paddingBottom: '4rem'
    }}>
      {/* Playful Floating Circles for Game Theme */}
      <div style={{
        position: 'absolute',
        top: '5%',
        left: '5%',
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'rgba(255, 210, 63, 0.12)', /* Soft Gold */
        filter: 'blur(30px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />
      <div style={{
        position: 'absolute',
        top: '30%',
        right: '5%',
        width: '300px',
        height: '300px',
        borderRadius: '50%',
        background: 'rgba(239, 108, 74, 0.1)', /* Soft Coral */
        filter: 'blur(40px)',
        pointerEvents: 'none',
        zIndex: 0
      }} />

      {/* Header / Navbar */}
      <header style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.25rem 2rem',
        maxWidth: '1280px',
        margin: '0 auto',
        borderBottom: '2px dashed rgba(43, 168, 162, 0.18)',
        position: 'relative',
        zIndex: 10
      }}>
        {/* Brand Section with Fanned Cards Logo Effect */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{ position: 'relative', width: '2.5rem', height: '2.5rem' }}>
            {/* Fan Card 1 (Coral) */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'var(--color-secondary)',
              borderRadius: '8px',
              transform: 'rotate(-15deg)',
              opacity: 0.85,
              border: '2px solid var(--text-dark)'
            }} />
            {/* Fan Card 2 (Gold) */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'var(--color-accent)',
              borderRadius: '8px',
              transform: 'rotate(5deg)',
              opacity: 0.9,
              border: '2px solid var(--text-dark)'
            }} />
            {/* Main Card (Teal) */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              background: 'var(--color-primary)',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 800,
              fontSize: '1.2rem',
              fontFamily: 'var(--font-display)',
              border: '2px solid var(--text-dark)',
              boxShadow: '0 4px 10px rgba(43,168,162,0.3)',
              transform: 'rotate(-5deg)'
            }}>
              C
            </div>
          </div>
          <span style={{ 
            fontSize: '1.45rem', 
            fontWeight: 800, 
            fontFamily: 'var(--font-display)',
            color: 'var(--text-dark)',
            letterSpacing: '-0.02em'
          }}>
            Continuum
          </span>
        </div>

        <nav style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <a href="#features" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Features</a>
          <a href="#architecture" style={{ color: 'var(--text-muted)', textDecoration: 'none', fontSize: '0.9rem', fontWeight: 700, transition: 'color 0.2s' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={(e) => e.currentTarget.style.color = 'var(--text-muted)'}>Architecture</a>
          <button 
            onClick={onLaunch}
            className="primary-btn"
            style={{
              padding: '0.5rem 1.25rem',
              fontSize: '0.85rem'
            }}
          >
            Launch Console <ArrowRight size={14} />
          </button>
        </nav>
      </header>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '5rem 2rem 4rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 5
      }}>
        {/* Retro folded ribbon style badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'var(--cream)',
          border: '2px solid var(--text-dark)',
          padding: '0.4rem 1.25rem',
          borderRadius: '8px',
          fontSize: '0.85rem',
          fontWeight: 800,
          color: 'var(--text-dark)',
          marginBottom: '2rem',
          boxShadow: '4px 4px 0px rgba(30, 140, 134, 0.15)',
          transform: 'skewX(-4deg)'
        }}>
          <Sparkles size={14} style={{ color: 'var(--color-secondary)' }} /> PRODUCTION-GRADE AUTONOMOUS ENGINE
        </div>

        <h1 style={{
          fontSize: '3.75rem',
          fontWeight: 800,
          lineHeight: 1.15,
          fontFamily: 'var(--font-display)',
          letterSpacing: '-0.02em',
          color: 'var(--text-dark)',
          maxWidth: '850px',
          margin: '0 auto 1.5rem auto'
        }}>
          Automated Pipeline Recovery Powered by Verified Memory
        </h1>

        <p style={{
          fontSize: '1.15rem',
          color: 'var(--text-muted)',
          maxWidth: '650px',
          margin: '0 auto 2.5rem auto',
          lineHeight: 1.6,
          fontWeight: 600
        }}>
          Continuum actively listens to your GitHub workflow failures, retrieves historical precedents via Hindsight vector search, and deploys fully-verified fixes directly to your repository in minutes.
        </p>

        <div style={{ display: 'flex', gap: '1.25rem', justifyContent: 'center', marginBottom: '4rem' }}>
          <button 
            onClick={onLaunch}
            className="primary-btn"
            style={{
              padding: '0.85rem 2.25rem',
              fontSize: '1rem',
              boxShadow: '0 6px 20px var(--color-accent-glow)'
            }}
          >
            Launch Platform Console <ArrowRight size={18} />
          </button>
          <a 
            href="#features" 
            className="secondary-btn"
            style={{
              padding: '0.85rem 2.25rem',
              fontSize: '1rem',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700
            }}
          >
            Explore Capabilities
          </a>
        </div>

        {/* Hero Visual Showcase with Tactile Retro Frame */}
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          position: 'relative',
          borderRadius: '24px',
          border: '3px solid var(--text-dark)',
          boxShadow: '0 12px 36px rgba(30, 140, 134, 0.15)',
          overflow: 'hidden',
          background: 'var(--cream)'
        }}>
          <div style={{
            height: '2.75rem',
            background: 'var(--bg-main)',
            borderBottom: '3px solid var(--text-dark)',
            display: 'flex',
            alignItems: 'center',
            padding: '0 1.25rem',
            gap: '0.5rem'
          }}>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-secondary)', border: '1.5px solid var(--text-dark)' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-accent)', border: '1.5px solid var(--text-dark)' }}></div>
            <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-primary)', border: '1.5px solid var(--text-dark)' }}></div>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '1rem', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>console.continuum.ai/dashboard</span>
          </div>
          {/* Light Theme visual blending filter */}
          <img 
            src="/hero-dashboard.png" 
            alt="Continuum Premium Dashboard Console" 
            style={{
              width: '100%',
              display: 'block',
              borderRadius: '0 0 20px 20px'
            }}
          />
        </div>
      </section>

      {/* Trust & Verification Badges */}
      <section style={{
        borderTop: '2px dashed rgba(43, 168, 162, 0.2)',
        borderBottom: '2px dashed rgba(43, 168, 162, 0.2)',
        background: '#FFFFFF',
        padding: '3rem 2rem',
        textAlign: 'center',
        zIndex: 5,
        position: 'relative'
      }}>
        <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: 'var(--text-muted)', fontWeight: 800, marginBottom: '2rem' }}>
          VERIFIED PLATFORM ARCHITECTURE & COMPLIANCE
        </p>
        <div style={{ display: 'flex', gap: '3rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 700 }}>
            <Shield size={18} color="var(--color-primary)" /> SOC2 Audit-Ready
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 700 }}>
            <Lock size={18} color="var(--color-secondary)" /> Encrypted Secrets
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 700 }}>
            <CheckCircle2 size={18} color="var(--color-success)" /> Gated PR Verification
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-dark)', fontSize: '0.95rem', fontWeight: 700 }}>
            <Cpu size={18} color="var(--color-primary-light)" /> Model Route Optimization
          </div>
        </div>
      </section>

      {/* Features Walkthrough Section */}
      <section id="features" style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '7rem 2rem',
        zIndex: 5,
        position: 'relative'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h2 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '1rem', color: 'var(--text-dark)' }}>
            Inside the Continuum Recovery Suite
          </h2>
          <p style={{ color: 'var(--text-muted)', fontWeight: 600, maxWidth: '600px', margin: '0 auto' }}>
            An engineering-first design constructed to eliminate repetitive diagnostic work, automate code resolution, and protect production branch integrity.
          </p>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: '2.5rem',
        }}>
          {/* Feature selector tabs with bouncy buttons */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            flexWrap: 'wrap',
            marginBottom: '1rem'
          }}>
            <button 
              onClick={() => setActiveFeature('healing')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                border: '2px solid var(--text-dark)',
                background: activeFeature === 'healing' ? 'linear-gradient(135deg, var(--color-primary), var(--color-primary-light))' : '#FFF',
                color: activeFeature === 'healing' ? '#FFF' : 'var(--text-dark)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeFeature === 'healing' ? '0 4px 12px var(--color-primary-glow)' : 'none',
                transform: activeFeature === 'healing' ? 'translateY(-2px)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Workflow size={16} /> Autonomous Self-Healing Loop
            </button>
            <button 
              onClick={() => setActiveFeature('timemachine')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                border: '2px solid var(--text-dark)',
                background: activeFeature === 'timemachine' ? 'linear-gradient(135deg, var(--color-secondary), var(--color-secondary-light))' : '#FFF',
                color: activeFeature === 'timemachine' ? '#FFF' : 'var(--text-dark)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeFeature === 'timemachine' ? '0 4px 12px var(--color-secondary-glow)' : 'none',
                transform: activeFeature === 'timemachine' ? 'translateY(-2px)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Clock size={16} /> Continuum Time Machine
            </button>
            <button 
              onClick={() => setActiveFeature('contributor')}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '999px',
                border: '2px solid var(--text-dark)',
                background: activeFeature === 'contributor' ? 'linear-gradient(135deg, var(--color-primary-dark), var(--color-primary))' : '#FFF',
                color: activeFeature === 'contributor' ? '#FFF' : 'var(--text-dark)',
                cursor: 'pointer',
                fontWeight: 800,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: activeFeature === 'contributor' ? '0 4px 12px var(--color-primary-glow)' : 'none',
                transform: activeFeature === 'contributor' ? 'translateY(-2px)' : 'none',
                transition: 'var(--transition-smooth)'
              }}
            >
              <Search size={16} /> OSS Contributor Hub
            </button>
          </div>

          {/* Active Tab Screen Details - Playful Tactile Border */}
          <div className="glass-card" style={{ 
            padding: '2.5rem', 
            background: '#FFFFFF',
            borderLeft: `8px solid ${
              activeFeature === 'healing' ? 'var(--color-accent)' : 
              activeFeature === 'timemachine' ? 'var(--color-primary)' : 
              'var(--color-secondary)'
            }`
          }}>
            {activeFeature === 'healing' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-warning" style={{ background: 'rgba(255, 210, 63, 0.15)', color: 'var(--color-accent-dark)' }}>Operations & Pipelines</span>
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Active Failure Diagnostic & Repair Loop</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 600 }}>
                    Continuum connects directly to your GitHub repository. When your tests or linting checks fail in a Pull Request or push run, the platform triggers the **Self-Healing Loop**:
                  </p>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Log Analysis & Signature Extraction:</strong> Parses error stacks and isolates the implicated file path.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Recalls Precedents:</strong> Searches Hindsight vector memory database for matching resolved fixes.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Auto PR Generation:</strong> Creates a repair branch and opens a Pull Request with code patches.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>CI Gated Verification:</strong> Polls your native GHA workflow status and posts the verification status on pass.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeFeature === 'timemachine' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-info" style={{ background: 'rgba(93, 173, 226, 0.12)', color: '#2980b9' }}>Code Intelligence</span>
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Continuum Time Machine</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 600 }}>
                    Every line of code tells a story, but git log alone doesn't capture the developer's mindset or conversations. The **Continuum Time Machine** bridges this gap:
                  </p>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Semantic Line Lineage:</strong> Input any file path and line number to fetch its complete evolutionary history.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Pull Request Commentary Capture:</strong> Displays the actual GitHub PR comments and code reviews that discussed and shaped this line of code.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Linked Verification Proofs:</strong> Links to the exact CI execution run links that successfully proved the stability of this block.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {activeFeature === 'contributor' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span className="badge badge-success" style={{ background: 'rgba(39, 174, 96, 0.12)', color: 'var(--color-success)' }}>Developer Experience</span>
                  </div>
                  <h3 style={{ fontSize: '1.75rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Open Source Contributor Hub</h3>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', lineHeight: 1.6, fontWeight: 600 }}>
                    Accelerate engineering onboarding and community contribution. The **Contributor Hub** makes it simple for developers to understand the project repository structure:
                  </p>
                  <ul style={{ listStyleType: 'none', paddingLeft: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem', margin: '0.5rem 0' }}>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Active Issue Scanning:</strong> Pulls real closed/open issues directly from the repository.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Blueprint Recommendations:</strong> Generates code fix blueprints mapping out target files and changes.</span>
                    </li>
                    <li style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                      <CheckCircle2 size={16} color="var(--color-success)" style={{ marginTop: '3px', flexShrink: 0 }} />
                      <span><strong>Historical Pattern Comparison:</strong> Cross-references new tickets with similar issues from the repository's past to give concrete guidance.</span>
                    </li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Architecture Breakdown */}
      <section id="architecture" style={{
        borderTop: '2px dashed rgba(43, 168, 162, 0.2)',
        background: '#FFFFFF',
        padding: '6rem 2rem',
        zIndex: 5,
        position: 'relative'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '5rem' }}>
            <h2 style={{ fontSize: '2.25rem', fontWeight: 800, fontFamily: 'var(--font-display)', letterSpacing: '-0.02em', marginBottom: '1rem', color: 'var(--text-dark)' }}>
              Optimized Core Architecture
            </h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 600, maxWidth: '600px', margin: '0 auto' }}>
              How Continuum bridges local memory recall, secure routing, and native developer environments.
            </p>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
            {/* System A */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--cream)', borderLeft: '6px solid var(--color-primary)' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '12px',
                background: 'rgba(43, 168, 162, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-primary-dark)',
                border: '2px solid var(--text-dark)'
              }}>
                <Database size={24} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Hindsight Memory Bank</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Hindsight indexes previous pull requests, developer comment threads, and successful CI runs into a vector database. On new failures, it finds semantic equivalents to guide resolution logic.
              </p>
            </div>

            {/* System B */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--cream)', borderLeft: '6px solid var(--color-accent)' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '12px',
                background: 'rgba(255, 210, 63, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-accent-dark)',
                border: '2px solid var(--text-dark)'
              }}>
                <Cpu size={24} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>CascadeFlow Model Router</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                CascadeFlow analyzes the incident severity and confidence profile. It dynamically routes simple syntax checks to cheap models and complex architectural failures to flagship models, saving up to 85% in LLM costs.
              </p>
            </div>

            {/* System C */}
            <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--cream)', borderLeft: '6px solid var(--color-secondary)' }}>
              <div style={{
                width: '3.5rem',
                height: '3.5rem',
                borderRadius: '12px',
                background: 'rgba(239, 108, 74, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-secondary-dark)',
                border: '2px solid var(--text-dark)'
              }}>
                <GitPullRequest size={24} />
              </div>
              <h4 style={{ fontSize: '1.3rem', fontWeight: 800, margin: 0, color: 'var(--text-dark)' }}>Gated Verification Engine</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.6, margin: 0, fontWeight: 600 }}>
                Patches are never committed directly to your default branch. Continuum generates isolated fix branches, commits code, opens PRs, and polls GHA check runs to ensure only fully working fixes are recorded in memory.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '8rem 2rem',
        textAlign: 'center',
        zIndex: 5,
        position: 'relative'
      }}>
        <div style={{
          padding: '4rem 2rem',
          background: 'linear-gradient(135deg, rgba(43, 168, 162, 0.08) 0%, rgba(255, 210, 63, 0.08) 100%)',
          border: '3px solid var(--text-dark)',
          borderRadius: '24px',
          boxShadow: '4px 8px 0px rgba(30, 140, 134, 0.15)'
        }}>
          <h2 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            fontFamily: 'var(--font-display)',
            letterSpacing: '-0.02em',
            marginBottom: '1rem',
            color: 'var(--text-dark)'
          }}>
            Ready to Automate Pipeline Diagnostics?
          </h2>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '1.05rem',
            maxWidth: '550px',
            margin: '0 auto 2.5rem auto',
            lineHeight: 1.6,
            fontWeight: 600
          }}>
            Set up Continuum on your repository in under 5 minutes. Detect bugs, suggest fixes, and build a resilient self-healing development pipeline today.
          </p>
          <button 
            onClick={onLaunch}
            className="primary-btn"
            style={{
              padding: '0.85rem 2.5rem',
              fontSize: '1.1rem',
              boxShadow: '0 6px 20px var(--color-accent-glow)'
            }}
          >
            Enter Platform Console <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        borderTop: '2px dashed rgba(43, 168, 162, 0.2)',
        padding: '3rem 2rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        textAlign: 'center',
        background: '#FFFFFF'
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
          <div style={{ fontWeight: 700 }}>
            &copy; 2026 Continuum. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem', fontWeight: 700 }}>
            <a href="#features" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>Features</a>
            <a href="#architecture" style={{ color: 'inherit', textDecoration: 'none' }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>Architecture</a>
            <a href="#" style={{ color: 'inherit', textDecoration: 'none' }} onClick={(e) => { e.preventDefault(); onLaunch(); }} onMouseOver={(e) => e.currentTarget.style.color = 'var(--text-dark)'} onMouseOut={(e) => e.currentTarget.style.color = 'inherit'}>Console</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
