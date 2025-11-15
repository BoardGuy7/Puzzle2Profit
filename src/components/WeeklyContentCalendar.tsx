import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Calendar, ChevronLeft, ChevronRight, Plus, Edit, Trash, Eye, Send } from 'lucide-react';

interface ContentPlan {
  id: string;
  path_id: string;
  week_start_date: string;
  day_number: number;
  category: string;
  blog_title: string;
  blog_outline: string;
  affiliate_slots: string[];
  status: 'draft' | 'scheduled' | 'published';
  scheduled_publish_date: string | null;
  published_date: string | null;
  blog_id: string | null;
}

interface Path {
  id: string;
  name: string;
  slug: string;
}

const DAYS = ['Build', 'Attract', 'Convert', 'Deliver', 'Support', 'Profit', 'Rest'];

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    Build: 'bg-blue-600',
    Attract: 'bg-teal-600',
    Convert: 'bg-orange-600',
    Deliver: 'bg-yellow-600',
    Support: 'bg-pink-600',
    Profit: 'bg-green-600',
    Rest: 'bg-gray-600',
  };
  return colors[category] || 'bg-gray-600';
};

export default function WeeklyContentCalendar() {
  const [paths, setPaths] = useState<Path[]>([]);
  const [selectedPath, setSelectedPath] = useState<string>('');
  const [currentWeekStart, setCurrentWeekStart] = useState<string>('');
  const [contentPlan, setContentPlan] = useState<ContentPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState<ContentPlan | null>(null);

  useEffect(() => {
    loadPaths();
    const today = new Date();
    const dayOfWeek = today.getDay();
    const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    setCurrentWeekStart(monday.toISOString().split('T')[0]);
  }, []);

  useEffect(() => {
    if (selectedPath && currentWeekStart) {
      loadContentPlan();
    }
  }, [selectedPath, currentWeekStart]);

  const loadPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('paths')
        .select('*')
        .order('slug');

      if (error) throw error;
      if (data && data.length > 0) {
        setPaths(data);
        setSelectedPath(data[0].id);
      }
    } catch (error: any) {
      console.error('Error loading paths:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadContentPlan = async () => {
    try {
      const { data, error } = await supabase
        .from('weekly_content_plan')
        .select('*')
        .eq('path_id', selectedPath)
        .eq('week_start_date', currentWeekStart)
        .order('day_number');

      if (error) throw error;
      setContentPlan(data || []);
    } catch (error: any) {
      console.error('Error loading content plan:', error.message);
    }
  };

  const changeWeek = (direction: number) => {
    const currentDate = new Date(currentWeekStart);
    currentDate.setDate(currentDate.getDate() + direction * 7);
    setCurrentWeekStart(currentDate.toISOString().split('T')[0]);
  };

  const getWeekRange = () => {
    const start = new Date(currentWeekStart);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);

    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  const currentPath = paths.find(p => p.id === selectedPath);

  if (loading) {
    return <div className="text-center py-8 text-gray-400">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-6 h-6 text-teal-500" />
            Weekly Content Calendar
          </h2>
          <p className="text-gray-400 mt-1">
            7-day content planning and scheduling
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Select Path
          </label>
          <select
            value={selectedPath}
            onChange={(e) => setSelectedPath(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2"
          >
            {paths.map((path) => (
              <option key={path.id} value={path.id}>
                {path.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-300 mb-2">
            Week Navigation
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => changeWeek(-1)}
              className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="flex-1 text-center text-white font-semibold py-2">
              {getWeekRange()}
            </div>
            <button
              onClick={() => changeWeek(1)}
              className="bg-gray-800 border border-gray-700 text-white p-2 rounded-lg hover:bg-gray-700"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
        {DAYS.map((day, index) => {
          const dayNumber = index + 1;
          const dayPlan = contentPlan.find(p => p.day_number === dayNumber);
          const dayDate = new Date(currentWeekStart);
          dayDate.setDate(dayDate.getDate() + index);

          return (
            <div
              key={day}
              className={`rounded-xl border-2 p-4 min-h-[200px] ${
                dayPlan
                  ? 'border-teal-700 bg-gray-800 bg-opacity-50'
                  : 'border-gray-700 bg-gray-900 bg-opacity-30 border-dashed'
              }`}
            >
              <div className="mb-3">
                <div className={`${getCategoryColor(day)} text-white text-xs font-bold px-2 py-1 rounded inline-block mb-1`}>
                  Day {dayNumber}
                </div>
                <h3 className="text-white font-bold text-sm">{day}</h3>
                <p className="text-xs text-gray-500">
                  {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </p>
              </div>

              {dayPlan ? (
                <div className="space-y-2">
                  <div>
                    <h4 className="text-white text-sm font-semibold line-clamp-2">
                      {dayPlan.blog_title || 'Untitled'}
                    </h4>
                    {dayPlan.affiliate_slots && dayPlan.affiliate_slots.length > 0 && (
                      <p className="text-xs text-teal-400 mt-1">
                        {dayPlan.affiliate_slots.length} affiliate slots
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    {dayPlan.status === 'published' && (
                      <span className="bg-green-900 bg-opacity-50 text-green-300 text-xs px-2 py-1 rounded">
                        Published
                      </span>
                    )}
                    {dayPlan.status === 'scheduled' && (
                      <span className="bg-blue-900 bg-opacity-50 text-blue-300 text-xs px-2 py-1 rounded">
                        Scheduled
                      </span>
                    )}
                    {dayPlan.status === 'draft' && (
                      <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded">
                        Draft
                      </span>
                    )}
                  </div>

                  <div className="flex gap-1 mt-2">
                    <button
                      onClick={() => setSelectedDay(dayPlan)}
                      className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs p-2 rounded flex items-center justify-center gap-1"
                      title="View Details"
                    >
                      <Eye className="w-3 h-3" />
                    </button>
                    <button
                      className="flex-1 bg-teal-700 hover:bg-teal-600 text-white text-xs p-2 rounded flex items-center justify-center gap-1"
                      title="Edit"
                    >
                      <Edit className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 text-xs py-4">
                  <Plus className="w-6 h-6 mx-auto mb-2 opacity-50" />
                  <p>No content planned</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {currentPath && contentPlan.length === 0 && (
        <div className="bg-gray-800 bg-opacity-50 border border-gray-700 rounded-xl p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-4" />
          <h3 className="text-white font-semibold mb-2">No Content Plan for This Week</h3>
          <p className="text-gray-400 mb-4">
            Generate a weekly content plan for {currentPath.name} to get started
          </p>
          <button className="bg-teal-600 hover:bg-teal-700 text-white px-6 py-2 rounded-lg">
            Generate Weekly Plan
          </button>
        </div>
      )}
    </div>
  );
}
