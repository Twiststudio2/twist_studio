const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
const envPath = path.resolve(process.cwd(), '.env.local');
const envRaw = fs.readFileSync(envPath, 'utf8');
const env = envRaw.split(/\r?\n/).reduce((acc, line) => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if (m) acc[m[1]] = m[2];
  return acc;
}, {});
const url = env.NEXT_PUBLIC_SUPABASE_URL;
const key = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!url || !key) {
  console.error('MISSING_ENV');
  process.exit(1);
}
const supabase = createClient(url, key);
(async () => {
  const settings = await supabase.from('settings').select('logo_url').eq('id', 1).single();
  console.log('SETTINGS', JSON.stringify(settings, null, 2));
  const list = await supabase.storage.from('site-assets').list('', { limit: 100 });
  console.log('LIST', JSON.stringify(list, null, 2));
})();
