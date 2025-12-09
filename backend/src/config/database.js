const { createClient } = require('@supabase/supabase-js');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const supabaseUrl = process.env.SUPABASE_URL;
// Use service role key if it exists and matches the project, otherwise use anon key
let supabaseKey = process.env.SUPABASE_ANON_KEY;
if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
  // Verify service role key matches the project (basic check)
  try {
    const serviceKeyParts = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.');
    if (serviceKeyParts.length === 3) {
      const servicePayload = JSON.parse(Buffer.from(serviceKeyParts[1], 'base64').toString());
      const anonKeyParts = process.env.SUPABASE_ANON_KEY?.split('.');
      if (anonKeyParts && anonKeyParts.length === 3) {
        const anonPayload = JSON.parse(Buffer.from(anonKeyParts[1], 'base64').toString());
        // Only use service role key if it matches the same project
        if (servicePayload.ref === anonPayload.ref) {
          supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
        } else {
          console.warn('⚠️  Service role key is from a different project. Using anon key instead.');
        }
      }
    }
  } catch (e) {
    console.warn('⚠️  Could not verify service role key. Using anon key instead.');
  }
}

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('✅ Supabase client initialized');
  console.log('   Project URL:', supabaseUrl);
} else {
  console.warn('⚠️  Supabase credentials not found. Database features will be disabled.');
  console.warn('   SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing');
  console.warn('   SUPABASE_ANON_KEY:', process.env.SUPABASE_ANON_KEY ? 'Set' : 'Missing');
  console.warn('   SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Set' : 'Missing');
  console.warn('   To enable: Add SUPABASE_URL and SUPABASE_ANON_KEY to backend/.env');
}

module.exports = { supabase };

