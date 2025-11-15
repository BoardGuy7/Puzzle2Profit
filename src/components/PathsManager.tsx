import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { ArrowLeftRight, Sparkles, RefreshCw, Plus, Edit2, Trash2 } from 'lucide-react';

interface Path {
  id: string;
  name: string;
  slug: string;
  description: string;
  tech_stack_focus: string;
  active: boolean;
  week_start_date: string;
}

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

export default function PathsManager() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [selectedPath, setSelectedPath] = useState<'a' | 'b'>('a');
  const [techStacks, setTechStacks] = useState<TechStack[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    loadPaths();
  }, []);

  useEffect(() => {
    if (paths.length > 0) {
      loadTechStacks();
    }
  }, [selectedPath, paths]);

  const loadPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('paths')
        .select('*')
        .order('slug');

      if (error) throw error;
      setPaths(data || []);
    } catch (error: any) {
      console.error('Error loading paths:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadTechStacks = async () => {
    try {
      const currentPath = paths.find(p => p.slug === selectedPath);
      if (!currentPath) return;

      const { data, error } = await supabase
        .from('tech_stacks')
        .select('*')
        .eq('path_id', currentPath.id)
        .order('priority_score', { ascending: false });

      if (error) throw error;
      setTechStacks(data || []);
    } catch (error: any) {
      console.error('Error loading tech stacks:', error.message);
    }
  };

  const generateWeeklyContent = async () => {
    setGenerating(true);
    try {
      const currentPath = paths.find(p => p.slug === selectedPath);
      if (!currentPath) return;

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        alert('Not authenticated');
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-weekly-content`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            path_id: currentPath.id,
            week_start_date: new Date().toISOString().split('T')[0],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to generate content');
      }

      alert('Weekly content plan generated successfully!');
      loadTechStacks();
    } catch (error: any) {
      alert('Error generating content: ' + error.message);
    } finally {
      setGenerating(false);
    }
  };

  const currentPath = paths.find(p => p.slug === selectedPath);
  const selectedStacks = techStacks.filter(t => t.selected_for_week);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="w-6 h-6 animate-spin text-teal-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <ArrowLeftRight className="w-6 h-6 text-teal-500" />
            A/B Paths Manager
          </h2>
          <p className="text-gray-400 mt-1">
            Manage dual tech stack approaches for weekly content generation
          </p>
        </div>
        <button
          onClick={generateWeeklyContent}
          disabled={generating}
          className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate This Week
            </>
          )}
        </button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {paths.map((path) => (
          <button
            key={path.id}
            onClick={() => setSelectedPath(path.slug as 'a' | 'b')}
            className={`p-6 rounded-xl border-2 text-left transition-all ${
              selectedPath === path.slug
                ? 'border-teal-500 bg-teal-900 bg-opacity-20'
                : 'border-gray-700 bg-gray-800 bg-opacity-50 hover:border-gray-600'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <h3 className="text-xl font-bold text-white">{path.name}</h3>
              {path.active && (
                <span className="bg-green-900 bg-opacity-50 text-green-300 text-xs font-semibold px-2 py-1 rounded">
                  Active
                </span>
              )}
            </div>
            <p className="text-sm text-gray-400 mb-3">{path.description}</p>
            <div className="flex items-center gap-2 text-xs text-teal-400">
              <Sparkles className="w-4 h-4" />
              <span className="font-semibold">{path.tech_stack_focus}</span>
            </div>
          </button>
        ))}
      </div>

      {currentPath && (
        <div className="bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">
              {currentPath.name} - Tech Stack Preview
            </h3>
            <span className="text-sm text-gray-400">
              {selectedStacks.length} selected for this week
            </span>
          </div>

          {selectedStacks.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {selectedStacks.map((stack) => (
                <div
                  key={stack.id}
                  className="bg-gray-900 bg-opacity-50 rounded-lg border border-teal-700 p-4"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-white font-semibold">{stack.name}</h4>
                    <span className="bg-teal-900 bg-opacity-50 text-teal-300 text-xs font-semibold px-2 py-1 rounded">
                      {stack.priority_score}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-2">{stack.category}</p>
                  {stack.commission_rate && (
                    <p className="text-xs text-green-400 font-semibold">
                      💰 {stack.commission_rate}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>No tech stacks selected for this week yet.</p>
              <p className="text-sm mt-2">
                Click "Generate This Week" to auto-select tools using AI
              </p>
            </div>
          )}

          {techStacks.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-700">
              <h4 className="text-sm font-semibold text-gray-400 mb-3">
                All Available Tools ({techStacks.length})
              </h4>
              <div className="flex flex-wrap gap-2">
                {techStacks.map((stack) => (
                  <span
                    key={stack.id}
                    className={`text-xs px-3 py-1 rounded-full ${
                      stack.selected_for_week
                        ? 'bg-teal-900 bg-opacity-50 text-teal-300 font-semibold'
                        : 'bg-gray-700 text-gray-300'
                    }`}
                  >
                    {stack.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
