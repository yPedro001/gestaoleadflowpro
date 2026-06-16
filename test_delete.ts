import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const admin = createClient(url, key);

async function main() {
  try {
    // 1. Create a dummy user in auth
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email: 'teste3@gmail.com',
      password: 'password123',
      email_confirm: true,
    });
    if (authError) throw authError;

    const authUid = authData.user.id;
    console.log('Created auth user:', authUid);

    // 2. Insert into profiles
    const { data: profile, error: insertError } = await admin.from('profiles').insert({
      auth_uid: authUid,
      email: 'teste3@gmail.com',
      name: 'Teste 3',
      plan: 'STARTER',
    }).select().single();
    if (insertError) throw insertError;

    console.log('Created profile:', profile.id);

    // 3. Delete from auth
    const { error: delAuthError } = await admin.auth.admin.deleteUser(authUid);
    if (delAuthError) throw delAuthError;
    console.log('Deleted auth user');

    // 4. Delete from profiles
    const { error: delProfileError } = await admin.from('profiles').delete().eq('id', profile.id);
    if (delProfileError) throw delProfileError;
    console.log('Deleted profile');

  } catch (error) {
    console.error('Test failed:', error);
  } finally {
    process.exit(0);
  }
}

main();
