const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkOrphans() {
  const { data: authData, error: authErr } = await supabase.auth.admin.listUsers();
  if (authErr) { console.error('Auth Error:', authErr); return; }

  const { data: profilesData, error: profErr } = await supabase.from('profiles').select('auth_uid');
  if (profErr) { console.error('Profile Error:', profErr); return; }

  const profileUids = new Set(profilesData.map(p => p.auth_uid));
  const orphans = authData.users.filter(u => !profileUids.has(u.id));

  console.log(`Encontrados ${orphans.length} usuários órfãos no Auth.`);
  for (const orphan of orphans) {
    console.log(`Deletando órfão: ${orphan.email} (${orphan.id})`);
    await supabase.auth.admin.deleteUser(orphan.id);
  }
}

checkOrphans();
