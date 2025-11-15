import { Link } from 'react-router-dom';
import { Calendar, User } from 'lucide-react';
import { Blog } from '../lib/supabase';

interface BlogCardProps {
  blog: Blog;
}

export default function BlogCard({ blog }: BlogCardProps) {
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

  return (
    <article className="bg-gray-900 bg-opacity-50 rounded-xl p-6 border border-gray-800 hover:border-teal-500 transition-all transform hover:scale-105">
      <div className="flex items-center gap-2 mb-3">
        <span className={`${getCategoryColor(blog.category)} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
          {blog.category}
        </span>
      </div>

      <Link to={`/blog/${blog.id}`}>
        <h3 className="text-2xl font-bold text-white mb-3 hover:text-teal-400 transition-colors">
          {blog.title}
        </h3>
      </Link>

      <p className="text-gray-300 mb-4 line-clamp-3">
        {blog.excerpt}
      </p>

      <div className="flex items-center gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-1">
          <User className="w-4 h-4" />
          <span>{blog.author}</span>
        </div>
        {blog.published_date && (
          <div className="flex items-center gap-1">
            <Calendar className="w-4 h-4" />
            <span>{formatDate(blog.published_date)}</span>
          </div>
        )}
      </div>

      <Link
        to={`/blog/${blog.id}`}
        className="inline-block mt-4 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
      >
        Read more →
      </Link>
    </article>
  );
}
