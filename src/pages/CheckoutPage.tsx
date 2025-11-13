import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Check, Puzzle, ArrowLeft } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import DisclaimerModal from '../components/DisclaimerModal';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default function CheckoutPage() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planParam = searchParams.get('plan') || 'monthly';
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'annual'>(
    planParam === 'annual' ? 'annual' : 'monthly'
  );
  const [loading, setLoading] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/auth?redirect=/checkout');
    }
  }, [user, navigate]);

  const handleCheckout = async () => {
    if (!user?.id) return;

    setLoading(true);

    try {
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/stripe-checkout`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId: selectedPlan === 'annual'
            ? 'price_1SSOtjJyZPU9wusP5Iaxlt6m'
            : 'price_1SSOsjJyZPU9wusPz85je8Ek',
          userId: user.id,
          email: profile?.email,
          successUrl: `${window.location.origin}/dashboard?payment=success`,
          cancelUrl: `${window.location.origin}/checkout?payment=cancelled`
        })
      });

      const { sessionId, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error('Stripe failed to load');
      }

      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        throw stripeError;
      }
    } catch (err: any) {
      alert(`Checkout error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const plans = {
    monthly: {
      name: 'Monthly Access',
      price: '$48',
      period: '/month',
      savings: null,
      features: [
        'Access 7-day puzzle cycle to learn AI automation',
        'Complete solutions with step-by-step guides',
        'Build skills in scripting and automation tools',
        'Searchable vault of all past puzzles',
        'New educational puzzles added weekly',
        'Cancel anytime'
      ]
    },
    annual: {
      name: 'Annual Access',
      price: '$499',
      period: '/year',
      savings: 'Save $77/year (17% off)',
      features: [
        'Everything in Monthly, plus:',
        'Priority support and educational updates',
        'Exclusive bonus automation learning templates',
        'Early access to new puzzle categories',
        'Community resources for practical application',
        'Best value - just $41.58/month'
      ]
    }
  };

  const plan = plans[selectedPlan];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-black to-blue-950">
      <DisclaimerModal
        isOpen={showDisclaimer}
        onAccept={() => setShowDisclaimer(false)}
      />
      <header className="border-b border-gray-800 bg-black">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Puzzle className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Puzzle2Profit</span>
          </Link>
          <Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors flex items-center gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Vault
          </Link>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Unlock the Complete Learning Vault
          </h1>
          <p className="text-xl text-gray-300">
            Choose your plan and start learning AI automation skills today
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <button
            onClick={() => setSelectedPlan('monthly')}
            className={`text-left bg-blue-900 bg-opacity-50 rounded-2xl p-8 border-2 transition-all transform hover:scale-105 ${
              selectedPlan === 'monthly'
                ? 'border-orange-500 ring-4 ring-orange-500 ring-opacity-50'
                : 'border-blue-800 hover:border-orange-500'
            }`}
          >
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">{plans.monthly.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{plans.monthly.price}</span>
                <span className="text-xl text-gray-300">{plans.monthly.period}</span>
              </div>
            </div>

            <ul className="space-y-3">
              {plans.monthly.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                  <span className="text-gray-300">{feature}</span>
                </li>
              ))}
            </ul>
          </button>

          <button
            onClick={() => setSelectedPlan('annual')}
            className={`text-left bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-8 border-2 relative transform hover:scale-105 transition-all ${
              selectedPlan === 'annual'
                ? 'border-green-400 ring-4 ring-green-400 ring-opacity-50'
                : 'border-orange-400'
            }`}
          >
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm">
                BEST VALUE - Save 17%
              </div>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">{plans.annual.name}</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">{plans.annual.price}</span>
                <span className="text-xl text-white opacity-80">{plans.annual.period}</span>
              </div>
              <p className="text-white opacity-90 mt-2">{plans.annual.savings}</p>
            </div>

            <ul className="space-y-3">
              {plans.annual.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <Check className="w-5 h-5 text-white flex-shrink-0 mt-1" />
                  <span className="text-white font-semibold">{feature}</span>
                </li>
              ))}
            </ul>
          </button>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="bg-blue-900 bg-opacity-50 rounded-2xl p-8 border border-blue-800 mb-8">
            <h3 className="text-2xl font-bold text-white mb-4">Order Summary</h3>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Plan</span>
                <span className="text-white font-semibold">{plan.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-300">Email</span>
                <span className="text-white">{profile?.email}</span>
              </div>
              <div className="border-t border-gray-700 pt-3 flex justify-between items-center">
                <span className="text-xl font-bold text-white">Total</span>
                <span className="text-3xl font-bold text-orange-500">
                  {plan.price}
                  <span className="text-lg text-gray-300">{plan.period}</span>
                </span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white text-xl font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 disabled:transform-none shadow-lg"
            >
              {loading ? 'Processing...' : 'Complete Checkout'}
            </button>

            <p className="text-center text-gray-400 text-sm mt-4">
              Secure payment processing by Stripe
            </p>
          </div>

          <div className="text-center space-y-4">
            <div className="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-4">
              <p className="text-green-400 font-semibold">
                30-Day Money-Back Guarantee
              </p>
              <p className="text-gray-300 text-sm">
                Not satisfied? Get a full refund within 30 days, no questions asked.
              </p>
            </div>

            <p className="text-gray-400">
              Questions? Contact support@puzzle2profit.com
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
