# Deployment Guide - Puzzle2Profit Blog Platform

## Quick Start Deployment

### 1. Prerequisites

- Supabase account (already configured)
- Vercel account (or preferred hosting)
- GitHub repository
- Grok API key from xAI
- Brevo API key

### 2. Database Setup

All migrations are already applied. To verify:

```sql
-- Check tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public';

-- Should show: profiles, puzzles, email_signups, blogs, trends, affiliate_clicks, email_campaigns
```

### 3. Make Your First Admin

Replace with your actual email:

```sql
UPDATE profiles
SET is_admin = true
WHERE email = 'your@email.com';
```

### 4. Environment Variables

#### In Vercel (or hosting platform):

```bash
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

#### In Supabase Edge Functions (auto-configured):

The following are already set up via Supabase secrets:
- `GROK_API_KEY`
- `BREVO_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### 5. Deploy to Vercel

#### Option A: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel --prod
```

#### Option B: Via GitHub

1. Go to https://vercel.com/new
2. Import your GitHub repository
3. Configure environment variables
4. Deploy

### 6. Configure Cron Jobs

For automated daily research and email publishing:

#### Using Vercel Cron Jobs:

Create `vercel.json` in project root:

```json
{
  "crons": [
    {
      "path": "/api/cron/research",
      "schedule": "0 9 * * *"
    },
    {
      "path": "/api/cron/publish",
      "schedule": "0 10 * * *"
    }
  ]
}
```

Create API routes:

**`/api/cron/research.ts`**:
```typescript
export default async function handler(req: any, res: any) {
  const response = await fetch(
    `${process.env.VITE_SUPABASE_URL}/functions/v1/research-agent`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await response.json();
  res.status(200).json(data);
}
```

**`/api/cron/publish.ts`**:
```typescript
export default async function handler(req: any, res: any) {
  const response = await fetch(
    `${process.env.VITE_SUPABASE_URL}/functions/v1/blog-publisher`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.VITE_SUPABASE_ANON_KEY}`
      }
    }
  );
  const data = await response.json();
  res.status(200).json(data);
}
```

#### Using GitHub Actions:

Create `.github/workflows/daily-tasks.yml`:

```yaml
name: Daily Blog Tasks

on:
  schedule:
    # Run research at 9 AM UTC daily
    - cron: '0 9 * * *'
  workflow_dispatch:

jobs:
  research:
    runs-on: ubuntu-latest
    steps:
      - name: Run Research Agent
        run: |
          curl -X POST \
            '${{ secrets.SUPABASE_URL }}/functions/v1/research-agent' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}'

  publish:
    runs-on: ubuntu-latest
    needs: research
    steps:
      - name: Run Blog Publisher
        run: |
          curl -X POST \
            '${{ secrets.SUPABASE_URL }}/functions/v1/blog-publisher' \
            -H 'Authorization: Bearer ${{ secrets.SUPABASE_ANON_KEY }}'
```

Add secrets to GitHub repo:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`

### 7. Initial Content Setup

#### Create Your First Blog Post:

1. Navigate to `/admin`
2. Click "New Blog Post"
3. Fill in details or use AI generation
4. Publish

#### Test Email System:

1. Add test email to `email_signups` table:
```sql
INSERT INTO email_signups (email, name, brevo_synced)
VALUES ('test@example.com', 'Test User', true);
```

2. Manually trigger blog publisher:
```bash
curl -X POST \
  'https://your-project.supabase.co/functions/v1/blog-publisher' \
  -H 'Authorization: Bearer your_anon_key'
```

### 8. Brevo Configuration

1. Go to Brevo dashboard
2. Create a contact list (e.g., "Puzzle2Profit Subscribers")
3. Verify sender email
4. Note the list ID for future use

Update email signup function to use your list ID:
```typescript
// In brevo-signup function
listIds: [YOUR_LIST_ID_HERE]
```

### 9. Custom Domain (Optional)

#### In Vercel:
1. Go to project settings
2. Click "Domains"
3. Add your custom domain
4. Update DNS records as instructed

#### Update CORS in Edge Functions:
```typescript
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://yourdomain.com",
  // ... other headers
};
```

### 10. SEO Setup

Add to `index.html`:

```html
<head>
  <!-- Existing meta tags -->
  <meta name="description" content="Daily AI Puzzles for Solopreneurs - Master the 7-day business cycle with Puzzle2Profit">
  <meta name="keywords" content="AI automation, solopreneur, business automation, AI tools">

  <!-- Open Graph -->
  <meta property="og:title" content="Puzzle2Profit - Daily AI Puzzles for Solopreneurs">
  <meta property="og:description" content="Master AI automation through daily puzzles">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://yourdomain.com">

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="Puzzle2Profit">
  <meta name="twitter:description" content="Daily AI Puzzles for Solopreneurs">
</head>
```

### 11. Monitoring & Analytics

#### Set up Supabase Monitoring:
1. Go to Supabase dashboard
2. Navigate to "Logs" section
3. Monitor edge function execution

#### Add Google Analytics (optional):
```html
<!-- In index.html -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### 12. Security Checklist

- ✅ RLS enabled on all tables
- ✅ Admin policies check `is_admin` flag
- ✅ CORS properly configured
- ✅ API keys stored as secrets
- ✅ JWT verification on protected edge functions
- ✅ Input validation in forms
- ✅ Affiliate link tracking anonymous-friendly

### 13. Testing Checklist

#### Frontend:
- [ ] Landing page loads with blogs
- [ ] Blog filtering works
- [ ] Blog post pages load
- [ ] Affiliate links track clicks
- [ ] Admin panel accessible (for admins)
- [ ] Blog editor works
- [ ] AI generation button triggers

#### Backend:
- [ ] Grok API generates content
- [ ] Research agent collects trends
- [ ] Blog publisher sends emails
- [ ] Brevo sync works
- [ ] Affiliate clicks recorded
- [ ] Metrics display correctly

### 14. Go Live Checklist

- [ ] Database migrations applied
- [ ] First admin user created
- [ ] Environment variables set
- [ ] Edge functions deployed
- [ ] Cron jobs configured
- [ ] Email list created in Brevo
- [ ] First blog post published
- [ ] Test email sent successfully
- [ ] Custom domain configured (if applicable)
- [ ] SEO meta tags added
- [ ] Analytics configured
- [ ] Monitoring set up

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Edge Functions Not Working
1. Check Supabase logs
2. Verify secrets are set
3. Test API keys in respective platforms
4. Ensure CORS headers match your domain

### Database Errors
```sql
-- Reset RLS if needed (careful!)
ALTER TABLE tablename DISABLE ROW LEVEL SECURITY;
ALTER TABLE tablename ENABLE ROW LEVEL SECURITY;

-- Re-apply policies from migration files
```

### Email Issues
- Verify Brevo sender email
- Check contact list exists
- Ensure contacts are synced
- Review campaign logs in Brevo

## Maintenance

### Daily Tasks
- Monitor edge function logs
- Check email metrics
- Review blog analytics

### Weekly Tasks
- Review AI research trends
- Update affiliate links
- Analyze click-through rates

### Monthly Tasks
- Audit admin access
- Review database performance
- Update dependencies

## Support Resources

- **Supabase Docs**: https://supabase.com/docs
- **Vercel Docs**: https://vercel.com/docs
- **Grok API**: https://docs.x.ai/
- **Brevo API**: https://developers.brevo.com/

## Success Metrics

Track these KPIs:
1. **Blog Views**: Total and per-post
2. **Affiliate Clicks**: CTR on recommendations
3. **Email Open Rate**: Target 20-30%
4. **Email Click Rate**: Target 2-5%
5. **Subscriber Growth**: Daily new signups
6. **Admin Efficiency**: Time saved with AI

Your Puzzle2Profit blog platform is now ready for production! 🚀
