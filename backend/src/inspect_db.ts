import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://qdylpbjmrmrbebhodxrd.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || '';

async function run() {
  console.log('Connecting to Supabase at:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: mirrors, error: err1 } = await supabase
    .from('memory_mirrors')
    .select('*');

  if (err1) {
    console.error('Error fetching memory_mirrors:', err1);
  } else {
    console.log('Total mirrors:', mirrors.length);
    const negativeMirrors = mirrors.filter(m => m.similarity_score < 0 || m.similarity_score > 1.0);
    console.log('Mirrors with abnormal similarity scores (<0 or >1):', negativeMirrors.length);
    console.log(JSON.stringify(negativeMirrors.slice(0, 10), null, 2));

    console.log('Sample of other mirrors:');
    console.log(JSON.stringify(mirrors.slice(0, 5), null, 2));
  }
}

run().catch(console.error);
