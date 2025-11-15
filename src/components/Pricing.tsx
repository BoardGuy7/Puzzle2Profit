import { Check, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function Pricing() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handlePlanClick = (plan: 'monthly' | 'annual') => {
    if (user) {
      navigate(`/checkout?plan=${plan}`);
    } else {
      navigate(`/auth?redirect=/checkout?plan=${plan}`);
    }
  };

  return (
    <div className="bg-black py-20">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Unlock the Complete AI Learning Vault
          </h2>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            Get instant access to all puzzles, solutions, and educational guidance.
            <br />
            <span className="text-orange-500 font-semibold">
              Build practical AI automation skills at your own pace.
            </span>
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 border-2 border-blue-700 hover:border-orange-500 transition-all transform hover:scale-105">
            <div className="mb-6">
              <h3 className="text-2xl font-bold text-white mb-2">Monthly Access</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$8</span>
                <span className="text-xl text-gray-300">/month</span>
              </div>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">Access 7-day puzzle cycle to learn AI automation</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">Build skills in scripting and automation tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">Complete solutions with step-by-step guides</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">Community resources for practical application</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">Searchable vault of all past puzzles</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0 mt-1" />
                <span className="text-white">New educational puzzles added weekly</span>
              </li>
            </ul>

            <button
              onClick={() => handlePlanClick('monthly')}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Monthly Plan
            </button>
          </div>

          <div className="bg-gradient-to-br from-orange-600 to-orange-500 rounded-2xl p-8 border-2 border-orange-400 relative transform md:scale-105 shadow-2xl">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-green-500 text-white px-6 py-2 rounded-full font-bold text-sm flex items-center gap-2">
                <Zap className="w-4 h-4" />
                BEST VALUE - Save 8%
              </div>
            </div>

            <div className="mb-6 mt-4">
              <h3 className="text-2xl font-bold text-white mb-2">Annual Access</h3>
              <div className="flex items-baseline gap-2">
                <span className="text-5xl font-bold text-white">$88</span>
                <span className="text-xl text-white opacity-80">/year</span>
              </div>
              <p className="text-white opacity-90 mt-2">
                Just $7.33/month - Save $8/year
              </p>
            </div>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white font-semibold">Everything in Monthly, plus:</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Access 7-day puzzle cycle to learn AI automation</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Build skills in scripting and automation tools</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Community resources for practical application</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Priority support and educational updates</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Exclusive bonus automation learning templates</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-white flex-shrink-0 mt-1" />
                <span className="text-white">Early access to new puzzle categories</span>
              </li>
            </ul>

            <button
              onClick={() => handlePlanClick('annual')}
              className="w-full bg-white hover:bg-gray-100 text-orange-600 text-xl font-bold px-8 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              Start Annual Plan
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto mt-12">
          <div className="bg-blue-900 bg-opacity-40 border-2 border-blue-500 rounded-xl p-8">
            <h3 className="text-blue-300 font-bold text-xl mb-4 text-center">
              Educational Platform Notice
            </h3>
            <p className="text-gray-300 text-base leading-relaxed">
              Puzzle2Profit is an educational platform for AI skill-building. Subscription provides learning tools only—no guarantees of income or business success. Earnings, if any, depend on your effort, experience, and market conditions. The skills and strategies taught are for educational purposes and individual results will vary significantly. This content is not financial, legal, or professional advice. Always consult qualified professionals for financial decisions and business planning.
            </p>
          </div>
        </div>

        <div className="text-center mt-12">
          <p className="text-gray-400 text-lg">
            30-day money-back guarantee. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  );
}
