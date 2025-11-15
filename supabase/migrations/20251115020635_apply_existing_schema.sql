/*
  # Apply Puzzle2Profit Database Schema

  ## New Tables
  
  ### `profiles`
  - `id` (uuid, primary key, references auth.users)
  - `email` (text, not null)
  - `subscription_status` (text, default 'free') - Values: 'free', 'monthly', 'annual'
  - `stripe_customer_id` (text, nullable)
  - `subscription_end_date` (timestamptz, nullable)
  - `is_admin` (boolean, default false) - Admin role flag
  - `created_at` (timestamptz, default now())
  - `updated_at` (timestamptz, default now())
  
  ### `puzzles`
  - `id` (uuid, primary key)
  - `day_number` (integer, 1-7)
  - `title` (text, not null)
  - `category` (text, not null) - Values: Build, Attract, Convert, Deliver, Support, Profit, Rest
  - `theme` (text, not null)
  - `outcome` (text, not null) - One-line outcome description
  - `teaser_text` (text, not null) - Free preview content
  - `bullet_1` (text, not null)
  - `bullet_2` (text, not null)
  - `bullet_3` (text, not null)
  - `solution_text` (text, not null) - Full solution (paid only)
  - `advanced_guidance` (text, not null) - Advanced tips (paid only)
  - `published_date` (date, not null)
  - `created_at` (timestamptz, default now())
  
  ### `email_signups`
  - `id` (uuid, primary key)
  - `email` (text, unique, not null)
  - `name` (text, nullable)
  - `brevo_synced` (boolean, default false)
  - `created_at` (timestamptz, default now())

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can read/update their own profile, admins can read all
  - Puzzles: Authenticated users can read all puzzles, admins can insert/update
  - Email signups: Allow inserts from anyone, no reads
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL,
  subscription_status text DEFAULT 'free' NOT NULL,
  stripe_customer_id text,
  subscription_end_date timestamptz,
  is_admin boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create puzzles table
CREATE TABLE IF NOT EXISTS puzzles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_number integer NOT NULL CHECK (day_number >= 1 AND day_number <= 7),
  title text NOT NULL,
  category text NOT NULL,
  theme text NOT NULL,
  outcome text NOT NULL,
  teaser_text text NOT NULL,
  bullet_1 text NOT NULL,
  bullet_2 text NOT NULL,
  bullet_3 text NOT NULL,
  solution_text text NOT NULL,
  advanced_guidance text NOT NULL,
  published_date date NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Create email signups table
CREATE TABLE IF NOT EXISTS email_signups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  brevo_synced boolean DEFAULT false NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE puzzles ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_signups ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Admins can read all profiles"
  ON profiles FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Puzzles policies
CREATE POLICY "Authenticated users can read all puzzles"
  ON puzzles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Public can read puzzle teasers"
  ON puzzles FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins can insert puzzles"
  ON puzzles FOR INSERT
  TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can update puzzles"
  ON puzzles FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

CREATE POLICY "Admins can delete puzzles"
  ON puzzles FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Email signups policies
CREATE POLICY "Anyone can insert email signups"
  ON email_signups FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Admins can read email signups"
  ON email_signups FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_puzzles_category ON puzzles(category);
CREATE INDEX IF NOT EXISTS idx_puzzles_day_number ON puzzles(day_number);
CREATE INDEX IF NOT EXISTS idx_puzzles_published_date ON puzzles(published_date);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer_id ON profiles(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin);