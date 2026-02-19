import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Edit, Trash2, Eye, EyeOff, Image as ImageIcon, Upload, X, Loader2, Save, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { Tables } from '@/integrations/supabase/types';
import { Link } from 'react-router-dom';

type Blog = Tables<'blog_posts'>;

const generateSlug = (title: string) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
};

const BlogManagement = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState<Blog | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [blogToDelete, setBlogToDelete] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const categories = ['Wildlife', 'Photography', 'Culture', 'Conservation', 'Adventure', 'Family Travel', 'Food & Culture', 'Accommodation'];

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    content: '',
    cover_image: '',
    author: '',
    category: '',
    read_time: '',
    featured: false,
    published: true,
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    fetchBlogs();

    // Real-time listener for blog updates (live views)
    const channel = supabase
      .channel('blog-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'blog_posts' },
        () => {
          fetchBlogs();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBlogs(data || []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (file: File): Promise<string> => {
    setUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);

    try {
      // Validate file type
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload JPEG, PNG, GIF, or WebP images.');
      }

      // Validate file size (max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Maximum size is 5MB.');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileName = `cover_${timestamp}_${randomString}.${fileExt}`;
      const filePath = `covers/${fileName}`;

      console.log('Uploading file:', { fileName, filePath, type: file.type, size: file.size });

      // Upload to Supabase Storage
      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('blog-posts')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        console.error('Supabase upload error:', uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('blog-posts')
        .getPublicUrl(filePath);

      console.log('Upload successful, public URL:', publicUrl);

      setUploadProgress(100);
      setUploadSuccess(true);

      toast({
        title: 'Success',
        description: 'Image uploaded successfully',
      });

      return publicUrl;

    } catch (error) {
      console.error('Error in handleImageUpload:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to upload image';
      setUploadError(errorMessage);

      toast({
        title: 'Upload Failed',
        description: errorMessage,
        variant: 'destructive'
      });

      throw error;
    } finally {
      setUploading(false);
      // Reset progress after a delay
      setTimeout(() => {
        setUploadProgress(0);
        setUploadSuccess(false);
        setUploadError(null);
      }, 3000);
    }
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const publicUrl = await handleImageUpload(file);
      setFormData(prev => ({ ...prev, cover_image: publicUrl }));
    } catch (error) {
      // Error already handled in handleImageUpload
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (uploading) {
      toast({
        title: 'Please wait',
        description: 'Image is still uploading',
        variant: 'destructive'
      });
      return;
    }

    try {
      const slug = generateSlug(formData.title);
      const blogData = {
        ...formData,
        slug,
        published_at: formData.published ? new Date().toISOString() : null,
      };

      if (editingBlog) {
        // Update existing blog
        const { error } = await supabase
          .from('blog_posts')
          .update(blogData)
          .eq('id', editingBlog.id);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog updated successfully'
        });
      } else {
        // Create new blog
        const { error } = await supabase
          .from('blog_posts')
          .insert([blogData]);

        if (error) throw error;

        toast({
          title: 'Success',
          description: 'Blog created successfully'
        });
      }

      resetForm();
      setIsDialogOpen(false);
      fetchBlogs();
    } catch (error) {
      console.error('Error saving blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to save blog',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (blog: Blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title || '',
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      cover_image: blog.cover_image || '',
      author: blog.author || '',
      category: blog.category || '',
      read_time: blog.read_time || '',
      featured: blog.featured || false,
      published: blog.published || false,
      tags: blog.tags || [],
      tagInput: ''
    });
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (id: number) => {
    setBlogToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!blogToDelete) return;

    try {
      const { error } = await supabase
        .from('blog_posts')
        .delete()
        .eq('id', blogToDelete);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Blog deleted successfully'
      });

      fetchBlogs();
    } catch (error) {
      console.error('Error deleting blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive'
      });
    } finally {
      setIsDeleteDialogOpen(false);
      setBlogToDelete(null);
    }
  };

  const togglePublished = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({
          published: !blog.published,
          published_at: !blog.published ? new Date().toISOString() : null
        })
        .eq('id', blog.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Blog ${!blog.published ? 'published' : 'unpublished'} successfully`
      });

      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog',
        variant: 'destructive'
      });
    }
  };

  const toggleFeatured = async (blog: Blog) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update({ featured: !blog.featured })
        .eq('id', blog.id);

      if (error) throw error;

      toast({
        title: 'Success',
        description: `Blog ${!blog.featured ? 'featured' : 'unfeatured'} successfully`
      });

      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog',
        variant: 'destructive'
      });
    }
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && formData.tagInput.trim()) {
      e.preventDefault();
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const resetForm = () => {
    setFormData({
      title: '',
      excerpt: '',
      content: '',
      cover_image: '',
      author: '',
      category: '',
      read_time: '',
      featured: false,
      published: true,
      tags: [],
      tagInput: ''
    });
    setEditingBlog(null);
    setUploading(false);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    resetForm();
  };

  const handleQuickUpdate = async (blogId: number, updates: Partial<Blog>) => {
    try {
      const { error } = await supabase
        .from('blog_posts')
        .update(updates)
        .eq('id', blogId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Blog updated successfully'
      });

      fetchBlogs();
    } catch (error) {
      console.error('Error updating blog:', error);
      toast({
        title: 'Error',
        description: 'Failed to update blog',
        variant: 'destructive'
      });
    }
  };

  const handleResetAllViews = async () => {
    if (!window.confirm('Are you sure you want to reset views for ALL blog posts? This cannot be undone.')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('blog_posts')
        .update({ views: 0 })
        .gt('id', 0); // Update all where ID > 0

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'All blog views have been reset'
      });

      fetchBlogs();
    } catch (error) {
      console.error('Error resetting all views:', error);
      toast({
        title: 'Error',
        description: 'Failed to reset all views',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin h-8 w-8 text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">Manage your existing blog posts ({blogs.length} total)</p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={handleResetAllViews} disabled={blogs.length === 0}>
            <Trash2 className="mr-2 h-4 w-4" />
            Reset All Views
          </Button>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Blog Post
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingBlog ? 'Edit Blog Post' : 'Create New Blog Post'}</DialogTitle>
                <DialogDescription>
                  {editingBlog ? 'Update your existing blog post' : 'Create a new blog post'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="author">Author *</Label>
                    <Input
                      id="author"
                      value={formData.author}
                      onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => setFormData({ ...formData, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((cat) => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="read_time">Read Time *</Label>
                    <Input
                      id="read_time"
                      value={formData.read_time}
                      onChange={(e) => setFormData({ ...formData, read_time: e.target.value })}
                      placeholder="e.g., 12 min read"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="excerpt">Excerpt *</Label>
                  <Textarea
                    id="excerpt"
                    value={formData.excerpt}
                    onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                    placeholder="Brief description of the blog post"
                    rows={3}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cover_image">Cover Image *</Label>
                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <Input
                        id="cover_image"
                        type="url"
                        value={formData.cover_image}
                        onChange={(e) => setFormData({ ...formData, cover_image: e.target.value })}
                        placeholder="Image URL"
                        required
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        className="hidden"
                        onChange={handleFileSelect}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                      >
                        {uploading ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4 mr-2" />
                        )}
                        {uploading ? 'Uploading...' : 'Upload'}
                      </Button>
                    </div>

                    {uploading && (
                      <div className="space-y-2">
                        <Progress value={uploadProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Uploading... {uploadProgress}%
                        </p>
                      </div>
                    )}

                    {uploadError && (
                      <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-2 rounded">
                        <AlertCircle className="h-4 w-4" />
                        <span>{uploadError}</span>
                      </div>
                    )}

                    {uploadSuccess && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 p-2 rounded">
                        <CheckCircle className="h-4 w-4" />
                        <span>Image uploaded successfully!</span>
                      </div>
                    )}

                    {formData.cover_image && (
                      <div className="mt-2 border rounded-lg overflow-hidden">
                        <img
                          src={formData.cover_image}
                          alt="Cover preview"
                          className="w-full h-48 object-cover"
                          onError={(e) => {
                            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2YzZjRmNSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwiIGZvbnQtc2l6ZT0iMTQiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIiBmaWxsPSIjOTk5Ij5Db3ZlciBJbWFnZTwvdGV4dD48L3N2Zz4=';
                          }}
                        />
                      </div>
                    )}

                    <div className="text-xs text-muted-foreground">
                      <p>• Supported formats: JPEG, PNG, GIF, WebP</p>
                      <p>• Maximum file size: 5MB</p>
                      <p>• Recommended dimensions: 1200×630 pixels</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">Content *</Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    required
                    className="min-h-[200px] font-mono text-sm"
                    placeholder="Write your blog content here..."
                    rows={10}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                  <Input
                    id="tags"
                    value={formData.tagInput}
                    onChange={(e) => setFormData({ ...formData, tagInput: e.target.value })}
                    onKeyDown={handleTagInput}
                    placeholder="Type a tag and press Enter"
                  />
                </div>

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="featured"
                        checked={formData.featured}
                        onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
                      />
                      <Label htmlFor="featured">Featured</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Switch
                        id="published"
                        checked={formData.published}
                        onCheckedChange={(checked) => setFormData({ ...formData, published: checked })}
                      />
                      <Label htmlFor="published">Published</Label>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={uploading}>
                      {uploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {editingBlog ? 'Update' : 'Create'} Blog
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{blogs.length}</div>
            <p className="text-sm text-muted-foreground">Total Posts</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{blogs.filter(b => b.published).length}</div>
            <p className="text-sm text-muted-foreground">Published</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{blogs.filter(b => b.featured).length}</div>
            <p className="text-sm text-muted-foreground">Featured</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">
              {blogs.reduce((sum, blog) => sum + (blog.views || 0), 0).toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground">Total Views</p>
          </CardContent>
        </Card>
      </div>

      {/* Blog List */}
      <div className="space-y-4">
        {blogs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center h-32">
              <p className="text-muted-foreground mb-4">No blogs found in database</p>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Create First Blog
              </Button>
            </CardContent>
          </Card>
        ) : (
          blogs.map((blog) => (
            <Card key={blog.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant={blog.published ? "default" : "secondary"}>
                        {blog.published ? 'Published' : 'Draft'}
                      </Badge>
                      {blog.featured && (
                        <Badge variant="outline" className="bg-primary/10">
                          Featured
                        </Badge>
                      )}
                      <Badge variant="secondary">{blog.category || 'Uncategorized'}</Badge>
                      <span className="text-sm text-muted-foreground">
                        {blog.views?.toLocaleString()} views
                      </span>
                      <Link to={`/blog/${blog.slug || blog.id}`} target="_blank" className="text-sm text-primary hover:underline flex items-center gap-1">
                        <ExternalLink className="h-3 w-3" />
                        View
                      </Link>
                    </div>

                    <CardTitle className="text-lg">{blog.title}</CardTitle>

                    <CardDescription className="line-clamp-2">
                      {blog.excerpt}
                    </CardDescription>

                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <span>By {blog.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>{blog.read_time || '5 min read'}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span>•</span>
                        <span>Published: {blog.published_at ? new Date(blog.published_at).toLocaleDateString() : 'Not published'}</span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-1">
                      {blog.tags?.slice(0, 3).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => togglePublished(blog)}
                      >
                        {blog.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleFeatured(blog)}
                      >
                        <Badge className={`h-4 w-4 ${blog.featured ? 'bg-primary' : 'bg-transparent'}`} />
                      </Button>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(blog)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteClick(blog.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="relative h-16 w-24 rounded overflow-hidden bg-muted">
                        <img
                          src={blog.cover_image}
                          alt="Cover"
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.parentElement!.innerHTML = `
                              <div class="h-full w-full flex items-center justify-center bg-muted">
                                <span class="text-xs text-muted-foreground">No Image</span>
                              </div>
                            `;
                          }}
                        />
                      </div>
                      <div className="text-sm">
                        <p className="font-medium">Cover Image</p>
                        <p className="text-muted-foreground text-xs truncate max-w-[200px]">
                          {blog.cover_image || 'No cover image'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleQuickUpdate(blog.id, { views: 0 })}
                    >
                      Reset Views
                    </Button>
                    <span className="text-xs text-muted-foreground">
                      ID: {blog.id}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the blog post from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default BlogManagement;