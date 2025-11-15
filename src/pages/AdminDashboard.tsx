import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, FileText, TrendingUp, Mail, PlusCircle, Edit, Trash2, ExternalLink, Eye, MousePointerClick, Calendar, LogOut, EyeOff, Lightbulb, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Blog, Trend, EmailCampaign } from '../lib/supabase';

export default function AdminDashboard() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'blogs' | 'metrics' | 'trends'>('blogs');
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [trends, setTrends] = useState<Trend[]>([]);
  const [campaigns, setCampaigns] = useState<EmailCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [researchLoading, setResearchLoading] = useState(false);
  const [researchTopic, setResearchTopic] = useState('');
  const [showResearchInput, setShowResearchInput] = useState(false);
  const [selectedResearchIds, setSelectedResearchIds] = useState<string[]>([]);
  const [stats, setStats] = useState({
    totalBlogs: 0,
    publishedBlogs: 0,
    totalViews: 0,
    totalClicks: 0
  });

  useEffect(() => {
    if (!user || !profile?.is_admin) {
      navigate('/dashboard');
      return;
    }
    fetchData();
  }, [user, profile, navigate]);

  const fetchData = async () => {
    setLoading(true);
    await Promise.all([
      fetchBlogs(),
      fetchTrends(),
      fetchCampaigns(),
      fetchStats()
    ]);
    setLoading(false);
  };

  const fetchBlogs = async () => {
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setBlogs(data);
  };

  const fetchTrends = async () => {
    const { data } = await supabase
      .from('trends')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);
    if (data) setTrends(data);
  };

  const fetchCampaigns = async () => {
    const { data } = await supabase
      .from('email_campaigns')
      .select('*')
      .order('sent_at', { ascending: false })
      .limit(10);
    if (data) setCampaigns(data);
  };

  const fetchStats = async () => {
    const { data: blogData } = await supabase
      .from('blogs')
      .select('id, published, view_count');

    const { data: clickData } = await supabase
      .from('affiliate_clicks')
      .select('id');

    if (blogData) {
      const totalViews = blogData.reduce((sum, blog) => sum + blog.view_count, 0);
      setStats({
        totalBlogs: blogData.length,
        publishedBlogs: blogData.filter(b => b.published).length,
        totalViews,
        totalClicks: clickData?.length || 0
      });
    }
  };

  const deleteBlog = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      await supabase.from('blogs').delete().eq('id', id);
      fetchBlogs();
      fetchStats();
    }
  };

  const togglePublish = async (blog: Blog) => {
    const updates: any = {
      published: !blog.published
    };

    if (!blog.published) {
      updates.published_date = new Date().toISOString();
    }

    await supabase.from('blogs').update(updates).eq('id', blog.id);
    fetchBlogs();
    fetchStats();
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const exportResearch = async (format: 'json' | 'markdown' | 'csv' | 'pdf') => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('Not authenticated');
      return;
    }

    let exportUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/export-research?format=${format}`;

    // Add selected IDs if any are selected
    if (selectedResearchIds.length > 0) {
      exportUrl += `&ids=${selectedResearchIds.join(',')}`;
    }

    // Fetch the data
    const response = await fetch(exportUrl, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      alert('Export failed: ' + errorText);
      return;
    }

    // For PDF, download HTML file that user can open and print
    if (format === 'pdf') {
      const html = await response.text();
      const blob = new Blob([html], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `research-export-${new Date().toISOString().split('T')[0]}.html`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      // Show instructions
      setTimeout(() => {
        alert('HTML file downloaded! To create a PDF:\n\n1. Open the downloaded HTML file in your browser\n2. Press Ctrl+P (Windows) or Cmd+P (Mac)\n3. Select "Save as PDF" as the destination\n4. Click Save\n\nYour research will be beautifully formatted and ready to print!');
      }, 500);
      return;
    }

    // For other formats, download as file
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `research-export.${format}`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const toggleResearchSelection = (id: string) => {
    setSelectedResearchIds(prev =>
      prev.includes(id)
        ? prev.filter(researchId => researchId !== id)
        : [...prev, id]
    );
  };

  const toggleAllResearch = () => {
    if (selectedResearchIds.length === trends.length) {
      setSelectedResearchIds([]);
    } else {
      setSelectedResearchIds(trends.map(t => t.id));
    }
  };

  const deleteResearch = async (id: string) => {
    if (!confirm('Are you sure you want to delete this research entry? This action cannot be undone.')) {
      return;
    }

    const { error } = await supabase
      .from('trends')
      .delete()
      .eq('id', id);

    if (error) {
      alert('Failed to delete research: ' + error.message);
    } else {
      setTrends(trends.filter(t => t.id !== id));
      setSelectedResearchIds(selectedResearchIds.filter(researchId => researchId !== id));
    }
  };

  const deleteSelectedResearch = async () => {
    if (selectedResearchIds.length === 0) {
      alert('No research entries selected');
      return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedResearchIds.length} research ${selectedResearchIds.length === 1 ? 'entry' : 'entries'}? This action cannot be undone.`)) {
      return;
    }

    const { error } = await supabase
      .from('trends')
      .delete()
      .in('id', selectedResearchIds);

    if (error) {
      alert('Failed to delete research: ' + error.message);
    } else {
      setTrends(trends.filter(t => !selectedResearchIds.includes(t.id)));
      setSelectedResearchIds([]);
    }
  };

  const runResearch = async (customTopic?: string) => {
    if (!customTopic && !researchTopic.trim()) {
      setShowResearchInput(true);
      return;
    }

    setResearchLoading(true);
    setShowResearchInput(false);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/research-agent`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          topic: customTopic || researchTopic
        }),
      });

      if (response.ok) {
        await fetchTrends();
        setResearchTopic('');
        alert('Research completed successfully!');
      } else {
        const error = await response.json();
        console.error('Research error:', error);
        if (error.details) {
          const missing = [];
          if (!error.details.hasGrokKey) missing.push('XAI_API_KEY');
          if (!error.details.hasSupabaseUrl) missing.push('SUPABASE_URL');
          if (!error.details.hasServiceKey) missing.push('SUPABASE_SERVICE_ROLE_KEY');
          alert(`Research failed: Missing environment variables in Supabase: ${missing.join(', ')}\n\nPlease configure these in your Supabase project settings under Edge Functions > Secrets.`);
        } else {
          alert(`Research failed: ${error.error}`);
        }
      }
    } catch (error: any) {
      alert(`Error: ${error.message}`);
    } finally {
      setResearchLoading(false);
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      Build: 'bg-blue-500',
      Attract: 'bg-teal-500',
      Convert: 'bg-orange-500',
      Deliver: 'bg-yellow-500',
      Support: 'bg-pink-500',
      Profit: 'bg-green-500',
      Rest: 'bg-slate-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-gradient-to-r from-teal-900 to-blue-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                <BarChart3 className="w-8 h-8 text-teal-400" />
                Admin Dashboard
              </h1>
              <p className="text-sm text-gray-300">{profile?.email}</p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                to="/dashboard"
                className="text-gray-300 hover:text-white transition-colors"
              >
                User Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <LogOut className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-900 bg-opacity-50 rounded-xl p-6 border border-blue-700">
            <div className="flex items-center justify-between mb-2">
              <FileText className="w-8 h-8 text-blue-400" />
              <span className="text-3xl font-bold text-white">{stats.totalBlogs}</span>
            </div>
            <p className="text-gray-300">Total Blogs</p>
          </div>

          <div className="bg-green-900 bg-opacity-50 rounded-xl p-6 border border-green-700">
            <div className="flex items-center justify-between mb-2">
              <ExternalLink className="w-8 h-8 text-green-400" />
              <span className="text-3xl font-bold text-white">{stats.publishedBlogs}</span>
            </div>
            <p className="text-gray-300">Published</p>
          </div>

          <div className="bg-purple-900 bg-opacity-50 rounded-xl p-6 border border-purple-700">
            <div className="flex items-center justify-between mb-2">
              <Eye className="w-8 h-8 text-purple-400" />
              <span className="text-3xl font-bold text-white">{stats.totalViews}</span>
            </div>
            <p className="text-gray-300">Total Views</p>
          </div>

          <div className="bg-orange-900 bg-opacity-50 rounded-xl p-6 border border-orange-700">
            <div className="flex items-center justify-between mb-2">
              <MousePointerClick className="w-8 h-8 text-orange-400" />
              <span className="text-3xl font-bold text-white">{stats.totalClicks}</span>
            </div>
            <p className="text-gray-300">Affiliate Clicks</p>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex gap-2 border-b border-gray-800">
            <button
              onClick={() => setActiveTab('blogs')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'blogs'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <FileText className="w-5 h-5 inline mr-2" />
              Blog Management
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'metrics'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <BarChart3 className="w-5 h-5 inline mr-2" />
              Email Metrics
            </button>
            <button
              onClick={() => setActiveTab('trends')}
              className={`px-6 py-3 font-semibold transition-colors ${
                activeTab === 'trends'
                  ? 'text-teal-400 border-b-2 border-teal-400'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-5 h-5 inline mr-2" />
              AI Trends
            </button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          </div>
        ) : (
          <>
            {activeTab === 'blogs' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold text-white">Manage Blog Posts</h2>
                  <Link
                    to="/admin/blog/new"
                    className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                  >
                    <PlusCircle className="w-5 h-5" />
                    New Blog Post
                  </Link>
                </div>

                <div className="space-y-4">
                  {blogs.map((blog) => (
                    <div
                      key={blog.id}
                      className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 hover:border-teal-500 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`${getCategoryColor(blog.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
                              {blog.category}
                            </span>
                            {blog.published ? (
                              <span className="bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                Published
                              </span>
                            ) : (
                              <span className="bg-gray-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                                Draft
                              </span>
                            )}
                          </div>
                          <h3 className="text-xl font-bold text-white mb-2">{blog.title}</h3>
                          <p className="text-gray-300 mb-3">{blog.excerpt}</p>
                          <div className="flex items-center gap-4 text-sm text-gray-400">
                            <span className="flex items-center gap-1">
                              <Eye className="w-4 h-4" />
                              {blog.view_count} views
                            </span>
                            {blog.published_date && (
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(blog.published_date).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <Link
                            to={`/blog/${blog.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                            Preview
                          </Link>
                          <button
                            onClick={() => togglePublish(blog)}
                            className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors ${
                              blog.published
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {blog.published ? (
                              <>
                                <EyeOff className="w-4 h-4" />
                                Unpublish
                              </>
                            ) : (
                              <>
                                <ExternalLink className="w-4 h-4" />
                                Publish
                              </>
                            )}
                          </button>
                          <Link
                            to={`/admin/blog/edit/${blog.id}`}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                            Edit
                          </Link>
                          <button
                            onClick={() => deleteBlog(blog.id)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'metrics' && (
              <div>
                <h2 className="text-2xl font-bold text-white mb-6">Email Campaign Metrics</h2>

                {campaigns.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800">
                    <Mail className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">No email campaigns yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div
                        key={campaign.id}
                        className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800"
                      >
                        <h3 className="text-xl font-bold text-white mb-4">{campaign.subject}</h3>
                        <div className="grid md:grid-cols-4 gap-4">
                          <div className="bg-blue-900 bg-opacity-30 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Sent Count</p>
                            <p className="text-2xl font-bold text-white">{campaign.sent_count}</p>
                          </div>
                          <div className="bg-green-900 bg-opacity-30 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Open Rate</p>
                            <p className="text-2xl font-bold text-green-400">{campaign.open_rate}%</p>
                          </div>
                          <div className="bg-purple-900 bg-opacity-30 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Click Rate</p>
                            <p className="text-2xl font-bold text-purple-400">{campaign.click_rate}%</p>
                          </div>
                          <div className="bg-red-900 bg-opacity-30 rounded-lg p-4">
                            <p className="text-sm text-gray-400 mb-1">Bounce Rate</p>
                            <p className="text-2xl font-bold text-red-400">{campaign.bounce_rate}%</p>
                          </div>
                        </div>
                        <p className="text-sm text-gray-400 mt-4">
                          Sent: {new Date(campaign.sent_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'trends' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <div className="flex items-center gap-4">
                    <h2 className="text-2xl font-bold text-white">AI Research Trends</h2>
                    {trends.length > 0 && (
                      <button
                        onClick={toggleAllResearch}
                        className="text-sm text-teal-400 hover:text-teal-300 transition-colors"
                      >
                        {selectedResearchIds.length === trends.length ? 'Deselect All' : 'Select All'}
                      </button>
                    )}
                    {selectedResearchIds.length > 0 && (
                      <span className="text-sm text-gray-400">
                        {selectedResearchIds.length} selected
                      </span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    {selectedResearchIds.length > 0 && (
                      <button
                        onClick={deleteSelectedResearch}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                        Delete ({selectedResearchIds.length})
                      </button>
                    )}
                    <div className="relative group">
                      <button
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                      >
                        <Download className="w-5 h-5" />
                        Export {selectedResearchIds.length > 0 ? `(${selectedResearchIds.length})` : 'All'}
                      </button>
                      <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                        <button
                          onClick={() => exportResearch('json')}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-t-lg transition-colors"
                        >
                          Export as JSON
                        </button>
                        <button
                          onClick={() => exportResearch('markdown')}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          Export as Markdown
                        </button>
                        <button
                          onClick={() => exportResearch('pdf')}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 transition-colors"
                        >
                          Export as PDF
                        </button>
                        <button
                          onClick={() => exportResearch('csv')}
                          className="w-full text-left px-4 py-2 text-white hover:bg-gray-700 rounded-b-lg transition-colors"
                        >
                          Export as CSV
                        </button>
                      </div>
                    </div>
                    <button
                      onClick={() => runResearch()}
                      disabled={researchLoading}
                      className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                    >
                      <TrendingUp className="w-5 h-5" />
                      {researchLoading ? 'Running...' : 'Run Research'}
                    </button>
                  </div>
                </div>

                {showResearchInput && (
                  <div className="mb-6 bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-teal-500">
                    <label className="block text-sm font-semibold text-gray-300 mb-2">
                      What topic would you like researched?
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={researchTopic}
                        onChange={(e) => setResearchTopic(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && runResearch()}
                        placeholder="e.g., AI automation for email marketing"
                        className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-teal-500"
                        autoFocus
                      />
                      <button
                        onClick={() => runResearch()}
                        disabled={!researchTopic.trim()}
                        className="bg-teal-500 hover:bg-teal-600 disabled:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
                      >
                        Research
                      </button>
                      <button
                        onClick={() => setShowResearchInput(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {trends.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">No trends collected yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {trends.map((trend) => (
                      <div
                        key={trend.id}
                        className={`bg-gray-900 bg-opacity-50 rounded-xl p-6 border transition-all ${
                          selectedResearchIds.includes(trend.id)
                            ? 'border-teal-500 bg-teal-900 bg-opacity-10'
                            : 'border-gray-800'
                        }`}
                      >
                        <div className="flex items-start gap-4 mb-3">
                          <input
                            type="checkbox"
                            checked={selectedResearchIds.includes(trend.id)}
                            onChange={() => toggleResearchSelection(trend.id)}
                            className="mt-1 w-5 h-5 rounded border-gray-600 bg-gray-800 text-teal-500 focus:ring-teal-500 focus:ring-offset-gray-900 cursor-pointer"
                          />
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-teal-400">{trend.topic}</h3>
                          </div>
                          <button
                            onClick={() => deleteResearch(trend.id)}
                            className="text-gray-400 hover:text-red-500 transition-colors p-2 hover:bg-red-900 hover:bg-opacity-20 rounded-lg"
                            title="Delete this research"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-gray-300 mb-4 ml-9">{trend.summary}</p>

                        {trend.tools_detailed && trend.tools_detailed.length > 0 ? (
                          <div className="mb-4 ml-9">
                            <p className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                              <span>🛠️ Tools & Affiliate Programs ({trend.tools_detailed.length})</span>
                            </p>
                            <div className="space-y-3">
                              {trend.tools_detailed.map((tool, index) => (
                                <div
                                  key={index}
                                  className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700"
                                >
                                  <div className="flex items-start justify-between gap-3 mb-2">
                                    <h5 className="text-blue-400 font-bold text-sm">{tool.name}</h5>
                                    {tool.affiliate_program && tool.affiliate_program.toLowerCase().includes('yes') && (
                                      <span className="bg-green-900 bg-opacity-50 text-green-300 text-xs font-semibold px-2 py-1 rounded shrink-0">
                                        ✓ Affiliate
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-gray-400 text-xs mb-2">{tool.description}</p>
                                  <div className="flex flex-wrap gap-3 text-xs mb-2">
                                    <a
                                      href={tool.website}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="text-blue-400 hover:text-blue-300 hover:underline flex items-center gap-1"
                                    >
                                      <ExternalLink className="w-3 h-3" />
                                      {tool.website}
                                    </a>
                                    <span className="text-gray-500">•</span>
                                    <span className="text-gray-400">{tool.pricing}</span>
                                  </div>
                                  {tool.affiliate_program && (
                                    <p className="text-xs text-gray-500 mb-2">
                                      <strong>Affiliate:</strong> {tool.affiliate_program}
                                    </p>
                                  )}
                                  {tool.key_features && tool.key_features.length > 0 && (
                                    <div className="mt-2 pt-2 border-t border-gray-700">
                                      <p className="text-xs text-gray-400 mb-1">Key Features:</p>
                                      <ul className="list-disc list-inside text-xs text-gray-500 space-y-1">
                                        {tool.key_features.map((feature, idx) => (
                                          <li key={idx}>{feature}</li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : trend.tools_mentioned.length > 0 && (
                          <div className="mb-4 ml-9">
                            <p className="text-sm font-semibold text-gray-300 mb-2">Tools Mentioned:</p>
                            <div className="flex flex-wrap gap-2">
                              {trend.tools_mentioned.map((tool, index) => (
                                <span
                                  key={index}
                                  className="bg-blue-900 bg-opacity-50 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full"
                                >
                                  {tool}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {trend.key_insights && trend.key_insights.length > 0 && (
                          <div className="mb-4 ml-9 bg-yellow-900 bg-opacity-20 border border-yellow-700 rounded-lg p-4">
                            <p className="text-sm font-semibold text-yellow-400 mb-2 flex items-center gap-2">
                              <Lightbulb className="w-4 h-4" />
                              Key Actionable Insights
                            </p>
                            <ul className="list-disc list-inside text-sm text-gray-300 space-y-1">
                              {trend.key_insights.map((insight, index) => (
                                <li key={index}>{insight}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {trend.blog_ideas && trend.blog_ideas.length > 0 && (
                          <div className="mt-6 ml-9 border-t border-gray-700 pt-6">
                            <h4 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                              <Lightbulb className="w-5 h-5 text-yellow-400" />
                              Blog Ideas ({trend.blog_ideas.length})
                            </h4>
                            <div className="grid gap-3">
                              {trend.blog_ideas.map((idea: any, index: number) => (
                                <div
                                  key={index}
                                  className="bg-gray-800 bg-opacity-50 rounded-lg p-4 border border-gray-700 hover:border-teal-500 transition-all"
                                >
                                  <div className="flex items-start gap-3">
                                    <span className={`${getCategoryColor(idea.day)} text-white text-xs font-semibold px-2 py-1 rounded shrink-0`}>
                                      {idea.day}
                                    </span>
                                    <div className="flex-1">
                                      <h5 className="text-white font-semibold mb-1">{idea.title}</h5>
                                      <p className="text-sm text-gray-400">{idea.description}</p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <p className="text-sm text-gray-400 mt-4 ml-9">
                          Collected: {new Date(trend.created_at).toLocaleString()}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
