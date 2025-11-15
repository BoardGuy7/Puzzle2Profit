import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ExternalLink, Plus, Edit2, Trash2, CheckCircle, Circle, TrendingUp } from 'lucide-react';

interface TechStack {
  id: string;
  path_id: string;
  name: string;
  category: string;
  description: string;
  website_url: string;
  affiliate_url: string;
  commission_rate: string;
  pricing_model: string;
  key_features: string[];
  selected_for_week: boolean;
  priority_score: number;
}

interface Path {
  id: string;
  name: string;
  slug: string;
}

export default function TechStackSelector() {
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [paths, setPaths] = useState<Path[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingStack, setEditingStack] = useState<TechStack | null>(null);

  useEffect(() => {
    loadData();
  }, [selectedPath]);

  const loadData = async () => {
    try {
      const [pathsRes, stacksRes] = await Promise.all([
        supabase.from('paths').select('*').order('slug'),
        supabase
          .from('tech_stacks')
          .select('*')
          .order('priority_score', { ascending: false }),
      ]);

      if (pathsRes.data) {
        setPaths(pathsRes.data);
        if (!selectedPath && pathsRes.data.length > 0) {
          setSelectedPath(pathsRes.data[0].id);
        }
      }

      if (stacksRes.data) {
        setTechStacks(stacksRes.data);
      }
    } catch (error: any) {
      console.error('Error loading data:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelection = async (stack: TechStack) => {
    try {
      const { error } = await supabase
        .from('tech_stacks')
        .update({ selected_for_week: !stack.selected_for_week })
        .eq('id', stack.id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error updating selection: ' + error.message);
    }
  };

  const deleteStack = async (id: string) => {
    if (!confirm('Are you sure you want to delete this tech stack?')) return;

    try {
      const { error } = await supabase
        .from('tech_stacks')
        .delete()
        .eq('id', id);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error deleting stack: ' + error.message);
    }
  };

  const filteredStacks = techStacks.filter((stack) => {
    const matchesSearch = !searchTerm ||
      stack.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack.category?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stack.description?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesPath = !selectedPath || stack.path_id === selectedPath;

    return matchesSearch && matchesPath;
  });

  const selectedStacks = filteredStacks.filter(s => s.selected_for_week);
  const currentPath = paths.find(p => p.id === selectedPath);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-teal-500" />
            Affiliate & Tech Stack Selector
          </h2>
          <p className="text-gray-400 mt-1">
            Manage and select high-commission AI/solopreneur tools for content
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Add Tool
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="md:col-span-1">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Filter by Path
          </label>
          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
          >
            <option value="">All Paths</option>
            {paths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Search Tools
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by name, category, or description..."
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg pl-10 pr-4 py-2"
            />
          </div>
        </div>
      </div>

      {selectedStacks.length > 0 && (
        <div className="bg-teal-900 bg-opacity-20 border border-teal-700 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-teal-400 mb-2">
            Selected for This Week ({selectedStacks.length})
          </h3>
          <div className="flex flex-wrap gap-2">
            {selectedStacks.map((stack) => (
              <span
                key={stack.id}
                className="bg-teal-900 bg-opacity-50 text-teal-300 text-xs font-semibold px-3 py-1 rounded-full"
              >
                {stack.name}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-900 bg-opacity-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Selected
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tool Name
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Commission
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Priority
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Links
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredStacks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-400">
                    No tech stacks found. Add some tools to get started!
                  </td>
                </tr>
              ) : (
                filteredStacks.map((stack) => (
                  <tr key={stack.id} className="hover:bg-gray-700 hover:bg-opacity-30 transition-colors">
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleSelection(stack)}
                        className="text-teal-500 hover:text-teal-400"
                      >
                        {stack.selected_for_week ? (
                          <CheckCircle className="w-5 h-5" />
                        ) : (
                          <Circle className="w-5 h-5" />
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-white font-semibold">{stack.name}</p>
                        <p className="text-xs text-gray-400 line-clamp-1">{stack.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                        {stack.category || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 text-sm font-semibold">
                        {stack.commission_rate || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-teal-400 font-semibold">{stack.priority_score}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {stack.website_url && (
                          <a
                            href={stack.website_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-400 hover:text-blue-300"
                            title="Website"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        {stack.affiliate_url && (
                          <a
                            href={stack.affiliate_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-green-400 hover:text-green-300"
                            title="Affiliate Link"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setEditingStack(stack)}
                          className="text-gray-400 hover:text-white"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => deleteStack(stack.id)}
                          className="text-red-400 hover:text-red-300"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
