import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const provider = process.env.HINDSIGHT_LLM_PROVIDER || 'gemini';
const apiKey = process.env.OPENAI_API_KEY || process.env.HINDSIGHT_LLM_API_KEY;
const model = process.env.HINDSIGHT_LLM_MODEL || 'gemini-2.5-flash';

console.log('Provider:', provider);
console.log('API Key length:', apiKey ? apiKey.length : 0);

if (!apiKey) {
  console.error('No API key configured.');
  process.exit(1);
}

const isGemini = provider === 'gemini' || provider === 'google' || apiKey.startsWith('AQ.');
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai' : undefined,
});

async function testModel(modelName) {
  try {
    console.log(`Calling API for model ${modelName}...`);
    const completion = await client.chat.completions.create({
      model: modelName,
      messages: [{ role: 'user', content: 'Output a JSON object with a greeting field.' }],
      response_format: { type: 'json_object' },
    });
    console.log(`Success ${modelName}! Response:`, completion.choices[0].message.content);
  } catch (err) {
    console.error(`API Call Failed for ${modelName}:`, err.message);
  }
}

async function main() {
  await testModel('gemini-2.5-flash');
  await testModel('gemini-2.5-pro');
}

main();
