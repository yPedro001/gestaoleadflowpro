const { createClient } = require('@supabase/supabase-js');
const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing URL or KEY');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  const email = 'cliente-teste@gmail.com';
  const password = '@senha123';

  console.log(`Setting up test user: ${email}`);

  // Deletar o usuário anterior caso já exista no auth para evitar conflitos
  const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
  if (!listError) {
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      console.log('Removing old test user auth and profile...');
      await supabase.auth.admin.deleteUser(existingUser.id);
      await supabase.from('profiles').delete().eq('auth_uid', existingUser.id);
    }
  }

  // 1. Criar usuário no Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Cliente Teste Lyvox' },
  });

  if (authError) {
    console.error('Error creating auth user:', authError);
    process.exit(1);
  }

  const userId = authData.user.id;
  console.log('User auth created! ID:', userId);

  // 2. Criar perfil na tabela profiles
  const { error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: crypto.randomUUID(),
      auth_uid: userId,
      name: 'Cliente Teste Lyvox',
      email: email,
      role: 'USER',
      plan: 'STARTER',
      access_status: 'ATIVO',
      payment_status: 'PAGO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

  if (insertError) {
    console.error('Error creating profile:', insertError);
    // rollback auth user
    await supabase.auth.admin.deleteUser(userId);
    process.exit(1);
  }

  console.log('Test user created successfully!');
}

main().catch(console.error);
