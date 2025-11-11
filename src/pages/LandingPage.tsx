import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Puzzle, Twitter, Linkedin, Youtube } from 'lucide-react';
import PuzzleCarousel from '../components/PuzzleCarousel';
import EmailSignup from '../components/EmailSignup';
import Pricing from '../components/Pricing';

export default function LandingPage() {
  const signupRef = useRef<HTMLDivElement>(null);

  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <Puzzle className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Puzzle2Profit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Link
              to="/auth"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
            >
              Sign In
            </Link>
            <button
              onClick={scrollToSignup}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
            >
              Get Started Free
            </button>
          </nav>
        </div>
      </header>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Build a <span className="text-orange-500">$10k/Month</span> AI Business
            <br />
            <span className="text-green-400">One Daily Puzzle at a Time</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            No-code AI automation puzzles that teach you to build passive income systems.
            <br />
            <span className="text-white font-semibold">7 days. 7 puzzles. Complete profit machine.</span>
          </p>
        </div>

        <PuzzleCarousel onSignupClick={scrollToSignup} />
      </section>

      <section id="how-it-works" className="py-20 px-4 bg-gradient-to-b from-black to-blue-950">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-16">
            How Puzzle2Profit Works
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">1</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Get Daily Puzzle</h3>
              <p className="text-gray-300 text-lg">
                Each morning, receive one actionable AI automation puzzle. Build, Attract, Convert, Deliver, Support, Profit, or Rest.
              </p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Solve with AI</h3>
              <p className="text-gray-300 text-lg">
                Follow step-by-step no-code solutions using AI tools. Copy, paste, launch. Each puzzle takes 15-60 minutes.
              </p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Build Passive Income</h3>
              <p className="text-gray-300 text-lg">
                By Day 7, you own a complete automated system. Scale to $10k/month while the AI runs your business.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-xl p-8 max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl text-white font-bold mb-4">
                Join 1,000+ builders creating passive income with AI
              </p>
              <p className="text-xl text-orange-400">
                Average member builds their first automated income stream in under 14 days
              </p>
            </div>
          </div>
        </div>
      </section>

      <section ref={signupRef} className="py-20 px-4">
        <EmailSignup />
      </section>

      <section id="pricing">
        <Pricing />
      </section>

      <section className="py-20 px-4 bg-blue-950">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
            What Our Members Say
          </h2>

          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <p className="text-gray-300 text-lg mb-4 italic">
                "I went from zero to $3k/month in 30 days using these puzzles. The AI automation is incredible - it literally runs itself."
              </p>
              <p className="text-white font-semibold">- Sarah K., Online Course Creator</p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <p className="text-gray-300 text-lg mb-4 italic">
                "Finally, a system that actually works. No fluff, just actionable steps. My business is now 90% automated."
              </p>
              <p className="text-white font-semibold">- Michael T., SaaS Founder</p>
            </div>
          </div>

          <button
            onClick={scrollToSignup}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold px-12 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
          >
            Start Building Your AI Empire
          </button>
        </div>
      </section>

      <footer className="bg-black border-t border-gray-800 py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Puzzle className="w-6 h-6 text-orange-500" />
                <span className="text-xl font-bold text-white">Puzzle2Profit</span>
              </div>
              <p className="text-gray-400">
                Build passive income with daily AI automation puzzles.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2">
                <li><a href="#how-it-works" className="text-gray-400 hover:text-white transition-colors">How It Works</a></li>
                <li><a href="#pricing" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Vault</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Refund Policy</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Connect</h4>
              <div className="flex gap-4">
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Twitter className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Linkedin className="w-6 h-6" />
                </a>
                <a href="#" className="text-gray-400 hover:text-orange-500 transition-colors">
                  <Youtube className="w-6 h-6" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center">
            <p className="text-gray-400">
              &copy; 2025 Puzzle2Profit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
