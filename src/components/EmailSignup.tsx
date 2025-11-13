import { useState } from 'react';
import { Mail, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function EmailSignup() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: dbError } = await supabase
        .from('email_signups')
        .insert({ email, name: name || null })
        .select()
        .single();

      if (dbError) {
        if (dbError.code === '23505') {
          setError('This email is already registered!');
        } else {
          throw dbError;
        }
      } else {
        const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/brevo-signup`;
        await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            name: name || email.split('@')[0],
            listIds: [2, 4]
          })
        });

        setSuccess(true);
        setEmail('');
        setName('');
        setTimeout(() => setSuccess(false), 5000);
      }
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-2xl p-8 md:p-12 shadow-2xl">
      <div className="max-w-2xl mx-auto text-center">
        <Mail className="w-16 h-16 text-orange-500 mx-auto mb-6" />
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
          Get Your Free Daily AI Puzzle
        </h2>
        <p className="text-xl text-gray-300 mb-8">
          Join 1,000+ learners developing AI automation skills through accessible learning.
          <br />
          <span className="text-green-400 font-semibold">
            One puzzle per day. Zero fluff. Practical skill development.
          </span>
        </p>

        {success ? (
          <div className="bg-green-500 bg-opacity-20 border-2 border-green-500 rounded-lg p-6 flex items-center justify-center gap-3">
            <CheckCircle className="w-8 h-8 text-green-400" />
            <p className="text-xl text-white font-semibold">
              Success! Check your email for your first puzzle.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <input
                type="text"
                placeholder="Your Name (optional)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                aria-label="Your name"
                className="flex-1 px-6 py-4 rounded-lg text-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
              <input
                type="email"
                placeholder="Your Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                aria-label="Your email address"
                className="flex-1 px-6 py-4 rounded-lg text-lg border-2 border-gray-600 bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500 transition-colors"
              />
            </div>
            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading}
              aria-label="Sign up for free daily AI puzzles"
              className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-600 text-white text-xl font-bold px-12 py-4 rounded-lg transition-all transform hover:scale-105 shadow-lg disabled:transform-none"
            >
              {loading ? 'Signing Up...' : 'Start Learning FREE'}
            </button>
          </form>
        )}

        <p className="text-sm text-gray-400 mt-6">
          No spam. Unsubscribe anytime. Your data is safe with us.
        </p>
      </div>
    </div>
  );
}
