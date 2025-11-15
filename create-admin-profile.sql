-- Admin Profile Setup Script
-- Run this AFTER creating the user account via Supabase Dashboard or the application

-- Step 1: Verify the user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'kubisiak17@gmail.com';

-- Step 2: Create or update the profile with admin access
INSERT INTO profiles (
  id,
  email,
  is_admin,
  subscription_status,
  created_at,
  updated_at
)
SELECT
  id,
  email,
  true,
  'free',
  now(),
  now()
FROM auth.users
WHERE email = 'kubisiak17@gmail.com'
ON CONFLICT (id) DO UPDATE
SET
  is_admin = true,
  updated_at = now();

-- Step 3: Verify admin profile was created
SELECT
  id,
  email,
  is_admin,
  subscription_status,
  created_at
FROM profiles
WHERE email = 'kubisiak17@gmail.com';

-- Expected result: is_admin should be true
