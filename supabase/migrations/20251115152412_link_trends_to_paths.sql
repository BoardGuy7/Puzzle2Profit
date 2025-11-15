/*
  # Link Trends to A/B Paths

  ## Changes
  This migration adds path differentiation to the trends table:
  - Add `path_id` column to link trends to specific paths (A or B)
  - Add index for efficient path-based queries
  - Update existing trends to be path-agnostic (null path_id for backward compatibility)

  ## Purpose
  Enables the research agent to generate separate, targeted research for:
  - Path A: No-Code tools (Bubble, Webflow, Zapier, etc.)
  - Path B: AI APIs (OpenAI, Anthropic, Groq, etc.)
*/

-- Add path_id column to trends table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'trends' AND column_name = 'path_id'
  ) THEN
    ALTER TABLE trends ADD COLUMN path_id uuid REFERENCES paths(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Create index for path-based queries
CREATE INDEX IF NOT EXISTS idx_trends_path_id ON trends(path_id);

-- Add helpful comment
COMMENT ON COLUMN trends.path_id IS 'Links trend research to specific A/B path. NULL = path-agnostic research';