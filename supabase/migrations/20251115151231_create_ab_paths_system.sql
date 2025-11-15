/*
  # Create A/B Paths System

  ## Overview
  This migration creates a comprehensive A/B testing framework for Puzzle2Profit's
  dual-path strategy targeting solopreneurs with different tech stacks.

  ## New Tables

  ### `paths`
  Tracks the two weekly paths (A & B) with different tech stack approaches:
  - `id` (uuid, primary key) - Unique identifier
  - `name` (text, not null) - Path name (e.g., "Path A", "Path B")
  - `slug` (text, unique, not null) - URL-safe identifier (e.g., "a", "b")
  - `description` (text) - Path description
  - `tech_stack_focus` (text) - Primary focus (e.g., "No-Code Tools", "AI APIs")
  - `active` (boolean, default true) - Whether path is currently active
  - `week_start_date` (date) - Start of current week cycle
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `tech_stacks`
  Individual tools/platforms available for each path:
  - `id` (uuid, primary key) - Unique identifier
  - `path_id` (uuid, references paths) - Associated path
  - `name` (text, not null) - Tool name (e.g., "Bubble", "OpenAI")
  - `category` (text) - Tool category (e.g., "No-Code Builder", "AI API")
  - `description` (text) - Tool description
  - `website_url` (text) - Official website
  - `affiliate_url` (text) - Affiliate sign-up link
  - `commission_rate` (text) - Commission details
  - `pricing_model` (text) - Pricing structure
  - `key_features` (jsonb, default '[]') - Array of feature strings
  - `selected_for_week` (boolean, default false) - Currently selected for content
  - `priority_score` (integer, default 50) - AI ranking score (0-100)
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `weekly_content_plan`
  7-day content calendar for each path:
  - `id` (uuid, primary key) - Unique identifier
  - `path_id` (uuid, references paths) - Associated path
  - `week_start_date` (date, not null) - Start of week
  - `day_number` (integer, not null) - Day 1-7
  - `category` (text, not null) - Build/Attract/Convert/Deliver/Support/Profit/Rest
  - `blog_title` (text) - Generated blog title
  - `blog_outline` (text) - AI-generated outline
  - `affiliate_slots` (jsonb, default '[]') - Array of tech stack IDs to feature
  - `status` (text, default 'draft') - draft/scheduled/published
  - `scheduled_publish_date` (timestamptz) - When to auto-publish
  - `published_date` (timestamptz) - When actually published
  - `blog_id` (uuid, references blogs) - Link to actual blog post
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `path_analytics`
  Track performance metrics for each path:
  - `id` (uuid, primary key) - Unique identifier
  - `path_id` (uuid, references paths) - Associated path
  - `date` (date, not null) - Tracking date
  - `page_views` (integer, default 0) - Total page views
  - `unique_visitors` (integer, default 0) - Unique visitors
  - `affiliate_clicks` (integer, default 0) - Total affiliate clicks
  - `conversions` (integer, default 0) - Confirmed conversions
  - `revenue` (decimal(10,2), default 0.00) - Generated revenue
  - `avg_time_on_page` (integer, default 0) - Average seconds on page
  - `bounce_rate` (decimal(5,2), default 0.00) - Bounce rate percentage
  - `created_at` (timestamptz, default now())

  ### `utm_tracking`
  Detailed UTM parameter tracking for path isolation:
  - `id` (uuid, primary key) - Unique identifier
  - `path_id` (uuid, references paths) - Associated path
  - `tech_stack_id` (uuid, references tech_stacks) - Associated tool
  - `blog_id` (uuid, references blogs) - Associated blog post
  - `utm_source` (text) - UTM source parameter
  - `utm_medium` (text) - UTM medium parameter
  - `utm_campaign` (text) - UTM campaign parameter
  - `utm_term` (text) - UTM term parameter
  - `utm_content` (text) - UTM content parameter
  - `clicked_at` (timestamptz, default now()) - Click timestamp
  - `user_id` (uuid, references auth.users) - User if authenticated
  - `ip_address` (text) - Visitor IP (hashed for privacy)
  - `user_agent` (text) - Browser user agent
  - `referrer` (text) - Page referrer
  - `converted` (boolean, default false) - Whether click converted
  - `conversion_value` (decimal(10,2)) - Conversion value

  ## Security
  - Enable RLS on all tables
  - Admin-only access for management
  - Public read access for active paths and published content
  - UTM tracking allows public inserts for analytics
*/

-- Create paths table
CREATE TABLE IF NOT EXISTS paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  tech_stack_focus text,
  active boolean DEFAULT true NOT NULL,
  week_start_date date,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create tech_stacks table
