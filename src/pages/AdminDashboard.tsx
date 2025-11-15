import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { BarChart3, FileText, TrendingUp, Mail, PlusCircle, Edit, Trash2, ExternalLink, Eye, MousePointerClick, Calendar, LogOut } from 'lucide-react';
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
                          <button
                            onClick={() => togglePublish(blog)}
                            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                              blog.published
                                ? 'bg-yellow-600 hover:bg-yellow-700 text-white'
                                : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                          >
                            {blog.published ? 'Unpublish' : 'Publish'}
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
                <h2 className="text-2xl font-bold text-white mb-6">AI Research Trends</h2>

                {trends.length === 0 ? (
                  <div className="text-center py-20 bg-gray-900 bg-opacity-50 rounded-xl border border-gray-800">
                    <TrendingUp className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400 text-xl">No trends collected yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {trends.map((trend) => (
                      <div
                        key={trend.id}
                        className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800"
                      >
                        <h3 className="text-xl font-bold text-teal-400 mb-3">{trend.topic}</h3>
                        <p className="text-gray-300 mb-4">{trend.summary}</p>

                        {trend.tools_mentioned.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-400 mb-2">Tools Mentioned:</p>
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

                        <p className="text-sm text-gray-400">
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
