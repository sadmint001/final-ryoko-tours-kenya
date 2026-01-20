import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Search, Clock, Heart, Share2, Eye, Loader2, BookOpen } from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  content: string;
  cover_image: string;
  author: string;
  category: string;
  read_time: string;
  views: number;
  featured: boolean;
  published: boolean;
  tags: string[];
  published_at: string;
  created_at: string;
  slug: string;
}

const BlogSection = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const categories = ['All', 'Wildlife', 'Photography', 'Culture', 'Conservation', 'Adventure', 'Family Travel', 'Food & Culture', 'Accommodation'];

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogPosts(data || []);
      setError(null);
    } catch (error) {
      console.error('Error fetching blog posts:', error);
      setError('Failed to load blog posts. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const incrementViews = async (blogId: number) => {
    try {
      const { data: blog } = await supabase
        .from('blog_posts')
        .select('views')
        .eq('id', blogId)
        .single();

      if (blog) {
        await supabase
          .from('blog_posts')
          .update({ views: (blog.views || 0) + 1 })
          .eq('id', blogId);
      }
    } catch (error) {
      console.error('Error incrementing views:', error);
    }
  };

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags && post.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())));
    const matchesCategory = selectedCategory === 'All' || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);
  const regularPosts = filteredPosts.filter(post => !post.featured);

  if (loading) {
    return (
      <section className="py-20 bg-slate-50 dark:bg-slate-900 min-h-[500px] flex items-center justify-center">
        <Loader2 className="animate-spin h-10 w-10 text-amber-500" />
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 text-center">
          <div className="text-red-500 mb-4 text-lg">{error}</div>
          <Button onClick={fetchBlogPosts} variant="outline" className="border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950">
            Try Again
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section className="relative py-24 overflow-hidden bg-gradient-to-br from-slate-50 via-white to-amber-50/20 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 transition-colors duration-500">
      {/* Decorative Background - Light Mode */}
      <div className="absolute inset-0 overflow-hidden dark:hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-100/30 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-100/20 to-transparent rounded-full blur-3xl"></div>
      </div>

      {/* Decorative Background - Dark Mode */}
      <div className="absolute inset-0 overflow-hidden hidden dark:block pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-tl from-orange-500/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/20 dark:to-orange-500/20 border border-amber-500/20 dark:border-amber-500/30 mb-6">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span className="text-sm font-medium text-amber-700 dark:text-amber-300">Travel Journals</span>
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-slate-800 dark:text-white mb-4 font-serif">
            Featured
            <span className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 bg-clip-text text-transparent"> Stories</span>
          </h2>

          <p className="text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-12">
            Dive into captivating tales from the savanna, expert travel tips, and cultural insights.
          </p>

          {/* Search and Filter Section */}
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1 group">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-orange-500/20 rounded-xl blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 group-hover:text-amber-500 transition-colors" />
                  <Input
                    placeholder="Search articles, topics, or tags..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-14 rounded-xl border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-lg shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {categories.map((category) => (
                <Button
                  key={category}
                  variant={selectedCategory === category ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className={`
                    rounded-full px-6 transition-all duration-300
                    ${selectedCategory === category
                      ? 'bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg hover:shadow-xl hover:scale-105 border-transparent'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-amber-300 dark:hover:border-amber-700 hover:text-amber-600 dark:hover:text-amber-400'}
                  `}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
          <div className="mb-20">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
              {featuredPosts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.slug || post.id}`}
                  className="group block h-full"
                  onClick={() => incrementViews(post.id)}
                >
                  <article className="relative h-full overflow-hidden rounded-3xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 group">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity duration-300"></div>
                      <img
                        src={post.cover_image || '/placeholder-image.jpg'}
                        alt={post.title}
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <Badge className="absolute top-4 left-4 z-20 bg-amber-500 hover:bg-amber-600 text-white border-none shadow-lg px-3 py-1">
                        Featured
                      </Badge>
                      <Badge className="absolute top-4 right-4 z-20 bg-white/20 backdrop-blur-md text-white border-white/20 hover:bg-white/30 px-3 py-1">
                        {post.category || 'Uncategorized'}
                      </Badge>
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-4 text-xs font-medium text-amber-600 dark:text-amber-400 mb-4">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="w-4 h-4" />
                          <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Recent'}</span>
                        </div>
                        <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-4 h-4" />
                          <span>{post.read_time || '5 min read'}</span>
                        </div>
                      </div>

                      <h3 className="text-2xl lg:text-3xl font-bold text-slate-800 dark:text-white mb-4 leading-tight group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors duration-300 font-serif">
                        {post.title}
                      </h3>

                      <p className="text-slate-600 dark:text-slate-300 mb-6 leading-relaxed line-clamp-3">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center text-amber-700 dark:text-amber-300 font-bold border border-amber-200 dark:border-amber-800/30">
                            {post.author.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-slate-800 dark:text-white">{post.author}</div>
                            <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              {(post.views || 0).toLocaleString()} views
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-semibold group-hover:translate-x-2 transition-transform duration-300">
                          Read Strategy <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="mb-12">
          {(selectedCategory !== 'All' || searchTerm !== '') && (
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-8 text-center animate-fade-in">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'} Found
              {selectedCategory !== 'All' && <span className="text-amber-600 dark:text-amber-400"> in {selectedCategory}</span>}
            </h3>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug || post.id}`}
                className="group block h-full"
                onClick={() => incrementViews(post.id)}
              >
                <article className="h-full flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2 hover:border-amber-200 dark:hover:border-amber-800/50">
                  <div className="aspect-[4/3] overflow-hidden relative">
                    <img
                      src={post.cover_image || '/placeholder-image.jpg'}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm text-slate-800 dark:text-white hover:bg-white dark:hover:bg-slate-900">
                        {post.category || 'General'}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex flex-col flex-grow p-6">
                    <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 mb-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.read_time || '5 min'}
                      </div>
                      <div className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {(post.views || 0).toLocaleString()}
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3 line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                      {post.title}
                    </h3>

                    <p className="text-slate-600 dark:text-slate-300 text-sm mb-4 line-clamp-3 leading-relaxed flex-grow">
                      {post.excerpt}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-700 mt-auto">
                      <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                        <User className="w-3 h-3 text-amber-500" />
                        {post.author}
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-20 bg-white/50 dark:bg-slate-800/50 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
              <div className="text-slate-400 dark:text-slate-500 mb-4">
                <Search className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-xl font-medium text-slate-700 dark:text-slate-300">No stories found</p>
                <p className="text-sm">We couldn't find any articles matching your search.</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4 border-amber-500 text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/30"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <Button variant="ghost" className="text-slate-500 hover:text-amber-600 dark:text-slate-400 dark:hover:text-amber-400">
            View All Stories <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;
