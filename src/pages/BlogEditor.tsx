import { useEffect, useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ArrowLeft, Save, Sparkles, PlusCircle, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Blog, AffiliateLink } from '../lib/supabase';

export default function BlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, loading: authLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [category, setCategory] = useState<string>('Build');
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkDescription, setNewLinkDescription] = useState('');

  useEffect(() => {
    if (authLoading) return;

    if (!user || !profile?.is_admin) {
      navigate('/dashboard');
      return;
    }

    if (id && id !== 'new') {
      fetchBlog(id);
    }
  }, [id, user, profile, authLoading, navigate]);

  const fetchBlog = async (blogId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .maybeSingle();

    if (data) {
      setTitle(data.title);
      setContent(data.content);
      setExcerpt(data.excerpt);
      setCategory(data.category);
      setAffiliateLinks(data.affiliate_links || []);
    }
    setLoading(false);
  };

  const generateContent = async () => {
    if (!category) {
      alert('Please select a category first');
      return;
    }

    setGenerating(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/grok-copywriter`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            category,
            topic: title || 'solopreneur business strategies',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        setContent(data.content || '');
        setExcerpt(data.excerpt || '');
        if (data.affiliate_suggestions) {
          setAffiliateLinks(data.affiliate_suggestions);
        }
      } else {
        alert('Failed to generate content. Please check your Grok API configuration.');
      }
    } catch (error) {
      console.error('Error generating content:', error);
      alert('Error generating content');
    }
    setGenerating(false);
  };

  const addAffiliateLink = () => {
    if (!newLinkUrl || !newLinkDescription) {
      alert('Please enter both URL and description');
      return;
    }

    setAffiliateLinks([
      ...affiliateLinks,
      {
        url: newLinkUrl,
        description: newLinkDescription,
        utm_params: {
          utm_source: 'puzzle2profit',
          utm_medium: 'blog',
          utm_campaign: category.toLowerCase()
        }
      }
    ]);
    setNewLinkUrl('');
    setNewLinkDescription('');
  };

  const removeAffiliateLink = (index: number) => {
    setAffiliateLinks(affiliateLinks.filter((_, i) => i !== index));
  };

  const saveBlog = async (publish: boolean = false) => {
    if (!title || !content || !excerpt) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);

    const blogData: any = {
      title,
      content,
      excerpt,
      category,
      affiliate_links: affiliateLinks,
      published: publish,
      updated_at: new Date().toISOString()
    };

    if (publish && !id) {
      blogData.published_date = new Date().toISOString();
    }

    try {
      if (id && id !== 'new') {
        if (publish) {
          blogData.published_date = new Date().toISOString();
        }
        await supabase.from('blogs').update(blogData).eq('id', id);
        alert('Blog updated successfully!');
      } else {
        const { data } = await supabase.from('blogs').insert(blogData).select().single();
        alert('Blog created successfully!');
        if (data) {
          navigate(`/admin/blog/edit/${data.id}`);
        }
      }
    } catch (error) {
      console.error('Error saving blog:', error);
      alert('Error saving blog');
    }

    setLoading(false);
  };

  if (authLoading || (loading && id && id !== 'new')) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/admin"
              className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Admin
            </Link>
            <div className="flex gap-2">
              <button
                onClick={() => saveBlog(false)}
                disabled={loading}
                className="bg-gray-700 hover:bg-gray-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Save Draft
              </button>
              <button
                onClick={() => saveBlog(true)}
                disabled={loading}
                className="bg-teal-500 hover:bg-teal-600 text-white px-6 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Save className="w-5 h-5" />
                Publish
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-white mb-8">
          {id && id !== 'new' ? 'Edit Blog Post' : 'Create New Blog Post'}
        </h1>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter blog title..."
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-teal-500"
            >
              <option value="Build">Build</option>
              <option value="Attract">Attract</option>
              <option value="Convert">Convert</option>
              <option value="Deliver">Deliver</option>
              <option value="Support">Support</option>
              <option value="Profit">Profit</option>
              <option value="Rest">Rest</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Excerpt
            </label>
            <textarea
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              placeholder="Short preview text for blog listing..."
              rows={3}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-300">
                Content
              </label>
              <button
                onClick={generateContent}
                disabled={generating}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors disabled:opacity-50"
              >
                <Sparkles className="w-5 h-5" />
                {generating ? 'Generating...' : 'Generate with AI'}
              </button>
            </div>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write your blog content here (HTML/Markdown supported)..."
              rows={20}
              className="w-full px-4 py-3 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500 font-mono text-sm"
            />
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Affiliate Links</h3>

            <div className="space-y-4 mb-4">
              {affiliateLinks.map((link, index) => (
                <div
                  key={index}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 flex items-start justify-between"
                >
                  <div className="flex-1">
                    <p className="text-white font-semibold mb-1">{link.description}</p>
                    <p className="text-gray-400 text-sm break-all">{link.url}</p>
                  </div>
                  <button
                    onClick={() => removeAffiliateLink(index)}
                    className="text-red-400 hover:text-red-300 ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-lg p-4 border border-gray-700">
              <h4 className="text-white font-semibold mb-3">Add New Link</h4>
              <div className="space-y-3">
                <input
                  type="url"
                  value={newLinkUrl}
                  onChange={(e) => setNewLinkUrl(e.target.value)}
                  placeholder="Affiliate URL..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                />
                <input
                  type="text"
                  value={newLinkDescription}
                  onChange={(e) => setNewLinkDescription(e.target.value)}
                  placeholder="Link description..."
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white placeholder-gray-400 focus:outline-none focus:border-teal-500"
                />
                <button
                  onClick={addAffiliateLink}
                  className="bg-teal-500 hover:bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-colors"
                >
                  <PlusCircle className="w-5 h-5" />
                  Add Link
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
