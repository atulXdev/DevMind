import express from 'express';
import cors from 'cors';
import { config } from './config/index.js';
import apiRouter from './routes/api.js';
import { hindsightService } from './services/hindsight.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Allow all origins for the hackathon demo dashboard
}));
app.use(express.json());

// API Namespace
app.use('/api', apiRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    simulationMode: config.simulationMode,
    supabaseConnected: apiRouter.stack.length > 0 // basic check
  });
});

// Serve frontend build if running in production mode
// For local hackathon running, we will run the dev servers in parallel.

// Start Express Server
const server = app.listen(config.port, async () => {
  console.log(`==================================================`);
  console.log(`Continuum Backend Server running on port ${config.port}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Simulation Mode: ${config.simulationMode ? 'ON' : 'OFF'}`);
  console.log(`==================================================`);

  // Start Hindsight Memory Engine
  await hindsightService.start();
});

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log('Received shutdown signal. Stopping services...');
  server.close(async () => {
    await hindsightService.stop();
    console.log('Continuum Backend Server stopped.');
    process.exit(0);
  });
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);
