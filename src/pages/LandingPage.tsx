import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Puzzle, Twitter, Linkedin, Youtube } from 'lucide-react';
import PuzzleCarousel from '../components/PuzzleCarousel';
import EmailSignup from '../components/EmailSignup';
import Pricing from '../components/Pricing';
import BlogList from '../components/BlogList';

export default function LandingPage() {
  const signupRef = useRef<HTMLDivElement>(null);

  const scrollToSignup = () => {
    signupRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-black sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2" aria-label="Puzzle2Profit home">
            <Puzzle className="w-8 h-8 text-orange-500" />
            <span className="text-2xl font-bold text-white">Puzzle2Profit</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6" aria-label="Main navigation">
            <a href="#how-it-works" className="text-gray-300 hover:text-white transition-colors">
              How It Works
            </a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">
              Pricing
            </a>
            <Link
              to="/auth"
              className="bg-blue-900 hover:bg-blue-800 text-white px-6 py-2 rounded-lg transition-colors"
              aria-label="Sign in to your account"
            >
              Sign In
            </Link>
            <button
              onClick={scrollToSignup}
              className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
              aria-label="Start learning for free"
            >
              Start Learning Free
            </button>
          </nav>
        </div>
      </header>

      <section className="py-12 md:py-20 px-4">
        <div className="max-w-7xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            Welcome to <span className="text-teal-400">Puzzle2Profit</span>
            <br />
            <span className="text-orange-500">Daily AI Puzzles for Solopreneurs</span>
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto">
            Master the 7-day solopreneur cycle: <span className="text-blue-400">Build</span>, <span className="text-teal-400">Attract</span>, <span className="text-orange-400">Convert</span>, <span className="text-yellow-400">Deliver</span>, <span className="text-pink-400">Support</span>, <span className="text-green-400">Profit</span>, <span className="text-slate-400">Rest</span>
            <br />
            <span className="text-white font-semibold mt-4 block">Discover daily insights, AI tools, and strategies to build your solopreneur business through practical, hands-on learning.</span>
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="bg-teal-500 hover:bg-teal-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Sign In
            </Link>
            <button
              onClick={scrollToSignup}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
            >
              Start Learning Free
            </button>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-gradient-to-b from-black to-gray-900">
        <BlogList />
      </section>

      <section className="py-12 md:py-16 px-4 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">
            Featured Puzzles
          </h2>
          <PuzzleCarousel onSignupClick={scrollToSignup} />
        </div>
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
              <h3 className="text-2xl font-bold text-white mb-4">Receive Daily Puzzle</h3>
              <p className="text-gray-300 text-lg">
                Each morning, receive one educational AI automation challenge. Develop skills in scripting, data processing, workflow design, and practical tool integration through accessible learning.
              </p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <div className="bg-orange-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">2</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Apply AI Tools Hands-On</h3>
              <p className="text-gray-300 text-lg">
                Follow guided tutorials using industry-standard AI platforms. Master hands-on technical skills through practical exercises. Each puzzle takes 15-60 minutes of focused practice.
              </p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <div className="bg-green-500 w-16 h-16 rounded-full flex items-center justify-center mb-6">
                <span className="text-3xl font-bold text-white">3</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Master Professional Skills</h3>
              <p className="text-gray-300 text-lg">
                By Day 7, you'll have hands-on experience with automation tools and workflows. Apply these skills to potential freelance projects, skill-based opportunities, or business ventures over time.
              </p>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-xl p-8 max-w-3xl mx-auto">
              <p className="text-2xl md:text-3xl text-white font-bold mb-4">
                Join 1,000+ learners mastering AI automation skills
              </p>
              <p className="text-xl text-orange-400">
                Members develop practical experience with automation workflows through hands-on daily challenges and consistent practice
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
                "After completing the puzzles over several months, I gained AI skills that helped with freelance work. Results took consistent practice and effort, but the structured learning approach was valuable for my development."
              </p>
              <p className="text-white font-semibold">- Sarah K., Online Course Creator</p>
            </div>

            <div className="bg-blue-900 bg-opacity-50 rounded-xl p-8 border border-blue-800">
              <p className="text-gray-300 text-lg mb-4 italic">
                "Clear, actionable learning experience. The hands-on approach helped me master automation concepts I now apply to my projects. Building real proficiency took dedication and time to practice."
              </p>
              <p className="text-white font-semibold">- Michael T., SaaS Founder</p>
            </div>
          </div>

          <button
            onClick={scrollToSignup}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xl font-bold px-12 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            aria-label="Start learning AI automation skills"
          >
            Begin Mastering AI Automation
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
                Develop AI automation skills through daily educational puzzles and accessible learning.
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

          <div className="border-t border-gray-800 pt-8">
            <div className="bg-yellow-900 bg-opacity-30 border border-yellow-600 rounded-lg p-6 mb-6 max-w-4xl mx-auto">
              <h4 className="text-yellow-400 font-bold text-lg mb-3">Educational Disclaimer</h4>
              <p className="text-gray-300 text-sm leading-relaxed">
                This platform provides educational content only for skill development. No income guarantees or specific financial outcomes are made or implied. Individual results will vary significantly based on effort, skill level, market conditions, and numerous external factors beyond our control. The testimonials represent individual experiences after months of consistent practice and should not be considered typical or predictive of results. Any business venture or freelance work involves substantial risk and requires significant time investment. This content is not financial, legal, or professional advice. Always conduct your own research and consult with qualified professionals before making business or career decisions.
              </p>
            </div>

            <p className="text-gray-400 text-center">
              &copy; 2025 Puzzle2Profit. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
