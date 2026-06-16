const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function alterTable() {
  const { data, error } = await supabase.rpc('execute_sql', {
    sql_query: "ALTER TABLE profiles ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;"
  });
  console.log("RPC Error:", error);
  // If RPC doesn't exist, we can't easily alter it without Prisma.
}

alterTable();
