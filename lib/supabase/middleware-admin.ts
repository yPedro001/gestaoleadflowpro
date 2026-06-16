// Cliente leve para uso no middleware (Edge Runtime)
// Usa apenas anon key — só faz SELECT em profiles para checar role
import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { autoRefreshToken: false, persistSession: false },
      global: { fetch },
    }
  );
}
