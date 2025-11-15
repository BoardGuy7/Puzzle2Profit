/*
  # Add Detailed Tool Information to Trends Table

  ## Changes
  1. Add new columns to trends table for comprehensive tool information:
    - `tools_detailed` (jsonb): Stores detailed information about each tool including:
      - Tool name
      - Description
      - Website URL
      - Affiliate link (if available)
      - Pricing information
      - Key features
    - `key_insights` (jsonb): Stores additional research insights and actionable takeaways
  
  ## Purpose
  This migration enhances the trends table to store comprehensive research data including
  affiliate links and detailed tool information that can be exported for action.
*/

-- Add columns for detailed tool information
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trends' AND column_name = 'tools_detailed'
  ) THEN
    ALTER TABLE trends ADD COLUMN tools_detailed jsonb DEFAULT '[]'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trends' AND column_name = 'key_insights'
  ) THEN
    ALTER TABLE trends ADD COLUMN key_insights jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;