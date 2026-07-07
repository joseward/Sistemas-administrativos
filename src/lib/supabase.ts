import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder-service-key';

// Cliente normal (público)
export const supabase = createClient(supabaseUrl, supabaseKey);

// Cliente de administrador (ignora RLS)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
