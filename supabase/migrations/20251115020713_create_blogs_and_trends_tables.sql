/*
  # Create Blog and Trends Tables

  ## Overview
  This migration creates the blog platform infrastructure for Puzzle2Profit, including:
  - Blog posts with Markdown content and affiliate links
  - AI research trends storage
  - Affiliate link click tracking
  - Email campaign tracking

  ## New Tables

  ### `blogs`
  Blog posts categorized by the 7-day solopreneur cycle. Each post includes:
  - `id` (uuid, primary key) - Unique identifier
  - `title` (text, not null) - Blog post title
  - `content` (text, not null) - Full blog content in Markdown/HTML
  - `excerpt` (text, not null) - Short preview text for listing pages
  - `category` (text, not null) - One of: Build, Attract, Convert, Deliver, Support, Profit, Rest
  - `author` (text, default 'Puzzle Master') - Author name
  - `affiliate_links` (jsonb, default '[]') - Array of {url, description, utm_params}
  - `published` (boolean, default false) - Publication status
  - `published_date` (timestamptz, nullable) - When post was published
  - `scheduled_date` (timestamptz, nullable) - When post should auto-publish
  - `view_count` (integer, default 0) - Number of views
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())

  ### `trends`
  AI research trends collected by the research agent:
  - `id` (uuid, primary key) - Unique identifier
  - `topic` (text, not null) - Research topic area
  - `summary` (text, not null) - Trend summary from Grok
  - `tools_mentioned` (text[], default '{}') - Array of AI tool names
  - `blog_ideas` (jsonb, default '[]') - Array of suggested blog topics
  - `source` (text, default 'grok-api') - Source of research
  - `created_at` (timestamptz, default now())

  ### `affiliate_clicks`
  Track clicks on affiliate links for analytics:
  - `id` (uuid, primary key) - Unique identifier
  - `blog_id` (uuid, references blogs) - Associated blog post
  - `url` (text, not null) - Affiliate URL clicked
  - `user_id` (uuid, nullable, references auth.users) - User who clicked (if logged in)
  - `clicked_at` (timestamptz, default now()) - When click occurred
  - `user_agent` (text) - Browser user agent
  - `referrer` (text) - Page referrer

  ### `email_campaigns`
  Track email campaigns sent via Brevo:
  - `id` (uuid, primary key) - Unique identifier
  - `blog_id` (uuid, references blogs) - Associated blog post
  - `brevo_campaign_id` (text) - Brevo campaign identifier
  - `subject` (text, not null) - Email subject line
  - `sent_count` (integer, default 0) - Number of emails sent
  - `open_rate` (decimal, default 0.0) - Open rate percentage
  - `click_rate` (decimal, default 0.0) - Click rate percentage
  - `bounce_rate` (decimal, default 0.0) - Bounce rate percentage
  - `sent_at` (timestamptz, default now())
  - `last_synced` (timestamptz, default now()) - Last time metrics were synced

  ## Security
  - Enable RLS on all tables
  - Blogs: Public can read published posts, admins can manage all
  - Trends: Admins only
  - Affiliate clicks: Insert allowed for tracking, admins can read
  - Email campaigns: Admins only
*/

-- Create blogs table
CREATE TABLE IF NOT EXISTS blogs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  excerpt text NOT NULL,
  category text NOT NULL CHECK (category IN ('Build', 'Attract', 'Convert', 'Deliver', 'Support', 'Profit', 'Rest')),
  author text DEFAULT 'Puzzle Master' NOT NULL,
  affiliate_links jsonb DEFAULT '[]'::jsonb NOT NULL,
  published boolean DEFAULT false NOT NULL,
  published_date timestamptz,
  scheduled_date timestamptz,
  view_count integer DEFAULT 0 NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create trends table
CREATE TABLE IF NOT EXISTS trends (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  topic text NOT NULL,
  summary text NOT NULL,
  tools_mentioned text[] DEFAULT '{}'::text[] NOT NULL,
  blog_ideas jsonb DEFAULT '[]'::jsonb NOT NULL,
  source text DEFAULT 'grok-api' NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create affiliate_clicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE CASCADE,
  url text NOT NULL,
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at timestamptz DEFAULT now() NOT NULL,
  user_agent text,
  referrer text
);

-- Create email_campaigns table
CREATE TABLE IF NOT EXISTS email_campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  blog_id uuid REFERENCES blogs(id) ON DELETE SET NULL,
  brevo_campaign_id text,
  subject text NOT NULL,
  sent_count integer DEFAULT 0 NOT NULL,
  open_rate decimal(5,2) DEFAULT 0.0 NOT NULL,
  click_rate decimal(5,2) DEFAULT 0.0 NOT NULL,
  bounce_rate decimal(5,2) DEFAULT 0.0 NOT NULL,
  sent_at timestamptz DEFAULT now() NOT NULL,
  last_synced timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE blogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE trends ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_campaigns ENABLE ROW LEVEL SECURITY;

-- Blogs policies
CREATE POLICY "Public can read published blogs"
  ON blogs FOR SELECT
  TO anon, authenticated
  USING (published = true);

CREATE POLICY "Admins can read all blogs"
  ON blogs FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can insert blogs"
  ON blogs FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can update blogs"
  ON blogs FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can delete blogs"
  ON blogs FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Trends policies (admin only)
CREATE POLICY "Admins can read trends"
  ON trends FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can insert trends"
  ON trends FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Affiliate clicks policies
CREATE POLICY "Anyone can insert affiliate clicks"
  ON affiliate_clicks FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read affiliate clicks"
  ON affiliate_clicks FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Email campaigns policies (admin only)
CREATE POLICY "Admins can manage email campaigns"
  ON email_campaigns FOR ALL
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_blogs_category ON blogs(category);
CREATE INDEX IF NOT EXISTS idx_blogs_published ON blogs(published);
CREATE INDEX IF NOT EXISTS idx_blogs_published_date ON blogs(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_blogs_scheduled_date ON blogs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_trends_topic ON trends(topic);
CREATE INDEX IF NOT EXISTS idx_trends_created_at ON trends(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_blog_id ON affiliate_clicks(blog_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_blog_id ON email_campaigns(blog_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent_at ON email_campaigns(sent_at DESC);