import { Router, Request, Response } from 'express';
import { db } from '../db/index.js';
import { investigatorService } from '../services/investigator.js';
import { eventService } from '../services/events.js';
import { config } from '../config/index.js';
import { contributorService } from '../services/contributor.js';

const router = Router();

// Get all repositories
router.get('/repositories', async (req: Request, res: Response) => {
  try {
    const repos = await db.getRepositories();
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Register new repository
router.post('/repositories', async (req: Request, res: Response) => {
  try {
    const { id, installation_id, name, full_name, tracked_branches, high_risk_patterns, direct_push_mode } = req.body;
    
    // Ensure installation exists first
    await db.createInstallation({
      id: installation_id || 112233,
      account_id: 445566,
      account_name: full_name.split('/')[0],
      status: 'active',
    });

    const repo = await db.createRepository({
      id: id || Math.floor(Math.random() * 900000) + 100000,
      installation_id: installation_id || 112233,
      name,
      full_name,
      tracked_branches: tracked_branches || ['main', 'master'],
      high_risk_patterns: high_risk_patterns || ['auth/', '.github/workflows/'],
      direct_push_mode: direct_push_mode || false,
    });
    res.status(201).json(repo);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get incidents for a repository
router.get('/repositories/:id/incidents', async (req: Request, res: Response) => {
  try {
    const repoId = parseInt(req.params.id as string, 10);
    const incidents = await db.getIncidents(repoId);
    res.json(incidents);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get single incident details with routing decision and memory mirrors
router.get('/incidents/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const incident = await db.getIncident(id);
    if (!incident) {
      res.status(404).json({ error: 'Incident not found' });
      return;
    }
    const routingDecision = await db.getRoutingDecision(id);
    const memoryMirrors = await db.getMemoryMirrors(id);
    res.json({
      incident,
      routingDecision,
      memoryMirrors,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get verified memories for a repository
router.get('/repositories/:id/memories', async (req: Request, res: Response) => {
  try {
    const repoId = parseInt(req.params.id as string, 10);
    const mirrors = await db.getMemoryMirrorsForRepo(repoId);
    res.json(mirrors);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics for a repository
router.get('/repositories/:id/stats', async (req: Request, res: Response) => {
  try {
    const repoId = parseInt(req.params.id as string, 10);
    const stats = await db.getStats(repoId);
    res.json(stats);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get audit logs for a repository
router.get('/repositories/:id/logs', async (req: Request, res: Response) => {
  try {
    const repoId = parseInt(req.params.id as string, 10);
    const logs = await db.getAuditLogs(repoId);
    res.json(logs);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger a simulated CI failure incident
router.post('/incidents/trigger', async (req: Request, res: Response) => {
  try {
    const {
      repositoryId,
      branch,
      commitSha,
      errorSignature,
      errorCategory,
      logSummary,
      implicatedFiles,
    } = req.body;

    const incident = await investigatorService.startInvestigation({
      repositoryId: repositoryId || 998877,
      branch: branch || 'main',
      commitSha: commitSha || 'a4f91c92d5be38a19280cdb3a290bc9837a281bc',
      errorSignature: errorSignature || 'AssertionError: expected 91 to equal 90',
      errorCategory: errorCategory || 'test',
      logSummary: logSummary || `FAIL  tests/payments.test.js
  ● Payments › should calculate total with discount
    AssertionError: expected 91 to equal 90
      at Context.<anonymous> (tests/payments.test.js:8:12)
      at process.processTicksAndRejections (node:internal/process/task_queues:95:5)`,
      implicatedFiles: implicatedFiles || ['backend/src/payments.js', 'tests/payments.test.js'],
    });

    res.status(202).json({
      message: 'Investigation triggered successfully',
      incidentId: incident.id,
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Server-Sent Events stream for real-time dashboard updates
router.get('/events', (req: Request, res: Response) => {
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
  });
  
  res.write('\n'); // keep-alive initial message

  const clientId = crypto.randomUUID();
  eventService.addClient(clientId, res);

  req.on('close', () => {
    eventService.removeClient(clientId);
  });
});

// Get configuration options (simulation mode status)
router.get('/config', (req: Request, res: Response) => {
  res.json({
    simulationMode: config.simulationMode,
  });
});

// Contributor Hub Repo Info Loader
router.post('/contributor/repo-info', async (req: Request, res: Response) => {
  try {
    const { repoFullName } = req.body;
    if (!repoFullName) {
      res.status(400).json({ error: 'repoFullName parameter is required' });
      return;
    }
    const data = await contributorService.getRepoContributorData(repoFullName);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Import the timeMachineService
import { timeMachineService } from '../services/timemachine.js';

// Line-level context retriever (Continuum Time Machine)
router.post('/timemachine', async (req: Request, res: Response) => {
  try {
    const { repoFullName, filePath, lineNumber } = req.body;
    if (!repoFullName || !filePath) {
      res.status(400).json({ error: 'repoFullName and filePath parameters are required' });
      return;
    }
    const trace = await timeMachineService.getTrace(repoFullName, filePath, parseInt(lineNumber, 10) || 1);
    res.json(trace);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

