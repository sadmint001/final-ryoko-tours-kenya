import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Calendar, User, ArrowRight, Search, Clock, Heart, Share2, Eye, Loader2 } from 'lucide-react';
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
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Safari Stories & Travel Tips
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Loading blog posts...
            </p>
          </div>
          <div className="flex items-center justify-center h-64">
            <Loader2 className="animate-spin h-8 w-8 text-primary" />
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-destructive mb-4">
              <p className="text-lg">{error}</p>
            </div>
            <Button onClick={fetchBlogPosts}>
              Try Again
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Safari Stories & Travel Tips
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Get inspired and informed with our latest articles about wildlife, culture, and adventure in Kenya
          </p>
        </div>

        {/* Search and Filter Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <Input
                placeholder="Search articles, topics, or tags..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12"
              />
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className="transition-all duration-200"
              >
                {category}
              </Button>
            ))}
          </div>
        </div>

        {/* Featured Posts Section */}
        {featuredPosts.length > 0 && selectedCategory === 'All' && searchTerm === '' && (
          <div className="mb-16">
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">Featured Stories</h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {featuredPosts.map((post) => (
                <Link 
                  key={post.id} 
                  to={`/blog/${post.slug || post.id}`}
                  className="group block"
                  onClick={() => incrementViews(post.id)}
                >
                  <Card className="hover:shadow-elegant transition-all duration-300 overflow-hidden h-full">
                    <div className="aspect-[16/9] overflow-hidden relative">
                      <img 
                        src={post.cover_image || '/placeholder-image.jpg'} 
                        alt={post.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder-image.jpg';
                        }}
                      />
                      <Badge className="absolute top-4 left-4 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    </div>
                    
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between mb-3">
                        <Badge variant="secondary" className="text-xs">
                          {post.category || 'Uncategorized'}
                        </Badge>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.read_time || '5 min read'}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {(post.views || 0).toLocaleString()} views
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl lg:text-2xl group-hover:text-primary transition-colors duration-200 leading-tight">
                        {post.title}
                      </CardTitle>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-muted-foreground mb-4 leading-relaxed">
                        {post.excerpt}
                      </p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : 'Not published'}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle like functionality
                            }}
                          >
                            <Heart className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Handle share functionality
                            }}
                          >
                            <Share2 className="w-4 h-4" />
                          </Button>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 text-primary" />
                        </div>
                      </div>

                      {post.tags && post.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {post.tags.map((tag, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Regular Posts Grid */}
        <div className="mb-12">
          {(selectedCategory !== 'All' || searchTerm !== '') && (
            <h3 className="text-2xl font-bold text-foreground mb-8 text-center">
              {filteredPosts.length} {filteredPosts.length === 1 ? 'Article' : 'Articles'} Found
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </h3>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {regularPosts.map((post) => (
              <Link 
                key={post.id} 
                to={`/blog/${post.slug || post.id}`}
                className="group block"
                onClick={() => incrementViews(post.id)}
              >
                <Card className="hover:shadow-elegant transition-all duration-300 overflow-hidden h-full">
                  <div className="aspect-[4/3] overflow-hidden">
                    <img 
                      src={post.cover_image || '/placeholder-image.jpg'} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.currentTarget.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="secondary" className="text-xs">
                        {post.category || 'Uncategorized'}
                      </Badge>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {post.read_time || '5 min read'}
                      </div>
                    </div>
                    <CardTitle className="text-lg group-hover:text-primary transition-colors duration-200 leading-tight">
                      {post.title}
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent>
                    <p className="text-muted-foreground mb-4 text-sm line-clamp-3 leading-relaxed">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1">
                          <User className="w-3 h-3" />
                          <span className="text-xs">{post.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          <span className="text-xs">{(post.views || 0).toLocaleString()}</span>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                    </div>

                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 2).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <div className="text-muted-foreground mb-4">
                <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg">No articles found</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('All');
                }}
                className="mt-4"
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Showing {filteredPosts.length} of {blogPosts.length} articles
          </p>
        </div>
      </div>
    </section>
  );
};

export default BlogSection;