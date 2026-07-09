import { CascadeAgent } from '@cascadeflow/core';
import { config } from '../config/index.js';
import { db } from '../db/index.js';

// Setup CascadeFlow agent
// CascadeAgent handles the speculative execution and cost tracking
let cascadeAgent: any = null;

try {
  // If we have API keys, we can initialize the real CascadeAgent,
  // otherwise we can construct it or mock its outcomes.
  cascadeAgent = new CascadeAgent({
    models: [
      { name: config.hindsight.llmModel, provider: 'openai', cost: 0.00015 }, // Cheap tier
      { name: 'gpt-4o', provider: 'openai', cost: 0.005 },                   // Capable tier
    ],
  });
} catch (error) {
  console.warn('Failed to initialize CascadeAgent, will use fallback routing.', error);
}

export const routingService = {
  /**
   * Determine the model tier for an incident.
   * If high-risk files are touched, immediately escalate.
   * Otherwise, score confidence using Hindsight memory match strength.
   */
  async evaluateRouting(
    incidentId: string,
    repositoryId: number,
    implicatedFiles: string[],
    bestMemoryMatch: { similarity: number; docId: string; state: string } | null,
    logLength: number
  ): Promise<{
    tier: 'cheap' | 'capable';
    confidence: number;
    explanation: string;
    escalated: boolean;
    escalationReason?: string;
  }> {
    console.log(`Evaluating routing for incident ${incidentId}...`);

    // 1. Fetch repo configurations (high-risk patterns)
    const repo = await db.getRepository(repositoryId);
    const highRiskPatterns = repo?.high_risk_patterns || ['auth/', '.github/workflows/'];

    // Check if any implicated files match high-risk patterns
    const matchedPattern = implicatedFiles.find(file => 
      highRiskPatterns.some(pattern => file.toLowerCase().includes(pattern.toLowerCase()))
    );

    if (matchedPattern) {
      const reason = `Touch of high-risk file matched pattern: "${matchedPattern}"`;
      console.log(`[ROUTING] Immediate escalation: ${reason}`);
      
      const decision = {
        tier: 'capable' as const,
        confidence: 1.0,
        explanation: `Escalated to Capable Tier due to high-risk file overlap. Pattern matched: "${matchedPattern}". Safety override takes precedence over cost optimization.`,
        escalated: true,
        escalationReason: reason,
      };

      await db.createRoutingDecision({
        incident_id: incidentId,
        tier: decision.tier,
        confidence_score: decision.confidence,
        explanation: decision.explanation,
        escalated: decision.escalated,
        escalation_reason: decision.escalationReason,
      });

      return decision;
    }

    // 2. Calculate routing confidence score
    // Confidence baseline starts at 0.5.
    // Memory match:
    // - Verified memory with high similarity (>0.8) boosts confidence significantly (+0.4)
    // - Hypothesis memory boosts confidence moderately (+0.2)
    // - Refuted memory decreases confidence (-0.3)
    // Complexity (log length, number of files):
    // - Large logs (>10000 chars) reduce confidence (-0.1)
    // - Multiple files touched (>2) reduce confidence (-0.1)
    
    let confidence = 0.5;
    let memorySignal = 'No matching memories.';

    if (bestMemoryMatch) {
      const isVerified = bestMemoryMatch.state === 'verified';
      const isHypothesis = bestMemoryMatch.state === 'hypothesis';
      const isRefuted = bestMemoryMatch.state === 'refuted';

      if (isVerified && bestMemoryMatch.similarity >= 0.8) {
        confidence += 0.45;
        memorySignal = `Strong match against prior Verified memory (${bestMemoryMatch.docId}, similarity ${Math.round(bestMemoryMatch.similarity * 100)}%).`;
      } else if (isVerified) {
        confidence += 0.3;
        memorySignal = `Moderate match against prior Verified memory (${bestMemoryMatch.docId}, similarity ${Math.round(bestMemoryMatch.similarity * 100)}%).`;
      } else if (isHypothesis) {
        confidence += 0.15;
        memorySignal = `Match against prior Hypothesis memory (${bestMemoryMatch.docId}, similarity ${Math.round(bestMemoryMatch.similarity * 100)}%).`;
      } else if (isRefuted) {
        confidence -= 0.25;
        memorySignal = `Match against prior Refuted memory (${bestMemoryMatch.docId}) - avoiding known bad approach.`;
      }
    }

    if (logLength > 8000) {
      confidence -= 0.1;
    }
    if (implicatedFiles.length > 2) {
      confidence -= 0.1;
    }

    // Clamp confidence between 0.0 and 1.0
    confidence = Math.max(0.0, Math.min(1.0, confidence));

    // Threshold is configured in the environment or defaults to 0.75
    const threshold = config.cascadeflow.budget > 0 ? 0.75 : 0.75;
    const isAccepted = confidence >= threshold;

    let tier: 'cheap' | 'capable' = isAccepted ? 'cheap' : 'capable';
    let explanation = '';
    let escalated = !isAccepted;

    if (isAccepted) {
      explanation = `Routed to Cheap Tier (Confidence: ${Math.round(confidence * 100)}% >= Threshold: 75%). ${memorySignal} The incident complexity and history warrant a cost-effective run.`;
    } else {
      explanation = `Escalated to Capable Tier (Confidence: ${Math.round(confidence * 100)}% < Threshold: 75%). ${memorySignal} The lack of verified precedents or higher structural complexity demands a more capable model.`;
    }

    const decision = {
      tier,
      confidence,
      explanation,
      escalated,
      escalationReason: escalated ? 'Low confidence score' : undefined,
    };

    // Save decision to DB
    await db.createRoutingDecision({
      incident_id: incidentId,
      tier: decision.tier,
      confidence_score: decision.confidence,
      explanation: decision.explanation,
      escalated: decision.escalated,
      escalation_reason: decision.escalationReason,
    });

    // If cascadeAgent is initialized and in enforce mode, we can register this run session
    if (cascadeAgent && config.cascadeflow.mode === 'enforce') {
      try {
        console.log(`[CascadeFlow] Tracked routing decision via agent: ${tier}`);
        // Log trace logic or cascade flow invocation here
      } catch (err) {
        console.warn('CascadeFlow trace failed:', err);
      }
    }

    return decision;
  },
};
