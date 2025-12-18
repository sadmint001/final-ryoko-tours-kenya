import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Calendar, 
  User, 
  Clock, 
  Eye, 
  Heart, 
  Share2, 
  Bookmark, 
  ChevronLeft,
  ChevronRight,
  Facebook,
  Twitter,
  Linkedin,
  Mail,
  MessageCircle,
  BookOpen,
  Tag,
  ChevronUp,
  Copy,
  Loader2,
  ArrowRight
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface BlogDetail {
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
  likes: number;
}

interface Comment {
  id: string;
  author_name: string;
  author_email?: string;
  content: string;
  created_at: string;
}

const BlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<BlogDetail | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogDetail[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [readingProgress, setReadingProgress] = useState(0);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState({
    author_name: '',
    author_email: '',
    content: ''
  });
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (slug) {
      fetchBlogDetail();
      fetchRelatedPosts();
      fetchComments();
    }
  }, [slug]);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollPosition = window.scrollY;
      const progress = (scrollPosition / totalHeight) * 100;
      setReadingProgress(Math.min(100, Math.max(0, progress)));
      setShowScrollTop(scrollPosition > 500);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchBlogDetail = async () => {
    try {
      setLoading(true);
      
      // First fetch the blog to get current views
      const { data: blogData, error: fetchError } = await supabase
        .from('blog_posts')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .eq('published', true)
        .single();

      if (fetchError) throw fetchError;
      
      if (!blogData) {
        navigate('/blog');
        return;
      }

      setBlog(blogData);
      
      // Then increment views
      await supabase
        .from('blog_posts')
        .update({ views: (blogData.views || 0) + 1 })
        .eq('id', blogData.id);
        
    } catch (error) {
      console.error('Error fetching blog:', error);
      setError('Failed to load blog post');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedPosts = async () => {
    if (!blog) return;

    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('published', true)
        .neq('id', blog.id)
        .limit(3)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRelatedPosts(data || []);
    } catch (error) {
      console.error('Error fetching related posts:', error);
    }
  };

  const fetchComments = async () => {
    if (!blog) return;

    try {
      const { data, error } = await supabase
        .from('blog_comments')
        .select('*')
        .eq('blog_id', blog.id)
        .eq('approved', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  const handleLike = async () => {
    if (!blog) return;
    
    try {
      const newLikedState = !liked;
      const increment = newLikedState ? 1 : -1;
      
      await supabase
        .from('blog_posts')
        .update({ likes: (blog.likes || 0) + increment })
        .eq('id', blog.id);
      
      setLiked(newLikedState);
      setBlog(prev => prev ? { ...prev, likes: (prev.likes || 0) + increment } : null);
      
      toast({
        title: newLikedState ? 'Liked!' : 'Like removed',
        description: newLikedState ? 'Thanks for your feedback!' : ''
      });
    } catch (error) {
      console.error('Error updating likes:', error);
    }
  };

  const handleShare = (platform: string) => {
    if (!blog) return;

    const url = window.location.href;
    const title = blog.title;
    const text = blog.excerpt;

    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&summary=${encodeURIComponent(text)}`,
      email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\nRead more: ${url}`)}`
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(url);
      toast({
        title: 'Link copied!',
        description: 'Blog link copied to clipboard'
      });
      return;
    }

    window.open(shareUrls[platform as keyof typeof shareUrls], '_blank', 'noopener,noreferrer');
  };

  const handleSave = () => {
    const newSavedState = !saved;
    setSaved(newSavedState);
    
    if (blog) {
      const savedBlogs = JSON.parse(localStorage.getItem('savedBlogs') || '[]');
      
      if (newSavedState) {
        savedBlogs.push({
          id: blog.id,
          title: blog.title,
          slug: blog.slug,
          savedAt: new Date().toISOString()
        });
      } else {
        const index = savedBlogs.findIndex((b: any) => b.id === blog.id);
        if (index > -1) savedBlogs.splice(index, 1);
      }
      
      localStorage.setItem('savedBlogs', JSON.stringify(savedBlogs));
      
      toast({
        title: newSavedState ? 'Saved!' : 'Removed',
        description: newSavedState 
          ? 'Blog saved to your reading list' 
          : 'Blog removed from reading list'
      });
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!blog) return;
    
    try {
      setSubmittingComment(true);
      
      const { error } = await supabase
        .from('blog_comments')
        .insert([{
          blog_id: blog.id,
          author_name: newComment.author_name,
          author_email: newComment.author_email,
          content: newComment.content,
          approved: false
        }]);

      if (error) throw error;
      
      toast({
        title: 'Comment submitted!',
        description: 'Your comment is pending approval. Thank you!'
      });
      
      setNewComment({ author_name: '', author_email: '', content: '' });
      setTimeout(() => fetchComments(), 2000);
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit comment',
        variant: 'destructive'
      });
    } finally {
      setSubmittingComment(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16">
          <div className="flex flex-col items-center justify-center h-64">
            <Loader2 className="animate-spin h-12 w-12 text-primary mb-4" />
            <p className="text-muted-foreground">Loading blog post...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-16 text-center">
          <h1 className="text-4xl font-bold mb-4">Blog Post Not Found</h1>
          <p className="text-muted-foreground mb-8">
            {error || 'The blog post you are looking for does not exist.'}
          </p>
          <Button asChild>
            <Link to="/blog">Back to Blog</Link>
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-16 left-0 right-0 z-40">
        <div 
          className="h-1 bg-primary transition-all duration-200"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          size="icon"
          className="fixed bottom-8 right-8 z-50 rounded-full shadow-lg"
          onClick={scrollToTop}
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      )}

      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Button
            variant="ghost"
            size="sm"
            className="mb-8"
            asChild
          >
            <Link to="/blog">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Back to Blog
            </Link>
          </Button>

          {/* Article Header */}
          <article>
            {/* Category & Featured Badge */}
            <div className="flex items-center gap-2 mb-4">
              <Badge variant="secondary">{blog.category}</Badge>
              {blog.featured && (
                <Badge className="bg-primary/10 text-primary border-primary/20">
                  Featured
                </Badge>
              )}
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
              {blog.title}
            </h1>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-4 mb-8 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{blog.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(blog.published_at), 'MMMM dd, yyyy')}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{blog.read_time}</span>
              </div>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                <span>{blog.views.toLocaleString()} views</span>
              </div>
              <div className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                <span>{blog.likes || 0} likes</span>
              </div>
            </div>

            {/* Excerpt */}
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              {blog.excerpt}
            </p>

            {/* Cover Image */}
            <div className="mb-8 rounded-xl overflow-hidden shadow-lg">
              <img
                src={blog.cover_image}
                alt={blog.title}
                className="w-full h-auto max-h-[500px] object-cover"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80';
                }}
              />
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 mb-8 p-4 bg-muted/30 rounded-lg">
              <Button
                variant={liked ? "default" : "outline"}
                size="sm"
                onClick={handleLike}
                className="flex items-center gap-2"
              >
                <Heart className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
                Like ({blog.likes || 0})
              </Button>
              
              <Button
                variant={saved ? "default" : "outline"}
                size="sm"
                onClick={handleSave}
                className="flex items-center gap-2"
              >
                <Bookmark className={`h-4 w-4 ${saved ? 'fill-current' : ''}`} />
                {saved ? 'Saved' : 'Save for later'}
              </Button>

              <div className="flex items-center gap-2 ml-auto">
                <span className="text-sm text-muted-foreground">Share:</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare('facebook')}
                >
                  <Facebook className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare('twitter')}
                >
                  <Twitter className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare('linkedin')}
                >
                  <Linkedin className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleShare('copy')}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Article Content */}
            <div 
              className="prose prose-lg dark:prose-invert max-w-none mb-12"
              dangerouslySetInnerHTML={{ 
                __html: blog.content || `<p>${blog.excerpt}</p>` 
              }}
            />

            {/* Tags */}
            {blog.tags && blog.tags.length > 0 && (
              <div className="mb-12">
                <div className="flex items-center gap-2 mb-4">
                  <Tag className="h-4 w-4" />
                  <h3 className="font-semibold">Tags</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {blog.tags.map((tag, index) => (
                    <Badge key={index} variant="outline">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            <Separator className="my-8" />

            {/* Author Bio */}
            <Card className="mb-12">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>
                      {blog.author.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{blog.author}</h3>
                    <p className="text-muted-foreground">
                      Expert writer specializing in {blog.category.toLowerCase()} topics. 
                      Passionate about sharing insights and experiences from Kenyan safaris.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Related Posts */}
            {relatedPosts.length > 0 && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold mb-6">Related Articles</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {relatedPosts.map((post) => (
                    <Link
                      key={post.id}
                      to={`/blog/${post.slug}`}
                      className="group block"
                    >
                      <Card className="h-full hover:shadow-md transition-shadow">
                        <div className="aspect-[4/3] overflow-hidden">
                          <img
                            src={post.cover_image}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {post.category}
                          </Badge>
                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                            {post.title}
                          </h3>
                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <span>{post.read_time}</span>
                            <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Comments Section */}
            <section id="comments" className="mb-12">
              <div className="flex items-center gap-2 mb-6">
                <MessageCircle className="h-5 w-5" />
                <h2 className="text-2xl font-bold">Comments ({comments.length})</h2>
              </div>

              {/* Comment Form */}
              <Card className="mb-8">
                <CardContent className="p-6">
                  <h3 className="font-semibold mb-4">Leave a Comment</h3>
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="author_name">Name *</Label>
                        <Input
                          id="author_name"
                          value={newComment.author_name}
                          onChange={(e) => setNewComment({...newComment, author_name: e.target.value})}
                          required
                          placeholder="Your name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author_email">Email</Label>
                        <Input
                          id="author_email"
                          type="email"
                          value={newComment.author_email}
                          onChange={(e) => setNewComment({...newComment, author_email: e.target.value})}
                          placeholder="Your email (optional)"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="comment">Comment *</Label>
                      <Textarea
                        id="comment"
                        value={newComment.content}
                        onChange={(e) => setNewComment({...newComment, content: e.target.value})}
                        required
                        placeholder="Share your thoughts..."
                        rows={4}
                      />
                    </div>
                    <Button type="submit" disabled={submittingComment}>
                      {submittingComment ? 'Submitting...' : 'Post Comment'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-l-2 border-muted pl-4">
                      <div className="bg-card p-4 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              {comment.author_name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium">{comment.author_name}</span>
                            <span className="text-xs text-muted-foreground ml-2">
                              {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                            </span>
                          </div>
                        </div>
                        <p className="text-foreground">{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No comments yet. Be the first to share your thoughts!</p>
                </div>
              )}
            </section>
          </article>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/blog">
                Back to All Articles
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BlogDetail;