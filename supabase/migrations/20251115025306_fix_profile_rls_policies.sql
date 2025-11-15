/*
  # Fix Profile RLS Policies

  1. Changes
    - Drop existing SELECT policies on profiles table
    - Create new simplified SELECT policy that allows users to read their own profile
    - Ensure is_admin field is accessible to the profile owner

  2. Security
    - Users can only read their own profile data
    - Admin field is accessible to the profile owner for UI rendering
*/

-- Drop existing SELECT policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create new SELECT policy that allows users to read their own profile
CREATE POLICY "Users can read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create separate admin policy for reading all profiles
CREATE POLICY "Admins can read all profiles"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
