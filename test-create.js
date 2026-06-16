// I will write a script that mimics exactly what createUser does using the exact same code
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const admin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testCreate() {
  const email = 'teste_admin_valido@lyvox.com';
  const name = 'Teste Admin Validação';
  const password = 'senha-super-segura-123';

  console.log("1. Criando user no Auth...");
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: name },
  });

  if (authError) {
    console.error("Auth error:", authError);
    return;
  }
  const userId = authData.user.id;
  console.log("Auth user criado:", userId);

  console.log("2. Inserindo profile...");
  const { data: profileData, error: profileError } = await admin
    .from('profiles')
    .insert({
      auth_uid: userId,
      name,
      email,
      role: 'USER',
      plan: 'STARTER',
      access_status: 'ATIVO',
      payment_status: 'PAGO',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select('id')
    .single();

  if (profileError) {
    console.error("Profile error, rolling back auth:", profileError);
    await admin.auth.admin.deleteUser(userId);
    return;
  }

  console.log("Profile inserido com sucesso!", profileData);
  
  // Cleanup for the test
  console.log("Limpando teste...");
  await admin.auth.admin.deleteUser(userId);
  console.log("Teste de ponta a ponta finalizado com SUCESSO!");
}

testCreate();
