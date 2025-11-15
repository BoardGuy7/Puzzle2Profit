# Admin Account Setup

## Create Admin Account

To create the admin account with email `kubisiak17@gmail.com` and password `Admin123`:

### Option 1: Via Application (Recommended)

1. Go to your application at `/auth`
2. Click "Sign Up"
3. Enter:
   - **Email**: kubisiak17@gmail.com
   - **Password**: Admin123
4. Complete the signup process
5. Then run this SQL in Supabase SQL Editor:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'kubisiak17@gmail.com';
```

### Option 2: Direct SQL Setup (If email confirmation is disabled)

Run this in your Supabase SQL Editor:

```sql
-- First, create the auth user (this creates the account)
-- Note: This requires service role access and proper password hashing

-- After signing up via the UI, just promote to admin:
UPDATE profiles
SET is_admin = true
WHERE email = 'kubisiak17@gmail.com';
```

### Option 3: Using Supabase Dashboard

1. Go to Supabase Dashboard → Authentication → Users
2. Click "Add User"
3. Enter:
   - Email: kubisiak17@gmail.com
   - Password: Admin123
   - Auto Confirm User: Yes
4. Click "Create User"
5. Then run this SQL:

```sql
-- Promote to admin
UPDATE profiles
SET is_admin = true
WHERE email = 'kubisiak17@gmail.com';

-- If profile doesn't exist, create it
INSERT INTO profiles (id, email, is_admin, subscription_status)
SELECT
  id,
  email,
  true,
  'free'
FROM auth.users
WHERE email = 'kubisiak17@gmail.com'
ON CONFLICT (id) DO UPDATE
SET is_admin = true;
```

## Login to Admin Dashboard

After setup:

1. Go to `/auth`
2. Sign in with:
   - **Email**: kubisiak17@gmail.com
   - **Password**: Admin123
3. Navigate to `/admin` or click "Admin Panel" from user dashboard

## Security Note

For production, consider:
- Using a stronger password
- Enabling 2FA if available
- Changing the password after initial setup
- Using environment-specific credentials
