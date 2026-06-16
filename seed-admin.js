const { createClient } = require('@supabase/supabase-js');

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
  const email = 'lyvox.consult@gmail.com';
  const password = '@senha123';

  console.log(`Setting up admin user: ${email}`);

  // 1. Create or get user
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: 'Admin Lyvox' },
  });

  let userId;

  if (authError) {
    if (authError.message.includes('already')) {
      console.log('User already exists, fetching...');
      // Need to find the user ID. We can just list users and filter
      const { data: { users }, error: listError } = await supabase.auth.admin.listUsers();
      if (listError) throw listError;
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('User already exists but could not be found');
      userId = user.id;

      // Update password just in case
      console.log('Updating password...');
      await supabase.auth.admin.updateUserById(userId, { password });
    } else {
      throw authError;
    }
  } else {
    userId = authData.user.id;
    console.log('User created!');
  }

  // 2. Ensure profile exists and has SUPER_ADMIN role
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('auth_uid', userId)
    .single();

  if (existingProfile) {
    console.log('Profile exists, updating role to SUPER_ADMIN...');
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'SUPER_ADMIN' })
      .eq('auth_uid', userId);
    if (updateError) throw updateError;
  } else {
    console.log('Creating SUPER_ADMIN profile...');
    const { error: insertError } = await supabase
      .from('profiles')
      .insert({
        id: crypto.randomUUID(),
        auth_uid: userId,
        name: 'Admin Lyvox',
        email: email,
        role: 'SUPER_ADMIN',
        plan: 'ENTERPRISE',
        access_status: 'ATIVO',
        payment_status: 'ISENTO',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    if (insertError) throw insertError;
  }

  console.log('Admin setup complete!');
}

main().catch(console.error);
