/*
  # Rebuild Profile SELECT Policy

  1. Changes
    - Drop ALL existing SELECT policies on profiles
    - Create a single, simple SELECT policy that allows users to read their own profile
    - Remove the circular dependency issue with admin checks

  2. Security
    - Users can ONLY read their own profile row
    - All columns including is_admin are accessible to the profile owner
*/

-- Drop all existing SELECT policies
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can read all profiles" ON profiles;

-- Create single SELECT policy
CREATE POLICY "Allow users to read own profile"
  ON profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid());
