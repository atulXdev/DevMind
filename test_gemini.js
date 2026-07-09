import dotenv from 'dotenv';
import OpenAI from 'openai';
dotenv.config();

const provider = process.env.HINDSIGHT_LLM_PROVIDER || 'gemini';
const apiKey = process.env.OPENAI_API_KEY || process.env.HINDSIGHT_LLM_API_KEY;
const model = process.env.HINDSIGHT_LLM_MODEL || 'gemini-2.5-flash';

console.log('Provider:', provider);
console.log('API Key length:', apiKey ? apiKey.length : 0);
console.log('Model:', model);

if (!apiKey) {
  console.error('No API key configured.');
  process.exit(1);
}

const isGemini = provider === 'gemini' || provider === 'google' || apiKey.startsWith('AQ.');
const client = new OpenAI({
  apiKey: apiKey,
  baseURL: isGemini ? 'https://generativelanguage.googleapis.com/v1beta/openai' : undefined,
});

async function main() {
  try {
    console.log('Calling API...');
    const completion = await client.chat.completions.create({
      model: model,
      messages: [{ role: 'user', content: 'Say hello and confirm you are online.' }],
    });
    console.log('Success! Response:', completion.choices[0].message.content);
  } catch (err) {
    console.error('API Call Failed:', err);
  }
}

main();
