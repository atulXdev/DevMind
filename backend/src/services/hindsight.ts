import { HindsightClient } from '@vectorize-io/hindsight-client';
import { HindsightServer } from '@vectorize-io/hindsight-all';
import { config } from '../config/index.js';
import { db } from '../db/index.js';

let server: HindsightServer | null = null;
let client: HindsightClient | null = null;

export const hindsightService = {
  async start() {
    console.log('Initializing Hindsight Memory Engine...');

    if (config.simulationMode) {
      console.log('Hindsight Service running in SIMULATION mode (mock memory operations).');
      return;
    }

    try {
      // If we are using a remote Hindsight, use client directly
      if (config.hindsight.url && !config.hindsight.url.includes('localhost') && !config.hindsight.url.includes('127.0.0.1')) {
        console.log(`Connecting to remote Hindsight service at ${config.hindsight.url}`);
        client = new HindsightClient({ baseUrl: config.hindsight.url });
        return;
      }

      // Spawn local hindsight daemon
      console.log('Starting local Hindsight server daemon on port 8888...');
      server = new HindsightServer({
        profile: 'continuum',
        port: 8888,
        env: {
          HINDSIGHT_API_LLM_PROVIDER: config.hindsight.llmProvider,
          HINDSIGHT_API_LLM_API_KEY: config.hindsight.llmApiKey,
          HINDSIGHT_API_LLM_MODEL: config.hindsight.llmModel,
          HINDSIGHT_EMBED_DAEMON_IDLE_TIMEOUT: '0', // Keep running
        },
      });

      await server.start();
      console.log('Hindsight daemon started successfully.');

      client = new HindsightClient({ baseUrl: server.getBaseUrl() });
    } catch (error) {
      console.error('Failed to start Hindsight server or client. Proceeding in fallback mode.', error);
      client = null;
    }
  },

  async stop() {
    if (server) {
      console.log('Stopping Hindsight server daemon...');
      await server.stop();
    }
  },

  getBankId(repoId: number): string {
    return `repo-${repoId}`;
  },

  async initBank(repoId: number, repoName: string) {
    const bankId = this.getBankId(repoId);
    console.log(`Ensuring Hindsight bank exists for ${repoName} (Bank ID: ${bankId})`);

    if (!client) {
      console.log(`[Mock] Bank initialized for ${repoName}`);
      return;
    }

    try {
      await client.createBank(bankId, {
        name: `Continuum memory for ${repoName}`,
        mission: `Extract coding solutions, CI failure signatures, test files, and fixes. Ignore administrative logistics.`,
        disposition: {
          skepticism: 4, // Code Review disposition: skeptical, literal, clinical
          literalism: 4,
          empathy: 1,
        },
      });
    } catch (error: any) {
      // If it already exists, Hindsight will throw or return success; handle gracefully
      if (error?.message?.includes('already exists')) {
        return;
      }
      console.error(`Error initializing Hindsight bank ${bankId}:`, error);
    }
  },

  async retainHypothesis(
    repoId: number,
    incidentId: string,
    errorSignature: string,
    diagnosis: string,
    fixContent: string
  ): Promise<string> {
    const bankId = this.getBankId(repoId);
    const docId = `incident-${incidentId}`;

    const rawContent = `
=== ERROR SIGNATURE ===
${errorSignature}

=== DIAGNOSIS ===
${diagnosis}

=== PROPOSED FIX ===
${fixContent}
    `;

    console.log(`Retaining hypothesis memory for incident ${incidentId} (Doc ID: ${docId})`);

    // In simulation mode or fallback
    if (!client) {
      console.log(`[Mock] Saved memory hypothesis for doc ${docId}`);
      await db.createMemoryMirror({
        incident_id: incidentId,
        hindsight_doc_id: docId,
        state: 'hypothesis',
        similarity_score: 1.0,
      });
      return docId;
    }

    try {
      await client.retain(bankId, rawContent, {
        documentId: docId,
        context: 'CI failure fix hypothesis',
        metadata: {
          incidentId,
          errorSignature,
          state: 'hypothesis',
        },
      });

      await db.createMemoryMirror({
        incident_id: incidentId,
        hindsight_doc_id: docId,
        state: 'hypothesis',
        similarity_score: 1.0,
      });

      return docId;
    } catch (error) {
      console.error(`Failed to retain memory hypothesis:`, error);
      // Fallback
      await db.createMemoryMirror({
        incident_id: incidentId,
        hindsight_doc_id: docId,
        state: 'hypothesis',
        similarity_score: 1.0,
      });
      return docId;
    }
  },

  async recallMemories(repoId: number, query: string, budget: 'low' | 'mid' | 'high' = 'mid') {
    const bankId = this.getBankId(repoId);
    console.log(`Recalling memories for repo ${repoId} with query: "${query}"`);

    if (!client) {
      // Return mock matching memories in simulation mode
      console.log(`[Mock] Recalled memories for query "${query}"`);
      
      // Seed some simulated memories if searching for compilation/test error
      const mirrors = await db.getMemoryMirrorsForRepo(repoId);
      const verifiedMirrors = mirrors.filter(m => m.state === 'verified');

      if (verifiedMirrors.length > 0) {
        return verifiedMirrors.map((m, idx) => ({
          text: `=== ERROR SIGNATURE ===\nAssertionError: expected 'success' to equal 'failed'\n\n=== DIAGNOSIS ===\nTest assertion was inverted in verification suite.\n\n=== PROPOSED FIX ===\n- assert.equal(res, 'failed');\n+ assert.equal(res, 'success');`,
          similarity: 0.85 - idx * 0.1,
          docId: m.hindsight_doc_id,
          state: m.state,
          evidenceUrl: m.verification_evidence_url,
        }));
      }

      return [];
    }

    try {
      const response = await client.recall(bankId, query, {
        budget,
        types: ['world', 'experience'], // Fetch original fact blocks
      });

      // Map response to our recall model
      const results = response.results.map(r => {
        // Hindsight facts return in .text
        // Metadata is attached in .metadata or parsed
        const metadata = (r as any).metadata || {};
        return {
          text: r.text,
          similarity: (r as any).score || 0.8,
          docId: (r as any).document_id || '',
          state: metadata.state || 'verified',
          evidenceUrl: metadata.evidenceUrl,
        };
      });

      return results;
    } catch (error) {
      console.error('Error recalling Hindsight memories:', error);
      return [];
    }
  },

  async verifyMemory(repoId: number, docId: string, evidenceUrl: string) {
    const bankId = this.getBankId(repoId);
    console.log(`Verifying memory doc ${docId} with GHA run ${evidenceUrl}`);

    // Update in DB mirror
    await db.updateMemoryMirrorByDocId(docId, {
      state: 'verified',
      verification_evidence_url: evidenceUrl,
    });

    if (!client) {
      console.log(`[Mock] Marked memory ${docId} as verified`);
      return;
    }

    try {
      // Re-retain or update document in Hindsight with new status
      const doc = await client.getDocument(bankId, docId) as any;
      if (doc) {
        await client.retain(bankId, doc.content, {
          documentId: docId,
          context: 'Verified CI failure fix',
          metadata: {
            ...doc.metadata,
            state: 'verified',
            evidenceUrl,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to update verified state in Hindsight for ${docId}:`, error);
    }
  },

  async refuteMemory(repoId: number, docId: string) {
    const bankId = this.getBankId(repoId);
    console.log(`Refuting memory doc ${docId}`);

    // Update in DB mirror
    await db.updateMemoryMirrorByDocId(docId, {
      state: 'refuted',
    });

    if (!client) {
      console.log(`[Mock] Marked memory ${docId} as refuted`);
      return;
    }

    try {
      const doc = await client.getDocument(bankId, docId) as any;
      if (doc) {
        await client.retain(bankId, doc.content, {
          documentId: docId,
          context: 'Refuted/Failed CI failure fix',
          metadata: {
            ...doc.metadata,
            state: 'refuted',
          },
        });
      }
    } catch (error) {
      console.error(`Failed to update refuted state in Hindsight for ${docId}:`, error);
    }
  },

  async supersedeMemory(repoId: number, oldDocId: string, newDocId: string) {
    const bankId = this.getBankId(repoId);
    console.log(`Superseding old memory doc ${oldDocId} with new memory doc ${newDocId}`);

    // Update old memory DB mirror
    await db.updateMemoryMirrorByDocId(oldDocId, {
      state: 'superseded',
      superseded_by: (await db.getMemoryMirrors()).find(m => m.hindsight_doc_id === newDocId)?.id,
    });

    if (!client) {
      console.log(`[Mock] Marked memory ${oldDocId} as superseded by ${newDocId}`);
      return;
    }

    try {
      const doc = await client.getDocument(bankId, oldDocId) as any;
      if (doc) {
        await client.retain(bankId, doc.content, {
          documentId: oldDocId,
          context: 'Superseded engineering memory',
          metadata: {
            ...doc.metadata,
            state: 'superseded',
            supersededBy: newDocId,
          },
        });
      }
    } catch (error) {
      console.error(`Failed to update superseded state in Hindsight for ${oldDocId}:`, error);
    }
  },
};
