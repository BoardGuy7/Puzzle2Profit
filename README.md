# Puzzle2Profit.com - AI Automation Puzzle Vault

A complete React/Node.js SaaS web application that helps beginners build passive income systems through daily no-code AI puzzles in a 7-day cycle.

## Features

### Landing Page
- **Auto-rotating Carousel**: 7 slides with 5-second autoplay, infinite loop, pause on hover, mobile swipe support
- **Confetti Animation**: Celebrates completion on Day 7 slide
- **Email Signup**: Integrates with Brevo API for capturing leads
- **Pricing Section**: Monthly ($48) and Annual ($499) subscription options
- **SEO Optimized**: Meta tags for AI automation and passive income keywords
- **Google Analytics**: Ready for tracking with placeholder ID

### Authentication
- **Supabase Auth**: Email/password authentication
- **User Profiles**: Automatic profile creation with subscription tracking
- **Protected Routes**: Dashboard requires authentication

### Vault Dashboard
- **Searchable Archive**: Find puzzles by title, category, or keywords
- **Category Filters**: Filter by Build, Attract, Convert, Deliver, Support, Profit, Rest
- **Free vs Paid Access**: Teasers for free users, full solutions for paid members
- **Responsive Design**: Mobile-friendly grid layout
- **Modal Views**: Detailed puzzle view with solutions and guidance

### Stripe Integration
- **Checkout Flow**: Pre-built checkout page for subscriptions
- **Multiple Plans**: Monthly and annual subscription options
- **Upgrade Prompts**: Free users see upgrade CTAs throughout the app

### Database
- **7 Sample Puzzles**: Pre-loaded with complete daily puzzles
- **User Profiles**: Track subscription status and customer data
- **Email Signups**: Store newsletter subscribers

## Tech Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS
- **Routing**: React Router DOM
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **Payments**: Stripe
- **Carousel**: Swiper.js
- **Animations**: Canvas Confetti
- **Icons**: Lucide React

## Color Scheme

- **Primary**: #1E3A8A (Deep Blue) - Trust
- **Secondary**: #F59E0B (Warm Orange) - Energy/CTAs
- **Accent**: #10B981 (Light Green) - Growth
- **Neutrals**: #000000 (Black), #FFFFFF (White)

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file contains the following variables:

```env
# Supabase (Already configured)
VITE_SUPABASE_URL=https://ndytlrfskaomflgvhyye.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Stripe (Add your keys)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_STRIPE_KEY_HERE

# Brevo (Add your API key)
VITE_BREVO_API_KEY=YOUR_BREVO_API_KEY_HERE

# Google Analytics (Add your tracking ID)
VITE_GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX
```

### 3. Database Setup

The database schema is already created with these tables:
- `profiles` - User subscription data
- `puzzles` - Puzzle content (7 samples pre-loaded)
- `email_signups` - Newsletter subscribers

Row Level Security (RLS) is enabled on all tables.

### 4. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── EmailSignup.tsx       # Newsletter signup form
│   ├── Pricing.tsx           # Pricing cards
│   └── PuzzleCarousel.tsx    # 7-slide carousel with confetti
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── lib/
│   └── supabase.ts           # Supabase client and types
├── pages/
│   ├── AuthPage.tsx          # Sign in/sign up
│   ├── CheckoutPage.tsx      # Stripe checkout
│   ├── Dashboard.tsx         # Protected puzzle vault
│   └── LandingPage.tsx       # Main landing page
├── App.tsx                   # Route configuration
└── main.tsx                  # App entry point
```

## API Integration

### Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Get your publishable key from the Dashboard
3. Create two products:
   - Monthly: $48/month
   - Annual: $499/year
4. Add price IDs to your checkout implementation
5. Set up webhook for subscription events

### Brevo Setup

1. Create a Brevo account at https://brevo.com
2. Create contact lists for your segments
3. Get your API key from Settings > SMTP & API > API Keys
4. Add the API key to your Supabase Edge Function secrets as `BREVO_API_KEY`
5. The Edge Function `brevo-signup` handles contact creation and list management

### Stripe Webhook Handler (Recommended)

Create a Supabase Edge Function to handle Stripe webhooks:

```typescript
// Update user subscription status on successful payment
```

## Database Queries

### Fetch All Puzzles

```typescript
const { data } = await supabase
  .from('puzzles')
  .select('*')
  .order('day_number', { ascending: true });
```

### Check User Subscription

```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('subscription_status')
  .eq('id', userId)
  .single();

const isPaid = profile?.subscription_status === 'monthly' ||
               profile?.subscription_status === 'annual';
```

## Key Features by Page

### Landing Page (/)
- Hero carousel with 7 puzzle previews
- Email signup form
- Pricing section
- Testimonials
- Full footer with links

### Auth Page (/auth)
- Sign up and sign in forms
- Automatic profile creation
- Redirect support for checkout flow

### Dashboard (/dashboard)
- Protected route (auth required)
- Search and filter puzzles
- Free users see teasers
- Paid users see full solutions
- Modal view for detailed content

### Checkout (/checkout)
- Plan selection (Monthly/Annual)
- Order summary
- Stripe integration ready
- Upgrade prompts

## User Flow

1. **Visitor** → Landing page
2. **Signup** → Email capture or account creation
3. **Browse** → Dashboard (free tier, teasers only)
4. **Upgrade** → Checkout page → Stripe payment
5. **Access** → Full puzzle solutions unlocked

## Security

- Row Level Security (RLS) enabled on all tables
- Authentication required for dashboard access
- API keys stored in environment variables
- CORS properly configured
- Input validation on forms

## Mobile Responsive

- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Touch-friendly carousel on mobile
- Collapsible navigation
- Responsive grid layouts

## Performance

- Built with Vite for fast development and optimized production builds
- Code splitting with React lazy loading
- Optimized images and assets
- Minimal bundle size

## Support

For questions or issues:
- Email: support@puzzle2profit.com
- Documentation: This README

## License

Proprietary - All rights reserved

---

Built with React, Supabase, Stripe, and AI automation.
