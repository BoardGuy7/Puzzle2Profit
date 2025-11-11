import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Profile {
  id: string;
  email: string;
  subscription_status: 'free' | 'monthly' | 'annual';
  stripe_customer_id: string | null;
  subscription_end_date: string | null;
  created_at: string;
  updated_at: string;
}

export interface Puzzle {
  id: string;
  day_number: number;
  title: string;
  category: 'Build' | 'Attract' | 'Convert' | 'Deliver' | 'Support' | 'Profit' | 'Rest';
  theme: string;
  outcome: string;
  teaser_text: string;
  bullet_1: string;
  bullet_2: string;
  bullet_3: string;
  solution_text: string;
  advanced_guidance: string;
  published_date: string;
  created_at: string;
}

export interface EmailSignup {
  email: string;
  name?: string;
}
