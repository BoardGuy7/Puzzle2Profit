import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Lock, Unlock, Puzzle as PuzzleIcon, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Puzzle } from '../lib/supabase';

export default function Dashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [puzzles, setPuzzles] = useState<Puzzle[]>([]);
  const [filteredPuzzles, setFilteredPuzzles] = useState<Puzzle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedPuzzle, setSelectedPuzzle] = useState<Puzzle | null>(null);

  const isPaid = profile?.subscription_status === 'monthly' || profile?.subscription_status === 'annual';

  useEffect(() => {
    if (!user) {
      navigate('/auth');
      return;
    }

    fetchPuzzles();
  }, [user, navigate]);

  useEffect(() => {
    filterPuzzles();
  }, [searchTerm, categoryFilter, puzzles]);

  const fetchPuzzles = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('puzzles')
      .select('*')
      .order('day_number', { ascending: true });

    if (data) {
      setPuzzles(data);
      setFilteredPuzzles(data);
    }
    setLoading(false);
  };

  const filterPuzzles = () => {
    let filtered = puzzles;

    if (categoryFilter !== 'all') {
      filtered = filtered.filter(p => p.category === categoryFilter);
    }

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.theme.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredPuzzles(filtered);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Build: 'bg-blue-500',
      Attract: 'bg-purple-500',
      Convert: 'bg-orange-500',
      Deliver: 'bg-yellow-500',
      Support: 'bg-pink-500',
      Profit: 'bg-green-500',
      Rest: 'bg-indigo-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-blue-950 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <PuzzleIcon className="w-8 h-8 text-orange-500" />
              <span className="text-2xl font-bold text-white">Puzzle Vault</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-gray-300">{profile?.email}</p>
                <p className="text-xs text-orange-500 font-semibold">
                  {isPaid ? 'Premium Member' : 'Free Account'}
                </p>
              </div>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>

          {!isPaid && (
            <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-lg p-4 mb-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-orange-500" />
                  <p className="text-white font-semibold">
                    Upgrade to unlock full solutions and advanced guidance
                  </p>
                </div>
                <button
                  onClick={() => navigate('/checkout')}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                >
                  Upgrade Now
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search puzzles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="pl-10 pr-8 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-orange-500 appearance-none cursor-pointer min-w-[200px]"
              >
                <option value="all">All Categories</option>
                <option value="Build">Build</option>
                <option value="Attract">Attract</option>
                <option value="Convert">Convert</option>
                <option value="Deliver">Deliver</option>
                <option value="Support">Support</option>
                <option value="Profit">Profit</option>
                <option value="Rest">Rest</option>
              </select>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
            <p className="text-gray-400 mt-4">Loading puzzles...</p>
          </div>
        ) : filteredPuzzles.length === 0 ? (
          <div className="text-center py-20">
            <PuzzleIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-xl">No puzzles found</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPuzzles.map((puzzle) => (
              <div
                key={puzzle.id}
                onClick={() => setSelectedPuzzle(puzzle)}
                className="bg-blue-900 bg-opacity-50 rounded-xl p-6 border border-blue-800 hover:border-orange-500 transition-all cursor-pointer transform hover:scale-105"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="bg-orange-500 w-12 h-12 rounded-lg flex items-center justify-center">
                    <span className="text-2xl font-bold text-white">{puzzle.day_number}</span>
                  </div>
                  <span className={`${getCategoryColor(puzzle.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                    {puzzle.category}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2">{puzzle.title}</h3>
                <p className="text-orange-500 font-semibold mb-3">{puzzle.theme}</p>
                <p className="text-gray-300 mb-4">{puzzle.outcome}</p>

                <div className="space-y-2 mb-4">
                  <div className="flex items-start gap-2">
                    <PuzzleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-sm text-gray-300">{puzzle.bullet_1}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <PuzzleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-sm text-gray-300">{puzzle.bullet_2}</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <PuzzleIcon className="w-4 h-4 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-sm text-gray-300">{puzzle.bullet_3}</span>
                  </div>
                </div>

                <button className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2">
                  {isPaid ? (
                    <>
                      <Unlock className="w-4 h-4" />
                      View Solution
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      View Teaser
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        )}
      </main>

      {selectedPuzzle && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center p-4 z-50" onClick={() => setSelectedPuzzle(null)}>
          <div className="bg-blue-950 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-500 w-16 h-16 rounded-xl flex items-center justify-center">
                  <span className="text-3xl font-bold text-white">{selectedPuzzle.day_number}</span>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white">{selectedPuzzle.title}</h2>
                  <p className="text-orange-500 font-semibold">{selectedPuzzle.theme}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPuzzle(null)}
                className="text-gray-400 hover:text-white text-3xl"
              >
                &times;
              </button>
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-green-400 mb-2">Outcome</h3>
                <p className="text-white text-lg">{selectedPuzzle.outcome}</p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Key Points</h3>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <PuzzleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{selectedPuzzle.bullet_1}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <PuzzleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{selectedPuzzle.bullet_2}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <PuzzleIcon className="w-5 h-5 text-green-500 flex-shrink-0 mt-1" />
                    <span className="text-gray-300">{selectedPuzzle.bullet_3}</span>
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-bold text-white mb-3">Preview</h3>
                <div className="bg-gray-800 bg-opacity-50 rounded-lg p-6 border border-gray-700">
                  <p className="text-gray-300 whitespace-pre-wrap">{selectedPuzzle.teaser_text}</p>
                </div>
              </div>

              {isPaid ? (
                <>
                  <div>
                    <h3 className="text-xl font-bold text-green-400 mb-3 flex items-center gap-2">
                      <Unlock className="w-5 h-5" />
                      Full Solution
                    </h3>
                    <div className="bg-green-900 bg-opacity-20 rounded-lg p-6 border border-green-700">
                      <p className="text-white whitespace-pre-wrap">{selectedPuzzle.solution_text}</p>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-orange-400 mb-3 flex items-center gap-2">
                      <Unlock className="w-5 h-5" />
                      Advanced Guidance
                    </h3>
                    <div className="bg-orange-900 bg-opacity-20 rounded-lg p-6 border border-orange-700">
                      <p className="text-white whitespace-pre-wrap">{selectedPuzzle.advanced_guidance}</p>
                    </div>
                  </div>
                </>
              ) : (
                <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-lg p-8 text-center">
                  <Lock className="w-12 h-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="text-2xl font-bold text-white mb-2">Unlock Full Solution</h3>
                  <p className="text-gray-300 mb-6">
                    Upgrade to premium to access the complete step-by-step solution and advanced guidance.
                  </p>
                  <button
                    onClick={() => navigate('/checkout')}
                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-8 py-3 rounded-lg transition-colors"
                  >
                    Upgrade Now
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
