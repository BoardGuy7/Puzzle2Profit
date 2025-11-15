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

export interface ToolDetailed {
  name: string;
  description: string;
  website: string;
  affiliate_program: string;
  pricing: string;
  key_features: string[];
}

export interface Trend {
  id: string;
  topic: string;
  summary: string;
  tools_mentioned: string[];
  tools_detailed: ToolDetailed[];
  key_insights: string[];
  blog_ideas: Array<{title: string; category: string; day: string; description: string}>;
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

export interface Path {
  id: string;
  name: string;
  slug: string;
  description: string;
  tech_stack_focus: string;
  active: boolean;
  week_start_date: string;
  created_at: string;
  updated_at: string;
}

export interface TechStack {
  id: string;
  path_id: string;
  name: string;
  category: string;
  description: string;
  website_url: string;
  affiliate_url: string;
  commission_rate: string;
  pricing_model: string;
  key_features: string[];
  selected_for_week: boolean;
  priority_score: number;
  created_at: string;
  updated_at: string;
}

export interface WeeklyContentPlan {
  id: string;
  path_id: string;
  week_start_date: string;
  day_number: number;
  category: 'Build' | 'Attract' | 'Convert' | 'Deliver' | 'Support' | 'Profit' | 'Rest';
  blog_title: string;
  blog_outline: string;
  affiliate_slots: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduled_publish_date: string | null;
  published_date: string | null;
  blog_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface PathAnalytics {
  id: string;
  path_id: string;
  date: string;
  page_views: number;
  unique_visitors: number;
  affiliate_clicks: number;
  conversions: number;
  revenue: number;
  avg_time_on_page: number;
  bounce_rate: number;
  created_at: string;
}

export interface UTMTracking {
  id: string;
  path_id: string;
  tech_stack_id: string | null;
  blog_id: string | null;
  utm_source: string;
  utm_medium: string;
  utm_campaign: string;
  utm_term: string;
  utm_content: string;
  clicked_at: string;
  user_id: string | null;
  ip_address: string;
  user_agent: string;
  referrer: string;
  converted: boolean;
  conversion_value: number | null;
}
