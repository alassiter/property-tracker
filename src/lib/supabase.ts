import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type PropertyRecord = {
  id: string;
  original_address: string;
  processed_data: any;
  date_processed: string;
  status: 'pending' | 'processed' | 'error';
  error_message?: string;
  user_id: string;
  created_at: string;
};