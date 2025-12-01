import { createClient } from '@supabase/supabase-js';

// Validate required environment variables
if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');
  console.error('SUPABASE_URL:', process.env.SUPABASE_URL);
  console.error('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY);
  process.exit(1);
}

const supabaseUrl = (process.env.SUPABASE_URL || '').trim();
const supabaseServiceKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

// Additional validation
if (!supabaseUrl.startsWith('http://') && !supabaseUrl.startsWith('https://')) {
  console.error('ERROR: SUPABASE_URL must start with http:// or https://');
  console.error('Received value:', JSON.stringify(supabaseUrl));
  process.exit(1);
}

console.log('✓ Supabase URL configured:', supabaseUrl);

export const supabase = createClient(supabaseUrl, supabaseServiceKey);
