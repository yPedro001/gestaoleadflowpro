const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function cleanOrphaned() {
  console.log('Buscando perfis...');
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('id, auth_uid, email');
  if (profileError) {
    console.error('Erro ao buscar perfis:', profileError);
    return;
  }

  console.log(`Encontrados ${profiles.length} perfis.`);

  console.log('Buscando usuários no Auth...');
  const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) {
    console.error('Erro ao buscar usuários do Auth:', authError);
    return;
  }

  console.log(`Encontrados ${authUsers.users.length} usuários no Auth.`);

  const authIds = new Set(authUsers.users.map(u => u.id));

  let deletedCount = 0;
  for (const profile of profiles) {
    if (!authIds.has(profile.auth_uid)) {
      console.log(`Perfil órfão encontrado: ${profile.email} (${profile.id}). Excluindo...`);
      const { error } = await supabase.from('profiles').delete().eq('id', profile.id);
      if (error) {
        console.error(`Erro ao excluir perfil ${profile.id}:`, error);
      } else {
        console.log(`Perfil ${profile.id} excluído com sucesso.`);
        deletedCount++;
      }
    }
  }

  console.log(`Limpeza concluída. ${deletedCount} perfis órfãos excluídos.`);
}

cleanOrphaned();
