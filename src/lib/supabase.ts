import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Dataset = {
  id: string;
  user_id: string;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

export type DataPoint = {
  id: string;
  dataset_id: string;
  label: string;
  value: number;
  category: string;
  date: string | null;
  created_at: string;
};

export type Visualization = {
  id: string;
  dataset_id: string;
  user_id: string;
  name: string;
  chart_type: string;
  config: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};
