import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Search, ExternalLink, Plus, Edit2, Trash2, CheckCircle, Circle, TrendingUp, Brain } from 'lucide-react';
import AffiliateContractAnalyzer from './AffiliateContractAnalyzer';

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
  const [editingAffiliateId, setEditingAffiliateId] = useState<string | null>(null);
  const [affiliateUrlInput, setAffiliateUrlInput] = useState('');
  const [activeTab, setActiveTab] = useState<'stacks' | 'analyzer'>('stacks');

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

  const startEditingAffiliate = (stack: any) => {
    setEditingAffiliateId(stack.id);
    setAffiliateUrlInput(stack.affiliate_url || '');
  };

  const saveAffiliateUrl = async (stackId: string) => {
    try {
      const updateData: any = {
        affiliate_url: affiliateUrlInput.trim(),
      };

      if (affiliateUrlInput.trim() && !techStacks.find(s => s.id === stackId)?.affiliate_url) {
        updateData.signup_date = new Date().toISOString().split('T')[0];
        updateData.signup_status = 'registered';
      }

      const { error } = await supabase
        .from('tech_stacks')
        .update(updateData)
        .eq('id', stackId);

      if (error) throw error;
      setEditingAffiliateId(null);
      setAffiliateUrlInput('');
      loadData();
    } catch (error: any) {
      alert('Error saving affiliate URL: ' + error.message);
    }
  };

  const updateSignupStatus = async (stackId: string, status: string) => {
    try {
      const { error } = await supabase
        .from('tech_stacks')
        .update({ signup_status: status })
        .eq('id', stackId);

      if (error) throw error;
      loadData();
    } catch (error: any) {
      alert('Error updating status: ' + error.message);
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

      {/* Tab Navigation */}
      <div className="flex gap-2 border-b border-gray-700">
        <button
          onClick={() => setActiveTab('stacks')}
          className={`px-6 py-3 font-semibold transition-colors ${
            activeTab === 'stacks'
              ? 'text-teal-400 border-b-2 border-teal-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          Tech Stacks
        </button>
        <button
          onClick={() => setActiveTab('analyzer')}
          className={`px-6 py-3 font-semibold transition-colors flex items-center gap-2 ${
            activeTab === 'analyzer'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-gray-300'
          }`}
        >
          <Brain className="w-4 h-4" />
          AI Contract Analyzer
        </button>
      </div>

      {/* Content based on active tab */}
      {activeTab === 'analyzer' ? (
        <AffiliateContractAnalyzer selectedTechStackId={selectedPath} />
      ) : (
        <>

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
                  Affiliate Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Commission
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
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
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
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-white font-semibold">{stack.name}</p>
                          {stack.auto_populated && (
                            <span className="bg-blue-900 bg-opacity-50 text-blue-300 text-xs px-2 py-0.5 rounded">
                              Auto
                            </span>
                          )}
                          {stack.week_number && (
                            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-0.5 rounded">
                              Week {stack.week_number}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 line-clamp-1">{stack.description}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={stack.signup_status || 'pending'}
                        onChange={(e) => updateSignupStatus(stack.id, e.target.value)}
                        className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer ${
                          stack.signup_status === 'active' ? 'bg-green-900 bg-opacity-50 text-green-300' :
                          stack.signup_status === 'registered' ? 'bg-yellow-900 bg-opacity-50 text-yellow-300' :
                          stack.signup_status === 'pending' ? 'bg-orange-900 bg-opacity-50 text-orange-300' :
                          'bg-gray-700 text-gray-400'
                        }`}
                      >
                        <option value="pending" className="bg-gray-800">⚠️ Needs Signup</option>
                        <option value="registered" className="bg-gray-800">⏳ Pending Approval</option>
                        <option value="active" className="bg-gray-800">✓ Active</option>
                        <option value="declined" className="bg-gray-800">✕ No Program</option>
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-green-400 text-sm font-semibold">
                        {stack.commission_rate || 'N/A'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          {stack.website_url && (
                            <a
                              href={stack.website_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 text-xs flex items-center gap-1"
                              title="Website"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Site
                            </a>
                          )}
                          {stack.affiliate_url && (
                            <a
                              href={stack.affiliate_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-green-400 hover:text-green-300 text-xs flex items-center gap-1"
                              title="Affiliate Link"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Affiliate
                            </a>
                          )}
                        </div>
                        {editingAffiliateId === stack.id ? (
                          <div className="flex gap-1">
                            <input
                              type="url"
                              value={affiliateUrlInput}
                              onChange={(e) => setAffiliateUrlInput(e.target.value)}
                              placeholder="Paste affiliate URL..."
                              className="flex-1 text-xs px-2 py-1 bg-gray-900 border border-teal-500 text-white rounded focus:outline-none"
                              autoFocus
                            />
                            <button
                              onClick={() => saveAffiliateUrl(stack.id)}
                              className="text-xs bg-teal-600 hover:bg-teal-700 text-white px-2 py-1 rounded"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingAffiliateId(null)}
                              className="text-xs bg-gray-600 hover:bg-gray-700 text-white px-2 py-1 rounded"
                            >
                              ✕
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => startEditingAffiliate(stack)}
                            className="text-xs text-teal-400 hover:text-teal-300"
                          >
                            {stack.affiliate_url ? '✏️ Edit Link' : '+ Add Affiliate Link'}
                          </button>
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
      </>
      )}
    </div>
  );
}
