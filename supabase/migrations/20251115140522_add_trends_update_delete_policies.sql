/*
  # Add UPDATE and DELETE policies for trends table

  ## Changes
  This migration adds the missing RLS policies for the trends table:
  - Allow admins to UPDATE trends
  - Allow admins to DELETE trends

  ## Security
  Both policies verify that the user has `is_admin = true` in their profile
  before allowing the operation.
*/

-- Add UPDATE policy for admins
CREATE POLICY "Admins can update trends"
  ON trends FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));

-- Add DELETE policy for admins
CREATE POLICY "Admins can delete trends"
  ON trends FOR DELETE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.is_admin = true
  ));