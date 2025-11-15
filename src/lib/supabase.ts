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
  is_admin: boolean;
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

export interface AffiliateLink {
  url: string;
  description: string;
  utm_params?: Record<string, string>;
}

export interface Blog {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: 'Build' | 'Attract' | 'Convert' | 'Deliver' | 'Support' | 'Profit' | 'Rest';
  author: string;
  affiliate_links: AffiliateLink[];
  published: boolean;
  published_date: string | null;
  scheduled_date: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Trend {
  id: string;
  topic: string;
  summary: string;
  tools_mentioned: string[];
  blog_ideas: Array<{title: string; category: string}>;
  source: string;
  created_at: string;
}

export interface AffiliateClick {
  id: string;
  blog_id: string;
  url: string;
  user_id: string | null;
  clicked_at: string;
  user_agent: string | null;
  referrer: string | null;
}

export interface EmailCampaign {
  id: string;
  blog_id: string | null;
  brevo_campaign_id: string | null;
  subject: string;
  sent_count: number;
  open_rate: number;
  click_rate: number;
  bounce_rate: number;
  sent_at: string;
  last_synced: string;
}
