import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, ExternalLink } from 'lucide-react';
import { supabase, Blog } from '../lib/supabase';

export default function BlogPost() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchBlog(id);
    }
  }, [id]);

  const fetchBlog = async (blogId: string) => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('id', blogId)
      .eq('published', true)
      .maybeSingle();

    if (data) {
      setBlog(data);
      await incrementViewCount(blogId);
    } else {
      navigate('/');
    }
    setLoading(false);
  };

  const incrementViewCount = async (blogId: string) => {
    const { data } = await supabase
      .from('blogs')
      .select('view_count')
      .eq('id', blogId)
      .maybeSingle();

    if (data) {
      await supabase
        .from('blogs')
        .update({ view_count: data.view_count + 1 })
        .eq('id', blogId);
    }
  };

  const trackAffiliateClick = async (url: string) => {
    const { data: { user } } = await supabase.auth.getUser();

    await supabase.from('affiliate_clicks').insert({
      blog_id: id,
      url: url,
      user_id: user?.id || null,
      user_agent: navigator.userAgent,
      referrer: document.referrer
    });
  };

  const handleAffiliateClick = (url: string) => {
    trackAffiliateClick(url);
    window.open(url, '_blank');
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <p className="text-gray-400 text-xl">Blog post not found</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      <header className="border-b border-gray-800 bg-gray-900 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Link>
        </div>
      </header>

      <article className="max-w-4xl mx-auto px-4 py-12">
        <div className="mb-6">
          <span className={`${getCategoryColor(blog.category)} text-white text-sm font-semibold px-4 py-2 rounded-full`}>
            {blog.category}
          </span>
        </div>

        <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {blog.title}
        </h1>

        <div className="flex items-center gap-6 text-gray-400 mb-8 pb-8 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5" />
            <span>{blog.author}</span>
          </div>
          {blog.published_date && (
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              <span>{formatDate(blog.published_date)}</span>
            </div>
          )}
          <div className="text-sm">
            {blog.view_count} views
          </div>
        </div>

        <div className="prose prose-invert prose-lg max-w-none mb-12">
          {(() => {
            if (!blog.content) {
              return <p className="text-gray-300">No content available.</p>;
            }

            let content = blog.content;

            // Remove markdown code blocks if present
            if (content.includes('```html')) {
              const htmlMatch = content.match(/```html\s*([\s\S]*?)```/);
              if (htmlMatch && htmlMatch[1]) {
                content = htmlMatch[1].trim();
              }
            }

            // Remove extra metadata after closing html tag
            const htmlEndIndex = content.indexOf('</html>');
            if (htmlEndIndex !== -1) {
              content = content.substring(0, htmlEndIndex + 7);
            }

            // Extract body content if it's a full HTML document
            const bodyMatch = content.match(/<body[^>]*>([\s\S]*?)<\/body>/);
            if (bodyMatch && bodyMatch[1]) {
              content = bodyMatch[1].trim();
            }

            // Check if content has HTML tags
            if (content.includes('<')) {
              return (
                <div
                  className="prose-headings:text-white prose-h1:text-3xl prose-h1:font-bold prose-h1:mb-4 prose-h1:mt-8
                             prose-h2:text-2xl prose-h2:font-bold prose-h2:mb-3 prose-h2:mt-6
                             prose-h3:text-xl prose-h3:font-semibold prose-h3:mb-2 prose-h3:mt-4
                             prose-p:text-gray-300 prose-p:mb-4 prose-p:leading-relaxed
                             prose-ul:list-disc prose-ul:ml-6 prose-ul:mb-4
                             prose-ol:list-decimal prose-ol:ml-6 prose-ol:mb-4
                             prose-li:text-gray-300 prose-li:mb-2
                             prose-strong:text-white prose-strong:font-semibold
                             prose-a:text-teal-400 prose-a:underline hover:prose-a:text-teal-300"
                  dangerouslySetInnerHTML={{ __html: content }}
                />
              );
            }

            // Handle plain text
            return (
              <div className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                {content.split('\n').map((paragraph, index) => {
                  const trimmed = paragraph.trim();
                  if (!trimmed) return <br key={index} />;

                  if (/^\d+\./.test(trimmed)) {
                    return (
                      <p key={index} className="mb-4 text-white font-semibold text-xl">
                        {trimmed}
                      </p>
                    );
                  }

                  if (trimmed.length < 100 && !trimmed.endsWith('.')) {
                    return (
                      <h2 key={index} className="text-2xl font-bold text-white mb-4 mt-6">
                        {trimmed}
                      </h2>
                    );
                  }

                  return (
                    <p key={index} className="mb-4 leading-relaxed">
                      {trimmed}
                    </p>
                  );
                })}
              </div>
            );
          })()}
        </div>

        {blog.affiliate_links && blog.affiliate_links.length > 0 && (
          <div className="bg-gradient-to-r from-teal-900 to-blue-900 bg-opacity-50 rounded-xl p-8 border border-teal-700 mb-8">
            <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <ExternalLink className="w-6 h-6 text-teal-400" />
              Recommended Tools & Resources
            </h2>
            <div className="space-y-4">
              {blog.affiliate_links.map((link, index) => (
                <button
                  key={index}
                  onClick={() => handleAffiliateClick(link.url)}
                  className="w-full bg-gray-800 hover:bg-gray-700 rounded-lg p-4 border border-gray-700 hover:border-teal-500 transition-all text-left group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <p className="text-white group-hover:text-teal-400 transition-colors">
                      {link.description}
                    </p>
                    <ExternalLink className="w-5 h-5 text-gray-400 group-hover:text-teal-400 transition-colors flex-shrink-0" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="bg-orange-500 bg-opacity-20 border-2 border-orange-500 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Ready to Master AI Automation?
          </h3>
          <p className="text-gray-300 mb-6">
            Get daily puzzles and hands-on challenges delivered to your inbox
          </p>
          <Link
            to="/#signup"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white text-lg font-bold px-8 py-3 rounded-lg transition-colors"
          >
            Start Learning Free
          </Link>
        </div>
      </article>
    </div>
  );
}
