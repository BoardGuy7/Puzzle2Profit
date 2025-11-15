import { useState, useEffect } from 'react';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase, Blog } from '../lib/supabase';
import BlogCard from './BlogCard';

const POSTS_PER_PAGE = 9;

export default function BlogList() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [filteredBlogs, setFilteredBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchBlogs();
  }, []);

  useEffect(() => {
    filterBlogs();
  }, [categoryFilter, blogs]);

  const fetchBlogs = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('blogs')
      .select('*')
      .eq('published', true)
      .order('published_date', { ascending: false });

    if (data) {
      setBlogs(data);
      setFilteredBlogs(data);
    }
    setLoading(false);
  };

  const filterBlogs = () => {
    if (categoryFilter === 'all') {
      setFilteredBlogs(blogs);
    } else {
      setFilteredBlogs(blogs.filter(blog => blog.category === categoryFilter));
    }
    setCurrentPage(1);
  };

  const totalPages = Math.ceil(filteredBlogs.length / POSTS_PER_PAGE);
  const startIndex = (currentPage - 1) * POSTS_PER_PAGE;
  const endIndex = startIndex + POSTS_PER_PAGE;
  const currentBlogs = filteredBlogs.slice(startIndex, endIndex);

  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="mb-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white">
            Latest Blog Posts
          </h2>
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="pl-10 pr-8 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white focus:outline-none focus:border-teal-500 appearance-none cursor-pointer min-w-[200px]"
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

      {loading ? (
        <div className="text-center py-20">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
          <p className="text-gray-400 mt-4">Loading blog posts...</p>
        </div>
      ) : filteredBlogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-400 text-xl">No blog posts found</p>
        </div>
      ) : (
        <>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentBlogs.map((blog) => (
              <BlogCard key={blog.id} blog={blog} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-teal-500 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => goToPage(page)}
                  className={`px-4 py-2 rounded-lg border transition-colors ${
                    currentPage === page
                      ? 'bg-teal-500 border-teal-500 text-white'
                      : 'bg-gray-800 border-gray-700 text-white hover:border-teal-500'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-gray-800 border border-gray-700 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:border-teal-500 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
