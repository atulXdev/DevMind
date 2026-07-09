import dotenv from 'dotenv';
import path from 'path';

// Load env vars
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  supabaseUrl: process.env.SUPABASE_URL || 'https://qdylpbjmrmrbebhodxrd.supabase.co',
  supabaseKey: process.env.SUPABASE_KEY || '',
  github: {
    appId: process.env.GITHUB_APP_ID || '',
    privateKey: process.env.GITHUB_PRIVATE_KEY || '',
    webhookSecret: process.env.GITHUB_WEBHOOK_SECRET || '',
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
  },
  hindsight: {
    url: process.env.HINDSIGHT_URL || 'http://127.0.0.1:8888',
    llmProvider: process.env.HINDSIGHT_LLM_PROVIDER || 'openai',
    llmApiKey: process.env.OPENAI_API_KEY || process.env.HINDSIGHT_LLM_API_KEY || '',
    llmModel: process.env.HINDSIGHT_LLM_MODEL || 'gpt-4o-mini',
  },
  cascadeflow: {
    mode: (process.env.CASCADEFLOW_MODE || 'enforce') as 'observe' | 'enforce' | 'off',
    budget: parseFloat(process.env.CASCADEFLOW_BUDGET || '0.50'),
  },
  // If true, enables mock incidents, mock webhooks, and mock CI runs
  // to allow full end-to-end demonstrations without valid GitHub credentials.
  simulationMode: process.env.SIMULATION_MODE !== 'false',
};
