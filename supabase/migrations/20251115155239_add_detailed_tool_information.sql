/*
  # Add Detailed Tool Information and Affiliate Workflow

  ## Changes
  This migration enhances the tech_stacks table to support the weekly affiliate onboarding workflow:
  
  1. **Affiliate Management:**
     - `signup_status` - Track affiliate signup progress (pending/registered/active/declined)
     - `signup_date` - When you registered for the affiliate program
     - `affiliate_notes` - Notes about commission structure, approval process, etc.
     - `last_used_week` - Track when affiliate link was last used in content
     - `conversion_tracking_code` - UTM or tracking pixel code for this affiliate
  
  2. **Tool Details from Research:**
     - `tools_detailed_source` - JSONB field to store full tool details from AI research
       (includes: website, pricing, features, affiliate_program info)
  
  3. **Weekly Workflow:**
     - `week_number` - Which week this tool is being featured (1-4 cycle)
     - `auto_populated` - Whether this was auto-populated from research vs manually added
  
  ## Purpose
  Enables the workflow: Research → Auto-populate tools → Manual affiliate signup → 
  Blog generation with links → Social posts → Performance tracking → Weekly review
*/

-- Add affiliate workflow columns to tech_stacks
DO $$
BEGIN
  -- Affiliate management
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'signup_status') THEN
    ALTER TABLE tech_stacks ADD COLUMN signup_status text DEFAULT 'pending' CHECK (signup_status IN ('pending', 'registered', 'active', 'declined'));
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'signup_date') THEN
    ALTER TABLE tech_stacks ADD COLUMN signup_date date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'affiliate_notes') THEN
    ALTER TABLE tech_stacks ADD COLUMN affiliate_notes text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'last_used_week') THEN
    ALTER TABLE tech_stacks ADD COLUMN last_used_week date;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'conversion_tracking_code') THEN
    ALTER TABLE tech_stacks ADD COLUMN conversion_tracking_code text;
  END IF;

  -- Tool details from research
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'tools_detailed_source') THEN
    ALTER TABLE tech_stacks ADD COLUMN tools_detailed_source jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Weekly workflow tracking
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'week_number') THEN
    ALTER TABLE tech_stacks ADD COLUMN week_number integer CHECK (week_number BETWEEN 1 AND 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'tech_stacks' AND column_name = 'auto_populated') THEN
    ALTER TABLE tech_stacks ADD COLUMN auto_populated boolean DEFAULT false;
  END IF;
END $$;

-- Add additional columns for tracking trends to tech_stacks relationship
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trends' AND column_name = 'week_number') THEN
    ALTER TABLE trends ADD COLUMN week_number integer CHECK (week_number BETWEEN 1 AND 4);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'trends' AND column_name = 'tools_populated') THEN
    ALTER TABLE trends ADD COLUMN tools_populated boolean DEFAULT false;
  END IF;
END $$;

-- Create indexes for workflow queries
CREATE INDEX IF NOT EXISTS idx_tech_stacks_signup_status ON tech_stacks(signup_status);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_week_number ON tech_stacks(week_number);
CREATE INDEX IF NOT EXISTS idx_tech_stacks_auto_populated ON tech_stacks(auto_populated);
CREATE INDEX IF NOT EXISTS idx_trends_week_number ON trends(week_number);

-- Add helpful comments
COMMENT ON COLUMN tech_stacks.signup_status IS 'Workflow status: pending=needs signup, registered=signed up awaiting approval, active=approved and ready, declined=no affiliate program';
COMMENT ON COLUMN tech_stacks.tools_detailed_source IS 'Full tool details from AI research (website, pricing, features, affiliate program info)';
COMMENT ON COLUMN tech_stacks.auto_populated IS 'True if auto-populated from research agent, false if manually added';
COMMENT ON COLUMN trends.tools_populated IS 'True if tools from this research have been populated to tech_stacks table';