const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'https://oyfikxdowpekmcxszbqg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95ZmlreGRvd3Bla21jeHN6YnFnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMjgwNTEsImV4cCI6MjA4MzYwNDA1MX0.9Dgwssq8nYrpVZKDImON3bne9J67JIIR1oINEi_vQ3U';

console.log('❌ Cannot fix RLS policies via anon key');
console.log('');
console.log('You need to run this SQL in Supabase Dashboard:');
console.log('');
console.log('1. Go to: https://supabase.com/dashboard/project/oyfikxdowpekmcxszbqg/editor');
console.log('2. Click "SQL Editor" in left sidebar');
console.log('3. Click "New query"');
console.log('4. Copy and paste the SQL from: fix-rls-policies.sql');
console.log('5. Click "Run"');
console.log('');
console.log('OR use the Supabase CLI:');
console.log('psql "postgresql://postgres:[PASSWORD]@db.oyfikxdowpekmcxszbqg.supabase.co:5432/postgres" -f fix-rls-policies.sql');