CREATE TABLE IF NOT EXISTS tech_stacks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid REFERENCES paths(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text,
  description text,
  website_url text,
  affiliate_url text,
  commission_rate text,
  pricing_model text,
  key_features jsonb DEFAULT '[]'::jsonb NOT NULL,
  selected_for_week boolean DEFAULT false NOT NULL,
  priority_score integer DEFAULT 50 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create weekly_content_plan table
CREATE TABLE IF NOT EXISTS weekly_content_plan (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid REFERENCES paths(id) ON DELETE CASCADE NOT NULL,
  week_start_date date NOT NULL,
  day_number integer NOT NULL CHECK (day_number BETWEEN 1 AND 7),
  category text NOT NULL CHECK (category IN ('Build', 'Attract', 'Convert', 'Deliver', 'Support', 'Profit', 'Rest')),
  blog_title text,
  blog_outline text,
  affiliate_slots jsonb DEFAULT '[]'::jsonb NOT NULL,
  status text DEFAULT 'draft' NOT NULL CHECK (status IN ('draft', 'scheduled', 'published')),
  scheduled_publish_date timestamptz,
  published_date timestamptz,
  blog_id uuid REFERENCES blogs(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(path_id, week_start_date, day_number)
);

-- Create path_analytics table
CREATE TABLE IF NOT EXISTS path_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid REFERENCES paths(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  page_views integer DEFAULT 0 NOT NULL,
  unique_visitors integer DEFAULT 0 NOT NULL,
  affiliate_clicks integer DEFAULT 0 NOT NULL,
  conversions integer DEFAULT 0 NOT NULL,
  revenue decimal(10,2) DEFAULT 0.00 NOT NULL,
  avg_time_on_page integer DEFAULT 0 NOT NULL,
  bounce_rate decimal(5,2) DEFAULT 0.00 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  UNIQUE(path_id, date)
);

-- Create utm_tracking table
CREATE TABLE IF NOT EXISTS utm_tracking (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  path_id uuid REFERENCES paths(id) ON DELETE CASCADE,
  tech_stack_id uuid REFERENCES tech_stacks(id) ON DELETE SET NULL,
  blog_id uuid REFERENCES blogs(id) ON DELETE SET NULL,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  utm_term text,
  utm_content text,
  clicked_at timestamptz DEFAULT now() NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  ip_address text,
  user_agent text,
  referrer text,
  converted boolean DEFAULT false NOT NULL,
  conversion_value decimal(10,2)
);

-- Enable RLS
ALTER TABLE paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE tech_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_content_plan ENABLE ROW LEVEL SECURITY;
ALTER TABLE path_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE utm_tracking ENABLE ROW LEVEL SECURITY;

-- Paths policies
CREATE POLICY "Public can read active paths"
  ON paths FOR SELECT
  TO anon, authenticated
  USING (active = true);

CREATE POLICY "Admins can manage paths"
  ON paths FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Tech stacks policies
CREATE POLICY "Public can read tech stacks for active paths"
  ON tech_stacks FOR SELECT
  TO anon, authenticated
  USING (EXISTS (
    SELECT 1 FROM paths WHERE paths.id = tech_stacks.path_id AND paths.active = true
  ));

CREATE POLICY "Admins can manage tech stacks"
  ON tech_stacks FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Weekly content plan policies
CREATE POLICY "Public can read published content plans"
  ON weekly_content_plan FOR SELECT
  TO anon, authenticated
  USING (status = 'published');

CREATE POLICY "Admins can manage content plans"
  ON weekly_content_plan FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Path analytics policies
CREATE POLICY "Admins can manage analytics"
  ON path_analytics FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- UTM tracking policies
CREATE POLICY "Anyone can insert UTM tracking"
  ON utm_tracking FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read UTM tracking"
  ON utm_tracking FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can update UTM tracking"
  ON utm_tracking FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_paths_slug ON paths(slug);
CREATE INDEX IF NOT EXISTS idx_paths_active ON paths(active);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_path_id ON tech_stacks(path_id);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_selected ON tech_stacks(selected_for_week);
CREATE INDEX IF NOT EXISTS idx_weekly_content_path_week ON weekly_content_plan(path_id, week_start_date);
CREATE INDEX IF NOT EXISTS idx_weekly_content_status ON weekly_content_plan(status);
CREATE INDEX IF NOT EXISTS idx_path_analytics_path_date ON path_analytics(path_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_path_id ON utm_tracking(path_id);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_clicked_at ON utm_tracking(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_utm_tracking_converted ON utm_tracking(converted);

-- Insert default paths
INSERT INTO paths (name, slug, description, tech_stack_focus, week_start_date)
VALUES 
  ('Path A', 'a', 'No-code tools approach for rapid prototyping and solopreneur solutions', 'No-Code Tools', CURRENT_DATE),
  ('Path B', 'b', 'AI API-driven development for scalable automation and intelligent systems', 'AI APIs', CURRENT_DATE)
ON CONFLICT (slug) DO NOTHING;